## Payrails Display SDK – Getting Started Example

This repository is a minimal Next.js application showing how to securely display tokenized payment instrument data using the **Payrails Display SDK**.

It pairs with the guide at https://docs.payrails.com/docs/display-sdk

---
## Overview

Frontend flow (`app/page.tsx`):
1. Enter an `instrumentId` (a tokenized instrument you are allowed to reveal).
2. Click **Initialize SDK** – the page calls `/api/init`.
3. The backend (`app/api/init/route.ts`) obtains an OAuth access token and calls Payrails `/token/client/init`.
4. The JSON response is passed to `DisplaySDK.init(...)`.
5. Secure display elements (card number, expiry, etc.) are created and mounted into placeholder `<div>` containers.
6. Destroy the SDK instance automatically on component unmount or before re‑initializing.

Backend flow (`app/api/init/route.ts`):
1. Reads required env vars: `PAYRAILS_CLIENT_ID`, `PAYRAILS_CLIENT_SECRET` (and optional `PAYRAILS_BASE_URL`).
2. Exchanges client credentials for an access token.
3. Calls `/token/client/init` with the instrument and a simple payload.
4. Returns the response JSON directly to the frontend.

---
## Prerequisites

Set these environment variables (e.g. in a `.env.local` file):

```
PAYRAILS_CLIENT_ID=your_client_id
PAYRAILS_CLIENT_SECRET=your_client_secret
# Optional (defaults to production):
# PAYRAILS_BASE_URL=https://api.payrails.com
```

Ensure the `instrumentId` you test with exists in your Payrails environment and that your credentials can reveal it.

---
## Run Locally

Install dependencies (pnpm shown, use any package manager):
```
pnpm install
pnpm dev
```
Open http://localhost:3000

Enter an `instrumentId` and click Initialize SDK. The element containers will populate securely (no raw PAN or sensitive data touches your server or page JS context directly).

---
## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Frontend example: obtain init payload, init SDK, mount elements. |
| `app/api/init/route.ts` | Minimal backend endpoint calling Payrails auth + init APIs. |
| `app/globals.css` | Very small global styles. |
| `package.json` | Dependencies (Next.js, React, Display SDK). |

---
## Customizing

Add or remove elements: use `DisplayElementType.*` and mount them into a container with a unique id.

Style elements: pass style overrides in `options.styles` when calling `DisplaySDK.init(initResponse, options)`.

Translations: provide custom loading/error strings via `options.translations`.

Re-initializing for a different instrument: destroy the previous instance first (`sdk.destroy()`) before creating a new one (the example handles this automatically).

---
## Production Considerations

1. Validate and authorize the requested `instrumentId` server-side before calling `/token/client/init`.
2. Log and monitor failed init attempts (rate limiting, suspicious patterns, etc.).
3. Provide meaningful `auditData` (user id / session id) for traceability.
4. Do not expose secrets client-side; only the server calls Payrails auth endpoints.
5. Handle token expiry (init responses are short-lived; re-init if needed).

---
## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Target element not found` | Using bare id instead of selector or element not present | Pass `#id` or ensure the container exists before calling `mount()` |
| Cardholder name empty | Field not available / not allowed in workflow | Confirm instrument has that data & workflow permissions |
| 502 from `/api/init` | Upstream init request failed | Check env vars, client credentials, instrument validity |
| Styles not applied | Missing style overrides or conflicting CSS | Add to `options.styles` base or specific element key |

---
## License / Use

This example is provided for instructional purposes. Adapt, extend, and integrate into your own application as needed.

---
## Next Steps

Continue with the full Display SDK docs for advanced styling, localization, and security best practices:
https://docs.payrails.com/docs/display-sdk

