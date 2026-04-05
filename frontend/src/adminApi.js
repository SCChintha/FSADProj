import api from "./apiClient";

const buildQuery = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const adminApi = {
  getStats: async () => (await api.get("/api/admin/stats")).data,
  getUsers: async (params) => (await api.get(`/api/admin/users${buildQuery(params)}`)).data,
  getUserDetail: async (userId) => (await api.get(`/api/admin/users/${userId}/detail`)).data,
  updateUser: async (userId, body) => (await api.put(`/api/admin/users/${userId}`, body)).data,
  updateUserStatus: async (userId, body) => (await api.put(`/api/admin/users/${userId}/status`, body)).data,
  approveDoctor: async (userId, body) => (await api.put(`/api/admin/doctors/${userId}/approval`, body)).data,
  approvePharmacist: async (userId, body) => (await api.put(`/api/admin/pharmacists/${userId}/approval`, body)).data,
  resetPassword: async (userId) => (await api.post(`/api/admin/users/${userId}/reset-password`)).data,
  deleteUser: async (userId) => (await api.delete(`/api/admin/users/${userId}`)).data,
  getAppointments: async (params) => (await api.get(`/api/admin/appointments${buildQuery(params)}`)).data,
  rescheduleAppointment: async (appointmentId, body) => (await api.put(`/api/admin/appointments/${appointmentId}/reschedule`, body)).data,
  cancelAppointment: async (appointmentId) => (await api.put(`/api/admin/appointments/${appointmentId}/cancel`, {})).data,
  getDoctorAvailability: async (doctorId, date) => (await api.get(`/api/admin/doctors/${doctorId}/availability${buildQuery({ date })}`)).data,
  getComplaints: async (params) => (await api.get(`/api/admin/complaints${buildQuery(params)}`)).data,
  createComplaint: async (body) => (await api.post("/api/admin/complaints", body)).data,
  updateComplaint: async (complaintId, body) => (await api.put(`/api/admin/complaints/${complaintId}`, body)).data,
  getPrescriptions: async (params) => (await api.get(`/api/admin/prescriptions${buildQuery(params)}`)).data,
  getPrescriptionSummary: async () => (await api.get("/api/admin/prescriptions/summary")).data,
  getLogs: async (params) => (await api.get(`/api/admin/logs${buildQuery(params)}`)).data,
  getSettings: async () => (await api.get("/api/admin/settings")).data,
  updateSettings: async (values) => (await api.put("/api/admin/settings", { values })).data,
};

export const titleCase = (value) => {
  if (!value) {
    return "";
  }

  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};
