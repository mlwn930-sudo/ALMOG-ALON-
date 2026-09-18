/* =========================================================
   אלמוג אלון — תיק עבודות
   ---------------------------------------------------------
   ✏️  כל הפרטים שאפשר לערוך נמצאים בבלוק CONTACT שלמטה.
       זה המקום היחיד שצריך לגעת בו כדי לעדכן קישורים.
   ========================================================= */

const CONTACT = {
  // עמוד האינסטגרם
  instagram: 'https://www.instagram.com/almog.alonn',

  // מספר טלפון ישראלי, בדיוק כמו שמחייגים אותו בארץ.
  // ממנו נבנים גם כפתור החיוג וגם קישור הוואטסאפ.
  phone: '0544478819',

  // ההודעה שתופיע מוכנה בוואטסאפ
  whatsappText: 'היי אלמוג! ראיתי את תיק העבודות ואשמח לקבוע תור',

  // כתובת המספרה. ממנה נבנה גם הטקסט שמוצג וגם קישור הניווט ב-Waze.
  address: 'מתחם ביג פאשן גלילות, רמת השרון'
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

  /* ---------- טלפון: מקומי → בינלאומי → תצוגה ---------- */
  const digits = (CONTACT.phone || '').replace(/\D/g, '');
  // 0544478819 → 972544478819
  const intl = digits.startsWith('0') ? '972' + digits.slice(1) : digits;
  // 0544478819 → 054-447-8819
  const pretty = digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : CONTACT.phone;

  const wire = (sel, href, external) => {
    $$(sel).forEach(el => {
      if (!href) { el.hidden = true; return; }
      el.hidden = false;
      el.href = href;
      if (external) { el.target = '_blank'; el.rel = 'noopener'; }
    });
  };

  wire('[data-ig]', CONTACT.instagram, true);
  wire('[data-tel]', digits ? `tel:+${intl}` : '', false);
  wire('[data-wa]', digits ? `https://wa.me/${intl}?text=${encodeURIComponent(CONTACT.whatsappText)}` : '', true);
  wire('[data-waze]', CONTACT.address
    ? `https://www.waze.com/ul?q=${encodeURIComponent(CONTACT.address)}&navigate=yes` : '', true);

  $$('[data-tel-label]').forEach(el => { el.textContent = pretty; });
  $$('[data-addr]').forEach(el => { el.textContent = CONTACT.address; });

  /* ---------- ניווט: מצב גלילה, פס התקדמות, סרגל פעולה, חזרה למעלה ---------- */
  const nav = $('#nav');
  const bar = $('#progress');
  const toTop = $('#toTop');
  const actionbar = $('#actionbar');

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const past = y > window.innerHeight * 0.7;

    nav.classList.toggle('is-stuck', y > 40);
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (toTop) toTop.hidden = !past;
    if (actionbar) actionbar.classList.toggle('is-up', past);
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
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
      // מרוקנים ולא מסירים — src ריק לא מייצר בקשת רשת מיותרת
      lbImg.removeAttribute('src');
      lbImg.alt = '';
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

  /* ---------- פרלקס עדין על שתי היצירות ---------- */
  /* רק transform, רק ב-rAF, ורק כשהאלמנט במסך — אפס פריסה מחדש. */
  const floaters = $$('.poster');
  if (!reduced && floaters.length) {
    let raf = false;
    const move = () => {
      const vh = window.innerHeight;
      floaters.forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.bottom < -200 || b.top > vh + 200) return;
        const mid = b.top + b.height / 2;
        const shift = ((mid - vh / 2) / vh) * -26;   // מקסימום ±26px
        el.style.setProperty('--py', shift.toFixed(1) + 'px');
      });
      raf = false;
    };
    window.addEventListener('scroll', () => {
      if (!raf) { raf = true; requestAnimationFrame(move); }
    }, { passive: true });
    move();
  }

  /* ---------- הטיה תלת-ממדית של הקלף לפי העכבר ---------- */
  const stage = $('#stage');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (stage && fine && !reduced) {
    const REST_Y = -14, REST_X = 6;   // זווית המנוחה, זהה לברירת המחדל ב-CSS
    let tilting = false;

    stage.addEventListener('pointermove', e => {
      if (tilting) return;
      tilting = true;
      requestAnimationFrame(() => {
        const b = stage.getBoundingClientRect();
        const nx = (e.clientX - b.left) / b.width - 0.5;    // ‎-0.5..0.5
        const ny = (e.clientY - b.top) / b.height - 0.5;
        stage.style.setProperty('--ry', (REST_Y + nx * 26).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (REST_X - ny * 18).toFixed(2) + 'deg');
        tilting = false;
      });
    });

    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--ry', REST_Y + 'deg');
      stage.style.setProperty('--rx', REST_X + 'deg');
    });
  }

  /* ---------- שנה בפוטר ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
