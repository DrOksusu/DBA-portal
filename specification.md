# VIBE 치과 경영 분석 시스템 - 마이크로서비스 바이브코딩 스크립트

## 프로젝트 개요

**프로젝트명**: VIBE Dental Management System
**설명**: 치과 병원의 매출, 직원, 인센티브, 재고를 관리하는 마이크로서비스 기반 풀스택 웹 애플리케이션
**아키텍처**: 마이크로서비스 + API Gateway + SSO

### 주요 기능
1. **일계표/매출 관리**: 일일 수입/지출 기록, Excel 업로드, 매출 분석
2. **HR 관리**: 직원 정보, 급여, 인센티브, 목표매출
3. **재고 관리**: 의료용품, 구강용품 재고 및 판매
4. **마케팅**: SMS/카카오톡 발송, 환자 관리
5. **인증**: SSO, OAuth 2.0 Provider
6. **관리자**: 사용자 승인, 권한 관리

---

## 기술 스택

### 프론트엔드
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **상태관리**: TanStack Query + Zustand
- **차트**: Recharts
- **Excel**: XLSX
- **드래그앤드롭**: @dnd-kit

### 백엔드 (각 마이크로서비스)
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18
- **Language**: TypeScript
- **ORM**: Prisma
- **인증**: JWT (jsonwebtoken)
- **검증**: Zod

### 인프라
- **API Gateway**: Nginx
- **Database**: MySQL 8.0 (AWS Lightsail)
- **Container**: Docker + Docker Compose
- **메시지**: Solapi (SMS), Kakao API

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              클라이언트 (Next.js)                           │
│                            dba-portal.kr                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Gateway (Nginx)                               │
│                           api.dba-portal.kr                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │   • JWT 검증  • 라우팅  • Rate Limiting  • 로깅  • CORS            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │           │           │           │           │           │
          ▼           ▼           ▼           ▼           ▼           ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  Auth   │   │ Revenue │   │   HR    │   │Inventory│   │Marketing│   │ Clinic  │
│ Service │   │ Service │   │ Service │   │ Service │   │ Service │   │ Service │
│  :3001  │   │  :3002  │   │  :3003  │   │  :3004  │   │  :3005  │   │  :3006  │
└────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
     │             │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│vibe_auth│   │vibe_    │   │ vibe_hr │   │vibe_    │   │vibe_    │   │vibe_    │
│   DB    │   │revenue  │   │   DB    │   │inventory│   │marketing│   │clinic   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

---

## 도메인 구조

| 도메인 | 용도 | 포트 |
|--------|------|------|
| `dba-portal.kr` | 프론트엔드 (Next.js) | 3000 |
| `api.dba-portal.kr` | API Gateway | 80/443 |
| `auth.dba-portal.kr` | Auth Service | 3001 |
| `report.dba-portal.kr` | Revenue Service | 3002 |
| `hr.dba-portal.kr` | HR Service | 3003 |
| `inventory.dba-portal.kr` | Inventory Service | 3004 |
| `marketing.dba-portal.kr` | Marketing Service | 3005 |
| `clinic.dba-portal.kr` | Clinic Service | 3006 |

---

## 프로젝트 구조

```
dba-portal/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
│
├── gateway/                          # API Gateway
│   ├── nginx.conf
│   ├── includes/
│   │   └── auth_check.conf
│   └── Dockerfile
│
├── services/
│   ├── auth-service/                 # 인증 서비스 (:3001)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   └── oauth.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── token.service.ts
│   │   │   │   └── oauth.service.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   └── oauth.routes.ts
│   │   │   ├── middlewares/
│   │   │   │   └── internal.middleware.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── revenue-service/              # 매출/일계표 서비스 (:3002)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── dailyReport.controller.ts
│   │   │   │   ├── analytics.controller.ts
│   │   │   │   └── excel.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── dailyReport.service.ts
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── excel.service.ts
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── hr-service/                   # HR 서비스 (:3003)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── employee.controller.ts
│   │   │   │   ├── salary.controller.ts
│   │   │   │   ├── incentive.controller.ts
│   │   │   │   └── target.controller.ts
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── inventory-service/            # 재고 서비스 (:3004)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── inventory.controller.ts
│   │   │   │   └── oralProduct.controller.ts
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── marketing-service/            # 마케팅 서비스 (:3005)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── sms.controller.ts
│   │   │   │   ├── kakao.controller.ts
│   │   │   │   └── patient.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── solapi.service.ts
│   │   │   │   └── kakao.service.ts
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── clinic-service/               # 병원/조직 서비스 (:3006)
│       ├── src/
│       │   ├── controllers/
│       │   │   ├── clinic.controller.ts
│       │   │   ├── team.controller.ts
│       │   │   └── preference.controller.ts
│       │   ├── services/
│       │   ├── routes/
│       │   └── server.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── Dockerfile
│       └── package.json
│
├── shared/                            # 공유 라이브러리 (npm workspace)
│   ├── auth-middleware/
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── service-client/
│   │   ├── src/index.ts
│   │   └── package.json
│   ├── types/
│   │   ├── src/index.ts
│   │   └── package.json
│   └── utils/
│       ├── src/
│       │   ├── logger.ts
│       │   └── errors.ts
│       └── package.json
│
├── frontend/                          # Next.js 프론트엔드
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (protected)/
│   │   │   ├── layout.tsx
│   │   │   ├── daily-report/page.tsx
│   │   │   ├── management/
│   │   │   │   ├── page.tsx
│   │   │   │   └── team-incentive/[teamName]/page.tsx
│   │   │   ├── hr-management/page.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   └── oral-products/page.tsx
│   │   │   └── marketing/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   └── members/page.tsx
│   │   ├── clinic-settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── modals/
│   │   └── features/
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── utils/
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── QueryProvider.tsx
│   ├── middleware.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── scripts/
    ├── init-databases.sql
    ├── migrate-all.sh
    └── dev.sh
```

---

## 마이크로서비스 상세

### 1. Auth Service (인증 서비스)

**책임**: 인증, 인가, 사용자 관리, OAuth 2.0 Provider
**데이터베이스**: `vibe_auth`
**포트**: 3001

#### Prisma Schema

```prisma
// services/auth-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(uuid())
  email         String     @unique
  password      String?
  name          String?
  role          UserRole   @default(USER)
  status        UserStatus @default(PENDING)
  clinicId      String?    @map("clinic_id")
  teamName      String?    @map("team_name")
  isTeamLeader  Boolean    @default(false) @map("is_team_leader")
  permissions   Json?
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")

  refreshTokens RefreshToken[]

  @@index([clinicId])
  @@index([email])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique @db.VarChar(500)
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

model OAuthClient {
  id           String   @id @default(uuid())
  clientId     String   @unique @map("client_id")
  clientSecret String   @map("client_secret")
  name         String
  redirectUris Json     @map("redirect_uris")
  grants       Json
  scopes       Json
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("oauth_clients")
}

model OAuthToken {
  id           String   @id @default(uuid())
  accessToken  String   @unique @map("access_token") @db.VarChar(500)
  refreshToken String?  @unique @map("refresh_token") @db.VarChar(500)
  clientId     String   @map("client_id")
  userId       String   @map("user_id")
  scopes       Json
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("oauth_tokens")
}

model AuthorizationCode {
  id          String   @id @default(uuid())
  code        String   @unique
  clientId    String   @map("client_id")
  userId      String   @map("user_id")
  redirectUri String   @map("redirect_uri")
  scopes      Json
  expiresAt   DateTime @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("authorization_codes")
}

enum UserRole {
  USER
  ADMIN
  TEAM_LEADER
  MANAGER
}

enum UserStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### API Endpoints

```
# 인증
POST   /auth/login              # 로그인 → access_token, refresh_token 발급
POST   /auth/signup             # 회원가입
POST   /auth/logout             # 로그아웃 (토큰 무효화)
POST   /auth/refresh            # 토큰 갱신
POST   /auth/reset-password     # 비밀번호 재설정 요청
POST   /auth/verify             # 토큰 검증 (Gateway/내부 서비스용)

# 사용자 관리
GET    /users/me                # 내 정보 조회
PUT    /users/me                # 내 정보 수정
GET    /users/pending           # 승인 대기자 목록 (Admin)
POST   /users/:id/approve       # 사용자 승인 (Admin)
POST   /users/:id/reject        # 사용자 거절 (Admin)
PUT    /users/:id/role          # 역할 변경 (Admin)
GET    /users                   # 사용자 목록 (Admin)

# OAuth 2.0 Provider (외부 앱 연동용)
GET    /oauth/authorize         # 인증 요청 페이지
POST   /oauth/token             # 토큰 발급
GET    /oauth/userinfo          # 사용자 정보 조회
POST   /oauth/revoke            # 토큰 취소
```

---

### 2. Revenue Service (매출/일계표 서비스)

**책임**: 일계표 CRUD, 매출 분석, Excel 업로드
**데이터베이스**: `vibe_revenue`
**포트**: 3002

#### Prisma Schema

```prisma
// services/revenue-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model DailyReport {
  id              String          @id @default(uuid())
  clinicId        String          @map("clinic_id")
  userId          String          @map("user_id")
  reportDate      String          @map("report_date") // YYYY-MM-DD
  type            DailyReportType

  // 공통
  chartNumber     String?         @map("chart_number")
  patientName     String?         @map("patient_name")
  memo            String?         @db.Text

  // 수입 (INCOME)
  cashAmount      Int?            @map("cash_amount")
  cardAmount      Int?            @map("card_amount")
  transferAmount  Int?            @map("transfer_amount")

  // 지출 (EXPENSE)
  expenseAmount   Int?            @map("expense_amount")
  expenseCategory String?         @map("expense_category")

  // 구강용품 판매 (ORAL_PRODUCT_SALE)
  productCode     String?         @map("product_code")
  productName     String?         @map("product_name")
  quantity        Int?            @default(1)
  unitPrice       Int?            @map("unit_price")
  discountRate    Decimal?        @map("discount_rate") @db.Decimal(5, 2)
  paymentMethod   String?         @map("payment_method")

  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  @@index([clinicId, reportDate])
  @@index([userId, reportDate])
  @@index([type, reportDate])
  @@map("daily_reports")
}

model MonthlyAnalyticsCache {
  id                  String   @id @default(uuid())
  clinicId            String   @map("clinic_id")
  year                Int
  month               Int

  totalRevenue        Int      @map("total_revenue")
  cashRevenue         Int      @default(0) @map("cash_revenue")
  cardRevenue         Int      @default(0) @map("card_revenue")
  transferRevenue     Int      @default(0) @map("transfer_revenue")
  totalExpense        Int      @default(0) @map("total_expense")
  expenseByCategory   Json?    @map("expense_by_category")

  oralProductSales    Int      @default(0) @map("oral_product_sales")
  oralProductQuantity Int      @default(0) @map("oral_product_quantity")

  netProfit           Int      @map("net_profit")
  profitMargin        Decimal  @map("profit_margin") @db.Decimal(5, 2)
  dailyAverageRevenue Int      @map("daily_average_revenue")

  transactionCount    Int      @default(0) @map("transaction_count")
  patientCount        Int      @default(0) @map("patient_count")

  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  @@unique([clinicId, year, month])
  @@map("monthly_analytics_cache")
}

enum DailyReportType {
  INCOME
  EXPENSE
  ORAL_PRODUCT_SALE
}
```

#### API Endpoints

```
# 일계표
GET    /daily-reports                    # 조회 (?date=YYYY-MM-DD)
POST   /daily-reports/income             # 수입 생성
POST   /daily-reports/expense            # 지출 생성
POST   /daily-reports/oral-sales         # 구강용품 판매 생성
PUT    /daily-reports/:id                # 수정
DELETE /daily-reports/:id                # 삭제
GET    /daily-reports/daily-closing      # 일계마감 조회
GET    /daily-reports/revenue-stats      # 매출통계 (?year=YYYY&month=MM)
GET    /daily-reports/dates              # 입력된 날짜 목록

# 분석
GET    /analytics/monthly/:year/:month   # 월별 분석
GET    /analytics/yearly/:year           # 연간 분석
POST   /analytics/cache/refresh          # 캐시 강제 갱신

# Excel
POST   /excel/upload                     # Excel 파일 업로드 및 파싱
POST   /excel/import                     # 파싱된 데이터 저장

# 내부 API (서비스 간 통신용)
GET    /internal/revenue/monthly-total   # HR에서 인센티브 계산 시 호출
```

---

### 3. HR Service (인사/급여 서비스)

**책임**: 직원 관리, 급여, 인센티브, 목표매출
**데이터베이스**: `vibe_hr`
**포트**: 3003

#### Prisma Schema

```prisma
// services/hr-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Employee {
  id             String   @id @default(uuid())
  clinicId       String   @map("clinic_id")
  employeeNumber String?  @map("employee_number")
  name           String
  position       String?
  role           String?  // 진료부, 원무부 등
  isActive       Boolean  @default(true) @map("is_active")
  hireDate       DateTime? @map("hire_date")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  salaryRecords    SalaryRecord[]
  monthlySnapshots MonthlyEmployee[]

  @@unique([clinicId, employeeNumber])
  @@index([clinicId, name])
  @@map("employees")
}

model MonthlyEmployee {
  id              String    @id @default(uuid())
  clinicId        String    @map("clinic_id")
  employeeId      String    @map("employee_id")
  recordMonth     String    @map("record_month") // YYYY-MM
  name            String
  position        String?
  role            String?
  teamName        String?   @map("team_name")
  status          String?   // 재직, 퇴사, 휴직
  resignationDate DateTime? @map("resignation_date")
  createdAt       DateTime  @default(now()) @map("created_at")

  employee Employee @relation(fields: [employeeId], references: [id])

  @@unique([clinicId, employeeId, recordMonth])
  @@index([clinicId, recordMonth])
  @@map("monthly_employees")
}

model SalaryRecord {
  id             String   @id @default(uuid())
  clinicId       String   @map("clinic_id")
  employeeId     String   @map("employee_id")
  employeeName   String   @map("employee_name")
  recordMonth    String   @map("record_month") // YYYY-MM
  basicSalary    Int      @map("basic_salary")
  totalAllowance Int      @default(0) @map("total_allowance")
  totalDeduction Int      @default(0) @map("total_deduction")
  netSalary      Int      @map("net_salary")
  details        Json?
  createdAt      DateTime @default(now()) @map("created_at")

  employee Employee @relation(fields: [employeeId], references: [id])

  @@index([clinicId, recordMonth])
  @@map("salary_records")
}

model MonthlyIncentive {
  id                    String   @id @default(uuid())
  clinicId              String   @map("clinic_id")
  year                  Int
  month                 Int      @db.SmallInt

  clinicalIncentiveRate Decimal? @map("clinical_incentive_rate") @db.Decimal(5, 2)
  deskIncentiveRate     Decimal? @map("desk_incentive_rate") @db.Decimal(5, 2)

  totalIncentive        Int      @default(0) @map("total_incentive")
  clinicalIncentive     Int      @default(0) @map("clinical_incentive")
  deskIncentive         Int      @default(0) @map("desk_incentive")

  incentiveData         Json?    @map("incentive_data")

  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@unique([clinicId, year, month])
  @@map("monthly_incentives")
}

model MonthlyTargetRevenue {
  id                   String   @id @default(uuid())
  clinicId             String   @map("clinic_id")
  year                 Int
  month                Int      @db.SmallInt

  targetRevenue        BigInt   @default(0) @map("target_revenue")
  laborCostRatio       Decimal  @default(30.00) @map("labor_cost_ratio") @db.Decimal(5, 2)

  totalLaborCost       BigInt   @default(0) @map("total_labor_cost")
  clinicalLaborCost    BigInt   @default(0) @map("clinical_labor_cost")
  nonClinicalLaborCost BigInt   @default(0) @map("non_clinical_labor_cost")

  fullData             Json?    @map("full_data")

  savedBy              String?  @map("saved_by")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  @@unique([clinicId, year, month])
  @@map("monthly_target_revenues")
}
```

#### API Endpoints

```
# 직원
GET    /employees                        # 목록
POST   /employees                        # 생성
GET    /employees/:id                    # 상세
PUT    /employees/:id                    # 수정
DELETE /employees/:id                    # 삭제
POST   /employees/snapshot               # 월별 스냅샷 생성
GET    /employees/monthly                # 월별 직원 조회 (?month=YYYY-MM)

# 급여
GET    /salary/:year/:month              # 급여 목록
POST   /salary                           # 급여 저장
PUT    /salary/:id                       # 급여 수정

# 인센티브
GET    /incentives/:year/:month          # 인센티브 조회
POST   /incentives                       # 인센티브 저장
GET    /incentives/team/:teamName/:year/:month  # 팀별 인센티브

# 목표매출
GET    /targets/:year/:month             # 목표매출 조회
POST   /targets                          # 목표매출 저장

# 성과분석
GET    /performance/team-member/:year/:month    # 팀원별 성과
GET    /performance/assistant/:year/:month      # 어시스턴트별 분석

# 내부 API
GET    /internal/employees               # 직원 목록 (다른 서비스용)
```

---

### 4. Inventory Service (재고/구강용품 서비스)

**책임**: 재고 관리, 구강용품 마스터, 판매 기록
**데이터베이스**: `vibe_inventory`
**포트**: 3004

#### Prisma Schema

```prisma
// services/inventory-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model InventoryItem {
  id            String    @id @default(uuid())
  clinicId      String    @map("clinic_id")
  itemCode      String    @map("item_code")
  itemName      String    @map("item_name")
  category      String    // 소모품, 의약품, 기구
  currentStock  Int       @default(0) @map("current_stock")
  minStock      Int       @default(0) @map("min_stock")
  unit          String?
  price         Int?
  expiryDate    DateTime? @map("expiry_date")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  stockLogs InventoryStockLog[]

  @@unique([clinicId, itemCode])
  @@map("inventory_items")
}

model InventoryStockLog {
  id          String       @id @default(uuid())
  itemId      String       @map("item_id")
  type        StockLogType
  quantity    Int
  reason      String?
  performedBy String?      @map("performed_by")
  createdAt   DateTime     @default(now()) @map("created_at")

  item InventoryItem @relation(fields: [itemId], references: [id])

  @@index([itemId, createdAt])
  @@map("inventory_stock_logs")
}

model OralProduct {
  id            String   @id @default(uuid())
  clinicId      String   @map("clinic_id")
  productCode   String   @map("product_code")
  productName   String   @map("product_name")
  category      String?
  purchasePrice Int      @map("purchase_price")
  salePrice     Int      @map("sale_price")
  currentStock  Int      @default(0) @map("current_stock")
  vendor        String?
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  sales OralProductSale[]

  @@unique([clinicId, productCode])
  @@map("oral_products")
}

model OralProductSale {
  id           String   @id @default(uuid())
  clinicId     String   @map("clinic_id")
  productId    String   @map("product_id")
  saleDate     DateTime @map("sale_date")
  quantity     Int
  unitPrice    Int      @map("unit_price")
  totalAmount  Int      @map("total_amount")
  saleType     String   @map("sale_type") // patient, staff
  assistName   String?  @map("assist_name")
  customerName String?  @map("customer_name")
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")

  product OralProduct @relation(fields: [productId], references: [id])

  @@index([clinicId, saleDate])
  @@map("oral_product_sales")
}

enum StockLogType {
  IN
  OUT
  ADJUST
}
```

#### API Endpoints

```
# 재고
GET    /inventory                  # 목록
POST   /inventory                  # 생성
PUT    /inventory/:id              # 수정
DELETE /inventory/:id              # 삭제
POST   /inventory/:id/stock        # 입출고 처리
GET    /inventory/low-stock        # 저재고 항목
GET    /inventory/expiring         # 만료 임박 항목

# 구강용품
GET    /oral-products              # 목록
POST   /oral-products              # 생성
PUT    /oral-products/:id          # 수정
DELETE /oral-products/:id          # 삭제
POST   /oral-products/import       # Excel 일괄 등록

# 구강용품 판매
GET    /oral-products/sales        # 판매 목록
POST   /oral-products/sales        # 판매 기록
GET    /oral-products/sales/stats  # 판매 통계
```

---

### 5. Marketing Service (마케팅/메시지 서비스)

**책임**: SMS/카카오톡 발송, 환자 관리
**데이터베이스**: `vibe_marketing`
**포트**: 3005

#### Prisma Schema

```prisma
// services/marketing-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Patient {
  id          String    @id @default(uuid())
  clinicId    String    @map("clinic_id")
  chartNumber String?   @map("chart_number")
  name        String
  phone       String?
  birthDate   DateTime? @map("birth_date")
  gender      String?
  memo        String?   @db.Text
  lastVisit   DateTime? @map("last_visit")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  messageLogs MessageLog[]

  @@index([clinicId, phone])
  @@index([clinicId, chartNumber])
  @@map("patients")
}

model MessageTemplate {
  id        String      @id @default(uuid())
  clinicId  String      @map("clinic_id")
  name      String
  type      MessageType
  content   String      @db.Text
  variables Json?       // ["name", "date", "amount"]
  isActive  Boolean     @default(true) @map("is_active")
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  @@map("message_templates")
}

model MessageLog {
  id         String        @id @default(uuid())
  clinicId   String        @map("clinic_id")
  patientId  String?       @map("patient_id")
  type       MessageType
  receiver   String
  content    String        @db.Text
  status     MessageStatus @default(PENDING)
  sentAt     DateTime?     @map("sent_at")
  resultCode String?       @map("result_code")
  resultMsg  String?       @map("result_msg")
  createdAt  DateTime      @default(now()) @map("created_at")

  patient Patient? @relation(fields: [patientId], references: [id])

  @@index([clinicId, createdAt])
  @@index([status])
  @@map("message_logs")
}

enum MessageType {
  SMS
  LMS
  MMS
  KAKAO_ALIMTALK
  KAKAO_FRIENDTALK
}

enum MessageStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
}
```

#### API Endpoints

```
# SMS
POST   /sms/send                   # 단건 발송
POST   /sms/bulk                   # 대량 발송
GET    /sms/history                # 발송 이력

# 카카오
POST   /kakao/alimtalk             # 알림톡 발송
POST   /kakao/friendtalk           # 친구톡 발송

# 템플릿
GET    /templates                  # 목록
POST   /templates                  # 생성
PUT    /templates/:id              # 수정
DELETE /templates/:id              # 삭제

# 환자
GET    /patients                   # 목록
POST   /patients                   # 생성
PUT    /patients/:id               # 수정
DELETE /patients/:id               # 삭제
POST   /patients/import            # Excel 일괄 등록
GET    /patients/search            # 검색
```

---

### 6. Clinic Service (병원/조직 서비스)

**책임**: 병원 정보, 팀 관리, 사용자 설정
**데이터베이스**: `vibe_clinic` (마스터 데이터)
**포트**: 3006

#### Prisma Schema

```prisma
// services/clinic-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Clinic {
  id          String   @id @default(uuid())
  name        String
  code        String?  @unique
  address     String?
  phone       String?
  logoUrl     String?  @map("logo_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  teams       Team[]

  @@map("clinics")
}

model Team {
  id         String   @id @default(uuid())
  clinicId   String   @map("clinic_id")
  teamName   String   @map("team_name")
  isActive   Boolean  @default(true) @map("is_active")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  clinic     Clinic       @relation(fields: [clinicId], references: [id])
  members    TeamMember[]

  @@unique([clinicId, teamName])
  @@map("teams")
}

model TeamMember {
  id         String   @id @default(uuid())
  teamId     String   @map("team_id")
  employeeId String   @map("employee_id") // HR Service의 employee ID
  joinedAt   DateTime @default(now()) @map("joined_at")

  team       Team     @relation(fields: [teamId], references: [id])

  @@unique([teamId, employeeId])
  @@map("team_members")
}

model UserPreference {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  clinicId  String?  @map("clinic_id")
  key       String
  value     Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([userId, key])
  @@map("user_preferences")
}
```

#### API Endpoints

```
# 병원
GET    /clinics/:id                # 조회
PUT    /clinics/:id                # 수정
POST   /clinics/:id/logo           # 로고 업로드
POST   /clinics                    # 생성 (Admin)

# 팀
GET    /teams                      # 목록
POST   /teams                      # 생성
PATCH  /teams/:teamName            # 수정
DELETE /teams/:teamName            # 삭제
POST   /teams/:teamName/members    # 멤버 추가
DELETE /teams/:teamName/members/:employeeId  # 멤버 제거

# 사용자 설정
GET    /preferences                # 전체 조회
GET    /preferences/:key           # 단일 조회
POST   /preferences/:key           # 저장
DELETE /preferences/:key           # 삭제

# 내부 API (다른 서비스용)
GET    /internal/clinics/:id       # 병원 정보
GET    /internal/teams             # 팀 목록
```

---

## API Gateway 설정

### Nginx 설정

```nginx
# gateway/nginx.conf

upstream auth_service {
    server auth-service:3001;
}
upstream revenue_service {
    server revenue-service:3002;
}
upstream hr_service {
    server hr-service:3003;
}
upstream inventory_service {
    server inventory-service:3004;
}
upstream marketing_service {
    server marketing-service:3005;
}
upstream clinic_service {
    server clinic-service:3006;
}

# Rate Limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

server {
    listen 80;
    server_name api.dba-portal.kr;

    # CORS
    add_header 'Access-Control-Allow-Origin' 'https://dba-portal.kr' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    if ($request_method = 'OPTIONS') {
        return 204;
    }

    # Rate Limiting 적용
    limit_req zone=api_limit burst=200 nodelay;

    # Health Check
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # ============ Auth Service ============
    location /api/auth/ {
        proxy_pass http://auth_service/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/users/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;
        auth_request_set $user_role $upstream_http_x_user_role;

        proxy_pass http://auth_service/users/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
        proxy_set_header X-User-Role $user_role;
    }

    location /api/oauth/ {
        proxy_pass http://auth_service/oauth/;
    }

    # ============ Revenue Service ============
    location /api/daily-reports/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://revenue_service/daily-reports/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/analytics/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://revenue_service/analytics/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/excel/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        client_max_body_size 50M;
        proxy_pass http://revenue_service/excel/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    # ============ HR Service ============
    location /api/employees/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://hr_service/employees/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/salary/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://hr_service/salary/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/incentives/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://hr_service/incentives/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/targets/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://hr_service/targets/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/performance/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://hr_service/performance/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    # ============ Inventory Service ============
    location /api/inventory/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://inventory_service/inventory/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/oral-products/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://inventory_service/oral-products/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    # ============ Marketing Service ============
    location /api/sms/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://marketing_service/sms/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/kakao/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://marketing_service/kakao/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/templates/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://marketing_service/templates/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/patients/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://marketing_service/patients/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    # ============ Clinic Service ============
    location /api/clinics/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://clinic_service/clinics/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/teams/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://clinic_service/teams/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    location /api/preferences/ {
        auth_request /internal/auth/verify;
        auth_request_set $user_id $upstream_http_x_user_id;
        auth_request_set $clinic_id $upstream_http_x_clinic_id;

        proxy_pass http://clinic_service/preferences/;
        proxy_set_header X-User-ID $user_id;
        proxy_set_header X-Clinic-ID $clinic_id;
    }

    # ============ 내부 인증 검증 ============
    location = /internal/auth/verify {
        internal;
        proxy_pass http://auth_service/auth/verify;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Cookie $http_cookie;
    }
}
```

---

## 공유 라이브러리

### Service Client (서비스 간 통신)

```typescript
// shared/service-client/src/index.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface ServiceClientConfig {
  serviceName: string;
  timeout?: number;
}

export class ServiceClient {
  private clients: Map<string, AxiosInstance> = new Map();
  private serviceName: string;

  private serviceUrls: Record<string, string> = {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    revenue: process.env.REVENUE_SERVICE_URL || 'http://revenue-service:3002',
    hr: process.env.HR_SERVICE_URL || 'http://hr-service:3003',
    inventory: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3004',
    marketing: process.env.MARKETING_SERVICE_URL || 'http://marketing-service:3005',
    clinic: process.env.CLINIC_SERVICE_URL || 'http://clinic-service:3006',
  };

  constructor(config: ServiceClientConfig) {
    this.serviceName = config.serviceName;

    Object.entries(this.serviceUrls).forEach(([name, url]) => {
      this.clients.set(name, axios.create({
        baseURL: url,
        timeout: config.timeout || 5000,
        headers: {
          'X-Service-Name': this.serviceName,
          'X-Service-Token': process.env.INTERNAL_SERVICE_TOKEN || '',
        },
      }));
    });
  }

  async get<T>(service: string, path: string, config?: AxiosRequestConfig): Promise<T> {
    const client = this.clients.get(service);
    if (!client) throw new Error(`Unknown service: ${service}`);
    const response = await client.get(path, config);
    return response.data;
  }

  async post<T>(service: string, path: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const client = this.clients.get(service);
    if (!client) throw new Error(`Unknown service: ${service}`);
    const response = await client.post(path, data, config);
    return response.data;
  }
}

// 싱글톤 인스턴스 생성 함수
export function createServiceClient(serviceName: string): ServiceClient {
  return new ServiceClient({ serviceName });
}
```

### Auth Middleware (JWT 검증)

```typescript
// shared/auth-middleware/src/index.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Gateway에서 전달받은 헤더로 사용자 정보 추출
export function extractUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;
  const clinicId = req.headers['x-clinic-id'] as string;
  const userRole = req.headers['x-user-role'] as string;

  if (userId) {
    req.user = {
      id: userId,
      clinicId: clinicId || '',
      role: userRole || 'USER',
      email: '',
      name: '',
      permissions: [],
    };
  }

  next();
}

// 내부 서비스 간 통신 검증
export function verifyInternalToken(req: Request, res: Response, next: NextFunction) {
  const serviceToken = req.headers['x-service-token'] as string;
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;

  if (!serviceToken || serviceToken !== expectedToken) {
    return res.status(401).json({ error: 'Invalid service token' });
  }

  next();
}

// 권한 체크 미들웨어
export function requirePermission(resource: string, action: string = 'read') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Admin은 모든 권한
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const requiredPermission = `${resource}:${action}`;
    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// clinicId 필수 체크
export function requireClinic(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.clinicId) {
    return res.status(400).json({ error: 'Clinic ID required' });
  }
  next();
}
```

### 공유 타입

```typescript
// shared/types/src/index.ts

// 사용자 역할
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TEAM_LEADER = 'TEAM_LEADER',
  MANAGER = 'MANAGER',
}

// 사용자 상태
export enum UserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// 일계표 타입
export enum DailyReportType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  ORAL_PRODUCT_SALE = 'ORAL_PRODUCT_SALE',
}

// API 응답 형식
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 공통 쿼리 파라미터
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## SSO 인증 (Single Sign-On)

### 쿠키 기반 SSO 구현

```typescript
// services/auth-service/src/services/token.service.ts

import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface TokenPayload {
  sub: string;      // user_id
  email: string;
  name: string;
  role: string;
  clinicId: string;
  permissions: string[];
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.dba-portal.kr';

export function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { sub: payload.sub, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token 쿠키 (모든 서브도메인에서 접근 가능)
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    maxAge: 15 * 60 * 1000, // 15분
    path: '/',
  });

  // Refresh Token 쿠키 (refresh 엔드포인트에서만)
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    path: '/auth/refresh',
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { domain: COOKIE_DOMAIN, path: '/' });
  res.clearCookie('refresh_token', { domain: COOKIE_DOMAIN, path: '/auth/refresh' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string };
}
```

### JWT 토큰 구조

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid-here",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "MANAGER",
    "clinicId": "clinic-uuid-here",
    "permissions": [
      "daily_report:write",
      "hr:read",
      "inventory:write",
      "marketing:read"
    ],
    "iat": 1704067200,
    "exp": 1704068100
  }
}
```

---

## Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ============ API Gateway ============
  gateway:
    build: ./gateway
    ports:
      - "80:80"
    depends_on:
      - auth-service
      - revenue-service
      - hr-service
      - inventory-service
      - marketing-service
      - clinic-service
    networks:
      - vibe-network

  # ============ Auth Service ============
  auth-service:
    build: ./services/auth-service
    environment:
      - DATABASE_URL=mysql://vibe:password@mysql:3306/vibe_auth
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - COOKIE_DOMAIN=${COOKIE_DOMAIN}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vibe-network

  # ============ Revenue Service ============
  revenue-service:
    build: ./services/revenue-service
    environment:
      - DATABASE_URL=mysql://vibe:password@mysql:3306/vibe_revenue
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
      - AUTH_SERVICE_URL=http://auth-service:3001
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vibe-network

  # ============ HR Service ============
  hr-service:
    build: ./services/hr-service
    environment:
      - DATABASE_URL=mysql://vibe:password@mysql:3306/vibe_hr
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
      - REVENUE_SERVICE_URL=http://revenue-service:3002
      - CLINIC_SERVICE_URL=http://clinic-service:3006
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vibe-network

  # ============ Inventory Service ============
  inventory-service:
    build: ./services/inventory-service
    environment:
      - DATABASE_URL=mysql://vibe:password@mysql:3306/vibe_inventory
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vibe-network

  # ============ Marketing Service ============
  marketing-service:
    build: ./services/marketing-service
    environment:
      - DATABASE_URL=mysql://vibe:password@mysql:3306/vibe_marketing
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
      - SOLAPI_API_KEY=${SOLAPI_API_KEY}
      - SOLAPI_API_SECRET=${SOLAPI_API_SECRET}
      - SOLAPI_SENDER=${SOLAPI_SENDER}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vibe-network

  # ============ Clinic Service ============
  clinic-service:
    build: ./services/clinic-service
    environment:
      - DATABASE_URL=mysql://vibe:password@mysql:3306/vibe_clinic
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vibe-network

  # ============ MySQL ============
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_USER=vibe
      - MYSQL_PASSWORD=password
    volumes:
      - mysql-data:/var/lib/mysql
      - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vibe-network

  # ============ Frontend ============
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost/api
    depends_on:
      - gateway
    networks:
      - vibe-network

networks:
  vibe-network:
    driver: bridge

volumes:
  mysql-data:
```

### 데이터베이스 초기화 스크립트

```sql
-- scripts/init-databases.sql

CREATE DATABASE IF NOT EXISTS vibe_auth;
CREATE DATABASE IF NOT EXISTS vibe_revenue;
CREATE DATABASE IF NOT EXISTS vibe_hr;
CREATE DATABASE IF NOT EXISTS vibe_inventory;
CREATE DATABASE IF NOT EXISTS vibe_marketing;
CREATE DATABASE IF NOT EXISTS vibe_clinic;

GRANT ALL PRIVILEGES ON vibe_auth.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_revenue.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_hr.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_inventory.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_marketing.* TO 'vibe'@'%';
GRANT ALL PRIVILEGES ON vibe_clinic.* TO 'vibe'@'%';

FLUSH PRIVILEGES;
```

---

## 환경 변수

```env
# .env.example

# ============ 공통 ============
NODE_ENV=development
INTERNAL_SERVICE_TOKEN=your-internal-service-token-min-32-chars

# ============ JWT ============
JWT_SECRET=your-jwt-secret-key-at-least-32-characters
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-32-chars
COOKIE_DOMAIN=.dba-portal.kr

# ============ MySQL ============
MYSQL_ROOT_PASSWORD=rootpassword

# ============ SMS (Solapi) ============
SOLAPI_API_KEY=your-solapi-api-key
SOLAPI_API_SECRET=your-solapi-api-secret
SOLAPI_SENDER=01012345678

# ============ Kakao ============
KAKAO_REST_API_KEY=your-kakao-rest-api-key

# ============ Frontend ============
NEXT_PUBLIC_API_URL=http://api.dba-portal.kr/api
NEXT_PUBLIC_APP_URL=http://dba-portal.kr
```

---

## 프론트엔드 페이지 구조

### 라우트 매핑

| 경로 | 페이지 | 권한 | 서비스 |
|------|--------|------|--------|
| `/` | 홈 (대시보드) | 전체 | - |
| `/login` | 로그인 | 공개 | Auth |
| `/signup` | 회원가입 | 공개 | Auth |
| `/daily-report` | 일계표 | daily_report | Revenue |
| `/management` | 경영관리 | management | Revenue, HR |
| `/management/team-incentive/[teamName]` | 팀 인센티브 | management | HR |
| `/hr-management` | HR 관리 | hr_management | HR |
| `/inventory` | 재고관리 | inventory | Inventory |
| `/inventory/oral-products` | 구강용품 | oral_products | Inventory |
| `/marketing` | 마케팅 | marketing | Marketing |
| `/clinic-settings` | 병원설정 | approved | Clinic |
| `/admin/approvals` | 승인관리 | admin | Auth |
| `/admin/members` | 회원관리 | admin | Auth |

### 핵심 컴포넌트

```
components/
├── ui/                      # 공통 UI
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Card.tsx
│   ├── Skeleton.tsx
│   ├── Toast.tsx
│   └── DatePicker.tsx
│
├── modals/                  # 모달
│   ├── LoginModal.tsx
│   ├── EmployeeModal.tsx
│   ├── InventoryModal.tsx
│   └── OralProductModal.tsx
│
├── features/                # 기능별
│   ├── DailyReportForm.tsx
│   ├── SalaryTable.tsx
│   ├── IncentiveChart.tsx
│   ├── TeamPerformance.tsx
│   └── ExcelUploader.tsx
│
└── layout/                  # 레이아웃
    ├── Header.tsx
    ├── Sidebar.tsx
    ├── PageNavigation.tsx
    └── Footer.tsx
```

---

## 구현 순서

### Phase 1: 기반 구축 (1주차)
1. 프로젝트 구조 생성
2. shared 라이브러리 구현
3. Docker Compose 설정
4. MySQL 초기화

### Phase 2: Auth + Clinic Service (2주차)
1. Auth Service 구현 (로그인, 회원가입, JWT)
2. Clinic Service 구현 (병원, 팀)
3. API Gateway 기본 설정
4. SSO 쿠키 설정

### Phase 3: Revenue Service (3주차)
1. 일계표 CRUD
2. 분석 캐시
3. Excel 업로드

### Phase 4: HR Service (4주차)
1. 직원 관리
2. 급여/인센티브
3. Revenue 연동

### Phase 5: Inventory + Marketing (5주차)
1. 재고/구강용품 관리
2. SMS/카카오톡 발송
3. 환자 관리

### Phase 6: Frontend (6주차)
1. Next.js 설정
2. 인증 (AuthProvider)
3. 주요 페이지 구현

### Phase 7: 고도화 (7주차)
1. 로깅/모니터링
2. 성능 최적화
3. 테스트

---

## 개발 시작 가이드

```bash
# 1. 프로젝트 생성
mkdir dba-portal && cd dba-portal

# 2. 디렉토리 구조 생성
mkdir -p gateway services/{auth,revenue,hr,inventory,marketing,clinic}-service
mkdir -p shared/{auth-middleware,service-client,types,utils}
mkdir -p frontend scripts

# 3. 환경변수 설정
cp .env.example .env

# 4. Docker로 전체 실행
docker-compose up -d

# 5. 각 서비스 DB 마이그레이션
cd services/auth-service && npx prisma migrate dev
cd ../revenue-service && npx prisma migrate dev
# ... 각 서비스 반복

# 6. 프론트엔드 개발
cd frontend && npm run dev
```

---

## 이 스크립트 사용 방법

1. 새 폴더에서 AI 코딩 도구 실행
2. 이 스크립트 전체를 프롬프트로 전달
3. **"위 마이크로서비스 아키텍처대로 프로젝트를 생성해주세요"** 요청
4. Phase별로 순차 구현

### 권장 요청 순서
```
1. "프로젝트 기본 구조와 Docker Compose를 생성해주세요"
2. "shared 라이브러리들을 구현해주세요"
3. "Auth Service를 구현해주세요"
4. "Clinic Service를 구현해주세요"
5. "API Gateway Nginx 설정을 해주세요"
6. "Revenue Service를 구현해주세요"
... (이하 Phase별 진행)
```

---

## AWS Lightsail 배포 가이드

### 아키텍처 개요

```
                                    ┌─────────────────────────────────────┐
                                    │         AWS Lightsail               │
┌──────────┐                        │                                     │
│  사용자   │                        │  ┌─────────────────────────────┐   │
│          │──── dba-portal.kr ────▶│  │   Lightsail Instance        │   │
│          │                        │  │   Ubuntu 22.04 (4GB RAM)    │   │
│          │                        │  │                             │   │
└──────────┘                        │  │  ┌─────────────────────┐    │   │
                                    │  │  │      Nginx          │    │   │
     *.dba-portal.kr               │  │  │   (Reverse Proxy)   │    │   │
         │                          │  │  │      + SSL          │    │   │
         │                          │  │  └──────────┬──────────┘    │   │
         │                          │  │             │               │   │
         └──────────────────────────┼──┼─────────────┘               │   │
                                    │  │  ┌─────────────────────┐    │   │
                                    │  │  │   Docker Compose    │    │   │
                                    │  │  │                     │    │   │
                                    │  │  │  ├─ frontend:3000   │    │   │
                                    │  │  │  ├─ gateway:8080    │    │   │
                                    │  │  │  ├─ auth:3001       │    │   │
                                    │  │  │  ├─ revenue:3002    │    │   │
                                    │  │  │  ├─ hr:3003         │    │   │
                                    │  │  │  ├─ inventory:3004  │    │   │
                                    │  │  │  ├─ marketing:3005  │    │   │
                                    │  │  │  └─ clinic:3006     │    │   │
                                    │  │  └─────────────────────┘    │   │
                                    │  └─────────────────────────────┘   │
                                    │                                     │
                                    │  ┌─────────────────────────────┐   │
                                    │  │   Lightsail MySQL           │   │
                                    │  │   (Managed Database)        │   │
                                    │  │                             │   │
                                    │  │   ├─ vibe_auth              │   │
                                    │  │   ├─ vibe_revenue           │   │
                                    │  │   ├─ vibe_hr                │   │
                                    │  │   ├─ vibe_inventory         │   │
                                    │  │   ├─ vibe_marketing         │   │
                                    │  │   └─ vibe_clinic            │   │
                                    │  └─────────────────────────────┘   │
                                    └─────────────────────────────────────┘
```

### 예상 비용

| 리소스 | 사양 | 월 비용 |
|--------|------|---------|
| Lightsail Instance | 4GB RAM, 2vCPU, 80GB SSD | $20 |
| Lightsail MySQL | 1GB RAM (Standard) | $15 |
| 고정 IP | 인스턴스 연결 시 무료 | $0 |
| DNS Zone | 3백만 쿼리/월 포함 | $0.50 |
| **합계** | | **~$35.50/월** |

---

### Step 1: Lightsail 인스턴스 생성

#### AWS Console에서 생성

1. **AWS Lightsail 콘솔** 접속: https://lightsail.aws.amazon.com

2. **Create instance** 클릭

3. **설정**:
   ```
   Region: Asia Pacific (Seoul) - ap-northeast-2
   Platform: Linux/Unix
   Blueprint: Ubuntu 22.04 LTS
   Instance plan: $20/월 (4GB RAM, 2vCPU, 80GB SSD)
   Instance name: dba-portal-main
   ```

4. **SSH 키** 생성 또는 기존 키 선택

5. **Create instance** 클릭

#### 고정 IP 할당

1. **Networking** 탭 → **Create static IP**
2. 인스턴스에 연결
3. 고정 IP 기록 (예: `3.34.xxx.xxx`)

---

### Step 2: Lightsail MySQL 데이터베이스 생성

1. **Databases** → **Create database**

2. **설정**:
   ```
   Region: Asia Pacific (Seoul)
   Database type: MySQL 8.0
   Plan: $15/월 (Standard - 1GB RAM)
   Database name: dba-portal-db
   Master username: admin
   Master password: [강력한 비밀번호 설정]
   ```

3. **Create database** 클릭 (생성에 10-15분 소요)

4. 생성 완료 후 **연결 정보** 기록:
   ```
   Endpoint: dba-portal-db.xxxxx.ap-northeast-2.rds.amazonaws.com
   Port: 3306
   Username: admin
   Password: [설정한 비밀번호]
   ```

5. **Networking** → **Public mode** 활성화 (개발 시) 또는 Lightsail 인스턴스만 접근 허용

---

### Step 3: 도메인 및 DNS 설정

#### Lightsail DNS Zone 생성

1. **Networking** → **Create DNS zone**
2. Domain: `dba-portal.kr`
3. 생성된 **Name servers** 4개를 도메인 등록업체에 등록

#### DNS 레코드 설정

```
A 레코드:
┌─────────────────────┬─────────────────┐
│ 이름                │ 값 (고정 IP)    │
├─────────────────────┼─────────────────┤
│ @                   │ 3.34.xxx.xxx    │  ← dba-portal.kr
│ api                 │ 3.34.xxx.xxx    │  ← api.dba-portal.kr
│ auth                │ 3.34.xxx.xxx    │  ← auth.dba-portal.kr
│ report              │ 3.34.xxx.xxx    │  ← report.dba-portal.kr
│ hr                  │ 3.34.xxx.xxx    │  ← hr.dba-portal.kr
│ inventory           │ 3.34.xxx.xxx    │  ← inventory.dba-portal.kr
│ marketing           │ 3.34.xxx.xxx    │  ← marketing.dba-portal.kr
│ clinic              │ 3.34.xxx.xxx    │  ← clinic.dba-portal.kr
└─────────────────────┴─────────────────┘
```

---

### Step 4: 서버 초기 설정

#### SSH 접속

```bash
# Lightsail 콘솔에서 브라우저 SSH 또는:
ssh -i ~/.ssh/your-key.pem ubuntu@3.34.xxx.xxx
```

#### 시스템 업데이트 및 Docker 설치

```bash
#!/bin/bash
# scripts/server-setup.sh

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y curl git apt-transport-https ca-certificates software-properties-common

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ubuntu 유저에 Docker 권한 부여
sudo usermod -aG docker ubuntu

# Nginx 설치 (리버스 프록시용)
sudo apt install -y nginx

# Certbot 설치 (SSL 인증서)
sudo apt install -y certbot python3-certbot-nginx

# 방화벽 설정
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 재접속 (Docker 그룹 적용)
echo "Setup complete! Please reconnect to apply Docker permissions."
```

#### 스크립트 실행

```bash
chmod +x server-setup.sh
./server-setup.sh

# SSH 재접속
exit
ssh -i ~/.ssh/your-key.pem ubuntu@3.34.xxx.xxx

# Docker 확인
docker --version
docker-compose --version
```

---

### Step 5: 프로젝트 배포

#### 프로젝트 클론

```bash
cd /home/ubuntu
git clone https://github.com/your-username/dba-portal.git
cd dba-portal
```

#### 환경 변수 설정

```bash
# .env 파일 생성
cat > .env << 'EOF'
# ============ 공통 ============
NODE_ENV=production
INTERNAL_SERVICE_TOKEN=생성한-시크릿-토큰-최소-32자

# ============ JWT ============
JWT_SECRET=jwt-시크릿-키-최소-32자
JWT_REFRESH_SECRET=jwt-리프레시-시크릿-키-32자
COOKIE_DOMAIN=.dba-portal.kr

# ============ MySQL (Lightsail) ============
DB_HOST=dba-portal-db.xxxxx.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=데이터베이스-비밀번호
DB_NAME_AUTH=vibe_auth
DB_NAME_REVENUE=vibe_revenue
DB_NAME_HR=vibe_hr
DB_NAME_INVENTORY=vibe_inventory
DB_NAME_MARKETING=vibe_marketing
DB_NAME_CLINIC=vibe_clinic

# ============ SMS (Solapi) ============
SOLAPI_API_KEY=your-solapi-api-key
SOLAPI_API_SECRET=your-solapi-api-secret
SOLAPI_SENDER=01012345678

# ============ Kakao ============
KAKAO_REST_API_KEY=your-kakao-rest-api-key
EOF
```

#### Docker Compose 프로덕션 설정

```yaml
# docker-compose.prod.yml

version: '3.8'

services:
  # ============ API Gateway (내부용) ============
  gateway:
    build: ./gateway
    ports:
      - "8080:80"
    depends_on:
      - auth-service
      - revenue-service
      - hr-service
      - inventory-service
      - marketing-service
      - clinic-service
    environment:
      - NODE_ENV=production
    restart: always
    networks:
      - dba-network

  # ============ Frontend ============
  frontend:
    build:
      context: ./frontend
      args:
        - NEXT_PUBLIC_API_URL=https://api.dba-portal.kr/api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
    networks:
      - dba-network

  # ============ Auth Service ============
  auth-service:
    build: ./services/auth-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_AUTH}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - COOKIE_DOMAIN=${COOKIE_DOMAIN}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    restart: always
    networks:
      - dba-network

  # ============ Revenue Service ============
  revenue-service:
    build: ./services/revenue-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_REVENUE}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    restart: always
    networks:
      - dba-network

  # ============ HR Service ============
  hr-service:
    build: ./services/hr-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_HR}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
      - REVENUE_SERVICE_URL=http://revenue-service:3002
      - CLINIC_SERVICE_URL=http://clinic-service:3006
    restart: always
    networks:
      - dba-network

  # ============ Inventory Service ============
  inventory-service:
    build: ./services/inventory-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_INVENTORY}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    restart: always
    networks:
      - dba-network

  # ============ Marketing Service ============
  marketing-service:
    build: ./services/marketing-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_MARKETING}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
      - SOLAPI_API_KEY=${SOLAPI_API_KEY}
      - SOLAPI_API_SECRET=${SOLAPI_API_SECRET}
      - SOLAPI_SENDER=${SOLAPI_SENDER}
    restart: always
    networks:
      - dba-network

  # ============ Clinic Service ============
  clinic-service:
    build: ./services/clinic-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME_CLINIC}
      - INTERNAL_SERVICE_TOKEN=${INTERNAL_SERVICE_TOKEN}
    restart: always
    networks:
      - dba-network

networks:
  dba-network:
    driver: bridge
```

#### 데이터베이스 초기화

```bash
# MySQL 접속 (Lightsail DB)
mysql -h dba-portal-db.xxxxx.ap-northeast-2.rds.amazonaws.com -u admin -p

# 데이터베이스 생성
CREATE DATABASE vibe_auth;
CREATE DATABASE vibe_revenue;
CREATE DATABASE vibe_hr;
CREATE DATABASE vibe_inventory;
CREATE DATABASE vibe_marketing;
CREATE DATABASE vibe_clinic;

# 종료
exit;
```

#### 서비스 빌드 및 실행

```bash
# 빌드
docker-compose -f docker-compose.prod.yml build

# 실행
docker-compose -f docker-compose.prod.yml up -d

# Prisma 마이그레이션 (각 서비스별)
docker-compose -f docker-compose.prod.yml exec auth-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec revenue-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec hr-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec inventory-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec marketing-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec clinic-service npx prisma migrate deploy

# 상태 확인
docker-compose -f docker-compose.prod.yml ps
```

---

### Step 6: Nginx 리버스 프록시 설정

#### Nginx 설정 파일

```bash
sudo nano /etc/nginx/sites-available/dba-portal
```

```nginx
# /etc/nginx/sites-available/dba-portal

# ============ 메인 사이트 (프론트엔드) ============
server {
    listen 80;
    server_name dba-portal.kr www.dba-portal.kr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ============ API Gateway ============
server {
    listen 80;
    server_name api.dba-portal.kr;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ============ Auth Service (직접 접근 필요시) ============
server {
    listen 80;
    server_name auth.dba-portal.kr;

    location / {
        proxy_pass http://localhost:8080/api/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ============ 나머지 서비스들 (서브도메인 → Gateway 라우팅) ============
server {
    listen 80;
    server_name report.dba-portal.kr;

    location / {
        proxy_pass http://localhost:8080/api/daily-reports/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /analytics/ {
        proxy_pass http://localhost:8080/api/analytics/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name hr.dba-portal.kr;

    location / {
        proxy_pass http://localhost:8080/api/employees/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name inventory.dba-portal.kr;

    location / {
        proxy_pass http://localhost:8080/api/inventory/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name marketing.dba-portal.kr;

    location / {
        proxy_pass http://localhost:8080/api/sms/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name clinic.dba-portal.kr;

    location / {
        proxy_pass http://localhost:8080/api/clinics/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Nginx 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/dba-portal /etc/nginx/sites-enabled/

# 기본 사이트 비활성화
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

### Step 7: SSL 인증서 설정 (Let's Encrypt)

```bash
# 모든 도메인에 대해 SSL 인증서 발급
sudo certbot --nginx -d dba-portal.kr -d www.dba-portal.kr \
  -d api.dba-portal.kr \
  -d auth.dba-portal.kr \
  -d report.dba-portal.kr \
  -d hr.dba-portal.kr \
  -d inventory.dba-portal.kr \
  -d marketing.dba-portal.kr \
  -d clinic.dba-portal.kr

# 이메일 입력 및 약관 동의

# 자동 갱신 테스트
sudo certbot renew --dry-run

# 자동 갱신 cron 확인 (자동 설정됨)
sudo systemctl status certbot.timer
```

---

### Step 8: 배포 자동화 스크립트

```bash
# scripts/deploy.sh

#!/bin/bash
set -e

echo "🚀 DBA Portal 배포 시작..."

# 프로젝트 디렉토리
cd /home/ubuntu/dba-portal

# 최신 코드 가져오기
echo "📥 코드 업데이트..."
git pull origin main

# 환경변수 로드
export $(cat .env | xargs)

# Docker 이미지 빌드
echo "🔨 Docker 이미지 빌드..."
docker-compose -f docker-compose.prod.yml build

# 서비스 재시작 (무중단)
echo "♻️ 서비스 재시작..."
docker-compose -f docker-compose.prod.yml up -d

# 마이그레이션 실행
echo "📊 데이터베이스 마이그레이션..."
docker-compose -f docker-compose.prod.yml exec -T auth-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec -T revenue-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec -T hr-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec -T inventory-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec -T marketing-service npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec -T clinic-service npx prisma migrate deploy

# 오래된 이미지 정리
echo "🧹 정리..."
docker image prune -f

# 상태 확인
echo "✅ 배포 완료!"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 사이트: https://dba-portal.kr"
echo "🔌 API: https://api.dba-portal.kr"
```

```bash
chmod +x scripts/deploy.sh
```

---

### Step 9: 모니터링 및 로그

#### 서비스 로그 확인

```bash
# 전체 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f auth-service
docker-compose -f docker-compose.prod.yml logs -f revenue-service

# 최근 100줄
docker-compose -f docker-compose.prod.yml logs --tail=100 frontend
```

#### 시스템 모니터링

```bash
# 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 메모리 사용량
free -m
```

#### 헬스체크 스크립트

```bash
# scripts/healthcheck.sh

#!/bin/bash

echo "🏥 Health Check..."

services=("dba-portal.kr" "api.dba-portal.kr/health")

for service in "${services[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://$service")
    if [ "$status" = "200" ]; then
        echo "✅ $service - OK"
    else
        echo "❌ $service - FAILED (HTTP $status)"
    fi
done
```

---

### Step 10: 백업 설정

#### 데이터베이스 백업 스크립트

```bash
# scripts/backup-db.sh

#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="dba-portal-db.xxxxx.ap-northeast-2.rds.amazonaws.com"
DB_USER="admin"
DB_PASS="your-password"

mkdir -p $BACKUP_DIR

DATABASES=("vibe_auth" "vibe_revenue" "vibe_hr" "vibe_inventory" "vibe_marketing" "vibe_clinic")

for DB in "${DATABASES[@]}"; do
    echo "Backing up $DB..."
    mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB | gzip > "$BACKUP_DIR/${DB}_${DATE}.sql.gz"
done

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
```

#### Cron 설정 (매일 새벽 3시 백업)

```bash
crontab -e

# 추가:
0 3 * * * /home/ubuntu/dba-portal/scripts/backup-db.sh >> /home/ubuntu/logs/backup.log 2>&1
```

---

### 문제 해결

#### 자주 발생하는 문제

| 문제 | 해결 방법 |
|------|-----------|
| Docker 권한 오류 | `sudo usermod -aG docker ubuntu` 후 재접속 |
| 포트 충돌 | `sudo lsof -i :3000` 확인 후 프로세스 종료 |
| 메모리 부족 | Swap 추가 또는 인스턴스 업그레이드 |
| DB 연결 실패 | Lightsail DB 네트워크 설정 확인 |
| SSL 인증서 갱신 실패 | `sudo certbot renew --force-renewal` |

#### Swap 메모리 추가 (4GB RAM에서 권장)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

### 체크리스트

```
[ ] Lightsail 인스턴스 생성 (4GB RAM)
[ ] 고정 IP 할당
[ ] Lightsail MySQL 데이터베이스 생성
[ ] DNS Zone 생성 및 레코드 설정
[ ] 도메인 네임서버 변경 (도메인 등록업체)
[ ] 서버 SSH 접속 확인
[ ] Docker 및 Docker Compose 설치
[ ] 프로젝트 클론 및 .env 설정
[ ] Docker 컨테이너 빌드 및 실행
[ ] Nginx 리버스 프록시 설정
[ ] SSL 인증서 발급
[ ] 배포 스크립트 작성
[ ] 백업 스크립트 및 Cron 설정
[ ] 헬스체크 확인
```

---

**작성일**: 2026-01-18
**원본 프로젝트**: vibe_coding_test1 (React + Express + Supabase)
**대상 스택**: Next.js + Express Microservices + Prisma + MySQL
**배포 환경**: AWS Lightsail
