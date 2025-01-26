DROP TABLE IF EXISTS students_language CASCADE;
DROP TABLE IF EXISTS students_projects CASCADE;
DROP TABLE IF EXISTS students_job_info CASCADE;
DROP TABLE IF EXISTS students_education_info CASCADE;
DROP TABLE IF EXISTS students_contact_info CASCADE;
DROP TABLE IF EXISTS students_resume CASCADE;
DROP TABLE IF EXISTS students_personal_info CASCADE;
DROP TABLE IF EXISTS students CASCADE;


CREATE TABLE IF NOT EXISTS students(
    id UUID PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE NO ACTION,
    is_activated BOOLEAN NOT NULL DEFAULT false,
    activation_link VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(), 
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students_personal_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    photo VARCHAR(255) UNIQUE,
    resume_file VARCHAR(255) UNIQUE,
    student_card VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS students_resume(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    about TEXT NOT NULL,
    skills TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS students_language( 
    id UUID PRIMARY KEY,
    student_resume_id UUID NOT NULL REFERENCES students_resume(id) ON DELETE CASCADE,
    language VARCHAR(50),
    lvl VARCHAR(2) NOT NULL CHECK(
        lvl IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
    )
);

CREATE TABLE IF NOT EXISTS students_projects(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    codeLink VARCHAR(255) NOT NULL
);


CREATE TABLE IF NOT EXISTS students_job_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_status VARCHAR(20) CHECK(
        job_status IN ('work', 'search', NULL)
    ) DEFAULT NULL,
    job_preference VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS students_education_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    universities_id UUID NOT NULL REFERENCES universities(id) ON DELETE NO ACTION,
    education VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS students_contact_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    linkedin VARCHAR(255),
    telegram VARCHAR(255),
    phone VARCHAR(15)
);


