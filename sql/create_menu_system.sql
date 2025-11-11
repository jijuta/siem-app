-- Create menu management system in siem_app schema
-- This system allows dynamic sidebar menu configuration from database

-- Main menu categories (top-level items)
CREATE TABLE IF NOT EXISTS siem_app.menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    label JSONB NOT NULL, -- {ko: "대시보드", en: "Dashboard", ja: "ダッシュボード", zh: "仪表板"}
    icon VARCHAR(50), -- lucide-react icon name (e.g., 'Home', 'Search', 'Shield')
    color VARCHAR(50), -- Tailwind color (e.g., 'red', 'blue', 'purple')
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items (can be nested under categories)
CREATE TABLE IF NOT EXISTS siem_app.menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES siem_app.menu_categories(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES siem_app.menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label JSONB NOT NULL, -- Multi-language labels
    href VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    description JSONB, -- Multi-language descriptions
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    badge JSONB, -- {text: "New", variant: "default", show: true}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu permissions (role-based access control)
CREATE TABLE IF NOT EXISTS siem_app.menu_permissions (
    id SERIAL PRIMARY KEY,
    menu_item_id INTEGER REFERENCES siem_app.menu_items(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'admin', 'user', 'analyst', 'viewer'
    can_view BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor configurations (for 8 security vendors)
CREATE TABLE IF NOT EXISTS siem_app.vendors (
    id SERIAL PRIMARY KEY,
    vendor_id VARCHAR(50) UNIQUE NOT NULL, -- 'crowdstrike', 'cortex', 'microsoft', etc.
    name VARCHAR(100) NOT NULL,
    label JSONB NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(50),
    description JSONB,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor sub-pages (e.g., detections, incidents, hosts)
CREATE TABLE IF NOT EXISTS siem_app.vendor_pages (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES siem_app.vendors(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    label JSONB NOT NULL,
    href VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_categories_active ON siem_app.menu_categories(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON siem_app.menu_items(category_id, order_index);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON siem_app.menu_items(parent_id, order_index);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_item ON siem_app.menu_permissions(menu_item_id, role);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON siem_app.vendors(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_vendor_pages_vendor ON siem_app.vendor_pages(vendor_id, order_index);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION siem_app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON siem_app.menu_categories
    FOR EACH ROW EXECUTE FUNCTION siem_app.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON siem_app.menu_items
    FOR EACH ROW EXECUTE FUNCTION siem_app.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON siem_app.vendors
    FOR EACH ROW EXECUTE FUNCTION siem_app.update_updated_at_column();

CREATE TRIGGER update_vendor_pages_updated_at BEFORE UPDATE ON siem_app.vendor_pages
    FOR EACH ROW EXECUTE FUNCTION siem_app.update_updated_at_column();

COMMENT ON TABLE siem_app.menu_categories IS 'Top-level menu categories (Dashboard, Search, Analytics, etc.)';
COMMENT ON TABLE siem_app.menu_items IS 'Menu items and sub-items with hierarchical structure';
COMMENT ON TABLE siem_app.menu_permissions IS 'Role-based access control for menu items';
COMMENT ON TABLE siem_app.vendors IS 'Security vendor configurations (CrowdStrike, Cortex, etc.)';
COMMENT ON TABLE siem_app.vendor_pages IS 'Sub-pages for each vendor';
