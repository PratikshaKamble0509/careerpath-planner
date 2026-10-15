# CareerPath Planner
React + Vite + TypeScript MVP. State is stored in localStorage; no backend or AI API.

    npm install
    npm run dev      # local dev server
    npm run build    # production build

- Curriculum: `src/data/curriculum.ts` (10 modules, 21 topics). These are **sample career paths**, not official TUF recommendations.
- Scheduling and leave logic: `src/utils/scheduler.ts`. Persistence and validation: `src/utils/storage.ts`.
- Rule: topics are packed in order into days up to your daily minutes; a topic longer than the daily limit gets its own day. Leave days are skipped. Leave reschedules only pending tasks from today onward; completed topics keep their dates.
- Not affiliated with TUF; original CareerPath branding.
