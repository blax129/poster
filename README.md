# TenantFirst Management applicant portal

React + Vite frontend, Express API, and persistent SQLite storage. Requires Node 22.13+ (Node 24 LTS recommended).

## Run locally

```sh
npm install
npm run dev
```

Open the URL Vite prints. The manager API requires authentication. Set a strong `ADMIN_TOKEN` environment variable before starting the server to enable manager access. No default password is shipped. For example, generate a key using `openssl rand -hex 32`, then set it in your host's secret configuration. Restart the API after changing environment variables.

Validated applications are forwarded to Formspree at `https://formspree.io/f/mkjrwnyz` before they are saved to the portal. Set `FORMSPREE_ENDPOINT` on the server to override this endpoint. Configure Formspree notifications and recipient settings in your Formspree account.

## Static hosting

Build with `npm run build` and publish `dist/`. If `/api/applications` is absent (404/405 or an HTML page), the browser sends the application directly to `https://formspree.io/f/mkjrwnyz` and displays a delivery confirmation. Formspree must accept browser submissions from your deployed domain. Static-only hosting does not run SQLite, the manager API, or applicant status/trial endpoints; those require the Node server described below. Direct Formspree submissions are stored in Formspree, not the local portal database.

Network failures and server errors do not automatically resend to Formspree, avoiding duplicate deliveries when the original outcome is uncertain.

## Production

```sh
npm run build
ADMIN_TOKEN='your-secret-from-your-secret-manager' npm start
```

Serve this Node process behind an HTTPS reverse proxy pointing to `127.0.0.1:3001` (or the configured `PORT`). Configure `tenantfirstmgt.com` or an application subdomain on your chosen hosting provider. This project does not alter DNS or publish to that domain. The server binds to loopback; adapt that binding for container hosting if required.

Keep `data/portal.sqlite` and its WAL files on persistent storage and back them up. Do not place the database or `.env` files in public web directories or source control. Run a single application instance using this SQLite file. Manager access uses one shared secret; named user accounts and password recovery are not included.

## Included workflow

- Public role overview: $600/week, temporary, 13–15 listings every day including weekends, completed around the applicant’s schedule.
- Four application sections followed by review and submit. Payment preferences are handled during onboarding, not in the application.
- Application review remains required. Approved applicants start immediately, with no trial stage.
- The authenticated manager API can mark an applicant `Ready to start` directly. Historical trial records remain stored, but trial assignment/submission endpoints and applicant trial UI are removed. Existing application decisions are not automatically changed.
- Hiring contact: Katherine Riordan, text (815) 320-9596, katherineriordanppm@gmail.com.
- Main company website: https://tenantfirstmgt.com. General contact: tenantfirstmgt@gmail.com, (815) 320-9596. General and hiring contacts are labeled separately.
- Applicant-specific privacy notice at `/privacy.html`, describing actual Formspree delivery, optional portal storage, browser storage, and contact for data requests. No retention period or unverified office address is asserted.

## Remaining owner details

Confirm Facebook account requirements and any check-in expectations directly with applicants. Configure Formspree notifications and domain acceptance for the new domain. The new domain name and DNS setup remain pending.

## Validation

`npm run build` builds the React application. `npm test` checks application validation, delivery and failure handling, authorization, and immediate readiness after manager approval, using isolated temporary services. No test submissions are sent to production Formspree.
