# Security patches, 2026-10-22

## Summary

`npm audit` reported 20 vulnerabilities (2 critical, 11 high, 7 moderate). This change upgrades Next.js and protobufjs within their current majors, refreshes transitive dependencies with `npm audit fix`, and adds one `overrides` entry for the PostCSS copy that Next.js pins. After the change, 6 findings remain (4 high, 2 moderate). They trace to two advisories under `@waku/sdk`, which need a breaking `@waku/sdk` change to fix.

No application code changed.

## Changes

| Package | From -> To | Advisories | Why it matters here |
| --- | --- | --- | --- |
| next (direct) | 15.5.7 -> 15.5.28 | Critical: GHSA-2xp9-vwfh-vxw4 (unauthenticated RCE in image optimization with AVIF), GHSA-p293-qw3h-jr36 (unauthenticated RCE on Windows hosts). High: Server Components DoS, middleware bypasses, SSRF in Server Actions and rewrites, and others (32 GHSA IDs total in the audit report) | The app is served by Next.js, so these are reachable on a deployed instance. |
| protobufjs (direct) | 7.5.4 -> 7.6.6 | Critical: GHSA-xq3m-2v4x-88gg (arbitrary code execution). High: GHSA-2pr8-phx7-x9h3, GHSA-66ff-xgx4-vchm, GHSA-685m-2w69-288q, GHSA-75px-5xx7-5xc7 and others (12 IDs) | Also used by the Waku/libp2p stack. |
| @protobufjs/utf8 | 1.1.0 -> 1.1.2 | GHSA-q6x5-8v7m-xcrf | Transitive of protobufjs. |
| postcss (via next, `overrides`) | 8.4.31 -> 8.5.31 | GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp, GHSA-qx2v-qp2m-jg93 | Next.js 15 pins postcss 8.4.31. Used at build time. The override is scoped to `next`. |
| sharp | 0.34.5 -> 0.35.5 | GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w | Used by Next.js image optimization. Version allowed by next 15.5.28. |
| axios | 1.13.2 -> 1.20.0 | 35 GHSA IDs, including prototype pollution gadgets, proxy credential leaks, and DoS | Transitive of contentful. |
| ws | 8.18.3 -> 8.21.0 | GHSA-58qx-3vcg-4xpx, GHSA-96hv-2xvq-fx4p | Transitive. |
| form-data | 4.0.4 -> 4.0.6 | GHSA-hmw2-7cc7-3qxx | Transitive of axios. |
| follow-redirects | 1.15.11 -> 1.16.1 | GHSA-r4q5-vmmm-2653 | Transitive of axios. |
| qs | 6.14.0 -> 6.16.1 | GHSA-4mjr-xmp4-gh2g, GHSA-6rw7-vpxm-498p, GHSA-q8mj-m7cp-5q26, GHSA-w7fw-mjwx-w883 | Transitive. |
| nanoid, source-map-js, fast-copy, viem | 3.3.11 -> 3.3.20, 1.2.1 -> 1.2.2, 2.1.7/3.0.2 -> 2.2.0/3.1.0, 2.39.0 -> 2.57.7 | See `npm audit` | Transitive. |

## Verification

Node 26.12.0, npm 11.20.0, clean `npm ci` before and after:

| Check | Before | After |
| --- | --- | --- |
| `npm ci` | pass | pass |
| `npx tsc --noEmit` | pass | pass |
| `npm run build` | pass | pass, same route list |
| `next start` + `GET /` | not run | 200 |

`npm audit` after the change: 0 critical, 4 high, 2 moderate, 0 low.

## Not fixed

- `@libp2p/peer-store` < 12.0.24 (GHSA-vrf4-mx87-p53w, PeerStore accepts attacker-signed PeerRecords for a victim peer ID). Pulled in by `@waku/sdk@0.0.31` through `libp2p`. The four high findings (`@libp2p/peer-store`, `libp2p`, `@waku/core`, `@waku/sdk`) are this one issue.
- `uuid` < 11.1.1 (GHSA-w5hq-g745-h8pq, missing bounds check when a caller passes `buf`). Pulled in by `@waku/core`. Reported as two moderate findings with `@waku/discovery`.
- npm's only offered fix for both is `@waku/sdk@0.0.16`, which is a breaking change, so it was not applied. `@waku/sdk` and `protobufjs` are listed in `package.json` but no source file in this repo imports them. If they are not needed, removing them clears these findings.

## What deployers should do

1. Pull this change, run `npm ci`, rebuild, and redeploy. A running instance keeps the old Next.js until it is rebuilt.
2. Run Node.js 22.23.4, 24.22.1, or 26.12.1 or later. The October 2026 Node.js security releases fix a Brotli decoder RCE reachable through `fetch()` and two TLS validation bypasses. Node 20 is end of life and has no fix.
3. If you host on Vercel or another platform, check the Node.js version setting in the project, since the repo does not pin one.
