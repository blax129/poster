# TenantFirst Management applicant portal

React + Vite frontend, Express API, and persistent SQLite storage. Requires Node 22.13+ (Node 24 LTS recommended).

## Run locally

```sh
npm install
npm run dev
```

Open the URL Vite prints. The manager workspace is `/manager`. Set a strong `ADMIN_TOKEN` environment variable before starting the server to enable manager access. No default password is shipped. For example, generate a key using `openssl rand -hex 32`, then set it in your host's secret configuration. Restart the API after changing environment variables.

Validated applications are forwarded to Formspree at `https://formspree.io/f/mnjeolkq` before they are saved to the portal. Set `FORMSPREE_ENDPOINT` on the server to override this endpoint. Configure Formspree notifications and recipient settings in your Formspree account.

## Static hosting

Build with `npm run build` and publish `dist/`. If `/api/applications` is absent (404/405 or an HTML page), the browser sends the application directly to `https://formspree.io/f/mnjeolkq` and displays a delivery confirmation. Formspree must accept browser submissions from your deployed domain. Static-only hosting does not run SQLite, the manager API, or applicant status/trial endpoints; those require the Node server described below. Direct Formspree submissions are stored in Formspree, not the local portal database.

Network failures and server errors do not automatically resend to Formspree, avoiding duplicate deliveries when the original outcome is uncertain.

## Production

```sh
npm run build
ADMIN_TOKEN='your-secret-from-your-secret-manager' npm start
```

Serve this Node process behind an HTTPS reverse proxy pointing to `127.0.0.1:3001` (or the configured `PORT`). Configure `tenantfirstmgt.com` or an application subdomain on your chosen hosting provider. This project does not alter DNS or publish to that domain. The server binds to loopback; adapt that binding for container hosting if required.

Keep `data/portal.sqlite` and its WAL files on persistent storage and back them up. Do not place the database or `.env` files in public web directories or source control. Run a single application instance using this SQLite file. Manager access uses one shared secret; named user accounts and password recovery are not included.

## Included workflow

- Public role overview and frequently asked questions.
- Three-step application capturing name, email, Facebook experience, device, availability and acknowledgement.
- Applicant portal using a generated private access key. Applicants must save this key; it grants access to their application. The browser retains it only for the current tab session.
- Private manager dashboard: review applicants, assign up to three trials, review submitted post links, request changes and approve trials.
- Trial compensation is deliberately unspecified on the public page. The manager must provide terms with each assignment before work begins.
- Three approved trials are required before the manager can mark an applicant accepted. Acceptance is never automatic.
- Assigned photo folders and Facebook groups open as external links. This app does not post to Facebook or request Facebook credentials.

## Before public launch

Confirm role/pay terms, trial compensation, data-retention policy, and your business contact information. Configure hosting, HTTPS, a strong manager secret, persistent storage, backups and request rate limits at the reverse proxy. Formspree forwards applications to your configured account; no email or SMS notifications are sent to applicants, who check the portal for updates. Applicant key recovery and deletion requests are currently handled manually by the business, not automated UI actions.

## Validation

`npm run build` builds the React application. `npm test` checks API authentication, field validation, Formspree delivery and failure handling, application persistence, trial submission and acceptance gating against isolated temporary services.
