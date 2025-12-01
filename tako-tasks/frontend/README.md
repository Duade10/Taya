# Tako Tasks Frontend

Next.js 13 (pages router) dashboard with Tailwind CSS and TypeScript enabled for shadcn-style UI components.

## Component & style locations
- UI components live under [`components/ui`](components/ui). This mirrors the default output path used by the shadcn/ui CLI so new generated components can be dropped in without reconfiguration.
- Shared styles live in [`styles/globals.css`](styles/globals.css) and are picked up by Tailwind (configured with `darkMode: "class"`).

## Adding shadcn/ui
Run the shadcn initializer from the `frontend` folder to pull components into `components/ui`:
```bash
npx shadcn@latest init
# when prompted, set the components directory to ./components/ui
```
Then generate components as needed (for example):
```bash
npx shadcn@latest add button
```

## TypeScript & Tailwind
- TypeScript is configured via [`tsconfig.json`](tsconfig.json) with the `@/*` alias pointing to the project root and `allowJs` enabled for existing JavaScript pages.
- Tailwind is already installed and configured via [`tailwind.config.js`](tailwind.config.js) and [`postcss.config.js`](postcss.config.js). Utilities are imported through [`styles/globals.css`](styles/globals.css).

## Development
Install dependencies and start the dev server:
```bash
npm install
npm run dev
```
The demo page for the collapsible dashboard sidebar is available at `/demo`.
