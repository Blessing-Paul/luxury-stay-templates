# Serenity — reference-led hotel website demo

Open `index.html` in a browser. This is a multi-page static HTML/CSS/JavaScript demonstration based on the uploaded Serenity desktop/mobile screenshot. Images are remote Unsplash placeholders and require internet access.

## Pages
Home, Rooms, Room Details, Offers, Services, Dining, Spa, Gym, Events, Booking, Contact, Login, Forgot Password.

## Demo only
All room inventory, prices, venues, forms, booking confirmation, payments and Pay Later links are simulated in browser memory. Nothing is sent or charged. The printable receipt is a sample and explicitly marked as such.

## Architecture
`assets/style.css` controls layout; `assets/app.js` contains client-side demo interactions and sample booking state. Replace mock data/functions with API adapters for production.

## Limitations
Reference screenshot is narrow, so exact font identification and source photography cannot be confirmed. DM Sans is a close geometric sans-serif approximation. This build has not been visually verified in a browser.

## Full-width layout correction
The website is now edge-to-edge rather than a centered framed mockup. The homepage hero fills the viewport width and 100svh height, with a 100vh fallback. On smaller screens, the hero remains full viewport and the mobile layout follows the supplied reference. The inner content sections retain centered readable content widths.


## Refinement update
- Home navigation: Rooms, Experience, Booking, and animated hamburger toggle.
- Removed the separate Offers page; the former photographic offers collection now showcases room types.
- Extended internal-page heroes and applied subtle background treatments with CSS variables.
- Dark translucent blur navigation drawer with animated entrance and exit; smoothly animated FAQ accordions.
- Mock booking/payment functionality remains unchanged.
