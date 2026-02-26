// Simple in-memory mock data matching the schemas you described

//Authentication / Users
export const users = [];

//Appointments
export const appointments = [];

//E-Prescriptions
export const prescriptions = [];

//Medical Records
export const medicalRecords = [];

//Pharmacy Orders
export const orders = [];

// Simple patient notifications
export const patientNotifications = [];

// Admin system activity logs
export const systemActivity = [];

// Simple medicine inventory for pharmacist view
export const medicineInventory = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    stock: 120,
    usage: "Fever and mild pain relief",
    sideEffects: "Nausea, rash (rare)",
    typicalDosage: "500mg every 6 hours (max 4g/day)"
  },
  {
    id: 2,
    name: "Ibuprofen 400mg",
    stock: 18,
    usage: "Pain, inflammation",
    sideEffects: "Gastric irritation, dizziness",
    typicalDosage: "400mg three times daily after food"
  },
  {
    id: 3,
    name: "Amoxicillin 250mg",
    stock: 6,
    usage: "Bacterial infections",
    sideEffects: "Diarrhea, allergic reactions",
    typicalDosage: "250–500mg every 8 hours as prescribed"
  }
];

// Security / platform status mock values
export const securityStatus = {
  lastBackup: "2026-02-19 23:45",
  activeSessions: 5,
  systemHealth: "Operational",
  serverUptime: "36 days",
  apiStatus: "All services healthy",
  dbStatus: "Primary + replica (OK)"
};

// Patient health profiles
export const healthProfiles = [];

// Data Helpers
export const getUsers = () => {
  const local = localStorage.getItem("users");
  return local ? JSON.parse(local) : users;
};
export const saveUsers = (data) => {
  localStorage.setItem("users", JSON.stringify(data));
};

export const getAppointments = () => {
  const local = localStorage.getItem("appointments");
  return local ? JSON.parse(local) : appointments;
};
export const saveAppointments = (data) => {
  localStorage.setItem("appointments", JSON.stringify(data));
};

export const getMedicalRecords = () => {
  const local = localStorage.getItem("medicalRecords");
  return local ? JSON.parse(local) : medicalRecords;
};
export const saveMedicalRecords = (data) => {
  localStorage.setItem("medicalRecords", JSON.stringify(data));
};

export const getPrescriptions = () => {
  const local = localStorage.getItem("prescriptions");
  return local ? JSON.parse(local) : prescriptions;
};
export const savePrescriptions = (data) => {
  localStorage.setItem("prescriptions", JSON.stringify(data));
};

export const getOrders = () => {
  const local = localStorage.getItem("orders");
  return local ? JSON.parse(local) : orders;
};
export const saveOrders = (data) => {
  localStorage.setItem("orders", JSON.stringify(data));
};

export const getSystemActivity = () => {
  const local = localStorage.getItem("systemActivity");
  return local ? JSON.parse(local) : systemActivity;
};
export const saveSystemActivity = (data) => {
  localStorage.setItem("systemActivity", JSON.stringify(data));
};

export const getMedicineInventory = () => {
  const local = localStorage.getItem("medicineInventory");
  return local ? JSON.parse(local) : medicineInventory;
};
export const saveMedicineInventory = (data) => {
  localStorage.setItem("medicineInventory", JSON.stringify(data));
};

export const getPatientNotifications = () => {
  const local = localStorage.getItem("patientNotifications");
  return local ? JSON.parse(local) : patientNotifications;
};
export const savePatientNotifications = (data) => {
  localStorage.setItem("patientNotifications", JSON.stringify(data));
};

export const getHealthProfiles = () => {
  const local = localStorage.getItem("healthProfiles");
  return local ? JSON.parse(local) : healthProfiles;
};
export const saveHealthProfiles = (data) => {
  localStorage.setItem("healthProfiles", JSON.stringify(data));
};
