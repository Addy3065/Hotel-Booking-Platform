# Project Context

_Durable knowledge for every agent session: architecture, conventions, decisions, gotchas._

## Architecture
- WandersHub hotel listings: Express 5 + EJS (ejs-mate layouts) + Mongoose 9 + Passport (passport-local-mongoose) + connect-mongo sessions; images to Cloudinary via multer, geocoding/maps via Mapbox.
- Entry `app.js`; routes/controllers in `src/`, models in `models/`, Joi schemas in `schema.js`, seed in `init/` (`node init/index.js`, owner via `SEED_OWNER_ID`).
- `/` redirects to `/listings`; `/listings?location=` filters by location or country (navbar search).

- Preview: https://hotels.129-154-229-134.sslip.io → systemd `hotel-booking` (node app.js, PORT=4440 from .env) + `hotel-mongo` (/usr/local/bin/mongod, dbpath /var/lib/hotel-mongo, :27018); Caddy block appended to /etc/caddy/Caddyfile. Restart app with `sudo systemctl restart hotel-booking` after code changes. Demo login demo/demo1234.

## Conventions
- Env (.env, gitignored): ATLASDB_URL (falls back to local mongodb://127.0.0.1:27017/hotels), SECRET, MAP_TOKEN, CLOUD_NAME/CLOUD_API_KEY/CLOUD_API_SECRET, PORT (default 8080).
- Reviews: rating 1–5 via CSS star radios (`.star-rating` in style.css, radios rendered 5→1 with row-reverse).

## Decisions
- Owner asked not to change dependencies or existing functionality when fixing bugs.

## Gotchas
- connect-mongo v6: use `const { MongoStore } = require("connect-mongo")`.
- Express 5 leaves req.body undefined for multipart until multer runs: middleware reading req.body must come after `upload.single(...)`.
- Listing `geometry` is required. `utils/geocode.js` uses Mapbox when MAP_TOKEN is set, else OSM Nominatim; show page backfills missing geometry. Mapbox GL v3 renders nothing without a token, so map.js falls back to Leaflet (CDN, loaded only when no token) + OSM tiles.
- `node init/index.js` wipes listings and creates/reuses user demo/demo1234 as owner.
- `systemctl reload caddy` fails on this box (PrivateTmp namespace error); use `sudo caddy reload --config /etc/caddy/Caddyfile`.
- Port 8090 on this server is used by another app; test on another port.
