package com.antifsad.backend.service;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.CallSession;
import com.antifsad.backend.model.CallStatus;
import com.antifsad.backend.model.AppointmentStatus;
import com.antifsad.backend.model.Role;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.CallSessionRepository;
import com.antifsad.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CallSessionService {

    private final CallSessionRepository callSessionRepository;
    private final ConsultationAccessService consultationAccessService;
    private final UserRepository userRepository;

    public CallSessionService(CallSessionRepository callSessionRepository,
                              ConsultationAccessService consultationAccessService,
                              UserRepository userRepository) {
        this.callSessionRepository = callSessionRepository;
        this.consultationAccessService = consultationAccessService;
        this.userRepository = userRepository;
    }

    @Transactional
    public CallSession initiate(Long appointmentId, Long receiverId, User currentUser) {
        Appointment appointment = consultationAccessService.requireDoctorParticipant(appointmentId, currentUser);
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        if (!appointment.getPatient().getId().equals(receiver.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Receiver must be the patient assigned to the appointment");
        }

        CallSession session = CallSession.builder()
                .appointment(appointment)
                .caller(currentUser)
                .receiver(receiver)
                .roomId(UUID.randomUUID().toString())
                .status(CallStatus.RINGING)
                .startedAt(Instant.now())
                .build();

        return callSessionRepository.save(session);
    }

    @Transactional
    public CallSession end(String roomId, Long duration, User currentUser) {
        CallSession session = callSessionRepository.findFirstByRoomId(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Call session not found"));

        consultationAccessService.requireParticipant(session.getAppointment().getId(), currentUser);

        session.setStatus(CallStatus.ENDED);
        session.setEndedAt(Instant.now());
        session.setDurationSeconds(duration != null ? duration : 0L);
        session.setEndedBy(currentUser);
        Appointment appointment = session.getAppointment();
        if (appointment.getStatus() == AppointmentStatus.SCHEDULED) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
        }
        return callSessionRepository.save(session);
    }

    public List<CallSession> getHistory(Long appointmentId, User currentUser) {
        Appointment appointment = consultationAccessService.requireParticipant(appointmentId, currentUser);
        return callSessionRepository.findByAppointmentOrderByStartedAtDesc(appointment);
    }

    public CallSession getActive(User currentUser) {
        return callSessionRepository.findActiveSessions(
                        currentUser,
                        Set.of(CallStatus.INITIATED, CallStatus.RINGING, CallStatus.ACTIVE)
                ).stream()
                .findFirst()
                .orElse(null);
    }
}
