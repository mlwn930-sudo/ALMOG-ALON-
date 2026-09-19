/* =========================================================
   אלמוג אלון — תיק עבודות
   ---------------------------------------------------------
   ✏️  כל הפרטים שאפשר לערוך נמצאים בבלוק CONTACT שלמטה.
       זה המקום היחיד שצריך לגעת בו כדי לעדכן קישורים.
   ========================================================= */

const CONTACT = {
  // אפליקציית התורים של מספרת שניר ומאיר — הדרך היחידה לקבוע תור.
  // הקישורים נשלפו מ-https://tinyurl.com/SNIRMEIR כדי שהלקוח יגיע ישר לחנות
  // במקום לעבור דרך דף ביניים.
  appStore:   'https://apps.apple.com/il/app/id1510003184',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.easytor.snirmeir',

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

  const wire = (sel, href, external) => {
    $$(sel).forEach(el => {
      if (!href) { el.hidden = true; return; }
      el.hidden = false;
      el.href = href;
      if (external) { el.target = '_blank'; el.rel = 'noopener'; }
    });
  };

  // רק בכרטיס שלמטה יוצאים החוצה אל החנויות. כל שאר כפתורי "קביעת תור"
  // מפנים אל הכרטיס עצמו (href="#booking" שכבר ב-HTML) ולא לשום מקום אחר.
  wire('[data-ios]', CONTACT.appStore, true);
  wire('[data-android]', CONTACT.googlePlay, true);
  wire('[data-waze]', CONTACT.address
    ? `https://www.waze.com/ul?q=${encodeURIComponent(CONTACT.address)}&navigate=yes` : '', true);

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

  /* ---------- ניווט: סימון המקטע שבו נמצאים ---------- */
  const spyLinks = $$('.nav__links a[href^="#"]:not(.btn)');
  const spyTargets = spyLinks
    .map(a => ({ a, sec: $(a.getAttribute('href')) }))
    .filter(t => t.sec);

  if (spyTargets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const hit = spyTargets.find(t => t.sec === e.target);
        if (hit) hit.a.classList.toggle('is-here', e.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    spyTargets.forEach(t => spy.observe(t.sec));
  }

  /* ---------- סינון עבודות ---------- */
  const cards = $$('.card');

  // כמה עבודות בכל קטגוריה — נכתב לצ'יפים כדי שלא יצטרכו לנחש
  $$('.chip').forEach(chip => {
    const f = chip.dataset.filter;
    const n = f === 'all'
      ? cards.length
      : cards.filter(c => (c.dataset.tags || '').split(' ').includes(f)).length;
    chip.dataset.count = n;
  });

  /* מספור לפי הסדר שבו העין פוגשת את הכרטיסים על המסך.
     בפריסת טורים סדר ה-DOM שונה מהסדר הוויזואלי, אז מודדים בפועל. */
  const renumber = () => {
    const rtl = getComputedStyle(document.documentElement).direction === 'rtl';
    cards
      .filter(c => !c.hidden)
      .map(c => {
        const b = c.getBoundingClientRect();
        // בפריסת טורים אין "שורות", אז ממיינים לפי הגובה בפועל
        // ומשתמשים ב-x רק כשוברי שוויון (ראש הטורים).
        return { c, top: Math.round(b.top), x: b.left };
      })
      .sort((a, b) => (a.top - b.top) || (rtl ? b.x - a.x : a.x - b.x))
      .forEach((it, i) => {
        $('.card__btn', it.c).dataset.n = String(i + 1).padStart(2, '0');
      });
  };

  // setTimeout ולא requestAnimationFrame: בלשונית מוסתרת rAF נעצר,
  // והמספור היה נשאר תקוע על פריסה ישנה.
  let numTimer = 0;
  const queueRenumber = () => {
    clearTimeout(numTimer);
    numTimer = setTimeout(renumber, 80);
  };

  renumber();
  window.addEventListener('resize', queueRenumber, { passive: true });
  window.addEventListener('load', queueRenumber);

  // כל תמונה שנטענת משנה את גובה הטור ואיתו את הסדר הוויזואלי.
  // ResizeObserver על הרשת תופס כל שינוי כזה, כולל טעינה עצלה.
  const grid = $('#worksGrid');
  if (grid && 'ResizeObserver' in window) {
    new ResizeObserver(queueRenumber).observe(grid);
  }
  $$('.card img').forEach(img => {
    if (!img.complete) img.addEventListener('load', queueRenumber, { once: true });
  });

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

      renumber();
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

    buildThumbs(list);
  };

  /* רצועת תמונות ממוזערות — קפיצה ישירה בלי ללחוץ "הבא" שבע פעמים */
  const lbThumbs = $('#lbThumbs');
  let thumbsKey = '';

  const buildThumbs = list => {
    const key = list.map(it => it.src).join('|');
    if (key !== thumbsKey) {
      thumbsKey = key;
      lbThumbs.innerHTML = '';
      list.forEach((it, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'lightbox__thumb';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `עבודה ${i + 1}`);
        b.innerHTML = `<img src="${it.src}" alt="" loading="lazy" decoding="async">`;
        b.addEventListener('click', () => render(i));
        lbThumbs.appendChild(b);
      });
    }
    $$('.lightbox__thumb', lbThumbs).forEach((b, i) => {
      const on = i === current;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
      if (on) b.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
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

  /* ---------- שיתוף התיק ---------- */
  const shareBtn = $('#shareBtn');
  if (shareBtn) {
    const url = location.href.split('#')[0];
    const label = $('strong', shareBtn);
    const original = label ? label.textContent : '';

    const flash = txt => {
      if (!label) return;
      label.textContent = txt;
      setTimeout(() => { label.textContent = original; }, 2200);
    };

    shareBtn.addEventListener('click', async () => {
      const data = {
        title: 'אלמוג אלון · ספר — תיק עבודות',
        text: 'תיק העבודות של אלמוג אלון, ספר במספרת שניר ומאיר',
        url
      };
      // בנייד נפתחת תפריט השיתוף של המכשיר; במחשב מעתיקים ללוח
      if (navigator.share) {
        try { await navigator.share(data); return; }
        catch { return; }               // המשתמש ביטל — לא עושים כלום
      }
      try {
        await navigator.clipboard.writeText(url);
        flash('הקישור הועתק ✓');
      } catch {
        flash(url);
      }
    });
  }

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

  /* ---------- רשת ביטחון לתמונות ---------- */
  /* ב-iOS Safari תמונה בתוך פריסת טורים יכולה "להיתקע" בלי להיטען,
     והכרטיס נראה ריק. בודקים אחרי הטעינה ומאלצים משיכה מחדש. */
  const rescueImages = () => {
    $$('img').forEach(img => {
      if (img.complete && img.naturalWidth > 0) return;
      const src = img.getAttribute('src');
      if (!src) return;
      img.removeAttribute('loading');
      img.src = src;                       // השמה מחדש מפעילה משיכה
    });
  };
  window.addEventListener('load', () => setTimeout(rescueImages, 1200));
  setTimeout(rescueImages, 4000);

  /* ---------- שנה בפוטר ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
