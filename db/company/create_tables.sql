DROP TABLE IF EXISTS vacancies;
DROP TABLE IF EXISTS recruiters;
DROP TABLE IF EXISTS egrpou_info;
DROP TABLE IF EXISTS companies_info;
DROP TABLE IF EXISTS companies;




CREATE TABLE IF NOT EXISTS companies(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id INTEGER NOT NULL REFERENCES roles(id) DEFAULT 2,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL, 
    activationLink VARCHAR(255) UNIQUE,
    activated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(), 
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE companies_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL UNIQUE,
    photo VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS egrpou_info(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    egrpou VARCHAR(15) UNIQUE,
    name VARCHAR(255)NOT NULL UNIQUE,
    name_short VARCHAR(255)NOT NULL UNIQUE,
    address VARCHAR(255)NOT NULL UNIQUE,
    director VARCHAR(255)NOT NULL,
    kved VARCHAR(255)NOT NULL,
    inn VARCHAR(255)NOT NULL,
    inn_date VARCHAR(255)NOT NULL,
    last_update VARCHAR(255)NOT NULL
);

CREATE TABLE IF NOT EXISTS recruiters(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id INTEGER NOT NULL REFERENCES roles(id) DEFAULT 6,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    photo VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vacancies(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE NO ACTION,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    salary_from INT NOT NULL CHECK (salary_from < 999999),
    salary_to INT NOT NULL CHECK (salary_to > 0 AND salary_to < 999999),
    currency CHAR(1) NOT NULL CHECK (currency IN ('$', '€', '₴')),
    location VARCHAR(100) NOT NULL, 
    is_active BOOLEAN DEFAULT true, 
    work_type INTEGER NOT NULL REFERENCES work_types(id) ON DELETE NO ACTION,
    created_at TIMESTAMP DEFAULT NOW(), 
    updated_at TIMESTAMP DEFAULT NOW()
);

