# Shree Mahavir Fincorp

A single Next.js App Router application serves the public homepage, the admin CMS and the backend. The public site renders a cached MongoDB publication. Administrators edit a draft, preview it privately, and publish a consistent snapshot.

## Local development

Use Node.js 22 or later.

```powershell
npm ci
npm run dev
```

Open [the homepage](http://localhost:3000). Without MongoDB, or before a configured database has been seeded, the public routes render bundled content. The production fallback is excluded from indexing. Enquiry storage, sign-in, draft editing and publishing require MongoDB.

## Configure services

Copy `.env.example` to `.env.local`.

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string with a database name and a user with read/write access to that database. CMS publishing uses transactions, so a local database also needs a replica set. |
| `AUTH_SECRET` | A unique secret for this environment. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. |
| `AUTH_URL` | The application's exact origin, such as `http://localhost:3000` for local development. |
| `NEXT_PUBLIC_SITE_URL` | The canonical website origin. The CMS can override it under General Settings. |
| `ADMIN_EMAIL` | Initial administrator email and default enquiry notification recipient. Change the notification recipient in Contact Management if needed. |
| `ADMIN_INITIAL_PASSWORD` | At least 14 characters, up to 72 UTF-8 bytes. Remove this variable after creating the account. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Server-side credentials for the Cloudinary image library. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | SMTP server, credentials and verified sender. Use 465 for implicit TLS or the provider's STARTTLS port. |

```powershell
npm run seed
npm run admin:create
npm run dev
```

Sign in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login). Seeding initializes a fresh database and leaves an existing CMS draft intact. Admin creation leaves an existing account's password intact.

## Editing and publishing

Use **Pages** and **Loan services** in the left sidebar to search pages by title or URL and view their publication status. Open **Loan services → Manage loan cards** to edit the shared cards used by the homepage and Services. Publishing a new visible card creates an editable detail page when that URL has no page yet. Upload images in **Media library** and select them from an editor’s image picker. When Cloudinary is unconfigured, uploaded images are resized to WebP and stored in MongoDB. **Footer** edits the shared footer across public pages.


Open **Pages** to edit the homepage, **Our Loan Services** at `/services`, **Business Loan** at `/business-loan`, and **Contact Us** at `/contact`, or to create a new page. Additional pages support reusable sections, page SEO, private draft previews, and publish or unpublish controls. Shared navigation, footer, loan records, and enquiry options are managed in their existing modules. The Contact page has its own editable contact cards, form copy, consent text, and office map. Use a verified Google Maps embed URL in **Office location and map** when it is available. Edit the red call to action above the footer in **Homepage Management → Final CTA**. Its published settings apply across pages.


- Open **Homepage Management** to reorder sections, change visibility or enter each section editor. The sidebar links to individual modules.
- Use **Save draft** and then **Preview saved draft** to inspect changes. **Publish** promotes the current draft and refreshes the homepage cache.
- Upload JPEG, PNG and WebP images up to 4 MB under **Media Library**. Choose the replacement in the editor, then publish before removing a previously published image.
- Contact Management controls form text, additional enquiry options and SMTP recipient. The Enquiries module shows submission source, consent, email delivery status and internal notes, and exports the current filters as CSV.
- Use **SEO** to preview and publish search and social settings for the site, homepage, or a standalone page. Use **Site settings** for redirects and the public WhatsApp number. Enter the WhatsApp number with the country code, using digits only.
- Publish statistics after confirming their values. Publish testimonials after obtaining consent. Add relevant, approved YouTube videos before making them visible. Public article cards open inline because public article routes are outside this phase.

## Shared business contact details

Open **Contact details** or **Footer** and edit **Shared contact details**. Publishing from either editor updates the phone, email, office address, opening hours, and directions on the homepage, Contact page, and footer.

## Deploy to Vercel

1. Create the Atlas database and configure network access for the deployment. Seed the production database and create the initial administrator from a trusted local terminal using production environment values.
2. Import the repository into Vercel with the Next.js preset. Set the production environment variables there. Keep `ADMIN_INITIAL_PASSWORD` only in the environment used by the one-time creation command.
3. Ensure `AUTH_URL` matches the deployed origin and set `NEXT_PUBLIC_SITE_URL` to the canonical domain. Use separate database, secret and origin values for preview environments if those should support the full CMS.
4. Deploy the latest commit after setting the production environment variables. Verify the homepage, sign-in, `/sitemap.xml`, `/robots.txt`, enquiry storage and email delivery on the deployed domain.

[Next.js installation and runtime](https://nextjs.org/docs/app/getting-started/installation) · [Auth.js credentials provider](https://authjs.dev/getting-started/authentication/credentials)

### Admin login on Vercel

Set `MONGODB_URI`, `AUTH_SECRET`, `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` for the **Production** environment and redeploy. Use a reachable MongoDB Atlas database. For the deployed domain, both URL values should be HTTPS origins with no page path. Generate a separate random production secret using the command above.

To populate the CMS and create an administrator, run `npm run seed` and `npm run admin:create` from a trusted terminal with the same Atlas `MONGODB_URI`. Supply `ADMIN_EMAIL` and a password of at least 14 characters in that terminal for administrator creation. The password is hashed in MongoDB, and the creation command leaves an existing administrator unchanged.

## Project structure

```text
src/app/          Homepage, admin pages, route handlers and technical SEO
src/components/   Public sections, form interactions and admin editors
src/lib/          CMS schemas, MongoDB models, publication and service code
scripts/          Database seed and initial administrator creation
public/images/    Replaceable logo and reference-style stock photography
output/playwright/  Browser screenshots
```

## Verification

```powershell
npm run typecheck
npm run lint
npm run build
npm audit --omit=dev
```

The supplied screenshots are the layout reference. The default wordmark and stock hero, office and article photographs are replaceable assets. The draft preview displays placeholders for unavailable media and business contact details. Supply company-approved imagery, contact information, legal links and social profiles before launch.
