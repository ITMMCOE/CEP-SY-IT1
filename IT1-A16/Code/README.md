# Emergency Services PWA

Demo Emergency Services progressive web app — offline-first, maps, rule-based chatbot, profile and medical info stored locally.

Features
- One-tap calls for Ambulance (108), Fire (101), Police (100), Mechanic
- Share and fetch geolocation, map view with nearby services (OpenStreetMap + Leaflet)
- PWA install support (manifest + service worker)
- Rule-based emergency chatbot with first-aid guidance
- Profile and medical info (localStorage), contacts and document metadata
- Dark/light theme and mobile-first responsive UI

# Emergency Services — Progressive Web App (PWA)

This repository contains a demo Emergency Services Progressive Web App. It demonstrates an offline-capable multi-page PWA with live location mapping, one-tap emergency actions, a rule-based first-aid chatbot, and local profile storage.

Key features
- One-tap emergency calls (Ambulance 108, Police 100, Fire 101) and quick actions
- Interactive map (Leaflet + OpenStreetMap) with live user location and nearby services
- Rule-based chatbot for first-aid guidance with intent matching
- PWA support: web manifest and service worker (development-friendly mode included)
- Local data persistence using localStorage (profiles, contacts, chat history)
- Mobile-first, responsive UI with light/dark theme toggle

Technology stack
- Frontend: HTML5, CSS3, JavaScript (ES6+), Leaflet.js, OpenStreetMap
- Backend: Node.js + Express (simple static server used for local development)
- PWA: Service Worker, Web Manifest, Geolocation API

Quick start (local)
1. Install dependencies

```powershell
npm install
```

2. Start the local server

```powershell
npm start
```

3. Open the app at

```
http://localhost:3000
```

Useful pages
- Home: `/`
- Map (live location): `/map.html`
- Chatbot (assistant): `/chat.html`
- Actions (one-tap): `/actions.html`
- Profile: `/profile.html`
- Debug pages: `/test-debug.html`, `/test-chat.html`

Development notes
- Service worker can cache assets and may serve stale files during development. To see fresh changes:
	- Open DevTools → Application → Service Workers → Unregister the SW, and clear site data.
	- Alternatively use hard refresh (Ctrl+F5) or an Incognito window.
- The project uses `localStorage` for all user data — no server-side persistence by design.

Troubleshooting
- If the map does not show your location: ensure the browser has Location Permissions and you're serving over `http://localhost` or `https`.
- If chatbot appears unresponsive: open DevTools Console to view debug logs prefixed with `[Chatbot]`.
- If server fails to start, ensure required npm modules are installed (`npm install`). Start manually with `node simple-server.js` and check console for errors.

Contribution
- This is a demo project. Contributions, bug reports and PRs are welcome — please open an issue or PR on the repository.

License
- MIT

Contact
- For questions, include repo link and the specific page/feature you are testing.
