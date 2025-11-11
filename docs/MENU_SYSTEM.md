# Menu Management System Documentation

## Overview

The DeFender X application now features a **database-driven menu management system** that allows dynamic configuration of sidebar navigation without code changes. All menu items, vendor configurations, and navigation structure are stored in PostgreSQL and can be managed through the admin interface.

## Architecture

### Database Schema: `siem_app`

The menu system uses a dedicated PostgreSQL schema (`siem_app`) with the following tables:

#### 1. **menu_categories**
Top-level menu categories (Dashboard, Search, Analytics, etc.)

```sql
- id: Serial primary key
- name: Category name (unique)
- label: JSONB - Multi-language labels {ko, en, ja, zh}
- icon: Lucide React icon name (e.g., 'LayoutDashboard')
- color: Tailwind color class
- order_index: Display order
- is_active: Boolean flag for visibility
- created_at, updated_at: Timestamps
```

#### 2. **menu_items**
Individual menu items with hierarchical structure (supports parent-child relationships)

```sql
- id: Serial primary key
- category_id: Foreign key to menu_categories
- parent_id: Self-referencing foreign key for nested items
- name: Item name
- label: JSONB - Multi-language labels
- href: Navigation path (e.g., '/analytics/sigma-rules')
- icon: Lucide React icon name (optional)
- description: JSONB - Multi-language descriptions
- order_index: Display order within parent/category
- is_active: Boolean flag
- badge: JSONB - Badge configuration {text, variant, show}
- created_at, updated_at: Timestamps
```

#### 3. **vendors**
Security vendor configurations (CrowdStrike, Cortex XDR, etc.)

```sql
- id: Serial primary key
- vendor_id: Unique vendor identifier (e.g., 'crowdstrike')
- name: Full vendor name
- label: JSONB - Multi-language labels
- icon: Lucide React icon name
- color: Tailwind color (red, blue, green, purple, etc.)
- description: JSONB - Multi-language descriptions
- is_active: Boolean flag
- order_index: Display order
- created_at, updated_at: Timestamps
```

#### 4. **vendor_pages**
Sub-pages for each vendor (Detections, Incidents, Hosts, etc.)

```sql
- id: Serial primary key
- vendor_id: Foreign key to vendors
- name: Page name
- label: JSONB - Multi-language labels
- href: Navigation path (e.g., '/crowdstrike/detections')
- order_index: Display order
- is_active: Boolean flag
- created_at, updated_at: Timestamps
```

#### 5. **menu_permissions** (Planned for future)
Role-based access control for menu items

```sql
- id: Serial primary key
- menu_item_id: Foreign key to menu_items
- role: User role (admin, analyst, viewer, etc.)
- can_view: Boolean permission flag
```

### Database Features

- **Automatic Timestamps**: Triggers update `updated_at` on every modification
- **Cascading Deletes**: Deleting a category/vendor removes related items
- **Indexes**: Optimized for `is_active`, `order_index`, and foreign key lookups
- **Multi-Language Support**: JSONB fields store translations for 4 languages (Korean, English, Japanese, Chinese)

## API Routes

### Menu Navigation

**GET `/api/menu/navigation`**
- Returns complete navigation structure
- Response includes categories, menu items (with hierarchy), and vendors with pages
- Used by `SidebarWrapper` component on app startup

### Menu Items

**GET `/api/menu/items`**
- Returns all menu items with hierarchical structure
- Children are nested under parent items

**POST `/api/menu/items`**
- Create a new menu item
- Required fields: `name`, `label`, `href`
- Optional: `category_id`, `parent_id`, `icon`, `order_index`, `badge`

**PUT `/api/menu/items/[id]`**
- Update an existing menu item
- Supports partial updates

**DELETE `/api/menu/items/[id]`**
- Permanently delete a menu item
- Cascades to children if any

### Vendors

**GET `/api/menu/vendors`**
- Returns all vendors with their pages

**POST `/api/menu/vendors`**
- Create a new vendor
- Required: `vendor_id`, `name`, `label`
- Optional: `icon`, `color`, `description`, `order_index`

**PUT `/api/menu/vendors/[id]`**
- Update vendor configuration

**DELETE `/api/menu/vendors/[id]`**
- Soft delete (sets `is_active = false`)

## Frontend Components

### 1. **SidebarWrapper** (Server Component)
- Location: `src/components/sidebar-wrapper.tsx`
- Fetches navigation data from database on server-side
- Converts database format to AppSidebar-compatible format
- Falls back to static `navigation.ts` if database fails
- Passes data to `AppSidebar` as props

### 2. **AppSidebar** (Client Component)
- Location: `src/components/app-sidebar.tsx`
- Modified to accept `navigationData` prop
- Uses prop data or falls back to default navigation
- Renders sidebar with database-driven menus

### 3. **Menu Adapter**
- Location: `src/lib/menu-adapter.ts`
- Converts database structure to AppSidebar format
- Maps icon names to Lucide React components
- Handles multi-language label selection
- Transforms vendor pages to nested children

### 4. **Database Client**
- Location: `src/lib/db-menu.ts`
- PostgreSQL connection pool (max 20 connections)
- Type-safe interfaces for all menu entities
- CRUD functions for all menu operations
- Hierarchical query builders for nested structures

## Admin UI

### Menu Management Page
**Location**: `/admin/menu-management`

**Features**:
- Two tabs: Menu Items and Vendors
- Real-time data fetching and updates
- Actions per row:
  - Toggle active/inactive status (eye icon)
  - Edit item/vendor (edit icon)
  - Delete item (trash icon)
- Add new items/vendors with dialog forms
- Visual status badges (Active/Inactive)
- Vendor page count display

**Access**: Navigate to `http://localhost:50014/admin/menu-management`

## Migration from Static Navigation

The existing `src/lib/navigation.ts` file has been preserved and serves as:
1. **Type definitions** for navigation structure
2. **Fallback** if database is unavailable
3. **Default values** for AppSidebar component

### Migration Script
Location: `sql/seed_menu_data.sql`

This script migrated all data from `navigation.ts` to the database:
- 5 main menu categories
- 11 menu items (including 6 children)
- 8 security vendors
- 79 vendor pages

## Usage Examples

### Adding a New Menu Item

```typescript
// POST /api/menu/items
{
  "name": "Threat Hunting",
  "label": {
    "ko": "위협 헌팅",
    "en": "Threat Hunting",
    "ja": "脅威ハンティング",
    "zh": "威胁猎杀"
  },
  "href": "/threat-hunting",
  "icon": "Target",
  "order_index": 10,
  "badge": {
    "text": "Beta",
    "variant": "secondary",
    "show": true
  }
}
```

### Adding a New Vendor

```typescript
// POST /api/menu/vendors
{
  "vendor_id": "sentinel-one",
  "name": "SentinelOne",
  "label": {
    "ko": "센티넬원",
    "en": "SentinelOne",
    "ja": "SentinelOne",
    "zh": "SentinelOne"
  },
  "icon": "Shield",
  "color": "indigo",
  "description": {
    "ko": "자율 엔드포인트 보안",
    "en": "Autonomous Endpoint Security",
    "ja": "自律エンドポイントセキュリティ",
    "zh": "自主端点安全"
  },
  "order_index": 9
}
```

### Querying Navigation Programmatically

```typescript
import { getNavigationStructure } from '@/lib/db-menu'

const navigation = await getNavigationStructure()
// Returns: { categories, menuItems, vendors }
```

### Toggling Menu Item Visibility

```typescript
// PUT /api/menu/items/5
{
  "is_active": false  // Hide from sidebar
}
```

## Multi-Language Support

All labels and descriptions use JSONB with language codes:
- `ko`: Korean (default)
- `en`: English
- `ja`: Japanese
- `zh`: Chinese

The menu adapter automatically selects the appropriate language based on user preferences (future implementation).

## Performance Considerations

1. **Connection Pooling**: PostgreSQL pool with 20 max connections
2. **Server-Side Rendering**: Navigation fetched once per page load on server
3. **Hierarchical Queries**: Optimized with indexes on `parent_id` and `order_index`
4. **Caching** (future): Consider implementing Redis cache for navigation data
5. **Lazy Loading** (optional): Vendor pages could be loaded on demand

## Future Enhancements

1. **Role-Based Access Control**: Use `menu_permissions` table
2. **Menu Analytics**: Track which menus are most frequently used
3. **A/B Testing**: Test different menu structures
4. **Menu Versioning**: Track changes to menu configuration
5. **Drag-and-Drop Reordering**: Admin UI for visual reordering
6. **Menu Search**: Filter menus in admin UI
7. **Bulk Operations**: Enable/disable multiple items at once
8. **Audit Logging**: Track who changed what and when

## Troubleshooting

### Issue: Sidebar shows old static navigation
**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
pnpm dev
```

### Issue: Database connection errors
**Solution**: Verify DATABASE_URL in `.env.local`
```bash
psql "postgresql://opensearch:opensearch123@localhost:5432/siem_db" -c "\dt siem_app.*"
```

### Issue: Icons not displaying
**Solution**: Ensure icon names match Lucide React exports exactly (case-sensitive)
- Correct: `LayoutDashboard`, `Search`, `Shield`
- Incorrect: `layout-dashboard`, `search`, `shield`

### Issue: Vendor pages not showing
**Solution**: Check `vendor_id` foreign key matches parent vendor
```sql
SELECT v.vendor_id, vp.name, vp.href
FROM siem_app.vendors v
JOIN siem_app.vendor_pages vp ON v.id = vp.vendor_id
WHERE v.vendor_id = 'crowdstrike';
```

## SQL Maintenance Commands

### View all active menus
```sql
SELECT name, href, order_index
FROM siem_app.menu_items
WHERE is_active = true
ORDER BY order_index;
```

### Reorder menu items
```sql
UPDATE siem_app.menu_items
SET order_index = order_index + 1
WHERE category_id = 3;
```

### Add vendor page
```sql
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index)
VALUES (
  (SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'),
  'Live Response',
  '{"ko": "실시간 대응", "en": "Live Response", "ja": "ライブレスポンス", "zh": "实时响应"}',
  '/crowdstrike/live-response',
  14
);
```

### Backup menu configuration
```bash
pg_dump -U opensearch -h localhost -d siem_db -n siem_app -f menu_backup.sql
```

## Security Notes

- **SQL Injection Prevention**: All queries use parameterized statements
- **Input Validation**: API routes validate required fields
- **Access Control**: Admin UI should be protected by authentication (TODO)
- **Schema Isolation**: Uses dedicated `siem_app` schema, separate from `public`
- **Soft Deletes**: Vendors use soft delete to preserve data integrity

## Migration Checklist

When deploying to production:

- [ ] Run `sql/create_menu_system.sql` on production database
- [ ] Run `sql/seed_menu_data.sql` to populate initial data
- [ ] Verify DATABASE_URL in production environment
- [ ] Test all API endpoints with production data
- [ ] Add authentication to `/admin/menu-management` route
- [ ] Monitor PostgreSQL connection pool usage
- [ ] Set up database backups for `siem_app` schema
- [ ] Configure read replicas if needed for high traffic

---

**Last Updated**: 2025-11-12
**Version**: 1.0
**Maintainer**: DeFender X Development Team
