package com.antifsad.backend.service;

import com.antifsad.backend.model.Appointment;
import com.antifsad.backend.model.ChatMessage;
import com.antifsad.backend.model.ChatMessageType;
import com.antifsad.backend.model.User;
import com.antifsad.backend.repository.ChatMessageRepository;
import com.antifsad.backend.web.dto.ChatUploadResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ChatService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final ChatMessageRepository chatMessageRepository;
    private final ConsultationAccessService consultationAccessService;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       ConsultationAccessService consultationAccessService) {
        this.chatMessageRepository = chatMessageRepository;
        this.consultationAccessService = consultationAccessService;
    }

    public List<ChatMessage> getHistory(Long appointmentId, int page, User currentUser) {
        Appointment appointment = consultationAccessService.requireParticipant(appointmentId, currentUser);
        return chatMessageRepository.findByAppointment(
                        appointment,
                        PageRequest.of(Math.max(page - 1, 0), 50, Sort.by(Sort.Direction.ASC, "createdAt"))
                )
                .getContent();
    }

    @Transactional
    public ChatMessage createSystemMessage(Long appointmentId, String content, User currentUser) {
        Appointment appointment = consultationAccessService.requireParticipant(appointmentId, currentUser);
        return chatMessageRepository.save(ChatMessage.builder()
                .appointment(appointment)
                .sender(currentUser)
                .type(ChatMessageType.SYSTEM)
                .content(content)
                .createdAt(Instant.now())
                .build());
    }

    public ChatUploadResponse upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Max file size is 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type");
        }

        try {
            Path uploadDir = Path.of("uploads", "chat");
            Files.createDirectories(uploadDir);

            String safeFileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path target = uploadDir.resolve(safeFileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return new ChatUploadResponse(
                    "/uploads/chat/" + safeFileName,
                    file.getOriginalFilename(),
                    contentType
            );
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to store file", ex);
        }
    }
}
