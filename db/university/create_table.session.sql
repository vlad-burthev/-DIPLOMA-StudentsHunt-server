DROP TABLE IF EXISTS universities;

CREATE TABLE IF NOT EXISTS universities(
    id UUID PRIMARY KEY,
    logo VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    egrpou CHAR(8) NOT NULL UNIQUE CHECK (egrpou ~ '^[0-9]{8}$'),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(), 
    updated_at TIMESTAMP DEFAULT NOW()
);

