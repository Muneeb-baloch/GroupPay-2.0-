# Scene Logic

## Overview

A **scene** is a shared expense event (e.g., a dinner, trip) within a group. Each scene has participants, each of whom may have paid some amount and may owe or be owed money. Scenes drive the transaction ledger.

---

## Participant Modes

Every participant is either **SHARING** or **INDIVIDUAL**.

| Mode | Description |
|---|---|
| `SHARING` | Splits the bill equally with other sharing members. May have an `additional_amount` (personal extra cost on top of share). |
| `INDIVIDUAL` | Has a fixed personal bill not shared with anyone. Tracked via `individual_bill` on the frontend. |

A single scene can contain both types simultaneously.

---

## Core Formulas

### Step 1 — Shareable Amount

```txt
shareableAmount = total_amount
                  - sum(individual_bill for INDIVIDUAL participants)
                  - sum(additional_amount for SHARING participants)
```

### Step 2 — Per Person Share

```txt
perPersonShare = shareableAmount / count(ALL participants)
```

> **Note:** `perPersonShare` is divided by the total participant count (sharing + individual), not just sharing count. This is because the INDIVIDUAL encoding below adds `individual_bill - perPersonShare` as their `additional_amount`, which algebraically cancels their share back out.

### Step 3 — Net Amount per Participant

```txt
netAmount = perPersonShare - paid_amount + additional_amount
```

- `netAmount > 0.01` → **DEBIT** (person owes money)
- `netAmount < -0.01` → **CREDIT** (person overpaid)
- Otherwise → settled, no transaction created

### INDIVIDUAL Encoding (frontend → API transform)

The backend uses one unified formula for all participants. To make INDIVIDUAL work:

```txt
additional_amount (sent to API) = individual_bill - perPersonShare
```

This causes the backend formula to resolve correctly:

```txt
netAmount = perPersonShare - paid + (individual_bill - perPersonShare)
          = individual_bill - paid
```

The stored `additional_amount` in `scene_participants` for INDIVIDUAL participants is the **actual personal bill** (`perPersonShare + additional_amount_sent`), not the delta.

---

## Frontend Validations

| Rule | Check |
|---|---|
| Group required | `selectedGroupId` must be set |
| Location required | non-empty string |
| At least one participant | `participants.length > 0` |
| Bill amount > 0 | `billAmount > 0` |
| Paid = bill | `totalPaid === billAmount` (tolerance `0.01` in API) |
| Only ADMIN can create | Group selector filtered to groups where `role === 'ADMIN'` |
| No duplicate participants | Checked before adding to list |

**Calculator field:** Accepts math expressions (`100+50`, `500*1.15`). Sanitized to `[0-9+\-*/.() ]` only, evaluated via `Function` constructor, rounded to 2 decimal places. Locks the total bill field when active.

---

## Scene Create Flow

```txt
POST /api/up/scenes

1. Validate: sum(paid_amount) ≈ total_amount
2. INSERT scene row
3. For each participant:
   - Compute netAmount = perPersonShare - paid_amount + additional_amount
   - Store scene_participants row:
       paid_amount         = as provided
       additional_amount   = perPersonShare + additional_amount  (INDIVIDUAL)
                           = additional_amount                   (SHARING)
       pending_amount      = max(netAmount, 0)
       participant_category
4. INSERT DEBIT transactions  (netAmount > 0.01)
5. INSERT CREDIT transactions (netAmount < -0.01)
6. INSERT notifications (type: SCENE_CREATED) for each participant
```

**Transaction descriptions:**
- INDIVIDUAL DEBIT: `Scene at {location} - Personal Bill: Rs {bill}`
- SHARING DEBIT: `Scene at {location} - Share: Rs {share}[ + Additional: Rs {add}]`
- INDIVIDUAL CREDIT: `Scene at {location} - Extra paid beyond personal bill`
- SHARING CREDIT: `Scene at {location} - Extra paid beyond share`

---

## Scene Update Flow

```txt
PUT /api/up/scenes/:id

1. Validate: sum(paid_amount) ≈ total_amount
2. UPDATE scene row (location, description, scene_timestamptz, total_amount, image_url)
3. DELETE all scene_participants for scene_id
4. DELETE all transactions for scene_id
5. Recreate participants + transactions (same logic as create)
6. INSERT notifications (type: SCENE_UPDATED) for ALL active group members
   sender_id = group.created_by (admin)
```

Update is a full wipe-and-recreate of participants and transactions. No partial update.

---

## Scene Delete Flow

```txt
DELETE /api/up/scenes/:id

1. Fetch scene + group info
2. DELETE scene row
   → CASCADE deletes scene_participants
   → CASCADE deletes transactions
3. INSERT notifications (type: SCENE_DELETED) for ALL active group members
   related_id = group_id  (scene no longer exists)
   sender_id  = group.created_by
```

---

## Database Schema (relevant tables)

```sql
scene
  scene_id          SERIAL PK
  group_id          FK → groups
  location          VARCHAR(255)
  description       TEXT
  total_amount      DECIMAL(12,2)
  scene_timestamptz TIMESTAMPTZ
  image_url         TEXT
  created_at        TIMESTAMPTZ

scene_participants
  scene_id              FK → scene  (CASCADE DELETE)
  person_id             FK → person
  paid_amount           DECIMAL(12,2)
  pending_amount        DECIMAL(12,2)   -- max(netAmount, 0)
  additional_amount     DECIMAL(12,2)   -- actual personal bill for INDIVIDUAL; raw extra for SHARING
  participant_category  SHARING | INDIVIDUAL
  PK (scene_id, person_id)

transaction
  transaction_id  SERIAL PK
  person_id       FK → person
  group_id        FK → groups
  scene_id        FK → scene (nullable)
  amount          DECIMAL(12,2)
  type            CREDIT | DEBIT
  description     TEXT
  created_at      TIMESTAMPTZ
```

---

## Image Handling

- Bucket: `scene-on`, path: `scene-images/{groupId}/{timestamp}.{ext}`
- Allowed: JPG, JPEG, PNG, WebP; max 5MB
- Upload before scene creation; pass `image_url` in create/update payload
- On delete, image is NOT auto-removed from storage (manual cleanup needed)

---

## Standalone API Spec

### `POST /api/up/scenes`

```json
{
  "group_id": 1,
  "location": "Restaurant Name",
  "description": "optional",
  "scene_timestamptz": "2026-05-25T19:00:00.000Z",
  "total_amount": 3000,
  "image_url": "https://...",
  "participants": [
    {
      "person_id": 10,
      "paid_amount": 2000,
      "additional_amount": 0,
      "participant_category": "SHARING"
    },
    {
      "person_id": 11,
      "paid_amount": 1000,
      "additional_amount": 0,
      "participant_category": "SHARING"
    }
  ]
}
```

**Server-side logic required:**
- Verify caller is ADMIN of `group_id`
- Verify all `person_id`s are active `group_participants`
- `sum(paid_amount)` must equal `total_amount` (±0.01)
- Run share calculation and create transactions atomically

**Response:** Created scene with `scene_id`.

### `PUT /api/up/scenes/:id`

Same body shape as POST (all participant data required, not partial). Server must:
- Verify caller is ADMIN of the scene's group
- Atomic: delete old participants + transactions, insert new ones

### `DELETE /api/up/scenes/:id`

No body. Server must:
- Verify caller is ADMIN
- Delete scene (cascade)
- Emit notifications

### `POST /api/up/scenes/calculate` (utility endpoint)

Useful for preview before submission.

```json
{
  "total_amount": 3000,
  "participants": [
    {
      "person_id": 10,
      "paid_amount": 2000,
      "additional_amount": 0,
      "participant_category": "SHARING"
    },
    {
      "person_id": 11,
      "paid_amount": 500,
      "additional_amount": 200,
      "participant_category": "SHARING"
    },
    {
      "person_id": 12,
      "paid_amount": 500,
      "additional_amount": -166.67,
      "participant_category": "INDIVIDUAL"
    }
  ]
}
```

**Expected:** API returns calculated split breakdown without saving the scene.
