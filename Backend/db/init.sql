CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'barber', 'admin_barber') NOT NULL,
  bio TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barber_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  position INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barber_id INT NOT NULL,
  week_start DATE NOT NULL,
  work_days VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  barber_id INT NOT NULL,
  schedule_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
);


ALTER TABLE users ADD COLUMN service_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN earnings_split_percentage DECIMAL(5,2) DEFAULT 50.00;
ALTER TABLE appointments ADD COLUMN price DECIMAL(10,2) DEFAULT 0;

CREATE INDEX idx_appointments_barber_date ON appointments(barber_id, date);
CREATE INDEX idx_appointments_client_date ON appointments(client_id, date);
CREATE INDEX idx_schedules_barber_week ON schedules(barber_id, week_start);

ALTER TABLE clients ADD UNIQUE INDEX ux_clients_phone (phone);
ALTER TABLE clients ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Security audit (2026-08-06): close TOCTOU race conditions confirmed live
-- (20 concurrent requests produced 15 duplicate active bookings for the same
-- barber/date/time slot). The application already checks "is this slot free"
-- before inserting, but that check-then-insert has no atomicity guarantee
-- without a DB constraint. A generated column + UNIQUE index enforces it at
-- the database level regardless of application-level races; MySQL treats
-- NULL as distinct across rows, so cancelled/completed appointments (where
-- the generated key is NULL) never collide.
ALTER TABLE schedules ADD UNIQUE INDEX ux_schedules_barber_week (barber_id, week_start);

-- VIRTUAL (not STORED): with the existing FKs on this table, MySQL 8 rejects
-- ADD COLUMN ... STORED with a generic "Cannot add foreign key constraint"
-- error (COPY-algorithm rebuild interaction), while VIRTUAL applies via
-- INPLACE without issue and is equally indexable.
ALTER TABLE appointments ADD COLUMN active_slot_key VARCHAR(40)
  GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN CONCAT(barber_id, '_', date, '_', time) END) VIRTUAL;
ALTER TABLE appointments ADD UNIQUE INDEX ux_appointments_active_slot (active_slot_key);

ALTER TABLE appointments ADD COLUMN active_client_day_key VARCHAR(40)
  GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN CONCAT(client_id, '_', date) END) VIRTUAL;
ALTER TABLE appointments ADD UNIQUE INDEX ux_appointments_active_client_day (active_client_day_key);