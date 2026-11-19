# Nelson Hotel — original design, enhanced demo

This project is based directly on the uploaded Nelson Hotel ZIP. Its original CSS, original home, dining and events visual direction are retained and extended.

Open `index.html` in a browser, or serve the folder with `python -m http.server 8000`.

## Demo mode
All room inventory, prices, hall information, bookings, confirmations, Paystack-style checkout, receipts, Pay Later expiry, contact, login and password reset are simulated locally in JavaScript. Nothing is sent to a server. The 15-minute Pay Later timer runs in the open page only and does not represent a real emailed payment link. No customer records are stored.

Room and hall data live in `js/demo.js`. The presentation is in `css/style.css` and the original HTML files. To move to production, extract demo data and booking/payment/authentication handlers into API service modules and replace the simulation with server-side booking, pricing, inventory, payment verification and authenticated sessions. Do not treat client-side demo totals or statuses as authoritative.

Images use remote Unsplash placeholder URLs and fonts use Google Fonts. Replace with licensed, approved hotel photography and self-hosted assets before production. Spa and gym and hall offerings are illustrative because the original ZIP does not verify those facilities. Contact information is deliberately not invented.
