# Contributing to Hipmipreneur

First off — **thank you** for considering contributing to Hipmipreneur! This project exists to help Indonesian founders build startups grounded in research, not assumptions. Every contribution — code, documentation, bug reports, or ideas — moves that mission forward.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). In short: treat others the way you'd want to be treated.

---

## Getting Started

### Prerequisites

- **Node.js** v18.x or later
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/Hipmipreneur.git
cd Hipmipreneur

# Add the upstream remote to stay in sync:
git remote add upstream https://github.com/auputralt/Hipmipreneur.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

If `.env.example` doesn't exist yet, create `.env.local` with these required keys:

```env
# AI Provider (BluesMind primary, OpenRouter fallback)
BLUESMIND_API_KEY=your-bluesmind-key
OPENROUTER_API_KEY=your-openrouter-key

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret

# Payment (Midtrans) — needed for payment features
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_SERVER_KEY=your-midtrans-server-key
```

> **Note:** You don't need all keys to contribute. Most features only require the AI and database keys. Ask in an issue if you're unsure what you need.

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Workflow

### Branch Naming

Use descriptive branch names following these prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/add-onboarding-flow` |
| `fix/` | Bug fix | `fix/responsive-sidebar-crash` |
| `docs/` | Documentation | `docs/update-readme-stack` |
| `refactor/` | Code cleanup | `refactor/simplify-workspace-context` |
| `chore/` | Maintenance | `chore/update-dependencies` |
| `style/` | Formatting only | `style/fix-tailwind-indent` |

### Syncing with Upstream

Before starting work, pull the latest changes:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

Then create your branch from `main`:

```bash
git checkout -b feat/your-feature-name
```

---

## Coding Standards

### TypeScript

- Use **strict TypeScript** — avoid `any` when possible.
- Prefer `interface` for object shapes, `type` for unions and intersections.
- Add types to function parameters and return values.

### React & Next.js

- Use **functional components** with hooks.
- Follow the **App Router** conventions (this is Next.js 15+).
- Keep components small and focused — if a file exceeds ~200 lines, consider splitting it.
- colocate related components, utilities, and types in the same directory when they're tightly coupled.

### Tailwind CSS

- Use Tailwind utility classes for styling.
- Follow the existing design system tokens in `globals.css`.
- Avoid inline styles or arbitrary values when a standard utility exists.

### File & Naming Conventions

- **Files:** `PascalCase.tsx` for components, `camelCase.ts` for utilities/types.
- **Components:** Named exports (no default exports unless the file has a single component).
- **API routes:** Follow the existing pattern under `app/api/`.

---

## Commit Conventions

We follow a simplified [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description of the change>
```

**Types:**

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code restructuring (no behavior change) |
| `style` | Formatting, whitespace (no logic change) |
| `chore` | Maintenance, dependencies, config |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |

**Examples:**

```
feat: add AI-led interview scheduling page
fix: prevent sidebar collapse on mobile resize
docs: update environment variable table in README
refactor: extract workspace context into shared hook
```

Keep commits **atomic** — one logical change per commit. Write messages that explain **why**, not just **what**.

---

## Pull Request Process

1. **Update your branch** with the latest upstream changes before opening a PR:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Open a Pull Request** against the `main` branch from your fork.

3. **Fill out the PR description** with:
   - What the PR does
   - Why it's needed
   - How to test it
   - Any relevant issue numbers (e.g., `Fixes #12`)

4. **Respond to review feedback** promptly. Be open to suggestions — we're all building this together.

5. **Keep PRs small** when possible. Large PRs are harder to review. If a change is big, consider breaking it into smaller, sequential PRs.

---

## Reporting Bugs

Found something broken? Please [open an issue](https://github.com/auputralt/Hipmipreneur/issues/new) with:

- **Title:** A clear, concise description of the bug
- **Steps to reproduce:** What you did, what happened, what you expected
- **Environment:** Browser, OS, Node.js version
- **Screenshots:** If applicable — they help a lot

---

## Requesting Features

Have an idea to make Hipmipreneur better? We'd love to hear it! [Open an issue](https://github.com/auputralt/Hipmipreneur/issues/new) with:

- **Title:** A brief summary of the feature
- **Problem:** What problem does this solve? Who does it help?
- **Proposed solution:** Your idea (even a rough sketch is valuable)
- **Alternatives considered:** Any other approaches you thought about

We'll discuss, prioritize, and if it's a good fit — we'll figure out the best way to build it together.

---

## Questions?

If anything is unclear, don't hesitate to [open an issue](https://github.com/auputralt/Hipmipreneur/issues/new) tagged as a question. No question is too small.

Thank you for being part of Hipmipreneur! 🇮🇩🚀
