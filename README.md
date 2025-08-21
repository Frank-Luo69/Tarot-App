# Tarot App

A minimal Next.js + TypeScript app that lets you draw Tarot cards, generate deterministic action plans, export readings, score reviews, and see a weekly report.

## Quick start

- Dev
  - npm install
  - npm run dev
  - Open http://localhost:3000/tarot
- Build
  - npm run build
  - npm start
- Lint
  - npm run lint

## Testing
- E2E uses Playwright. The test server listens on port 3100.
  - npm run build
  - npm run e2e

## Features
- Deterministic, pure-function action plan generation
- Robust export: clipboard + file, CRLF/\n newline preference, localized headers, version + rules hash in export
- Shuffle determinism and reversed-flag logic with self-tests
- Review scoring UI and weekly report with timezone-stable dates (Australia/Sydney)
- In-file self-tests gated to dev mode to avoid production overhead

## Project layout
```
app/
  tarot/
    page.tsx  # main app page and UI + self-tests (dev only)
```

## Notes
- The self-tests only run in development to avoid shipping overhead.
- If you see any build/runtime issue, please open /app/tarot/page.tsx and check the self-test output area (dev only).

## License
MIT
