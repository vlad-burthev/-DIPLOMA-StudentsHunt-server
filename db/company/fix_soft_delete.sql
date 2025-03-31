-- Add deleted_at column to companies table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE companies ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
    END IF;
END $$;

-- Add trigger for soft delete if it doesn't exist
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS soft_delete_companies ON companies;
CREATE TRIGGER soft_delete_companies
    BEFORE DELETE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION soft_delete(); 