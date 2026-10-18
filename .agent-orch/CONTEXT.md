# Project Context

_Durable knowledge for every agent session: architecture, conventions, decisions, gotchas._

## Architecture
- WandersHub hotel listings: Express 5 + EJS (ejs-mate layouts) + Mongoose 9 + Passport (passport-local-mongoose) + connect-mongo sessions; images to Cloudinary via multer, geocoding/maps via Mapbox.
- Entry `app.js`; routes/controllers in `src/`, models in `models/`, Joi schemas in `schema.js`, seed in `init/` (`node init/index.js`, owner via `SEED_OWNER_ID`).
- `/` redirects to `/listings`; `/listings?location=` filters by location or country (navbar search).

## Conventions
- Env (.env, gitignored): ATLASDB_URL (falls back to local mongodb://127.0.0.1:27017/hotels), SECRET, MAP_TOKEN, CLOUD_NAME/CLOUD_API_KEY/CLOUD_API_SECRET, PORT (default 8080).
- Reviews: rating 1–5 via CSS star radios (`.star-rating` in style.css, radios rendered 5→1 with row-reverse).

## Decisions
- Owner asked not to change dependencies or existing functionality when fixing bugs.

## Gotchas
- connect-mongo v6: use `const { MongoStore } = require("connect-mongo")`.
- Express 5 leaves req.body undefined for multipart until multer runs: middleware reading req.body must come after `upload.single(...)`.
- Listing `geometry` is required, so seed data carries coordinates; creating listings needs MAP_TOKEN (Mapbox client is only built when the token exists).
- Port 8090 on this server is used by another app; test on another port.
