
-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_universities_updated_at
--     BEFORE UPDATE ON universities
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiters_updated_at
    BEFORE UPDATE ON recruiters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at
    BEFORE UPDATE ON vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for soft delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER soft_delete_students
    BEFORE DELETE ON students
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_companies
    BEFORE DELETE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

-- CREATE TRIGGER soft_delete_universities
--     BEFORE DELETE ON universities
--     FOR EACH ROW
--     EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_recruiters
    BEFORE DELETE ON recruiters
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete();

CREATE TRIGGER soft_delete_vacancies
    BEFORE DELETE ON vacancies
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete(); 