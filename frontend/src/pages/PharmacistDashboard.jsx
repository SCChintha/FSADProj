import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContext";
import { apiRequest } from "../apiClient";
import { loadPharmacistData, titleCase } from "../liveData";
import PharmacistProfile from "./profile/PharmacistProfile";

const tabs = ["Overview", "Profile", "Queue", "Orders", "Inventory"];

const blankInventoryForm = {
  id: null,
  name: "",
  stock: "",
  price: "",
  expiryDate: "",
  usage: "",
  sideEffects: "",
  typicalDosage: "",
  lowStockThreshold: "",
};

function PharmacistDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inventoryForm, setInventoryForm] = useState(blankInventoryForm);
  const [inventorySaving, setInventorySaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await loadPharmacistData(token);
      setPrescriptions(data.prescriptions);
      setInventory(data.inventory);
      setOrders(data.orders);
      setError("");
    } catch (err) {
      console.error("Failed to load pharmacist data", err);
      setError(err.message || "Failed to load pharmacist data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const orderColumns = useMemo(
    () => ({
      Placed: orders.filter((item) => item.status === "PLACED"),
      Approved: orders.filter((item) => item.status === "APPROVED"),
      Fulfilled: orders.filter((item) => item.status === "FULFILLED"),
    }),
    [orders]
  );

  const updatePrescriptionStatus = async (prescriptionId, status) => {
    try {
      await apiRequest(`/api/prescriptions/${prescriptionId}/status?status=${status}`, { method: "PATCH", token });
      toast.success(`Prescription marked ${titleCase(status)}`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update prescription.");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiRequest(`/pharmacist/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: { status, notes: `${status} from pharmacist dashboard` },
      });
      toast.success(`Order ${titleCase(status)}`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update order.");
    }
  };

  const handleInventorySubmit = async (event) => {
    event.preventDefault();
    try {
      setInventorySaving(true);
      const payload = {
        name: inventoryForm.name,
        stock: Number(inventoryForm.stock),
        price: Number(inventoryForm.price),
        expiryDate: inventoryForm.expiryDate || null,
        usage: inventoryForm.usage,
        sideEffects: inventoryForm.sideEffects,
        typicalDosage: inventoryForm.typicalDosage,
        lowStockThreshold: Number(inventoryForm.lowStockThreshold),
      };
      if (inventoryForm.id) {
        await apiRequest(`/inventory/${inventoryForm.id}`, { method: "PUT", token, body: payload });
        toast.success("Inventory item updated");
      } else {
        await apiRequest("/inventory", { method: "POST", token, body: payload });
        toast.success("Inventory item created");
      }
      setInventoryForm(blankInventoryForm);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save inventory item.");
    } finally {
      setInventorySaving(false);
    }
  };

  const handleInventoryDelete = async (id) => {
    if (!window.confirm("Delete this inventory item?")) return;
    try {
      await apiRequest(`/inventory/${id}`, { method: "DELETE", token });
      toast.success("Inventory item deleted");
      if (inventoryForm.id === id) {
        setInventoryForm(blankInventoryForm);
      }
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to delete inventory item.");
    }
  };

  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Pharmacist Dashboard</p>
          <h1 className="hero-title">Prescription queue, medicine orders, and inventory are now database-backed.</h1>
          <p className="hero-copy">Create, edit, and delete inventory items here with live stock, price, and expiry dates.</p>
        </div>
      </section>

      <div className="tab-row">
        {tabs.map((tab) => (
          <button key={tab} className={`tab-chip${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="panel"><div className="error-state">{error}</div></div>}

      {loading ? (
        <div className="panel"><div className="loading-wrap">Loading pharmacist data...</div></div>
      ) : (
        <>
          {activeTab === "Overview" && (
            <>
              <div className="stats-grid">
                <article className="metric-card"><span>Prescription queue</span><strong>{prescriptions.length}</strong></article>
                <article className="metric-card"><span>Medicine orders</span><strong>{orders.length}</strong></article>
                <article className="metric-card"><span>Inventory items</span><strong>{inventory.length}</strong></article>
                <article className="metric-card"><span>Low stock</span><strong>{inventory.filter((item) => item.stock <= item.lowStockThreshold).length}</strong></article>
              </div>
            </>
          )}

          {activeTab === "Profile" && (
            <div style={{ marginTop: "-48px", marginLeft: "-24px", marginRight: "-24px" }}>
              <PharmacistProfile />
            </div>
          )}

          {activeTab === "Queue" && (
            <section className="panel">
              <div className="section-header wrap">
                <h2>Prescription queue</h2>
                <button className="btn secondary-btn" onClick={fetchData}>Refresh</button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Prescription</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Medicine</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.patientName}</td>
                        <td>{item.doctorName}</td>
                        <td>{item.medicineName}</td>
                        <td>{titleCase(item.status)}</td>
                        <td className="actions-cell">
                          <button className="btn small-btn secondary-btn" onClick={() => updatePrescriptionStatus(item.id, "DISPENSED")}>Dispense</button>
                          <button className="btn small-btn danger-btn" onClick={() => updatePrescriptionStatus(item.id, "CANCELLED")}>Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === "Orders" && (
            <div className="dashboard-grid two-up">
              {Object.entries(orderColumns).map(([column, items]) => (
                <section className="panel" key={column}>
                  <div className="section-header"><h2>{column}</h2></div>
                  <div className="stack-list">
                    {items.length === 0 && <div className="empty-state">No orders in this state.</div>}
                    {items.map((item) => (
                      <div className="feed-item" key={item.id}>
                        <strong>Order #{item.id}</strong>
                        <span>{item.patientName}</span>
                        <small>{item.items?.map((orderItem) => `${orderItem.medicineName} x${orderItem.quantity}`).join(", ")}</small>
                        <div style={{ display: "flex", gap: 8 }}>
                          {item.status === "PLACED" && <button className="btn small-btn" onClick={() => updateOrderStatus(item.id, "APPROVED")}>Approve</button>}
                          {item.status !== "FULFILLED" && <button className="btn small-btn secondary-btn" onClick={() => updateOrderStatus(item.id, "FULFILLED")}>Fulfill</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeTab === "Inventory" && (
            <div className="dashboard-grid two-up">
              <section className="panel">
                <div className="section-header"><h2>{inventoryForm.id ? "Edit Inventory Item" : "Add Inventory Item"}</h2></div>
                <form onSubmit={handleInventorySubmit}>
                  <input className="input" placeholder="Item Name" value={inventoryForm.name} onChange={(e) => setInventoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
                  <input className="input" type="number" placeholder="Quantity" value={inventoryForm.stock} onChange={(e) => setInventoryForm((prev) => ({ ...prev, stock: e.target.value }))} required />
                  <input className="input" type="number" step="0.01" placeholder="Price" value={inventoryForm.price} onChange={(e) => setInventoryForm((prev) => ({ ...prev, price: e.target.value }))} required />
                  <input className="input" type="date" value={inventoryForm.expiryDate} onChange={(e) => setInventoryForm((prev) => ({ ...prev, expiryDate: e.target.value }))} />
                  <input className="input" placeholder="Low stock threshold" type="number" value={inventoryForm.lowStockThreshold} onChange={(e) => setInventoryForm((prev) => ({ ...prev, lowStockThreshold: e.target.value }))} required />
                  <textarea className="input" rows={3} placeholder="Usage" value={inventoryForm.usage} onChange={(e) => setInventoryForm((prev) => ({ ...prev, usage: e.target.value }))} />
                  <textarea className="input" rows={3} placeholder="Typical Dosage" value={inventoryForm.typicalDosage} onChange={(e) => setInventoryForm((prev) => ({ ...prev, typicalDosage: e.target.value }))} />
                  <textarea className="input" rows={3} placeholder="Side Effects" value={inventoryForm.sideEffects} onChange={(e) => setInventoryForm((prev) => ({ ...prev, sideEffects: e.target.value }))} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn" type="submit" disabled={inventorySaving}>{inventorySaving ? "Saving..." : inventoryForm.id ? "Update Item" : "Add Item"}</button>
                    {inventoryForm.id && <button type="button" className="btn secondary-btn" onClick={() => setInventoryForm(blankInventoryForm)}>Cancel</button>}
                  </div>
                </form>
              </section>

              <section className="panel">
                <div className="section-header"><h2>Inventory List</h2></div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Expiry</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.stock}</td>
                          <td>{item.price}</td>
                          <td>{item.expiryDate || "-"}</td>
                          <td className="actions-cell">
                            <button className="btn small-btn" onClick={() => setInventoryForm({
                              id: item.id,
                              name: item.name || "",
                              stock: item.stock || "",
                              price: item.price || "",
                              expiryDate: item.expiryDate || "",
                              usage: item.usage || "",
                              sideEffects: item.sideEffects || "",
                              typicalDosage: item.typicalDosage || "",
                              lowStockThreshold: item.lowStockThreshold || "",
                            })}>Edit</button>
                            <button className="btn small-btn danger-btn" onClick={() => handleInventoryDelete(item.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PharmacistDashboard;
