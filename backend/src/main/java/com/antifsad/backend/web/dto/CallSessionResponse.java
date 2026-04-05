package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.CallSession;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class CallSessionResponse {
    private Long id;
    private Long appointmentId;
    private String roomId;
    private String status;
    private Instant startedAt;
    private Instant answeredAt;
    private Instant endedAt;
    private Long durationSeconds;
    private Long callerId;
    private String callerName;
    private Long receiverId;
    private String receiverName;
    private Long endedById;

    public static CallSessionResponse from(CallSession session) {
        return CallSessionResponse.builder()
                .id(session.getId())
                .appointmentId(session.getAppointment().getId())
                .roomId(session.getRoomId())
                .status(session.getStatus().name())
                .startedAt(session.getStartedAt())
                .answeredAt(session.getAnsweredAt())
                .endedAt(session.getEndedAt())
                .durationSeconds(session.getDurationSeconds())
                .callerId(session.getCaller().getId())
                .callerName(session.getCaller().getName())
                .receiverId(session.getReceiver().getId())
                .receiverName(session.getReceiver().getName())
                .endedById(session.getEndedBy() == null ? null : session.getEndedBy().getId())
                .build();
    }
}
