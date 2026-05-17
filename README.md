# 30 Minute Tomorrow

Three things you and your kid could do in the next 30 minutes. Enter age, interests, and vibe — get back ranked activities with full steps.

## Live site

[30min.tinkeryclaw.com](https://30min.tinkeryclaw.com)

## Run locally

```
python3 -m http.server 8080
# then open http://localhost:8080
```

The app is fully static — no build step, no backend. `activities.json` is fetched at runtime by the browser. `matcher.js` scores and ranks client-side.

## Architecture

- `index.html` — single-page app (form + results)
- `matcher.js` — client-side scoring logic
- `activities.json` — 80 hand-curated activities

## V1 feature set

- Age × interest × vibe × duration matching
- Top 3 ranked activities with steps, materials, extension prompts
- YouTube search button per activity
- Google Maps search link for nearby places (when city provided)
- "Try another set" reshuffles
- Print to PDF
