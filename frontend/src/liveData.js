import { apiRequest } from "./apiClient";

export function formatRole(role) {
  return (role || "").toLowerCase();
}

export function titleCase(value) {
  if (!value) {
    return "";
  }

  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeAppointment(item) {
  return {
    id: item.id,
    patientId: item.patient?.id,
    patientName: item.patient?.name || "-",
    doctorId: item.doctor?.id,
    doctorName: item.doctor?.name || "-",
    patient: item.patient,
    doctor: item.doctor,
    date: item.date,
    time: item.time?.slice?.(0, 5) || item.time,
    status: formatRole(item.status),
    mode: formatRole(item.mode),
    reason: item.reason || "",
  };
}

export function normalizePrescription(item) {
  const normalizedItems = (item.items || []).map((entry) => ({
    drug: entry.medicineName,
    dosage: entry.dosage,
    frequency: entry.instructions || "",
    duration: entry.duration,
  }));

  return {
    id: item.id,
    patientId: item.patientId ?? item.patient?.id,
    patientName: item.patientName || item.patient?.name || "-",
    doctorId: item.doctorId ?? item.doctor?.id,
    doctorName: item.doctorName || item.doctor?.name || "-",
    appointmentId: item.appointmentId ?? null,
    issuedDate: item.date,
    status: formatRole(item.status),
    notes: item.notes || "",
    medicineName: item.medicineName || normalizedItems[0]?.drug || "-",
    dosage: item.dosage || normalizedItems[0]?.dosage || "-",
    duration: item.duration || normalizedItems[0]?.duration || "-",
    medications: normalizedItems,
  };
}

export function normalizeRecord(item) {
  return {
    id: item.id,
    patientId: item.patient?.id,
    patientName: item.patient?.name || "-",
    date: item.date,
    description: item.description || item.fileUrl,
    fileUrl: item.fileUrl,
    uploadedBy: item.uploadedBy,
  };
}

export function normalizeUser(item) {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    role: titleCase(item.role),
    status: titleCase(item.status),
    joinedDate: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "-",
    lastLoginAt: item.lastLoginAt,
  };
}

export async function loadPatientData(token, userId) {
  const [appointments, prescriptions, records, doctors] = await Promise.all([
    apiRequest(`/patient/appointments`, { token }),
    apiRequest(`/patient/prescriptions`, { token }),
    apiRequest(`/api/records/patient/${userId}`, { token }),
    apiRequest("/api/users/doctors", { token }),
  ]);

  return {
    appointments: (appointments || []).map(normalizeAppointment),
    prescriptions: (prescriptions || []).map(normalizePrescription),
    records: (records || []).map(normalizeRecord),
    doctors: (doctors || []).map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      status: titleCase(doctor.status),
      specialization: "",
      experience: null,
      rating: null,
      fee: null,
      bio: "",
    })),
  };
}

export async function loadDoctorData(token, userId) {
  const [appointments, prescriptions] = await Promise.all([
    apiRequest(`/doctor/appointments`, { token }),
    apiRequest(`/doctor/prescriptions`, { token }),
  ]);

  return {
    appointments: (appointments || []).map(normalizeAppointment),
    prescriptions: (prescriptions || []).map(normalizePrescription),
  };
}

export async function loadAdminData(token) {
  const [users, appointments] = await Promise.all([
    apiRequest("/api/users", { token }),
    apiRequest("/api/appointments", { token }),
  ]);

  return {
    users: (users || []).map(normalizeUser),
    appointments: (appointments || []).map(normalizeAppointment),
  };
}

export async function loadPharmacistData(token) {
  const [prescriptions, inventory, orders] = await Promise.all([
    apiRequest("/prescriptions", { token }),
    apiRequest("/pharmacist/inventory", { token }),
    apiRequest("/pharmacist/orders", { token }),
  ]);

  return {
    prescriptions: (prescriptions || []).map(normalizePrescription),
    inventory: inventory || [],
    orders: orders || [],
  };
}
