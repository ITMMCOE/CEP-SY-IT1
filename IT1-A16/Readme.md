# 🚨 Emergency Services — PWA

A simple **Progressive Web App** built to demo emergency assistance features.
Works offline, supports quick emergency actions, maps, a basic rule-based chatbot, and local user data storage.

---

## Overview

This project shows how a PWA can help in emergency situations — even without internet.
It includes one-tap emergency calls, live location tracking with maps, and a small first-aid chatbot.

---

## Features

* One-tap calls: Ambulance (108), Police (100), Fire (101), Mechanic
* Live map using **Leaflet + OpenStreetMap**
* Basic rule-based chatbot for first-aid tips
* Offline support (Service Worker + Web Manifest)
* Local storage for profile, contacts, and medical info
* Responsive UI with light/dark mode

---

## Tech Stack

* **Frontend:** HTML, CSS, JS (ES6+), Leaflet.js
* **Backend (local):** Node.js + Express (static server)
* **PWA:** Service Worker, Web Manifest, Geolocation API
* **Storage:** localStorage (no backend DB)

---

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start local server

   ```bash
   npm start
   ```

3. Open in browser

   ```
   http://localhost:3000
   ```

---

## Pages

| Page    | Path                                  | Description                              |
| ------- | ------------------------------------- | ---------------------------------------- |
| Home    | `/`                                   | Main dashboard with quick actions        |
| Map     | `/map.html`                           | Shows current location + nearby services |
| Chatbot | `/chat.html`                          | Rule-based chatbot for basic help        |
| Actions | `/actions.html`                       | One-tap emergency actions                |
| Profile | `/profile.html`                       | Profile and medical info (local only)    |
| Debug   | `/test-debug.html`, `/test-chat.html` | Testing pages                            |

---

## Dev Notes

* The **service worker** caches files, so during development you might see old content.
  To fix: open DevTools → Application → Service Workers → *Unregister*, then hard refresh (Ctrl+F5) or use an Incognito window.

* Everything is stored locally using `localStorage` — nothing is uploaded anywhere.

---

## Troubleshooting

| Issue              | Cause                               | Fix                                          |
| ------------------ | ----------------------------------- | -------------------------------------------- |
| Map not loading    | Location blocked or insecure origin | Allow location + use `localhost` or `https`  |
| Chatbot stuck      | JS error                            | Check Console logs (`[Chatbot]` prefix)      |
| Server won’t start | Missing dependencies                | Run `npm install` or `node simple-server.js` |

---

## Contributing

This is a demo project meant for learning and experimentation.
PRs and issues are welcome!

Steps:

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a pull request

---

## License

MIT License.

---

## Contact

If you’re reporting a bug or testing, include:

* Repo link
* The page or feature you’re working on

---

## Possible Improvements

* Push notifications
* IndexedDB for offline data
* Voice-enabled chatbot
* Nearby service clustering
