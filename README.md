# Backend — candidate submission API

## Repository

Standalone backend for this assessment:

**https://github.com/ashishu703/xiacom_assesment_backend.git**

```bash
git clone https://github.com/ashishu703/xiacom_assesment_backend.git
cd xiacom_assesment_backend
```

Then follow **Run locally** below (from the repo root). Copy **`.env.example`** to **`.env`** and set **`MONGO_URI`** and **`JWT_SECRET`** before `npm run dev`.

---

Node and Express service for signup/login and protected candidate submissions. MongoDB holds users and submitted candidates; Multer writes uploads to disk under `uploads/`.

## What it does

- **Auth:** register, issue JWT on login, optional `GET /me` for a client that wants to confirm the token still maps to a user.
- **Intake:** one `POST /candidate/submit` that accepts multipart data: plain text fields, a JSON string `documentEntries` (filename + declared type per row), and binary `documentFiles` in the **same order** as those entries.
- **Validation:** normalized in validators (age, email, addresses when “same as residential” is false, minimum two documents, MIME types aligned with what Multer allows). Business rules live in services; persistence in repositories.

## How requests move through the code

Rough path: **route** → **controller** (thin) → **service** → **repository** / **model**. Controllers use a small **`asyncHandler`** helper so promise rejections reach the global error middleware instead of each action opening its own `try/catch`. **`AppError`** carries HTTP status and message; **`errorMiddleware`** turns that (and unexpected errors) into JSON responses.

Auth-protected routes use **`authenticate`**, which reads `Authorization: Bearer <token>` and attaches `userId` for downstream code.

## File uploads

- **Multer** saves files with disk storage; max size **12 MB** per file (`middlewares/uploadMiddleware.js`).
- Allowed MIME types are centralized in **`constants/candidateDocuments.js`** so the upload filter and submission validator stay aligned: **JPEG, PNG, PDF**.
- Static route **`/uploads`** serves stored files for local use; swapping in S3 or similar later would mean changing storage in one place.

## Environment

Copy **`.env.example`** to **`.env`** and set:

- **`MONGO_URI`** — your Mongo connection string  
- **`JWT_SECRET`** — required; used to sign and verify tokens  
- **`PORT`** — optional; defaults to `5000`

## Run locally

```bash
npm install
npm run dev
```

Production-style:

```bash
npm start
```

Seed sample candidates (no-op if the collection already has data):

```bash
npm run seed
```

## Endpoints

**Auth** (`/api/auth`)

- `POST /signup` — body: `fullName`, `email`, `password`  
- `POST /login` — body: `email`, `password` → `token`, `user`  
- `GET /me` — header: `Authorization: Bearer …` → current user  

**Candidate** (`/api/candidate`)

- `POST /submit` — requires Bearer token; `multipart/form-data` with intake fields, `documentEntries` (JSON array string), and `documentFiles`  

## Validation highlights

- Age from date of birth must be **18 or older**  
- At least **two** documents  
- Declared document type must match the file’s actual MIME type  
- Permanent address fields required only when the payload says the address is **not** the same as residential  

## Error responses

Failures return JSON with a consistent shape through the error middleware (message and status). Multer errors (e.g. file too large) are mapped to sensible status codes where possible.
