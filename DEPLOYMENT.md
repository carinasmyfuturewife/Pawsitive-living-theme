# PAWSITIVE.LIVING — Theme Deployment Guide

This directory contains the complete, custom Shopify Online Store 2.0 theme for PAWSITIVE.LIVING, built from the approved Brand Identity Bible (Concept B, Modern Minimalism). It was built as implementation files — **nothing has been uploaded, previewed, or published to the store.**

## What is included

- `layout/`, `templates/`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/` — the full theme
- `pawsitive-living-theme.zip` — the same theme, zipped for upload
- `TESTING.md` — static validation report + manual test checklist

## Prerequisites

- Shopify Admin access to the store (jbshvc-ma.myshopify.com)
- The store is currently on a **trial plan** — upgrade to a paid plan before launch; checkout will not process on trial
- The 3 product records already exist (PAW RITUAL, COAT FINISH, THE RITUAL BUNDLE). Publish them from DRAFT when ready

## Deploy via Admin (recommended)

1. Download `pawsitive-living-theme.zip` from `~/workspace/pawsitive-living/shopify-theme/`
2. Shopify Admin → **Online Store → Themes**
3. Click **Add theme → Upload zip file**, select the zip
4. The theme appears under **Theme library** (unpublished). Click **Customize** to preview and edit — never edit the live theme directly
5. In the theme editor, assign content:
   - Homepage sections: pick the **Shop All** collection for Featured collection, and pick the three products for the three Product feature sections
   - Header/Footer: select the `main-menu` and `footer` menus (create them under Content → Menus if they do not exist)
   - Create pages: **Our Story**, **Our Standards**, **Our Impact**, **FAQ** (template suffix `page.faq`), **Contact** (template suffix `page.contact`), **Shipping & Returns**, **Privacy Policy**, **Terms of Service**
6. **Bundle savings badge:** on THE RITUAL BUNDLE product record, set the **Compare-at price** to $50.00. The theme computes "Save $X" from compare-at vs price — no code changes needed if prices change later
7. **Free-shipping progress:** Theme editor → Cart drawer section → set the free-shipping threshold (default 50). This only mirrors the shipping setting — configure the actual free-shipping rate in Settings → Shipping and delivery
8. Upload product photography to Files/Products; assign in the theme editor or product records
9. **Publish only with explicit approval.** Admin → Themes → Publish on the new theme

## Deploy via Shopify CLI (alternative)

```bash
shopify theme init --path pawsitive-living  # not needed; use the existing folder
cd ~/workspace/pawsitive-living/shopify-theme
shopify theme push --unpublished --theme "PAWSITIVE.LIVING v1"
```

Requires the Shopify CLI authenticated against the store (`shopify auth login`).

## What could NOT be done from the build environment

- No live store or theme access: no upload, no preview, no publish, no app installation
- Checkout settings, payment providers, taxes, shipping zones/rates, and domains must be configured in Admin
- Navigation menus and page content must be created in Admin (templates are ready for them)
- Product photography does not exist yet — image areas show tasteful "coming soon" placeholders
- The contact email default is `hello@pawsitive.living` — update it in the Contact form section before launch
- Give-back partner is TBD — the Impact page must name the partner and use verified figures only once confirmed

## After publishing

- Run through the manual checklist in `TESTING.md`
- Verify checkout end-to-end with a test order (Bogus Gateway or Shopify Payments test mode)
- Submit the sitemap to Search Console; verify meta titles/descriptions
