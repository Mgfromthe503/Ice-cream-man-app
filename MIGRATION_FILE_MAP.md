Migration file map — prepare for moving this repository into a monorepo under `app/`

Summary
- This repo was reorganized so all runtime/build files live under `app/`.
- After merge, copy the `app/` folder from this repo into the monorepo root as `app/`.

File map (source -> destination in monorepo)
- package.json                     -> app/package.json
- pnpm-lock.yaml                   -> app/pnpm-lock.yaml
- tsconfig.json                    -> app/tsconfig.json
- app/                             -> app/app/   (Expo Router routes)
- components/                      -> app/components/
- assets/                          -> app/assets/
- constants/                       -> app/constants/
- hooks/                           -> app/hooks/
- lib/                             -> app/lib/
- server/                          -> app/server/
- shared/                          -> app/shared/
- scripts/                         -> app/scripts/
- drizzle/ + drizzle.config.ts     -> app/drizzle/ + app/drizzle.config.ts
- metro.config.js, babel.config.js -> app/metro.config.js, app/babel.config.js
- tailwind.config.js, nativewind-env.d.ts, global.css -> app/
- tests/, references/, template.json -> app/

Notes & patches
- Path aliases in tsconfig ("@/*" and "@shared/*") were kept relative. Because package.json and tsconfig.json are moved into `app/`, alias resolution inside `app/` remains unchanged.
- CI/workflow files in the monorepo should run commands in the `app/` working directory. Example: `pnpm --filter ./app...` or set working-directory: app
- Scripts that previously assumed repo root now live in app/ and reference relative paths (e.g. `server/_core/index.ts`). No string changes to scripts were needed beyond moving files.

Post-merge checklist for monorepo coordinator
1. Copy `app/` into monorepo root.
2. Add app to root pnpm/workspaces if you use pnpm: add `packages/app` or ensure `app` is included in workspaces.
3. Ensure CI runs `pnpm install` at monorepo root and then runs commands in `app/` (use `working-directory: app` or `pnpm --filter app...`).
4. Verify Metro/Expo dev server uses `EXPO_USE_METRO_WORKSPACE_ROOT=1` if running from monorepo root; otherwise run metro with working directory set to app/.
5. Run `pnpm install` inside `app/` and `pnpm dev` to verify dev flow.

If anything fails, see the PR description for more details and contact the repository owner.
