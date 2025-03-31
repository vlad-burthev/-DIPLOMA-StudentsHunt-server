-- Add is_active column to companies table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'is_activated'
    ) THEN
        ALTER TABLE companies ADD COLUMN is_activated BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing companies to be active by default
UPDATE companies SET is_activated = true WHERE is_activated IS NULL; 
