// Height animation for native details; keeps keyboard and summary semantics.
document.querySelectorAll('.web-room-entry').forEach(details => {
  const summary = details.querySelector('summary');
  const body = details.querySelector('.web-room-entry-body');
  if (!summary || !body) return;
  let animation;
  summary.addEventListener('click', event => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    animation?.cancel();
    const opening = !details.open;
    const start = details.getBoundingClientRect().height;
    if (opening) details.open = true;
    const end = summary.getBoundingClientRect().height + (opening ? body.scrollHeight : 0);
    details.style.overflow = 'hidden';
    animation = details.animate([{height: start+'px'}, {height: end+'px'}], {duration: 380, easing: 'cubic-bezier(.2,.75,.2,1)'});
    body.animate([{opacity: opening ? 0 : 1, transform: opening ? 'translateY(-12px)' : 'translateY(0)'},{opacity: opening ? 1 : 0,transform: opening ? 'translateY(0)' : 'translateY(-12px)'}], {duration: 300,easing:'ease-out'});
    animation.onfinish = () => { if (!opening) details.open = false; details.style.overflow=''; animation=null; };
    animation.oncancel = () => {details.style.overflow='';};
  });
});
