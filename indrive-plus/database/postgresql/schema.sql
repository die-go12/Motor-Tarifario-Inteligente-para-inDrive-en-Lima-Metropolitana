
CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL CHECK (
        role IN ('passenger', 'driver', 'admin')
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