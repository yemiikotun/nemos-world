# 🐾 Nemo's World

A small, friendly web app about my two-year-old Shih Tzu, **Nemo**. It keeps track of
how long he's been home, how old he is, his vet visits and medication, a daily photo,
and a diary of what he got up to.

I built it as part of my AI project portfolio: I wrote the product spec and directed
[Claude Code](https://claude.com/claude-code) through building it phase by phase,
reviewing and testing each step.

**Live demo:** [nemos-world.vercel.app](https://nemos-world.vercel.app)

<p>
  <img src="docs/screenshots/home-desktop.jpg" alt="The Nemo's World home page on a desktop screen: Gotcha Day and Age counters, a photo of Nemo, upcoming appointments and today's diary entry" width="640">
  &nbsp;
  <img src="docs/screenshots/diary-mobile.jpg" alt="Nemo's Diary on a phone: walk stats and a bar chart of walk minutes for the last 7 days, with the latest diary entry below" width="220">
</p>

<sub>Screenshots use sample appointments and diary entries.</sub>

## Features

- **Gotcha Day counter**: days since Nemo came home, broken into years, months and
  days, with a countdown to his next anniversary and a celebration (banner and
  confetti) on the day itself.
- **Age tracker**: Nemo's age down to the day, total days alive, a countdown to his
  next birthday, and an approximate age in dog years.
- **Appointments & medication**: add, edit and delete vet visits, grooming,
  vaccinations and medication, with an optional time and notes.
  - Medication can repeat daily, weekly or monthly. Ticking a dose off schedules
    the next one, skipping past missed doses so they don't pile up, and keeps
    monthly doses on the right day (Jan 31 → Feb 28 → Mar 31).
  - Items are grouped into **Overdue**, **Today**, **Upcoming** and **Done**, and
    can be filtered by category.
- **Picture of the Day**: a new photo of Nemo every day. It goes through every photo
  before repeating, never shows the same one two days in a row, and has a
  **Shuffle** button. Photos are picked up automatically from a folder and resized
  at build time.
- **Nemo's Diary**: one entry per day with what Nemo did, how long he walked and his
  mood. Includes keyword search, walk stats and a 7-day walk chart.
- **Nemo's Week (AI)**: one click sends the last 7 diary entries to Claude, which
  writes a short, playful recap of the week in Nemo's own voice.
- **Home dashboard** that brings it all together.
- Works on phones and desktops, in light and dark mode, with keyboard and
  screen-reader support.

## Tech stack

| | |
|---|---|
| UI | React 18, TypeScript, React Router |
| Build | Vite, with [vite-imagetools](https://github.com/JonasKruckenberg/imagetools) to resize photos to WebP |
| Dates | date-fns |
| Tests | Vitest |
| Styling | Plain CSS with design tokens and automatic dark mode |
| Data | Saved in the browser (`localStorage`); no login |
| AI | Claude API (Claude Opus 5.5) through the official `@anthropic-ai/sdk`, called from a Vercel serverless function |

## How it's built

- **The rules are pure functions, separate from the UI.** All date math (ages,
  anniversaries, repeating doses, which photo to show today) lives in
  [`src/lib/dates.ts`](src/lib/dates.ts). The appointment and diary rules live in
  [`appointments.ts`](src/lib/appointments.ts) and [`diary.ts`](src/lib/diary.ts).
  None of them read the clock or touch the page, which makes them easy to test.
- **Tested edge cases.** 75 unit tests cover leap days (a Feb 29 birthday is
  celebrated on Feb 28 in other years), month ends, the day before, of and after an
  anniversary, and late-night times. The tests pass in several time zones.
- **One storage module.** Everything saved goes through
  [`src/lib/storage.ts`](src/lib/storage.ts), so switching to a real database later
  means changing one file.
- **Fast photos.** Each photo is resized to 480 px and 960 px WebP versions at build
  time, and loads only when it scrolls into view.

```
src/
  pages/        One component per screen (Home, Appointments, Diary, Photos)
  components/   Cards, forms, the walk chart, navigation
  lib/          Pure logic and tests, storage, and small React hooks
  assets/nemo/  Photos of Nemo (any JPG, PNG or WebP dropped here is used)
api/
  recap.ts      Serverless function for Nemo's Week (calls Claude)
  _lib/         Its input checks, prompt and rate limit, as testable functions
```

### The AI feature: Nemo's Week

```
Browser ──POST /api/recap { last 7 entries }──▶ Vercel function ──▶ Claude API
        ◀────────────── { recap } ─────────────┘   (API key lives here only)
```

- **The API key never reaches the browser.** The page calls the app's own
  `/api/recap` function, and only that function holds `ANTHROPIC_API_KEY`, set as an
  environment variable in Vercel.
- **Grounded in the diary.** The prompt gives Claude the week's entries and the walk
  totals, which are worked out in code rather than left to the model. Claude is told
  to add Nemo's feelings but not invent events, and to treat the entries as data, not
  instructions. The prompt is in [`api/_lib/recap.ts`](api/_lib/recap.ts).
- **Guarded.** Requests are checked strictly (at most 7 entries, length limits,
  known moods only) and limited per visitor. Refusals, rate limits and outages turn
  into friendly messages instead of errors.
- **Tested without spending money.** The function takes its Claude call as a
  parameter, so the tests swap in a fake response.

## Running it locally

You'll need [Node.js](https://nodejs.org) 22 or newer.

```bash
npm install
npm run dev        # start the app at http://localhost:5173
npm test           # run the unit tests
npm run build      # build the production site into dist/
```

**Adding photos:** drop JPG, PNG or WebP files into `src/assets/nemo/`. A descriptive
file name like `first-bath.jpg` becomes the caption "First bath"; camera names like
`IMG_1234.JPG` get no caption. (iPhone HEIC photos need to be exported as JPEG
first.)

**Trying Nemo's Week locally:** create a file named `.env.local` in the project
folder containing `ANTHROPIC_API_KEY=` followed by your key from the
[Claude Console](https://console.anthropic.com), then restart `npm run dev`.
`.env` files are git-ignored, so the key stays on your computer.

**Previewing a different day:** while running `npm run dev`, add `?date=YYYY-MM-DD`
to the address, for example `http://localhost:5173/?date=2027-07-25`, to see the
Gotcha Day celebration. This only works in development.

## How I built this with AI

<!--
  Write this section in your own words. Some questions to answer:
  - Why did you build Nemo's World, and why with AI?
  - How did you write the spec (SPEC.md), and how did it shape the result?
  - How did you work with Claude Code phase by phase? What did you review or test
    yourself before approving each phase?
  - What did you change or push back on along the way?
  - What did you learn about directing an AI coding tool?
-->

_To be written._

The original product spec I gave Claude Code is in [SPEC.md](SPEC.md).
