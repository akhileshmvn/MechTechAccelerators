# Client setup

This client is built with Vite and needs to be served by a dev server or with the compiled build output. Opening `index.html` directly from the filesystem (e.g., `file:///.../client/index.html`) will not load the React app because the TypeScript entry file isn't bundled.

## Run in development
```bash
npm install
npm run dev:client
```
Then open the URL printed by Vite (defaults to `http://localhost:5000`).

## Build for static hosting
```bash
npm install
npm run build
```
The built files will be placed in `dist/public`. Serve that folder with any static server or open `dist/public/index.html` from disk if you only need the static build.
