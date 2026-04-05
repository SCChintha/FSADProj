import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../apiClient';
import ProfilePhotoUpload from '../../components/profile/ProfilePhotoUpload';
import ProfileCompletionBanner from '../../components/profile/ProfileCompletionBanner';
import ChangePasswordSection from '../../components/profile/ChangePasswordSection';

const tabs = ['professional', 'documents', 'availability', 'settings'];
const dayOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function emptyDocumentState() {
  return {
    licenseDocumentViewType: 'UPLOAD',
    licenseDocumentDriveLink: '',
    degreeDocumentViewType: 'UPLOAD',
    degreeDocumentDriveLink: '',
  };
}

export default function DoctorProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('professional');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');

  const availabilityDays = useMemo(() => {
    const days = formData.availabilityDaysList || [];
    return Array.isArray(days) ? days : [];
  }, [formData.availabilityDaysList]);

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
        languagesSpoken: data.languagesSpokenList?.join(', ') || '',
        availabilityDaysList: data.availabilityDaysList || [],
        ...emptyDocumentState(),
        licenseDocumentViewType: data.licenseDocumentViewType || 'UPLOAD',
        degreeDocumentViewType: data.degreeDocumentViewType || 'UPLOAD',
        licenseDocumentDriveLink: data.licenseDocumentDriveLink || '',
        degreeDocumentDriveLink: data.degreeDocumentDriveLink || '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === 'availabilityDaysList') {
      const next = checked
        ? [...availabilityDays, value]
        : availabilityDays.filter((day) => day !== value);
      setFormData((current) => ({ ...current, availabilityDaysList: next }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveProfile = async (payload, successMessage) => {
    try {
      setSaving(true);
      const { data } = await api.put('/profile/me', payload);
      setProfile(data);
      setFormData({
        ...data,
        languagesSpoken: data.languagesSpokenList?.join(', ') || '',
        availabilityDaysList: data.availabilityDaysList || [],
        licenseDocumentViewType: data.licenseDocumentViewType || 'UPLOAD',
        degreeDocumentViewType: data.degreeDocumentViewType || 'UPLOAD',
        licenseDocumentDriveLink: data.licenseDocumentDriveLink || '',
        degreeDocumentDriveLink: data.degreeDocumentDriveLink || '',
      });
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfessionalSave = () => saveProfile({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    specialization: formData.specialization,
    qualification: formData.qualification,
    yearsOfExperience: Number(formData.yearsOfExperience || 0),
    consultationFee: Number(formData.consultationFee || 0),
    hospitalName: formData.hospitalName,
    hospitalAddress: formData.hospitalAddress,
    bio: formData.bio,
    languagesSpoken: formData.languagesSpoken,
  }, 'Professional profile updated');

  const handleDocumentsSave = () => saveProfile({
    licenseNumber: formData.licenseNumber,
    licenseExpiryDate: formData.licenseExpiryDate,
    licenseStatus: formData.licenseStatus,
    degreeDocumentViewType: formData.degreeDocumentViewType,
    degreeDocumentDriveLink: formData.degreeDocumentViewType === 'GOOGLE_DRIVE' ? formData.degreeDocumentDriveLink : '',
    licenseDocumentViewType: formData.licenseDocumentViewType,
    licenseDocumentDriveLink: formData.licenseDocumentViewType === 'GOOGLE_DRIVE' ? formData.licenseDocumentDriveLink : '',
  }, 'Document information updated');

  const handleAvailabilitySave = () => saveProfile({
    acceptingAppointments: Boolean(formData.acceptingAppointments),
    availabilityStartTime: formData.availabilityStartTime,
    availabilityEndTime: formData.availabilityEndTime,
    availabilityDays: availabilityDays.join(','),
    slotDurationMinutes: Number(formData.slotDurationMinutes || 0),
  }, 'Availability updated');

  const handleSettingsSave = () => saveProfile({
    phone: formData.phone,
  }, 'Phone number updated');

  const handleDocumentUpload = async (documentKey, file) => {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    body.append('documentKey', documentKey);
    try {
      setUploadingKey(documentKey);
      await api.post('/profile/me/documents', body, { headers: {} });
      await fetchProfile();
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploadingKey('');
    }
  };

  const handleDocumentDelete = async (documentKey) => {
    try {
      await api.delete(`/profile/me/documents/${documentKey}`);
      await fetchProfile();
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  if (loading) return <div className="loading-wrap text-center">Loading profile...</div>;

  const renderDocumentCard = (title, documentKey, urlField, typeField, driveField) => {
    const isDrive = formData[typeField] === 'GOOGLE_DRIVE';
    const currentUrl = profile?.[urlField];
    const currentDrive = profile?.[driveField];
    const viewUrl = isDrive ? (formData[driveField] || currentDrive) : currentUrl;
    return (
      <div className="panel">
        <h4>{title}</h4>
        <label>View Type</label>
        <select className="input" name={typeField} value={formData[typeField] || 'UPLOAD'} onChange={handleChange}>
          <option value="UPLOAD">Uploaded File</option>
          <option value="GOOGLE_DRIVE">Google Drive Link</option>
        </select>
        {isDrive ? (
          <>
            <label>Google Drive Link</label>
            <input className="input" name={driveField} value={formData[driveField] || ''} onChange={handleChange} placeholder="https://drive.google.com/..." />
          </>
        ) : (
          <>
            <label>Upload File</label>
            <input className="input" type="file" onChange={(e) => handleDocumentUpload(documentKey, e.target.files?.[0])} />
            {uploadingKey === documentKey && <div className="muted-text text-sm">Uploading...</div>}
          </>
        )}
        <div className="stack-list compact-stack">
          {viewUrl ? <a href={viewUrl} target="_blank" rel="noreferrer">View current document</a> : <span className="muted-text">No document saved</span>}
          {(currentUrl || currentDrive) && (
            <button type="button" className="btn small-btn danger-btn" onClick={() => handleDocumentDelete(documentKey)}>
              Delete Document
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container dashboard-page">
      <ProfileCompletionBanner percent={profile.profileCompletionPercent} missingFields={profile.missingFields} />
      <div className="dashboard-grid min-h-screen">
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <ProfilePhotoUpload currentPhotoUrl={profile.profilePhotoUrl} onUploadSuccess={fetchProfile} />
            <h2>Dr. {profile.firstName} {profile.lastName}</h2>
            <div className="status-badge info">{profile.specializationLabel || 'Doctor'}</div>
            <div className="stack-list" style={{ width: '100%' }}>
              <div className="scheduler-row"><span>Approval</span><strong>{profile.isApproved ? 'Approved' : 'Pending'}</strong></div>
              <div className="scheduler-row"><span>Phone</span><strong>{profile.phone || '-'}</strong></div>
              <div className="scheduler-row"><span>Availability</span><strong>{profile.acceptingAppointments ? 'Open' : 'Paused'}</strong></div>
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

          {activeTab === 'professional' && (
            <div className="stack-list">
              <div className="form-grid">
                <div><label>First Name</label><input className="input" name="firstName" value={formData.firstName || ''} onChange={handleChange} /></div>
                <div><label>Last Name</label><input className="input" name="lastName" value={formData.lastName || ''} onChange={handleChange} /></div>
                <div><label>Phone</label><input className="input" name="phone" value={formData.phone || ''} onChange={handleChange} /></div>
                <div><label>Specialization</label><input className="input" name="specialization" value={formData.specialization || ''} onChange={handleChange} /></div>
                <div><label>Qualification</label><input className="input" name="qualification" value={formData.qualification || ''} onChange={handleChange} /></div>
                <div><label>Experience</label><input className="input" type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ''} onChange={handleChange} /></div>
                <div><label>Consultation Fee</label><input className="input" type="number" name="consultationFee" value={formData.consultationFee || ''} onChange={handleChange} /></div>
                <div className="full-span"><label>Hospital Name</label><input className="input" name="hospitalName" value={formData.hospitalName || ''} onChange={handleChange} /></div>
                <div className="full-span"><label>Hospital Address</label><textarea className="input" name="hospitalAddress" value={formData.hospitalAddress || ''} onChange={handleChange} rows={3} /></div>
                <div className="full-span"><label>Languages Spoken</label><input className="input" name="languagesSpoken" value={formData.languagesSpoken || ''} onChange={handleChange} /></div>
                <div className="full-span"><label>Bio</label><textarea className="input" name="bio" value={formData.bio || ''} onChange={handleChange} rows={5} /></div>
              </div>
              <button className="btn" disabled={saving} onClick={handleProfessionalSave}>{saving ? 'Saving...' : 'Save Professional Info'}</button>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="stack-list">
              <div className="form-grid">
                <div><label>License Number</label><input className="input" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} /></div>
                <div><label>License Expiry Date</label><input className="input" type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate || ''} onChange={handleChange} /></div>
                <div><label>License Status</label><input className="input" name="licenseStatus" value={formData.licenseStatus || ''} onChange={handleChange} placeholder="VALID / EXPIRED" /></div>
              </div>
              <div className="dashboard-grid two-up">
                {renderDocumentCard('Degree Certificate', 'degree', 'degreeCertificateUrl', 'degreeDocumentViewType', 'degreeDocumentDriveLink')}
                {renderDocumentCard('Medical License', 'license', 'licenseDocumentUrl', 'licenseDocumentViewType', 'licenseDocumentDriveLink')}
              </div>
              <button className="btn" disabled={saving} onClick={handleDocumentsSave}>{saving ? 'Saving...' : 'Save Document Settings'}</button>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="stack-list">
              <label className="scheduler-row">
                <span>Accepting appointments</span>
                <input type="checkbox" name="acceptingAppointments" checked={Boolean(formData.acceptingAppointments)} onChange={handleChange} />
              </label>
              <div className="form-grid">
                <div><label>Start Time</label><input className="input" type="time" name="availabilityStartTime" value={formData.availabilityStartTime || ''} onChange={handleChange} /></div>
                <div><label>End Time</label><input className="input" type="time" name="availabilityEndTime" value={formData.availabilityEndTime || ''} onChange={handleChange} /></div>
                <div><label>Slot Duration (minutes)</label><input className="input" type="number" min="10" name="slotDurationMinutes" value={formData.slotDurationMinutes || ''} onChange={handleChange} /></div>
              </div>
              <div>
                <label>Available Days</label>
                <div className="chip-row mt-8">
                  {dayOptions.map((day) => (
                    <label key={day} className="status-badge" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="checkbox" name="availabilityDaysList" value={day} checked={availabilityDays.includes(day)} onChange={handleChange} />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>
              <button className="btn" disabled={saving} onClick={handleAvailabilitySave}>{saving ? 'Saving...' : 'Save Availability'}</button>
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
