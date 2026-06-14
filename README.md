# Crucible

A tribunal for the decision you keep dodging.

Most "AI advisor" tools just argue with you and leave you exactly where you started. Crucible closes the loop: it interrogates your reasoning, then **forces a commitment** — one choice, one deadline, one first action — and seals it as a ruling you keep.

**Live:** https://crucible-duyobgopj-ansh7katarias-projects.vercel.app/

---

## What it does

1. You state the decision, the options, and which way you're leaning.
2. The model names what you're avoiding, makes the strongest case against your lean, and asks the one question you haven't answered.
3. You pick one option, set a date, and name the first action. It stamps a sealed ruling.

## Stack

- **Front end:** single static `index.html` — no framework, no build step.
- **Back end:** one serverless function (`/api/crucible`) that holds the API key and calls the model. Keeps the key off the public page and avoids CORS.
- **Model:** Llama 3.3 70B via Groq (fast, free tier).
- **Hosting:** Vercel (free).

## Run it locally

You only need the function to run, so the simplest local path is the Vercel CLI:

```bash
npm i -g vercel
vercel dev        # serves index.html + /api/crucible together
```

Set your key first (see below).

## Deploy it free (about 10 minutes)

1. Get a free API key at **console.groq.com** → API Keys.
2. Push this folder to a new **public** GitHub repo.
3. Go to **vercel.com**, sign in with GitHub, click **Add New → Project**, and import the repo.
4. Before deploying, open **Environment Variables** and add:
   - Name: `GROQ_API_KEY`
   - Value: _your key_
5. Click **Deploy**. Vercel gives you a live URL. Paste it at the top of this README.

That's it — no card, no server to manage, no key exposed in the page.

## Why it exists

Built as a deliberate exercise in shipping the small, sharp version instead of the "complete" one. The whole point of the product is the whole point of building it: stop circling, commit, move.
