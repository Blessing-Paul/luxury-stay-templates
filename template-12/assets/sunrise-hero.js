
(() => {
  const $ = id => document.getElementById(id);
  const hero = $('hero'), sun = $('sun'), sky = $('sky'), photo = $('photo'),
        tint = $('tint'), headline = $('headline'), hint = $('hint');

  /* 1. The sun travels along a curve (quadratic Bézier) in a 100x100 box.
        P0 = left horizon, P1 = control point (pulls the curve up), P2 = right horizon. */
  const P0 = [6, 80], P1 = [50, -20], P2 = [94, 80];
  const onArc = t => {
    const a = (1 - t) ** 2, b = 2 * (1 - t) * t, c = t * t;
    return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1]];
  };

  /* 2. Look of the light at key moments. t = 0 is 6am, t = 1 is 8pm.
        top/bot = sky gradient, tint = overlay on your photo, b/s = brightness/saturation. */
  const stops = [
    { t: 0,   top: [58,70,120],  bot: [255,183,140], tint: [255,160,110,.30], b: .85, s: .95 },
    { t: .3,  top: [90,160,220], bot: [255,236,200], tint: [255,235,200,.08], b: 1.1, s: 1.05 },
    { t: .5,  top: [60,140,225], bot: [170,215,245], tint: [190,225,255,.08], b: 1.2, s: 1.1 },
    { t: .75, top: [86,98,160],  bot: [255,168,84],  tint: [255,150,60,.28],  b: 1.0, s: 1.15 },
    { t: .9,  top: [36,48,96],   bot: [214,120,110], tint: [70,60,130,.22],   b: .92, s: 1.0 },
    { t: 1,   top: [14,24,52],   bot: [120,70,100],  tint: [20,25,70,.45],    b: .75, s: .9 }
  ];
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const rgb = a => `rgb(${a.slice(0, 3).map(Math.round)})`;
  function light(t) {                       // blend between the two nearest stops
    let i = 0;
    while (i < stops.length - 2 && t > stops[i + 1].t) i++;
    const A = stops[i], B = stops[i + 1];
    const k = Math.min(1, Math.max(0, (t - A.t) / (B.t - A.t)));
    return { top: mix(A.top, B.top, k), bot: mix(A.bot, B.bot, k), tint: mix(A.tint, B.tint, k),
             b: A.b + (B.b - A.b) * k, s: A.s + (B.s - A.s) * k };
  }
  const phaseName = t => t < .12 ? 'Sunrise' : t < .35 ? 'Morning' : t < .6 ? 'Midday'
                       : t < .78 ? 'Afternoon' : t < .92 ? 'Golden hour' : 'Dusk';
  function clock(t) {
    const h = 6 + t * 14, hr = Math.floor(h), m = Math.round((h - hr) * 60);
    const hh = m === 60 ? hr + 1 : hr, mm = m === 60 ? 0 : m;
    return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'pm' : 'am'}`;
  }

  /* 3. One function paints everything for a given t */
  let t = .05;
  function render(next) {
    t = Math.min(1, Math.max(0, next));
    const [x, y] = onArc(t), L = light(t);
    sun.style.left = x + '%'; sun.style.top = y + '%';
    sky.style.background = `linear-gradient(${rgb(L.top)}, ${rgb(L.bot)})`;
    photo.style.filter = `brightness(${L.b}) saturate(${L.s})`;
    tint.style.background = `rgba(${L.tint.slice(0, 3).map(Math.round)},${L.tint[3]})`;
    $('time').textContent = clock(t);
    $('phase').textContent = phaseName(t);
    sun.setAttribute('aria-valuenow', (6 + t * 14).toFixed(1));
    sun.setAttribute('aria-valuetext', `${clock(t)}, ${phaseName(t)}`);
    // Move the headline's light to where the sun is (in the headline's own pixels)
    const h = hero.getBoundingClientRect(), r = headline.getBoundingClientRect();
    headline.style.setProperty('--sx', (h.left + x / 100 * h.width - r.left) + 'px');
    headline.style.setProperty('--sy', (h.top + y / 100 * h.height - r.top) + 'px');
    headline.style.setProperty('--r', Math.max(h.width * .55, 360) + 'px');
  }

  /* 4. Intro: the sun rises into place once on load */
  let raf;
  const settle = to => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return render(to);
    const from = t, t0 = performance.now(), dur = 2600;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3;   // ease-out
      render(from + (to - from) * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  render(.05); settle(.88);

  /* 5. Dragging: pointer x along the hero becomes t */
  const touched = () => { cancelAnimationFrame(raf); sun.classList.remove('nudge'); hint.classList.add('gone'); };
  const fromPointer = e => {
    const h = hero.getBoundingClientRect();
    const pct = (e.clientX - h.left) / h.width * 100;
    render((pct - P0[0]) / (P2[0] - P0[0]));
  };
  sun.addEventListener('pointerdown', e => { touched(); sun.setPointerCapture(e.pointerId); fromPointer(e); });
  sun.addEventListener('pointermove', e => { if (sun.hasPointerCapture(e.pointerId)) fromPointer(e); });

  /* 6. Keyboard: arrows nudge, Home/End jump to sunrise/dusk */
  sun.addEventListener('keydown', e => {
    const keys = { ArrowRight: .03, ArrowUp: .03, ArrowLeft: -.03, ArrowDown: -.03 };
    if (e.key in keys) { e.preventDefault(); touched(); render(t + keys[e.key]); }
    if (e.key === 'Home') { e.preventDefault(); touched(); render(0); }
    if (e.key === 'End')  { e.preventDefault(); touched(); render(1); }
  });
  addEventListener('resize', () => render(t));
})();

  const searchForm=document.getElementById('book');
  searchForm?.addEventListener('submit', e=>{ e.preventDefault(); const data=new FormData(searchForm); const arrive=data.get('arrive'), depart=data.get('depart'); if(depart<=arrive){searchForm.querySelector('[name="depart"]').setCustomValidity('Departure must be after arrival');searchForm.reportValidity();return;} const guests=parseInt(data.get('guests'),10)||2; location.href='booking.html?checkin='+encodeURIComponent(arrive)+'&checkout='+encodeURIComponent(depart)+'&adults='+guests; });
  searchForm?.querySelector('[name="depart"]')?.addEventListener('input',e=>e.target.setCustomValidity(''));
