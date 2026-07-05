# Stripe environment reference (yournewhandle)
#
# SECRETS: set only in `.env.local` (local) and Vercel → Project → Environment Variables.
# Never commit live secret keys, webhook secrets, or API keys to git.
#
# ─── Product catalog (live mode, yournewhandle Stripe account) ───────────────
#
# Starter
#   Product ID: prod_UpMdJACLrKooJl
#   Price ID:   price_1TphueGhxUROb8kXBJdrH9tU
#
# Pro
#   Product ID: prod_UpMfhPbWTkE8Ar
#   Price ID:   price_1TphwdGhxUROb8kXW4tjAZmV
#
# Enterprise (usage-based graduated + meter)
#   Product ID: prod_UpMsvquGa3YHI0
#   Price ID:   price_1Tpi8JGhxUROb8kXPWdUzrko
#   Meter ID:   mtr_61Uz5vCpR2qmWz18d41GhxUROb8kX7ku
#
# Customer portal configuration
#   Portal ID:  bpc_1TpiIrGhxUROb8kXNF2Q5Ml2
#
# ─── Required env vars ───────────────────────────────────────────────────────
#
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_BILLING_PORTAL_CONFIGURATION=bpc_1TpiIrGhxUROb8kXNF2Q5Ml2
# STRIPE_PRICE_STARTER=price_1TphueGhxUROb8kXBJdrH9tU
# STRIPE_PRICE_PRO=price_1TphwdGhxUROb8kXW4tjAZmV
# STRIPE_PRICE_ENTERPRISE=price_1Tpi8JGhxUROb8kXPWdUzrko
# STRIPE_METER_ID=mtr_61Uz5vCpR2qmWz18d41GhxUROb8kX7ku
# STRIPE_METER_EVENT_NAME=api_request
# NEXT_PUBLIC_SITE_URL=https://yournewhandle.com
#
# ─── Webhook endpoint (production) ───────────────────────────────────────────
#
# URL:    https://yournewhandle.com/api/stripe/webhook
# Events: checkout.session.completed
#         customer.subscription.created
#         customer.subscription.updated
#         customer.subscription.deleted
#         invoice.payment_failed
#
# ─── Optional admin keys (not Stripe) ────────────────────────────────────────
#
# YNH_API_KEYS=ynh_live_manual_key:pro:Admin
