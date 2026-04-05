import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../apiClient';

export default function ChangePassword() {
  const [data, setData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const calculateStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^A-Za-z0-9]/)) strength++;
    return strength; // 0 to 4
  };

  const strength = calculateStrength(data.newPassword);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await api.put('/api/profile/change-password', data);
      toast.success('Password changed successfully');
      setData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-bold mb-4">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showPwd.current ? "text" : "password"}
              name="currentPassword"
              value={data.currentPassword}
              onChange={handleChange}
              required
              className="w-full pl-3 pr-10 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
            <button type="button" onClick={() => setShowPwd({...showPwd, current: !showPwd.current})} className="absolute right-3 top-2.5 text-gray-400">
              {showPwd.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPwd.new ? "text" : "password"}
              name="newPassword"
              value={data.newPassword}
              onChange={handleChange}
              required
              className="w-full pl-3 pr-10 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
            <button type="button" onClick={() => setShowPwd({...showPwd, new: !showPwd.new})} className="absolute right-3 top-2.5 text-gray-400">
              {showPwd.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {data.newPassword && (
            <div className="mt-2 flex h-1.5 gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-full ${i < strength ? (strength > 2 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-gray-200'}`} />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPwd.confirm ? "text" : "password"}
              name="confirmNewPassword"
              value={data.confirmNewPassword}
              onChange={handleChange}
              required
              className="w-full pl-3 pr-10 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
            <button type="button" onClick={() => setShowPwd({...showPwd, confirm: !showPwd.confirm})} className="absolute right-3 top-2.5 text-gray-400">
              {showPwd.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
