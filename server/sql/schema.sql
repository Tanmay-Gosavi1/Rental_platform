DROP DATABASE IF EXISTS rental_platform;
CREATE DATABASE rental_platform;
USE rental_platform;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL CHECK(LENGTH(PASSWORD) >= 6),
    phone VARCHAR(20) DEFAULT NULL,
    auth_provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
    role ENUM('customer', 'admin') DEFAULT 'customer', 
    googleId VARCHAR(255) DEFAULT NULL,
    profile_image VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE OTPs (
    otp_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    type ENUM('car', 'bike', 'scooty') NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid') DEFAULT 'petrol',
    transmission ENUM('manual', 'automatic') DEFAULT 'manual',
    seats INT DEFAULT 4,
    price_per_day DECIMAL(10, 2) NOT NULL,
    price_per_hour DECIMAL(10, 2) DEFAULT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    images JSON DEFAULT NULL,
    features JSON DEFAULT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2, 1) DEFAULT 0,
    total_trips INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) DEFAULT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'ongoing', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    razorpay_order_id VARCHAR(255) DEFAULT NULL,
    razorpay_payment_id VARCHAR(255) DEFAULT NULL,
    razorpay_signature VARCHAR(255) DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT NULL,
    status ENUM('created', 'authorized', 'captured', 'refunded', 'failed') DEFAULT 'created',
    payment_date TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    booking_id INT NOT NULL,
    rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insert default admin user (password: admin123)
INSERT INTO Users (username, email, password, role) VALUES 
('Admin', 'admin@rentify.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample vehicles
INSERT INTO Vehicles (name, brand, model, type, fuel_type, transmission, seats, price_per_day, price_per_hour, location, description, image_url, features, is_available) VALUES
('Swift Dzire', 'Maruti Suzuki', 'Dzire VXI', 'car', 'petrol', 'manual', 5, 1500.00, 100.00, 'Bangalore', 'Comfortable sedan perfect for city drives and short trips.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', '["AC", "Power Steering", "Central Locking", "Music System"]', TRUE),
('City', 'Honda', 'City ZX', 'car', 'petrol', 'automatic', 5, 2500.00, 150.00, 'Bangalore', 'Premium sedan with advanced features and smooth driving experience.', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800', '["AC", "Sunroof", "Leather Seats", "Cruise Control", "Bluetooth"]', TRUE),
('Creta', 'Hyundai', 'Creta SX', 'car', 'diesel', 'automatic', 5, 3000.00, 200.00, 'Bangalore', 'Popular SUV with great mileage and spacious interiors.', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', '["AC", "4WD", "Parking Sensors", "Touchscreen", "Rear Camera"]', TRUE),
('Fortuner', 'Toyota', 'Fortuner 4x4', 'car', 'diesel', 'automatic', 7, 5000.00, 350.00, 'Bangalore', 'Powerful SUV ideal for long trips and off-road adventures.', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', '["AC", "4WD", "Leather Seats", "Cruise Control", "Premium Sound"]', TRUE),
('Royal Enfield', 'Royal Enfield', 'Classic 350', 'bike', 'petrol', 'manual', 2, 800.00, 60.00, 'Bangalore', 'Iconic cruiser bike for enthusiasts.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', '["ABS", "Digital Console", "USB Charging"]', TRUE),
('Activa', 'Honda', 'Activa 6G', 'scooty', 'petrol', 'automatic', 2, 400.00, 30.00, 'Bangalore', 'Most reliable scooter for daily commute.', 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800', '["LED Lights", "USB Charging", "Storage"]', TRUE);