// Central Mississippi Movers — interactions
// Load choreography, scroll reveals, magnetic CTAs, plate tilt,
// scroll progress, footer signature fitting, dynamic brand favicon.
// Every motion path is gated behind prefers-reduced-motion.

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const name = (document.body.dataset.name || '').trim();

  /* Load choreography — CSS stages everything off .is-loaded */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
  });

  /* Monogram — first letter of the business name on the hero plate */
  const monogram = document.querySelector('.plate-monogram');
  if (monogram && name) monogram.textContent = name.charAt(0);

  /* Dynamic favicon in the brand color */
  const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();
  if (brand && name) {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<rect width="64" height="64" rx="6" fill="${brand}"/>` +
      `<text x="32" y="44" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="38" fill="#faf7f2">${name.charAt(0)}</text>` +
      `</svg>`;
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    document.head.appendChild(link);
  }

  /* Header state + scroll progress hairline */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.progress span');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
      ticking = false;
    });
  };
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

  /* Magnetic buttons — lazy pull toward the cursor (desktop only) */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      const strength = 9;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* Plate tilt — quiet parallax, max ~2.5 degrees */
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        el.style.setProperty('--ry', `${x * 2.5}deg`);
        el.style.setProperty('--rx', `${-y * 2.5}deg`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* Footer signature — fit the business name to the page width */
  const mark = document.querySelector('.footer-mark span');
  if (mark) {
    const fit = () => {
      mark.style.fontSize = '';
      const parent = mark.parentElement;
      const cs = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const base = parseFloat(getComputedStyle(mark).fontSize);
      const scale = available / mark.offsetWidth;
      mark.style.fontSize = `${Math.max(2, base * scale)}px`;
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    else fit();
    window.addEventListener('resize', fit);
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
