# AI Register Explorer

An independent data visualization tool that makes the Government of Canada's [Artificial Intelligence Registry](https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b) more accessible, searchable, and insightful.

**Live site:** [ai-register-explorer.vercel.app](https://ai-register-explorer.vercel.app)

---

## About

This project is maintained by Scott Hazlitt, based in Manitoba, Canada. It is not affiliated with or endorsed by the Government of Canada.

Built as a personal exploration of AI-assisted coding tools — the code was developed collaboratively with AI (primarily Claude) rather than written by a traditional software developer.

## Features

- Search and filter AI systems by name, department, or vendor
- Charts showing distribution by department and decision type
- Expandable system detail cards
- Bilingual support (English / French)
- Dark mode and light mode
- A 90s retro mode (because why not)

## Data

Data is sourced from the Government of Canada's open data portal at [open.canada.ca](https://open.canada.ca) and is used under the [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada).

- No manual curation is applied — data is displayed as published
- Records are not enhanced or scored using AI/ML
- Updates depend on the upstream dataset being refreshed by the Government of Canada

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- Deployed on [Vercel](https://vercel.com/)

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contact

Questions or feedback: [scott.hazlitt@gmail.com](mailto:scott.hazlitt@gmail.com)
