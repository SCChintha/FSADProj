package com.antifsad.backend.web.dto;

import com.antifsad.backend.model.ChatMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long appointmentId;
    private Long senderId;
    private String senderName;
    private String type;
    private String content;
    private String fileName;
    private String fileType;
    private boolean read;
    private Instant createdAt;

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .appointmentId(message.getAppointment().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .type(message.getType().name())
                .content(message.getContent())
                .fileName(message.getFileName())
                .fileType(message.getFileType())
                .read(message.isRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
