import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";

function MedicalRecords() {
  const { user, token, role } = useAuth();
  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fileUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    if (!user?.user_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest(`/api/records/patient/${user.user_id}`, { token });
      setRecords(data || []);
    } catch (error) {
      console.error("Failed to load records", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [token, user]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ fileUrl: "", description: "" });
  };

  const submitRecord = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        patientId: user.user_id,
        fileUrl: form.fileUrl,
        description: form.description,
        uploadedBy: role || "patient",
      };

      if (editingId) {
        await apiRequest(`/api/records/${editingId}`, {
          method: "PUT",
          token,
          body: payload,
        });
      } else {
        await apiRequest("/api/records", {
          method: "POST",
          token,
          body: payload,
        });
      }

      resetForm();
      await loadRecords();
    } catch (error) {
      console.error(error);
      alert("Failed to save medical record.");
    }
  };

  const editRecord = (record) => {
    setEditingId(record.id);
    setForm({
      fileUrl: record.fileUrl,
      description: record.description || "",
    });
  };

  const deleteRecord = async (recordId) => {
    if (!window.confirm("Delete this medical record?")) {
      return;
    }

    try {
      await apiRequest(`/api/records/${recordId}`, {
        method: "DELETE",
        token,
      });
      await loadRecords();
    } catch (error) {
      console.error(error);
      alert("Failed to delete medical record.");
    }
  };

  return (
    <div className="card">
      <h2>Medical Records</h2>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Create, update, and delete records stored in the database.
      </p>

      <form onSubmit={submitRecord} className="section-card">
        <div className="section-title">{editingId ? "Edit Record" : "Add Record"}</div>
        <input className="input" placeholder="File URL" value={form.fileUrl} onChange={(event) => setForm({ ...form, fileUrl: event.target.value })} required />
        <input className="input" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" type="submit">{editingId ? "Update Record" : "Create Record"}</button>
          {editingId && <button className="btn" type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {loading ? (
        <p style={{ color: "#666" }}>Loading records...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Date</th>
              <th>Uploaded By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.description || record.fileUrl}</td>
                <td>{record.date}</td>
                <td>{record.uploadedBy}</td>
                <td>
                  <button className="btn" style={{ padding: "6px 10px", fontSize: 12, marginRight: 8 }} onClick={() => editRecord(record)}>
                    Edit
                  </button>
                  <button className="btn" style={{ padding: "6px 10px", fontSize: 12, background: "#b91c1c" }} onClick={() => deleteRecord(record.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MedicalRecords;
