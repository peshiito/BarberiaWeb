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

ALTER TABLE schedules ADD UNIQUE INDEX ux_schedules_barber_week (barber_id, week_start);

ALTER TABLE appointments ADD COLUMN active_slot_key VARCHAR(40)
  GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN CONCAT(barber_id, '_', date, '_', time) END) VIRTUAL;
ALTER TABLE appointments ADD UNIQUE INDEX ux_appointments_active_slot (active_slot_key);

ALTER TABLE appointments ADD COLUMN active_client_day_key VARCHAR(40)
  GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN CONCAT(client_id, '_', date) END) VIRTUAL;
ALTER TABLE appointments ADD UNIQUE INDEX ux_appointments_active_client_day (active_client_day_key);

-- Catálogo de servicios administrado por el admin: reemplaza el precio
-- plano por-barbero (users.service_price) por un precio único por tipo de
-- corte, y barber_services define qué subconjunto del catálogo ofrece cada
-- barbero (se usa para filtrar barberos por servicio en la landing).
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barber_services (
  barber_id INT NOT NULL,
  service_id INT NOT NULL,
  PRIMARY KEY (barber_id, service_id),
  FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- NULL-able: los turnos históricos, creados antes de este cambio, no tienen
-- un servicio asociado y no hay forma de inferirlo retroactivamente.
ALTER TABLE appointments ADD COLUMN service_id INT NULL;
ALTER TABLE appointments ADD FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;

ALTER TABLE users DROP COLUMN service_price;

-- Password real de cliente (nullable: las cuentas creadas antes de este
-- cambio no tienen contraseña todavía y pasan por el flujo de "reclamo" en
-- POST /clients/claim la primera vez que intentan loguearse).
ALTER TABLE clients ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE clients ADD COLUMN photo_url VARCHAR(255) NULL;
ALTER TABLE clients ADD COLUMN notes VARCHAR(500) NULL;

ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL;
ALTER TABLE users ADD COLUMN specialties VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN social_media VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN birth_date DATE NULL;
ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL;