# 🚀 NextDash

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?logo=next.js&style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react&style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&style=for-the-badge)
![Drizzle ORM](https://img.shields.io/badge/Drizzle--ORM-0.44.7-C5F74F?logo=drizzle&style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&style=for-the-badge)
![Radix UI](https://img.shields.io/badge/Radix--UI-Components-lightgrey?logo=radix-ui&style=for-the-badge)
![Shadcn/ui](https://img.shields.io/badge/Shadcnui-Components-lightgrey?logo=shadcnui&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&style=for-the-badge)

NextDash is a **modern dashboard starter kit** built with the latest versions of **Next.js**, **React**, and **Tailwind CSS**. It includes authentication, server actions, UI primitives, charts, forms, and more—providing a strong foundation for building SaaS dashboards and internal tools.

---

## 📦 Tech Stack

| Layer | Technology | Description |
|-------|-------------|--------------|
| **Framework** | Next.js 16 | App Router, Server Actions, Middleware |
| **UI/UX** | Radix UI + shadcn/ui | Accessible, customizable UI components |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Forms & Validation** | React Hook Form + Zod | Declarative form validation |
| **Database** | Drizzle ORM + Postgres | Type-safe database schema & queries |
| **Auth** | Better Auth | Full authentication flow |
| **Charts** | Recharts | Responsive charts |
| **Data Table** | TanStack Table | High-level data grid |
| **Icons** | Lucide React | Modern icon system |

---

## ⚙️ Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/nextdash.git
cd nextdash
npm install
```

### 2. Environment Variables
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/nextdash
AUTH_SECRET=your-secret-key
```

### 3. Run Development Server
```bash
```bash
# Bun
bun dev
# or

# NPM\ nnpm run dev
# Yarn
yarn dev
# pnpm
pnpm dev
```
Visit → http://localhost:3000 → http://localhost:3000

---

## 🗂️ Project Structure

```
src/
├─ app/
│  ├─ (public)/            # Public marketing pages
│  ├─ (auth)/              # Sign-in / Sign-up / Reset
│  ├─ (dashboard)/         # Protected routes
│  ├─ api/                 # Route handlers
│  ├─ layout.tsx           # Root layout
│  └─ globals.css
│
├─ components/             # UI + form components
├─ server/                 # Server actions + DB logic
├─ lib/                    # Auth, utils, validators
├─ styles/                 # Tailwind + global styles
└─ middleware.ts
```

---

## 🧱 Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit generate --name=init` | Drizzle generate |
| `npx drizzle-kit migrate`  | Drizzle migrate |

---

## 🌐 Deployment

You can deploy using **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or build manually:
```bash
npm run build
npm run start
```

---

## 🧩 Key Dependencies (Badges)

- ![Drizzle ORM](https://img.shields.io/badge/Drizzle--ORM-0.44.7-yellow)
- ![Radix UI](https://img.shields.io/badge/Radix--UI-Components-lightgrey)
- ![React Hook Form](https://img.shields.io/badge/React--Hook--Form-7.66.1-EC5990)
- ![Zod](https://img.shields.io/badge/Zod-4.1.13-blue)
- ![Better Auth](https://img.shields.io/badge/Better--Auth-1.4.1-green)
- ![Recharts](https://img.shields.io/badge/Recharts-3.5.0-orange)

---

## 🧠 Learn More

- https://nextjs.org/docs
- https://tailwindcss.com
- https://orm.drizzle.team

---

## 🪪 License

This project is licensed under the MIT License.

