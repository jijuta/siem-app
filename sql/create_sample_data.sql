-- ============================================================
-- 샘플 데이터 생성 스크립트
-- 작성일: 2025-11-23
-- 목적: 회사 → 부서(계층 구조) → 사용자 샘플 데이터 생성
-- ============================================================

BEGIN;

-- ============================================================
-- 1. 샘플 회사 데이터 생성 (코드는 자동 생성됨)
-- ============================================================

DO $$
DECLARE
  company1_id INT;
  company2_id INT;
  company3_id INT;

  -- 부서 IDs
  it_dept_id INT;
  dev_team_id INT;
  qa_team_id INT;
  hr_dept_id INT;
  sales_dept_id INT;

  marketing_dept_id INT;
  digital_team_id INT;
  content_team_id INT;

  research_dept_id INT;
  ai_team_id INT;

BEGIN
  -- Company 1: 에티버스
  INSERT INTO "Company" (name, description, address, phone, email, website, is_active)
  VALUES (
    '{"ko": "에티버스", "en": "Etibus", "ja": "エティバス", "zh": "艾蒂巴斯"}'::jsonb,
    '{"ko": "클라우드 보안 솔루션 전문 기업", "en": "Cloud Security Solutions Provider", "ja": "クラウドセキュリティソリューション専門企業", "zh": "云安全解决方案专业企业"}'::jsonb,
    '서울특별시 강남구 테헤란로 123',
    '02-1234-5678',
    'contact@etibus.com',
    'https://etibus.com',
    true
  ) RETURNING id INTO company1_id;

  -- Company 2: 인브릿지
  INSERT INTO "Company" (name, description, address, phone, email, website, is_active)
  VALUES (
    '{"ko": "인브릿지", "en": "In-Bridge", "ja": "インブリッジ", "zh": "因布里奇"}'::jsonb,
    '{"ko": "보안 통합 관제 플랫폼 개발사", "en": "Integrated Security Monitoring Platform Developer", "ja": "セキュリティ統合監視プラットフォーム開発会社", "zh": "安全综合管控平台开发商"}'::jsonb,
    '서울특별시 서초구 서초대로 456',
    '02-2345-6789',
    'info@inbridge.co.kr',
    'https://inbridge.co.kr',
    true
  ) RETURNING id INTO company2_id;

  -- Company 3: 윤소프트
  INSERT INTO "Company" (name, description, address, phone, email, website, is_active)
  VALUES (
    '{"ko": "윤소프트", "en": "YoonSoft", "ja": "ユーンソフト", "zh": "尹软件"}'::jsonb,
    '{"ko": "AI 기반 위협 인텔리전스 솔루션", "en": "AI-Powered Threat Intelligence Solutions", "ja": "AI基盤脅威インテリジェンスソリューション", "zh": "基于AI的威胁情报解决方案"}'::jsonb,
    '경기도 성남시 분당구 판교역로 789',
    '031-3456-7890',
    'hello@yoonsoft.com',
    'https://yoonsoft.com',
    true
  ) RETURNING id INTO company3_id;

  RAISE NOTICE '✓ 3개 회사 생성 완료';
  RAISE NOTICE '  - 에티버스 (ID: %)', company1_id;
  RAISE NOTICE '  - 인브릿지 (ID: %)', company2_id;
  RAISE NOTICE '  - 윤소프트 (ID: %)', company3_id;

  -- ============================================================
  -- 2. Company 1 (에티버스) 부서 구조
  -- ============================================================

  -- IT 부문
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company1_id,
    NULL,
    '{"ko": "IT부문", "en": "IT Division", "ja": "IT部門", "zh": "IT部门"}'::jsonb,
    '{"ko": "정보기술 총괄", "en": "Information Technology", "ja": "情報技術統括", "zh": "信息技术总部"}'::jsonb,
    0,
    '/'
  ) RETURNING id INTO it_dept_id;

  UPDATE "Department" SET path = '/' || it_dept_id WHERE id = it_dept_id;

  -- 개발팀 (IT 부문 하위)
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company1_id,
    it_dept_id,
    '{"ko": "개발팀", "en": "Development Team", "ja": "開発チーム", "zh": "开发团队"}'::jsonb,
    '{"ko": "소프트웨어 개발", "en": "Software Development", "ja": "ソフトウェア開発", "zh": "软件开发"}'::jsonb,
    1,
    '/'
  ) RETURNING id INTO dev_team_id;

  UPDATE "Department" SET path = '/' || it_dept_id || '/' || dev_team_id WHERE id = dev_team_id;

  -- QA팀 (IT 부문 하위)
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company1_id,
    it_dept_id,
    '{"ko": "QA팀", "en": "QA Team", "ja": "QAチーム", "zh": "质量保证团队"}'::jsonb,
    '{"ko": "품질 보증", "en": "Quality Assurance", "ja": "品質保証", "zh": "质量保证"}'::jsonb,
    1,
    '/'
  ) RETURNING id INTO qa_team_id;

  UPDATE "Department" SET path = '/' || it_dept_id || '/' || qa_team_id WHERE id = qa_team_id;

  -- HR 부문
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company1_id,
    NULL,
    '{"ko": "인사부", "en": "HR Department", "ja": "人事部", "zh": "人力资源部"}'::jsonb,
    '{"ko": "인적자원 관리", "en": "Human Resources", "ja": "人的資源管理", "zh": "人力资源管理"}'::jsonb,
    0,
    '/'
  ) RETURNING id INTO hr_dept_id;

  UPDATE "Department" SET path = '/' || hr_dept_id WHERE id = hr_dept_id;

  -- 영업부
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company1_id,
    NULL,
    '{"ko": "영업부", "en": "Sales Department", "ja": "営業部", "zh": "销售部"}'::jsonb,
    '{"ko": "영업 및 고객 관리", "en": "Sales and Customer Management", "ja": "営業および顧客管理", "zh": "销售和客户管理"}'::jsonb,
    0,
    '/'
  ) RETURNING id INTO sales_dept_id;

  UPDATE "Department" SET path = '/' || sales_dept_id WHERE id = sales_dept_id;

  RAISE NOTICE '✓ 에티버스 부서 5개 생성 완료 (IT부문 + 개발팀 + QA팀 + 인사부 + 영업부)';

  -- ============================================================
  -- 3. Company 2 (인브릿지) 부서 구조
  -- ============================================================

  -- 마케팅부문
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company2_id,
    NULL,
    '{"ko": "마케팅부문", "en": "Marketing Division", "ja": "マーケティング部門", "zh": "营销部门"}'::jsonb,
    '{"ko": "마케팅 및 홍보", "en": "Marketing and PR", "ja": "マーケティングおよび広報", "zh": "营销和公关"}'::jsonb,
    0,
    '/'
  ) RETURNING id INTO marketing_dept_id;

  UPDATE "Department" SET path = '/' || marketing_dept_id WHERE id = marketing_dept_id;

  -- 디지털마케팅팀 (마케팅부문 하위)
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company2_id,
    marketing_dept_id,
    '{"ko": "디지털마케팅팀", "en": "Digital Marketing Team", "ja": "デジタルマーケティングチーム", "zh": "数字营销团队"}'::jsonb,
    '{"ko": "온라인 마케팅", "en": "Online Marketing", "ja": "オンラインマーケティング", "zh": "在线营销"}'::jsonb,
    1,
    '/'
  ) RETURNING id INTO digital_team_id;

  UPDATE "Department" SET path = '/' || marketing_dept_id || '/' || digital_team_id WHERE id = digital_team_id;

  -- 콘텐츠팀 (마케팅부문 하위)
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company2_id,
    marketing_dept_id,
    '{"ko": "콘텐츠팀", "en": "Content Team", "ja": "コンテンツチーム", "zh": "内容团队"}'::jsonb,
    '{"ko": "콘텐츠 제작 및 관리", "en": "Content Creation and Management", "ja": "コンテンツ制作および管理", "zh": "内容创作和管理"}'::jsonb,
    1,
    '/'
  ) RETURNING id INTO content_team_id;

  UPDATE "Department" SET path = '/' || marketing_dept_id || '/' || content_team_id WHERE id = content_team_id;

  RAISE NOTICE '✓ 인브릿지 부서 3개 생성 완료 (마케팅부문 + 디지털마케팅팀 + 콘텐츠팀)';

  -- ============================================================
  -- 4. Company 3 (윤소프트) 부서 구조
  -- ============================================================

  -- 연구개발본부
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company3_id,
    NULL,
    '{"ko": "연구개발본부", "en": "R&D Division", "ja": "研究開発本部", "zh": "研发总部"}'::jsonb,
    '{"ko": "연구 및 개발", "en": "Research and Development", "ja": "研究および開発", "zh": "研究和开发"}'::jsonb,
    0,
    '/'
  ) RETURNING id INTO research_dept_id;

  UPDATE "Department" SET path = '/' || research_dept_id WHERE id = research_dept_id;

  -- AI연구팀 (연구개발본부 하위)
  INSERT INTO "Department" (company_id, parent_id, name, description, level, path)
  VALUES (
    company3_id,
    research_dept_id,
    '{"ko": "AI연구팀", "en": "AI Research Team", "ja": "AI研究チーム", "zh": "AI研究团队"}'::jsonb,
    '{"ko": "인공지능 연구", "en": "Artificial Intelligence Research", "ja": "人工知能研究", "zh": "人工智能研究"}'::jsonb,
    1,
    '/'
  ) RETURNING id INTO ai_team_id;

  UPDATE "Department" SET path = '/' || research_dept_id || '/' || ai_team_id WHERE id = ai_team_id;

  RAISE NOTICE '✓ 윤소프트 부서 2개 생성 완료 (연구개발본부 + AI연구팀)';

  -- ============================================================
  -- 5. 사용자 데이터 생성
  -- ============================================================

  -- Company 1 (에티버스) 사용자
  INSERT INTO siem_app.users (email, name, password_hash, role, company_id, department_id, phone, is_active, email_verified)
  VALUES
    ('cto@etibus.com', 'John Kim', '$2a$10$dummyhashedpassword1', 'admin', company1_id, it_dept_id, '010-1111-1111', true, true),
    ('dev1@etibus.com', 'Sarah Lee', '$2a$10$dummyhashedpassword2', 'editor', company1_id, dev_team_id, '010-1111-2222', true, true),
    ('dev2@etibus.com', 'Mike Park', '$2a$10$dummyhashedpassword3', 'editor', company1_id, dev_team_id, '010-1111-3333', true, true),
    ('qa1@etibus.com', 'Emily Choi', '$2a$10$dummyhashedpassword4', 'viewer', company1_id, qa_team_id, '010-1111-4444', true, true),
    ('hr1@etibus.com', 'David Jung', '$2a$10$dummyhashedpassword5', 'editor', company1_id, hr_dept_id, '010-1111-5555', true, true),
    ('sales1@etibus.com', 'Lisa Kang', '$2a$10$dummyhashedpassword6', 'viewer', company1_id, sales_dept_id, '010-1111-6666', true, true);

  -- Company 2 (인브릿지) 사용자
  INSERT INTO siem_app.users (email, name, password_hash, role, company_id, department_id, phone, is_active, email_verified)
  VALUES
    ('cmo@inbridge.co.kr', 'Anna Yoon', '$2a$10$dummyhashedpassword7', 'admin', company2_id, marketing_dept_id, '010-2222-1111', true, true),
    ('digital1@inbridge.co.kr', 'Tom Han', '$2a$10$dummyhashedpassword8', 'editor', company2_id, digital_team_id, '010-2222-2222', true, true),
    ('content1@inbridge.co.kr', 'Grace Shin', '$2a$10$dummyhashedpassword9', 'editor', company2_id, content_team_id, '010-2222-3333', true, true),
    ('content2@inbridge.co.kr', 'Kevin Oh', '$2a$10$dummyhashedpassword10', 'viewer', company2_id, content_team_id, '010-2222-4444', true, true);

  -- Company 3 (윤소프트) 사용자
  INSERT INTO siem_app.users (email, name, password_hash, role, company_id, department_id, phone, is_active, email_verified)
  VALUES
    ('ceo@yoonsoft.com', 'James Yoon', '$2a$10$dummyhashedpassword11', 'admin', company3_id, research_dept_id, '010-3333-1111', true, true),
    ('ai1@yoonsoft.com', 'Sophie Lim', '$2a$10$dummyhashedpassword12', 'editor', company3_id, ai_team_id, '010-3333-2222', true, true),
    ('ai2@yoonsoft.com', 'Brian Jang', '$2a$10$dummyhashedpassword13', 'editor', company3_id, ai_team_id, '010-3333-3333', true, true),
    ('ai3@yoonsoft.com', 'Rachel Moon', '$2a$10$dummyhashedpassword14', 'viewer', company3_id, ai_team_id, '010-3333-4444', true, true);

  RAISE NOTICE '✓ 사용자 14명 생성 완료';
  RAISE NOTICE '  - 에티버스: 6명 (CTO, 개발자2, QA1, HR1, 영업1)';
  RAISE NOTICE '  - 인브릿지: 4명 (CMO, 디지털마케터1, 콘텐츠2)';
  RAISE NOTICE '  - 윤소프트: 4명 (CEO, AI연구원3)';

END $$;

COMMIT;

-- ============================================================
-- 데이터 확인 쿼리
-- ============================================================

DO $$
DECLARE
  company_count INT;
  dept_count INT;
  user_count INT;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO company_count FROM "Company";
  SELECT COUNT(*) INTO dept_count FROM "Department";
  SELECT COUNT(*) INTO user_count FROM siem_app.users WHERE company_id IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '샘플 데이터 생성 완료!';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '총 % 개 회사', company_count;
  RAISE NOTICE '총 % 개 부서 (계층 구조 포함)', dept_count;
  RAISE NOTICE '총 % 명 사용자', user_count;
  RAISE NOTICE '===============================================';
  RAISE NOTICE '';
  RAISE NOTICE '회사별 코드:';

  FOR rec IN
    SELECT code, name->>'ko' as name_ko FROM "Company" ORDER BY id
  LOOP
    RAISE NOTICE '  - % (%)', rec.name_ko, rec.code;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '부서별 코드 (최대 5개):';

  FOR rec IN
    SELECT code, name->>'ko' as name_ko, level FROM "Department" ORDER BY company_id, level, id LIMIT 5
  LOOP
    RAISE NOTICE '  - % (%) - Level %', rec.name_ko, rec.code, rec.level;
  END LOOP;

  RAISE NOTICE '===============================================';
END $$;
