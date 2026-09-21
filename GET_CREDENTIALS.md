# How to Get Your MTN MoMo Credentials

## Visual Guide

From your screenshot, I can see you have the **Collections** subscription (second one). Here's how to get the credentials:

## Step 1: Click "Hide" Button

In your MTN MoMo dashboard (https://momodeveloper.mtn.com/profile):

```
┌─────────────────────────────────────────────────────────┐
│ Collections | Enable remote collection of bills...     │
├─────────────────────────────────────────────────────────┤
│ Started on: 09/20/2026                                  │
│ Primary key: 79e9ad63d27c49f8b210b3f77f82ab41          │
│ Secondary key: 83bc08993674ca4b2e3e3681be1060f6        │
│                                                          │
│ [Hide] [Regenerate] ← Click "Hide" here!               │
└─────────────────────────────────────────────────────────┘
```

## Step 2: Copy the Revealed Information

After clicking "Hide", you'll see:

```
User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Use These Values

Update your `.env.local`:

```bash
# The User ID (UUID format)
MOMO_COLLECTION_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# The API Key/Secret revealed after clicking Hide
MOMO_COLLECTION_USER_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# The Primary Key (already visible)
MOMO_COLLECTION_PRIMARY_KEY=79e9ad63d27c49f8b210b3f77f82ab41
```

## Alternative: Use Existing Sandbox Credentials

If you want to use the sandbox credentials you already created:

```bash
# Your sandbox credentials (already working)
MOMO_COLLECTION_USER_ID=576337d4-d467-4575-ba44-2213b7dfaace
MOMO_COLLECTION_USER_SECRET=e688989e6f024f17ac6b7891fc3b433b
MOMO_COLLECTION_PRIMARY_KEY=79e9ad63d27c49f8b210b3f77f82ab41
```

**But note:** This will use sandbox environment (test money, not real payments)

## For Production (Real Money)

You MUST get the production User ID and API Secret from the Collections subscription in your dashboard.

---

**Once you have them, update `.env.local` and run:**

```bash
npm run dev
```

Then test at http://localhost:3000/subscribe
