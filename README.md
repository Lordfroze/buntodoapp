# Todo App Full-Stack

Aplikasi Todo List sederhana dengan autentikasi pengguna. Setiap pengguna hanya
dapat melihat dan mengelola todo miliknya sendiri.

- **Frontend:** SvelteKit (SPA mode) + Svelte 5 + TypeScript + Tailwind CSS
- **Backend:** Bun + ElysiaJS + TypeScript (REST API)
- **Database:** MySQL + Drizzle ORM (schema & migrations)
- **Autentikasi:** session JWT di dalam cookie `HttpOnly`

---

## 1. Struktur Project

```text
todoappbun/
├── backend/                 # REST API (Bun + ElysiaJS + Drizzle)
│   ├── src/
│   │   ├── db/              # koneksi, schema, migrate, seed, createDatabase
│   │   ├── lib/             # env & helper error
│   │   ├── middleware/      # autentikasi (cookie -> user)
│   │   ├── modules/
│   │   │   ├── auth/        # register, login, logout, me
│   │   │   └── todos/       # CRUD todo
│   │   └── index.ts         # entry point Elysia
│   ├── drizzle/             # file migration SQL + meta
│   ├── drizzle.config.ts
│   ├── .env.example
│   └── package.json
├── frontend/                # SPA (SvelteKit + Tailwind)
│   ├── src/
│   │   ├── lib/             # api client, store auth, komponen reusable
│   │   └── routes/          # /login, /register, /dashboard
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## 2. Prasyarat

Pastikan sudah terpasang:

- **Bun** >= 1.1 &nbsp;([install](https://bun.sh/docs/installation))
- **MySQL** >= 8.0 (atau MariaDB yang kompatibel), berjalan di `localhost:3306`

Cek instalasi:

```bash
bun --version
mysql --version
```

---

## 3. Menyiapkan Database MySQL

Aplikasi menggunakan database bernama `todoapp` dengan user `root` tanpa password
(konfigurasi default untuk development lokal).

Buat databasenya (pilih salah satu):

```bash
# Opsi A - lewat MySQL client
mysql -u root -e "CREATE DATABASE IF NOT EXISTS todoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Opsi B - lewat script Bun (tanpa perlu MySQL client)
cd backend
bun run db:create
```

> Tabel **tidak** dibuat manual. Seluruh tabel dibuat melalui migration Drizzle
> (lihat langkah 6).

Jika MySQL Anda memakai password, sesuaikan `DB_PASSWORD` pada langkah berikutnya.

---

## 4. Konfigurasi Environment

### Backend (`backend/.env`)

```bash
cd backend
cp .env.example .env
```

Isi `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=todoapp

JWT_SECRET=dev_secret_change_me
COOKIE_NAME=session_id
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
COOKIE_MAX_AGE_SECONDS=604800

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Catatan:

- `JWT_SECRET` **wajib** diganti dengan string acak yang panjang sebelum production.
- `COOKIE_SECURE=true` dan `NODE_ENV=production` saat deploy di HTTPS.
- `FRONTEND_URL` dipakai untuk konfigurasi CORS.

### Frontend (`frontend/.env`)

```bash
cd frontend
cp .env.example .env
```

Isi `frontend/.env`:

```env
PUBLIC_API_URL=http://localhost:3000
```

File `.env` sudah masuk `.gitignore` dan tidak akan ikut ter-commit.

---

## 5. Instalasi Dependency

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install
```

---

## 6. Menjalankan Migration Drizzle

Migration membuat tabel `users` dan `todos` beserta relasinya.

```bash
cd backend
bun run db:migrate
```

Opsional — mengisi data contoh (user `demo@example.com` / `password123`):

```bash
bun run db:seed
```

Perintah Drizzle lain yang tersedia:

| Perintah | Fungsi |
| --- | --- |
| `bun run db:create` | Membuat database `todoapp` jika belum ada |
| `bun run db:generate` | Membuat file migration baru dari `src/db/schema.ts` |
| `bun run db:migrate` | Menjalankan seluruh migration |
| `bun run db:push` | Sinkronisasi schema langsung (tanpa file migration) |
| `bun run db:seed` | Mengisi data contoh |

---

## 7. Menjalankan Aplikasi (Development)

Jalankan backend dan frontend di dua terminal terpisah.

**Terminal 1 - Backend:**

```bash
cd backend
bun run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
bun run dev
```

| Layanan | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| Health/Info | http://localhost:3000/ |

Buka http://localhost:5173, lalu **Daftar** akun baru atau login.

### Build untuk production

```bash
# Backend
cd backend
bun run build      # output ke backend/dist
bun run start      # jalankan hasil build

# Frontend
cd frontend
bun run build      # output static SPA ke frontend/build
bun run preview    # cek hasil build secara lokal
```

> Saat production, set `COOKIE_SECURE=true`, `NODE_ENV=production`, isi
> `JWT_SECRET` yang kuat, dan arahkan `FRONTEND_URL` ke domain frontend.

---

## 8. Endpoint API

Semua respons memakai format konsisten: `{ "success": boolean, "data"?: ..., "error"?: string }`.

### Authentication

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Registrasi akun (name, email, password) | Publik |
| POST | `/api/auth/login` | Login (email, password) | Publik |
| POST | `/api/auth/logout` | Logout, menghapus cookie | Login |
| GET | `/api/auth/me` | Ambil user yang sedang login | Login |

### Todos

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| GET | `/api/todos` | Daftar todo milik user |
| POST | `/api/todos` | Tambah todo baru |
| GET | `/api/todos/:id` | Detail satu todo |
| PATCH | `/api/todos/:id` | Ubah `title`, `description`, `isCompleted` |
| DELETE | `/api/todos/:id` | Hapus todo |

Semua endpoint todo wajib menyertakan cookie session. Request tanpa session
mendapat `401 Unauthorized`, dan todo milik user lain tidak dapat diakses
(`404 Not Found`).

Contoh:

```bash
# Register
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi","email":"budi@example.com","password":"rahasia123"}'

# Login
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@example.com","password":"rahasia123"}'

# Tambah todo
curl -b cookies.txt -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Belajar Drizzle","description":"Baca dokumentasi"}'

# Daftar todo
curl -b cookies.txt http://localhost:3000/api/todos
```

---

## 9. Menjalankan dari Nol sampai Siap Dipakai

```bash
# 1. Siapkan database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS todoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Backend
cd backend
cp .env.example .env        # sesuaikan bila perlu
bun install
bun run db:migrate          # membuat tabel
bun run db:seed             # opsional: data contoh
bun run dev                 # terminal 1

# 3. Frontend (terminal baru)
cd frontend
cp .env.example .env
bun install
bun run dev                 # terminal 2

# 4. Buka http://localhost:5173
```

---

## 10. Catatan Keamanan

- Password di-hash dengan **bcrypt** (via `Bun.password`), tidak pernah disimpan sebagai plaintext.
- Session disimpan sebagai JWT di cookie **`HttpOnly`** + `SameSite`, sehingga
  tidak dapat dibaca JavaScript dan **tidak** disimpan di `localStorage`.
- Seluruh input divalidasi di backend dengan Zod.
- Endpoint todo diproteksi dan setiap query difilter berdasarkan `userId`,
  sehingga user tidak dapat mengakses data milik user lain.
- Error 500 tidak membocorkan detail internal server.
