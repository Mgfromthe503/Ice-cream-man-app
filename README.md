# The Ice Cream Man

> **A mobile application that connects customers with nearby ice cream truck drivers.**

The Ice Cream Man provides a customer experience for requesting and tracking a nearby truck, together with a driver experience for receiving requests, navigating to customers, and reviewing daily activity. The repository contains the Expo/React Native app, Express and tRPC API, database schema, Android release configuration, and store-compliance materials.

## Documentation

Start with the guide that matches the task at hand. The [documentation index](docs/README.md) is the canonical navigation page for repository documentation.

| Audience or task | Recommended document |
|---|---|
| Run the project locally | [Development guide](docs/development.md) |
| Contribute a change | [Contributing guide](CONTRIBUTING.md) |
| Build or publish the Android app | [Android and Google Play release runbook](docs/release/android-google-play.md) |
| Configure Google Play before a release | [Google Play setup reference](docs/release/google-play-setup.md) |
| Diagnose an Android/EAS build failure | [Android and EAS troubleshooting](docs/troubleshooting/android-eas-builds.md) |
| Understand the backend and API | [Backend reference](server/README.md) |
| Review product and interface direction | [Product design reference](docs/design/product-design.md) |
| Review privacy, terms, and store materials | [Legal and store documentation](#legal-and-store-materials) |

## Product capabilities

| Customers | Drivers |
|---|---|
| Request a nearby truck and view its approach on a map. | Receive nearby customer requests and open navigation. |
| Review request history and rate completed service. | Review daily reports, earnings, mileage, and fuel-cost inputs. |
| Receive proximity messaging and a configurable ice-cream-truck jingle. | Complete one-time registration through Google Play Billing. |

## Architecture at a glance

| Layer | Primary technology |
|---|---|
| Mobile and web client | Expo, React Native, Expo Router, and TypeScript |
| Styling and interaction | NativeWind, React Native Reanimated, and Expo modules |
| API | Express and tRPC |
| Data | Drizzle ORM with a MySQL-compatible database |
| Native commerce | `expo-iap` and Google Play Billing |
| Quality checks | TypeScript, ESLint, Prettier, and Vitest |
| Android delivery | EAS Build, EAS Submit, and GitHub Actions |

## Local development

The project is a pnpm workspace. Use Node.js **22** and pnpm **9.12.0** to align with the checked-in EAS configuration.

```bash
git clone https://github.com/Mgfromthe503/Ice-cream-man-app.git
cd Ice-cream-man-app
pnpm install
pnpm dev
```

`pnpm dev` runs the API in watch mode and starts the Expo development server. Use Expo Go where its native-module support is sufficient; use a development build for native capabilities such as Google Play Billing.

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the API and Expo development server together. |
| `pnpm dev:server` | Run only the API in watch mode. |
| `pnpm dev:metro` | Run only the Expo development server. |
| `pnpm check` | Run the TypeScript type check. |
| `pnpm lint` | Run the Expo ESLint configuration. |
| `pnpm format` | Format repository files with Prettier. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm build` | Bundle the production API server into `dist/`. |
| `pnpm start` | Run the bundled production API server. |
| `pnpm db:push` | Generate and apply Drizzle migrations; requires `DATABASE_URL`. |
| `pnpm verify:deps` | Verify dependency override and lockfile safeguards. |

For environment variables, database changes, backend architecture, and API conventions, see the [backend reference](server/README.md).

## Configuration sources of truth

Keep configuration changes in the responsible file rather than duplicating values across documents.

| Concern | Authoritative location |
|---|---|
| App name, package identifier, Expo owner, slug, and deep-link scheme | [`config/app-identity.js`](config/app-identity.js) |
| Expo configuration, native plugins, permissions, and app version | [`app.config.ts`](app.config.ts) |
| EAS build and submission profiles | [`eas.json`](eas.json) |
| Package scripts, dependencies, and pnpm version | [`package.json`](package.json) |
| Database schema and migrations | [`drizzle/schema.ts`](drizzle/schema.ts) and [`drizzle/`](drizzle/) |
| CI and manual EAS workflow behavior | [`.github/workflows/`](.github/workflows/) |

## Project layout

```text
app/                 Expo Router routes for customer and driver experiences
components/          Reusable UI and product-specific components
config/              Canonical application identity configuration
constants/           Shared client configuration and theme constants
docs/                Task-oriented project, release, troubleshooting, and design guides
drizzle/             Database schema and migrations
legal/               Privacy, terms, Play listing, and reviewer materials
lib/                 Client services, contexts, and application utilities
server/              Express, tRPC, database, and authentication implementation
shared/              Cross-boundary types and errors
tests/               Vitest test suite
```

## Android release and automation

Android release profiles and submission settings live in [`eas.json`](eas.json). Pull requests and pushes to `main` run validation; Android builds and optional Play submissions are initiated manually through the **EAS Build and Submit** GitHub Actions workflow. Follow the [Android and Google Play release runbook](docs/release/android-google-play.md) before creating a production build.

Store access tokens, Android keystores, and service-account JSON must never be committed. Configure the required values through the relevant service and repository secret settings instead.

## Legal and store materials

| Document | Purpose |
|---|---|
| [Privacy Policy](legal/PRIVACY_POLICY.md) | End-user privacy practices and disclosures. |
| [Terms of Service](legal/TERMS_OF_SERVICE.md) | Terms governing use of the application. |
| [Play Console Compliance](legal/GOOGLE_PLAY_COMPLIANCE.md) | Consolidated, canonical reference for Play submission and resubmission. |
| [Content Declarations & Resubmission](legal/PLAY_CONSOLE_CONTENT_DECLARATIONS.md) | Exact Play Console declarations to set for the organization-account rejection and how to resubmit. |
| [Google Play Data Safety](legal/DATA_SAFETY.md) | Play Console data-safety entry reference. |
| [Google Play Listing](legal/GOOGLE_PLAY_LISTING.md) | Store-listing content and release-note material. |
| [Google Play App Access](legal/GOOGLE_PLAY_APP_ACCESS.md) | Reviewer access and test-flow instructions. |
| [Child Safety & Parent Guidance](legal/CHILD_SAFETY_AND_PARENT_GUIDANCE.md) | Parent-aware safety behavior and Families/target-audience guidance. |

Security reporting and the dependency-vulnerability assessment live in [SECURITY.md](SECURITY.md).

## License

This project is proprietary. All rights reserved.
