package com.antifsad.backend.controller;

import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.ChatService;
import com.antifsad.backend.web.dto.ChatMessageResponse;
import com.antifsad.backend.web.dto.ChatUploadResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final AuthFacade authFacade;

    public ChatController(ChatService chatService, AuthFacade authFacade) {
        this.chatService = chatService;
        this.authFacade = authFacade;
    }

    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<List<ChatMessageResponse>> history(@PathVariable Long appointmentId,
                                                             @RequestParam(name = "page", defaultValue = "1") int page) {
        return ResponseEntity.ok(
                chatService.getHistory(appointmentId, page, authFacade.getCurrentUser())
                        .stream()
                        .map(ChatMessageResponse::from)
                        .toList()
        );
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<ChatUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(chatService.upload(file));
    }
}
