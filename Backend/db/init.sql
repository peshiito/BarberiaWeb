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