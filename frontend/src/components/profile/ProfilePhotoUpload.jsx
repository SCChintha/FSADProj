import { useState } from 'react';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../apiClient';

export default function ProfilePhotoUpload({ currentPhotoUrl, onUploadSuccess, className = '' }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size & type
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const { data } = await api.post('/profile/photo', formData, {
        headers: {}
      });
      onUploadSuccess(data.profilePhotoUrl);
      toast.success('Profile photo updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative group w-[100px] h-[100px] ${className}`}>
      {currentPhotoUrl ? (
        <img
          src={currentPhotoUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-full border-4 border-white shadow-sm bg-gray-100"
        />
      ) : (
        <div className="w-full h-full bg-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-sm">
          ?
        </div>
      )}

      {/* Hover Overlay */}
      <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Camera size={24} />
            <span className="text-[10px] uppercase font-bold mt-1">Change</span>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg, image/png"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
