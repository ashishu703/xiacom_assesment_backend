# Backend — Candidate Submission API

This is the backend service for the candidate submission system built as part of the assessment.

It handles user authentication and lets logged-in users submit their details along with required documents.

---

## What this service does

* Users can sign up and log in
* A JWT is issued on login and used for protected routes (`Authorization: Bearer …`)
* Candidates can submit an application with documents (multipart)
* Inputs are validated before anything is saved to the database
* Uploaded files are stored on disk under `uploads/candidates` and served locally via `/uploads`

---

## Tech used

* Node.js + Express
* MongoDB (Mongoose)
* Multer (file uploads)
* JWT (authentication)

---

## Getting started

Clone the repo:

```bash
git clone https://github.com/ashishu703/xiacom_assesment_backend.git
cd xiacom_assesment_backend
```

Install dependencies:

```bash
npm install
```

---

## Environment setup

Copy `.env.example` to `.env` in the project root (or create `.env` yourself) and set:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
PORT=5000
```

`JWT_SECRET` is required for signing and verifying tokens. `PORT` defaults to `5000` if omitted.

---

## Run the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

## API routes

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/login`
* `GET /api/auth/me` (requires token)

### Candidate

* `POST /api/candidate/submit` (requires token)

This route expects `multipart/form-data` with:

* Text fields (name, email, date of birth, addresses, same-as-residential flag, etc.)
* `documentEntries` — JSON **string** (array of `{ fileName, fileType }` in submission order)
* `documentFiles` — the actual files, in the **same order** as `documentEntries`

---

## Validation rules

* User must be at least **18** years old (from date of birth)
* At least **2** documents are required
* Declared file type must match the real MIME type (image vs PDF), aligned with what Multer accepts
* Permanent address is required only when the payload says it is **not** the same as residential

---

## File upload

* Files land in `uploads/candidates` (ignored by git except a `.gitkeep` so the folder exists)
* Max size: **12 MB** per file
* Allowed: **JPEG, PNG, PDF** (rules live in `constants/candidateDocuments.js` so Multer and validators stay in sync)

---

## Project structure (rough)

* `routes` — wiring
* `controllers` — request / response (kept small)
* `services` — business logic
* `repositories` — database access
* `validators` — input normalization and checks
* `middlewares` — auth, upload, errors (`asyncHandler` + `AppError` + global error middleware)

---

## Notes

* Controllers stay thin on purpose; validation is split out so it is easier to maintain
* No `try/catch` inside individual controllers — async errors are routed through `asyncHandler` and the central error middleware
* File storage is local for now; the same flow could point at S3 or similar later

---

## Seed data

```bash
npm run seed
```

Adds sample candidates. It skips work if the collection already has documents.

---

## Possible improvements

* Cloud storage (e.g. S3 / Cloudinary) instead of local disk
* Refresh tokens
* Rate limiting

---

That’s it. The API is straightforward to run and test.
