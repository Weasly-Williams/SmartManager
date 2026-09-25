# Smart Manager

A task manager with AI assistance for people who struggle with attention, organization, and meeting goals.

## Project status

Initial environment setup. The starter screen checks the API and database connection; task management and AI features are planned, not implemented yet.

## Team

- Arsen Harutyunyan
- Jonathan Tischler
- Nicholas Immenschuh
- Ryan Garrido
- Wesley Williams

## Goals and planned features

Create an intuitive task manager, practice collaborative software development, and apply software engineering principles. Planned features include creating, editing, deleting, and organizing tasks, a weekly schedule, and AI assistance.

## Tech stack and folders

- **Mobile:** React Native 0.86, React 19.2, Expo SDK 57, TypeScript.
- **API:** Express 5, TypeScript, Node.js 24 LTS.
- **Database:** MySQL 8.4 LTS; `mysql2` connects the backend to MySQL.
- **Package manager:** npm workspaces with one root `package-lock.json`.

```text
frontend/            Expo mobile app; start editing App.tsx
backend/src/         Express API; entry point server.ts
backend/dist/        Compiled API (generated, ignored)
compose.yaml         Local MySQL service and persistent volume
.env.example         Docker database settings
backend/.env.example API/database settings
frontend/.env.example Public API address used by the phone
```

The phone calls Express over HTTP. Only Express connects to MySQL. Database credentials never belong in the frontend. This is a local development setup, not a production deployment.

## 1. Install software on your computer

1. Install **[Node.js 24 LTS](https://nodejs.org/en/download)** (24.14 or newer within version 24). npm is included. `.nvmrc` records the baseline version if you use a Node version manager. Restart your terminal after installation.
2. Install **[Git](https://git-scm.com/downloads)** to clone and collaborate on the repository.
3. Recommended database option: install **[Docker Desktop](https://docs.docker.com/desktop/)** on Windows/macOS, or Docker Engine plus the Compose plugin on Linux. On Windows, follow Docker's WSL 2/virtualization requirements and use Linux containers. Start Docker Desktop and wait until its engine is ready. Docker downloads and installs MySQL through this project's Compose file; a separate MySQL server is unnecessary.
4. Alternative: install **[MySQL Community Server 8.4](https://dev.mysql.com/downloads/mysql/8.4.html)** directly; see the native database instructions below. MySQL Workbench is an optional database GUI, not a replacement for the server.
5. An editor such as VS Code is optional.

Verify in a new terminal:

```sh
node --version
npm --version
git --version
docker --version
docker compose version
docker info
```

Skip Docker commands if using native MySQL. React, React Native, Expo, Express, TypeScript, and `mysql2` are installed locally by npm in step 3. Do not install the old global `expo-cli` or `react-native-cli`.

## 2. Choose a device

| Device | Install / setup | How to launch | API address in frontend/.env |
| --- | --- | --- | --- |
| Physical Android phone | Install **Expo Go** from Google Play; use the same Wi-Fi as the computer | Run `npm run dev:frontend`, then scan the QR code using Expo Go | `http://YOUR_COMPUTER_LAN_IP:3000` |
| Physical iPhone/iPad | Install **Expo Go** from the App Store; use the same Wi-Fi as the computer | Run `npm run dev:frontend`, scan the QR with Camera, and open in Expo Go | `http://YOUR_COMPUTER_LAN_IP:3000` |
| Android emulator (Windows/macOS/Linux) | Install [Android Studio](https://docs.expo.dev/workflow/android-studio-emulator/), its SDK/platform tools and an emulator system image; create and start a virtual device in Device Manager | Run `npm run android` or press `a` in the Expo terminal | `http://10.0.2.2:3000` |
| iOS Simulator (macOS only) | Install [Xcode and an iOS Simulator runtime](https://docs.expo.dev/workflow/ios-simulator/), launch Xcode once and finish its setup | Run `npm run ios` or press `i` in the Expo terminal | `http://localhost:3000` |

A physical phone with Expo Go is the easiest starting option and does not need Android Studio or Xcode. Windows/Linux cannot run Apple's iOS Simulator; use a physical iPhone or Android instead. Expo Go must support this project's SDK 57. If it reports a version mismatch, use the device-specific instructions at [Expo Go downloads](https://expo.dev/go) and [Expo's mismatch guide](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/). Availability varies by device and SDK; do not independently upgrade React Native to fix it. Custom native libraries may later require a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

## 3. Clone and install project packages

In your chosen parent directory (replace the placeholder with this repository's Git URL):

```sh
git clone <REPOSITORY_URL>
cd Smart_Manager
npm ci
```

If you already have this repository open, run `npm ci` from its root. It installs both workspaces using the committed lockfile. Use `npm install` when deliberately changing dependency declarations; use `npm ci` for reproducible setup after cloning or pulling lockfile changes. Do not rerun `create-expo-app` inside this repository.

## 4. Create local environment files

Run once from the repository root, without overwriting existing local settings.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

**macOS/Linux:**

```sh
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

- Root `.env` controls Docker's database/user/password/host port. The example passwords are for local development; change them together with the backend settings.
- `backend/.env`: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_PORT` must match the database. The backend runs on port 3000 and binds to `0.0.0.0` so a phone can connect. `DB_HOST=127.0.0.1` is correct because the backend runs on your computer.
- `frontend/.env`: set `EXPO_PUBLIC_API_URL` using the device table. For example, `EXPO_PUBLIC_API_URL=http://192.168.1.42:3000`. No `/api` suffix is needed. Find your active Wi-Fi IPv4 address with `ipconfig` on Windows, network settings on any OS, or `ip addr` on Linux. `localhost` on a physical phone means the phone itself.
- `EXPO_PUBLIC_*` values are visible in the app bundle. Never store passwords or API secrets there. Local `.env` files are ignored by Git.
- Restart the backend or Expo after changing its environment file.

## 5. Start MySQL (choose one option)

### Option A: Docker (recommended)

Start Docker Desktop, then run from the repository root:

```sh
npm run db:up
docker compose ps
```

The first run downloads MySQL 8.4, creates the `smart_manager` database and application user, and waits for a successful SQL health check. MySQL is exposed only on your computer's loopback interface, port 3306. Its data survives container restarts in the `mysql_data` volume. No application tables exist yet because the task model has not been defined.

Open a SQL prompt (enter `MYSQL_PASSWORD` from root `.env`):

```sh
docker compose exec mysql mysql -u smart_manager -p smart_manager
```

Then try `SELECT 1;`, `SHOW TABLES;`, and `exit`.

### Option B: Native MySQL (no Docker)

Install and start the MySQL 8.4 server using its installer/service manager. Add its `bin` folder to PATH if the `mysql` command is not found. Connect as the administrator:

```sh
mysql -u root -p
```

Run the following SQL once, choosing your own password:

```sql
CREATE DATABASE smart_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'smart_manager'@'localhost' IDENTIFIED BY 'replace_with_your_local_password';
GRANT ALL PRIVILEGES ON smart_manager.* TO 'smart_manager'@'localhost';
EXIT;
```

Put that password in `backend/.env`, with `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=smart_manager`, and `DB_USER=smart_manager`. Do not run the Docker database at the same time on the same port. Root `.env` and `npm run db:*` commands apply only to Docker.

## 6. Start the backend and mobile app

Keep two terminals open, both starting in the repository root.

**Terminal 1 — backend with automatic reload:**

```sh
npm run dev:backend
```

**Terminal 2 — Expo:**

```sh
npm run dev:frontend
```

Scan the QR code on your phone, or press `a` / `i` for your configured emulator/simulator. Press `r` to reload. Press **Check connection** in the starter app; success says **API and MySQL are connected.** Keep both terminals running while developing. Use `Ctrl+C` in each terminal to stop it.

Check the backend separately in a browser:

- API: [http://localhost:3000/api/health](http://localhost:3000/api/health) — HTTP 200 while Express is running.
- Database: [http://localhost:3000/api/health/db](http://localhost:3000/api/health/db) — HTTP 200 when SQL succeeds; HTTP 503 when MySQL is unavailable.

Terminal checks (PowerShell):

```powershell
Invoke-RestMethod http://localhost:3000/api/health
Invoke-RestMethod http://localhost:3000/api/health/db
```

Terminal checks (macOS/Linux):

```sh
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/db
```

## Primary command reference

Run these from the repository root unless a folder change is shown.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install all locked frontend/backend dependencies |
| `npm run db:up` | Download/start MySQL and wait until ready |
| `docker compose ps` | Show database status |
| `npm run db:logs` | Follow MySQL logs; Ctrl+C stops following |
| `npm run db:down` | Stop/remove database container, retaining saved data |
| `npm run dev:backend` | Run Express in TypeScript with automatic reload |
| `npm run dev:frontend` | Start Expo and display its QR code |
| `npm run android` | Open Expo on an Android emulator/device |
| `npm run ios` | Open Expo in the iOS Simulator (Mac only) |
| `npm run dev:frontend -- --clear` | Restart Expo with a cleared Metro cache |
| `npm run typecheck` | Check TypeScript in both projects |
| `npm run lint` | Lint the mobile app |
| `npm run build:backend` | Compile backend TypeScript into backend/dist |
| `npm run start:backend` | Run the compiled API after building |
| `git status` | Review local changes |
| `git switch -c feature/your-feature` | Create a feature branch |

Package maintenance examples (already installed; do not repeat for normal setup):

```sh
# Backend runtime libraries
npm install express cors dotenv mysql2 --workspace backend
# Backend development tools
npm install --save-dev typescript tsx @types/node @types/express @types/cors --workspace backend
# Frontend packages must use Expo's compatibility-aware installer
cd frontend
npx expo install <package-name>
npx expo install --check
npx expo-doctor
cd ..
```

Commit root `package-lock.json` when dependencies change. No global Express, TypeScript, or React Native installation is required.

## Troubleshooting

- **Docker daemon/pipe unavailable:** launch Docker Desktop, wait for the engine, verify `docker info`, and retry `npm run db:up`. On Windows check WSL 2 and Linux-container mode.
- **Port 3306 already used:** stop the other MySQL service or set root `MYSQL_PORT=3307` and backend `DB_PORT=3307`; rerun `npm run db:up` and restart the API.
- **API port already used:** set backend `PORT` to a free port and update the frontend URL to match.
- **Phone cannot reach API:** verify the LAN IP and same Wi-Fi, allow Node on your trusted private network in the firewall, and try opening `http://YOUR_COMPUTER_LAN_IP:3000/api/health` in the phone browser. Guest/campus Wi-Fi may block communication between devices; use a private hotspot or an emulator. An Expo tunnel carries the development bundle, not your Express API.
- **MySQL access denied:** match root and backend credentials. Docker initializes users/passwords only on the first start with an empty volume. Editing `.env` does not change existing users; update them through SQL using administrator access. Avoid deleting the volume unless you intend to erase all local database data.
- **Database health is 503:** inspect the backend terminal and `npm run db:logs`; confirm MySQL is ready and the selected database/user exists.
- **PowerShell blocks npm.ps1:** use `npm.cmd` and `npx.cmd` for the same commands, or use Command Prompt.
- **Expo dependency mismatch:** from `frontend`, run `npx expo install --check` and `npx expo-doctor`; use `npx expo install --fix` if compatibility changes are needed and review the resulting lockfile.

## Initial setup verification notes

Node/npm dependencies are installed and local `.env` files have been created on the setup computer. New clones must still follow the steps above. TypeScript checks, frontend lint, the backend build, Android/iOS bundle exports, and all 21 Expo Doctor checks passed. The API health endpoint returns 200 and the database endpoint returns 503 when MySQL is offline.

MySQL startup on the setup computer is currently blocked by an existing Docker Desktop startup error: its Inference manager cannot access the `dockerInference` socket. The Compose configuration is provided, but the MySQL image/container could not be installed or started while Docker's engine is unavailable. Resolve Docker Desktop startup (see [Docker troubleshooting](https://docs.docker.com/desktop/troubleshoot/overview/)) and rerun `npm run db:up`, or use the native MySQL option above. A successful database connection and a physical-device run remain to be verified.

The initial npm audit reports 10 moderate findings in Expo's transitive `xcode` / `uuid` tooling chain. Its proposed forced remediation downgrades Expo to SDK 46; do not apply `npm audit fix --force` blindly. Recheck with `npm audit` when upgrading Expo.

## Branch strategy

The main branch holds stable work; avoid direct commits to main. Create feature branches, collaborate on the same branch when working on the same feature, and review and test changes before merging. Delete merged feature branches when no longer needed.

## Official references

- [Expo project setup](https://docs.expo.dev/get-started/create-a-project/) and [SDK 57 compatibility](https://docs.expo.dev/versions/v57.0.0/)
- [Expo device setup](https://docs.expo.dev/get-started/set-up-your-environment/)
- [Express installation](https://expressjs.com/en/starter/installing/)
- [Official MySQL Docker image](https://hub.docker.com/_/mysql)

Update this README as application features, database tables, and deployment requirements are added.
