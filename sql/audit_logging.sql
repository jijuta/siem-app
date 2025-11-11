-- Audit Logging System for Menu Changes
-- Tracks all CRUD operations on menu system

-- Audit log table
CREATE TABLE IF NOT EXISTS siem_app.menu_audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL, -- 'menu_items', 'vendors', etc.
    record_id INTEGER NOT NULL, -- ID of the affected record
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB, -- Previous state (for UPDATE/DELETE)
    new_data JSONB, -- New state (for INSERT/UPDATE)
    changed_by VARCHAR(255), -- User who made the change
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET, -- IP address of the requester
    user_agent TEXT, -- Browser/client info
    changes JSONB -- Specific fields that changed
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON siem_app.menu_audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON siem_app.menu_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON siem_app.menu_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_by ON siem_app.menu_audit_log(changed_by);

-- Function to log menu item changes
CREATE OR REPLACE FUNCTION siem_app.log_menu_item_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, new_data)
        VALUES ('menu_items', NEW.id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, new_data)
        VALUES ('menu_items', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data)
        VALUES ('menu_items', OLD.id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log vendor changes
CREATE OR REPLACE FUNCTION siem_app.log_vendor_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, new_data)
        VALUES ('vendors', NEW.id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, new_data)
        VALUES ('vendors', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data)
        VALUES ('vendors', OLD.id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log vendor page changes
CREATE OR REPLACE FUNCTION siem_app.log_vendor_page_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, new_data)
        VALUES ('vendor_pages', NEW.id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, new_data)
        VALUES ('vendor_pages', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data)
        VALUES ('vendor_pages', OLD.id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers to tables
DROP TRIGGER IF EXISTS menu_items_audit_trigger ON siem_app.menu_items;
CREATE TRIGGER menu_items_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON siem_app.menu_items
    FOR EACH ROW EXECUTE FUNCTION siem_app.log_menu_item_changes();

DROP TRIGGER IF EXISTS vendors_audit_trigger ON siem_app.vendors;
CREATE TRIGGER vendors_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON siem_app.vendors
    FOR EACH ROW EXECUTE FUNCTION siem_app.log_vendor_changes();

DROP TRIGGER IF EXISTS vendor_pages_audit_trigger ON siem_app.vendor_pages;
CREATE TRIGGER vendor_pages_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON siem_app.vendor_pages
    FOR EACH ROW EXECUTE FUNCTION siem_app.log_vendor_page_changes();

-- View for recent changes
CREATE OR REPLACE VIEW siem_app.recent_menu_changes AS
SELECT
    id,
    table_name,
    record_id,
    action,
    changed_by,
    changed_at,
    CASE
        WHEN action = 'INSERT' THEN new_data->>'name'
        WHEN action = 'UPDATE' THEN new_data->>'name'
        WHEN action = 'DELETE' THEN old_data->>'name'
    END as item_name,
    CASE
        WHEN action = 'UPDATE' THEN
            (SELECT jsonb_object_agg(key, value)
             FROM jsonb_each(new_data)
             WHERE new_data->key IS DISTINCT FROM old_data->key)
    END as changes
FROM siem_app.menu_audit_log
ORDER BY changed_at DESC
LIMIT 100;

COMMENT ON TABLE siem_app.menu_audit_log IS 'Audit trail for all menu system changes';
COMMENT ON VIEW siem_app.recent_menu_changes IS 'View of recent menu changes with simplified output';
