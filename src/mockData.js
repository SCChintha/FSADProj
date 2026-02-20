// Simple in-memory mock data matching the schemas you described

//Authentication / Users
export const users = [
  {
    user_id: 1,
    name: "Admin One",
    email: "admin@example.com",
    password_hash: "admin123", // demo only; real app would hash this
    role: "admin",
    status: "active",
    created_at: "2026-02-01"
  },
  {
    user_id: 2,
    name: "Dr. Sharma",
    email: "doctor@example.com",
    password_hash: "doctor123",
    role: "doctor",
    status: "active",
    created_at: "2026-02-10"
  },
  {
    user_id: 3,
    name: "Ravi Kumar",
    email: "patient@example.com",
    password_hash: "patient123",
    role: "patient",
    status: "active",
    created_at: "2026-02-15"
  },
  {
    user_id: 4,
    name: "PharmaOne",
    email: "pharma@example.com",
    password_hash: "pharma123",
    role: "pharmacist",
    status: "active",
    created_at: "2026-02-18"
  }
];

//Appointments
export const appointments = [
  {
    appointment_id: 1,
    patient_id: 3,
    doctor_id: 2,
    date: "2026-02-20",
    time: "10:00",
    status: "scheduled",
    reason: "General consultation",
    meeting_link: "https://meet.example.com/abc123"
  },
  {
    appointment_id: 2,
    patient_id: 3,
    doctor_id: 2,
    date: "2026-02-21",
    time: "11:30",
    status: "scheduled",
    reason: "Follow-up",
    meeting_link: "https://meet.example.com/def456"
  }
];

//E-Prescriptions
export const prescriptions = [
  {
    prescription_id: 1,
    doctor_id: 2,
    patient_id: 3,
    medicines: "Paracetamol 500mg",
    dosage: "1 tablet twice a day",
    notes: "After food",
    date: "2026-02-12",
    status: "issued"
  },
  {
    prescription_id: 2,
    doctor_id: 2,
    patient_id: 3,
    medicines: "Ibuprofen 400mg",
    dosage: "1 tablet if pain",
    notes: "Max 3 per day",
    date: "2026-02-08",
    status: "issued"
  }
];

//Medical Records
export const medicalRecords = [
  {
    record_id: 1,
    patient_id: 3,
    file_url: "https://storage.example.com/blood-test.pdf",
    description: "Blood Test Report",
    uploaded_by: "lab",
    date: "2026-02-12"
  },
  {
    record_id: 2,
    patient_id: 3,
    file_url: "https://storage.example.com/xray.pdf",
    description: "Chest X-Ray",
    uploaded_by: "lab",
    date: "2026-02-05"
  }
];

//Pharmacy Orders
export const orders = [
  {
    order_id: 1,
    prescription_id: 1,
    pharmacist_id: 4,
    status: "received",
    stage: 1,
    delivery_date: "2026-02-20"
  },
  {
    order_id: 2,
    prescription_id: 2,
    pharmacist_id: 4,
    status: "delivered",
    stage: 4,
    delivery_date: "2026-02-15"
  }
];

// Simple patient notifications
export const patientNotifications = [
  {
    id: 1,
    type: "appointment",
    message: "Appointment with Dr. Sharma tomorrow at 10:00 AM",
    time: "2h ago"
  },
  {
    id: 2,
    type: "prescription",
    message: "New prescription issued by Dr. Sharma",
    time: "1d ago"
  },
  {
    id: 3,
    type: "record",
    message: "Latest blood test report uploaded",
    time: "3d ago"
  }
];

// Admin system activity logs
export const systemActivity = [
  {
    id: 1,
    message: "New doctor registered: Dr. Sharma",
    time: "5m ago"
  },
  {
    id: 2,
    message: "Appointment booked by Ravi Kumar",
    time: "30m ago"
  },
  {
    id: 3,
    message: "Prescription issued for Ravi Kumar",
    time: "1h ago"
  },
  {
    id: 4,
    message: "Pharmacist dispensed order #2",
    time: "3h ago"
  }
];

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

// Simple health profile for patient
export const patientHealthProfile = {
  patient_id: 3,
  bloodGroup: "B+",
  age: 29,
  allergies: ["Penicillin", "Peanuts"],
  chronicConditions: ["Asthma"]
};
