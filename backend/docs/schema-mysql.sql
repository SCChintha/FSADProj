CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    profile_photo_url VARCHAR(500),
    is_approved BIT(1) NOT NULL DEFAULT b'1',
    phone VARCHAR(50),
    address VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
);

CREATE TABLE patient_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(50),
    blood_group VARCHAR(20),
    height_cm DOUBLE,
    weight_kg DOUBLE,
    allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(255),
    CONSTRAINT fk_patient_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE doctor_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    specialization VARCHAR(255),
    qualification VARCHAR(255),
    years_of_experience INT,
    consultation_fee DOUBLE,
    hospital_name VARCHAR(255),
    hospital_address VARCHAR(500),
    bio TEXT,
    languages_spoken VARCHAR(500),
    license_number VARCHAR(255),
    license_expiry_date DATE,
    license_status VARCHAR(50),
    degree_certificate_url VARCHAR(500),
    license_document_url VARCHAR(500),
    average_rating DOUBLE,
    total_reviews INT,
    total_consultations INT,
    CONSTRAINT fk_doctor_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE pharmacist_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    pharmacy_name VARCHAR(255),
    pharmacy_address_line1 VARCHAR(255),
    pharmacy_address_line2 VARCHAR(255),
    pharmacy_city VARCHAR(100),
    pharmacy_state VARCHAR(100),
    pharmacy_pincode VARCHAR(20),
    pharmacy_phone VARCHAR(50),
    working_hours_start TIME,
    working_hours_end TIME,
    working_days VARCHAR(255),
    license_number VARCHAR(255),
    license_expiry_date DATE,
    license_status VARCHAR(50),
    qualification VARCHAR(255),
    years_of_experience INT,
    license_document_url VARCHAR(500),
    CONSTRAINT fk_pharmacist_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE admin_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    employee_id VARCHAR(255),
    department VARCHAR(255),
    designation VARCHAR(255),
    access_level VARCHAR(100),
    two_factor_enabled BIT(1),
    last_password_change TIMESTAMP NULL,
    CONSTRAINT fk_admin_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(30) NOT NULL,
    mode VARCHAR(30) NOT NULL,
    reason VARCHAR(500),
    meeting_link VARCHAR(500),
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES users(id),
    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_doctor_date (doctor_id, date),
    INDEX idx_appointment_status (status)
);

CREATE TABLE prescriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    doctor_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT NULL,
    date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    notes VARCHAR(1000),
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) REFERENCES users(id),
    CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_prescription_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_prescription_doctor (doctor_id),
    INDEX idx_prescription_patient (patient_id),
    INDEX idx_prescription_appointment (appointment_id)
);

CREATE TABLE prescription_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    prescription_id BIGINT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    duration VARCHAR(255) NOT NULL,
    instructions VARCHAR(500),
    CONSTRAINT fk_prescription_item_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
    INDEX idx_prescription_item_prescription (prescription_id)
);

CREATE TABLE inventory_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    stock INT NOT NULL,
    usage_instructions VARCHAR(1000),
    side_effects VARCHAR(1000),
    typical_dosage VARCHAR(255),
    low_stock_threshold INT NOT NULL
);

CREATE TABLE medicine_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    patient_id BIGINT NOT NULL,
    pharmacist_id BIGINT NULL,
    prescription_id BIGINT NULL,
    status VARCHAR(30) NOT NULL,
    delivery_address VARCHAR(500),
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    CONSTRAINT fk_medicine_order_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_medicine_order_pharmacist FOREIGN KEY (pharmacist_id) REFERENCES users(id),
    CONSTRAINT fk_medicine_order_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id),
    INDEX idx_medicine_order_patient (patient_id),
    INDEX idx_medicine_order_pharmacist (pharmacist_id),
    INDEX idx_medicine_order_status (status),
    INDEX idx_medicine_order_prescription (prescription_id)
);

CREATE TABLE medicine_order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    dosage_instruction VARCHAR(255),
    CONSTRAINT fk_medicine_order_item_order FOREIGN KEY (order_id) REFERENCES medicine_orders(id),
    CONSTRAINT fk_medicine_order_item_inventory FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
    INDEX idx_medicine_order_item_order (order_id),
    INDEX idx_medicine_order_item_inventory (inventory_item_id)
);
