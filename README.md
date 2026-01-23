# Jamming Duo – PayPal Live (Frontend-only)

Jamming Duo is a small e-commerce website for selling homemade jam products.

This version of the site is **frontend-only** and was **built entirely in Replit**, using **React (with TypeScript and Vite)** and supporting frontend tooling. Payments are handled directly via the **PayPal JavaScript SDK**.

It is intentionally simple and serves as an early live version that will later be extended with a backend and AI-powered custom label generation.

---

## Source Code

* **GitHub repository:**
  [https://github.com/DusanMagula/jamminduoPayPallive](https://github.com/DusanMagula/jamminduoPayPallive)

---

## Live URLs

* **Production site:**
  [https://jamminduo-repli--noimage-pay-pallive--dmagula.replit.app/#products](https://jamminduo-repli--noimage-pay-pallive--dmagula.replit.app/#products)

* **Replit workspace (editor & deployment):**
  [https://replit.com/@dmagula/jamminduoPayPallive](https://replit.com/@dmagula/jamminduoPayPallive)

---

## Tech Stack

* **Frontend:** React + TypeScript (Vite)
* **Development environment:** Replit (browser-based IDE)
* **Payments:** PayPal JavaScript SDK
* **Hosting & Deployment:** Replit
* **State management:** Client-side React state only
* **Backend:** None (frontend-only)

---

## How the App Works

* The frontend was created and maintained in **Replit**, using React and modern frontend tooling.
* Products and prices are **hardcoded directly in the React application**.
* Users add items to a cart stored in client-side state.
* PayPal checkout is initiated using the PayPal JS SDK.
* Payments are processed entirely by PayPal.
* No order data is stored or persisted in the application.
* The PayPal merchant dashboard acts as the system of record for transactions.

---

## Running the App in Replit

1. Open the Replit workspace
2. Ensure required environment variables are set (see below)
3. Click **Run**
4. The app will be available in the Replit preview and via the deployed URL

> This project is designed to run primarily in Replit. Local development is possible but not the primary workflow for this version.

---

## Environment Variables

The following environment variables must be set in **Replit Secrets**:

* `VITE_PAYPAL_CLIENT_ID`
  PayPal Client ID used by the PayPal JavaScript SDK.

* `SESSION_SECRET`
  Session/signing secret used by the runtime.

> ⚠️ Secret values must not be committed to GitHub.
> Only variable names should appear in documentation or example files.

---

## Updating Products & Prices

Products and prices are currently **hardcoded in the frontend**.

* **File:** `client/src/App.tsx`
* **Location:** Products section (inline JSX)

Each product is defined directly in the component, including:

* Product ID
* Product name
* Displayed price text (e.g. `£5.49`)
* Price value passed to `addToCart()` via the button’s `onClick` handler

### To update products or prices:

1. Edit the relevant product `<div>` in `client/src/App.tsx`
2. Update:

   * The displayed price text
   * The price value passed to `addToCart()`
3. Save changes
4. Redeploy via Replit

> ⚠️ Always ensure the displayed price matches the value passed to PayPal.

---

## Known Limitations

This version of the site has several intentional limitations:

* No backend or server-side logic
* No database or order persistence
* No PayPal webhooks or server-side payment verification
* No inventory tracking
* No user accounts
* No admin interface

This setup is suitable for:

* Early-stage validation
* Low-volume sales
* Simple product offerings

---

## Roadmap (High-Level)

Planned future improvements include:

* Python backend (API)
* Database for orders and products
* AI-powered custom label generation
* Server-side payment verification
* Order history and admin tooling

Once these features are introduced, this frontend-only version will be **retired and replaced**.

---

## Project Status

✅ Live
⚠️ Frontend-only (Replit-based)
🔄 Backend & AI extension planned

---

## License

Private / internal project.
Not currently intended for open-source redistribution.
