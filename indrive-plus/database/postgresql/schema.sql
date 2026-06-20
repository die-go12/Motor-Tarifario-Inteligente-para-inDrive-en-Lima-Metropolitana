
CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL CHECK (
        role IN ('passenger', 'driver', 'admin', 'auditor')
    ),

    phone VARCHAR(20) UNIQUE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tokens (

    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    token TEXT NOT NULL,

    token_type VARCHAR(20) NOT NULL CHECK (
        token_type IN ('ACCESS', 'REFRESH')
    ),

    expires_at TIMESTAMP NOT NULL,

    is_revoked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_token_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);




CREATE TABLE vehicles (

    id SERIAL PRIMARY KEY,

    driver_id INT NOT NULL UNIQUE,

    brand VARCHAR(50) NOT NULL,

    model VARCHAR(50) NOT NULL,

    plate VARCHAR(20) NOT NULL UNIQUE,

    color VARCHAR(30),

    year INT CHECK (
        year >= 2000
        AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1
    ),

    capacity INT CHECK (
        capacity >= 1
    ),

    fuel_type VARCHAR(20) CHECK (
        fuel_type IN ('gasoline', 'diesel', 'gas', 'electric', 'hybrid')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vehicle_driver
        FOREIGN KEY(driver_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);




CREATE TABLE trips (

    id SERIAL PRIMARY KEY,

    passenger_id INT NOT NULL,

    driver_id INT,

    origin VARCHAR(255) NOT NULL,

    destination VARCHAR(255) NOT NULL,

    distance_km DECIMAL(10,2) NOT NULL CHECK (
        distance_km > 0
    ),

    base_price DECIMAL(10,2) NOT NULL CHECK (
        base_price >= 0
    ),

    minimum_price DECIMAL(10,2) NOT NULL CHECK (
        minimum_price >= 0
    ),

    maximum_price DECIMAL(10,2) NOT NULL CHECK (
        maximum_price >= minimum_price
    ),

    final_price DECIMAL(10,2) CHECK (
        final_price >= 0
    ),

    status VARCHAR(30) NOT NULL CHECK (
        status IN (
            'SEARCHING',
            'ASSIGNED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED'
        )
    ),

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    started_at TIMESTAMP,

    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trip_passenger
        FOREIGN KEY(passenger_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trip_driver
        FOREIGN KEY(driver_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);




CREATE TABLE negotiations (

    id SERIAL PRIMARY KEY,

    trip_id INT NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('OPEN', 'ACCEPTED', 'REJECTED', 'CANCELLED')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_negotiation_trip
        FOREIGN KEY(trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE
);




CREATE TABLE offers (

    id SERIAL PRIMARY KEY,

    negotiation_id INT NOT NULL,

    driver_id INT,

    sender VARCHAR(20) NOT NULL CHECK (
        sender IN ('passenger', 'driver')
    ),

    amount DECIMAL(10,2) NOT NULL CHECK (
        amount >= 0
    ),

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('PENDING', 'ACCEPTED', 'REJECTED')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_offer_negotiation
        FOREIGN KEY(negotiation_id)
        REFERENCES negotiations(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_offer_driver
        FOREIGN KEY(driver_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);




CREATE TABLE payments (

    id SERIAL PRIMARY KEY,

    trip_id INT NOT NULL UNIQUE,

    amount DECIMAL(10,2) NOT NULL CHECK (
        amount >= 0
    ),

    real_price DECIMAL(10,2) CHECK (
        real_price >= 0
    ),

    condition VARCHAR(20) NOT NULL CHECK (
        condition IN ('FLOOR', 'WITHIN_RANGE', 'CEILING')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_trip
        FOREIGN KEY(trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE
);




CREATE INDEX idx_users_role
ON users(role);

CREATE INDEX idx_trips_status
ON trips(status);

CREATE INDEX idx_trips_passenger
ON trips(passenger_id);

CREATE INDEX idx_trips_driver
ON trips(driver_id);

CREATE INDEX idx_tokens_user
ON tokens(user_id);

CREATE INDEX idx_tokens_type
ON tokens(token_type);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (
        action IN ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'UPDATE_CONFIG', 'UPDATE_WEIGHTS')
    ),
    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN ('USER', 'CONFIGURATION', 'WEIGHTS')
    ),
    entity_id INT,
    entity_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_admin
        FOREIGN KEY(admin_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


CREATE INDEX idx_offers_negotiation
ON offers(negotiation_id);

CREATE INDEX idx_negotiations_trip
ON negotiations(trip_id);