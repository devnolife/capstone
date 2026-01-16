<div align="center">

# Capstone Project Management System

### Platform Pengumpulan & Penilaian Capstone Project Mahasiswa Informatika

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

<p align="center">
  <strong>Sistem terintegrasi untuk mengelola pengumpulan project capstone, review kode, dan penilaian mahasiswa.</strong>
</p>

[Demo](#demo) • [Fitur](#-fitur) • [Tech Stack](#-tech-stack) • [Instalasi](#-instalasi) • [Dokumentasi](#-dokumentasi)

</div>

---

## Overview

**Capstone Project Management System** adalah platform web modern yang dirancang untuk memfasilitasi proses pengumpulan, review, dan penilaian project capstone mahasiswa Program Studi Informatika. Sistem ini menghubungkan mahasiswa, dosen penguji, dan admin dalam satu ekosistem yang terintegrasi dengan GitHub.

## Demo

| Role      | Credentials                  |
| --------- | ---------------------------- |
| Admin     | `admin@university.ac.id`     |
| Dosen     | `dosen@university.ac.id`     |
| Mahasiswa | `mahasiswa@university.ac.id` |

> Password default: `password123`

---

## Fitur

### Untuk Mahasiswa

- **Project Management** - Buat dan kelola project capstone
- **GitHub Integration** - Hubungkan repository GitHub untuk code review
- **Document Upload** - Upload proposal, BAB 1-5, laporan akhir, dan presentasi
- **Review Tracking** - Pantau progress review dan feedback dari dosen
- **Notifications** - Terima notifikasi real-time untuk setiap update

### Untuk Dosen Penguji

- **Project Review** - Review project yang ditugaskan dengan rubrik penilaian
- **Code Review** - Lihat dan review kode langsung dari GitHub
- **Scoring System** - Berikan nilai berdasarkan kriteria rubrik
- **Inline Comments** - Tambahkan komentar pada file atau baris kode tertentu

### Untuk Admin

- **User Management** - Kelola akun mahasiswa, dosen, dan admin
- **Assignment Management** - Tugaskan dosen penguji ke project mahasiswa
- **Rubrik Configuration** - Konfigurasi kriteria dan bobot penilaian
- **Semester Management** - Kelola periode semester akademik
- **System Monitoring** - Dashboard overview seluruh aktivitas sistem

---

## Tech Stack

### Frontend

| Technology          | Description                       |
| ------------------- | --------------------------------- |
| **Next.js 16**      | React framework dengan App Router |
| **TypeScript**      | Type-safe JavaScript              |
| **HeroUI**          | Modern UI component library       |
| **Tailwind CSS v4** | Utility-first CSS framework       |
| **Framer Motion**   | Animation library                 |
| **Lucide React**    | Beautiful icon library            |

### Backend

| Technology             | Description              |
| ---------------------- | ------------------------ |
| **Next.js API Routes** | Serverless API endpoints |
| **Prisma 7**           | Next-generation ORM      |
| **PostgreSQL**         | Relational database      |
| **NextAuth.js v5**     | Authentication solution  |
| **Octokit**            | GitHub API client        |
| **Zod**                | Schema validation        |

### Infrastructure

| Technology | Description                     |
| ---------- | ------------------------------- |
| **Docker** | Containerization (optional)     |
| **Vercel** | Recommended deployment platform |

---

## Instalasi

### Prerequisites

- Node.js 20.x atau lebih baru
- PostgreSQL 14.x atau lebih baru
- npm, yarn, atau pnpm
- Git

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-username/capstone.git
cd capstone

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database dan OAuth credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Push database schema
npx prisma db push

# 6. (Optional) Seed database dengan data awal
npx prisma db seed

# 7. Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

Buat file `.env` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/capstone"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# GitHub OAuth (untuk login dan integrasi GitHub)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## Struktur Project

```
capstone/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── uploads/               # Uploaded documents
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── dosen/         # Dosen dashboard
│   │   │   ├── mahasiswa/     # Mahasiswa dashboard
│   │   │   └── notifications/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── assignments/
│   │   │   ├── documents/
│   │   │   ├── github/
│   │   │   ├── notifications/
│   │   │   ├── projects/
│   │   │   ├── reviews/
│   │   │   ├── rubrik/
│   │   │   ├── semesters/
│   │   │   └── users/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── projects/          # Project components
│   │   └── ui/                # UI components (Sidebar, Header)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── github.ts          # GitHub API client
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Utility functions
│   │   └── validations.ts     # Zod schemas
│   └── generated/
│       └── prisma/            # Generated Prisma client
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## API Reference

### Authentication

| Endpoint                  | Method | Description       |
| ------------------------- | ------ | ----------------- |
| `/api/auth/register`      | POST   | Register new user |
| `/api/auth/[...nextauth]` | \*     | NextAuth handlers |

### Projects

| Endpoint             | Method | Description        |
| -------------------- | ------ | ------------------ |
| `/api/projects`      | GET    | List all projects  |
| `/api/projects`      | POST   | Create new project |
| `/api/projects/[id]` | GET    | Get project detail |
| `/api/projects/[id]` | PUT    | Update project     |
| `/api/projects/[id]` | DELETE | Delete project     |

### Reviews

| Endpoint            | Method | Description         |
| ------------------- | ------ | ------------------- |
| `/api/reviews`      | GET    | List reviews        |
| `/api/reviews`      | POST   | Create review       |
| `/api/reviews/[id]` | PUT    | Update review score |

### GitHub Integration

| Endpoint            | Method | Description             |
| ------------------- | ------ | ----------------------- |
| `/api/github/repos` | GET    | Get user's repositories |
| `/api/github/files` | GET    | Get repo files/content  |

### Admin

| Endpoint           | Method          | Description        |
| ------------------ | --------------- | ------------------ |
| `/api/users`       | GET/POST        | Manage users       |
| `/api/assignments` | GET/POST/DELETE | Manage assignments |
| `/api/rubrik`      | GET/POST        | Manage rubrics     |
| `/api/semesters`   | GET/POST        | Manage semesters   |

---

## Database Schema

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Review : writes
    User ||--o{ ProjectAssignment : assigned
    User ||--o{ Notification : receives

    Project ||--o{ Document : has
    Project ||--o{ Review : receives
    Project ||--o{ ProjectAssignment : has

    Review ||--o{ ReviewComment : has
    Review ||--o{ ReviewScore : has

    RubrikPenilaian ||--o{ ReviewScore : used_in

    User {
        string id PK
        string email UK
        string name
        string password
        enum role
        string nim
        string nip
        string githubToken
    }

    Project {
        string id PK
        string title
        string description
        enum status
        string githubRepoUrl
        string semester
    }

    Review {
        string id PK
        enum status
        int overallScore
        string overallComment
    }
```

---

## Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db pull   # Pull schema from database
npx prisma studio    # Open Prisma Studio
npx prisma db seed   # Seed database

# Type checking
npx tsc --noEmit     # Check TypeScript types
```

---

## Deployment

### Vercel (Recommended)

1. Push code ke GitHub repository
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t capstone .

# Run container
docker run -p 3000:3000 --env-file .env capstone
```

### Manual

```bash
# Build
npm run build

# Start
npm run start
```

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [HeroUI](https://heroui.com/) - Beautiful React Components
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://authjs.dev/) - Authentication for Next.js
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

<div align="center">
  <p>Built with by Informatika Team</p>
  <p>
    <a href="https://github.com/your-username/capstone/issues">Report Bug</a>
    •
    <a href="https://github.com/your-username/capstone/issues">Request Feature</a>
  </p>
</div>
