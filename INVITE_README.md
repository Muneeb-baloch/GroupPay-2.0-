# Invite System Notes (Future Context)

This file is dedicated to invite flow only.
It is intentionally separate from `README.md`.

## Why this exists
- Track invite behavior and edge-cases in one place.
- Keep future improvements easy to plan.
- Avoid mixing invite internals into the general app documentation.

## Current End-to-End Flow
1. Admin enters email in `ManageGroupScreen`.
2. App resolves user via `usersService.getUserByEmail(token, email)`.
3. App sends invite with `receiver_id` using `POST /api/up/invites`.
4. Sent invites are loaded from `GET /api/up/invites/sent`.
5. Receiver gets invite in notifications and can Accept/Decline.
6. Status update uses `PATCH /api/up/invites/{id}/status`.
7. Accepted users appear in current members (including fallback merge when backend sync is delayed).

## API Contracts Used
- `GET /api/up/users/by-email?email=<email>`
- `GET /api/up/users/search?q=<query>` (fallback)
- `GET /api/up/invites/received`
- `GET /api/up/invites/sent`
- `POST /api/up/invites` body: `{ group_id, receiver_id }`
- `PATCH /api/up/invites/{id}/status` body: `{ status: "ACCEPTED" | "DECLINED" }`
- `DELETE /api/up/invites/{id}`

## Key Files
- `src/services/usersService.js`
- `src/services/invitesService.js`
- `src/services/queuedInvitesService.js`
- `src/screens/ManageGroupScreen.js`
- `src/screens/NotificationsScreen.js`
- `src/services/groupsService.js`
- `src/utils/helpers.js`

## Current Rules
- Resend is allowed only for `DECLINED` invites.
- Cancel is allowed for `PENDING` invites.
- `ACCEPTED` invites should not stay in Sent Invites.
- Admin/member tabs depend on real role/ownership checks.

## Known Risk Areas
- Backend response shape differences (array/object/wrapped payloads).
- Delayed participant sync after invite acceptance.
- Missing/incorrect status values from backend.
- Duplicate invite records across notifications and invites endpoints.

## Improvement Checklist
- [ ] Add analytics events for send/accept/decline/cancel/resend.
- [ ] Add backend idempotency key for invite creation.
- [ ] Add retry policy + exponential backoff for invite APIs.
- [ ] Add integration tests for two-user invite lifecycle.
- [ ] Add a small debug mode to log normalized invite payloads.
- [ ] Move status constants to one shared enum file.

## Quick Manual Test (2 accounts)
1. Admin sends invite by email.
2. Verify invite appears in Sent Invites as `PENDING`.
3. Receiver accepts invite from notifications.
4. Verify sender sees receiver under Current Members.
5. Verify invite no longer appears as resend/cancel candidate.
6. Repeat with decline and verify resend appears.

## Run
```bash
cd /Users/muneebbaloch/Desktop/Projects/RN-Projects/GP/GroupPay
npx expo start -c
```