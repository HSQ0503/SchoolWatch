# SchoolWatch

A customizable school dashboard with a live bell schedule countdown, events calendar, announcements, and productivity tools. Built with Next.js, designed to be forked and deployed by any school's coding club.

## What You Get

- **Live countdown timer** — shows the current period and time remaining, with a circular progress ring
- **Bell schedule viewer** — supports simple schedules, block schedules, and rotating days with lunch waves
- **School events calendar** — holidays, breaks, early dismissals, and custom events
- **Announcements** — admins can post announcements that show up on the dashboard
- **Productivity tools** — Pomodoro timer, to-do list, Wordle, and group randomizer
- **Dark mode** — automatic theme with manual toggle
- **Mobile-friendly** — works on phones, tablets, and desktops
- **Admin panel** — password + email code login for managing events and announcements

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

### 4. Set up MongoDB (free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a free cluster (M0 tier — no credit card needed)
3. Click **Database Access** → **Add New Database User** → set a username and password
4. Click **Network Access** → **Add IP Address** → choose **Allow Access from Anywhere**
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<password>` in the connection string with your actual password

### 5. Set up Resend (for admin login emails)

1. Go to [resend.com](https://resend.com) and create a free account
2. Add your domain and follow the DNS verification steps
3. Copy your API key from the Resend dashboard

### 6. Deploy to Vercel

<!-- TODO: Update this URL with your actual repo URL after publishing -->
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/SchoolWatch&env=DATABASE_URL,JWT_SECRET,ADMIN_EMAILS,RESEND_API_KEY)

Click the button above. Vercel will ask you for these environment variables:

| Variable | What to put |
|----------|-------------|
| `DATABASE_URL` | Your MongoDB connection string from step 4 |
| `JWT_SECRET` | Any random string (mash your keyboard for 32+ characters) |
| `ADMIN_EMAILS` | Email addresses that can access the admin panel (comma-separated) |
| `RESEND_API_KEY` | Your API key from step 5 |

Vercel will build and deploy your site. You'll get a URL like `your-project.vercel.app`.

### 7. Seed your events

After deploying, run this locally to load your calendar events into the database:

```bash
npm install
npx prisma db seed
```

This loads the events from your `school.config.ts` calendar into the database.

## Customization

### Changing your bell schedule

Edit the `schedule` section in `school.config.ts`. Every field has comments explaining what it does. The config validator will catch mistakes at build time and tell you exactly what's wrong.

### Toggling features

In the `features` section of `school.config.ts`, set any feature to `false` to hide it:

```typescript
features: {
  announcements: true,
  events: true,
  productivity: false,  // hides Pomodoro, Wordle, Todos, Randomizer
},
```

### Using the admin panel

1. Go to `yoursite.com/admin`
2. Log in with an email from your `ADMIN_EMAILS` list
3. You can create/edit/delete events and post announcements

### Custom domain

In Vercel: **Settings** → **Domains** → add your domain and follow the DNS instructions.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. See the file for detailed instructions.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Random string for signing auth tokens |
| `ADMIN_EMAILS` | Yes | Comma-separated admin email addresses |
| `RESEND_API_KEY` | Yes | API key from resend.com |
| `EMAIL_FROM` | No | Custom "from" address for login emails |

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [MongoDB](https://www.mongodb.com/) + [Prisma](https://www.prisma.io/)
- [Resend](https://resend.com/) — email for admin login codes
- [Vercel](https://vercel.com/) — hosting (free tier works)

## Project Structure

```
school.config.ts        <- THE FILE YOU EDIT (all school-specific config)
examples/               <- Example configs to copy from
app/                    <- Next.js pages and API routes
components/             <- React components
lib/                    <- Shared utilities and types
hooks/                  <- React hooks
prisma/                 <- Database schema and seed script
public/                 <- Static files (logo, images)
```

## Contributing

Pull requests welcome! If you add a feature, make sure it works with the config system so other schools can use it too.

## License

MIT
