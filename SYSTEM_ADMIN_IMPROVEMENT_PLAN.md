# 시스템 관리 모듈 개선 계획서 (System Administration Module Improvement Plan)

**작성일**: 2025-11-23
**대상 모듈**: `/admin/*` (시스템 관리)
**목표**: 코드 일관성, 자동화, UX 개선

---

## 📋 목차

1. [현재 상태 분석](#1-현재-상태-분석)
2. [발견된 문제점](#2-발견된-문제점)
3. [개선 사항](#3-개선-사항)
4. [상세 개선 계획](#4-상세-개선-계획)
5. [데이터베이스 스키마 변경](#5-데이터베이스-스키마-변경)
6. [구현 우선순위](#6-구현-우선순위)
7. [테스트 계획](#7-테스트-계획)

---

## 1. 현재 상태 분석

### 1.1 시스템 관리 페이지 현황

| 페이지 | 경로 | 상태 | 비고 |
|--------|------|------|------|
| 회사 관리 | `/admin/company_management` | ⚠️ 부분 구현 | 코드 수동 입력 |
| 부서 관리 | `/admin/department_management` | ⚠️ 부분 구현 | 코드 수동 입력, 계층 구조 |
| 사용자 관리 | `/admin/user_management` | ✅ 구현됨 | - |
| 역할 관리 | `/admin/role_management` | ✅ 구현됨 | - |
| 메뉴 관리 | `/admin/menu_management` | ✅ 완전 구현 | 자동 코드, 계층 구조 지원 |
| 감사 로그 | `/admin/audit_logs` | ✅ 구현됨 | - |
| 시스템 설정 | `/admin/system_settings` | ✅ 구현됨 | - |

### 1.2 데이터 모델 현황

**회사 (Company)**
```sql
CREATE TABLE "Company" (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,  -- ❌ 수동 입력
  name JSONB NOT NULL,                -- ✅ 다국어
  description JSONB,                  -- ✅ 다국어
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**부서 (Department)**
```sql
CREATE TABLE "Department" (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES "Company"(id),
  parent_id INTEGER REFERENCES "Department"(id),
  code VARCHAR(50) UNIQUE NOT NULL,  -- ❌ 수동 입력
  name JSONB NOT NULL,                -- ✅ 다국어
  description JSONB,                  -- ✅ 다국어
  level INTEGER DEFAULT 1,            -- ✅ 계층 레벨
  path TEXT,                          -- ✅ 계층 경로
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**메뉴 아이템 (Menu Items - 참고용)**
```sql
CREATE TABLE siem_app.menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER,
  parent_id INTEGER REFERENCES siem_app.menu_items(id),
  name VARCHAR(100) NOT NULL,         -- ❌ 고유 이름 (영문)
  label JSONB NOT NULL,                -- ✅ 다국어
  href VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
)
```

### 1.3 기능 비교 (메뉴 관리 vs 회사/부서 관리)

| 기능 | 메뉴 관리 | 회사 관리 | 부서 관리 |
|------|-----------|-----------|-----------|
| 자동 코드 생성 | ✅ N/A (name 사용) | ❌ 수동 입력 | ❌ 수동 입력 |
| 다국어 지원 | ✅ label JSONB | ✅ name JSONB | ✅ name JSONB |
| 계층 구조 | ✅ parent_id | N/A | ✅ parent_id, level, path |
| 자식 추가 UI | ✅ "Add Child" 버튼 | N/A | ⚠️ Select 드롭다운만 |
| 드래그 앤 드롭 | ✅ order_index | N/A | N/A |
| 실시간 사이드바 반영 | ✅ 자동 | N/A | N/A |
| 감사 로그 | ✅ audit_logs 테이블 | ❌ 없음 | ❌ 없음 |

---

## 2. 발견된 문제점

### 2.1 코드 일관성 문제 (Critical 🔴)

**문제**: 회사 코드, 부서 코드를 사용자가 수동으로 입력
```typescript
// company_management/page.tsx (Line 424-431)
<Label htmlFor="code">{t('code')} *</Label>
<Input
  id="code"
  value={formData.code}
  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
  disabled={!!selectedCompany}  // ⚠️ 편집 시에도 변경 불가
  placeholder="COMP001"
/>
```

**문제점**:
1. **일관성 부족**: 사용자가 "COMP001", "COM-001", "C001" 등 자유롭게 입력 가능
2. **중복 위험**: 코드 중복 체크 로직이 클라이언트에만 존재 (서버 검증 미흡)
3. **유지보수 어려움**: 코드 패턴 변경 시 기존 데이터 마이그레이션 필요
4. **사용자 경험**: 코드 규칙을 외워야 함

**권장 해결책**:
- 자동 증분 코드 생성 (예: `COMP-0001`, `DEPT-0001`)
- 또는 UUID 기반 코드 (예: `COMP-a1b2c3d4`)
- 서버 사이드에서 고유성 보장

### 2.2 메뉴 계층 구조 확인 부족 (High 🟡)

**문제**: 메뉴 관리에서 부모-자식 관계가 제대로 저장되는지 미확인

**현재 코드 분석** (menu_management/page.tsx):
```typescript
// Line 462-503: saveMenuItem 함수
const payload = {
  name: formData.name,
  label: {
    ko: formData.label_ko,
    en: formData.label_en,
    ja: formData.label_ja,
    zh: formData.label_zh,
  },
  href: formData.href,
  icon: formData.icon || null,
  category_id: formData.category_id ? parseInt(formData.category_id) : null,
  parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,  // ✅ 전송됨
  order_index: formData.order_index,
}
```

**검증 필요 사항**:
1. ✅ `parent_id`가 올바르게 전송되는가?
2. ❓ API가 `parent_id`를 올바르게 저장하는가? → `/api/menu/items` 코드 확인 필요
3. ❓ 자식 메뉴가 사이드바에 중첩되어 표시되는가? → `SidebarWrapper` 로직 확인 필요
4. ❓ 부모 메뉴 삭제 시 자식 메뉴도 함께 삭제되는가? (CASCADE 동작)

### 2.3 사이드바 자동 반영 미확인 (High 🟡)

**문제**: 메뉴 생성 후 사이드바가 자동으로 업데이트되는지 미확인

**예상 동작**:
```
1. 사용자가 /admin/menu-management에서 새 메뉴 추가
2. API POST 요청 → DB에 메뉴 저장
3. 사이드바 컴포넌트가 메뉴 데이터 다시 fetch
4. 새 메뉴가 사이드바에 표시됨
```

**검증 필요**:
- `SidebarWrapper` (서버 컴포넌트)가 어떻게 데이터를 fetch하는가?
- 캐싱이 적용되어 있는가? (`revalidate` 옵션)
- 클라이언트 측 캐시 무효화가 필요한가? (TanStack Query, SWR 등)

### 2.4 부서 관리 UX 부족 (Medium 🟢)

**문제**: 부서의 자식 부서를 추가할 때 직관적인 UI 부족

**현재 구현** (department_management/page.tsx):
```typescript
// Line 450-468: 부모 부서 선택은 Select 드롭다운만 제공
<Select
  value={formData.parent_id}
  onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
  disabled={!formData.company_id}
>
  <SelectTrigger>
    <SelectValue placeholder={t('selectParent')} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">{t('noParent')}</SelectItem>
    {availableParents.map((dept) => (
      <SelectItem key={dept.id} value={dept.id.toString()}>
        {getIndentedName(dept)} ({dept.code})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**개선 필요**:
- 메뉴 관리처럼 테이블 행에 "Add Child" 버튼 추가
- 클릭 시 부모 부서가 자동으로 선택된 상태로 다이얼로그 오픈

### 2.5 감사 로그 부재 (Medium 🟢)

**문제**: 회사/부서 관리에 감사 로그(audit trail) 없음

**메뉴 관리의 감사 로그** (참고):
```sql
CREATE TABLE siem_app.audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50),
  record_id INTEGER,
  action VARCHAR(20),  -- 'INSERT', 'UPDATE', 'DELETE'
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**권장**:
- 회사/부서 변경 사항 추적
- 누가, 언제, 무엇을 변경했는지 기록
- 보안 감사 및 디버깅에 필수

### 2.6 다국어 일관성 문제 (Low 🔵)

**문제**: 일부 하드코딩된 한글 텍스트

**예시** (company_management/page.tsx):
```typescript
// Line 412-413: 하드코딩된 한글
<DialogDescription>
  {selectedCompany ? '회사 정보를 수정합니다' : '새로운 회사를 생성합니다'}
</DialogDescription>

// Line 418-419: 하드코딩된 한글
<TabsList className="grid w-full grid-cols-2">
  <TabsTrigger value="basic">기본 정보</TabsTrigger>
  <TabsTrigger value="multilingual">다국어</TabsTrigger>
</TabsList>
```

**개선 필요**:
- 모든 UI 텍스트를 `t()` 함수로 번역 처리
- `public/locales/{ko,en,ja,zh}/companyManagement.json` 파일에 추가

---

## 3. 개선 사항

### 3.1 우선순위별 개선 사항

#### 🔴 Critical (즉시 수정 필요)

1. **자동 코드 생성 시스템 구현**
   - 회사 코드: `COMP-{sequence:4}`
   - 부서 코드: `DEPT-{sequence:4}`
   - DB 시퀀스 또는 트리거 사용

2. **서버 사이드 코드 중복 검증**
   - UNIQUE 제약 조건 활용
   - API 레벨에서 명확한 에러 메시지 반환

#### 🟡 High (1주 이내)

3. **메뉴 계층 구조 검증 및 수정**
   - `/api/menu/items` API 코드 리뷰
   - `parent_id` 저장 로직 확인
   - 자식 메뉴 삭제 CASCADE 테스트

4. **사이드바 자동 반영 확인**
   - 메뉴 생성 후 `router.refresh()` 또는 캐시 무효화
   - Server Component revalidation 검증

5. **부서 관리 UX 개선**
   - "Add Child Department" 버튼 추가
   - 테이블 행별 액션 버튼

#### 🟢 Medium (2주 이내)

6. **감사 로그 시스템 확장**
   - `Company` 테이블에 트리거 추가
   - `Department` 테이블에 트리거 추가
   - 감사 로그 조회 API 및 UI

7. **코드 일관성 개선**
   - 모든 엔티티에 대한 코드 생성 규칙 문서화
   - 코드 포맷 validation 함수 공통 모듈화

#### 🔵 Low (3주 이내)

8. **다국어 완전 적용**
   - 하드코딩된 텍스트를 translation 키로 변경
   - 번역 파일 업데이트

9. **성능 최적화**
   - 부서 계층 구조 쿼리 최적화 (Recursive CTE)
   - 메뉴 데이터 Redis 캐싱 (선택사항)

---

## 4. 상세 개선 계획

### 4.1 자동 코드 생성 시스템

#### 4.1.1 데이터베이스 시퀀스 생성

```sql
-- 회사 코드 시퀀스
CREATE SEQUENCE IF NOT EXISTS company_code_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9999
  CYCLE;

-- 부서 코드 시퀀스
CREATE SEQUENCE IF NOT EXISTS department_code_seq
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9999
  CYCLE;
```

#### 4.1.2 코드 생성 함수

```sql
-- 회사 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_company_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  seq_num INTEGER;
BEGIN
  seq_num := nextval('company_code_seq');
  new_code := 'COMP-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 부서 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_department_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  seq_num INTEGER;
BEGIN
  seq_num := nextval('department_code_seq');
  new_code := 'DEPT-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;
```

#### 4.1.3 트리거 생성

```sql
-- 회사 테이블 트리거
CREATE OR REPLACE FUNCTION set_company_code()
RETURNS TRIGGER AS $$
BEGIN
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

-- 부서 테이블 트리거
CREATE OR REPLACE FUNCTION set_department_code()
RETURNS TRIGGER AS $$
BEGIN
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
```

#### 4.1.4 UI 수정

**회사 관리** (company_management/page.tsx):
```typescript
// Before
<Label htmlFor="code">{t('code')} *</Label>
<Input
  id="code"
  value={formData.code}
  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
  disabled={!!selectedCompany}
  placeholder="COMP001"
/>

// After
<Label htmlFor="code">{t('code')}</Label>
<Input
  id="code"
  value={formData.code}
  disabled={true}  // ✅ 항상 비활성화
  placeholder={t('autoGenerated')}
  className="bg-muted"
/>
<p className="text-sm text-muted-foreground">
  {t('codeAutoGeneratedHelp')}
</p>
```

**API 수정** (companies/route.ts):
```typescript
// POST - Create new company
const { name, description, address, phone, email, website, logo_url } = await request.json()

// ❌ 제거: code 필수 검증
// if (!code || !name) { ... }

// ✅ 변경: name만 필수
if (!name) {
  return NextResponse.json(
    { error: 'Name is required' },
    { status: 400 }
  )
}

// INSERT 시 code는 트리거가 자동 생성
const result = await query(
  `INSERT INTO "Company" (name, description, address, phone, email, website, logo_url)
   VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING *`,
  [name, description, address, phone, email, website, logo_url]
)
```

### 4.2 메뉴 계층 구조 검증

#### 4.2.1 API 검증 (menu/items/route.ts 확인 필요)

**확인할 사항**:
```typescript
// POST /api/menu/items
export async function POST(request: Request) {
  const { parent_id, category_id, name, label, href, icon, order_index } = await request.json()

  // ✅ parent_id가 NULL이 아닐 때 처리되는가?
  // ✅ parent_id가 유효한 menu_item id인가 검증하는가?
  // ✅ 순환 참조 방지 로직이 있는가? (A → B → A)

  const result = await query(
    `INSERT INTO siem_app.menu_items
     (category_id, parent_id, name, label, href, icon, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [category_id, parent_id, name, label, href, icon, order_index]
  )

  return NextResponse.json({ success: true, data: result.rows[0] })
}
```

#### 4.2.2 사이드바 데이터 구조 확인

**SidebarWrapper 로직 검증**:
```typescript
// src/components/sidebar-wrapper.tsx
async function getMenuData() {
  const result = await pool.query(`
    SELECT * FROM siem_app.menu_items
    WHERE is_active = true
    ORDER BY order_index
  `)

  // ❓ 여기서 parent_id를 사용해 계층 구조를 만드는가?
  // ✅ 필요: buildTree() 함수로 flat 배열을 tree로 변환

  const flatItems = result.rows
  const tree = buildTree(flatItems)  // parent_id 기반 트리 구축

  return tree
}

function buildTree(items: MenuItem[]): MenuItem[] {
  const itemMap = new Map()
  const rootItems: MenuItem[] = []

  // 1. 모든 아이템을 Map에 저장
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  // 2. parent_id를 사용해 계층 구조 구축
  items.forEach(item => {
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id)
      if (parent) {
        parent.children.push(itemMap.get(item.id))
      }
    } else {
      rootItems.push(itemMap.get(item.id))
    }
  })

  return rootItems
}
```

#### 4.2.3 테스트 시나리오

1. **기본 자식 메뉴 추가 테스트**
   ```
   1. 메뉴 관리에서 "대시보드" 메뉴 선택
   2. "Add Child" 버튼 클릭
   3. "개요" 메뉴 추가 (href: /dashboard/overview)
   4. 저장 후 좌측 사이드바 확인
   5. "대시보드" 아래에 "개요"가 중첩되어 표시되는지 확인
   ```

2. **다단계 계층 테스트**
   ```
   1. "대시보드" → "개요" → "상세 통계" (3단계)
   2. 각 레벨이 올바르게 들여쓰기되어 표시되는지 확인
   ```

3. **CASCADE 삭제 테스트**
   ```
   1. 부모 메뉴 삭제 시도
   2. 자식 메뉴도 함께 삭제되는지 확인
   3. 또는 경고 메시지 표시 후 삭제 방지
   ```

### 4.3 사이드바 자동 반영

#### 4.3.1 현재 동작 확인

**예상 흐름**:
```
[메뉴 관리 페이지]
  ↓
사용자가 메뉴 추가
  ↓
POST /api/menu/items
  ↓
DB에 INSERT
  ↓
fetchData() 호출 → 테이블 업데이트
  ↓
[❓] 사이드바는 언제 업데이트되는가?
```

**가능한 시나리오**:

1. **서버 컴포넌트 자동 리프레시**
   ```typescript
   // SidebarWrapper는 Server Component
   // 페이지 이동 시 자동으로 다시 렌더링됨
   // 하지만 같은 페이지에서는 업데이트 안됨
   ```

2. **클라이언트 라우터 리프레시**
   ```typescript
   // menu_management/page.tsx
   import { useRouter } from 'next/navigation'

   const router = useRouter()

   const saveMenuItem = async () => {
     // ... API 호출
     if (res.ok) {
       toast.success('Menu item created')
       setDialogOpen(false)
       fetchData()  // ✅ 테이블 업데이트
       router.refresh()  // ❓ 사이드바 리프레시?
     }
   }
   ```

3. **캐싱 문제**
   ```typescript
   // 만약 SidebarWrapper에서 fetch 시 캐싱이 적용되어 있다면:
   const res = await fetch('/api/menu/navigation', {
     next: { revalidate: 60 }  // ⚠️ 60초 동안 캐시됨
   })

   // 해결책: revalidate 시간 단축 또는 제거
   const res = await fetch('/api/menu/navigation', {
     cache: 'no-store'  // ✅ 캐싱 비활성화
   })
   ```

#### 4.3.2 권장 해결 방법

**옵션 1: Server Action 사용** (Next.js 15 권장)
```typescript
// src/app/actions/menu.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createMenuItem(data: MenuItemFormData) {
  // DB에 메뉴 추가
  const result = await pool.query(...)

  // 사이드바 캐시 무효화
  revalidatePath('/', 'layout')  // ✅ 레이아웃 전체 리프레시

  return { success: true, data: result.rows[0] }
}
```

**옵션 2: API Route에서 revalidatePath** (현재 구조 유지)
```typescript
// src/app/api/menu/items/route.ts
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  // ... 메뉴 생성 로직

  // 사이드바 캐시 무효화
  revalidatePath('/', 'layout')

  return NextResponse.json({ success: true })
}
```

**옵션 3: 클라이언트 측 전역 상태** (복잡도 증가)
```typescript
// Zustand 또는 Context API로 메뉴 상태 관리
// 권장하지 않음 (Server Component의 장점 상실)
```

### 4.4 부서 관리 UX 개선

#### 4.4.1 "Add Child Department" 버튼 추가

**Before**:
```typescript
// 테이블 행의 Actions 열에 Edit, Delete만 존재
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => handleDelete(department)}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</TableCell>
```

**After**:
```typescript
// "Add Child" 버튼 추가 (메뉴 관리 방식 차용)
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleAddChild(department)}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Plus className="h-3 w-3 mr-1" />
      Add Child
    </Button>
    <Button variant="ghost" size="sm" onClick={() => handleEdit(department)}>
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => handleDelete(department)}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</TableCell>

// 새 핸들러 함수
const handleAddChild = (parentDepartment: Department) => {
  setEditingDepartment(null)
  setFormData({
    company_id: parentDepartment.company_id.toString(),
    parent_id: parentDepartment.id.toString(),  // ✅ 자동 선택
    code: '',  // 자동 생성
    name: { ko: '', en: '', ja: '', zh: '' },
    description: { ko: '', en: '', ja: '', zh: '' }
  })
  fetchAvailableParents(parentDepartment.company_id.toString(), null)
  setIsDialogOpen(true)
}
```

#### 4.4.2 부모 부서 표시 개선

```typescript
// 다이얼로그에서 부모 부서가 선택되어 있을 때 명확히 표시
<DialogHeader>
  <DialogTitle>
    {editingDepartment
      ? t('editDepartment')
      : formData.parent_id
        ? `${t('addChildDepartment')}: ${getParentName(formData.parent_id)}`
        : t('createDepartment')}
  </DialogTitle>

  {formData.parent_id && !editingDepartment && (
    <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
      <Badge variant="outline">Parent Department</Badge>
      <span className="font-medium">{getParentName(formData.parent_id)}</span>
    </div>
  )}
</DialogHeader>
```

### 4.5 감사 로그 시스템 확장

#### 4.5.1 감사 로그 테이블 (기존 활용)

```sql
-- 기존 audit_logs 테이블 사용
CREATE TABLE IF NOT EXISTS siem_app.audit_logs (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,              -- ✅ 추가: 변경 전 값
  new_values JSONB,              -- ✅ 추가: 변경 후 값
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.5.2 감사 트리거 생성

```sql
-- 회사 테이블 감사 트리거
CREATE OR REPLACE FUNCTION audit_company_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES ('Company', OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES ('Company', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES ('Company', NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Company"
FOR EACH ROW EXECUTE FUNCTION audit_company_changes();

-- 부서 테이블 감사 트리거 (동일한 패턴)
CREATE OR REPLACE FUNCTION audit_department_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES ('Department', OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES ('Department', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES ('Department', NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER department_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Department"
FOR EACH ROW EXECUTE FUNCTION audit_department_changes();
```

#### 4.5.3 감사 로그 조회 UI

```typescript
// 회사 관리 페이지에 "View Audit Logs" 버튼 추가
<Button
  variant="outline"
  onClick={() => fetchCompanyAuditLogs(company.id)}
>
  <History className="h-4 w-4 mr-2" />
  Audit History
</Button>

// API: GET /api/admin/companies/{id}/audit-logs
const fetchCompanyAuditLogs = async (companyId: number) => {
  const res = await fetch(`/api/admin/companies/${companyId}/audit-logs`)
  const data = await res.json()
  setAuditLogs(data.logs)
  setAuditDialogOpen(true)
}
```

---

## 5. 데이터베이스 스키마 변경

### 5.1 마이그레이션 SQL 파일

**파일명**: `sql/improve_system_admin.sql`

```sql
-- ============================================================
-- 시스템 관리 모듈 개선 마이그레이션
-- 작성일: 2025-11-23
-- 목적: 자동 코드 생성, 감사 로그 확장
-- ============================================================

BEGIN;

-- 1. 시퀀스 생성
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

-- 2. 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_company_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  seq_num INTEGER;
BEGIN
  seq_num := nextval('company_code_seq');
  new_code := 'COMP-' || LPAD(seq_num::TEXT, 4, '0');

  -- 중복 검사 (만약을 위해)
  WHILE EXISTS (SELECT 1 FROM "Company" WHERE code = new_code) LOOP
    seq_num := nextval('company_code_seq');
    new_code := 'COMP-' || LPAD(seq_num::TEXT, 4, '0');
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_department_code()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  seq_num INTEGER;
BEGIN
  seq_num := nextval('department_code_seq');
  new_code := 'DEPT-' || LPAD(seq_num::TEXT, 4, '0');

  WHILE EXISTS (SELECT 1 FROM "Department" WHERE code = new_code) LOOP
    seq_num := nextval('department_code_seq');
    new_code := 'DEPT-' || LPAD(seq_num::TEXT, 4, '0');
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 3. 자동 코드 생성 트리거
CREATE OR REPLACE FUNCTION set_company_code()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION set_department_code()
RETURNS TRIGGER AS $$
BEGIN
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

-- 4. 감사 로그 테이블 확장 (old_values, new_values 추가)
ALTER TABLE siem_app.audit_logs
ADD COLUMN IF NOT EXISTS old_values JSONB,
ADD COLUMN IF NOT EXISTS new_values JSONB;

-- 5. 회사 감사 트리거
CREATE OR REPLACE FUNCTION audit_company_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES ('Company', OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES ('Company', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES ('Company', NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Company"
FOR EACH ROW EXECUTE FUNCTION audit_company_changes();

-- 6. 부서 감사 트리거
CREATE OR REPLACE FUNCTION audit_department_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, changed_by)
    VALUES ('Department', OLD.id, 'DELETE', row_to_json(OLD), current_user);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES ('Department', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO siem_app.audit_logs (table_name, record_id, action, new_values, changed_by)
    VALUES ('Department', NEW.id, 'INSERT', row_to_json(NEW), current_user);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER department_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Department"
FOR EACH ROW EXECUTE FUNCTION audit_department_changes();

-- 7. 기존 데이터 마이그레이션 (코드가 없는 경우 생성)
UPDATE "Company" SET code = generate_company_code() WHERE code IS NULL OR code = '';
UPDATE "Department" SET code = generate_department_code() WHERE code IS NULL OR code = '';

COMMIT;

-- 테스트 쿼리
SELECT * FROM "Company" ORDER BY id;
SELECT * FROM "Department" ORDER BY id;
SELECT * FROM siem_app.audit_logs ORDER BY changed_at DESC LIMIT 20;
```

### 5.2 롤백 SQL

**파일명**: `sql/rollback_improve_system_admin.sql`

```sql
BEGIN;

-- 트리거 삭제
DROP TRIGGER IF EXISTS before_insert_company_code ON "Company";
DROP TRIGGER IF EXISTS before_insert_department_code ON "Department";
DROP TRIGGER IF EXISTS company_audit_trigger ON "Company";
DROP TRIGGER IF EXISTS department_audit_trigger ON "Department";

-- 함수 삭제
DROP FUNCTION IF EXISTS set_company_code();
DROP FUNCTION IF EXISTS set_department_code();
DROP FUNCTION IF EXISTS generate_company_code();
DROP FUNCTION IF EXISTS generate_department_code();
DROP FUNCTION IF EXISTS audit_company_changes();
DROP FUNCTION IF EXISTS audit_department_changes();

-- 시퀀스 삭제
DROP SEQUENCE IF EXISTS company_code_seq;
DROP SEQUENCE IF EXISTS department_code_seq;

-- 감사 로그 컬럼 제거
ALTER TABLE siem_app.audit_logs DROP COLUMN IF EXISTS old_values;
ALTER TABLE siem_app.audit_logs DROP COLUMN IF EXISTS new_values;

COMMIT;
```

---

## 6. 구현 우선순위

### Phase 1: 즉시 수정 (1-2일)

- [x] 개선 계획 문서 작성
- [ ] **DB 마이그레이션 실행** (`sql/improve_system_admin.sql`)
- [ ] **회사 관리 UI 수정** (코드 입력 필드 제거)
- [ ] **부서 관리 UI 수정** (코드 입력 필드 제거)
- [ ] **API 검증 로직 수정** (code 필수 체크 제거)

### Phase 2: 메뉴 검증 (3-4일)

- [ ] `/api/menu/items` API 코드 리뷰
- [ ] `parent_id` 저장 로직 확인
- [ ] `SidebarWrapper` 계층 구조 렌더링 확인
- [ ] 메뉴 생성 후 사이드바 자동 반영 테스트
- [ ] CASCADE 삭제 동작 테스트
- [ ] 필요 시 `revalidatePath` 추가

### Phase 3: UX 개선 (5-7일)

- [ ] 부서 관리에 "Add Child" 버튼 추가
- [ ] 부모 부서 선택 시 UI 개선
- [ ] 감사 로그 조회 API 구현
- [ ] 감사 로그 조회 UI 구현
- [ ] 다국어 번역 파일 업데이트

### Phase 4: 테스트 및 문서화 (8-10일)

- [ ] 전체 기능 통합 테스트
- [ ] 회귀 테스트 (기존 기능 동작 확인)
- [ ] 사용자 매뉴얼 업데이트
- [ ] 개발자 문서 업데이트

---

## 7. 테스트 계획

### 7.1 단위 테스트

#### 7.1.1 코드 생성 함수 테스트

```sql
-- 회사 코드 생성 테스트
SELECT generate_company_code();  -- COMP-0001
SELECT generate_company_code();  -- COMP-0002
SELECT generate_company_code();  -- COMP-0003

-- 부서 코드 생성 테스트
SELECT generate_department_code();  -- DEPT-0001
SELECT generate_department_code();  -- DEPT-0002
```

#### 7.1.2 트리거 테스트

```sql
-- 회사 생성 시 자동 코드 부여 테스트
INSERT INTO "Company" (name)
VALUES ('{"ko": "테스트 회사", "en": "Test Company"}'::jsonb)
RETURNING *;
-- 예상 결과: code = "COMP-0004"

-- 코드 중복 테스트
INSERT INTO "Company" (code, name)
VALUES ('COMP-0001', '{"ko": "중복 테스트", "en": "Duplicate Test"}'::jsonb);
-- 예상 결과: ERROR - duplicate key value violates unique constraint
```

#### 7.1.3 감사 로그 테스트

```sql
-- 회사 생성 후 감사 로그 확인
INSERT INTO "Company" (name) VALUES ('{"ko": "감사 로그 테스트"}'::jsonb);

SELECT * FROM siem_app.audit_logs
WHERE table_name = 'Company'
ORDER BY changed_at DESC
LIMIT 1;
-- 예상 결과: action = 'INSERT', new_values에 회사 정보 포함

-- 회사 수정 후 감사 로그 확인
UPDATE "Company" SET name = '{"ko": "수정된 회사"}'::jsonb WHERE code = 'COMP-0005';

SELECT * FROM siem_app.audit_logs
WHERE table_name = 'Company' AND action = 'UPDATE'
ORDER BY changed_at DESC
LIMIT 1;
-- 예상 결과: old_values와 new_values 모두 포함
```

### 7.2 통합 테스트

#### 7.2.1 회사 관리 E2E 테스트

1. **회사 생성**
   - `/admin/company_management` 접속
   - "Add Company" 버튼 클릭
   - 코드 필드가 비활성화되어 있는지 확인
   - 회사 이름 입력 (4개 언어)
   - "Save" 클릭
   - 성공 토스트 메시지 확인
   - 테이블에 새 회사 표시되는지 확인
   - 코드가 `COMP-0001` 형식인지 확인

2. **회사 수정**
   - 회사 행의 "Edit" 버튼 클릭
   - 코드 필드가 비활성화되어 있는지 확인
   - 회사 이름 수정
   - "Save" 클릭
   - 변경 사항 반영 확인

3. **감사 로그 조회**
   - "View Audit History" 버튼 클릭
   - 생성, 수정 이력 표시 확인

#### 7.2.2 부서 관리 E2E 테스트

1. **최상위 부서 생성**
   - `/admin/department_management` 접속
   - "Add Department" 버튼 클릭
   - 회사 선택
   - 부모 부서 = "None" 선택
   - 부서 이름 입력
   - "Save" 클릭
   - 코드가 `DEPT-0001` 형식인지 확인

2. **자식 부서 생성 (새로운 UX)**
   - 부서 행에 마우스 오버
   - "Add Child" 버튼 표시 확인
   - "Add Child" 버튼 클릭
   - 부모 부서가 자동 선택되어 있는지 확인
   - 자식 부서 이름 입력
   - "Save" 클릭
   - 테이블에서 들여쓰기되어 표시되는지 확인

3. **계층 구조 확인**
   - Level 표시 확인 (Level 1, Level 2, ...)
   - Path 확인 (/1/2/3 형식)

#### 7.2.3 메뉴 관리 E2E 테스트

1. **자식 메뉴 추가**
   - `/admin/menu_management` 접속
   - 기존 메뉴 행에서 "Add Child" 버튼 클릭
   - 부모 메뉴 정보 표시 확인
   - 자식 메뉴 정보 입력
   - "Save" 클릭

2. **사이드바 반영 확인**
   - 페이지를 리프레시하지 않고 좌측 사이드바 확인
   - 새 메뉴가 표시되는지 확인
   - 또는 페이지 리프레시 후 확인

3. **계층 구조 확인**
   - 부모 메뉴 확장 시 자식 메뉴 표시되는지 확인
   - 3단계 이상 중첩 테스트

### 7.3 성능 테스트

#### 7.3.1 대량 데이터 테스트

```sql
-- 1000개 회사 생성
DO $$
BEGIN
  FOR i IN 1..1000 LOOP
    INSERT INTO "Company" (name)
    VALUES (jsonb_build_object(
      'ko', '회사 ' || i,
      'en', 'Company ' || i
    ));
  END LOOP;
END $$;

-- 코드 생성 속도 확인
SELECT code FROM "Company" ORDER BY id DESC LIMIT 10;
-- 예상: COMP-1000, COMP-0999, ...

-- 감사 로그 볼륨 확인
SELECT COUNT(*) FROM siem_app.audit_logs WHERE table_name = 'Company';
-- 예상: 1000개 (INSERT)
```

#### 7.3.2 쿼리 성능 테스트

```sql
-- 부서 계층 조회 성능
EXPLAIN ANALYZE
SELECT * FROM "Department"
WHERE company_id = 1
ORDER BY path, order_index;

-- 메뉴 계층 조회 성능
EXPLAIN ANALYZE
SELECT * FROM siem_app.menu_items
WHERE is_active = true
ORDER BY category_id, order_index;
```

### 7.4 회귀 테스트 체크리스트

- [ ] 기존 회사 데이터가 정상 표시되는가?
- [ ] 기존 부서 데이터가 정상 표시되는가?
- [ ] 회사 삭제 시 관련 부서도 삭제되는가? (CASCADE)
- [ ] 사용자 관리 기능이 정상 동작하는가?
- [ ] 역할 관리 기능이 정상 동작하는가?
- [ ] 메뉴 관리 기능이 정상 동작하는가?
- [ ] 사이드바 메뉴가 정상 표시되는가?
- [ ] 다국어 전환이 정상 동작하는가?
- [ ] 다크 모드 전환이 정상 동작하는가?

---

## 8. 예상 리스크 및 대응 방안

### 8.1 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| 기존 데이터의 코드 포맷이 다름 | High | Medium | 마이그레이션 스크립트로 일괄 변환 |
| 사이드바 자동 반영 안됨 | High | Low | revalidatePath 추가 |
| 코드 생성 시퀀스 중복 | Medium | Low | 중복 검사 로직 추가 (함수 내) |
| 감사 로그 볼륨 증가 | Low | High | 주기적 아카이빙 계획 수립 |
| 성능 저하 (트리거 오버헤드) | Low | Low | 인덱스 최적화, 비동기 처리 고려 |

### 8.2 롤백 계획

1. **DB 롤백**: `sql/rollback_improve_system_admin.sql` 실행
2. **코드 롤백**: Git에서 이전 커밋으로 revert
3. **캐시 클리어**: Next.js 빌드 캐시 삭제
4. **서버 재시작**: PM2 restart

---

## 9. 결론

### 9.1 개선 효과

1. **사용자 경험 향상**
   - 코드를 기억하고 입력할 필요 없음
   - 직관적인 "Add Child" 버튼
   - 감사 로그로 변경 이력 추적 가능

2. **데이터 일관성**
   - 모든 코드가 `COMP-0001`, `DEPT-0001` 형식으로 통일
   - DB 레벨에서 고유성 보장
   - 중복 코드 방지

3. **유지보수성**
   - 코드 생성 로직이 DB 함수로 중앙화
   - 감사 트리거로 자동 로깅
   - 향후 코드 포맷 변경 시 함수만 수정

4. **보안 및 컴플라이언스**
   - 모든 변경 사항 추적 (GDPR, ISO 27001 대응)
   - 누가, 언제, 무엇을 변경했는지 명확히 기록

### 9.2 다음 단계

1. ✅ 이 문서를 검토하고 승인 받기
2. ⏳ TODO 리스트 생성 (Phase별 작업 항목)
3. ⏳ DB 마이그레이션 실행 (개발 환경)
4. ⏳ 코드 수정 시작 (Phase 1)
5. ⏳ 테스트 수행
6. ⏳ 프로덕션 배포

---

**작성자**: Claude Code
**검토자**: [개발팀장]
**승인자**: [PM/PO]
**버전**: 1.0
**최종 수정일**: 2025-11-23
