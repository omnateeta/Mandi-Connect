import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'voice', 'location', 'order_update'],
    default: 'text'
  },
  content: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    },
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  mediaUrl: {
    type: String
  },
  metadata: {
    duration: Number, // for voice messages
    latitude: Number,
    longitude: Number,
    fileName: String,
    fileSize: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ orderId: 1 });
messageSchema.index({ createdAt: -1 });

// Compound index for conversation queries
messageSchema.index({ 
  $or: [
    { senderId: 1, receiverId: 1 },
    { senderId: 1, receiverId: 1 }
  ]
});

// Virtual for sender details
messageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

// Mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
};

// Mark as delivered
messageSchema.methods.markAsDelivered = function() {
  if (!this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }
};

// Static method to get conversation
messageSchema.statics.getConversation = async function(userId1, userId2, options = {}) {
  const { limit = 50, before } = options;
  
  const query = {
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ],
    isDeleted: false
  };
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name avatar')
    .lean();
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ 
    receiverId: userId, 
    isRead: false,
    isDeleted: false 
  });
};

// Static method to get recent conversations
messageSchema.statics.getRecentConversations = async function(userId) {
  return await this.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(userId) },
          { receiverId: new mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
            '$receiverId',
            '$senderId'
          ]
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        user: {
          _id: 1,
          name: 1,
          avatar: 1,
          role: 1
        },
        lastMessage: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};

export const Message = mongoose.model('Message', messageSchema);

