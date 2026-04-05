import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../apiClient';
import ProfilePhotoUpload from '../../components/profile/ProfilePhotoUpload';
import ProfileCompletionBanner from '../../components/profile/ProfileCompletionBanner';
import ChangePasswordSection from '../../components/profile/ChangePasswordSection';

const tabs = ['personal', 'documents', 'schedule', 'settings'];
const workingDayOptions = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function PharmacistProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const workingDays = useMemo(() => formData.workingDaysList || [], [formData.workingDaysList]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/profile/me');
      setProfile(data);
      setFormData({
        ...data,
        workingDaysList: data.workingDaysList || [],
        licenseDocumentViewType: data.licenseDocumentViewType || 'UPLOAD',
        licenseDocumentDriveLink: data.licenseDocumentDriveLink || '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === 'workingDaysList') {
      const next = checked ? [...workingDays, value] : workingDays.filter((day) => day !== value);
      setFormData((current) => ({ ...current, workingDaysList: next }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveProfile = async (payload, message) => {
    try {
      setSaving(true);
      const { data } = await api.put('/profile/me', payload);
      setProfile(data);
      setFormData({
        ...data,
        workingDaysList: data.workingDaysList || [],
        licenseDocumentViewType: data.licenseDocumentViewType || 'UPLOAD',
        licenseDocumentDriveLink: data.licenseDocumentDriveLink || '',
      });
      toast.success(message);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePersonalSave = () => saveProfile({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    qualification: formData.qualification,
    yearsOfExperience: Number(formData.yearsOfExperience || 0),
    pharmacyName: formData.pharmacyName,
    pharmacyAddressLine1: formData.pharmacyAddressLine1,
    pharmacyAddressLine2: formData.pharmacyAddressLine2,
    pharmacyCity: formData.pharmacyCity,
    pharmacyState: formData.pharmacyState,
    pharmacyPincode: formData.pharmacyPincode,
    pharmacyPhone: formData.pharmacyPhone,
  }, 'Profile updated');

  const handleScheduleSave = () => saveProfile({
    workingHoursStart: formData.workingHoursStart,
    workingHoursEnd: formData.workingHoursEnd,
    workingDays: workingDays.join(','),
  }, 'Schedule updated');

  const handleDocumentSave = () => saveProfile({
    licenseNumber: formData.licenseNumber,
    licenseExpiryDate: formData.licenseExpiryDate,
    licenseStatus: formData.licenseStatus,
    licenseDocumentViewType: formData.licenseDocumentViewType,
    licenseDocumentDriveLink: formData.licenseDocumentViewType === 'GOOGLE_DRIVE' ? formData.licenseDocumentDriveLink : '',
  }, 'Document information updated');

  const handleSettingsSave = () => saveProfile({ phone: formData.phone }, 'Phone number updated');

  const uploadLicense = async (file) => {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    body.append('documentKey', 'license');
    try {
      setUploading(true);
      await api.post('/profile/me/documents', body, { headers: {} });
      await fetchProfile();
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const deleteLicense = async () => {
    try {
      await api.delete('/profile/me/documents/license');
      await fetchProfile();
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  if (loading) return <div className="loading-wrap text-center">Loading profile...</div>;

  return (
    <div className="container dashboard-page">
      <ProfileCompletionBanner percent={profile.profileCompletionPercent} missingFields={profile.missingFields} />
      <div className="dashboard-grid min-h-screen">
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <ProfilePhotoUpload currentPhotoUrl={profile.profilePhotoUrl} onUploadSuccess={fetchProfile} />
            <h2>{profile.firstName} {profile.lastName}</h2>
            <div className="status-badge">{profile.pharmacyName || 'Pharmacist'}</div>
            <div className="stack-list" style={{ width: '100%' }}>
              <div className="scheduler-row"><span>Phone</span><strong>{profile.phone || '-'}</strong></div>
              <div className="scheduler-row"><span>Working Hours</span><strong>{profile.workingHoursStart || '--'} - {profile.workingHoursEnd || '--'}</strong></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="tab-row" style={{ marginBottom: 24 }}>
            {tabs.map((tab) => (
              <button key={tab} className={`tab-chip ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'personal' && (
            <div className="stack-list">
              <div className="form-grid">
                <div><label>First Name</label><input className="input" name="firstName" value={formData.firstName || ''} onChange={handleChange} /></div>
                <div><label>Last Name</label><input className="input" name="lastName" value={formData.lastName || ''} onChange={handleChange} /></div>
                <div><label>Phone</label><input className="input" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
                <div><label>Qualification</label><input className="input" name="qualification" value={formData.qualification || ''} onChange={handleChange} /></div>
                <div><label>Years of Experience</label><input className="input" type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ''} onChange={handleChange} /></div>
                <div className="full-span"><label>Pharmacy Name</label><input className="input" name="pharmacyName" value={formData.pharmacyName || ''} onChange={handleChange} /></div>
                <div className="full-span"><label>Address Line 1</label><input className="input" name="pharmacyAddressLine1" value={formData.pharmacyAddressLine1 || ''} onChange={handleChange} /></div>
                <div><label>City</label><input className="input" name="pharmacyCity" value={formData.pharmacyCity || ''} onChange={handleChange} /></div>
                <div><label>State</label><input className="input" name="pharmacyState" value={formData.pharmacyState || ''} onChange={handleChange} /></div>
                <div><label>Pincode</label><input className="input" name="pharmacyPincode" value={formData.pharmacyPincode || ''} onChange={handleChange} /></div>
                <div><label>Pharmacy Phone</label><input className="input" name="pharmacyPhone" value={formData.pharmacyPhone || ''} onChange={handleChange} /></div>
              </div>
              <button className="btn" disabled={saving} onClick={handlePersonalSave}>{saving ? 'Saving...' : 'Save Profile'}</button>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="stack-list">
              <div className="form-grid">
                <div><label>License Number</label><input className="input" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} /></div>
                <div><label>License Expiry Date</label><input className="input" type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate || ''} onChange={handleChange} /></div>
                <div><label>License Status</label><input className="input" name="licenseStatus" value={formData.licenseStatus || ''} onChange={handleChange} /></div>
              </div>
              <div className="panel">
                <label>View Type</label>
                <select className="input" name="licenseDocumentViewType" value={formData.licenseDocumentViewType || 'UPLOAD'} onChange={handleChange}>
                  <option value="UPLOAD">Uploaded File</option>
                  <option value="GOOGLE_DRIVE">Google Drive Link</option>
                </select>
                {formData.licenseDocumentViewType === 'GOOGLE_DRIVE' ? (
                  <>
                    <label>Google Drive Link</label>
                    <input className="input" name="licenseDocumentDriveLink" value={formData.licenseDocumentDriveLink || ''} onChange={handleChange} placeholder="https://drive.google.com/..." />
                  </>
                ) : (
                  <>
                    <label>Upload License Document</label>
                    <input className="input" type="file" onChange={(e) => uploadLicense(e.target.files?.[0])} />
                    {uploading && <div className="muted-text text-sm">Uploading...</div>}
                  </>
                )}
                <div className="stack-list compact-stack">
                  {profile.licenseDocumentUrl || profile.licenseDocumentDriveLink ? (
                    <a href={profile.licenseDocumentDriveLink || profile.licenseDocumentUrl} target="_blank" rel="noreferrer">View current document</a>
                  ) : (
                    <span className="muted-text">No document uploaded</span>
                  )}
                  {(profile.licenseDocumentUrl || profile.licenseDocumentDriveLink) && (
                    <button type="button" className="btn small-btn danger-btn" onClick={deleteLicense}>Delete Document</button>
                  )}
                </div>
              </div>
              <button className="btn" disabled={saving} onClick={handleDocumentSave}>{saving ? 'Saving...' : 'Save Document Settings'}</button>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="stack-list">
              <div className="form-grid">
                <div><label>Start Time</label><input className="input" type="time" name="workingHoursStart" value={formData.workingHoursStart || ''} onChange={handleChange} /></div>
                <div><label>End Time</label><input className="input" type="time" name="workingHoursEnd" value={formData.workingHoursEnd || ''} onChange={handleChange} /></div>
              </div>
              <div>
                <label>Working Days</label>
                <div className="chip-row mt-8">
                  {workingDayOptions.map((day) => (
                    <label key={day} className="status-badge" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="checkbox" name="workingDaysList" value={day} checked={workingDays.includes(day)} onChange={handleChange} />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <button className="btn" disabled={saving} onClick={handleScheduleSave}>{saving ? 'Saving...' : 'Save Schedule'}</button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="stack-list">
              <div className="form-grid">
                <div><label>Email</label><input className="input" value={profile.email || ''} disabled /></div>
                <div><label>Phone Number</label><input className="input" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
              </div>
              <button className="btn" disabled={saving} onClick={handleSettingsSave}>{saving ? 'Saving...' : 'Save Phone Number'}</button>
              <ChangePasswordSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
