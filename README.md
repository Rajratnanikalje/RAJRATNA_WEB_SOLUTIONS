# RAJRATNA WEB SOLUTIONS

Production-oriented full-stack website and admin CMS for RAJRATNA WEB SOLUTIONS.

## Stack
React + Vite + React Router + Framer Motion + Axios + Tailwind CSS  
Node + Express + MongoDB/Mongoose + JWT + bcryptjs + Cloudinary

## Run locally

### Backend
```bash
cd server
npm install
copy .env.example .env
# Fill in MONGO_URI, JWT_SECRET and Cloudinary credentials.
npm run create-admin
npm run seed
npm run dev
```

`npm run seed` replaces all services, projects and technologies. Never run it
against production unless you intentionally want to reset that CMS content; in
production it additionally requires `SEED_CONFIRM=DELETE_AND_RESEED`.

### Frontend
```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Client: http://localhost:5173  
API: http://localhost:5000

## Admin
http://localhost:5173/admin/login

`ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` are used by `npm run create-admin`.

## Included CMS
- Dashboard with MongoDB-backed statistics
- Services, Projects and Technologies CRUD
- Customer enquiries with status management
- Call, Email and WhatsApp actions
- New-enquiry notification tracking
- Direct image upload (JPG/JPEG/PNG/WEBP) for services, projects, technologies and site images via Cloudinary
- Website/contact/SEO settings
- Responsive public website and admin panel

## Important
- Never commit or share `.env` files.
- Configure Cloudinary before using image uploads.
- The frontend uses the backend/MongoDB data as the source of truth; it does not silently replace failed API data with fake sample records.
- `vite.config.js` retains the existing Framer Motion/Motion DOM dependency optimization workaround. Do not remove it unless the runtime issue is re-tested and resolved.

## Production deployment

Deploy the API and the React app as two separate services. The API must be
deployed first because its URL is embedded into the frontend build.

### 1. Deploy the API

Use any Node.js host (for example Render or Railway) with these settings:

```text
Root directory: server
Build command: npm ci
Start command: npm start
Health check: /api/health
```

Add these environment variables in the host dashboard (never commit them):

```text
NODE_ENV=production
PORT=<provided automatically by most hosts>
MONGO_URI=<MongoDB Atlas production URI>
JWT_SECRET=<long, unique random value>
CLIENT_URL=https://www.your-domain.com
CLOUDINARY_CLOUD_NAME=<Cloudinary value>
CLOUDINARY_API_KEY=<Cloudinary value>
CLOUDINARY_API_SECRET=<Cloudinary value>
```

For more than one frontend origin, use a comma-separated `CLIENT_URL` list.
MongoDB Atlas must allow network access from the API host. Confirm the API at
`https://api.your-domain.com/api/health` after deployment.

### 2. Deploy the frontend

Use a static host (for example Vercel, Netlify, or Cloudflare Pages):

```text
Root directory: client
Build command: npm run build
Publish directory: dist
Environment variable: VITE_API_URL=https://api.your-domain.com/api
```

`client/vercel.json` configures Vercel SPA route fallbacks and
`client/public/_redirects` does the same for Netlify. For another host, configure
all unknown routes to serve `index.html`; this keeps direct visits to
`/admin/login` and other React routes working.

### 3. Final checklist

- Update `CLIENT_URL` with the exact frontend URL (including `www` if used).
- Rebuild/redeploy the frontend after setting `VITE_API_URL`; Vite embeds it at build time.
- Create the production admin once with `npm run create-admin` using strong, unique credentials.
- Do **not** run `npm run seed` on production unless intentionally resetting CMS data.
- Test contact submission, admin login, image upload, and a refresh on `/admin/login`.
