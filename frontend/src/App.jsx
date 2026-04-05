import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./AuthContext";

import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import BookAppointment from "./pages/BookAppointment";
import PrescriptionList from "./pages/PrescriptionList";
import MedicalRecords from "./pages/MedicalRecords";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ConsultationRoom from "./pages/ConsultationRoom";

function AppLayout() {
  const location = useLocation();
  const consultationMode = location.pathname.startsWith("/consultation/");

  return (
    <>
      {!consultationMode && <Navbar />}
      <div className={consultationMode ? "consultation-layout" : "container"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacist"
            element={
              <ProtectedRoute allowedRoles={["pharmacist"]}>
                <PharmacistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PrescriptionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultation/:appointmentId"
            element={
              <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                <ConsultationRoom />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
        <AppLayout />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
