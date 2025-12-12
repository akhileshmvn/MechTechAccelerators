# MechTech Accelerators - AI Coding Guidelines

## Architecture Overview
Full-stack React/TypeScript app with Express backend, Drizzle ORM (PostgreSQL), and shadcn/ui components. Client served via Vite in dev, static in prod. Key features: Patient Data Generator (Excel export) and Test Case Wizard (ZIP boilerplate generation).

## Key Components
- **Frontend**: React with wouter routing, React Query for state, framer-motion animations
- **Backend**: Express with custom logging middleware, in-memory storage (migrate to Drizzle when needed)
- **UI**: shadcn/ui components in `client/src/components/ui/`, custom GlassCard wrapper
- **Data Generation**: Custom patient ID encoding (25-letter base), ExcelJS for exports, JSZip for archives
- **Build**: Custom esbuild script bundles server deps, Vite handles client

## Development Workflow
- `npm run dev` - Runs server with Vite middleware (port 5000)
- `npm run dev:client` - Frontend only (port 5000)
- `npm run build` - Produces `dist/` with bundled server and client assets
- `npm run check` - TypeScript validation
- `npm run db:push` - Apply Drizzle schema changes (requires DATABASE_URL)

## Patterns & Conventions
- **File Saving**: Use `lib/file-utils.ts` saveFile() for downloads (wraps file-saver)
- **Notifications**: Always use `useToast()` hook for user feedback
- **Patient IDs**: Format "PREFIXAAAA" where AAAA is base-25 encoded counter (A-Z except I)
- **Test Cases**: Include pre-requisites with app names, generate boilerplate scripts
- **State Management**: React Query for server state, local state for UI
- **Imports**: `@/` for client src, `@shared/` for shared types/schemas
- **Error Handling**: Server logs API responses with timing; client uses try/catch with toasts

## Examples
- Add new wizard step: Create `Step5.tsx` in `components/steps/`, import in `Wizard.tsx`, update step logic
- New data export: Follow `patientGenerator.ts` pattern - generate data, use ExcelJS/JSZip, call saveFile()
- API endpoint: Add to `server/routes.ts`, use storage interface for data ops
- UI component: Place in `components/ui/`, export from index if reusable

Focus on data generation features; keep UI consistent with GlassCard and animations.</content>
<parameter name="filePath">/Users/neerajanichenametla/Desktop/Akhilesh/mechtechgit/MechTechAccelerators/.github/copilot-instructions.md