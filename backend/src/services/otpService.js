import twilio from 'twilio';
import axios from 'axios';
import { logger } from '../utils/logger.js';

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// Lazy-load Twilio client
let client = null;
const getTwilioClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

// Fast2SMS integration for free Indian SMS
const sendFast2SMS = async (phone, otp) => {
  try {
    // Remove + and keep only digits
    const formattedPhone = phone.replace('+', '').replace(/\D/g, '');
    
    console.log('📲 Fast2SMS sending to:', formattedPhone);
    
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'q',  // Quick route - works with free credits
        message: `Your Mandi-Connect verification code is: ${otp}. Valid for 10 minutes.`,
        language: 'english',
        flash: 0,
        numbers: formattedPhone,
      },
      {
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Fast2SMS response:', response.data);
    logger.info(`Fast2SMS response: ${JSON.stringify(response.data)}`);
    return { success: true, sid: response.data.message_id };
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error('❌ Fast2SMS error:', errorData);
    logger.error(`Fast2SMS error: ${JSON.stringify(errorData)}`);
    throw error;
  }
};

export const generateOTP = () => {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phone, otp) => {
  console.log('📱 Sending OTP to:', phone);
  
  // Format phone number - remove any non-digit characters except +
  const formattedPhone = phone.replace(/\D/g, ''); // Remove all non-digits
  const finalPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91${formattedPhone}`;
  
  console.log('📞 Formatted phone:', finalPhone);
  
  // Try Fast2SMS first (free for Indian numbers)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      console.log('📨 Attempting Fast2SMS...');
      const result = await sendFast2SMS(finalPhone, otp);
      logger.info(`✅ OTP sent via Fast2SMS to ${finalPhone}`);
      console.log('✅ Fast2SMS success:', result);
      return result;
    } catch (fast2smsError) {
      console.error('❌ Fast2SMS failed:', fast2smsError.message);
      logger.warn(`Fast2SMS failed: ${fast2smsError.message}`);
    }
  }

  // Try Twilio if configured
  if (getTwilioClient() && process.env.TWILIO_PHONE_NUMBER) {
    try {
      console.log('📨 Attempting Twilio...');
      const message = await getTwilioClient().messages.create({
        body: `Your Mandi-Connect verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: finalPhone
      });

      logger.info(`✅ OTP sent via Twilio to ${finalPhone}, SID: ${message.sid}`);
      console.log('✅ Twilio success:', message.sid);
      return { success: true, sid: message.sid };
    } catch (twilioError) {
      console.error('❌ Twilio failed:', twilioError.message);
      logger.warn(`Twilio failed: ${twilioError.message}`);
    }
  }

  // Fallback: log to console for development
  console.log('⚠️ Using DEV MODE fallback - OTP printed to console');
  logger.info(`[DEV MODE] OTP for ${finalPhone}: ${otp}`);
  
  // Return success with OTP visible in response for testing
  return { 
    success: true, 
    sid: 'dev-mode', 
    otp,
    message: 'In development mode - check backend console for OTP'
  };
};

export const storeOTP = (phone, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(phone, { otp, expiresAt, attempts: 0 });
  
  // Auto-cleanup after expiry
  setTimeout(() => {
    otpStore.delete(phone);
  }, 10 * 60 * 1000);
};

export const verifyOTP = (phone, otp) => {
  const record = otpStore.get(phone);
  
  if (!record) {
    return { valid: false, message: 'OTP expired or not found' };
  }
  
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (record.attempts >= 3) {
    otpStore.delete(phone);
    return { valid: false, message: 'Too many attempts. Please request new OTP.' };
  }
  
  record.attempts++;
  
  if (record.otp !== otp) {
    return { valid: false, message: 'Invalid OTP', attemptsLeft: 3 - record.attempts };
  }
  
  // Valid OTP - clean up
  otpStore.delete(phone);
  return { valid: true };
};

export const resendOTP = async (phone) => {
  // Delete old OTP
  otpStore.delete(phone);
  
  // Generate and send new OTP
  const otp = generateOTP();
  storeOTP(phone, otp);
  
  return await sendOTP(phone, otp);
};

// Cleanup expired OTPs periodically (every 15 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 15 * 60 * 1000);
