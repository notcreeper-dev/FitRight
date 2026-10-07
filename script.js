(() => {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Active section + reveal ---------- */
  const links = [...nav.querySelectorAll('ul a')];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.toggleAttribute('aria-current', a.hash === '#' + entry.target.id));
        links.forEach((a) => { if (a.getAttribute('aria-current') === '') a.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); reveal.unobserve(en.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.steps li').forEach((el) => { el.classList.add('reveal'); reveal.observe(el); });
  }

  /* ---------- Service links preselect the appliance ---------- */
  const form = document.getElementById('service-form');
  const status = document.getElementById('form-status');
  document.querySelectorAll('[data-appliance]').forEach((a) => {
    a.addEventListener('click', () => { form.elements.appliance.value = a.dataset.appliance; });
  });

  /* ---------- Form validation ---------- */
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  form.elements.date.min = today.toISOString().slice(0, 10);

  const rules = {
    name: (v) => (v ? '' : 'Please enter your name.'),
    phone: (v) => (/^[+()\d\s.-]{7,20}$/.test(v) && (v.match(/\d/g) || []).length >= 7
      ? '' : 'Please enter a phone number with at least 7 digits.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address, like name@example.com.'),
    appliance: (v) => (v ? '' : 'Please choose the appliance that needs repair.'),
    problem: (v) => (v.length >= 5 ? '' : 'Please briefly describe the problem (at least 5 characters).'),
    date: (v) => {
      if (!v) return 'Please choose a preferred date.';
      return v < form.elements.date.min ? 'Please choose today or a later date.' : '';
    },
  };

  function validateField(name) {
    const field = form.elements[name];
    const message = rules[name](field.value.trim());
    const error = document.getElementById(name + '-error');
    error.textContent = message;
    error.classList.toggle('is-visible', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener('blur', () => validateField(name));
    form.elements[name].addEventListener('input', () => {
      if (form.elements[name].getAttribute('aria-invalid') === 'true') validateField(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('is-visible');
    status.textContent = '';
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    // Demo only: nothing is sent or stored.
    status.textContent = 'Thanks! Your service request has been prepared. This portfolio demo does not actually send it.';
    status.classList.add('is-visible');
    form.reset();
  });
})();
