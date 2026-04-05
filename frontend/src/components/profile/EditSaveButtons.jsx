import React from 'react';
import './ProfileComponents.css';

export default function EditSaveButtons({ isEditing, onEdit, onSave, onCancel, isLoading }) {
  if (!isEditing) {
    return (
      <button className="btn outline-teal edit-btn" onClick={onEdit}>
        <span className="icon">✎</span> Edit
      </button>
    );
  }

  return (
    <div className="edit-actions">
      <button 
        className="btn outline-gray cancel-btn" 
        onClick={onCancel}
        disabled={isLoading}
      >
        <span className="icon">✕</span> Cancel
      </button>
      <button 
        className="btn filled-teal save-btn" 
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? <span className="profile-spinner-small"></span> : <><span className="icon">✓</span> Save Changes</>}
      </button>
    </div>
  );
}
