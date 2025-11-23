-- ============================================================
-- 시스템 관리 모듈 개선 마이그레이션
-- 작성일: 2025-11-23
-- 목적: 자동 코드 생성, 감사 로그 확장
-- ============================================================

BEGIN;

-- 1. 시퀀스 생성
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS company_code_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9999
  CYCLE;

CREATE SEQUENCE IF NOT EXISTS department_code_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9999
  CYCLE;

COMMENT ON SEQUENCE company_code_seq IS '회사 코드 자동 생성 시퀀스 (COMP-0001 ~ COMP-9999)';
COMMENT ON SEQUENCE department_code_seq IS '부서 코드 자동 생성 시퀀스 (DEPT-0001 ~ DEPT-9999)';

-- 2. 코드 생성 함수
-- ============================================================

CREATE OR REPLACE FUNCTION generate_company_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  seq_num INTEGER;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    seq_num := nextval('company_code_seq');
    new_code := 'COMP-' || LPAD(seq_num::TEXT, 4, '0');

    -- 중복 검사 (만약을 위해)
    IF NOT EXISTS (SELECT 1 FROM "Company" WHERE code = new_code) THEN
      RETURN new_code;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique company code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_company_code() IS '고유한 회사 코드 자동 생성 (형식: COMP-0001)';

CREATE OR REPLACE FUNCTION generate_department_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  seq_num INTEGER;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    seq_num := nextval('department_code_seq');
    new_code := 'DEPT-' || LPAD(seq_num::TEXT, 4, '0');

    -- 중복 검사 (만약을 위해)
    IF NOT EXISTS (SELECT 1 FROM "Department" WHERE code = new_code) THEN
      RETURN new_code;
    END IF;

    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique department code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_department_code() IS '고유한 부서 코드 자동 생성 (형식: DEPT-0001)';

-- 3. 자동 코드 생성 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION set_company_code()
RETURNS TRIGGER AS $$
BEGIN
  -- 코드가 NULL이거나 빈 문자열인 경우만 자동 생성
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_company_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_company_code
  BEFORE INSERT ON "Company"
  FOR EACH ROW
  EXECUTE FUNCTION set_company_code();

COMMENT ON TRIGGER before_insert_company_code ON "Company" IS '회사 생성 시 코드 자동 부여';

CREATE OR REPLACE FUNCTION set_department_code()
RETURNS TRIGGER AS $$
BEGIN
  -- 코드가 NULL이거나 빈 문자열인 경우만 자동 생성
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_department_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_department_code
  BEFORE INSERT ON "Department"
  FOR EACH ROW
  EXECUTE FUNCTION set_department_code();

COMMENT ON TRIGGER before_insert_department_code ON "Department" IS '부서 생성 시 코드 자동 부여';

-- 4. 감사 로그 테이블 확장
-- ============================================================

-- old_values, new_values 컬럼 추가 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app'
      AND table_name = 'audit_logs'
      AND column_name = 'old_values'
  ) THEN
    ALTER TABLE siem_app.audit_logs ADD COLUMN old_values JSONB;
    COMMENT ON COLUMN siem_app.audit_logs.old_values IS '변경 전 레코드 값 (JSON)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'siem_app'
      AND table_name = 'audit_logs'
      AND column_name = 'new_values'
  ) THEN
    ALTER TABLE siem_app.audit_logs ADD COLUMN new_values JSONB;
    COMMENT ON COLUMN siem_app.audit_logs.new_values IS '변경 후 레코드 값 (JSON)';
  END IF;
END $$;

-- 5. 회사 감사 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION audit_company_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (
      'Company',
      OLD.id,
      'DELETE',
      to_jsonb(OLD) - 'password_hash',  -- 민감 정보 제외
      current_user
    );
    RETURN OLD;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
      'Company',
      NEW.id,
      'UPDATE',
      to_jsonb(OLD) - 'password_hash',
      to_jsonb(NEW) - 'password_hash',
      current_user
    );
    RETURN NEW;

  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (
      'Company',
      NEW.id,
      'INSERT',
      to_jsonb(NEW) - 'password_hash',
      current_user
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS company_audit_trigger ON "Company";
CREATE TRIGGER company_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON "Company"
  FOR EACH ROW
  EXECUTE FUNCTION audit_company_changes();

COMMENT ON TRIGGER company_audit_trigger ON "Company" IS '회사 변경 사항 감사 로그 기록';

-- 6. 부서 감사 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION audit_department_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES (
      'Department',
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      current_user
    );
    RETURN OLD;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
      'Department',
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      current_user
    );
    RETURN NEW;

  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES (
      'Department',
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      current_user
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS department_audit_trigger ON "Department";
CREATE TRIGGER department_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON "Department"
  FOR EACH ROW
  EXECUTE FUNCTION audit_department_changes();

COMMENT ON TRIGGER department_audit_trigger ON "Department" IS '부서 변경 사항 감사 로그 기록';

-- 7. 기존 데이터 마이그레이션
-- ============================================================

-- 코드가 없는 회사에 자동 코드 부여
UPDATE "Company"
SET code = generate_company_code()
WHERE code IS NULL OR code = '';

-- 코드가 없는 부서에 자동 코드 부여
UPDATE "Department"
SET code = generate_department_code()
WHERE code IS NULL OR code = '';

-- 8. 인덱스 생성 (성능 최적화)
-- ============================================================

-- 감사 로그 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record
  ON siem_app.audit_logs (table_name, record_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at
  ON siem_app.audit_logs (changed_at DESC);

COMMENT ON INDEX idx_audit_logs_table_record IS '특정 테이블/레코드의 감사 로그 빠른 조회';
COMMENT ON INDEX idx_audit_logs_changed_at IS '최근 감사 로그 시간순 조회';

COMMIT;

-- ============================================================
-- 마이그레이션 완료 메시지
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '===============================================';
  RAISE NOTICE '시스템 관리 모듈 개선 마이그레이션 완료';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '✓ 회사 코드 자동 생성 시스템 활성화';
  RAISE NOTICE '✓ 부서 코드 자동 생성 시스템 활성화';
  RAISE NOTICE '✓ 회사/부서 감사 로그 시스템 활성화';
  RAISE NOTICE '✓ 기존 데이터 코드 자동 부여 완료';
  RAISE NOTICE '===============================================';

  -- 생성된 코드 샘플 표시
  RAISE NOTICE '회사 코드 샘플: %', (SELECT code FROM "Company" LIMIT 1);
  RAISE NOTICE '부서 코드 샘플: %', (SELECT code FROM "Department" LIMIT 1);
  RAISE NOTICE '===============================================';
END $$;
