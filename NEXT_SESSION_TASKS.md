# Next Session Tasks

You wanted a clean list to continue in a new VS Code session.

## Already done
- Admin site build passes (`npm run build`).
- Expo APK build passes.
- Expo dependency check passes.
- Git branches are separated:
  - `feature/admin-only` for admin/site changes.
  - `feature/offline-queue-archive-mobile` for mobile backup.

## Leftover tasks
1. Create GitHub Actions workflow to deploy the Next.js admin site to Vercel.
2. Create GitHub Actions workflow to build and publish the Expo app via EAS.
3. Open a PR for the deployment workflows.
4. Add repo secrets if you want full automation:
   - `VERCEL_TOKEN`
   - `EAS_TOKEN`

## Useful links / state
- Admin-only branch: `feature/admin-only`
- Mobile backup branch: `feature/offline-queue-archive-mobile`
- Admin PR URL to create: https://github.com/rajprayag564-ui/salesApp/pull/new/feature/admin-only
- Expo APK build link: https://expo.dev/accounts/dunamajhi/projects/field-agent-app/builds/a475ad10-222a-4399-9e5a-f7d95c22d9fb

## If you want to continue quickly
- Open this file first.
- Then ask Copilot to add the GitHub Actions workflows.
- After that, create the PR from `feature/admin-only` into `main`.
