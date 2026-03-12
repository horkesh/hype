# Home And Work Transition Checklist

This guide is the practical path off Natively for Hype.

The goal is:
- use the home machine for real development, Git, Expo, and builds
- use the work computer for browser preview, planning, docs, and light review
- keep one repo and one workflow across both machines

## Target setup

Use this split:

- Home machine
  - Git
  - Node.js LTS
  - npm
  - Expo local development
  - Expo Go for phone testing
  - EAS for installable mobile builds
  - optional Android Studio or Xcode
- Work computer
  - browser access to deployed web preview
  - same repo for reading and editing
  - no dependency on local Node or Git

## What replaces Natively

Natively is currently serving as:
- a preview environment
- a quick runtime for testing

The replacement stack is:
- Expo local dev for source-based preview
- EAS for real device builds
- Vercel for browser previews accessible from the work computer

Use these roles:
- Expo: local development and debugging
- Expo Go: quick device preview
- EAS: installable mobile builds
- Vercel: web preview and branch preview links

Vercel is useful, but it should not be the main mobile build path.

## Phase 1: Home machine setup

From the repo root:

```powershell
cd "C:\path\to\Hype app"
```

Install and verify:

```powershell
git --version
node --version
npm --version
```

If the repo has not been initialized with Git yet:

```powershell
git init
git add .
git commit -m "Initial local repo setup"
```

Current note:
- Git setup on the home machine is complete.
- The next practical checkpoints are `npm install`, `npx expo start`, and `npm run web`.
- On this Windows setup, use `npm.cmd` and `npx.cmd` from PowerShell if execution policy blocks `npm.ps1`.
- Current verified blocker: a fresh install fails on a React 19 vs `react-leaflet@4.2.1` peer dependency conflict under npm 11.
- Current verified runtime state: Metro and web preview can start on fixed ports, but the web app currently hits a Home-screen `Maximum update depth exceeded` loop.

Install dependencies:

```powershell
npm install
```

Run the app locally:

```powershell
npx expo start
```

Useful variants:

```powershell
npm run web
npm run android
npm run ios
```

Success criteria:
- the app opens locally from source
- Expo Go can load the project
- the web build starts without Natively

## Phase 2: Mobile development workflow

For regular development on the home machine:

```powershell
npx expo start
```

Use:
- Expo Go on your phone for quick testing
- Android emulator or iOS simulator for platform testing

When you need installable builds:

```powershell
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

And later:

```powershell
eas build --platform ios
```

Use EAS builds when:
- Expo Go is not enough
- you need a shareable installable app
- native behavior matters more than quick iteration

## Phase 3: Work computer preview path

To preview from the work computer without Natively, use Vercel web previews.

Recommended setup:
- connect the Git repo to Vercel from the home machine
- let each pushed branch create a preview deployment
- open the preview URL on the work computer browser

This is best for:
- reviewing UI changes
- checking navigation and layout
- validating copy and presentation
- sharing a preview link

This is not a full replacement for native testing. It does not perfectly represent:
- device APIs
- native gestures and platform differences
- mobile install/build behavior

## Phase 4: Vercel setup

Only do this after `npm run web` works locally.

On the home machine:

1. create or connect the Git remote
2. push the repo
3. import the repo into Vercel
4. let Vercel detect the app as a web project

Typical settings to verify:
- framework preset: Expo or Other if Expo is not auto-detected correctly
- build command: `npm run build:web`
- output directory: follow the repo's web export output if Vercel asks for it

If web export needs adjustment later, treat that as a small deployment task in this repo and document it in the ledger.

## Daily workflow

Use this rhythm:

1. Work machine
- read `docs/project_ledger.md`
- review docs and plan changes
- optionally edit code if needed

2. Home machine
- pull latest changes
- run Expo locally
- test with web and device preview
- commit and push

3. Vercel
- let preview deployment update from the pushed branch

4. Work machine
- open the preview URL
- review the result in browser

5. End of session
- update `docs/project_ledger.md`

## Preview strategy by need

Use this rule of thumb:

- Need quickest browser preview from work: Vercel
- Need fastest source-based app iteration: Expo local dev
- Need real phone behavior: Expo Go
- Need installable app build: EAS

## First-run checklist

Do these in order on the home machine:

1. verify Git, Node, and npm
2. run `npm install`
3. run `npx expo start`
4. run `npm run web`
5. test in Expo Go
6. commit and push the repo
7. connect the repo to Vercel
8. confirm the preview URL opens on the work computer
9. configure EAS
10. create the first Android preview build

## Suggested repo habits

- treat the home machine as the source-of-truth runtime environment
- treat the work computer as a secondary review and editing environment
- avoid making architecture decisions based only on Vercel web behavior
- keep `project_ledger.md` updated whenever the environment or workflow changes

## Next follow-up once this is live

After the home machine is working, add:
- environment variable documentation for Supabase and any weather/API keys
- Vercel deployment notes if web export needs special handling
- EAS build profile notes if preview and production builds diverge
