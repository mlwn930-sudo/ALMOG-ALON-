/* =========================================================
   אלמוג אלון — תיק עבודות
   ---------------------------------------------------------
   ✏️  כל הפרטים שאפשר לערוך נמצאים בבלוק CONTACT שלמטה.
       זה המקום היחיד שצריך לגעת בו כדי לעדכן קישורים.
   ========================================================= */

const CONTACT = {
  // עמוד האינסטגרם
  instagram: 'https://www.instagram.com/almog.alonn/',

  // מספר וואטסאפ בפורמט בינלאומי, בלי 0 בהתחלה ובלי סימנים.
  // דוגמה: '972501234567'.  השאר ריק ('') והכפתור פשוט לא יופיע.
  whatsapp: '',

  // ההודעה שתופיע מוכנה בוואטסאפ
  whatsappText: 'היי אלמוג! ראיתי את תיק העבודות ואשמח לקבוע תור'
};

/* --------------------------------------------------------- */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- מסך פתיחה ---------- */
  const preloader = $('#preloader');
  const hidePreloader = () => preloader && preloader.classList.add('is-done');
  window.addEventListener('load', () => setTimeout(hidePreloader, reduced ? 0 : 450));
  setTimeout(hidePreloader, 3000); // רשת איטית — לא נתקעים

  /* ---------- קישורי יצירת קשר ---------- */
  $$('[data-ig]').forEach(el => {
    el.href = CONTACT.instagram;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  const wa = CONTACT.whatsapp.replace(/\D/g, '');
  $$('[data-wa]').forEach(el => {
    if (!wa) { el.hidden = true; return; }
    el.hidden = false;
    el.href = `https://wa.me/${wa}?text=${encodeURIComponent(CONTACT.whatsappText)}`;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  /* ---------- ניווט: מצב גלילה, פס התקדמות, חזרה למעלה ---------- */
  const nav = $('#nav');
  const bar = $('#progress');
  const toTop = $('#toTop');

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle('is-stuck', y > 40);
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (toTop) toTop.hidden = y < window.innerHeight * 0.8;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  toTop && toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- תפריט נייד ---------- */
  const burger = $('#burger');
  const menu = $('#menu');

  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('is-locked', open);
  };

  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- חשיפה בגלילה ---------- */
  const revealEls = $$('.reveal');
  revealEls.forEach(el => {
    if (el.dataset.d) el.style.setProperty('--d', el.dataset.d);
  });

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- סינון עבודות ---------- */
  const cards = $$('.card');

  $$('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;

      $$('.chip').forEach(c => {
        const on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-selected', String(on));
      });

      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(' ');
        card.hidden = !(f === 'all' || tags.includes(f));
      });
    });
  });

  /* ---------- מסך מלא לתמונה ---------- */
  const lb      = $('#lightbox');
  const lbImg   = $('#lbImg');
  const lbCap   = $('#lbCap');
  const lbCount = $('#lbCount');
  const lbClose = $('#lbClose');

  const items = cards.map(card => {
    const img = $('img', card);
    const cap = $('figcaption', card);
    let text = '';
    if (cap) {
      const clone = cap.cloneNode(true);       // בלי תווית הקטגוריה
      const tag = $('.card__tag', clone);
      if (tag) tag.remove();
      text = clone.textContent.replace(/\s+/g, ' ').trim();
    }
    return {
      card,
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      cap: text
    };
  });

  let current = 0;
  let lastFocus = null;

  const visible = () => items.filter(it => !it.card.hidden);

  const render = i => {
    const list = visible();
    if (!list.length) return;
    const total = list.length;
    current = (i + total) % total;
    const it = list[current];

    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.textContent = it.cap;
    lbCount.textContent = `${current + 1} / ${total}`;

    const one = total < 2;
    $('#lbPrev').hidden = one;
    $('#lbNext').hidden = one;
  };

  const openLb = card => {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('is-locked');
    render(visible().indexOf(items.find(it => it.card === card)));
    requestAnimationFrame(() => lb.classList.add('is-open'));
    lbClose.focus();
  };

  const closeLb = () => {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => {
      lb.hidden = true;
      lbImg.removeAttribute('src');
      lastFocus && lastFocus.focus();
    }, reduced ? 0 : 280);
  };

  cards.forEach(card => {
    $('.card__btn', card).addEventListener('click', () => openLb(card));
  });

  lbClose.addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => render(current - 1));
  $('#lbNext').addEventListener('click', () => render(current + 1));

  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    // ב-RTL החץ ימינה מוביל אחורה
    if (e.key === 'ArrowRight') render(current - 1);
    if (e.key === 'ArrowLeft')  render(current + 1);
    if (e.key === 'Tab') {
      const f = $$('button:not([hidden])', lb);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // החלקה באצבע
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) render(current + (dx > 0 ? -1 : 1));
    x0 = null;
  }, { passive: true });

  /* ---------- העתקת הקישור ---------- */
  const copyBtn = $('#copyLink');
  copyBtn && copyBtn.addEventListener('click', async () => {
    const original = copyBtn.textContent;
    try {
      await navigator.clipboard.writeText(location.href.split('#')[0]);
      copyBtn.textContent = 'הקישור הועתק ✓';
    } catch {
      copyBtn.textContent = location.href.split('#')[0];
    }
    setTimeout(() => { copyBtn.textContent = original; }, 2200);
  });

  /* ---------- שנה בפוטר ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
