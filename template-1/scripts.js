document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".web-navbar");
  if (navbar) {
    const updateNavbar = function () {
      navbar.classList.toggle("web-navbar-scrolled", window.scrollY > 40);
    };
    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
  }

  // Sections marked .js-bg-order simply alternate between the two page backgrounds,
  // so neighbouring sections never jump to unrelated colors.
  document.querySelectorAll(".js-bg-order").forEach(function (section, index) {
    section.classList.add(index % 2 === 0 ? "web-section-bg-light" : "web-section-bg-soft");
  });

  const heroVideo = document.querySelector(".web-hero-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) heroVideo.pause();

  // Hero availability bar: sensible date limits, then hand the dates to the booking page.
  const bar = document.querySelector(".web-booking-bar");
  if (bar) {
    const arrival = bar.elements.arrival;
    const departure = bar.elements.departure;
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date());
    arrival.min = departure.min = today;
    arrival.addEventListener("change", function () {
      if (!arrival.value) return;
      const next = new Date(Date.parse(arrival.value) + 86400000).toISOString().slice(0, 10);
      departure.min = next;
      if (departure.value && departure.value < next) departure.value = next;
    });
  }

  const roomEntries = document.querySelectorAll(".web-room-entry");
  if (roomEntries.length) {
    const openLinkedRoom = function () {
      const entry = [...roomEntries].find(room => "#" + room.id === window.location.hash);
      if (entry) entry.open = true;
    };
    openLinkedRoom();
    window.addEventListener("hashchange", openLinkedRoom);
  }

  const enquiry = document.querySelector("#enquiry-form");
  enquiry?.addEventListener("submit", function (event) {
    event.preventDefault();
    const fields = new FormData(enquiry);
    const body = [fields.get("message"), "", fields.get("name"), fields.get("email"), fields.get("phone")].join("\n");
    window.location.href = "mailto:reservations@serenestay.com?subject=" +
      encodeURIComponent(fields.get("topic") + " enquiry") + "&body=" + encodeURIComponent(body);
  });
});
