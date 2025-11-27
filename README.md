This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Structure

src/
├─ app/
│  ├─ (public)/                # Public-facing routes (marketing pages)
│  │   ├─ layout.tsx
│  │   └─ page.tsx
│  │
│  ├─ (auth)/                  # Auth routes
│  │   ├─ sign-in/
│  │   │   └─ page.tsx
│  │   ├─ sign-up/
│  │   │   └─ page.tsx
│  │   └─ reset-password/
│  │       └─ page.tsx
│  │
│  ├─ (dashboard)/             # Protected routes (session required)
│  │   ├─ layout.tsx           # Protected layout using server session
│  │   ├─ page.tsx
│  │   ├─ settings/
│  │   │   └─ page.tsx
│  │   └─ account/
│  │       └─ page.tsx
│  │
│  ├─ api/                     # Route handlers (only when needed)
│  │   └─ upload/route.ts
│  │
│  ├─ layout.tsx               # Root layout (fonts, providers)
│  ├─ page.tsx
│  └─ globals.css
│
├─ components/                 # UI components (RSC + Client Components)
│  ├─ ui/                      # shadcn/ui components
│  ├─ forms/                   # Form components (client)
│  ├─ layouts/                 # Shared layouts
│  ├─ client-only.tsx          # Wrapper for client-only rendering
│  └─ theme-provider.tsx
│
├─ server/                     # SERVER-ONLY logic (server actions)
│  ├─ actions/
│  │   ├─ auth-actions.ts      # signIn, signUp, signOut (server functions)
│  │   ├─ user-actions.ts
│  │   └─ file-actions.ts
│  ├─ db/
│  │   └─ drizzle.ts
│  └─ services/
│      ├─ email-service.ts
│      └─ user-service.ts
│
├─ lib/
│  ├─ utils.ts
│  ├─ validators/
│  │   ├─ user-schema.ts
│  │   └─ upload-schema.ts
│  ├─ cookies.ts                # server/client cookie helpers
│  ├─ font-config.ts
│  └─ auth.ts                   # Better Auth (handler + config)
│
├─ styles/
│  └─ globals.css
│
├─ env.mjs
├─ middleware.ts
└─ next.config.mjs
