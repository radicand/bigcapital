---
name: bigcapital-codebase
description: >
  Navigate and understand the Bigcapital open-source accounting software monorepo.
  Use this skill when working on any part of the codebase — server (NestJS), webapp (React),
  shared packages, database migrations, tests, or Docker setup. Covers architecture,
  multi-tenant patterns, module conventions, file locations, and development workflows.
user-invocable: true
argument-hint: "[area or question about the codebase]"
---

# Bigcapital Codebase Navigation Skill

## Project Overview

Bigcapital is an **open-source, multi-tenant financial accounting SaaS application**. It provides double-entry bookkeeping, invoicing, bills, inventory, banking (Plaid), financial reports, multi-branch/warehouse, roles & permissions, and payment integrations (Stripe/PayPal).

- **Runtime**: Node.js 25 (use `nvm use 25` before running commands)
- **Package Manager**: pnpm (monorepo managed by Lerna)
- **Monorepo Structure**: `packages/*` and `shared/*` workspaces

---

## Monorepo Layout

```
bigcapital/
├── packages/
│   ├── server/          # @bigcapital/server — NestJS backend API
│   └── webapp/          # @bigcapital/webapp — React frontend (Vite)
├── shared/
│   ├── bigcapital-utils/  # @bigcapital/utils — Shared utilities (countries, etc.)
│   ├── email-components/  # @bigcapital/email-components — React Email templates
│   ├── pdf-templates/     # @bigcapital/pdf-templates — PDF document templates (Webpack + Storybook)
│   └── sdk-ts/            # @bigcapital/sdk-ts — TypeScript types from OpenAPI spec
├── docker/              # Docker configs (MariaDB, Redis, Envoy, migration)
├── e2e/                 # Playwright E2E tests
├── test/                # Root test config
└── docker-compose.yml   # Dev environment (MariaDB, Redis, Gotenberg)
```

---

## Server Package (`packages/server/`)

### Tech Stack
- **Framework**: NestJS 10 (Express platform)
- **ORM**: Objection.js 3 (on top of Knex.js 3)
- **Database**: MariaDB/MySQL (multi-tenant: system DB + per-tenant DBs)
- **Queue**: Bull/BullMQ with Redis
- **Auth**: Passport.js (JWT + Local + API Key strategies)
- **Permissions**: CASL
- **Validation**: class-validator + class-transformer (DTOs)
- **Events**: @nestjs/event-emitter
- **Context**: nestjs-cls (Continuation-Local Storage for request-scoped tenancy)
- **i18n**: nestjs-i18n
- **API Docs**: Swagger at `/swagger`
- **PDF**: Gotenberg (Chromiumly)
- **Email**: Nodemailer + Loops integration
- **Analytics**: PostHog
- **CLI**: nest-commander

### Entry Points
- `src/main.ts` — NestJS bootstrap (Express app, Swagger, CLS middleware, port 3000)
- `src/cli.ts` — CLI commands (migrations, seeds, tenant list, OpenAPI export)

### Module Architecture

The root `AppModule` (`src/modules/App/App.module.ts`) imports **60+ feature modules**. Each module follows a consistent pattern:

```
src/modules/{ModuleName}/
├── {ModuleName}.module.ts        # NestJS module definition
├── {ModuleName}.controller.ts    # REST endpoints with guards & decorators
├── {ModuleName}.application.ts   # Application service (facade for commands/queries)
├── commands/                     # Command services (Create, Edit, Delete, etc.)
├── queries/                      # Query services (Get, List, etc.)
├── dtos/                         # class-validator DTOs
├── models/                       # Objection.js models
├── subscribers/                  # @OnEvent handlers (GL entries, inventory, etc.)
├── ledger/                       # GL entry builders (for financial modules)
├── processors/                   # Bull queue processors
├── constants.ts                  # Module-specific constants
└── utils.ts                      # Module-specific utilities
```

**Key Pattern — CQRS-like with Event-Driven Side Effects:**
1. Controller receives request → validates DTO → calls Application service
2. Application service delegates to specific Command/Query service
3. Command service: validates → transforms DTO → persists in UnitOfWork transaction → emits domain event
4. Event subscribers react asynchronously: create GL entries, update inventory, send emails, etc.

### Major Module Groups

**Financial Transactions:**
- `SaleInvoices/`, `SaleEstimates/`, `SaleReceipts/`, `PaymentReceived/`
- `Bills/`, `BillPayments/`, `BillLandedCosts/`
- `CreditNotes/`, `CreditNoteRefunds/`, `CreditNotesApplyInvoice/`
- `VendorCredit/`, `VendorCreditsRefund/`, `VendorCreditsApplyBills/`
- `Expenses/`, `ManualJournals/`

**Core Entities:**
- `Accounts/` — Chart of accounts (hierarchical, multi-currency)
- `Items/` — Products & services
- `Customers/`, `Vendors/`, `Contacts/` — Contact management
- `Currencies/`, `ExchangeRates/`

**Inventory:**
- `InventoryCost/` — FIFO/LIFO/Average cost tracking
- `InventoryAdjutments/` (note: typo in folder name)
- `Warehouses/`, `WarehousesTransfers/`

**Banking:**
- `BankingAccounts/`, `BankingTransactions/`
- `BankingCategorize/`, `BankingMatching/`, `BankingTranasctionsRegonize/` (note: typos preserved)
- `BankRules/` — Automation rules
- `BankingPlaid/`, `Plaid/` — Plaid bank feed integration
- `BankingTransactionsExclude/`

**Financial Reports** (`FinancialStatements/modules/`):
- `BalanceSheet/`, `ProfitLossSheet/`, `TrialBalanceSheet/`
- `CashFlowStatement/`, `GeneralLedger/`, `JournalSheet/`
- `ARAgingSummary/`, `APAgingSummary/`
- `SalesByItems/`, `PurchasesByItems/`
- `InventoryValuationSheet/`, `InventoryItemDetails/`
- `TransactionsByCustomer/`, `TransactionsByVendor/`, `TransactionsByReference/`
- `SalesTaxLiabilitySummary/`

**Infrastructure:**
- `Auth/` — JWT, Local, API Key auth strategies
- `Tenancy/` — Multi-tenant DB resolution (CLS-based)
- `TenantDBManager/` — Tenant database lifecycle
- `System/` — System DB models (Tenants, Users, Subscriptions)
- `Ledger/` — Double-entry journal engine (`Ledger` class with fluent filtering)
- `Roles/` — RBAC with CASL permissions
- `Settings/`, `Organization/`
- `Mail/`, `MailNotification/`, `MailTenancy/`
- `S3/` — File storage
- `Subscription/`, `PaymentServices/`, `StripePayment/`, `PaymentLinks/`
- `Import/`, `Export/` — Data import/export
- `PdfTemplate/`, `TemplateInjectable/`, `ChromiumlyTenancy/`
- `Search/`, `CustomViews/`, `Views/`
- `Branches/` — Multi-branch support
- `TaxRates/` — Tax configuration
- `DynamicListing/` — Dynamic filtering/sorting for list endpoints
- `Transformer/` — Response transformation layer
- `Metable/` — Dynamic metadata on models
- `Socket/` — WebSocket support
- `EventsTracker/` — PostHog analytics events
- `Loops/` — Loops.so email integration
- `AutoIncrementOrders/` — Auto-numbering for transactions

### Multi-Tenant Database Architecture

**System Database** (`bigcapital`):
- Tables: tenants, users (system), subscriptions, plans, API keys, password resets, Plaid items, imports
- Migrations: `src/database/system/migrations/` (JS files)
- Seeds: `src/database/system/seeds/`

**Tenant Databases** (`bigcapital_tenant_{organizationId}`):
- Each organization gets its own database
- All accounting data lives here (accounts, items, invoices, bills, GL, inventory, banking, etc.)
- Migrations: `src/database/tenant/migrations/` (100+ JS files)
- Seeds: `src/database/tenant/seeds/`

**Connection Resolution Flow:**
1. Request includes `organization-id` header
2. `ClsMiddleware` stores it in CLS (Continuation-Local Storage)
3. `TenancyDatabaseModule` provides a Knex proxy that resolves the tenant DB from CLS context
4. LRU cache (100 entries) reuses Knex connections per tenant
5. Models automatically use the tenant-scoped Knex instance

### Model Layer (Objection.js)

**Base classes:**
- `BaseModel` (`src/models/Model.ts`) — Extends Objection.js with:
  - `PaginationQueryBuilder` — `.pagination(page, pageSize)` method
  - `BaseQueryBuilder` — `.changeAmount(where, attr, amount)` helper
  - `.deleteIfNoRelations()` — Safe deletion checking dependents
- `TenantBaseModel` — Adds mixins: `CustomViewBaseModel`, `SearchableBaseModel`, `ResourceableModel`, `MetadataModel`
- `SystemModel` — For system DB entities

**Model decorators:**
- `@ExportableModel()` — Enables export via Export module
- `@ImportableModel()` — Enables import via Import module
- `@InjectModelMeta(MetaClass)` — Attaches metadata class
- `@InjectModelDefaultViews(ViewArray)` — Default custom views
- `@InjectAttachable()` — Document attachment support

**Model injection:**
- Models are registered in `SystemModelsModule` and `TenancyModelsModule`
- Injected via `@Inject(ModelName.name)` in services

### Domain Events

Events are defined centrally in `src/common/events/events.ts` with 100+ event constants organized by module:
```typescript
events.saleInvoices.creating  // Before creation
events.saleInvoices.created   // After creation
events.accounts.onCreated     // Account created
events.organization.built     // Organization provisioned
// etc.
```

Event subscribers (in each module's `subscribers/` folder) use `@OnEvent(events.xxx)` to react — creating GL entries, updating inventory, sending notifications, rewriting payment GL, etc.

### Authentication & Authorization

**Auth strategies** (in `src/modules/Auth/`):
- `JwtStrategy` — JWT (HS384, 1-day expiry)
- `LocalStrategy` — Email/password
- `ApiKeyStrategy` — API key from `x-api-key` header

**Guards:**
- `JwtAuthGuard` — JWT validation
- `ApiKeyAuthGuard` — API key validation
- `MixedAuthGuard` — JWT OR API key
- `AuthorizationGuard` — CASL permission check
- `PermissionGuard` — Route-level permission
- `TenancyGlobalGuard` — Validates `organization-id` header
- `EnsureTenantIsInitializedGuard` — Tenant provisioned check
- `EnsureTenantIsSeededGuard` — Tenant seeded check

**Permission decorators on controllers:**
```typescript
@RequirePermission(SaleInvoiceAction.Create, AbilitySubject.SaleInvoice)
```

### Global Infrastructure (registered in AppModule)

**Interceptors:** `SerializeInterceptor`, `ToJsonInterceptor`, `ExcludeNullInterceptor`, `UserIpInterceptor`
**Pipes:** `ClassValidationPipe` (global DTO validation)
**Filters:** `ServiceErrorFilter`, `ModelHasRelationsFilter`
**Guards:** `ThrottlerGuard` (rate limiting), `AuthorizationGuard`, `PermissionGuard`

### CLI Commands

Run via `pnpm cli` or `ts-node -r tsconfig-paths/register src/cli.ts`:
- `system:migrate:latest` / `:rollback` / `:make` — System DB migrations
- `tenants:migrate:latest` / `:rollback` / `:make` — Tenant DB migrations
- `system:seed:latest` — Seed system DB
- `tenants:seed:latest` — Seed all tenant DBs
- `tenants:list` — List provisioned tenants
- `openapi:export` — Export OpenAPI spec to file

---

## Webapp Package (`packages/webapp/`)

### Tech Stack
- **Framework**: React 18 with Vite
- **UI Library**: BlueprintJS 4 (with Blueprint-Formik bindings)
- **State**: Redux (redux-thunk, redux-persist) + React Query 3
- **Routing**: React Router 5 (with lazy loading)
- **Forms**: Formik + Yup validation
- **Styling**: SCSS + xstyled/emotion
- **i18n**: react-intl-universal
- **HTTP**: Axios
- **Tables**: react-table 7 + react-virtualized 
- **Rich Text**: TipTap

### Entry Point
`src/index.tsx` — Renders into DOM with:
- Redux `<Provider>` + `<PersistGate>`
- `<BrowserRouter>`
- `<App />` component

### Application Structure

```
src/
├── components/       # Reusable UI components (400+ files)
│   ├── App.tsx       # Root app with providers
│   ├── Dashboard/    # Shell layout, sidebar, navbar
│   ├── Datatable/    # Generic data table
│   ├── Forms/        # Form components (inputs, selects, date pickers)
│   ├── CommercialDoc/  # Shared invoice/bill document UI
│   └── ...
├── containers/       # Feature pages (55+ feature directories)
│   ├── Sales/        # Invoices, Estimates, Receipts, Payments, Credit Notes
│   ├── Purchases/    # (Bills container delegates to specific modules)
│   ├── Accounts/     # Chart of accounts
│   ├── Banking/      # Bank feeds, transactions, categorization
│   ├── FinancialStatements/  # All financial reports
│   ├── Items/        # Product/service management
│   ├── Customers/, Vendors/
│   ├── Authentication/  # Login, signup, password reset
│   ├── Setup/        # Organization onboarding
│   ├── Dashboard/    # Main dashboard
│   ├── Settings/, Preferences/
│   └── ...
├── hooks/
│   ├── query/        # React Query hooks (one file per resource — invoices.tsx, bills.tsx, etc.)
│   ├── state/        # Redux selector hooks
│   └── ...           # Utility hooks (useMedia, useDarkMode, etc.)
├── services/
│   ├── ApiService.tsx  # Axios wrapper (get/post/put/delete)
│   ├── axios.tsx     # Axios instance configuration
│   └── yup.tsx       # Yup custom validators
├── store/            # Redux store (45+ slice directories)
│   ├── createStore.tsx  # Store factory with middleware
│   ├── reducers.tsx     # Root reducer
│   └── {module}/        # Per-module reducers, actions, selectors
├── routes/
│   ├── dashboard.tsx    # All dashboard routes (lazy-loaded, 100+ routes)
│   ├── authentication.tsx
│   └── preferences.tsx
├── constants/        # Resource types, enums
├── lang/             # i18n translation files
├── style/            # SCSS stylesheets
└── icons/            # Custom icon components
```

### Key Frontend Patterns

**Route definition** (`routes/dashboard.tsx`):
```typescript
{
  path: '/sale-invoices',
  component: lazy(() => import('@/containers/Sales/Invoices/InvoicesLanding/...')),
  breadcrumb: intl.get('sale_invoices'),
  hotkey: 'shift+i',
  pageTitle: intl.get('sale_invoices'),
  defaultSearchResource: RESOURCES_TYPES.INVOICE,
  subscriptionActive: [SUBSCRIPTION_TYPE.MAIN],
}
```

**React Query hooks** (`hooks/query/invoices.tsx`):
```typescript
export function useCreateInvoice(props) {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();
  return useMutation(
    (values) => apiRequest.post('sale-invoices', values),
    {
      onSuccess: () => { commonInvalidateQueries(queryClient); },
      ...props,
    }
  );
}
```

**Container structure** (e.g., `containers/Sales/Invoices/`):
```
InvoicesLanding/      # List page with table, filters
InvoiceForm/          # Create/edit form
InvoiceCustomize/     # PDF template customization
InvoiceSendMailDrawer/  # Email sending drawer
hooks/                # Container-specific hooks
InvoicesAlerts.tsx     # Confirmation dialogs
InvoicesImport.tsx     # Data import page
```

**API calls** use `organization-id` header (set by axios interceptor) and `Authorization: Bearer {token}`.

---

## Shared Packages

### `@bigcapital/utils` (`shared/bigcapital-utils/`)
Country data and shared utilities. Built with tsup (CJS + ESM).

### `@bigcapital/sdk-ts` (`shared/sdk-ts/`)
TypeScript types auto-generated from the server's OpenAPI spec. Generated via:
```bash
pnpm run generate:sdk-types  # Exports spec → generates types → builds
```

### `@bigcapital/pdf-templates` (`shared/pdf-templates/`)
React components for PDF documents (invoices, receipts, bills, etc.). Built with Webpack. Has Storybook (`pnpm storybook:dev`).

### `@bigcapital/email-components` (`shared/email-components/`)
React Email components for transactional emails. Built with Vite. Has Storybook.

---

## Testing

### Server E2E Tests (`packages/server/test/`)
- **Framework**: Jest + Supertest
- **Config**: `test/jest-e2e.json` (ts-jest, maxWorkers: 1)
- **Test files**: 55+ `*.e2e-spec.ts` files covering all API resources
- **Setup**: `init-app-test.ts` — bootstraps NestJS app, authenticates, exports `app`, `orgainzationId`, `AuthorizationHeader`
- **Run**: `pnpm test:e2e` (from server package or root)

```typescript
// Test pattern:
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

describe('Sale Invoices (e2e)', () => {
  it('/sale-invoices (POST)', () => {
    return request(app.getHttpServer())
      .post('/sale-invoices')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({ /* DTO */ })
      .expect(201);
  });
});
```

### Playwright E2E (`e2e/`)
Browser-level tests for authentication, items, onboarding.

---

## Development Workflow

### Prerequisites
- Node.js 25 (`nvm use 25`)
- pnpm
- Docker (for MariaDB, Redis, Gotenberg)

### Common Commands (from repo root)
```bash
# Start infrastructure
docker-compose up -d

# Development
pnpm dev:server          # Server + utils + pdf-templates + email-components (watch)
pnpm dev:webapp          # Webapp + utils + pdf-templates (watch)
pnpm dev                 # Everything

# Building
pnpm build:server
pnpm build:webapp
pnpm build               # All packages

# Database migrations
pnpm system:migrate:latest
pnpm tenants:migrate:latest
pnpm system:migrate:make    # Create new system migration
pnpm tenants:migrate:make   # Create new tenant migration

# Seeding
pnpm system:seed:latest
pnpm tenants:seed:latest

# Testing
pnpm test:e2e            # Server E2E tests

# SDK generation
pnpm generate:sdk-types  # Export OpenAPI → generate TS types → build SDK

# Formatting
pnpm format
pnpm format:check
```

### Docker Services (docker-compose.yml)
- **mariadb** — Port 3306 (system + tenant databases)
- **redis** — Port 6379 (Bull queues, caching)
- **gotenberg** — Port 9000 (PDF generation via Chromium)

---

## Key Conventions & Gotchas

### Naming
- Module folders use PascalCase: `SaleInvoices/`, `BillPayments/`
- Some folders have typos that are preserved: `InventoryAdjutments/`, `BankingTranasctionsRegonize/`
- Model files: `{Name}.model.ts` or `{Name}.ts`
- Service files: `{Action}{Entity}.service.ts` (e.g., `CreateSaleInvoice.service.ts`)
- DTO files: `{Entity}.dto.ts`

### Architecture Decisions
- **No repository pattern universally** — Some modules use explicit repositories, most inject models directly via `@Inject(Model.name)`
- **Event-driven GL** — Financial transactions don't directly create GL entries; they emit events and subscribers handle GL creation
- **UnitOfWork** — Complex mutations use `UnitOfWork.transaction()` for atomicity
- **Tenant DB per organization** — Not schema-per-tenant; completely separate databases
- **CLS context** — The `organizationId` and `userId` are stored in CLS, not passed through function args
- **Knex migrations are .js files** — Despite being a TypeScript project, migrations use plain JS

### Adding a New Feature (Server)

1. Create module directory: `src/modules/{FeatureName}/`
2. Create `{FeatureName}.module.ts` with `@Module({ providers, controllers, exports })`
3. Create model(s) in `models/` extending `TenantBaseModel`
4. Create DTOs in `dtos/` with class-validator decorators
5. Create command services in `commands/` and query services in `queries/`
6. Create application service as facade
7. Create controller with guards and permission decorators
8. Add event subscribers in `subscribers/` if the feature has side effects
9. Create a tenant migration for new tables: `pnpm tenants:migrate:make`
10. Register the module in `AppModule` imports
11. Add E2E test in `packages/server/test/{feature}.e2e-spec.ts`

### Adding a New Feature (Webapp)

1. Create container directory: `src/containers/{FeatureName}/`
2. Create React Query hooks in `src/hooks/query/{feature}.tsx`
3. Add Redux slice if needed in `src/store/{feature}/`
4. Add routes in `src/routes/dashboard.tsx` using `lazy()` imports
5. Create form components using Formik + BlueprintJS
6. Add i18n strings to `src/lang/`

### API Request Pattern
All API requests from the webapp:
- Use axios with base URL `/api/`
- Include `organization-id` header (from auth context)
- Include `Authorization: Bearer {token}` header
- Use React Query for caching and cache invalidation

---

## Quick File Lookup Reference

| What you need | Where to find it |
|---|---|
| Server entry | `packages/server/src/main.ts` |
| Root NestJS module | `packages/server/src/modules/App/App.module.ts` |
| All event constants | `packages/server/src/common/events/events.ts` |
| Config files | `packages/server/src/common/config/` |
| Base model class | `packages/server/src/models/Model.ts` |
| System DB migrations | `packages/server/src/database/system/migrations/` |
| Tenant DB migrations | `packages/server/src/database/tenant/migrations/` |
| System models | `packages/server/src/modules/System/models/` |
| Tenancy DB setup | `packages/server/src/modules/Tenancy/TenancyDB/` |
| Auth module | `packages/server/src/modules/Auth/` |
| Global guards/filters | `packages/server/src/common/` |
| CLI commands | `packages/server/src/modules/CLI/` |
| Swagger setup | `packages/server/src/main.ts` (at `/swagger`) |
| Webapp entry | `packages/webapp/src/index.tsx` |
| All dashboard routes | `packages/webapp/src/routes/dashboard.tsx` |
| React Query hooks | `packages/webapp/src/hooks/query/` |
| Redux store | `packages/webapp/src/store/` |
| API service | `packages/webapp/src/services/ApiService.tsx` |
| Root App component | `packages/webapp/src/components/App.tsx` |
| Feature containers | `packages/webapp/src/containers/` |
| PDF templates | `shared/pdf-templates/src/` |
| Email templates | `shared/email-components/src/` |
| Generated API types | `shared/sdk-ts/src/schema.ts` |
| Docker dev setup | `docker-compose.yml` |
| Server E2E tests | `packages/server/test/` |
| Playwright E2E tests | `e2e/` |
| Server Dockerfile | `packages/server/Dockerfile` |
| Webapp Dockerfile | `packages/webapp/Dockerfile` |
