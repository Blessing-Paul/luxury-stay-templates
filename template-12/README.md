# SOLSTICE CLUB — Hotel Demo Template

A standalone, original boutique hotel website built with HTML, CSS, and vanilla JavaScript.

## Start
Open `index.html` in a browser. Images and Google Fonts load over the internet.

## Pages
Home, Rooms, Room Details, Dining, Experiences, Spa, Gym, Events, Booking, Contact, Login, Forgot Password.

## Demo functionality
Mock availability, multi-room quantity selection, guest details, review, confirmation, simulated Paystack-style payment, 15-minute Pay Later expiry, itemized printable receipt, event enquiries, contact and authentication. No real API, email, database, payment processor or customer data.

## Structure
`assets/data.js` contains room and hall demo data. `assets/app.js` contains simulated interactions. `assets/style.css` contains the visual system with editable CSS variables. Replace these with dedicated production services when implementing a real backend.

## Limitations
Images are external Unsplash placeholders. All hotel claims, rooms, prices and facilities are fictional. Test browser printing and mobile interactions before deployment.

REFINED VERSION: Corrected desktop hero to a true two-column split, image on right; removed horizontal overflow; introduced softer hotel-appropriate palette and lighter typography across pages.


Latest visual update: homepage uses reference-inspired half-ivory/half-photographic editorial hero; room and experience cards use photographic glass overlays. All imagery is placeholder photography.


Hero fidelity: `sunpath-hero.html` is the user-supplied standalone HTML/CSS/JS, kept in an isolated iframe to prevent site-wide CSS or JS overriding the animation, layout, fonts, or controls. Only the hero image URL, navigation destinations and booking form destination were connected to the demo.
