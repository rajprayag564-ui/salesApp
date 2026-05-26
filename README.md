FMCG Sales CRM is a [Next.js](https://nextjs.org) app for the admin dashboard.

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

This repository is ready for Vercel deployment as the main Next.js app at the repo root.

Before deploying, set these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Deployment steps:

1. Push the repo to GitHub.
2. Import the GitHub repo into Vercel.
3. Set the environment variables above in the Vercel project settings.
4. Keep the default build command `npm run build` and output handled by Next.js.
5. Deploy the `main` branch.

If you want the mobile app in `field-agent-app/` deployed separately, create a second Vercel project for that folder or keep it as a separate repo.
