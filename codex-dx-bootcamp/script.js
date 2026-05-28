/* Codex DX加速ブートキャンプ  script.js */

(() => {
  // ===== Reveal on scroll =====
  const revealTargets = document.querySelectorAll(
    '.section-head, .problem-card, .feature-row, .curri-block, .price-card, .bonus-card, .voice-card, .guarantee-card, .founder-card, .flow-list li, .faq-item, .final-card, .vision-card, .service-visual, .compare-wrap, .notes-list, .hero-codecard, .commit-chapter, .commit-intro, .commit-outro'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach(el => io.observe(el));

  // ===== Side form: highlight when target of mobile CTA =====
  const sideForm = document.getElementById('contact');
  document.querySelectorAll('a[href="#contact"]').forEach(a => {
    a.addEventListener('click', e => {
      // On wide screens the form is already visible (sticky). Just pulse it.
      if (window.innerWidth > 1024 && sideForm) {
        e.preventDefault();
        sideForm.animate(
          [
            { transform: 'translateY(0)', boxShadow: '0 30px 70px rgba(0,10,30,.55)' },
            { transform: 'translateY(-6px)', boxShadow: '0 36px 90px rgba(34,211,238,.45)' },
            { transform: 'translateY(0)', boxShadow: '0 30px 70px rgba(0,10,30,.55)' },
          ],
          { duration: 700, easing: 'ease-out' }
        );
        const firstInput = sideForm.querySelector('input,select,textarea');
        if (firstInput) firstInput.focus({ preventScroll: true });
      }
    });
  });

  // ===== Form submit (demo) =====
  const form = document.getElementById('consult-form');
  const successBox = document.getElementById('form-success');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Basic native validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Demo: capture and switch to success view
      const submitBtn = form.querySelector('button[type=submit]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中…';
      }

      // Simulate request
      setTimeout(() => {
        form.hidden = true;
        if (successBox) successBox.hidden = false;
      }, 600);
    });
  }

  // ===== VOICE Carousel =====
  const carousel = document.querySelector('.voice-carousel');
  if (carousel) {
    const track = carousel.querySelector('.voice-track');
    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dotsBox = carousel.querySelector('.carousel-dots');
    const cards = Array.from(track.children);

    const stepWidth = () => {
      const card = track.firstElementChild;
      if (!card) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card.offsetWidth + gap;
    };
    const visibleCount = () => {
      return Math.max(1, Math.round(track.clientWidth / stepWidth()));
    };

    prev.addEventListener('click', () => track.scrollBy({ left: -stepWidth(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: stepWidth(), behavior: 'smooth' }));

    // Dots: 1 dot per "page" (visibleCount で割った数)
    function buildDots() {
      dotsBox.innerHTML = '';
      const pages = Math.max(1, cards.length - visibleCount() + 1);
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `${i + 1}件目から表示`);
        dot.addEventListener('click', () => {
          track.scrollTo({ left: stepWidth() * i, behavior: 'smooth' });
        });
        dotsBox.appendChild(dot);
      }
    }

    function syncUI() {
      const idx = Math.round(track.scrollLeft / stepWidth());
      Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('active', i === idx));
      const maxScroll = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll;
    }

    buildDots();
    syncUI();

    track.addEventListener('scroll', syncUI, { passive: true });
    window.addEventListener('resize', () => {
      buildDots();
      syncUI();
    });
  }

  // ===== Smooth-scroll for in-page anchors (header offset) =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    a.addEventListener('click', e => {
      const target = document.querySelector(id);
      if (!target) return;
      // On desktop, `#contact` is handled above (pulse). Skip scroll for it.
      if (id === '#contact' && window.innerWidth > 1024) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
