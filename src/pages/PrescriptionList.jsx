import { prescriptions, users } from "../mockData";

function PrescriptionList() {
  // Assume logged-in patient is user_id 3
  const patientId = 3;
  const myPrescriptions = prescriptions.filter((p) => p.patient_id === patientId);

  return (
    <div className="card">
      <h2>My Prescriptions</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Download and view your prescriptions.
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Medicine</th>
            <th>Date</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {myPrescriptions.map((p) => {
            const doctor = users.find((u) => u.user_id === p.doctor_id);
            return (
              <tr key={p.prescription_id}>
                <td>{doctor ? doctor.name : p.doctor_id}</td>
                <td>{p.medicines}</td>
                <td>{p.date}</td>
              <td>
                <button className="btn">Download</button>
              </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PrescriptionList;
