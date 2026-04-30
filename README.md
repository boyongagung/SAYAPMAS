# ERP Samas

[span_5](start_span)Sistem Enterprise Resource Planning (ERP) berbasis web yang dirancang sebagai penyempurnaan dari ERP Kopi Gajah[span_5](end_span). [span_6](start_span)[span_7](start_span)Proyek ini memprioritaskan konsistensi, kemudahan perawatan, dan efisiensi sumber daya[span_6](end_span)[span_7](end_span).

---

## Filosofi Pengembangan
[span_8](start_span)"Rapi sejak awal. Cepat berkembang. Mudah dirawat. Skalabel sejak dini. Tanpa multitafsir. Bisa diaudit."[span_8](end_span)

---

## Prinsip Inti (The Laws)
1. **[span_9](start_span)[span_10](start_span)Modular Monolith First**: Satu backend utama yang dipisahkan secara ketat per domain bisnis[span_9](end_span)[span_10](end_span).
2. **[span_11](start_span)[span_12](start_span)[span_13](start_span)Resource Aware Engineering**: Dioptimalkan untuk pengembangan pada device terbatas (Android 13, RAM 4GB+, Termux)[span_11](end_span)[span_12](end_span)[span_13](end_span).
3. **[span_14](start_span)Standard Over Preference**: Selera pribadi tidak boleh mengalahkan standar proyek yang telah ditetapkan[span_14](end_span).
4. **[span_15](start_span)[span_16](start_span)[span_17](start_span)No Interpretation Zone**: Aturan yang tertulis dalam Guiding Book bersifat mutlak dan tidak untuk ditafsir ulang[span_15](end_span)[span_16](end_span)[span_17](end_span).

---

## [span_18](start_span)Tech Stack Resmi[span_18](end_span)

| Layer | Teknologi |
| --- | --- |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy 2.x, Alembic, PostgreSQL |
| **Frontend** | Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **State/Form** | TanStack Query, React Hook Form, Zod |
| **Quality/Lint** | Ruff (Fast & Lightweight), Black, Mypy, Pytest |
| **Deployment** | Vercel, Railway, Neon PostgreSQL |

---

## [span_19](start_span)Struktur Folder Wajib[span_19](end_span)

Proyek ini menggunakan struktur folder yang kaku untuk menjamin konsistensi antar modul.

### Backend (`/backend/app/`)
[span_20](start_span)Setiap modul di bawah `modules/` **wajib** memiliki 7 file berikut[span_20](end_span):
- [span_21](start_span)`routes.py`: Boundary HTTP & validasi request saja (No business logic/DB query)[span_21](end_span).
- `schemas.py`: Definisi schema pydantic.
- [span_22](start_span)`service.py`: Pusat business rules dan pemilik transaksi (Transaction Owner)[span_22](end_span).
- [span_23](start_span)`repository.py`: Khusus query & CRUD (No commit)[span_23](end_span).
- `models.py`: Definisi ORM/Database model.
- `exceptions.py`: Custom exception khusus modul.
- `constants.py`: Konstanta spesifik modul.

### Frontend (`/frontend/src/`)
[span_24](start_span)Menggunakan arsitektur modular berbasis domain[span_24](end_span):
- [span_25](start_span)`app/`: Next.js App Router & Global Styles[span_25](end_span).
- `modules/`: Komponen dan logic per domain bisnis.
- `services/`: Integrasi API.

---

## Standar Operasional (Compliance)
- **Linter**: Wajib menjalankan `ruff check . -[span_26](start_span)-fix` dan `ruff format .` sebelum commit[span_26](end_span).
- **Styling**: Semua visual (font, background, warna) wajib mengacu pada `globals.css`. [span_27](start_span)Dilarang menggunakan inline style[span_27](end_span).
- **[span_28](start_span)Response**: Semua API wajib mengembalikan format: `{ "success": true, "message": "OK", "data": {} }`[span_28](end_span).
- **[span_29](start_span)[span_30](start_span)Naming**: File menggunakan `snake_case.py`, Class menggunakan `PascalCase`, dan API endpoint diawali dengan `/api/v1/`[span_29](end_span)[span_30](end_span).
- **[span_31](start_span)Transaction**: Semua operasi tulis wajib dibungkus dalam `with self.db.begin()` di level Service[span_31](end_span).

---

## Success Metric
[span_32](start_span)[span_33](start_span)Semua pengerjaan dievaluasi berdasarkan checklist kepatuhan[span_32](end_span)[span_33](end_span):
- **100%**: Lulus semua checklist (Clean code, No violation).
- **< 70%**: Otomatis ditolak (Required Refactor).

---
**[span_34](start_span)Motto**: Bukan sekadar coding, tetapi sistem yang bisa dipercaya[span_34](end_span).
