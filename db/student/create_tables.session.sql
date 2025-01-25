-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS students_personal_info CASCADE;
-- DROP TABLE IF EXISTS students_resume CASCADE;
-- DROP TABLE IF EXISTS students_language CASCADE;
-- DROP TABLE IF EXISTS students_projects CASCADE;
-- DROP TABLE IF EXISTS students_job_info CASCADE;
-- DROP TABLE IF EXISTS students_education_info CASCADE;
-- DROP TABLE IF EXISTS students_contact_info CASCADE;


CREATE TABLE IF NOT EXISTS students(
    id UUID PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id SERIAL NOT NULL REFERENCES roles(id),
    is_activated BOOLEAN NOT NULL DEFAULT false,
    activation_link VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS students_personal_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    photo VARCHAR(255) UNIQUE,
    resume_file VARCHAR(255) UNIQUE,
    student_card VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE TABLE IF NOT EXISTS students_resume(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    about TEXT NOT NULL,
    skills TEXT[] NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE TABLE IF NOT EXISTS students_language(
    id UUID PRIMARY KEY,
    student_resume_id uuid,
    language VARCHAR(50),
    lvl VARCHAR(2) NOT NULL CHECK(
        lvl IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
    ),
    FOREIGN KEY (student_resume_id) REFERENCES students_resume (id)
);

CREATE TABLE IF NOT EXISTS students_projects(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    title VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    codeLink VARCHAR(255) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students (id)
);


CREATE TABLE IF NOT EXISTS students_job_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    job_status VARCHAR(20) CHECK(
        job_status IN ('work', 'search', NULL)
    ) DEFAULT NULL,
    job_preference VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES students (id)
);

CREATE TABLE IF NOT EXISTS students_education_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    education VARCHAR(100),
    university_id UUID NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (university_id) REFERENCES university (id)
);

CREATE TABLE IF NOT EXISTS students_contact_info(
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    linkedin VARCHAR(255),
    telegram VARCHAR(255),
    phone VARCHAR(15),
    FOREIGN KEY (student_id) REFERENCES students (id)
);


