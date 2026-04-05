package com.antifsad.backend.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class DoctorAvailabilityResponse {
    private Long doctorId;
    private LocalDate date;
    private Boolean acceptingAppointments;
    private List<String> availableDays;
    private String startTime;
    private String endTime;
    private Integer slotDurationMinutes;
    private List<String> availableSlots;
}
