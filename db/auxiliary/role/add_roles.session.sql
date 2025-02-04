

-- ALTER TABLE roles ADD CONSTRAINT roles_role_check 
-- CHECK (role IN ('STUDENT', 'ADMIN', 'SUPERADMIN', 'COMPANY', 'UNIVERSITY', 'RECRUITER', 'HRMANAGER'));


INSERT INTO roles (id, role)
VALUES 
    (1, 'ADMIN'),
    (2, 'STUDENT'),
    (3, 'SUPERADMIN'),
    (4, 'COMPANY'),
    (5, 'UNIVERSITY'),
    (6, 'RECRUITER'),
    (7, 'HRMANAGER');



