# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DeFender X** is a next-generation SIEM platform integrating security data from 8 EDR/XDR vendors with AI-powered threat analysis.

**Core Technologies:**
- Next.js 15 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui (New York style)
- OpenSearch 3.5 (security logs) + PostgreSQL 16 (application data)
- NextAuth.js v5 + Vercel AI SDK (6 providers)

**Critical**: This is the main working directory. Parent directory `/www/siem-app/` contains additional documentation.

## Commands

### Development

```bash
# CRITICAL: Always use pnpm, NOT npm
pnpm dev                # Dev server on port 50014 with Turbopack
pnpm build              # Production build
pnpm start              # Production server on port 50014
pnpm lint               # ESLint

# Testing
pnpm test:nl-parser           # Natural language query parser tests
pnpm test:nl-parser:debug     # Debug mode
pnpm examples:nl-parser       # Example queries
```

### Database

```bash
# Direct PostgreSQL access (NO Prisma - uses pg Pool)
psql "postgresql://opensearch:opensearch123@localhost:5432/siem_db"

# Menu management schema
\c siem_db
SET search_path TO siem_app;
\dt  # List tables

# Common queries
SELECT * FROM siem_app.vendors WHERE is_active = true;
SELECT * FROM siem_app.menu_items ORDER BY order_index;
```

### Production (PM2)

```bash
pm2 list                    # View status (READ-ONLY)
pm2 logs siem-dashboard     # View logs
pm2 restart siem-dashboard  # ONLY if explicitly requested

# CRITICAL: NEVER use 'pm2 reset' - it clears important metrics
```

**Production Configuration:**
- Process name: `siem-dashboard`
- Port: 40014 (dev: 50014)
- Domain: https://defenderxs.in-bridge.com
- Working dir: `/www/siem-app/main/`

## Architecture

### Database-Driven Menu System (CRITICAL)

**Navigation is database-driven, NOT hardcoded in TypeScript.**

PostgreSQL `siem_app` schema with 5 tables:
- `menu_categories` - Top-level categories
- `menu_items` - Navigation items (parent-child hierarchy)
- `vendors` - 8 security vendor configurations
- `vendor_pages` - 79 vendor sub-pages
- `menu_permissions` - Role-based access control (ready)

**Key Files:**
- `src/lib/db-menu.ts` - PostgreSQL client (pg Pool, NOT Prisma)
- `src/lib/menu-adapter.ts` - DB-to-UI format converter
- `src/components/sidebar-wrapper.tsx` - Client component fetches menu
- `src/app/admin/menu-management/page.tsx` - Admin UI

**Admin Interface:** `/admin/menu-management`

**Legacy (reference only):** `src/lib/navigation.ts` - Not used in production

### Data Flow

1. **Logs**: 8 vendors → OpenSearch 3.5
2. **Menu Data**: PostgreSQL `siem_app` schema → API → SidebarWrapper
3. **User Data**: PostgreSQL `public` schema (auth, sessions)
4. **AI Queries**: User input → Vercel AI SDK → 6 providers → Streaming response

### Component Architecture

```
Root Layout (app/layout.tsx)
  └─ Providers (Theme, I18n, Sidebar)
      └─ SidebarWrapper (client, fetches from API)
          └─ AppSidebar (renders navigation)
              └─ PageHeader + Page Content
```

**Server Components First:** Default for pages. Use `"use client"` only when interactivity needed.

## Key Development Patterns

### 1. Path Aliases

```typescript
import { getVendors } from '@/lib/db-menu'       // NOT '../lib/db-menu'
import { Button } from '@/components/ui/button'  // NOT '../components/...'
```

### 2. Database Access Pattern

```typescript
// Use db-menu.ts functions
import { getVendors, getMenuItems } from '@/lib/db-menu'

// Or direct pool access
import { pool } from '@/lib/db-menu'
const result = await pool.query('SELECT * FROM siem_app.vendors')
```

**Important:** NO Prisma in this project. Direct PostgreSQL via pg Pool.

### 3. Multi-Language Support (i18n)

4 languages: Korean (ko, default), English (en), Japanese (ja), Chinese (zh)

Database labels stored as JSONB:
```json
{
  "ko": "대시보드",
  "en": "Dashboard",
  "ja": "ダッシュボード",
  "zh": "仪表板"
}
```

Translation files: `public/locales/[lang]/common.json`

### 4. TypeScript Configuration

```typescript
// next.config.ts has these flags (temporary, for development)
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

**Important:** Write proper TypeScript types. These flags should be removed for production.

### 5. Styling with Tailwind CSS 4

Always include dark mode variants:
```tsx
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

**Severity Colors:**
- Critical: `bg-red-500`, `text-red-600`
- High: `bg-orange-500`, `text-orange-600`
- Medium: `bg-yellow-500`, `text-yellow-600`
- Low: `bg-blue-500`, `text-blue-600`

**Vendor Colors:**
- CrowdStrike: Red, Microsoft Defender: Cyan, Cortex XDR: Purple
- Fortinet: Green, Cisco SecureX: Blue, Google Security: Yellow
- Wazuh: Indigo, AWS Security: Orange

## AI Integration

### 3 Main AI Features

1. **AI Copilot** (`/ai-copilot`) - Natural language → OpenSearch DSL
   - API: `/api/ai-copilot/chat`
   - Streaming with Vercel AI SDK `streamText`

2. **AI Report** (`/ibai/report`) - Automated incident analysis
   - Cortex XDR incident → MITRE ATT&CK mapping + CVSS + remediation

3. **AI Test** (`/ibai/test`) - Compare 6 AI providers simultaneously
   - Google Gemini 2.5 (Primary), OpenAI GPT-4, Anthropic Claude 3
   - Groq LLaMA 3.3, NVIDIA NIM, Azure OpenAI

## MCP Integration

11 MCP servers configured in `.mcp.json`:

**Standard (7):**
- `next-devtools`, `shadcn` - Next.js/UI tooling
- `chrome-devtools` - Browser console logs, network monitoring
- `context7` - Up-to-date library docs
- `postgres-siem`, `postgres-n8n` - Database access
- `filesystem` - `/www/ib-poral` (note: path references sibling project)
- `github`, `memory` - Repository ops, persistent memory

**Custom (3):**
- `opensearch` - Security log search (remote: 20.41.120.173:8099)
- `incident-analysis` - Incident statistics/reports (remote: 20.41.120.173:8100)
- `nl-query` - Natural language → OpenSearch converter

## Common Development Workflows

### Adding a New Vendor

**Method 1: Admin UI (Recommended)**
```
Navigate to http://localhost:50014/admin/menu-management
Click "Vendors" tab → Add vendor with name, icon, color
```

**Method 2: API**
```bash
curl -X POST http://localhost:50014/api/menu/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": "sentinel-one",
    "name": "SentinelOne",
    "label": {"ko": "센티넬원", "en": "SentinelOne"},
    "icon": "Shield",
    "color": "indigo"
  }'
```

**Method 3: Direct SQL**
```sql
INSERT INTO siem_app.vendors (vendor_id, name, label, icon, color)
VALUES ('sentinel-one', 'SentinelOne',
  '{"ko": "센티넬원", "en": "SentinelOne"}'::jsonb,
  'Shield', 'indigo');
```

### Adding a New API Route

```typescript
// src/app/api/my-route/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ data: '...' })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({ result: '...' })
}
```

For AI streaming:
```typescript
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(request: Request) {
  const { prompt } = await request.json()
  return streamText({
    model: google('gemini-2.0-flash-exp'),
    prompt
  })
}
```

### Database Schema Changes

**Important:** This project uses **direct SQL migrations**, NOT Prisma.

1. Create migration file: `sql/my_migration.sql`
2. Apply manually:
```bash
psql "postgresql://opensearch:opensearch123@localhost:5432/siem_db" -f sql/my_migration.sql
```
3. Update TypeScript interfaces in `src/lib/db-menu.ts` if needed

## Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://opensearch:opensearch123@localhost:5432/siem_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:50014"
NEXTAUTH_SECRET="..." # Generate: openssl rand -base64 32

# AI Providers (Optional - for AI features)
GOOGLE_GENERATIVE_AI_API_KEY="..."  # Primary provider
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
NVIDIA_API_KEY="nvapi-..."
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="https://etech-openai.openai.azure.com/"

# OAuth (Optional - for multi-login)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
MICROSOFT_TENANT_ID="..."
# Also: Naver, Kakao, Salesforce, Zoom, Facebook
```

## Project Structure

```
/www/siem-app/main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # NextAuth.js
│   │   │   ├── menu/           # Menu management (7 endpoints)
│   │   │   ├── admin/          # Admin operations
│   │   │   └── user/           # User operations
│   │   ├── admin/
│   │   │   └── menu-management/page.tsx  # Menu admin UI
│   │   ├── ai-copilot/         # Natural language queries
│   │   ├── ai-dashboard/       # AI-powered dashboard
│   │   ├── ai-reports/         # Automated reporting
│   │   └── [56+ vendor/feature pages]
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── sidebar-wrapper.tsx # Client component, fetches menu
│   │   ├── app-sidebar.tsx     # Renders navigation
│   │   └── page-header.tsx     # Page headers with breadcrumbs
│   │
│   └── lib/
│       ├── db-menu.ts          # PostgreSQL client (pg Pool)
│       ├── menu-adapter.ts     # DB-to-UI converter
│       ├── i18n.ts             # i18next configuration
│       └── utils.ts            # cn() utility
│
├── sql/                        # Database migrations
│   ├── create_menu_system.sql  # Menu schema
│   ├── seed_menu_data.sql      # Initial data
│   └── migrate_sidebar_menus.sql # Latest menu migration
│
├── public/locales/             # i18n translations
│   ├── ko/common.json          # Korean (default)
│   ├── en/common.json          # English
│   ├── ja/common.json          # Japanese
│   └── zh/common.json          # Chinese
│
├── .mcp.json                   # MCP server configuration (11 servers)
├── package.json                # pnpm scripts
├── next.config.ts              # Next.js configuration
└── README.md                   # Comprehensive documentation
```

## Documentation

**Main Documentation:**
- `README.md` - Comprehensive project overview (23.5KB, 850+ lines)
- `MENU_SYSTEM_SUMMARY.md` - Menu system implementation details
- `IMPLEMENTATION_COMPLETE.md` - Recent changes
- Parent directory: `/www/siem-app/CLAUDE.md` (558 lines, comprehensive)

**SQL Documentation:**
- All `.sql` files in `sql/` directory have inline comments
- Schema documentation in `sql/create_menu_system.sql`

## Important Notes

1. **Package Manager**: Always use `pnpm`, NEVER `npm`
2. **Database Access**: Direct pg Pool, NOT Prisma
3. **Menu System**: Database-driven, edit via `/admin/menu-management` or API
4. **TypeScript**: Write proper types despite `ignoreBuildErrors: true`
5. **Dark Mode**: Required for all styling
6. **Path Aliases**: Use `@/` not relative paths
7. **Server Components**: Default unless interactivity needed
8. **PM2**: Never use `pm2 reset` in production
9. **Production Port**: 40014 (dev: 50014)
10. **Multi-Language**: All user-facing text supports 4 languages

## Port Reference

- **Development**: 50014 (configured in package.json)
- **Production**: 40014 (PM2 process)
- **Domain**: https://defenderxs.in-bridge.com
- **PostgreSQL**: 5432 (localhost)
- **OpenSearch**: 9200 (remote: opensearch:9200)
