-- Grant permissions for Live Courses tables (V19 migration)
-- Run this in your LOCAL database as postgres user

-- Grant all permissions on the 4 new tables
GRANT ALL PRIVILEGES ON TABLE live_session TO codeless_user;
GRANT ALL PRIVILEGES ON TABLE session_material TO codeless_user;
GRANT ALL PRIVILEGES ON TABLE assignment TO codeless_user;
GRANT ALL PRIVILEGES ON TABLE submission TO codeless_user;

-- Grant permissions on sequences (for auto-increment IDs)
GRANT ALL PRIVILEGES ON SEQUENCE live_session_id_seq TO codeless_user;
GRANT ALL PRIVILEGES ON SEQUENCE session_material_id_seq TO codeless_user;
GRANT ALL PRIVILEGES ON SEQUENCE assignment_id_seq TO codeless_user;
GRANT ALL PRIVILEGES ON SEQUENCE submission_id_seq TO codeless_user;

-- Verify permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('codeless_user', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('codeless_user', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('codeless_user', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('codeless_user', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE tablename IN ('live_session', 'session_material', 'assignment', 'submission')
ORDER BY tablename;

