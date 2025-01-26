DROP TABLE IF EXISTS companies;

CREATE TABLE IF NOT EXISTS vacancies(
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE NO ACTION,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    salary_from INT NOT NULL CHECK (salary_from < 999999),
    salary_to INT NOT NULL CHECK (salary_to > 0 AND salary_to < 999999),
    currency CHAR(1) NOT NULL CHECK (currency IN ('$', '€', '₴')),
    location VARCHAR(100), 
    is_active BOOLEAN DEFAULT true, 
    created_at TIMESTAMP DEFAULT NOW(), 
    updated_at TIMESTAMP DEFAULT NOW(),
    work_type INTEGER NOT NULL REFERENCES work_types(id) ON DELETE NO ACTION,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE NO ACTION,
);