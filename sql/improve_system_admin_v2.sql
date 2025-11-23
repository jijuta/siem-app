-- ============================================================
-- 시스템 관리 모듈 개선 마이그레이션 (간소화 버전)
-- 작성일: 2025-11-23
-- 목적: 회사/부서 코드 자동 생성, 감사 로그
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

    -- 중복 검사
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

    -- 중복 검사
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

DROP TRIGGER IF EXISTS before_insert_company_code ON "Company";
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

DROP TRIGGER IF EXISTS before_insert_department_code ON "Department";
CREATE TRIGGER before_insert_department_code
  BEFORE INSERT ON "Department"
  FOR EACH ROW
  EXECUTE FUNCTION set_department_code();

COMMENT ON TRIGGER before_insert_department_code ON "Department" IS '부서 생성 시 코드 자동 부여';

-- 4. 회사 감사 트리거 (기존 menu_audit_log 테이블 활용)
-- ============================================================

CREATE OR REPLACE FUNCTION audit_company_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (
      'Company',
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      current_user
    );
    RETURN OLD;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
      'Company',
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      current_user
    );
    RETURN NEW;

  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES (
      'Company',
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
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

-- 5. 부서 감사 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION audit_department_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES (
      'Department',
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      current_user
    );
    RETURN OLD;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, old_data, new_data, changed_by)
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
    INSERT INTO siem_app.menu_audit_log (table_name, record_id, action, new_data, changed_by)
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

-- 6. 기존 데이터 마이그레이션
-- ============================================================

-- 코드가 비정상적인 회사에 자동 코드 부여
DO $$
DECLARE
  company_record RECORD;
BEGIN
  FOR company_record IN
    SELECT id, code FROM "Company"
    WHERE code IS NULL OR code = '' OR code !~ '^COMP-[0-9]{4}$'
  LOOP
    UPDATE "Company"
    SET code = generate_company_code()
    WHERE id = company_record.id;

    RAISE NOTICE '회사 ID % 코드 업데이트: % -> %',
      company_record.id,
      company_record.code,
      (SELECT code FROM "Company" WHERE id = company_record.id);
  END LOOP;
END $$;

-- 코드가 비정상적인 부서에 자동 코드 부여
DO $$
DECLARE
  dept_record RECORD;
BEGIN
  FOR dept_record IN
    SELECT id, code FROM "Department"
    WHERE code IS NULL OR code = '' OR code !~ '^DEPT-[0-9]{4}$'
  LOOP
    UPDATE "Department"
    SET code = generate_department_code()
    WHERE id = dept_record.id;

    RAISE NOTICE '부서 ID % 코드 업데이트: % -> %',
      dept_record.id,
      dept_record.code,
      (SELECT code FROM "Department" WHERE id = dept_record.id);
  END LOOP;
END $$;

COMMIT;

-- ============================================================
-- 마이그레이션 완료 메시지
-- ============================================================

DO $$
DECLARE
  company_count INTEGER;
  department_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO company_count FROM "Company";
  SELECT COUNT(*) INTO department_count FROM "Department";

  RAISE NOTICE '===============================================';
  RAISE NOTICE '시스템 관리 모듈 개선 마이그레이션 완료';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '✓ 회사 코드 자동 생성 시스템 활성화';
  RAISE NOTICE '✓ 부서 코드 자동 생성 시스템 활성화';
  RAISE NOTICE '✓ 회사/부서 감사 로그 시스템 활성화';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '총 % 개 회사 등록됨', company_count;
  RAISE NOTICE '총 % 개 부서 등록됨', department_count;
  RAISE NOTICE '===============================================';

  -- 샘플 데이터 표시
  IF company_count > 0 THEN
    RAISE NOTICE '회사 코드 샘플: %', (SELECT code FROM "Company" ORDER BY id LIMIT 1);
  END IF;

  IF department_count > 0 THEN
    RAISE NOTICE '부서 코드 샘플: %', (SELECT code FROM "Department" ORDER BY id LIMIT 1);
  END IF;

  RAISE NOTICE '===============================================';
END $$;
