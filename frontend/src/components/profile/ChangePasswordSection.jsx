import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import './ProfileComponents.css';

export default function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength; // 0 to 4
  };

  const strength = calculateStrength(newPassword);
  
  const getStrengthBar = () => {
    if (strength === 0) return { width: '0%', backgroundColor: 'transparent' };
    if (strength === 1) return { width: '25%', backgroundColor: '#ef4444' }; // Weak red
    if (strength === 2) return { width: '50%', backgroundColor: '#f97316' }; // Fair orange
    if (strength === 3) return { width: '75%', backgroundColor: '#eab308' }; // Good yellow
    return { width: '100%', backgroundColor: '#22c55e' }; // Strong green
  };

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const passMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passMismatch = confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (strength < 2) {
      toast.error('Password must be at least Fair strength');
      return;
    }
    
    try {
      setSaving(true);
      await apiClient.put('/profile/me/password', {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="change-password-section profile-card">
      <h3 className="section-title">Change Password</h3>
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group flex-col">
          <label>Current Password</label>
          <div className="input-with-icon">
            <input 
              type={showCurrent ? "text" : "password"} 
              className="input full-width" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button type="button" className="pwd-toggle-btn" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="form-group flex-col">
          <label>New Password</label>
          <div className="input-with-icon">
            <input 
              type={showNew ? "text" : "password"} 
              className="input full-width" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button type="button" className="pwd-toggle-btn" onClick={() => setShowNew(!showNew)}>
              {showNew ? 'Hide' : 'Show'}
            </button>
          </div>
          {newPassword && (
            <div className="strength-meter-container">
              <div className="strength-bar-bg">
                <div className="strength-bar-fill" style={getStrengthBar()}></div>
              </div>
              <span className="strength-label" style={{ color: getStrengthBar().backgroundColor }}>
                {getStrengthLabel()}
              </span>
            </div>
          )}
        </div>

        <div className="form-group flex-col">
          <label>Confirm New Password</label>
          <div className="input-with-icon">
            <input 
              type={showConfirm ? "text" : "password"} 
              className="input full-width" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="button" className="pwd-toggle-btn" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? 'Hide' : 'Show'}
            </button>
            {passMatch && <span className="match-icon text-green">✓</span>}
            {passMismatch && <span className="match-icon text-red">✕</span>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-16" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
}
