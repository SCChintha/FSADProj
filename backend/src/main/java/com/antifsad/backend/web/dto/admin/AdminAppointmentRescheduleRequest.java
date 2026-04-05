package com.antifsad.backend.web.dto.admin;

import com.antifsad.backend.model.ConsultationMode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AdminAppointmentRescheduleRequest {
    private Long patientId;
    private Long doctorId;
    private LocalDate date;
    private LocalTime time;
    private ConsultationMode mode;
    private String reason;
}
