# DelphAI — Setup & Deployment Guide

A philosophical thinking partner. Think deeper. See further.

---

## What you need before you start

- A computer (Mac or Windows)
- An Anthropic API key — sign up free at https://console.anthropic.com and add a small credit ($5 is plenty to start)
- A free GitHub account — https://github.com
- A free Vercel account — https://vercel.com

---

## PART 1 — Run DelphAI on your own computer

### Step 1 — Install Node.js
Go to https://nodejs.org and download the LTS version. Run the installer. This is the engine that runs the app locally.

After installing Node.js, enable pnpm in your terminal:
```
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

### Step 2 — Install Cursor
Go to https://cursor.com and download Cursor for your operating system. Install it. This is where you will manage and edit the project.

### Step 3 — Open the project in Cursor
- Unzip the delphai folder you downloaded
- Open Cursor
- Go to File → Open Folder
- Select the delphai folder

### Step 4 — Open the terminal inside Cursor
- Go to View → Terminal
- A terminal panel will appear at the bottom of the screen

### Step 5 — Install the project dependencies
In the terminal, type exactly:
```
pnpm install
```
Then press Enter. Wait for it to finish (takes about a minute).

### Step 6 — Add your API key
- In the file list on the left, find the file called .env.local and open it
- Replace the text that says: your_api_key_here
- With your actual API key from https://console.anthropic.com
- Save the file (Cmd+S on Mac, Ctrl+S on Windows)

### Step 7 — Start the app
In the terminal, type:
```
pnpm dev
```
Then press Enter. Open your browser and go to:
```
http://localhost:3000
```
DelphAI is now running on your computer. You will see the age gate, then the full chat interface.

To stop it, press Ctrl+C in the terminal.

### Step 8 — Build the app locally
Before publishing, you can check that the production build works:
```
pnpm build
```

To run the production build locally after that:
```
pnpm start
```

---

## PART 2 — Publish DelphAI to the web (free, permanent URL)

### Step 9 — Create a GitHub repository
- Go to https://github.com and sign in
- Click the + button in the top right → New repository
- Name it: delphai
- Leave everything else as default
- Click Create repository
- Copy the URL it shows you, which looks like: https://github.com/YOURNAME/delphai.git

### Step 10 — Push your code to GitHub
In Cursor's terminal, run these commands one at a time. Replace the URL with yours from Step 9:
```
git init
git add .
git commit -m "Initial DelphAI"
git branch -M main
git remote add origin https://github.com/YOURNAME/delphai.git
git push -u origin main
```
If it asks for a username and password, use your GitHub credentials.

### Step 11 — Deploy on Vercel
- Go to https://vercel.com and sign in (you can sign in with your GitHub account)
- Click Add New → Project
- Click Import next to your delphai repository
- Before clicking Deploy, click on Environment Variables
- Add a new variable:
  - Name: ANTHROPIC_API_KEY
  - Value: your API key from console.anthropic.com
- Click Deploy

Vercel will detect `pnpm-lock.yaml` and install dependencies with pnpm. Wait about 2 minutes. Vercel will give you a live URL like:
```
https://delphai.vercel.app
```
Share that link with anyone — it works on any device, any browser, no download needed.

---

## PART 3 — Making changes later

Whenever you want to change something (text, colours, the AI behaviour):
1. Make your edits in Cursor
2. In the terminal, run:
```
git add .
git commit -m "describe what you changed"
git push
```
Vercel will automatically re-deploy within 1–2 minutes. Your live URL stays the same.

---

## File map — what each file does

```
delphai/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       <- connects securely to Claude API (key lives server-side)
│   ├── layout.tsx              <- fonts, page title, global setup
│   ├── page.tsx                <- the full chat interface (age gate, suggestions, messages)
│   ├── page.module.css         <- all visual styling
│   └── globals.css             <- colour variables and base theme
├── .env.local                  <- your API key (never shared, never on GitHub)
├── .gitignore                  <- tells GitHub to ignore your API key file
├── next.config.js              <- Next.js configuration
└── package.json                <- project dependencies
```

---

## Costs

| Item | Cost |
|---|---|
| Cursor | Free to start |
| GitHub | Free |
| Vercel hosting | Free |
| Anthropic API | ~$2-5/month for personal use |
| Google Play Store (optional, future) | $25 one-time |
| Apple App Store (optional, future) | $99/year |

---

## If something goes wrong

- pnpm install fails: make sure Node.js is installed correctly (Step 1)
- pnpm build fails: read the error in the terminal and fix the file it names
- App shows an error: check your API key in .env.local is correct with no extra spaces
- Vercel deployment fails: make sure ANTHROPIC_API_KEY is set in Vercel environment variables
- Anything else: open Cursor's AI chat (the sidebar) and paste the error — it will help you fix it
