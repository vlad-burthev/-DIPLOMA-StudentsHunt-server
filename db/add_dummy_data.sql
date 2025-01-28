INSERT INTO universities (id, logo, email, password, egrpou, name)
VALUES 
    (gen_random_uuid(), 'logo1.png', 'university1@example.com', 'password1', '12345678', 'University One'),
    (gen_random_uuid(), 'logo2.png', 'university2@example.com', 'password2', '23456789', 'University Two'),
    (gen_random_uuid(), 'logo3.png', 'university3@example.com', 'password3', '34567890', 'University Three'),
    (gen_random_uuid(), 'logo4.png', 'university4@example.com', 'password4', '45678901', 'University Four'),
    (gen_random_uuid(), 'logo5.png', 'university5@example.com', 'password5', '56789012', 'University Five'),
    (gen_random_uuid(), 'logo6.png', 'university6@example.com', 'password6', '67890123', 'University Six'),
    (gen_random_uuid(), 'logo7.png', 'university7@example.com', 'password7', '78901234', 'University Seven'),
    (gen_random_uuid(), 'logo8.png', 'university8@example.com', 'password8', '89012345', 'University Eight'),
    (gen_random_uuid(), 'logo9.png', 'university9@example.com', 'password9', '90123456', 'University Nine'),
    (gen_random_uuid(), 'logo10.png', 'university10@example.com', 'password10', '01234567', 'University Ten');

INSERT INTO students (id, email, password, role_id, is_activated, activation_link, is_verified)
VALUES 
    (gen_random_uuid(), 'student11@example.com', 'password1', 2, false, 'activation-link-11', false),
    (gen_random_uuid(), 'student12@example.com', 'password2', 2, true, 'activation-link-12', true),
    (gen_random_uuid(), 'student13@example.com', 'password3', 2, false, 'activation-link-13', false),
    (gen_random_uuid(), 'student14@example.com', 'password4', 2, true, 'activation-link-14', true),
    (gen_random_uuid(), 'student15@example.com', 'password5', 2, false, 'activation-link-15', false),
    (gen_random_uuid(), 'student16@example.com', 'password6', 2, true, 'activation-link-16', true),
    (gen_random_uuid(), 'student17@example.com', 'password7', 2, false, 'activation-link-17', false),
    (gen_random_uuid(), 'student18@example.com', 'password8', 2, true, 'activation-link-18', true),
    (gen_random_uuid(), 'student19@example.com', 'password9', 2, false, 'activation-link-19', false),
    (gen_random_uuid(), 'student20@example.com', 'password10', 2, true, 'activation-link-20', true);

INSERT INTO students_personal_info (id, student_id, photo, resume_file, student_card, name, surname)
VALUES 
    (gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 'photo1.jpg', 'resume1.pdf', 'SC-001', 'John', 'Doe'),
    (gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 'photo2.jpg', 'resume2.pdf', 'SC-002', 'Jane', 'Smith');

INSERT INTO students_resume (id, student_id, about, skills)
VALUES 
    (gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 'Software Engineer', ARRAY['JavaScript', 'React', 'Node.js']),
    (gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 'Frontend Developer', ARRAY['HTML', 'CSS', 'TypeScript']);

INSERT INTO students_language (id, student_resume_id, language, lvl) VALUES
(gen_random_uuid(), (SELECT id FROM students_resume LIMIT 1 OFFSET 0), 'English', 'C1'),
(gen_random_uuid(), (SELECT id FROM students_resume LIMIT 1 OFFSET 1), 'French', 'B2');

INSERT INTO students_projects (id, student_id, title, description, codeLink) VALUES
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 'Project Alpha', 'An e-commerce platform.', 'https://github.com/example/alpha'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 'Project Beta', 'A social media app.', 'https://github.com/example/beta'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 2), 'Project Gamma', 'A chat application.', 'https://github.com/example/gamma'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 3), 'Project Delta', 'A task management system.', 'https://github.com/example/delta'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 4), 'Project Epsilon', 'A portfolio website.', 'https://github.com/example/epsilon'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 5), 'Project Zeta', 'A weather forecasting app.', 'https://github.com/example/zeta'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 6), 'Project Eta', 'A blogging platform.', 'https://github.com/example/eta'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 7), 'Project Theta', 'A real estate app.', 'https://github.com/example/theta'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 8), 'Project Iota', 'An online forum.', 'https://github.com/example/iota'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 9), 'Project Kappa', 'A productivity tool.', 'https://github.com/example/kappa');

INSERT INTO students_job_info (id, student_id, job_status, job_preference) VALUES
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 'work', 'Frontend Developer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 'search', 'Backend Developer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 2), NULL, 'Full Stack Developer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 3), 'work', 'Data Analyst'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 4), 'search', 'Mobile Developer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 5), 'work', 'DevOps Engineer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 6), NULL, 'Game Developer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 7), 'search', 'AI Engineer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 8), 'work', 'UX/UI Designer'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 9), NULL, 'Cybersecurity Specialist');

INSERT INTO students_education_info (id, student_id, universities_id, education) VALUES
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), (SELECT id FROM universities LIMIT 1 OFFSET 0), 'Bachelor in Computer Science'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), (SELECT id FROM universities LIMIT 1 OFFSET 1), 'Master in AI'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 2), (SELECT id FROM universities LIMIT 1 OFFSET 2), 'PhD in Data Science'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 3), (SELECT id FROM universities LIMIT 1 OFFSET 3), 'Bachelor in Software Engineering'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 4), (SELECT id FROM universities LIMIT 1 OFFSET 4), 'Master in Cybersecurity'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 5), (SELECT id FROM universities LIMIT 1 OFFSET 5), 'Bachelor in Physics'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 6), (SELECT id FROM universities LIMIT 1 OFFSET 6), 'Master in Robotics'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 7), (SELECT id FROM universities LIMIT 1 OFFSET 7), 'PhD in Machine Learning'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 8), (SELECT id FROM universities LIMIT 1 OFFSET 8), 'Bachelor in Mathematics'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 9), (SELECT id FROM universities LIMIT 1 OFFSET 9), 'Master in Cloud Computing');

INSERT INTO students_contact_info (id, student_id, linkedin, telegram, phone) VALUES
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 0), 'https://linkedin.com/student1', '@student1', '+380123456789'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 1), 'https://linkedin.com/student2', '@student2', '+380123456780'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 2), 'https://linkedin.com/student3', '@student3', '+380123456781'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 3), 'https://linkedin.com/student4', '@student4', '+380123456782'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 4), 'https://linkedin.com/student5', '@student5', '+380123456783'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 5), 'https://linkedin.com/student6', '@student6', '+380123456784'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 6), 'https://linkedin.com/student7', '@student7', '+380123456785'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 7), 'https://linkedin.com/student8', '@student8', '+380123456786'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 8), 'https://linkedin.com/student9', '@student9', '+380123456787'),
(gen_random_uuid(), (SELECT id FROM students LIMIT 1 OFFSET 9), 'https://linkedin.com/student10', '@student10', '+380123456788');

INSERT INTO companies (id, role_id, email, password, egrpou, title, photo) VALUES
(gen_random_uuid(), 2, 'company1@example.com', 'securepass1', '12345678', 'TechCorp', 'https://example.com/photo1.png'),
(gen_random_uuid(), 2, 'company2@example.com', 'securepass2', '87654321', 'InnovateInc', 'https://example.com/photo2.png'),
(gen_random_uuid(), 2, 'company3@example.com', 'securepass3', '23456789', 'DevSolutions', 'https://example.com/photo3.png'),
(gen_random_uuid(), 2, 'company4@example.com', 'securepass4', '98765432', 'CodeMasters', 'https://example.com/photo4.png'),
(gen_random_uuid(), 2, 'company5@example.com', 'securepass5', '34567890', 'DataPros', 'https://example.com/photo5.png'),
(gen_random_uuid(), 2, 'company6@example.com', 'securepass6', '65432198', 'SoftBuild', 'https://example.com/photo6.png'),
(gen_random_uuid(), 2, 'company7@example.com', 'securepass7', '45678901', 'NextGen', 'https://example.com/photo7.png'),
(gen_random_uuid(), 2, 'company8@example.com', 'securepass8', '32198765', 'TechBridge', 'https://example.com/photo8.png'),
(gen_random_uuid(), 2, 'company9@example.com', 'securepass9', '56789012', 'BrightTech', 'https://example.com/photo9.png'),
(gen_random_uuid(), 2, 'company10@example.com', 'securepass10', '21987654', 'FutureInnovators', 'https://example.com/photo10.png');

INSERT INTO recruiters (id, role_id, company_id, email, password, name, surname, photo) VALUES
(gen_random_uuid(), 3, (SELECT id FROM companies LIMIT 1 OFFSET 0), 'recruiter1@example.com', 'pass1', 'John', 'Doe', 'https://example.com/recruiter1.png'),
(gen_random_uuid(), 3, (SELECT id FROM companies LIMIT 1 OFFSET 1), 'recruiter2@example.com', 'pass2', 'Jane', 'Smith', 'https://example.com/recruiter2.png');

INSERT INTO vacancies (id, company_id, recruiter_id, title, description, requirements, salary_from, salary_to, currency, location, work_type, role_id) VALUES
(gen_random_uuid(), (SELECT id FROM companies LIMIT 1 OFFSET 0), (SELECT id FROM recruiters LIMIT 1 OFFSET 0), 'Frontend Developer', 'Build UI components.', '{"HTML", "CSS", "React"}', 1000, 1500, '$', 'Kyiv', 1, 2),
(gen_random_uuid(), (SELECT id FROM companies LIMIT 1 OFFSET 1), (SELECT id FROM recruiters LIMIT 1 OFFSET 1), 'Backend Developer', 'Develop APIs.', '{"Node.js", "SQL"}', 1200, 1700, '$', 'Lviv', 1, 2);
