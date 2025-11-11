# DeFender X - 차세대 보안 운영 플랫폼

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![OpenSearch](https://img.shields.io/badge/OpenSearch-3.5-005EB8?style=for-the-badge&logo=opensearch)

**멀티 벤더 통합 SIEM · AI 기반 위협 분석 · 실시간 모니터링 · 멀티 테넌트 지원**

[데모 보기](https://defenderxs.in-bridge.com) · [문서](docs/) · [버그 리포트](https://github.com/your-org/defender-x/issues)

</div>

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [시스템 아키텍처](#️-시스템-아키텍처)
- [시작하기](#-시작하기)
- [MCP 통합](#-mcp-model-context-protocol-통합)
- [AI 통합](#-ai-통합)
- [프로젝트 구조](#-프로젝트-구조)
- [환경 설정](#-환경-설정)
- [메뉴 구조](#️-메뉴-구조)
- [배포](#-배포)
- [문서](#-문서)
- [라이선스](#-라이선스)

---

## 🚀 프로젝트 개요

**DeFender X**는 여러 EDR/XDR 벤더의 보안 데이터를 통합하고, **AI 기반 분석**을 통해 실시간으로 위협을 모니터링하는 차세대 통합 보안 정보 및 이벤트 관리(SIEM) 대시보드입니다.

### 핵심 가치

🎯 **통합**: 8개 주요 보안 벤더의 데이터를 하나의 대시보드에서
🤖 **AI 분석**: 6개 AI 제공자를 활용한 지능형 위협 분석
📊 **실시간**: 실시간 시계열 분석 및 이상 탐지
🌐 **다중 테넌트**: 180+ 고객사 동시 관리
🔧 **개발 도구**: 8개 MCP 서버로 향상된 개발 워크플로우

### 지원 보안 벤더

| 벤더 | 타입 | 주요 기능 |
|------|------|-----------|
| **CrowdStrike Falcon** | EDR | Detections, Behaviors, IOCs, Hosts |
| **Microsoft Defender XDR** | XDR | Incidents, Alerts, Threat Intelligence |
| **Palo Alto Cortex XDR** | XDR | Incidents, Causality Chain, Investigation |
| **Fortinet FortiEDR** | EDR | Alerts, Collectors, Inventory |
| **Cisco SecureX** | XDR | Sightings, Observables, Threat Actors |
| **Google Security Operations** | SIEM | Chronicle, Cloud Security |
| **AWS Security Hub** | Cloud Security | GuardDuty, Security Hub Findings |
| **Wazuh** | HIDS | Host-based Intrusion Detection |

---

## ✨ 주요 기능

### 1. 멀티 벤더 통합 모니터링
- **단일 대시보드**에서 모든 보안 벤더 데이터 조회
- **벤더별 맞춤 UI**: 각 벤더의 고유 용어 및 워크플로우 지원
- **통합 검색**: 모든 벤더를 가로지르는 통합 쿼리
- **실시간 데이터**: OpenSearch 기반 빠른 검색 및 집계

### 2. AI 기반 위협 분석

#### AI Copilot (`/ai-copilot`)
```
자연어 입력 예시:
"최근 24시간 Critical 알림 보여줘"
"CrowdStrike에서 탐지한 악성코드 목록"
"MITRE ATT&CK T1059 기술 관련 인시던트"
```

- 자연어 → OpenSearch DSL 자동 변환
- 실시간 스트리밍 응답
- 마크다운 렌더링
- 날짜 범위 필터링

#### AI 리포트 생성 (`/ibai/report`)
- Cortex XDR 인시던트 자동 분석
- MITRE ATT&CK 기술 매핑
- CVSS 기반 심각도 평가
- 자동 대응 권장사항 생성
- PDF/JSON 내보내기

#### 지원 AI 모델
1. **Google Gemini** (Primary): gemini-2.5-pro, gemini-2.5-flash
2. **OpenAI GPT**: gpt-4, gpt-4-turbo
3. **Anthropic Claude**: claude-3-opus, claude-3-sonnet
4. **Groq LLaMA**: llama-3.3-70b-versatile
5. **NVIDIA NIM**: llama-4-maverick-17b
6. **Azure OpenAI**: gpt-4o-mini, gpt-35-turbo

### 3. 멀티 테넌트 모니터링

#### 테넌트 대시보드 (`/tenant-monitoring`)
- **7개 탭**: 개요, 벤더, 엔드포인트, 알림, 인시던트, SLA, 위협
- **실시간 헬스 스코어**: 0-100 점수 체계
- **SLA 추적**: SLA 위반 알림
- **벤더 분포**: 테넌트별 보안 솔루션 커버리지

#### 테넌트 분석 (`/tenant-analytics`)
- **180+ 테넌트** 동시 관리
- 테넌트 간 비교 분석
- 리소스 사용량 추적
- 성능 벤치마킹

#### 샘플 테넌트 (한국 기업)
- 에티버스 (Etibus)
- 인브릿지 (In-Bridge)
- 이테크 (E-Tech)
- 윤소프트 (Yoonsoft)

### 4. 실시간 시계열 분석

#### 24시간 위협 타임라인
- Critical/High/Medium/Low 알림 추이
- AI 기반 패턴 인식
- 다음 6시간 예측 (신뢰도 점수 포함)

#### 7일 보안 점수 트렌드
- 테넌트별 Stacked Area 차트
- 추세 분석 및 조기 경보
- 교차 테넌트 성능 비교

#### 30일 벤더 탐지 비교
- 벤더 효과성 비교
- 커버리지 갭 식별
- 보안 도구 효율성 분석

#### MITRE ATT&CK 히트맵
- 4주 기간 캘린더 스타일 히트맵
- 공격 캠페인 패턴 인식
- 시간대별 분석 (요일, 시간)

### 5. MITRE ATT&CK 매핑
- **Tactic → Technique** 계층 구조
- 인시던트별 ATT&CK 기술 자동 매핑
- 가장 많이 탐지된 기술 Top 10
- 공격 체인 시각화

### 6. 다국어 지원
- 🇰🇷 한국어 (기본)
- 🇺🇸 English
- 🇯🇵 日本語
- 🇨🇳 中文

### 7. 인증 및 권한 관리
- **NextAuth.js v5** 기반
- **OAuth 제공자**: Google, Microsoft, Naver, Kakao, Salesforce, Zoom, Facebook
- **사용자 역할**: ADMIN, ANALYST, VIEWER
- **세션 관리**: JWT 기반

---

## 🛠️ 기술 스택

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 15 | React 프레임워크 (App Router) |
| **React** | 19 | UI 라이브러리 |
| **TypeScript** | 5 | 타입 안정성 |
| **Tailwind CSS** | 4 | 유틸리티 우선 CSS |
| **shadcn/ui** | Latest | UI 컴포넌트 (New York 스타일) |
| **Recharts** | 3.3 | 데이터 시각화 |
| **react-markdown** | 10 | 마크다운 렌더링 |
| **TanStack Query** | 5.87 | 데이터 페칭 |

### 백엔드 & 데이터
| 기술 | 버전 | 용도 |
|------|------|------|
| **OpenSearch** | 3.5 | 로그 집계 및 검색 |
| **PostgreSQL** | 16 | 사용자 데이터, 설정 (2개 DB) |
| **Prisma** | 6.16 | ORM |
| **NextAuth.js** | 5.0-beta | 인증 |
| **Vercel AI SDK** | 5.0 | AI 통합 |

### AI 제공자
- Google Gemini 2.5 (Primary)
- OpenAI GPT-4
- Anthropic Claude 3
- Groq LLaMA 3.3
- NVIDIA NIM
- Azure OpenAI

### 개발 도구
| 도구 | 용도 |
|------|------|
| **pnpm** | 패키지 매니저 |
| **Turbopack** | 빠른 빌드 |
| **ESLint** | 코드 품질 |
| **PM2** | 프로세스 관리 |
| **Nginx** | 리버스 프록시 |
| **8 MCP 서버** | 개발 자동화 |

---

## 🏛️ 시스템 아키텍처

```mermaid
graph TD
    subgraph "클라이언트"
        A[웹 브라우저]
    end

    subgraph "프론트엔드 (Nginx)"
        B[defenderxs.in-bridge.com<br/>HTTPS 443]
    end

    subgraph "애플리케이션 (PM2)"
        C[Next.js 15<br/>Port 40014]
        C1[App Router]
        C2[API Routes]
        C3[Server Components]
    end

    subgraph "AI 제공자"
        D1[Google Gemini]
        D2[OpenAI GPT]
        D3[Anthropic Claude]
        D4[Groq LLaMA]
        D5[NVIDIA NIM]
        D6[Azure OpenAI]
    end

    subgraph "데이터 저장소"
        E[OpenSearch<br/>보안 로그]
        F1[PostgreSQL<br/>siem_db]
        F2[PostgreSQL<br/>n8n]
    end

    subgraph "보안 벤더 (8개)"
        G1[CrowdStrike]
        G2[Microsoft Defender]
        G3[Cortex XDR]
        G4[Fortinet]
        G5[Cisco SecureX]
        G6[Google Security]
        G7[AWS Security]
        G8[Wazuh]
    end

    subgraph "MCP 서버 (8개)"
        H1[Chrome DevTools]
        H2[Context7]
        H3[PostgreSQL×2]
        H4[Filesystem]
        H5[GitHub]
        H6[Memory]
        H7[Brave Search]
    end

    A -->|HTTPS| B
    B -->|Proxy| C
    C --> C1 & C2 & C3
    C2 -->|AI API| D1 & D2 & D3 & D4 & D5 & D6
    C2 -->|Query| E
    C2 -->|Prisma| F1 & F2
    G1 & G2 & G3 & G4 & G5 & G6 & G7 & G8 -->|Logs| E
    C -.->|Dev Tools| H1 & H2 & H3 & H4 & H5 & H6 & H7
```

### 데이터 흐름

1. **로그 수집**: 8개 보안 벤더 → OpenSearch 인덱스
2. **데이터 쿼리**: Next.js API Routes → OpenSearch 쿼리
3. **AI 분석**: 사용자 쿼리 → AI 제공자 → 스트리밍 응답
4. **사용자 데이터**: Prisma ORM → PostgreSQL (siem_db, n8n)
5. **실시간 업데이트**: TanStack Query + Pusher (선택)

---

## 🚀 시작하기

### 사전 요구사항

```bash
# Node.js 20+ & pnpm
node --version  # v20.0.0+
pnpm --version  # 10.0.0+

# PostgreSQL 16+
psql --version

# OpenSearch 3.5+
curl http://opensearch:9200
```

### 설치

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/defender-x.git
cd defender-x

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값 입력

# 4. 데이터베이스 마이그레이션
npx prisma migrate dev

# 5. 개발 서버 실행
pnpm dev
```

서버가 `http://localhost:40014`에서 실행됩니다.

### 빠른 테스트

```bash
# AI 제공자 테스트
curl http://localhost:40014/ibai/test

# AI Copilot 테스트
curl http://localhost:40014/ai-copilot

# 데이터베이스 GUI
npx prisma studio
```

---

## 🤖 MCP (Model Context Protocol) 통합

**DeFender X는 8개의 MCP 서버를 통합**하여 개발 워크플로우를 혁신적으로 개선합니다.

### MCP 서버 목록

| MCP 서버 | 패키지 | 기능 |
|----------|--------|------|
| **Chrome DevTools** | `chrome-devtools-mcp` | 🔥 브라우저 콘솔 로그 자동 캡처 |
| **Context7** | `@upstash/context7-mcp` | 📚 최신 라이브러리 문서 |
| **PostgreSQL (SIEM)** | `@modelcontextprotocol/server-postgres` | 🗄️ siem_db 데이터베이스 접근 |
| **PostgreSQL (n8n)** | `@modelcontextprotocol/server-postgres` | 🗄️ n8n 워크플로우 DB |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | 📁 프로젝트 파일 시스템 |
| **GitHub** | `@modelcontextprotocol/server-github` | 🐙 저장소 통합 |
| **Memory** | `@modelcontextprotocol/server-memory` | 🧠 영구 메모리 |
| **Brave Search** | `@modelcontextprotocol/server-brave-search` | 🔍 웹 검색 |

### 사용 예시

#### Chrome DevTools MCP
더 이상 수동으로 콘솔 로그를 복사할 필요가 없습니다!

```
"Show me console logs from localhost:40014"
"Check for failed API requests in Network tab"
"Analyze page performance"
```

#### Context7 MCP
항상 최신 문서를 참조:

```
"use context7 Next.js 15 Server Actions"
"use context7 Prisma transaction handling"
"use context7 OpenSearch aggregation queries"
```

#### PostgreSQL MCP
데이터베이스 직접 쿼리:

```
"Show all admin users from User table"
"Query dashboard configurations"
"List active alerts"
```

### MCP 문서

모든 MCP 서버의 상세한 사용 가이드는 `docs/` 폴더에 있습니다:

- `docs/MCP_README.md` - MCP 개요
- `docs/chrome-devtools_mcp.md` (8.1KB)
- `docs/context7_mcp.md` (8.6KB)
- `docs/postgres_mcp.md` (11KB)
- `docs/filesystem_mcp.md` (7.4KB)
- `docs/github_mcp.md` (5.4KB)
- `docs/memory_mcp.md` (7.7KB)
- `docs/brave-search_mcp.md` (7.7KB)

---

## 🤖 AI 통합

### AI Copilot

**자연어로 보안 데이터 쿼리**

```
페이지: https://defenderxs.in-bridge.com/ai-copilot

예시 쿼리:
- "최근 1시간 Critical 알림 보여줘"
- "CrowdStrike에서 탐지한 악성코드 분석"
- "192.168.1.100 IP 관련 인시던트"
- "MITRE ATT&CK T1059.001 기술 검색"
```

**기능**:
- 자연어 → OpenSearch DSL 자동 변환
- 실시간 스트리밍 응답
- 마크다운 및 코드 하이라이팅
- 날짜 범위 필터 (24h, 7d, 30d)
- 벤더별 필터

### AI 리포트 생성

**자동화된 인시던트 분석 리포트**

```
페이지: https://defenderxs.in-bridge.com/ibai/report

기능:
1. Cortex XDR 인시던트 선택
2. AI 자동 분석
3. MITRE ATT&CK 매핑
4. 심각도 평가 (CVSS)
5. 대응 권장사항
6. PDF/JSON 내보내기
```

### AI 제공자 테스트

```
페이지: https://defenderxs.in-bridge.com/ibai/test

6개 AI 제공자 실시간 비교:
- Google Gemini 2.5
- OpenAI GPT-4
- Anthropic Claude 3
- Groq LLaMA 3.3
- NVIDIA NIM
- Azure OpenAI
```

---

## 📁 프로젝트 구조

```
/www/ib-poral/
├── docs/                        # 📚 문서 (56KB+ MCP 가이드)
│   ├── MCP_README.md
│   ├── chrome-devtools_mcp.md
│   ├── context7_mcp.md
│   ├── postgres_mcp.md
│   ├── filesystem_mcp.md
│   ├── github_mcp.md
│   ├── memory_mcp.md
│   ├── brave-search_mcp.md
│   ├── DASHBOARD_AI_TIMESERIES_SPEC.md
│   ├── AI_PAGES_ANALYSIS_KR.md
│   ├── GEMINI.md
│   └── vendor-dashboard-comparison.md
│
├── script/                      # 🛠️ 유틸리티 스크립트
│   ├── info.js                  # Cortex XDR 인시던트 분석기
│   └── incident_*.json          # 생성된 분석 파일
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/            # NextAuth.js
│   │   │   ├── ibai-test/       # AI 테스트
│   │   │   ├── ibai-write/      # AI 리포트
│   │   │   └── ai-copilot/      # AI Copilot
│   │   ├── ai-copilot/          # AI Copilot UI
│   │   ├── ai-dashboard/        # AI 대시보드
│   │   ├── integrated-dashboard/ # 통합 대시보드
│   │   ├── tenant-monitoring/   # 테넌트 모니터링
│   │   ├── [vendor]/            # 벤더별 페이지
│   │   └── ...
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui
│   │   ├── report/              # 리포트 컴포넌트
│   │   ├── app-sidebar.tsx
│   │   ├── page-header.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── opensearch.ts        # OpenSearch 클라이언트
│   │   ├── i18n.ts              # 국제화
│   │   ├── navigation.ts        # 메뉴 구조
│   │   └── utils.ts
│   │
│   └── types/                   # TypeScript 타입
│
├── prisma/
│   └── schema.prisma            # DB 스키마
│
├── public/
│   └── locales/                 # 번역 파일 (ko, en, ja, zh)
│
├── .claude/
│   └── mcp.json                 # MCP 설정
│
├── .vscode/
│   └── settings.json            # VS Code + MCP 설정
│
├── .env.local                   # 환경변수 (비공개)
├── package.json
├── CLAUDE.md                    # Claude Code 가이드
└── README.md                    # 이 파일
```

---

## 🔧 환경 설정

### 필수 환경변수

```bash
# 데이터베이스
DATABASE_URL="postgresql://opensearch:opensearch123@localhost:5432/siem_db?schema=public"

# OpenSearch
OPENSEARCH_URL="http://opensearch:9200"
OPENSEARCH_USER="admin"
OPENSEARCH_PASSWORD="Admin@123456"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### AI 제공자 (선택)

```bash
# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY="..."
GEMINI_API_KEY="..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-..."

# Groq
GROQ_API_KEY="gsk_..."

# NVIDIA NIM
NVIDIA_API_KEY="nvapi-..."

# Azure OpenAI
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="https://etech-openai.openai.azure.com/"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
```

### OAuth 제공자 (선택)

```bash
# Google
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Microsoft / Azure AD
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
MICROSOFT_TENANT_ID="..."

# 기타: Naver, Kakao, Salesforce, Zoom, Facebook
# 자세한 내용은 .env.local.example 참조
```

### MCP 서버 (선택)

```bash
# GitHub MCP
GITHUB_TOKEN="ghp_..."

# Brave Search MCP
BRAVE_API_KEY="BSA..."
```

### Cortex XDR (선택)

```bash
CORTEX_FQDN="api-kumho-tire.xdr.jp.paloaltonetworks.com"
CORTEX_API_KEY_ID="48"
CORTEX_API_KEY="..."
CORTEX_USE_ADVANCED_AUTH="true"
```

---

## 🗺️ 메뉴 구조

```
DeFender X
│
├── 📊 대시보드                    (/)
│
├── 🤖 AI / Multi-Tenant
│   ├── AI Dashboard              (/ai-dashboard)
│   ├── AI Copilot                (/ai-copilot)
│   ├── Integrated Dashboard      (/integrated-dashboard)
│   ├── Tenant Monitoring         (/tenant-monitoring)
│   └── Tenant Analytics          (/tenant-analytics)
│
├── 🛡️ Vendors
│   ├── CrowdStrike               (/crowdstrike)
│   ├── Microsoft Defender        (/microsoft-defender)
│   ├── Palo Alto Cortex XDR      (/cortex)
│   ├── Fortinet FortiEDR         (/fortinet)
│   ├── Cisco SecureX             (/cisco)
│   ├── Google Security           (/google-security)
│   ├── AWS Security              (/aws-security)
│   └── Wazuh                     (/wazuh)
│
├── 🔒 Security Operations
│   ├── Alerts                    (/alerts)
│   ├── Incidents                 (/incidents)
│   ├── Cases                     (/cases)
│   ├── Threat Hunting            (/threat-hunting)
│   └── Reports                   (/reports)
│
├── 📦 Assets & Intel
│   ├── Endpoints                 (/endpoints)
│   ├── Assets                    (/assets)
│   ├── Vulnerabilities           (/vulnerabilities)
│   ├── Threat Intelligence       (/threat-intelligence)
│   └── IOCs                      (/ioc)
│
├── 🤖 Automation (SOAR)
│   ├── Playbooks                 (/playbooks)
│   ├── Automation                (/automation)
│   └── Integrations              (/integrations)
│
└── ⚙️ Settings                    (/settings)
```

---

## 🚀 배포

### PM2 프로세스 관리

```bash
# 현재 상태 확인
pm2 list

# 로그 확인
pm2 logs siem-dashboard

# 재시작 (필요 시)
pm2 restart siem-dashboard

# ⚠️ 주의: pm2 reset은 절대 사용하지 마세요!
```

**현재 설정**:
- Process Name: `siem-dashboard`
- Command: `pnpm dev`
- Port: `40014`
- Working Dir: `/www/ib-poral`

### Nginx 리버스 프록시

```bash
# 설정 파일 확인
cat /etc/nginx/sites-enabled/defenders.in-bridge.com

# Nginx 상태
sudo systemctl status nginx

# ⚠️ 주의: nginx 설정은 변경하지 마세요!
```

**현재 설정**:
- Domain: `defenderxs.in-bridge.com`
- SSL: 활성화 (`/etc/nginx/ssl/`)
- Proxy Target: `http://localhost:40014`
- Features: HTTP→HTTPS 리다이렉트, WebSocket 지원 (HMR)

---

## 📚 문서

### 개발자 가이드
- **`CLAUDE.md`** - Claude Code용 상세 가이드 (개발자 필독)
- **`README.md`** - 이 파일 (프로젝트 개요)

### MCP 가이드 (docs/)
| 문서 | 크기 | 설명 |
|------|------|------|
| `MCP_README.md` | 4.7KB | MCP 개요 및 빠른 시작 |
| `chrome-devtools_mcp.md` | 8.1KB | 브라우저 디버깅 자동화 |
| `context7_mcp.md` | 8.6KB | 최신 라이브러리 문서 |
| `postgres_mcp.md` | 11KB | 데이터베이스 접근 (SIEM & n8n) |
| `filesystem_mcp.md` | 7.4KB | 파일 시스템 작업 |
| `github_mcp.md` | 5.4KB | 저장소 통합 |
| `memory_mcp.md` | 7.7KB | 영구 메모리 |
| `brave-search_mcp.md` | 7.7KB | 웹 검색 |

### 기능 명세 (docs/)
- **`DASHBOARD_AI_TIMESERIES_SPEC.md`** (15KB) - AI 대시보드 상세 명세
- **`AI_PAGES_ANALYSIS_KR.md`** (80KB) - AI 페이지 종합 분석
- **`report2-implementation-plan.md`** (26KB) - 리포트 기능 구현 계획
- **`GEMINI.md`** (4.3KB) - Gemini 통합 가이드
- **`vendor-dashboard-comparison.md`** (3.8KB) - 벤더 용어 매핑

---

## 🛠️ 유틸리티 스크립트

### Incident Analyzer (`script/info.js`)

Cortex XDR 인시던트를 OpenSearch에서 가져와 분석합니다.

```bash
# 사용법
node script/info.js [INCIDENT_ID] [--summary|--full|--both]

# 예시
node script/info.js 414012 --summary
node script/info.js 414146 --both
```

**출력 파일**:
- `script/incident_[ID]_summary.json` - 요약 분석
- `script/incident_[ID]_full.json` - 전체 분석

**용도**: AI 리포트 생성 테스트 및 개발

---

## 📊 UX/UI 디자인 철학

### 정보 밀도 높은 전문가용 대시보드

- **디자인 시스템**: shadcn/ui "New York" 스타일
- **레이아웃**: 2단 레이아웃 (AppSidebar + Main Content)
- **색상**: 위협 심각도별 체계적 색상 시스템
- **다크 모드**: 완벽하게 지원 (장시간 모니터링 최적화)

### 주요 UI 패턴

| 패턴 | 설명 |
|------|------|
| **Hover-only Scrollbars** | 깔끔한 인터페이스 |
| **Gradient Backgrounds** | AI 패널 (Purple → Pink) |
| **Sticky PageHeader** | z-index 100, backdrop blur |
| **Real-time Toggle** | Live/Paused 모니터링 모드 |
| **Markdown Rendering** | AI 콘텐츠 (react-markdown + remark-gfm) |

---

## 🧪 테스팅

```bash
# Linting
pnpm lint

# Type Check
pnpm run type-check

# Prisma 스키마 검증
npx prisma validate

# AI 제공자 테스트
curl http://localhost:40014/ibai/test

# AI Copilot 테스트
curl -X POST http://localhost:40014/api/ai-copilot/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"최근 Critical 알림"}'
```

---

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 코딩 규칙

- **TypeScript** 사용
- **@ alias** 사용 (`@/lib/...`)
- **shadcn/ui New York 스타일** 준수
- **다크 모드** 지원 필수
- **Markdown** 콘텐츠는 `react-markdown` 사용

---

## 📜 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들 덕분에 가능했습니다:

- [Next.js](https://nextjs.org/) - React 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트
- [OpenSearch](https://opensearch.org/) - 검색 및 분석 엔진
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI 컨텍스트 표준
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI 통합 SDK

---

## 📞 연락처

프로젝트 관련 문의:
- 이슈: [GitHub Issues](https://github.com/your-org/defender-x/issues)
- 이메일: support@defender-x.com
- 웹사이트: [https://defenderxs.in-bridge.com](https://defenderxs.in-bridge.com)

---

## 🔗 유용한 링크

- [데모 사이트](https://defenderxs.in-bridge.com)
- [문서 (docs/)](docs/)
- [CLAUDE.md](CLAUDE.md) - 개발자 가이드
- [MITRE ATT&CK](https://attack.mitre.org/)
- [OpenSearch 문서](https://opensearch.org/docs/)

---

<div align="center">

**만든 사람들 ❤️ | DeFender X Team**

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!

</div>
