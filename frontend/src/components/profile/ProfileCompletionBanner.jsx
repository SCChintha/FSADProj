import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import './ProfileComponents.css';

export default function ProfileCompletionBanner({ percent, missingFields = [] }) {
  useEffect(() => {
    if (percent === 100) {
      toast.success('Profile complete! 🎉', { id: 'prof-complete' });
    }
  }, [percent]);

  if (percent >= 100) return null;

  const handleChipClick = (field) => {
    const id = field.toLowerCase().replace(/\s+/g, '-');
    const el = document.getElementById(`field-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  return (
    <div className="completion-banner">
      <div className="completion-header">
        <strong>Your profile is {percent}% complete</strong>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
      {missingFields.length > 0 && (
        <div className="missing-fields-container">
          <div className="missing-chips">
            {missingFields.map((field, idx) => (
              <button 
                key={idx} 
                className="missing-chip"
                onClick={() => handleChipClick(field)}
              >
                {field}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
