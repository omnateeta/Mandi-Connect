import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail, Star, Award, Edit2, Camera, Loader2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/farmers/profile');
      setProfile(response.data.data.farmer);
      setEditedProfile(response.data.data.farmer);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put('/farmers/profile', {
        farmName: editedProfile.farmName,
        address: editedProfile.address,
        district: editedProfile.district,
        state: editedProfile.state,
        pincode: editedProfile.pincode,
        landSize: editedProfile.landSize,
        landUnit: editedProfile.landUnit,
        farmingType: editedProfile.farmingType,
        primaryCrops: editedProfile.primaryCrops,
      });
      setProfile(response.data.data.farmer);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/farmers/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, profileImage: response.data.data.imageUrl }));
      toast.success('Profile image updated!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your farm profile and settings</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-leaf-400 to-leaf-600"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-4">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden cursor-pointer"
                onClick={handleImageClick}
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-leaf-500 animate-spin" />
                ) : profile?.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button 
                onClick={handleImageClick}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-leaf-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-leaf-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="farmName"
                  value={editedProfile.farmName || ''}
                  onChange={handleChange}
                  className="input text-xl font-bold mb-1"
                  placeholder="Farm Name"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-800">{profile?.farmName}</h2>
              )}
              <p className="text-gray-500">{profile?.userId?.name}</p>
            </div>

            {/* Edit/Save Buttons */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCancel}
                  className="btn-ghost text-sm py-2 px-4"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="btn-primary text-sm py-2 px-4"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            ) : (
              <button 
                onClick={handleEdit}
                className="btn-outline text-sm py-2 px-4"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-leaf-600 mb-1">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-xl font-bold">{profile?.rating?.average || 0}</span>
              </div>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{profile?.trustScore || 0}</p>
              <p className="text-sm text-gray-500">Trust Score</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{profile?.trustMetrics?.totalOrders || 0}</p>
              <p className="text-sm text-gray-500">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{profile?.landSize} {profile?.landUnit}</p>
              <p className="text-sm text-gray-500">Land</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Contact Information</h3>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{profile?.userId?.phone}</span>
              </div>
              
              {profile?.userId?.email && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{profile?.userId?.email}</span>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="address"
                    value={editedProfile.address || ''}
                    onChange={handleChange}
                    className="input text-sm"
                    placeholder="Address"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      name="district"
                      value={editedProfile.district || ''}
                      onChange={handleChange}
                      className="input text-sm"
                      placeholder="District"
                    />
                    <input
                      type="text"
                      name="state"
                      value={editedProfile.state || ''}
                      onChange={handleChange}
                      className="input text-sm"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      name="pincode"
                      value={editedProfile.pincode || ''}
                      onChange={handleChange}
                      className="input text-sm"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{profile?.address}, {profile?.district}, {profile?.state} - {profile?.pincode}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Farm Details</h3>
              
              {isEditing ? (
                <div className="space-y-2">
                  <select
                    name="farmingType"
                    value={editedProfile.farmingType || 'conventional'}
                    onChange={handleChange}
                    className="input text-sm"
                  >
                    <option value="conventional">Conventional</option>
                    <option value="organic">Organic</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="landSize"
                      value={editedProfile.landSize || ''}
                      onChange={handleChange}
                      className="input text-sm flex-1"
                      placeholder="Land Size"
                    />
                    <select
                      name="landUnit"
                      value={editedProfile.landUnit || 'acres'}
                      onChange={handleChange}
                      className="input text-sm w-24"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                      <option value="bigha">Bigha</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-gray-400 w-20">Farming:</span>
                    <span className="capitalize">{profile?.farmingType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-gray-400 w-20">Land:</span>
                    <span>{profile?.landSize} {profile?.landUnit}</span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-gray-400 w-20">KYC Status:</span>
                <span className={`badge ${
                  profile?.kycStatus === 'verified' ? 'badge-success' :
                  profile?.kycStatus === 'pending' ? 'badge-warning' :
                  'badge-info'
                }`}>
                  {profile?.kycStatus}
                </span>
              </div>

              {profile?.badges?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.badges.map((badge) => (
                    <span key={badge} className="badge badge-success flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Primary Crops */}
          {profile?.primaryCrops?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Primary Crops</h3>
              <div className="flex flex-wrap gap-2">
                {profile.primaryCrops.map((crop) => (
                  <span key={crop} className="px-3 py-1 bg-leaf-100 text-leaf-700 rounded-full text-sm">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
