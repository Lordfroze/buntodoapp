# Project: Todo App Full-Stack

Buat aplikasi Todo List sederhana yang memiliki fitur autentikasi pengguna menggunakan stack teknologi berikut.

## 1. Tech Stack

**Frontend**

- Svelte dengan SvelteKit atau setup Svelte yang sesuai untuk SPA.
- TypeScript.
- Tailwind CSS untuk styling UI.
- Gunakan pendekatan komponen agar kode mudah dirawat.

**Backend**

- Bun sebagai JavaScript runtime dan package manager.
- ElysiaJS sebagai backend framework.
- TypeScript.
- REST API untuk komunikasi antara frontend dan backend.

**Database**

- MySQL.
- Drizzle ORM untuk database queries, schema, dan migrations.

## 2. Database Configuration

Gunakan konfigurasi database lokal berikut:

- Host: `localhost`
- Port: `3306`
- Database: `todoapp`
- Username: `root`
- Password: kosong (`""`)

Simpan konfigurasi database di file `.env`. Jangan menuliskan kredensial database secara langsung di source code.

Contoh konfigurasi:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=todoapp
```

Sesuaikan nama variabel environment dengan implementasi backend.

Buat schema database dan migration menggunakan Drizzle ORM. Jangan mengandalkan tabel yang dibuat secara manual.

## 3. Authentication

Implementasikan sistem autentikasi yang benar-benar berfungsi.

Fitur:

- Registrasi akun menggunakan nama, email, dan password.
- Login menggunakan email dan password.
- Logout.
- Endpoint untuk memeriksa status login pengguna.
- Halaman yang hanya bisa diakses setelah login.
- Setiap pengguna hanya dapat melihat dan mengelola todo miliknya sendiri.

Persyaratan keamanan:

- Password harus di-hash menggunakan algoritma yang aman, bukan disimpan sebagai plaintext.
- Gunakan session berbasis cookie `HttpOnly` dengan konfigurasi keamanan yang sesuai.
- Jangan menyimpan password atau session token sensitif di localStorage.
- Validasi seluruh input di backend.
- Lindungi endpoint todo dari akses tanpa autentikasi.
- Cegah pengguna mengakses todo milik pengguna lain.
- Tangani email duplikat, password tidak valid, dan kredensial login yang salah dengan baik.
- Gunakan konfigurasi cookie yang sesuai untuk lingkungan development dan production.

## 4. Todo Features

Setelah login, pengguna dapat:

- Melihat daftar todo miliknya.
- Menambahkan todo baru.
- Mengedit judul dan deskripsi todo.
- Menandai todo sebagai selesai atau belum selesai.
- Menghapus todo.
- Melihat status todo, misalnya All, Active, dan Completed.
- Melihat pesan ketika daftar todo masih kosong.

Setiap todo minimal memiliki:

- `id`
- `userId`
- `title`
- `description` (opsional)
- `isCompleted`
- `createdAt`
- `updatedAt`

Hubungkan setiap todo dengan pemiliknya melalui relasi database.

## 5. UI/UX

Buat antarmuka yang modern, sederhana, responsif, dan mudah digunakan.

Halaman yang diperlukan:

1. **Login** — form email dan password.
2. **Register** — form nama, email, password, dan konfirmasi password.
3. **Dashboard Todo** — daftar todo, form tambah/edit, filter status, dan tombol logout.

Ketentuan UI:

- Desain minimalis dengan tata letak yang bersih.
- Mendukung desktop dan mobile.
- Tampilkan loading state ketika mengambil atau mengirim data.
- Tampilkan pesan sukses dan error yang mudah dipahami.
- Sediakan konfirmasi sebelum menghapus todo.
- Gunakan komponen yang reusable.
- Pastikan navigasi dan form bekerja dengan baik, bukan sekadar tampilan statis.

## 6. Backend API

Buat REST API yang terstruktur menggunakan ElysiaJS.

Minimal sediakan endpoint berikut:

**Authentication**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

**Todos**

- `GET /api/todos`
- `POST /api/todos`
- `GET /api/todos/:id`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`

Terapkan middleware atau mekanisme autentikasi yang sesuai pada endpoint todo. Semua operasi harus dibatasi berdasarkan pengguna yang sedang login.

Gunakan HTTP status code yang tepat dan format respons JSON yang konsisten. Tangani error tanpa membocorkan detail internal server.

## 7. Project Structure

Pisahkan frontend dan backend agar mudah dikembangkan.

Contoh struktur yang dapat digunakan:

```text
todoapp/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   ├── routes/
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   │   ├── db/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── todos/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── drizzle/
│   ├── drizzle.config.ts
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

Struktur boleh disesuaikan jika ada pendekatan yang lebih sederhana dan sesuai dengan stack yang digunakan.

## 8. Development Requirements

- Gunakan versi package yang kompatibel satu sama lain.
- Gunakan Bun untuk menjalankan dan mengelola dependency backend.
- Gunakan Drizzle ORM untuk semua operasi database.
- Buat script development dan production yang jelas.
- Konfigurasikan CORS secara tepat jika frontend dan backend berjalan pada origin berbeda.
- Gunakan environment variables untuk konfigurasi.
- Sertakan `.env.example` tanpa kredensial sensitif.
- Jangan commit file `.env` ke Git.
- Buat migration database yang dapat dijalankan untuk membuat seluruh tabel yang diperlukan.
- Pastikan frontend benar-benar terhubung dengan backend dan database.
- Jangan gunakan mock data sebagai pengganti fitur yang seharusnya sudah terhubung.
- Hindari overengineering. Buat implementasi sederhana, mudah dipahami, dan mudah dikembangkan.

## 9. README

Buat dokumentasi `README.md` berbahasa Indonesia yang menjelaskan:

- Prasyarat instalasi.
- Cara menyiapkan database MySQL `todoapp`.
- Cara mengatur file `.env`.
- Cara menginstal dependency frontend dan backend.
- Cara menjalankan migration Drizzle.
- Cara menjalankan frontend dan backend dalam development.
- URL frontend dan backend.
- Daftar endpoint API.
- Cara menjalankan aplikasi dari awal sampai siap digunakan.

## 10. Execution Instructions

Sebelum mulai:

1. Periksa kondisi direktori project dan file yang sudah tersedia.
2. Tentukan struktur project yang sesuai.
3. Pastikan pilihan versi Svelte, Bun, ElysiaJS, Drizzle ORM, dan driver MySQL kompatibel.
4. Implementasikan aplikasi secara bertahap.

Setelah implementasi:

1. Jalankan migration database.
2. Periksa TypeScript dan perbaiki error.
3. Jalankan pemeriksaan atau build frontend dan backend.
4. Uji registrasi, login, logout, serta seluruh operasi CRUD todo.
5. Pastikan autentikasi dan isolasi data antar pengguna berfungsi.
6. Perbaiki error yang ditemukan sebelum menyatakan project selesai.

Jangan hanya memberikan tutorial atau potongan kode. Buat dan implementasikan file project secara langsung di direktori kerja yang tersedia. Jangan mengklaim fitur atau pengujian berhasil jika belum benar-benar dijalankan.
