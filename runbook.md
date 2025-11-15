# Arkiv Runbook

## Phase 1: CRUD

Implemented:
- write an entity
- read an entity by key
- verify attributes + payload structure
- basic annotation setup
- basic query for entity type (profiles)

No major issues or points of friction yet. 

## Phase 2: Wallet-Centric Dashboard

Implemented:
- `/api/me` endpoint that aggregates Arkiv data for the current wallet:
  - `user_profile` (or `null` if none exists yet)
  - `ask` entities owned by this wallet
  - `offer` entities owned by this wallet
- `/me` dashboard page that:
  - shows the connected wallet address
  - displays the long-lived mentorship profile (or a create form)
  - lets the user create new asks (help requests)
  - lets the user create new offers (availability to help)
  - lists existing asks/offers pulled directly from Arkiv
