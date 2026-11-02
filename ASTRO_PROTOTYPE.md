# iCare Life GIG — Part 1 Astro prototype

This branch is an **isolated Astro integration test** of SK's original Figma Make React UI.

## Purpose
- Retain the original `src/app/App.tsx`, images, styles and interactive flows unchanged.
- Render the complete prototype through an Astro page and React client island.
- Compare the existing Figma Make / Vite flow against Astro on desktop and mobile.
- Do **not** connect to production data or present mock operations as actual registrations.

## Run locally
```bash
git checkout prototype/astro-part-1-ui-parity
corepack enable
pnpm install --no-frozen-lockfile
pnpm dev:astro
```
Open http://localhost:4321.

## Build validation
```bash
pnpm build:astro
pnpm preview:astro
```

**Note:** The original Figma Make / Vite scripts (`pnpm dev`, `pnpm build`) remain intact. Astro dependencies were added to `package.json` but the existing `pnpm-lock.yaml` is deliberately unchanged until a clean dependency install can regenerate it. Commit a regenerated lockfile before CI / production deployment.

## Acceptance checklist
- Both Care Provider and Employer / Care Seeker entry paths render.
- Step transitions, back navigation, input validations, demo OTP and progress indicators behave exactly as in the original prototype.
- Forms, buttons, dropdowns, scrolling, scrolling focus and image assets work across 360px mobile, tablet and desktop viewports.
- Verify keyboard accessibility, error feedback, screen-reader labels and touch targets.
- Compare screenshots to the SK source; log any visual regressions.
- Confirm no production integrations, secrets or real user information are used.

## Demo limitations / safety
The imported UI contains hard-coded known email/phone and OTP test constants, and PIN lookup fixtures. These are **demo-only**. Replace with real identity verification, backend validation, protected secrets and API/data persistence before launch. `noindex` is not access control; keep any publicly hosted preview behind authentication.
