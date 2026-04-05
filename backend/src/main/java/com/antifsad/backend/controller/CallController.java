package com.antifsad.backend.controller;

import com.antifsad.backend.model.CallSession;
import com.antifsad.backend.service.AuthFacade;
import com.antifsad.backend.service.CallSessionService;
import com.antifsad.backend.web.dto.CallEndRequest;
import com.antifsad.backend.web.dto.CallInitiateRequest;
import com.antifsad.backend.web.dto.CallSessionResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    private final CallSessionService callSessionService;
    private final AuthFacade authFacade;

    public CallController(CallSessionService callSessionService, AuthFacade authFacade) {
        this.callSessionService = callSessionService;
        this.authFacade = authFacade;
    }

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> initiate(@Valid @RequestBody CallInitiateRequest request) {
        CallSession session = callSessionService.initiate(
                request.getAppointmentId(),
                request.getReceiverId(),
                authFacade.getCurrentUser()
        );

        return ResponseEntity.ok(Map.of(
                "roomId", session.getRoomId(),
                "callSessionId", session.getId(),
                "callSession", CallSessionResponse.from(session)
        ));
    }

    @PostMapping("/end")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> end(@Valid @RequestBody CallEndRequest request) {
        CallSession session = callSessionService.end(
                request.getRoomId(),
                request.getDuration(),
                authFacade.getCurrentUser()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "callSession", CallSessionResponse.from(session)
        ));
    }

    @GetMapping("/history/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<List<CallSessionResponse>> history(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(
                callSessionService.getHistory(appointmentId, authFacade.getCurrentUser())
                        .stream()
                        .map(CallSessionResponse::from)
                        .toList()
        );
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('ROLE_DOCTOR','ROLE_PATIENT','ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> active() {
        CallSession session = callSessionService.getActive(authFacade.getCurrentUser());
        Map<String, Object> response = new HashMap<>();
        response.put("active", session != null);
        response.put("callSession", session == null ? null : CallSessionResponse.from(session));
        return ResponseEntity.ok(response);
    }
}
