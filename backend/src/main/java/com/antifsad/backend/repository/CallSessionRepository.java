package com.antifsad.backend.repository;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.CallSession;
import com.antifsad.backend.model.CallStatus;
import com.antifsad.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CallSessionRepository extends JpaRepository<CallSession, Long> {
    List<CallSession> findByAppointmentOrderByStartedAtDesc(Appointment appointment);
    Optional<CallSession> findFirstByCallerOrReceiverOrderByStartedAtDesc(User caller, User receiver);
    Optional<CallSession> findFirstByRoomId(String roomId);

    @Query("select cs from CallSession cs where (cs.caller = :user or cs.receiver = :user) and cs.status in :statuses order by cs.startedAt desc")
    List<CallSession> findActiveSessions(@Param("user") User user, @Param("statuses") Collection<CallStatus> statuses);
}
