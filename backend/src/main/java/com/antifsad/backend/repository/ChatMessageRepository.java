package com.antifsad.backend.repository;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByAppointment(Appointment appointment, Pageable pageable);
}
