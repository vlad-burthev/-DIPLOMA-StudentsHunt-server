create TABLE IF NOT EXISTS admins(
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')) 
);


