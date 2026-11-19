# LIORA Hotel & Resort — coastal luxury demo

Open `index.html` in a browser, or serve this directory with `python -m http.server 8000`. No build tools are required.

The design follows the supplied Liora Dribbble screenshot: coastal blue, peach accents, editorial serif headings, photo-led composition and spacious layouts. All room rates, facilities, event halls, menus and testimonials are illustrative. The fictional brand and placeholder contact details are not real hotel information.

## Pages
Home, Rooms, Room Details, Dining, Experiences, Spa, Gym, Events, Booking, Contact, Login and Forgot Password.

## Demo behavior
Room availability and rates are deterministic local demo data; booking creates a local simulated confirmation, with mock Paystack-style payment, Pay Later 15-minute expiry, and printable receipt. Event booking only submits an enquiry. Contact and login forms only display simulated success. No production APIs, payments, email, authentication or databases.

## Future integrations
The JS separates room inventory, pricing, booking state and payment simulation. Replace these demo service functions with API clients and keep the page markup and styling. Validate all prices, inventory and payment status server-side in production.

## Images
Images are loaded from Unsplash CDN and require internet connectivity. Replace with licensed local hotel imagery before production.


### Latest refinements
- Reference-aligned luxury experience section and room search spacing.
- More padding for hero video callout.
- Detailed simulated payment receipt with guest, stay, itemised charges, reference IDs, and payment timestamp.
- Print Receipt uses a receipt-only A4 print stylesheet; open in browser and choose Print / Save as PDF.


Latest refinement: corrected overlapping architectural-image/booking-bar composition on the homepage and redesigned the final booking review guest-information panel.
