-- Migrate existing sidebar menu groups to database
-- Enterprise-grade menu structure with proper grouping

-- 1. Main Navigation Group (주요 대시보드)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('main_dashboard', '{"ko": "주요 대시보드", "en": "Main Dashboard", "ja": "メインダッシュボード", "zh": "主仪表板"}'::jsonb, 'Layers', 10);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'integrated_dashboard', '{"ko": "통합 대시보드", "en": "Integrated Dashboard"}'::jsonb, '/integrated-dashboard', 'Layers', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'tenant_monitoring', '{"ko": "테넌트 모니터링", "en": "Tenant Monitoring"}'::jsonb, '/tenant-monitoring', 'Activity', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'vendor_dashboard', '{"ko": "벤더 대시보드", "en": "Vendor Dashboard"}'::jsonb, '/dashboard', 'Layers', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'incidents', '{"ko": "인시던트", "en": "Incidents"}'::jsonb, '/', 'Home', 4),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'cases', '{"ko": "케이스 관리", "en": "Case Management"}'::jsonb, '/cases', 'FileText', 5),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'endpoints', '{"ko": "엔드포인트", "en": "Endpoints"}'::jsonb, '/endpoints', 'Cpu', 6),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'vulnerabilities', '{"ko": "취약점", "en": "Vulnerabilities"}'::jsonb, '/vulnerabilities', 'AlertTriangle', 7),
((SELECT id FROM siem_app.menu_categories WHERE name = 'main_dashboard'), 'assets', '{"ko": "자산관리", "en": "Asset Management"}'::jsonb, '/assets', 'Database', 8);

-- 2. AI Monitoring Group (AI 보안 모니터링)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('ai_monitoring', '{"ko": "AI 보안 모니터링", "en": "AI Security Monitoring", "ja": "AIセキュリティ監視", "zh": "AI安全监控"}'::jsonb, 'Brain', 20);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'ai_dashboard', '{"ko": "AI 대시보드", "en": "AI Dashboard"}'::jsonb, '/ai-dashboard', 'Layers', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'ai_copilot', '{"ko": "AI Copilot", "en": "AI Copilot"}'::jsonb, '/ai-copilot', 'Brain', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'autonomous_soc', '{"ko": "Autonomous SOC", "en": "Autonomous SOC"}'::jsonb, '/autonomous-soc', 'Activity', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'threat_intelligence', '{"ko": "위협 인텔리전스", "en": "Threat Intelligence"}'::jsonb, '/threat-intelligence', 'Shield', 4),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'ueba', '{"ko": "행동 분석 (UEBA)", "en": "Behavioral Analytics (UEBA)"}'::jsonb, '/behavioral-analytics', 'Users', 5),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'security_posture', '{"ko": "보안 태세 관리", "en": "Security Posture Management"}'::jsonb, '/security-posture', 'TrendingUp', 6),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'ai_reports', '{"ko": "AI 리포트", "en": "AI Reports"}'::jsonb, '/ai-reports', 'FileText', 7),
((SELECT id FROM siem_app.menu_categories WHERE name = 'ai_monitoring'), 'ai_assistant', '{"ko": "AI Assistant", "en": "AI Assistant"}'::jsonb, '/ai-assistant', 'Brain', 8);

-- 3. Agent Ecosystem Group (에이전트 생태계)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('agent_ecosystem', '{"ko": "에이전트 생태계", "en": "Agent Ecosystem", "ja": "エージェントエコシステム", "zh": "代理生态系统"}'::jsonb, 'Workflow', 30);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'agent_ecosystem'), 'mcp_marketplace', '{"ko": "MCP 마켓플레이스", "en": "MCP Marketplace"}'::jsonb, '/mcp-marketplace', 'Store', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'agent_ecosystem'), 'a2a_network', '{"ko": "A2A 에이전트 네트워크", "en": "A2A Agent Network"}'::jsonb, '/a2a-network', 'Workflow', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'agent_ecosystem'), 'graph_correlation', '{"ko": "그래프 상관분석", "en": "Graph Correlation"}'::jsonb, '/graph-correlation', 'GitBranch', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'agent_ecosystem'), 'tenant_analytics', '{"ko": "테넌트 분석", "en": "Tenant Analytics"}'::jsonb, '/tenant-analytics', 'Building2', 4);

-- 4. Tenant Management Group (테넌트 관리)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('tenant_management', '{"ko": "테넌트 관리", "en": "Tenant Management", "ja": "テナント管理", "zh": "租户管理"}'::jsonb, 'Building2', 40);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'tenant_management'), 'tenant_list', '{"ko": "테넌트 목록", "en": "Tenant List"}'::jsonb, '/tenants', 'Building2', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'tenant_management'), 'vendor_mapping', '{"ko": "벤더 매핑", "en": "Vendor Mapping"}'::jsonb, '/tenant-vendors', 'Network', 2);

-- 5. Threat Intelligence Group (위협 인텔리전스)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('threat_intel', '{"ko": "위협 인텔리전스", "en": "Threat Intelligence", "ja": "脅威インテリジェンス", "zh": "威胁情报"}'::jsonb, 'Shield', 50);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'threat_intel'), 'ioc_management', '{"ko": "IoC 관리", "en": "IoC Management"}'::jsonb, '/ioc', 'Activity', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'threat_intel'), 'apt_groups', '{"ko": "APT 그룹", "en": "APT Groups"}'::jsonb, '/apt', 'Users', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'threat_intel'), 'mitre_attack', '{"ko": "MITRE ATT&CK", "en": "MITRE ATT&CK"}'::jsonb, '/mitre', 'Shield', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'threat_intel'), 'malware_analysis', '{"ko": "악성코드 분석", "en": "Malware Analysis"}'::jsonb, '/malware', 'Shield', 4);

-- 6. SOAR Operations Group (SOAR 운영)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('soar_operations', '{"ko": "SOAR 운영", "en": "SOAR Operations", "ja": "SOAR運用", "zh": "SOAR运营"}'::jsonb, 'Activity', 60);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'soar_operations'), 'threat_hunting', '{"ko": "위협 헌팅", "en": "Threat Hunting"}'::jsonb, '/threat-hunting', 'Search', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'soar_operations'), 'incident_response', '{"ko": "인시던트 대응", "en": "Incident Response"}'::jsonb, '/incident-response', 'AlertTriangle', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'soar_operations'), 'alert_triage', '{"ko": "알림 분류", "en": "Alert Triage"}'::jsonb, '/alert-triage', 'Activity', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'soar_operations'), 'mdr_operations', '{"ko": "MDR 운영", "en": "MDR Operations"}'::jsonb, '/mdr-operations', 'Shield', 4);

-- 7. Automation Group (자동화 & 통합)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('automation', '{"ko": "자동화 & 통합", "en": "Automation & Integration", "ja": "自動化と統合", "zh": "自动化与集成"}'::jsonb, 'Workflow', 70);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'automation'), 'automation_rules', '{"ko": "자동화 규칙", "en": "Automation Rules"}'::jsonb, '/automation', 'Activity', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'automation'), 'integrations', '{"ko": "통합 관리", "en": "Integration Management"}'::jsonb, '/integrations', 'Network', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'automation'), 'forensics', '{"ko": "포렌식", "en": "Forensics"}'::jsonb, '/forensics', 'Search', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'automation'), 'compliance', '{"ko": "규정 준수", "en": "Compliance"}'::jsonb, '/compliance', 'FileText', 4);

-- 8. Reports Group (리포트 & 분석)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('reports', '{"ko": "리포트 & 분석", "en": "Reports & Analytics", "ja": "レポートと分析", "zh": "报告与分析"}'::jsonb, 'FileText', 80);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'reports'), 'defender_reports', '{"ko": "DeFender X 리포트", "en": "DeFender X Reports"}'::jsonb, '/defender-reports', 'FileText', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'reports'), 'incident_reports', '{"ko": "인시던트 리포트", "en": "Incident Reports"}'::jsonb, '/ibai/report', 'FileText', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'reports'), 'ai_security_prompt', '{"ko": "AI 보안 프롬프트", "en": "AI Security Prompt"}'::jsonb, '/ibai/write2', 'FileText', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'reports'), 'it_consulting_prompt', '{"ko": "IT 컨설팅 프롬프트", "en": "IT Consulting Prompt"}'::jsonb, '/ibai/write', 'FileText', 4),
((SELECT id FROM siem_app.menu_categories WHERE name = 'reports'), 'ai_model_test', '{"ko": "AI 모델 테스트", "en": "AI Model Test"}'::jsonb, '/ibai/test', 'FileText', 5),
((SELECT id FROM siem_app.menu_categories WHERE name = 'reports'), 'incident_reports_v2', '{"ko": "인시던트 리포트 V2", "en": "Incident Reports V2"}'::jsonb, '/ibai/report2', 'FileText', 6);

-- 9. System Admin Group (시스템 관리)
INSERT INTO siem_app.menu_categories (name, label, icon, order_index) VALUES
('system_admin', '{"ko": "시스템 관리", "en": "System Administration", "ja": "システム管理", "zh": "系统管理"}'::jsonb, 'Settings', 90);

INSERT INTO siem_app.menu_items (category_id, name, label, href, icon, order_index) VALUES
((SELECT id FROM siem_app.menu_categories WHERE name = 'system_admin'), 'menu_management', '{"ko": "메뉴 관리", "en": "Menu Management"}'::jsonb, '/admin/menu_management', 'Settings', 1),
((SELECT id FROM siem_app.menu_categories WHERE name = 'system_admin'), 'user_management', '{"ko": "사용자 관리", "en": "User Management"}'::jsonb, '/admin/user_management', 'Users', 2),
((SELECT id FROM siem_app.menu_categories WHERE name = 'system_admin'), 'role_management', '{"ko": "역할 관리", "en": "Role Management"}'::jsonb, '/admin/role_management', 'Shield', 3),
((SELECT id FROM siem_app.menu_categories WHERE name = 'system_admin'), 'audit_logs', '{"ko": "감사 로그", "en": "Audit Logs"}'::jsonb, '/admin/audit_logs', 'FileText', 4),
((SELECT id FROM siem_app.menu_categories WHERE name = 'system_admin'), 'system_settings', '{"ko": "시스템 설정", "en": "System Settings"}'::jsonb, '/admin/system_settings', 'Settings', 5);

-- Summary
SELECT
    'Categories' as type, COUNT(*) as count
FROM siem_app.menu_categories
WHERE name NOT IN ('Dashboard', 'Search', 'Analytics', 'Alerts', 'Settings')
UNION ALL
SELECT
    'Menu Items', COUNT(*)
FROM siem_app.menu_items
WHERE category_id IN (SELECT id FROM siem_app.menu_categories WHERE name NOT IN ('Dashboard', 'Search', 'Analytics', 'Alerts', 'Settings'));
