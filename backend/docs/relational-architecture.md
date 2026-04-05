# Backend Relational Design

## API structure
- `/auth/**`
- `/patient/**`
- `/doctor/**`
- `/pharmacist/**`
- `/admin/**`

Legacy `/api/**` routes are still available for backward compatibility.

## Core JPA relationships
- `User` -> `PatientProfile` / `DoctorProfile` / `PharmacistProfile` / `AdminProfile`: `@OneToOne(fetch = LAZY)`
- `User` -> `Appointment` as doctor and patient: `@OneToMany(fetch = LAZY)`
- `Appointment` -> doctor and patient: `@ManyToOne(fetch = LAZY)`
- `Prescription` -> `PrescriptionItem`: `@OneToMany(fetch = LAZY, cascade = ALL, orphanRemoval = true)`
- `MedicineOrder` -> `MedicineOrderItem`: `@OneToMany(fetch = LAZY, cascade = ALL, orphanRemoval = true)`
- `MedicineOrderItem` -> `InventoryItem`: `@ManyToOne(fetch = LAZY)`

## Key files
- Entities: `src/main/java/com/antifsad/backend/model`
- Repositories: `src/main/java/com/antifsad/backend/repository`
- Services: `src/main/java/com/antifsad/backend/service`
- Controllers: `src/main/java/com/antifsad/backend/controller`
- MySQL DDL: `docs/schema-mysql.sql`

## Example requests

### Signup
```json
POST /auth/signup
{
  "name": "Dr. Asha Menon",
  "email": "asha@example.com",
  "password": "SecurePass123",
  "role": "DOCTOR",
  "phone": "+91-9876543210",
  "address": "Chennai"
}
```

### Patient books appointment
```json
POST /patient/appointments
{
  "doctorId": 12,
  "date": "2026-04-05",
  "time": "10:30:00",
  "mode": "ONLINE",
  "reason": "Recurring migraine consultation"
}
```

### Doctor creates prescription
```json
POST /doctor/prescriptions
{
  "patientId": 3,
  "appointmentId": 41,
  "notes": "Hydrate well and review after 5 days",
  "items": [
    {
      "medicineName": "Paracetamol 650",
      "dosage": "1-0-1",
      "duration": "5 days",
      "instructions": "After food"
    },
    {
      "medicineName": "Vitamin B Complex",
      "dosage": "0-1-0",
      "duration": "14 days",
      "instructions": "After lunch"
    }
  ]
}
```

### Patient places medicine order
```json
POST /patient/orders
{
  "pharmacistId": 20,
  "prescriptionId": 55,
  "deliveryAddress": "12 Lake View Road, Chennai",
  "notes": "Call before delivery",
  "items": [
    {
      "inventoryItemId": 7,
      "quantity": 2,
      "dosageInstruction": "1-0-1"
    }
  ]
}
```

### Pharmacist updates order status
```json
PATCH /pharmacist/orders/90/status
{
  "status": "FULFILLED",
  "notes": "Packed and dispatched"
}
```

## Example response
```json
{
  "id": 90,
  "status": "FULFILLED",
  "patientId": 3,
  "patientName": "Rahul Kumar",
  "pharmacistId": 20,
  "pharmacistName": "Meera Pharmacy",
  "prescriptionId": 55,
  "deliveryAddress": "12 Lake View Road, Chennai",
  "notes": "Packed and dispatched",
  "items": [
    {
      "id": 101,
      "inventoryItemId": 7,
      "medicineName": "Paracetamol 650",
      "quantity": 2,
      "dosageInstruction": "1-0-1",
      "availableStock": 48
    }
  ]
}
```
