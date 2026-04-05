import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../apiClient';
import ProfilePhotoUpload from '../../components/profile/ProfilePhotoUpload';
import ProfileCompletionBanner from '../../components/profile/ProfileCompletionBanner';
import ChangePasswordSection from '../../components/profile/ChangePasswordSection';
import EditSaveButtons from '../../components/profile/EditSaveButtons';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
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
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(profile); // cancel
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put('/api/profile/me', formData);
      setProfile(data);
      setFormData(data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-wrap text-center">Loading profile...</div>;

  return (
    <div className="container dashboard-page">
      <ProfileCompletionBanner 
        percent={profile.profileCompletionPercent} 
        missingFields={profile.missingFields} 
      />
      
      <div className="dashboard-grid min-h-screen">
        {/* LEFT COLUMN - Summary Card */}
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
            <ProfilePhotoUpload 
              currentPhotoUrl={profile?.profilePhotoUrl} 
              onUploadSuccess={(url) => setProfile({...profile, profilePhotoUrl: url})}
            />
            <h2 style={{ marginTop: '16px', marginBottom: '4px' }}>{profile.firstName} {profile.lastName}</h2>
            <div className="muted-text text-sm">PAT-{profile.userId}</div>
          </div>
          
          <div className="stack-list">
            <div className="scheduler-row">
              <span className="muted-text text-sm">Email</span>
              <span>{profile.email}</span>
            </div>
            <div className="scheduler-row">
              <span className="muted-text text-sm">Phone</span>
              <span>{profile.phone || '-'}</span>
            </div>
            <div className="scheduler-row">
              <span className="muted-text text-sm">Age / Blood</span>
              <span>{profile.age || '-'} / {profile.bloodGroup || '-'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Tabs */}
        <div className="card">
          {/* Tabs Header */}
          <div className="tab-row" style={{ marginBottom: '24px' }}>
            {['personal', 'medical', 'emergency', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-chip ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="section-header">
            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Information</h3>
            {activeTab !== 'settings' && (
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
            {activeTab === 'personal' && (
              <div className="form-grid pt-4">
                <div>
                  <label id="field-first-name">First Name</label>
                  {isEditing ? <input name="firstName" value={formData.firstName || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.firstName || '-'}</div>}
                </div>
                <div>
                  <label id="field-last-name">Last Name</label>
                  {isEditing ? <input name="lastName" value={formData.lastName || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.lastName || '-'}</div>}
                </div>
                <div>
                  <label id="field-date-of-birth">Date of Birth</label>
                  {isEditing ? <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.dateOfBirth || '-'}</div>}
                </div>
                <div>
                  <label id="field-gender">Gender</label>
                  {isEditing ? (
                    <select name="gender" value={formData.gender || ''} onChange={handleChange} className="input">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : <div className="input" style={{background: '#f9f9f9'}}>{profile.gender || '-'}</div>}
                </div>
                <div>
                  <label id="field-blood-group">Blood Group</label>
                  {isEditing ? <input name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.bloodGroup || '-'}</div>}
                </div>
                <div>
                  <label id="field-height-cm">Height (cm)</label>
                  {isEditing ? <input type="number" name="heightCm" value={formData.heightCm || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.heightCm || '-'}</div>}
                </div>
                <div>
                  <label id="field-weight-kg">Weight (kg)</label>
                  {isEditing ? <input type="number" name="weightKg" value={formData.weightKg || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.weightKg || '-'}</div>}
                </div>
              </div>
            )}

            {activeTab === 'medical' && (
              <div className="stack-list pt-4">
                <div>
                  <label className="font-bold" id="field-allergies">Allergies</label>
                  {isEditing ? (
                    <input name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="Comma-separated values" className="input" />
                  ) : (
                    <div className="chip-row mt-8">
                      {profile.allergiesList?.length ? profile.allergiesList.map((a, i) => <span key={i} className="status-badge danger">{a}</span>) : <span className="muted-text">No allergies recorded</span>}
                    </div>
                  )}
                </div>
                <div style={{marginTop: '16px'}}>
                  <label className="font-bold" id="field-chronic-conditions">Chronic Conditions</label>
                  {isEditing ? (
                    <input name="chronicConditions" value={formData.chronicConditions || ''} onChange={handleChange} placeholder="Comma-separated values" className="input" />
                  ) : (
                    <div className="chip-row mt-8">
                      {profile.chronicConditionsList?.length ? profile.chronicConditionsList.map((c, i) => <span key={i} className="status-badge warning">{c}</span>) : <span className="muted-text">Not recorded</span>}
                    </div>
                  )}
                </div>
                <div style={{marginTop: '16px'}}>
                  <label className="font-bold" id="field-current-medications">Current Medications</label>
                  {isEditing ? (
                    <input name="currentMedications" value={formData.currentMedications || ''} onChange={handleChange} placeholder="Comma-separated values" className="input" />
                  ) : (
                    <div className="chip-row mt-8">
                      {profile.currentMedicationsList?.length ? profile.currentMedicationsList.map((m, i) => <span key={i} className="status-badge info">{m}</span>) : <span className="muted-text">Not recorded</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="stack-list pt-4">
                <h3 className="border-b pb-2 mb-4">Address</h3>
                <div className="form-grid">
                  <div className="full-span">
                    <label id="field-address-line-1">Address Line 1</label>
                    {isEditing ? <input name="addressLine1" value={formData.addressLine1 || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.addressLine1 || '-'}</div>}
                  </div>
                  <div className="full-span">
                    <label id="field-address-line-2">Address Line 2</label>
                    {isEditing ? <input name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.addressLine2 || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-city">City</label>
                    {isEditing ? <input name="city" value={formData.city || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.city || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-state">State</label>
                    {isEditing ? <input name="state" value={formData.state || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.state || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-pincode">Pincode</label>
                    {isEditing ? <input name="pincode" value={formData.pincode || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.pincode || '-'}</div>}
                  </div>
                </div>

                <h3 className="border-b pb-2 mb-4 mt-16">Emergency Contact</h3>
                <div className="form-grid">
                  <div>
                    <label id="field-emergency-contact-name">Name</label>
                    {isEditing ? <input name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.emergencyContactName || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-emergency-contact-phone">Phone</label>
                    {isEditing ? <input name="emergencyContactPhone" value={formData.emergencyContactPhone || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.emergencyContactPhone || '-'}</div>}
                  </div>
                  <div>
                    <label id="field-emergency-contact-relation">Relation</label>
                    {isEditing ? <input name="emergencyContactRelation" value={formData.emergencyContactRelation || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.emergencyContactRelation || '-'}</div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="stack-list pt-4">
                <div className="form-grid">
                  <div>
                    <label className="muted-text text-sm">Account Email (Read Only)</label>
                    <input disabled value={profile.email} className="input" style={{background: '#f3f4f6'}} />
                  </div>
                  <div>
                    <label id="field-phone" className="muted-text text-sm">Phone Number</label>
                    {isEditing ? <input name="phone" value={formData.phone || ''} onChange={handleChange} className="input" /> : <div className="input" style={{background: '#f9f9f9'}}>{profile.phone || '-'}</div>}
                  </div>
                  {isEditing && (
                    <div style={{marginTop: '28px'}}>
                       <button onClick={handleSave} className="btn filled-teal">Save Phone Update</button>
                    </div>
                  )}
                </div>
                
                <hr style={{margin: '24px 0', borderTop: '1px solid #e5e7eb', borderBottom: 'none'}} />
                <ChangePasswordSection />

                <hr style={{margin: '24px 0', borderTop: '1px solid #e5e7eb', borderBottom: 'none'}} />
                <div className="warning-banner" style={{background: 'transparent', border: '1px solid #fecaca'}}>
                  <button className="btn danger-btn text-white">Request Account Deletion</button>
                  <p className="text-sm mt-8 opacity-80">This will send a request to the administrator. This action is permanent.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
