-- ============================================================
-- 시스템 관리 모듈 개선 마이그레이션 롤백
-- 작성일: 2025-11-23
-- 목적: improve_system_admin.sql의 변경사항 되돌리기
-- ============================================================

BEGIN;

-- 1. 트리거 삭제
-- ============================================================

DROP TRIGGER IF EXISTS before_insert_company_code ON "Company";
DROP TRIGGER IF EXISTS before_insert_department_code ON "Department";
DROP TRIGGER IF EXISTS company_audit_trigger ON "Company";
DROP TRIGGER IF EXISTS department_audit_trigger ON "Department";

-- 2. 함수 삭제
-- ============================================================

DROP FUNCTION IF EXISTS set_company_code();
DROP FUNCTION IF EXISTS set_department_code();
DROP FUNCTION IF EXISTS generate_company_code();
DROP FUNCTION IF EXISTS generate_department_code();
DROP FUNCTION IF EXISTS audit_company_changes();
DROP FUNCTION IF EXISTS audit_department_changes();

-- 3. 시퀀스 삭제
-- ============================================================

DROP SEQUENCE IF EXISTS company_code_seq;
DROP SEQUENCE IF EXISTS department_code_seq;

-- 4. 감사 로그 컬럼 제거
-- ============================================================

-- old_values, new_values 컬럼 제거
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app'
      AND table_name = 'audit_logs'
      AND column_name = 'old_values'
  ) THEN
    ALTER TABLE siem_app.audit_logs DROP COLUMN old_values;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app'
      AND table_name = 'audit_logs'
      AND column_name = 'new_values'
  ) THEN
    ALTER TABLE siem_app.audit_logs DROP COLUMN new_values;
  END IF;
END $$;

-- 5. 인덱스 삭제
-- ============================================================

DROP INDEX IF EXISTS siem_app.idx_audit_logs_table_record;
DROP INDEX IF EXISTS siem_app.idx_audit_logs_changed_at;

COMMIT;

-- ============================================================
-- 롤백 완료 메시지
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '===============================================';
  RAISE NOTICE '시스템 관리 모듈 개선 마이그레이션 롤백 완료';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '✓ 모든 트리거 제거됨';
  RAISE NOTICE '✓ 모든 함수 제거됨';
  RAISE NOTICE '✓ 모든 시퀀스 제거됨';
  RAISE NOTICE '✓ 감사 로그 확장 컬럼 제거됨';
  RAISE NOTICE '===============================================';
  RAISE WARNING '주의: 기존 데이터의 코드 값은 그대로 유지됩니다.';
  RAISE WARNING '롤백 후 새로운 회사/부서는 코드를 수동으로 입력해야 합니다.';
  RAISE NOTICE '===============================================';
END $$;
