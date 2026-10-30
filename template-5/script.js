const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const sideMenu = document.querySelector("#side-menu");
const menuBackdrop = document.querySelector(".menu-backdrop");

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  sideMenu.classList.toggle("is-open", isOpen);
  sideMenu.setAttribute("aria-hidden", String(!isOpen));
  sideMenu.inert = !isOpen;
  menuBackdrop.classList.toggle("is-visible", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  if (isOpen) menuClose.focus();
  else menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});
menuClose.addEventListener("click", () => setMenuOpen(false));
menuBackdrop.addEventListener("click", () => setMenuOpen(false));
sideMenu.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
  }
});

const heroSlides = [...document.querySelectorAll(".hero-slide")];
const heroVideos = heroSlides.map((slide) => slide.querySelector(".hero-video"));
const heroRunway = document.querySelector(".hero-runway");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let heroSlidePositions = [];
let activeHeroIndex = -1;
let heroUpdatePending = false;

function updateHeroPlayback() {
  if (reducedMotion.matches) {
    heroVideos.forEach((video) => video?.pause());
    activeHeroIndex = -1;
    return;
  }

  const viewportCenter = window.scrollY + window.innerHeight / 2;
  let nextActiveIndex = -1;

  heroSlidePositions.forEach((position, index) => {
    if (viewportCenter >= position) nextActiveIndex = index;
  });

  if (nextActiveIndex === heroSlides.length - 1
      && viewportCenter >= heroSlidePositions[nextActiveIndex] + window.innerHeight) {
    nextActiveIndex = -1;
  }
  if (nextActiveIndex === activeHeroIndex) return;

  activeHeroIndex = nextActiveIndex;
  heroVideos.forEach((video, index) => {
    if (!video) return;
    if (index !== activeHeroIndex) {
      video.pause();
      return;
    }
    video.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.warn("Aster House hero video could not start.", error);
      }
    });
  });
}

function cacheHeroPositions() {
  if (!heroRunway) return;
  const runwayTop = window.scrollY + heroRunway.getBoundingClientRect().top;
  const slideHeight = heroSlides[0]?.offsetHeight || window.innerHeight;
  heroSlidePositions = heroSlides.map((_, index) => runwayTop + slideHeight * index);
  updateHeroPlayback();
}

window.addEventListener("scroll", () => {
  if (heroUpdatePending) return;
  heroUpdatePending = true;
  window.requestAnimationFrame(() => {
    updateHeroPlayback();
    heroUpdatePending = false;
  });
}, { passive: true });
window.addEventListener("resize", cacheHeroPositions);
cacheHeroPositions();

const revealElements = document.querySelectorAll(
  ".intro-copy, .intro-image-wrap, .intro-proof, .offer-heading, .host-photo, .host-details, .gallery-heading, .values-heading, .value-card, .booking-image, .booking-copy, .contact-copy, .contact-actions, .detail-story-copy, .detail-story-image, .detail-feature",
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const quickBooking = document.querySelector("#quick-booking");
if (quickBooking) {
  const arrivalInput = quickBooking.elements.arrival;
  const departureInput = quickBooking.elements.departure;
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  arrivalInput.min = today;
  departureInput.min = today;

  arrivalInput.addEventListener("change", () => {
    departureInput.min = arrivalInput.value || today;
    if (departureInput.value && departureInput.value <= arrivalInput.value) departureInput.value = "";
  });

  quickBooking.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!quickBooking.reportValidity()) return;
    if (departureInput.value <= arrivalInput.value) {
      departureInput.focus();
      return;
    }
    const bookingUrl = new URL("booking.html", window.location.href);
    bookingUrl.searchParams.set("arrival", arrivalInput.value);
    bookingUrl.searchParams.set("departure", departureInput.value);
    bookingUrl.searchParams.set("adults", quickBooking.elements.adults.value);
    window.location.assign(bookingUrl);
  });
}

const stayRequest = document.querySelector("#stay-request");
if (stayRequest) {
  const arrivalInput = stayRequest.elements.arrival;
  const departureInput = stayRequest.elements.departure;
  const stayLength = document.querySelector("#stay-length");
  const feedback = document.querySelector("#stay-request-feedback");
  const emailLink = document.querySelector("#stay-request-email");
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const bookingParams = new URLSearchParams(window.location.search);

  arrivalInput.min = today;
  departureInput.min = today;
  ["arrival", "departure", "adults", "children", "rooms"].forEach((name) => {
    const value = bookingParams.get(name);
    const field = stayRequest.elements[name];
    if (value && field) field.value = value;
  });

  function updateStayLength() {
    departureInput.min = arrivalInput.value || today;
    if (arrivalInput.value && departureInput.value && departureInput.value <= arrivalInput.value) {
      departureInput.value = "";
    }
    if (!arrivalInput.value || !departureInput.value) {
      stayLength.textContent = "Choose your arrival and departure to see length of stay.";
      return;
    }
    const arrival = new Date(`${arrivalInput.value}T12:00:00`);
    const departure = new Date(`${departureInput.value}T12:00:00`);
    const nights = Math.round((departure - arrival) / 86400000);
    stayLength.textContent = `${nights} ${nights === 1 ? "night" : "nights"} in the house`;
  }

  arrivalInput.addEventListener("change", updateStayLength);
  departureInput.addEventListener("change", updateStayLength);
  updateStayLength();

  stayRequest.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!stayRequest.reportValidity()) return;
    if (departureInput.value <= arrivalInput.value) {
      feedback.textContent = "Choose a departure date after your arrival.";
      departureInput.focus();
      return;
    }

    const formData = new FormData(stayRequest);
    const arrival = new Date(`${arrivalInput.value}T12:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const departure = new Date(`${departureInput.value}T12:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const body = [
      `Name: ${formData.get("guestName")}`,
      `Email: ${formData.get("email")}`,
      `Arrival: ${arrival}`,
      `Departure: ${departure}`,
      `Length of stay: ${stayLength.textContent}`,
      `Adults: ${formData.get("adults")}`,
      `Children: ${formData.get("children")}`,
      `Rooms: ${formData.get("rooms")}`,
      `Additional details: ${formData.get("message") || "None"}`,
    ].join("\n");
    const subject = "A stay enquiry for Aster House";
    emailLink.href = `mailto:hello@asterhouse.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    emailLink.hidden = false;
    feedback.textContent = "Your enquiry is ready. Select the email link below to send it to the house.";
  });
}
