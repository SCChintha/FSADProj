import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../apiClient';
import ProfilePhotoUpload from '../../components/profile/ProfilePhotoUpload';
import ChangePasswordSection from '../../components/profile/ChangePasswordSection';
import EditSaveButtons from '../../components/profile/EditSaveButtons';

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/profile/me');
      setProfile(data);
      setFormData(data);
    } catch (err) {
      toast.error('Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditToggle = () => {
    if (isEditing) setFormData(profile);
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put('/api/profile/me', formData);
      setProfile(data);
      setFormData(data);
      setIsEditing(false);
      toast.success('Admin profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-wrap text-center">Loading profile...</div>;

  return (
    <div className="container dashboard-page mt-16">
      <div className="dashboard-grid min-h-screen">
        
        {/* LEFT COLUMN */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
             <ProfilePhotoUpload 
              currentPhotoUrl={profile?.profilePhotoUrl} 
              onUploadSuccess={(url) => setProfile({...profile, profilePhotoUrl: url})}
            />
            <h2 style={{ marginTop: '16px', marginBottom: '4px' }}>{profile.firstName} {profile.lastName}</h2>
            <div className="status-badge mt-8" style={{background: '#dbeafe', color: '#1d4ed8'}}>Administrator</div>
            <div className="muted-text text-sm mt-8">{profile.employeeId}</div>
            
            <div className="stack-list mt-16" style={{ width: '100%', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
              <div className="scheduler-row">
                <span className="muted-text text-sm">Department</span>
                <span className="font-bold">{profile.department || '-'}</span>
              </div>
              <div className="scheduler-row">
                <span className="muted-text text-sm">Designation</span>
                <span className="font-bold">{profile.designation || '-'}</span>
              </div>
              <div className="scheduler-row mt-8">
                <span className="muted-text text-sm">Access Level</span>
                <span className="status-badge" style={{background: '#bfdbfe', color: '#1e40af', fontWeight: 'bold'}}>{profile.accessLevel || 'Level 1'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="card">
          <div className="tab-row" style={{ marginBottom: '24px' }}>
            {['details', 'security', 'overview'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-chip ${activeTab === tab ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {tab === 'overview' ? 'Platform Overview' : tab}
              </button>
            ))}
          </div>

          <div className="section-header">
            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Information</h3>
            {activeTab === 'details' && (
              <EditSaveButtons 
                isEditing={isEditing} 
                onEdit={handleEditToggle} 
                onSave={handleSave} 
                onCancel={handleCancel}
                isLoading={saving}
              />
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            {activeTab === 'details' && (
              <div className="stack-list pt-4">
                <div className="form-grid">
                  <div>
                    <label id="field-first-name">First Name</label>
                    {isEditing ? <input name="firstName" value={formData.firstName || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.firstName || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-last-name">Last Name</label>
                    {isEditing ? <input name="lastName" value={formData.lastName || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.lastName || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-phone">Phone</label>
                    {isEditing ? <input name="phone" value={formData.phone || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.phone || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-email">Internal Email</label>
                    <div className="input" style={{background: '#f3f4f6', color: '#6b7280'}}>{profile.email}</div>
                  </div>
                  <div>
                    <label id="field-department">Department</label>
                    {isEditing ? (
                      <select name="department" value={formData.department || ''} onChange={handleChange} className="input">
                        <option value="">Select...</option>
                        <option value="IT">IT</option>
                        <option value="Operations">Operations</option>
                        <option value="Medical Affairs">Medical Affairs</option>
                        <option value="Support">Support</option>
                      </select>
                    ) : <div className="input" style={{background: '#f9f9f9'}}>{profile.department || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-designation">Designation</label>
                    {isEditing ? <input name="designation" value={formData.designation || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.designation || '-'}</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="stack-list pt-4">
                <div className="panel" style={{ background: '#f9f9f9', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 className="font-bold">Two-Factor Authentication (2FA)</h4>
                    <div className="status-badge" style={{
                      background: profile.twoFactorEnabled ? '#d1fae5' : '#e5e7eb',
                      color: profile.twoFactorEnabled ? '#065f46' : '#374151',
                      fontWeight: 'bold'
                    }}>
                      {profile.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                    </div>
                  </div>
                  <p className="text-sm muted-text mb-16">Protect your admin account with an extra layer of security.</p>
                  <button className="btn" style={{background: '#111827', color: 'white'}}>
                    {profile.twoFactorEnabled ? 'Manage 2FA' : 'Setup 2FA'}
                  </button>
                </div>
                
                <hr style={{margin: '24px 0', borderTop: '1px solid #e5e7eb', borderBottom: 'none'}} />
                <ChangePasswordSection />
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid pt-4 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="panel" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
                  <div className="muted-text text-sm">Total Active Users</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8', marginTop: '4px' }}>{profile.totalUsersManaged || '1,248'}</div>
                </div>
                <div className="panel" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px' }}>
                  <div className="muted-text text-sm">Docs Pending Approval</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2410c', marginTop: '4px' }}>{profile.totalDoctorsPendingApproval || '14'}</div>
                </div>
                <div className="panel" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                  <div className="muted-text text-sm">System Status</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span> 
                    Operational
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
