import { medicalRecords } from "../mockData";

function MedicalRecords() {
  // Assume logged-in patient is user_id 3
  const patientId = 3;
  const records = medicalRecords.filter((r) => r.patient_id === patientId);

  return (
    <div className="card">
      <h2>Medical Records</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Access your uploaded lab reports and history.
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Type</th>
            <th>Date</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.record_id}>
              <td>{r.description}</td>
              <td>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    background: "#e3f2fd"
                  }}
                >
                  File
                </span>
              </td>
              <td>{r.date}</td>
              <td>
                <button className="btn">Open</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MedicalRecords;
