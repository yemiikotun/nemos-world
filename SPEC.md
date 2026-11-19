# Nemo's World — Build Spec for Claude Code

> Paste this whole file into Claude Code (or save it as `SPEC.md` in an empty project
> folder and say: "Read SPEC.md and build this app, one phase at a time.").
> Fill in everything marked `TODO` first.

---

## 1. What we're building

**Nemo's World** is a small, friendly web app about my dog **Nemo**, a Shih Tzu.
It is a portfolio piece, so it must look polished, work on phone and desktop, and
have clean, readable code that an employer could browse on GitHub.

**About Nemo**
- Name: Nemo
- Breed: Shih Tzu
- Birthday: 2024-07-14
- Gotcha Day (adoption date): 2026-07-25

## 2. Tech stack (use exactly this unless you ask me first)

- React + TypeScript, built with Vite
- Plain CSS or Tailwind CSS (your choice, but be consistent)
- Data saved in the browser (`localStorage` for text data). No backend, no login.
- `date-fns` for date math
- Vitest for unit tests
- Must deploy as a static site (Vercel or GitHub Pages)

## 3. Features

### 3.1 Home dashboard
One home screen showing, at a glance: the two counters, today's picture, the next
2–3 upcoming appointments, and a button to write today's diary entry.

### 3.2 Gotcha Day counter
- Show "**N days** since Nemo came home" (days since the Gotcha Day, counting today correctly).
- Also show the years/months/days breakdown, e.g. "1 year, 4 months, 12 days".
- On the anniversary itself, show a small celebration (banner or confetti).
- Show a countdown to the next Gotcha Day anniversary.

### 3.3 Age tracker
- Show Nemo's age down to the day, e.g. "2 years, 3 months, 5 days old".
- Also show total days alive.
- On his birthday, show a birthday celebration.
- Optional: "in dog years" as a fun extra, clearly labeled as approximate.

### 3.4 Appointments & medication tracker
- Add / edit / delete an item with: title, category (Vet, Medication, Grooming,
  Vaccination, Other), date, optional time, optional notes.
- Medication items can repeat: daily, weekly, or monthly.
- Mark an item as done. For a repeating item, marking it done schedules the next one.
- List sorted by date, with sections: **Overdue** (highlighted), **Today**, **Upcoming**, **Done**.
- Filter by category.

### 3.5 Picture of the Day
- Photos live in `src/assets/nemo/`. Load them automatically with
  `import.meta.glob`, so I can add a photo by just dropping a file in that folder.
- The picture is chosen by today's date, so it stays the same all day and changes
  tomorrow, and cycles through all photos before repeating.
- A "Shuffle" button shows a random different photo (doesn't change the daily pick).
- Show a placeholder with instructions if the folder is empty.
- Images must be lazy-loaded and sized so the page stays fast.

### 3.6 Nemo's Diary
- One entry per day with: date (defaults to today), what Nemo did (free text),
  walk length in minutes, and an optional mood (happy / sleepy / playful / grumpy).
- List entries newest first; tap to edit or delete.
- Show simple stats: total walk minutes this week, average walk length, and a
  small bar chart of walk minutes for the last 7 days.
- Search entries by keyword.

## 4. Design

- Warm, playful, but clean. Rounded cards, soft colors, a paw-print accent.
- Mobile-first; works well on a phone screen.
- Readable fonts, good contrast, buttons have labels (accessibility matters).
- Bottom navigation on mobile: Home · Appointments · Diary · Photos.

## 5. Code quality rules

- Put all date math (days since, age breakdown, next anniversary, next repeat date,
  photo-of-the-day index) in `src/lib/dates.ts` as pure functions, with Vitest tests
  covering edge cases: leap years (Feb 29), month ends, today being the anniversary,
  and time zones (use the local date, not UTC).
- Put storage in one module (`src/lib/storage.ts`) so it could be swapped for a real
  database later.
- Small, well-named components. No giant files.
- Write a `README.md` with: a screenshot, a feature list, the tech stack, how to run
  it locally, and a short "How I built this with AI" section that I will finish myself.

## 6. Build order (do one phase, show me, then wait for my OK)

1. **Setup**: create the Vite + React + TS project, folder structure, navigation, and
   empty pages. Confirm it runs with `npm run dev`.
2. **Counters**: `dates.ts` with tests, then the Gotcha Day and Age cards.
3. **Picture of the Day**.
4. **Appointments & medication tracker**.
5. **Diary** with stats and chart.
6. **Polish**: home dashboard, styling, empty states, celebration effects, README.
7. **Deploy**: help me push to GitHub and deploy to Vercel.

After each phase: run the tests and the build, tell me what you made and how to see it.

## 7. Optional AI feature (Phase 8, for the portfolio)

Add a "Nemo's Week" button that sends the last 7 diary entries to the Claude API and
returns a short, fun weekly recap written from Nemo's point of view.
- The API key must **never** be in the frontend code. Use a small serverless function
  (e.g. a Vercel function) that holds the key in an environment variable.
- Show a loading state and a friendly error if the call fails.

## 8. Don't

- Don't add login, accounts, or a backend (except the Phase 8 function).
- Don't add features I didn't list without asking.
- Don't commit API keys or personal info.
