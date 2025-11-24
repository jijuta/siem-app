# Database Backups

## Latest Backup

- **File**: `siem_db_backup_20251125_000803.sql.gz`
- **Date**: 2025-11-25 00:08:03
- **Size**: 44MB (uncompressed)
- **Database**: siem_db
- **PostgreSQL**: 16.10

## Restore Instructions

```bash
# Unzip backup
gunzip siem_db_backup_20251125_000803.sql.gz

# Restore to database
docker exec -i aisdk_postgres psql -U opensearch -d siem_db < siem_db_backup_20251125_000803.sql

# Or create new database
docker exec -i aisdk_postgres psql -U opensearch -c "CREATE DATABASE siem_db_restored;"
docker exec -i aisdk_postgres psql -U opensearch -d siem_db_restored < siem_db_backup_20251125_000803.sql
```

## Backup Contents

- All tables in `public` schema (13 tables)
- All tables in `siem_app` schema (14 tables)
- Indexes, constraints, triggers
- Functions and sequences
- Data (126 users, 4 companies, 11 departments, etc.)

## Before Database Changes

This backup was created before implementing critical database improvements:
1. Adding FK constraints (users → Company, Department)
2. Removing duplicate role field
3. Integrating dual user tables
