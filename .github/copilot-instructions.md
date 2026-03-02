# MechTech Accelerators - AI Coding Guidelines

## Architecture Overview
Full-stack Express/React/TypeScript app generating test automation boilerplate. Key flows:
1. **Test Case Wizard** (`/boilerplate`): 3-step form → generates ZIP with pre-requisite workflows and test scripts
2. **Patient Data Generator** (`/patient-generator`): creates Excel sheets with mock patient data using base-25 encoding

**Tech Stack**: Express (Node), React + Vite, Drizzle ORM (PostgreSQL), shadcn/ui, React Query, wouter routing.

## Project Structure & Key Files
- **Entry points**: `server/index.ts` (production), `server/app.ts` (Express setup), `client/src/App.tsx` (React router)
- **Data generation**: 
  - `client/src/lib/generator.ts` - ZIP boilerplate generation (JSZip, template scripts)
  - `client/src/lib/patientGenerator.ts` - Excel data generation (ExcelJS, base-25 patient ID encoding)
- **Database**: `server/db.ts` (Drizzle), `shared/schema.ts` (Postgres tables: users, cernerCredentials)
- **Routes**: `server/routes.ts` (e.g., `/api/GetCernerCredentials` with Basic Auth validation)
- **UI Components**: `client/src/components/ui/` (shadcn/ui + custom `glass-card.tsx`)
- **Pages**: Landing, PatientGenerator, Wizard (each with multi-step state)

## Build & Deployment
- **Development**: `npm run dev` - Express server + Vite HMR (port 5000)
- **Production build** (`npm run build`):
  1. Vite bundles React → `dist/public/` (static client)
  2. esbuild bundles Express with allowlisted deps → `dist/index.cjs`
  3. Lambda build → `dist/lambda.cjs` (bundles all deps for cold starts)
- **Database**: `npm run db:push` applies Drizzle schema (requires `DATABASE_URL`)

## Critical Patterns
- **Patient ID Encoding**: Base-25 (A-Z except I, O) format. Two conventions:
  - **Legacy**: `PREFIXAAAA` where prefix is custom, suffix is 4-char counter (e.g., `EPRNAAAA`, `EPRNAAAB`)
  - **New**: Last name `EPPATXXXX`, First name `EXXXX` where E=environment (B/R/C for Build/Release/Cert), XXXX=counter
  - Encoding functions: `decodeCounter(s)` → number, `encodeCounter(n)` → 4-char string; helper `generateNewConventionNames(startCounter, count, environment)`
- **File Downloads**: Always use `saveFile()` from `lib/file-utils.ts` (wraps file-saver package)
- **Notifications**: Use `useToast()` hook; never alert() or console.log for user feedback
- **ZIP Generation**: `generator.ts` uses JSZip to create folder structures with template scripts (PreReq_, TestCase_ files)
- **API Response Logging**: Server logs `${method} ${path} ${status} in ${duration}ms` plus JSON response in `app.ts:res.on('finish')`
- **Test Case Prerequisites**: Each test case has `preReqs[]` array with app/username; generates separate workflow files per prereq

## Common Tasks
- **Add Wizard step**: Create `Step4.tsx` in `components/steps/`, import in `Wizard.tsx`, add to AnimatePresence Switch, update `maxSteps`
- **Add data column**: Update headers in `patientGenerator.ts` (FULL_HEADER, PATIENT_ONLY_HEADER), then modify export logic
- **New API endpoint**: Add to `server/routes.ts`, use Drizzle db queries, log with custom `log()` function
- **Update ZIP template**: Edit script generation in `generator.ts:buildPreReqScript()` or `buildPreReqWorkflow()`
- **Theme toggle**: Already in `App.tsx` - sets/reads localStorage["mechtech-theme"] and applies "light" class to root
- **Patient naming convention**: PatientGenerator has toggle between legacy (`PREFIXAAAA`) and new (`EPPAT`+counter) modes. New mode uses UI selector for environment (Build/Release/Cert) and counter input. See `generateNewConventionNames()` for implementation.

## Import Aliases
- `@/` → `client/src/` (React components, hooks, utils)
- `@shared/` → `shared/` (TypeScript schemas, types)
- `@assets/` → `attached_assets/` (embedded resources)</content>
<parameter name="filePath">/Users/neerajanichenametla/Desktop/Akhilesh/mechtechgit/MechTechAccelerators/.github/copilot-instructions.md