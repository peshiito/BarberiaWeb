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

-- La reserva pública deja de requerir cuenta de cliente (login/contraseña):
-- pasa a ser 100% como invitado, con nombre+teléfono resueltos por
-- find-or-create y una nota de referencia opcional por turno.
ALTER TABLE appointments ADD COLUMN note VARCHAR(300) NULL;
ALTER TABLE clients DROP COLUMN password_hash;
ALTER TABLE clients DROP COLUMN photo_url;

-- Las especialidades eran texto libre y duplicaban a los servicios: ahora lo
-- que hace cada barbero sale solo de barber_services (elegido del catálogo).
ALTER TABLE users DROP COLUMN specialties;
-- Finanzas: medio de pago de cada turno, liquidaciones a barberos con
-- adelantos, productos con stock y comisión, y movimientos manuales de caja.
ALTER TABLE appointments ADD COLUMN payment_method ENUM('cash', 'transfer') NULL;
-- Porcentaje del barbero congelado al completar el turno: si después se le
-- cambia la comisión, lo ya trabajado se sigue liquidando con el valor viejo.
ALTER TABLE appointments ADD COLUMN barber_split_percentage DECIMAL(5,2) NULL;
ALTER TABLE appointments ADD COLUMN completed_at TIMESTAMP NULL;
UPDATE appointments a JOIN users u ON u.id = a.barber_id
  SET a.barber_split_percentage = u.earnings_split_percentage
  WHERE a.status = 'completed' AND a.barber_split_percentage IS NULL;

CREATE TABLE barber_payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barber_id INT NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  services_count INT NOT NULL DEFAULT 0,
  services_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
  services_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  sales_count INT NOT NULL DEFAULT 0,
  commissions_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  advances_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'transfer') NOT NULL,
  note VARCHAR(300) NULL,
  created_by INT NULL,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_barber_payouts_barber (barber_id, paid_at)
);

ALTER TABLE appointments ADD COLUMN payout_id INT NULL;
ALTER TABLE appointments ADD FOREIGN KEY (payout_id) REFERENCES barber_payouts(id) ON DELETE SET NULL;

CREATE TABLE barber_advances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barber_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'transfer') NOT NULL,
  given_on DATE NOT NULL,
  note VARCHAR(300) NULL,
  payout_id INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barber_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payout_id) REFERENCES barber_payouts(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  barber_commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  seller_id INT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method ENUM('cash', 'transfer') NOT NULL,
  sold_on DATE NOT NULL,
  payout_id INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (payout_id) REFERENCES barber_payouts(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_sales_date (sold_on)
);

CREATE TABLE cash_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  direction ENUM('in', 'out') NOT NULL,
  category ENUM('opening_balance', 'other_income', 'supplies', 'equipment', 'product_restock', 'rent_services', 'other_expense') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'transfer') NOT NULL,
  occurred_on DATE NOT NULL,
  product_id INT NULL,
  quantity INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_cash_movements_date (occurred_on)
);
