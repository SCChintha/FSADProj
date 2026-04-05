package com.antifsad.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "call_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "caller_id")
    private User caller;

    @ManyToOne(optional = false)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Column(nullable = false, unique = true, length = 100)
    private String roomId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CallStatus status = CallStatus.INITIATED;

    @Column(nullable = false)
    @Builder.Default
    private Instant startedAt = Instant.now();

    private Instant answeredAt;

    private Instant endedAt;

    private Long durationSeconds;

    @ManyToOne
    @JoinColumn(name = "ended_by_id")
    private User endedBy;
}
