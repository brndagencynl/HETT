# Shopify Setup Guide

This document describes how to configure Shopify as the single source of truth for content and commerce.

## Prerequisites

1. A Shopify store with a Storefront API access token
2. Access to Shopify Admin to create Metaobjects

## Environment Variables

Add these to your `.env` file (and Vercel environment variables):

```env
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_access_token
```

### Getting Your Storefront Access Token

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Name it "Website Frontend" or similar
4. In the app, go to "Configuration" → "Storefront API integration"
5. Select these scopes:
   - `unauthenticated_read_metaobjects`
   - `unauthenticated_read_content`
6. Install the app and copy the Storefront access token

---

## Metaobject Definitions

Create the following Metaobject definitions in Shopify Admin → Settings → Custom data → Metaobject definitions.

### 1. Homepage Hero (`homepage_hero`)

**Definition name:** `Homepage Hero`  
**Type:** `homepage_hero`  
**Access:** Storefronts

| Field Name | Type | Required |
|------------|------|----------|
| `title` | Single line text | Yes |
| `subtitle` | Single line text | Yes |
| `description` | Multi-line text | Yes |
| `primary_cta_label` | Single line text | Yes |
| `primary_cta_url` | Single line text | Yes |
| `secondary_cta_label` | Single line text | No |
| `secondary_cta_url` | Single line text | No |
| `image` | File (Image) | Yes |

**Example Entry (handle: `main`):**

```
title: Terrasoverkappingen vanaf €839
subtitle: HETT Premium
description: De beste en voordeligste in de markt voor de doe-het-zelver!
primary_cta_label: Bekijk assortiment
primary_cta_url: /categorie/overkappingen
secondary_cta_label: Configureer nu
secondary_cta_url: /configurator
image: [Upload hero_veranda.png]
```

---

### 2. Homepage USP (`homepage_usp`)

**Definition name:** `Homepage USP`  
**Type:** `homepage_usp`  
**Access:** Storefronts

| Field Name | Type | Required |
|------------|------|----------|
| `icon_name` | Single line text | Yes |
| `title` | Single line text | Yes |
| `text` | Single line text | Yes |

**Valid Icon Names:** `Wrench`, `Truck`, `Package`, `Award`, `Check`

**Create exactly 4 entries:**

1. ```
   icon_name: Wrench
   title: Zelf te monteren
   text: Eenvoudig zelf te monteren
   ```

2. ```
   icon_name: Truck
   title: Snelle levering
   text: Binnen 10 werkdagen geleverd
   ```

3. ```
   icon_name: Package
   title: Gratis bezorging
   text: Gratis thuisbezorgd
   ```

4. ```
   icon_name: Award
   title: Duitse kwaliteit
   text: Duitse Precisie & Vakmanschap
   ```

---

### 3. Homepage FAQ (`homepage_faq`)

**Definition name:** `Homepage FAQ`  
**Type:** `homepage_faq`  
**Access:** Storefronts

| Field Name | Type | Required |
|------------|------|----------|
| `question` | Single line text | Yes |
| `answer` | Multi-line text | Yes |

**Example Entries:**

1. ```
   question: Hoe lang duurt de levering?
   answer: Standaard leveren wij binnen 10 werkdagen na bestelling. Voor maatwerk kan dit iets langer duren.
   ```

2. ```
   question: Kan ik de veranda zelf monteren?
   answer: Ja! Al onze veranda's zijn ontworpen voor doe-het-zelvers. We leveren een complete montagehandleiding mee.
   ```

3. ```
   question: Wat is de garantie?
   answer: Wij bieden 10 jaar garantie op constructie en 5 jaar op dakbedekking.
   ```

4. ```
   question: Kan ik de producten bekijken in een showroom?
   answer: Zeker! U bent van harte welkom in onze showroom in Eindhoven. Hier kunt u verschillende opstellingen bekijken.
   ```

5. ```
   question: Leveren jullie ook maatwerk?
   answer: Ja, naast onze standaardmaten kunnen wij veel systemen exact op de door u gewenste afmeting produceren.
   ```

6. ```
   question: Wat zijn de mogelijkheden voor bezorgen of afhalen?
   answer: U kunt kiezen voor bezorging aan huis of gratis afhalen bij ons magazijn in Eindhoven.
   ```

---

### 4. Homepage Inspiration (`homepage_inspiration`)

**Definition name:** `Homepage Inspiration`  
**Type:** `homepage_inspiration`  
**Access:** Storefronts

| Field Name | Type | Required |
|------------|------|----------|
| `title` | Single line text | Yes |
| `subtitle` | Single line text | No |
| `url` | Single line text | Yes |
| `image` | File (Image) | Yes |

**Example Entries:**

1. ```
   title: Overkappingen
   subtitle: Bescherm uw terras
   url: /categorie/overkappingen
   image: [Upload inspiration image]
   ```

2. ```
   title: Tuinkamers
   subtitle: Extra leefruimte
   url: /projecten
   image: [Upload inspiration image]
   ```

3. ```
   title: Carports
   subtitle: Bescherm uw auto
   url: /projecten
   image: [Upload inspiration image]
   ```

---

### 5. Footer Column (`footer_column`)

**Definition name:** `Footer Column`  
**Type:** `footer_column`  
**Access:** Storefronts

| Field Name | Type | Required |
|------------|------|----------|
| `title` | Single line text | Yes |
| `links` | Multi-line text (JSON format) | Yes |

**Links Format (JSON array):**
```json
[
  {"label": "Link Label", "url": "/path"},
  {"label": "Another Link", "url": "/other-path"}
]
```

**Or line-separated format:**
```
Link Label|/path
Another Link|/other-path
```

**Example Entries:**

1. **Producten Column:**
   ```
   title: Producten
   links: [{"label": "Veranda's", "url": "/categorie/verandas"}, {"label": "Sandwichpanelen", "url": "/categorie/sandwichpanelen"}, {"label": "Accessoires", "url": "/categorie/accessoires"}]
   ```

2. **Over HETT Column:**
   ```
   title: Over HETT
   links: [{"label": "Over ons", "url": "/over-ons"}, {"label": "Showroom", "url": "/showroom"}, {"label": "Projecten", "url": "/projecten"}, {"label": "Blog", "url": "/blog"}]
   ```

3. **Service Column:**
   ```
   title: Service
   links: [{"label": "Veelgestelde vragen", "url": "/veelgestelde-vragen"}, {"label": "Bezorging", "url": "/bezorging"}, {"label": "Montage", "url": "/montage-handleiding"}, {"label": "Garantie", "url": "/garantie-en-klachten"}]
   ```

---

## Blog Setup

### Create a Blog

1. Go to Shopify Admin → Online Store → Blog posts
2. Create a new blog called "Nieuws" (or "Blog")
3. Set the handle to `nieuws`

### Create Blog Posts

Each blog post should have:
- **Title**: The article title
- **Content**: Rich text content
- **Excerpt**: Optional summary (auto-generated if empty)
- **Featured Image**: Article hero image
- **Handle**: URL-friendly slug (auto-generated from title)

### Blog Routes

The frontend provides these routes:
- `/blog` - Blog listing page
- `/blog/:handle` - Individual blog post

Legacy routes (`/nieuws`, `/blogs`) automatically redirect to `/blog`.

---

## Pages Setup

### Create Pages in Shopify

1. Go to Shopify Admin → Online Store → Pages
2. Create pages with desired content
3. Note the handle (URL slug)

### Page Route

Access pages via: `/pagina/:handle`

Example: If you create a page with handle `over-ons-bedrijf`, access it at `/pagina/over-ons-bedrijf`

---

## Content Provider Selection

The frontend automatically uses Shopify as the content provider. To use mock data during development:

```env
VITE_CONTENT_PROVIDER=mock
```

For production (default):
```env
VITE_CONTENT_PROVIDER=shopify
```

---

## Fallback Behavior

If Shopify is not configured or a request fails, the frontend uses fallback content defined in [services/shopify.ts](services/shopify.ts):

- `FALLBACK_HERO`: Default hero content
- `FALLBACK_USPS`: Default USP items
- `FALLBACK_FAQ`: Default FAQ items
- `FALLBACK_INSPIRATION`: Default inspiration cards
- `FALLBACK_FOOTER_COLUMNS`: Default footer columns

This ensures the site remains functional even if Shopify is unavailable.

---

## API Reference

### GraphQL Queries

The frontend uses these Storefront API queries:

| Query | Metaobject Type | Description |
|-------|-----------------|-------------|
| `HomepageHero` | `homepage_hero` | Fetches hero with handle "main" |
| `HomepageUsps` | `homepage_usp` | Fetches first 4 USP items |
| `HomepageFaq` | `homepage_faq` | Fetches first 20 FAQ items |
| `HomepageInspiration` | `homepage_inspiration` | Fetches first 10 inspiration cards |
| `FooterColumns` | `footer_column` | Fetches footer columns |
| `BlogArticles` | Blog | Fetches blog posts from "nieuws" blog |
| `BlogArticleByHandle` | Blog | Fetches single article by handle |
| `PageByHandle` | Pages | Fetches page by handle |

---

## Troubleshooting

### Content Not Loading

1. Check that `VITE_SHOPIFY_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_TOKEN` are set
2. Verify the Storefront API token has correct permissions
3. Check browser console for GraphQL errors
4. Ensure metaobjects have "Storefronts" access enabled

### Metaobjects Not Found

1. Verify the metaobject type matches exactly (e.g., `homepage_hero`)
2. Check that entries exist and have the correct handle (e.g., `main` for hero)
3. Ensure all required fields are filled

### Blog Not Loading

1. Verify you have a blog with handle `nieuws`
2. Check that blog posts are published (not drafts)
3. Ensure the blog has "Online Store" visibility enabled

---

## Migration Checklist

- [ ] Create Storefront API access token
- [ ] Set environment variables
- [ ] Create `homepage_hero` metaobject definition
- [ ] Create hero entry with handle `main`
- [ ] Create `homepage_usp` metaobject definition
- [ ] Create 4 USP entries
- [ ] Create `homepage_faq` metaobject definition
- [ ] Create FAQ entries
- [ ] Create `homepage_inspiration` metaobject definition
- [ ] Create inspiration card entries
- [ ] Create `footer_column` metaobject definition
- [ ] Create 3 footer column entries
- [ ] Create "nieuws" blog
- [ ] Migrate/create blog posts
- [ ] Test all routes: `/`, `/blog`, `/blog/:handle`, `/pagina/:handle`
- [ ] Deploy to Vercel with environment variables
