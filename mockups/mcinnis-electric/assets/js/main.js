// McInnis Electric — interactions
// Reveal choreography, header state, magnetic CTA, mobile call bar.
// Every motion path is gated behind prefers-reduced-motion.

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* Hero entrance — staged line reveals (CSS keys off .is-loaded) */
  requestAnimationFrame(() => {
    document.documentElement.classList.add('is-loaded');
  });

  /* Monogram — first letter of the business name on the hero plate */
  const monogram = document.querySelector('.plate-monogram');
  const name = document.body.dataset.name || '';
  if (monogram && name) monogram.textContent = name.trim().charAt(0);

  /* Header — compact + frosted once scrolled */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Scroll reveals */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  }

  /* Magnetic buttons — subtle pull toward the cursor (desktop only) */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      const strength = 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* Mobile call bar — step aside while the contact section is on screen */
  const callBar = document.querySelector('.call-bar');
  const contact = document.getElementById('contact');
  if (callBar && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      callBar.classList.toggle('is-hidden', entry.isIntersecting);
    }, { threshold: 0.2 }).observe(contact);
  }
})();
