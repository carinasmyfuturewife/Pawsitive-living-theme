# PAWSITIVE.LIVING — Theme Deployment Guide

Custom Shopify Online Store 2.0 theme for PAWSITIVE.LIVING, built from the
approved Brand Identity Bible (Concept B, Modern Minimalism).

## Store
- Store: "My Store 3" — **pawsitiveliving-store.myshopify.com**
  (previously jbshvc-ma.myshopify.com; same store, handle renamed Nov 2026)
- Plan: trial (upgrade to paid before launch; checkout will not process on trial)
- Products: PAW RITUAL ($24), COAT FINISH ($26), THE RITUAL BUNDLE ($44) — all ACTIVE
- Pages: Our Story, Our Standards, Our Impact, FAQ, Contact — all created and published
- Current live theme: "pawsitive-living-theme" (published Nov 2026)
- GitHub: carinasmyfuturewife/Pawsitive-living-theme (source of truth, branch main)

## Current package
- `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/` — full theme source
- `pawsitive-living-theme.zip` — the same theme, zipped for upload
- `TESTING.md` — static validation report + manual test checklist
- `../theme-corrections/AUDIT.md` — technical audit for the corrections pass
- `../theme-corrections/QA-REPORT.md` — QA report for the corrections pass

## Deploy via Admin (recommended)
1. Use `pawsitive-living-theme.zip` from this folder (rebuilt after corrections)
2. Shopify Admin → **Online Store → Themes**
3. **Add theme → Upload zip file**, select the zip
4. The theme appears under **Theme library** (unpublished). Click **Customize**
   to preview — never edit the live theme directly
5. In the theme editor, verify content assignments:
   - Featured collection → **Shop All** collection
   - Header/Footer → `main-menu` and `footer` menus
   - Give-back section → confirm donation amount, statement, partner (leave
     partner blank until verified; toggle "Show donation amount figure" off
     until the amount is verified)
6. **Bundle savings badge:** on THE RITUAL BUNDLE product record, set the
   **Compare-at price** to $50.00. The theme computes "Save $X" from
   compare-at vs price.
7. **Free-shipping progress:** Theme editor → Cart drawer section → set the
   free-shipping threshold (default 50). This only mirrors the shipping
   setting — configure the actual free-shipping rate in Settings → Shipping.
8. Upload product photography to Files/Products; assign in the editor.
9. **Publish only with explicit approval.** Admin → Themes → Publish.

## Deploy via GitHub integration (alternative)
The repo is connected to the store. Pushing to `main` syncs to the
"Pawsitive-living-theme/main" draft theme. Review the draft, then publish
from Admin. Note: the GitHub sync applies the same schema validation as ZIP
upload (see lesson below).

## Deploy via Shopify CLI (alternative)
```bash
cd ~/workspace/pawsitive-living/shopify-theme
shopify theme push --unpublished
```
Requires the Shopify CLI authenticated against the store.

## Critical lesson: Shopify validates schemas on import (Nov 2026)
Shopify **silently drops** theme files that fail schema validation during ZIP
upload and GitHub sync — no error is shown. This caused a full homepage
outage: 6 sections were dropped, which then caused `templates/index.json`
and `templates/product.json` to be rejected ("Section type does not refer to
an existing section file").

Rules discovered (validate before packaging):
- `url` settings: do not use `/pages/...` paths as `default` values.
  (`/collections/all` is accepted; page paths are rejected.)
- `text`/`textarea` settings: do not use `"default": ""` (blank defaults
  are rejected — omit the key instead).
- Block `name`: maximum 25 characters.
- JSON templates are validated against the sections actually present: a
  template referencing a missing section file is rejected.

Always run the validation script (see TESTING.md) before zipping.

## Still required in Admin (not part of the theme)
- Upgrade trial → paid plan
- Checkout settings, payment providers, taxes, shipping zones/rates, domains
- Navigation menu content (menus exist as containers; verify links)
- Product photography (placeholders are honest "coming soon" blocks)
- Contact email: update from `hello@pawsitive.living` if needed
- Give-back partner: TBD — name the partner and use verified figures only
  once confirmed; keep "Show donation amount figure" off until verified
- Analytics (GA4, Search Console), sitemap submission

## After publishing
- Run through the manual checklist in `TESTING.md`
- Verify checkout end-to-end with a test order (Bogus Gateway or test mode)
- Verify the homepage, product pages, cart drawer, and give-back section
