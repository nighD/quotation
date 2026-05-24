-- ============================================================
-- SQL Script: create_admin.sql
-- Description: Creates an admin account and assigns the admin role
-- ============================================================

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    admin_role_id UUID;
BEGIN
    -- 1. Check if user already exists to avoid unique constraint violations
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@quotation.com') THEN
        -- 2. Insert the admin user with pre-generated bcrypt hash for 'admin@quotation'
        INSERT INTO users (id, email, password, full_name, auth_provider, status)
        VALUES (
            new_user_id, 
            'admin@quotation.com', 
            '$2a$10$K8.iQeiCMI59Y6LwOuH2aejrDSis0gMAphoGogxCxBhGRCsP30ERW', 
            'Admin User', 
            'email', 
            'active'
        );
        
        -- 3. Get the ID of the 'admin' role
        SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
        
        -- 4. Assign the role to the user
        IF admin_role_id IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role_id)
            VALUES (new_user_id, admin_role_id);
            RAISE NOTICE 'Admin user created successfully and role assigned.';
        ELSE
            RAISE NOTICE 'Admin user created, but "admin" role was not found in the roles table.';
        END IF;
    ELSE
        RAISE NOTICE 'User admin@quotation.com already exists.';
    END IF;
END $$;
