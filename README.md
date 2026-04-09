# SchoolWatch

A customizable school dashboard with a live bell schedule countdown, events calendar, and productivity tools. Built with Next.js, designed to be forked and deployed by any school's coding club.

## What You Get

- **Live countdown timer** — shows the current period and time remaining, with a circular progress ring
- **Bell schedule viewer** — supports simple schedules, block schedules, and rotating days with lunch waves
- **School events calendar** — holidays, breaks, early dismissals, and custom events
- **Productivity tools** — Pomodoro timer, to-do list, Wordle, and group randomizer
- **Dark mode** — automatic theme with manual toggle
- **Mobile-friendly** — works on phones, tablets, and desktops

## Quick Start

### 1. Fork this repo

Click the **Fork** button at the top right of this page. This creates your own copy.

### 2. Edit `school.config.ts`

This is the **only file you need to change**. Open it and fill in:

- Your school's name, mascot, and colors
- Your bell schedule (period names and times)
- Your academic calendar (no-school dates, events)

Not sure where to start? Copy one of the examples from the `examples/` folder:

| Example | Best for |
|---------|----------|
| `examples/simple-school.config.ts` | Same schedule every day, no lunch waves |
| `examples/block-schedule.config.ts` | A/B block schedule with lunch waves |
| `examples/rotating-schedule.config.ts` | Rotating odd/even days (like Windermere Prep) |

### 3. Add your logo

Put your school's logo image in the `/public` folder and set the filename in `school.config.ts`:

```typescript
logoPath: "/your-logo.png",
```

### 4. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/HSQ0503/SchoolWatch)

Click the button above. Vercel will build and deploy your site — no environment variables needed. You'll get a URL like `your-project.vercel.app`.

## Customization

### Changing your bell schedule

Edit the `schedule` section in `school.config.ts`. Every field has comments explaining what it does. The config validator will catch mistakes at build time and tell you exactly what's wrong.

### Toggling features

In the `features` section of `school.config.ts`, set any feature to `false` to hide it:

```typescript
features: {
  events: true,
  productivity: false,  // hides Pomodoro, Wordle, Todos, Randomizer
},
```

### Custom domain

In Vercel: **Settings** → **Domains** → add your domain and follow the DNS instructions.

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vercel](https://vercel.com/) — hosting (free tier works)

## Project Structure

```
school.config.ts        <- THE FILE YOU EDIT (all school-specific config)
examples/               <- Example configs to copy from
app/                    <- Next.js pages and API routes
components/             <- React components
lib/                    <- Shared utilities and types
hooks/                  <- React hooks
public/                 <- Static files (logo, images)
```

## Contributing

Pull requests welcome! If you add a feature, make sure it works with the config system so other schools can use it too.

## License

MIT
