# PG/LAB — JSONB: Beyond the Rows

**Interactive presentation for GitHub Pages** · Topic 4 from the uploaded PostgreSQL optional assignment: **Advanced JSONB Querying in PostgreSQL**.

## What you get

- 15 fully designed English-language slides, planned for ~9 minutes.
- Interactive SQL query builder with category, RAM and price filters, matching six in-browser records.
- PostgreSQL-compatible SQL examples, GIN indexing strategies, JSONPath, lateral unnesting, and a short quiz.
- Presenter notes accessible with **N**; a separate transcript in `speaker-notes.md`.
- Offline-capable static pages (fonts fall back gracefully), no build step, no backend, no data collection.
- Print styles for a 16:9 PDF export.

### Controls

| Key | Action |
| --- | --- |
| `←`, `→` / Space | Previous or next slide |
| `G` | Slide overview |
| `N` | Presenter notes |
| `F` | Browser fullscreen |
| `P` | Print / Save as PDF |
| `Home` / `End` | First / last slide |
| `Esc` | Close an overlay |

Tap left/right navigation buttons on phones; swipe horizontally to navigate slides.

## Deploy to GitHub Pages

### Option A: browser UI

1. Create a **public** repository on GitHub (e.g., `postgres-jsonb-presentation`).
2. Upload **all files** from this folder **to the repository root**: `index.html`, `styles.css`, `app.js`, `favicon.svg`, `sample-data.sql`.
3. Navigate to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**.
4. Set branch **main**, folder **/(root)**, and save.
5. Open `https://YOUR_USERNAME.github.io/postgres-jsonb-presentation/` after GitHub deploys it.

### Option B: terminal (Linux/macOS)

```bash
cd jsonb-github-pages
git init
git add .
git commit -m "feat: interactive PostgreSQL JSONB slide deck"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/postgres-jsonb-presentation.git
git push -u origin main
```

Then configure **Settings → Pages → Deploy from a branch → main → /(root)**.

If your repo is named `YOUR_USERNAME.github.io`, the link is `https://YOUR_USERNAME.github.io/` instead.

## Academic submission

Your assignment requires a **PPTX or PDF upload** in addition to the oral 7–10-minute presentation. The ZIP is for hosting; upload `JSONB_Beyond_the_Rows.pdf` to the learning platform (included separately with this delivery). Keep speaker notes open on your laptop if useful.

### Suggested presentation flow

- 0:00–1:40: the problem, JSON vs JSONB, catalog dataset
- 1:40–3:40: operators, extraction, containment
- 3:40–4:50: live query demo
- 4:50–6:30: JSONPath and analytics
- 6:30–8:10: indexes, EXPLAIN and pitfalls
- 8:10–9:00: knowledge check and conclusion

### Run the real SQL examples

A local PostgreSQL database is optional. With `psql` connected:

```sql
\i sample-data.sql
```

The browser lab *illustrates* SQL filtering on local sample records. It does **not** connect to PostgreSQL or pretend to execute SQL.

## Source references

- https://www.postgresql.org/docs/current/datatype-json.html
- https://www.postgresql.org/docs/current/functions-json.html
- https://www.postgresql.org/docs/current/indexes-expressional.html
- https://www.postgresql.org/docs/current/using-explain.html

© Educational presentation. PostgreSQL is a trademark of the PostgreSQL Global Development Group.
