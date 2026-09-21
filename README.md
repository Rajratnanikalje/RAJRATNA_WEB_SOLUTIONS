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
