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
