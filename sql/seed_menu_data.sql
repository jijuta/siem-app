-- Seed menu data from existing navigation.ts
-- This migrates the current navigation structure to database

-- Insert main menu categories
INSERT INTO siem_app.menu_categories (name, label, icon, color, order_index) VALUES
('Dashboard', '{"ko": "대시보드", "en": "Dashboard", "ja": "ダッシュボード", "zh": "仪表板"}'::jsonb, 'LayoutDashboard', NULL, 1),
('Search', '{"ko": "검색", "en": "Search", "ja": "検索", "zh": "搜索"}'::jsonb, 'Search', NULL, 2),
('Analytics', '{"ko": "분석", "en": "Analytics", "ja": "分析", "zh": "分析"}'::jsonb, 'ChartBar', NULL, 3),
('Alerts', '{"ko": "알림", "en": "Alerts", "ja": "アラート", "zh": "警报"}'::jsonb, 'Bell', NULL, 4),
('Settings', '{"ko": "설정", "en": "Settings", "ja": "設定", "zh": "设置"}'::jsonb, 'Settings', NULL, 5);

-- Insert main menu items
INSERT INTO siem_app.menu_items (category_id, name, label, href, order_index) VALUES
-- Dashboard (no children, just root)
((SELECT id FROM siem_app.menu_categories WHERE name = 'Dashboard'), 'Dashboard', '{"ko": "대시보드", "en": "Dashboard", "ja": "ダッシュボード", "zh": "仪表板"}'::jsonb, '/', 1),

-- Search (no children)
((SELECT id FROM siem_app.menu_categories WHERE name = 'Search'), 'Search', '{"ko": "검색", "en": "Search", "ja": "検索", "zh": "搜索"}'::jsonb, '/search', 1),

-- Analytics with children
((SELECT id FROM siem_app.menu_categories WHERE name = 'Analytics'), 'Analytics', '{"ko": "분석", "en": "Analytics", "ja": "分析", "zh": "分析"}'::jsonb, '/analytics', 1),

-- Alerts (no children)
((SELECT id FROM siem_app.menu_categories WHERE name = 'Alerts'), 'Alerts', '{"ko": "알림", "en": "Alerts", "ja": "アラート", "zh": "警报"}'::jsonb, '/alerts', 1),

-- Settings with children
((SELECT id FROM siem_app.menu_categories WHERE name = 'Settings'), 'Settings', '{"ko": "설정", "en": "Settings", "ja": "設定", "zh": "设置"}'::jsonb, '/settings', 1);

-- Insert Analytics sub-items
INSERT INTO siem_app.menu_items (parent_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.menu_items WHERE name = 'Analytics' AND parent_id IS NULL), 'Sigma Rules', '{"ko": "시그마 규칙", "en": "Sigma Rules", "ja": "シグマルール", "zh": "Sigma规则"}'::jsonb, '/analytics/sigma-rules', 1),
((SELECT id FROM siem_app.menu_items WHERE name = 'Analytics' AND parent_id IS NULL), 'MITRE ATT&CK', '{"ko": "MITRE ATT&CK", "en": "MITRE ATT&CK", "ja": "MITRE ATT&CK", "zh": "MITRE ATT&CK"}'::jsonb, '/analytics/mitre-attack', 2),
((SELECT id FROM siem_app.menu_items WHERE name = 'Analytics' AND parent_id IS NULL), 'Reports', '{"ko": "보고서", "en": "Reports", "ja": "レポート", "zh": "报告"}'::jsonb, '/analytics/reports', 3);

-- Insert Settings sub-items
INSERT INTO siem_app.menu_items (parent_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.menu_items WHERE name = 'Settings' AND parent_id IS NULL), 'Profile', '{"ko": "프로필", "en": "Profile", "ja": "プロファイル", "zh": "个人资料"}'::jsonb, '/settings/profile', 1),
((SELECT id FROM siem_app.menu_items WHERE name = 'Settings' AND parent_id IS NULL), 'Alert Configuration', '{"ko": "알림 설정", "en": "Alert Configuration", "ja": "アラート設定", "zh": "警报配置"}'::jsonb, '/settings/alerts', 2),
((SELECT id FROM siem_app.menu_items WHERE name = 'Settings' AND parent_id IS NULL), 'API Keys', '{"ko": "API 키", "en": "API Keys", "ja": "APIキー", "zh": "API密钥"}'::jsonb, '/settings/api-keys', 3);

-- Insert vendors
INSERT INTO siem_app.vendors (vendor_id, name, label, icon, color, description, order_index) VALUES
('crowdstrike', 'CrowdStrike Falcon', '{"ko": "크라우드스트라이크 팔콘", "en": "CrowdStrike Falcon", "ja": "CrowdStrike Falcon", "zh": "CrowdStrike Falcon"}'::jsonb, 'Shield', 'red', '{"ko": "엔드포인트 탐지 및 대응", "en": "Endpoint Detection and Response", "ja": "エンドポイント検出と対応", "zh": "端点检测与响应"}'::jsonb, 1),
('cisco', 'Cisco SecureX', '{"ko": "시스코 SecureX", "en": "Cisco SecureX", "ja": "Cisco SecureX", "zh": "Cisco SecureX"}'::jsonb, 'Network', 'blue', '{"ko": "위협 인텔리전스 플랫폼", "en": "Threat Intelligence Platform", "ja": "脅威インテリジェンスプラットフォーム", "zh": "威胁情报平台"}'::jsonb, 2),
('fortinet', 'Fortinet FortiEDR', '{"ko": "포티넷 FortiEDR", "en": "Fortinet FortiEDR", "ja": "Fortinet FortiEDR", "zh": "Fortinet FortiEDR"}'::jsonb, 'Lock', 'green', '{"ko": "고급 엔드포인트 보호", "en": "Advanced Endpoint Protection", "ja": "高度なエンドポイント保護", "zh": "高级端点保护"}'::jsonb, 3),
('cortex', 'Cortex XDR', '{"ko": "코텍스 XDR", "en": "Cortex XDR", "ja": "Cortex XDR", "zh": "Cortex XDR"}'::jsonb, 'Brain', 'purple', '{"ko": "확장 탐지 및 대응", "en": "Extended Detection and Response", "ja": "拡張検出と対応", "zh": "扩展检测与响应"}'::jsonb, 4),
('microsoft-defender', 'Microsoft Defender XDR', '{"ko": "마이크로소프트 디펜더 XDR", "en": "Microsoft Defender XDR", "ja": "Microsoft Defender XDR", "zh": "Microsoft Defender XDR"}'::jsonb, 'Shield', 'cyan', '{"ko": "마이크로소프트 확장 탐지 및 대응", "en": "Microsoft Extended Detection and Response", "ja": "Microsoft拡張検出と対応", "zh": "Microsoft扩展检测与响应"}'::jsonb, 5),
('google-security', 'Google Security Operations', '{"ko": "구글 보안 운영", "en": "Google Security Operations", "ja": "Google Security Operations", "zh": "Google Security Operations"}'::jsonb, 'Search', 'yellow', '{"ko": "크로니클 보안 운영 플랫폼", "en": "Chronicle Security Operations Platform", "ja": "Chronicle セキュリティ運用プラットフォーム", "zh": "Chronicle安全运营平台"}'::jsonb, 6),
('wazuh', 'Wazuh', '{"ko": "와주", "en": "Wazuh", "ja": "Wazuh", "zh": "Wazuh"}'::jsonb, 'Server', 'indigo', '{"ko": "오픈소스 보안 플랫폼", "en": "Open Source Security Platform", "ja": "オープンソースセキュリティプラットフォーム", "zh": "开源安全平台"}'::jsonb, 7),
('aws-security', 'AWS Security', '{"ko": "AWS 보안", "en": "AWS Security", "ja": "AWS Security", "zh": "AWS Security"}'::jsonb, 'Cloud', 'orange', '{"ko": "AWS 보안 허브 및 가드듀티", "en": "AWS Security Hub & GuardDuty", "ja": "AWS Security Hub & GuardDuty", "zh": "AWS Security Hub & GuardDuty"}'::jsonb, 8);

-- Insert CrowdStrike pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/crowdstrike', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Detections', '{"ko": "탐지", "en": "Detections", "ja": "検出", "zh": "检测"}'::jsonb, '/crowdstrike/detections', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Incidents', '{"ko": "인시던트", "en": "Incidents", "ja": "インシデント", "zh": "事件"}'::jsonb, '/crowdstrike/incidents', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Hosts', '{"ko": "호스트", "en": "Hosts", "ja": "ホスト", "zh": "主机"}'::jsonb, '/crowdstrike/hosts', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Network Events', '{"ko": "네트워크 이벤트", "en": "Network Events", "ja": "ネットワークイベント", "zh": "网络事件"}'::jsonb, '/crowdstrike/network', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Process Events', '{"ko": "프로세스 이벤트", "en": "Process Events", "ja": "プロセスイベント", "zh": "进程事件"}'::jsonb, '/crowdstrike/process', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'DNS Events', '{"ko": "DNS 이벤트", "en": "DNS Events", "ja": "DNSイベント", "zh": "DNS事件"}'::jsonb, '/crowdstrike/dns', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'File Events', '{"ko": "파일 이벤트", "en": "File Events", "ja": "ファイルイベント", "zh": "文件事件"}'::jsonb, '/crowdstrike/files', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Registry Events', '{"ko": "레지스트리 이벤트", "en": "Registry Events", "ja": "レジストリイベント", "zh": "注册表事件"}'::jsonb, '/crowdstrike/registry', 9),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Behaviors', '{"ko": "행동", "en": "Behaviors", "ja": "動作", "zh": "行为"}'::jsonb, '/crowdstrike/behaviors', 10),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'User Activity', '{"ko": "사용자 활동", "en": "User Activity", "ja": "ユーザーアクティビティ", "zh": "用户活动"}'::jsonb, '/crowdstrike/users', 11),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'Threat Intel', '{"ko": "위협 인텔", "en": "Threat Intel", "ja": "脅威インテル", "zh": "威胁情报"}'::jsonb, '/crowdstrike/threat-intel', 12),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'crowdstrike'), 'IOCs', '{"ko": "IOC", "en": "IOCs", "ja": "IOC", "zh": "IOC"}'::jsonb, '/crowdstrike/iocs', 13);

-- Insert Cisco SecureX pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/cisco', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Sightings', '{"ko": "관찰", "en": "Sightings", "ja": "目撃", "zh": "目击"}'::jsonb, '/cisco/sightings', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Incidents', '{"ko": "인시던트", "en": "Incidents", "ja": "インシデント", "zh": "事件"}'::jsonb, '/cisco/incidents', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Observables', '{"ko": "관측 가능", "en": "Observables", "ja": "観測可能", "zh": "可观察"}'::jsonb, '/cisco/observables', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Judgments', '{"ko": "판단", "en": "Judgments", "ja": "判断", "zh": "判断"}'::jsonb, '/cisco/judgments', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Indicators', '{"ko": "지표", "en": "Indicators", "ja": "指標", "zh": "指标"}'::jsonb, '/cisco/indicators', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Relationships', '{"ko": "관계", "en": "Relationships", "ja": "関係", "zh": "关系"}'::jsonb, '/cisco/relationships', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Investigations', '{"ko": "조사", "en": "Investigations", "ja": "調査", "zh": "调查"}'::jsonb, '/cisco/investigations', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Actions', '{"ko": "작업", "en": "Actions", "ja": "アクション", "zh": "操作"}'::jsonb, '/cisco/actions', 9),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Vulnerabilities', '{"ko": "취약점", "en": "Vulnerabilities", "ja": "脆弱性", "zh": "漏洞"}'::jsonb, '/cisco/vulnerabilities', 10),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cisco'), 'Assets', '{"ko": "자산", "en": "Assets", "ja": "資産", "zh": "资产"}'::jsonb, '/cisco/assets', 11);

-- Insert Fortinet pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/fortinet', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Alerts', '{"ko": "알림", "en": "Alerts", "ja": "アラート", "zh": "警报"}'::jsonb, '/fortinet/alerts', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Forensics', '{"ko": "포렌식", "en": "Forensics", "ja": "フォレンジック", "zh": "取证"}'::jsonb, '/fortinet/forensics', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Collectors', '{"ko": "수집기", "en": "Collectors", "ja": "コレクター", "zh": "收集器"}'::jsonb, '/fortinet/collectors', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Threats', '{"ko": "위협", "en": "Threats", "ja": "脅威", "zh": "威胁"}'::jsonb, '/fortinet/threats', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Remediations', '{"ko": "개선", "en": "Remediations", "ja": "修復", "zh": "修复"}'::jsonb, '/fortinet/remediations', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Policies', '{"ko": "정책", "en": "Policies", "ja": "ポリシー", "zh": "策略"}'::jsonb, '/fortinet/policies', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Exceptions', '{"ko": "예외", "en": "Exceptions", "ja": "例外", "zh": "例外"}'::jsonb, '/fortinet/exceptions', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'fortinet'), 'Inventory', '{"ko": "인벤토리", "en": "Inventory", "ja": "インベントリ", "zh": "清单"}'::jsonb, '/fortinet/inventory', 9);

-- Insert Cortex XDR pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/cortex', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Alerts', '{"ko": "알림", "en": "Alerts", "ja": "アラート", "zh": "警报"}'::jsonb, '/cortex/alerts', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Incidents', '{"ko": "인시던트", "en": "Incidents", "ja": "インシデント", "zh": "事件"}'::jsonb, '/cortex/incidents', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Forensics', '{"ko": "포렌식", "en": "Forensics", "ja": "フォレンジック", "zh": "取证"}'::jsonb, '/cortex/forensics', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Endpoints', '{"ko": "엔드포인트", "en": "Endpoints", "ja": "エンドポイント", "zh": "端点"}'::jsonb, '/cortex/endpoints', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Artifacts', '{"ko": "아티팩트", "en": "Artifacts", "ja": "アーティファクト", "zh": "工件"}'::jsonb, '/cortex/artifacts', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Vulnerabilities', '{"ko": "취약점", "en": "Vulnerabilities", "ja": "脆弱性", "zh": "漏洞"}'::jsonb, '/cortex/vulnerabilities', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Audit Logs', '{"ko": "감사 로그", "en": "Audit Logs", "ja": "監査ログ", "zh": "审计日志"}'::jsonb, '/cortex/audit', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'cortex'), 'Raw Logs', '{"ko": "원시 로그", "en": "Raw Logs", "ja": "生ログ", "zh": "原始日志"}'::jsonb, '/cortex/raw-logs', 9);

-- Insert Microsoft Defender pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/microsoft-defender', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Alerts', '{"ko": "알림", "en": "Alerts", "ja": "アラート", "zh": "警报"}'::jsonb, '/microsoft-defender/alerts', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Incidents', '{"ko": "인시던트", "en": "Incidents", "ja": "インシデント", "zh": "事件"}'::jsonb, '/microsoft-defender/incidents', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Advanced Hunting', '{"ko": "고급 헌팅", "en": "Advanced Hunting", "ja": "高度なハンティング", "zh": "高级猎杀"}'::jsonb, '/microsoft-defender/hunting', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Endpoints', '{"ko": "엔드포인트", "en": "Endpoints", "ja": "エンドポイント", "zh": "端点"}'::jsonb, '/microsoft-defender/endpoints', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Vulnerabilities', '{"ko": "취약점", "en": "Vulnerabilities", "ja": "脆弱性", "zh": "漏洞"}'::jsonb, '/microsoft-defender/vulnerabilities', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Secure Score', '{"ko": "보안 점수", "en": "Secure Score", "ja": "セキュリティスコア", "zh": "安全分数"}'::jsonb, '/microsoft-defender/secure-score', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Threat Analytics', '{"ko": "위협 분석", "en": "Threat Analytics", "ja": "脅威分析", "zh": "威胁分析"}'::jsonb, '/microsoft-defender/threat-analytics', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Email & Collaboration', '{"ko": "이메일 및 협업", "en": "Email & Collaboration", "ja": "メールとコラボレーション", "zh": "电子邮件和协作"}'::jsonb, '/microsoft-defender/email', 9),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'microsoft-defender'), 'Identity', '{"ko": "아이덴티티", "en": "Identity", "ja": "アイデンティティ", "zh": "身份"}'::jsonb, '/microsoft-defender/identity', 10);

-- Insert Google Security pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/google-security', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'Detections', '{"ko": "탐지", "en": "Detections", "ja": "検出", "zh": "检测"}'::jsonb, '/google-security/detections', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'Investigations', '{"ko": "조사", "en": "Investigations", "ja": "調査", "zh": "调查"}'::jsonb, '/google-security/investigations', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'Assets', '{"ko": "자산", "en": "Assets", "ja": "資産", "zh": "资产"}'::jsonb, '/google-security/assets', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'Threat Intelligence', '{"ko": "위협 인텔리전스", "en": "Threat Intelligence", "ja": "脅威インテリジェンス", "zh": "威胁情报"}'::jsonb, '/google-security/threat-intel', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'UDM Search', '{"ko": "UDM 검색", "en": "UDM Search", "ja": "UDM検索", "zh": "UDM搜索"}'::jsonb, '/google-security/udm-search', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'YARA-L Rules', '{"ko": "YARA-L 규칙", "en": "YARA-L Rules", "ja": "YARA-L ルール", "zh": "YARA-L规则"}'::jsonb, '/google-security/yara-l', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'IOCs', '{"ko": "IOC", "en": "IOCs", "ja": "IOC", "zh": "IOC"}'::jsonb, '/google-security/iocs', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'google-security'), 'Reference Lists', '{"ko": "참조 목록", "en": "Reference Lists", "ja": "参照リスト", "zh": "参考列表"}'::jsonb, '/google-security/reference-lists', 9);

-- Insert Wazuh pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/wazuh', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Security Events', '{"ko": "보안 이벤트", "en": "Security Events", "ja": "セキュリティイベント", "zh": "安全事件"}'::jsonb, '/wazuh/events', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Agents', '{"ko": "에이전트", "en": "Agents", "ja": "エージェント", "zh": "代理"}'::jsonb, '/wazuh/agents', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Integrity Monitoring', '{"ko": "무결성 모니터링", "en": "Integrity Monitoring", "ja": "整合性監視", "zh": "完整性监控"}'::jsonb, '/wazuh/fim', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Vulnerability Detection', '{"ko": "취약점 탐지", "en": "Vulnerability Detection", "ja": "脆弱性検出", "zh": "漏洞检测"}'::jsonb, '/wazuh/vulnerabilities', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Compliance', '{"ko": "규정 준수", "en": "Compliance", "ja": "コンプライアンス", "zh": "合规性"}'::jsonb, '/wazuh/compliance', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Configuration Assessment', '{"ko": "구성 평가", "en": "Configuration Assessment", "ja": "構成評価", "zh": "配置评估"}'::jsonb, '/wazuh/sca', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'Threat Hunting', '{"ko": "위협 헌팅", "en": "Threat Hunting", "ja": "脅威ハンティング", "zh": "威胁猎杀"}'::jsonb, '/wazuh/threat-hunting', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'wazuh'), 'MITRE ATT&CK', '{"ko": "MITRE ATT&CK", "en": "MITRE ATT&CK", "ja": "MITRE ATT&CK", "zh": "MITRE ATT&CK"}'::jsonb, '/wazuh/mitre', 9);

-- Insert AWS Security pages
INSERT INTO siem_app.vendor_pages (vendor_id, name, label, href, order_index) VALUES
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'Overview', '{"ko": "개요", "en": "Overview", "ja": "概要", "zh": "概述"}'::jsonb, '/aws-security', 1),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'Security Hub', '{"ko": "보안 허브", "en": "Security Hub", "ja": "セキュリティハブ", "zh": "安全中心"}'::jsonb, '/aws-security/security-hub', 2),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'GuardDuty', '{"ko": "가드듀티", "en": "GuardDuty", "ja": "GuardDuty", "zh": "GuardDuty"}'::jsonb, '/aws-security/guardduty', 3),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'CloudTrail', '{"ko": "클라우드트레일", "en": "CloudTrail", "ja": "CloudTrail", "zh": "CloudTrail"}'::jsonb, '/aws-security/cloudtrail', 4),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'Config', '{"ko": "설정", "en": "Config", "ja": "Config", "zh": "配置"}'::jsonb, '/aws-security/config', 5),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'IAM Access Analyzer', '{"ko": "IAM 액세스 분석기", "en": "IAM Access Analyzer", "ja": "IAMアクセスアナライザー", "zh": "IAM访问分析器"}'::jsonb, '/aws-security/iam-analyzer', 6),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'Inspector', '{"ko": "인스펙터", "en": "Inspector", "ja": "Inspector", "zh": "Inspector"}'::jsonb, '/aws-security/inspector', 7),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'Macie', '{"ko": "메이시", "en": "Macie", "ja": "Macie", "zh": "Macie"}'::jsonb, '/aws-security/macie', 8),
((SELECT id FROM siem_app.vendors WHERE vendor_id = 'aws-security'), 'Network Firewall', '{"ko": "네트워크 방화벽", "en": "Network Firewall", "ja": "ネットワークファイアウォール", "zh": "网络防火墙"}'::jsonb, '/aws-security/firewall', 9);

-- Verify data insertion
SELECT 'Menu Categories:' as section, COUNT(*) as count FROM siem_app.menu_categories
UNION ALL
SELECT 'Menu Items:', COUNT(*) FROM siem_app.menu_items
UNION ALL
SELECT 'Vendors:', COUNT(*) FROM siem_app.vendors
UNION ALL
SELECT 'Vendor Pages:', COUNT(*) FROM siem_app.vendor_pages;
