package com.antifsad.backend.service;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

@Service
public class ConsultationAccessService {

    private final AppointmentRepository appointmentRepository;
    private final AuditLogService auditLogService;

    public ConsultationAccessService(AppointmentRepository appointmentRepository, AuditLogService auditLogService) {
        this.appointmentRepository = appointmentRepository;
        this.auditLogService = auditLogService;
    }

    public Appointment getAppointmentOrThrow(Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
    }

    public Appointment requireParticipant(Long appointmentId, User user) {
        Appointment appointment = getAppointmentOrThrow(appointmentId);
        if (!isParticipant(appointment, user) && user.getRole() != Role.ADMIN) {
            auditLogService.log(user, "UNAUTHORIZED_APPOINTMENT_ACCESS", "appointmentId=" + appointmentId);
            throw new IllegalArgumentException("You are not allowed to access this appointment");
        }
        return appointment;
    }

    public Appointment requireDoctorParticipant(Long appointmentId, User user) {
        Appointment appointment = requireParticipant(appointmentId, user);
        if (!appointment.getDoctor().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            auditLogService.log(user, "UNAUTHORIZED_CALL_INITIATE", "appointmentId=" + appointmentId);
            throw new IllegalArgumentException("Only the assigned doctor can perform this action");
        }
        return appointment;
    }

    public Appointment requirePatientParticipant(Long appointmentId, User user) {
        Appointment appointment = requireParticipant(appointmentId, user);
        if (!appointment.getPatient().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            auditLogService.log(user, "UNAUTHORIZED_PATIENT_CALL_ACTION", "appointmentId=" + appointmentId);
            throw new IllegalArgumentException("Only the assigned patient can perform this action");
        }
        return appointment;
    }

    private boolean isParticipant(Appointment appointment, User user) {
        return appointment.getDoctor().getId().equals(user.getId()) || appointment.getPatient().getId().equals(user.getId());
    }
}
