# PAWSITIVE.LIVING — Theme Testing Report

## Static validation (performed on the implementation files)

| # | Check | Result |
|---|-------|--------|
| 1 | All `.json` templates parse (`templates/*.json`) | PASS — 9/9 parse |
| 2 | `config/settings_schema.json` parses | PASS |
| 3 | `config/settings_data.json` parses | PASS |
| 4 | `locales/en.json` parses | PASS |
| 5 | `{% schema %}` blocks parse as JSON in all sections | PASS — 23/23 |
| 6 | Liquid tag balance (`{%`/`%}`, `{{`/`}}`) across layout/sections/snippets | PASS — all balanced |
| 7 | Every `{{ '…' \| t }}` key exists in `en.json` | PASS — full key audit |
| 8 | No hardcoded prices (`$24`, `$26`, `$44`, `24.00` etc.) in templates/sections/snippets/assets | PASS — grep clean |
| 9 | No hardcoded product titles in render paths | PASS — titles render from product objects; section schema defaults are merchant-editable |
| 10 | No lorem ipsum / fake claims in customer-facing copy | PASS — TBD items use explicit "coming soon" treatment |
| 11 | Bundle savings computed from `compare_at_price`, not hardcoded | PASS |
| 12 | No exclamation marks in customer-facing copy | PASS |
| 13 | Zip contains theme files at top level | PASS — 49 files, integrity verified |

### Reconciliation against the approved Website Design document (2026-11-04, post-build pass)

The design PDF (16 pp, approved) landed after the initial build. The following gaps were found and fixed in this pass:

| Design requirement | Finding | Action |
|---|---|---|
| Homepage §4: positioning statement after hero | Missing | Added `sections/positioning-statement.liquid` with approved copy deck text; inserted in `templates/index.json` order |
| Homepage §10: ingredient standards section | Missing | Added `sections/ingredient-standards.liquid` (4 honest standards, block-editable) |
| Homepage §11: lifestyle photography section | Missing | Added `sections/lifestyle-gallery.liquid` (merchant image pickers; renders nothing until photography exists — no faked imagery) |
| Homepage 12-section order | Verified | `index.json` order now matches the design doc exactly |
| Product page: sticky purchase bar (mobile) | Missing | Added `.sticky-bar` (title + live price + add button, mobile-only, safe-area aware); submits the main product form so variant/qty/error handling is shared; price and availability sync with variant selection |
| Product page: ingredients render from validated data | Static honest placeholder only | Added `ingredients` block type: renders `product.metafields.custom.inci_ingredients` when set, otherwise the honest "nothing listed until verified" placeholder |
| Cart drawer: free-shipping progress to $50 | Present | Verified in `sections/cart-drawer.liquid` |
| Hero copy verbatim | Present | Verified: "EVERYDAY CARE, ELEVATED." + supporting line + both CTAs |

### Key audit notes

- **Deepened sage:** pure Sage `#7A8471` fails WCAG AA for body text on Warm Ivory, so `--color-sage-deep: #4A5D4A` (the brand's botanical green, contrast-safe) is used for small text, focus rings, and eyebrows. `#7A8471` itself is used exactly for the wordmark dots and decorative accents, per the bible.
- **Pricing:** all prices render via `money` filters from product/variant objects. The bundle "Save" badge derives from the product's compare-at price (merchant sets $50.00 in Admin).
- **Reconciliation:** complete — see the reconciliation table above. The theme now matches the approved design document.

## Outstanding manual test checklist (for after upload, before publish)

- [ ] Homepage: hero, featured collection, 3 product features, philosophy, story, give-back, newsletter, footer
- [ ] Navigation: desktop menu, mobile menu open/close, keyboard operation, focus states
- [ ] Product pages: gallery + thumbnails, variant selector (test with a multi-variant duplicate), price updates, inventory messages, accordions, related products, savings badge on bundle
- [ ] Collection page: grid, sort dropdown, pagination
- [ ] Cart drawer: add from product page and quick-add, quantity +/-, remove, subtotal, free-shipping progress, checkout button → `/checkout`
- [ ] Cart page (no-JS fallback): update quantities, remove, checkout
- [ ] Newsletter: submit → success message; confirm customer tag in Admin
- [ ] Contact form: submit → success message
- [ ] Search: query with results, query with no results
- [ ] 404 page renders
- [ ] Mobile (375px), tablet (768px), desktop (1440px): no horizontal overflow, readable type, tappable targets
- [ ] Browser console: no errors on any template
- [ ] View-source: JSON-LD Organization + Product blocks present and valid
- [ ] Meta titles/descriptions per template; image alt text from product media
- [ ] Test order end-to-end in a payment test mode before launch

## Known limitations

- Product photography placeholders show until real photography is uploaded
- `predictive search` API not implemented (standard search only) — acceptable for a 3-product catalog
- Product recommendations use same-collection siblings (deterministic), not Shopify's recommendations API
- Multi-currency: money formatting follows `shop.money_format`; test if additional currencies are enabled
