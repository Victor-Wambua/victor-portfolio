'use strict';

const SITE_NAME = 'Victor Wambua';
const BASE_TITLE = 'Victor Wambua | Technology, Education & Digital Transformation Leader';
const CONTACT_EMAIL = 'victorwambua004@gmail.com';

const pages = Array.from(document.querySelectorAll('[data-page]'));
const routes = new Set(pages.map(function (page) { return page.dataset.page; }));
const navLinks = Array.from(document.querySelectorAll('.site-nav [data-route]'));
const menuBtn = document.querySelector('.menu-btn');
const siteNav = document.querySelector('#site-nav');
const desktopNav = window.matchMedia('(min-width: 720px)');

const routeLabels = {};
navLinks.forEach(function (link) { routeLabels[link.dataset.route] = link.textContent.trim(); });



/* mobile menu */

function setMenu(open) {
  siteNav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
}

if (menuBtn && siteNav) {
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuBtn.focus();
    }
  });

  document.addEventListener('click', function (event) {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen && !siteNav.contains(event.target) && !menuBtn.contains(event.target)) setMenu(false);
  });

  desktopNav.addEventListener('change', function () { setMenu(false); });
}



/* profile contact details (collapsed on small screens) */

const profile = document.querySelector('.profile');
const profileToggle = document.querySelector('.profile__toggle');

if (profile && profileToggle) {
  profileToggle.addEventListener('click', function () {
    const open = profile.classList.toggle('is-open');
    profileToggle.setAttribute('aria-expanded', String(open));
  });
}



/* sections: each is a real link (#about, #experience, ...) so they can be shared and the back button works */

function showPage(name, moveFocus) {
  pages.forEach(function (page) {
    page.classList.toggle('is-active', page.dataset.page === name);
  });

  navLinks.forEach(function (link) {
    if (link.dataset.route === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  document.title = name === 'about' ? BASE_TITLE : routeLabels[name] + ' | ' + SITE_NAME;

  window.scrollTo(0, 0);

  if (moveFocus) {
    const title = document.querySelector('[data-page="' + name + '"] .page-title');
    if (title) title.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', function () {
  const name = window.location.hash.slice(1);
  if (!routes.has(name)) return;
  setMenu(false);
  showPage(name, true);
});

const initialRoute = window.location.hash.slice(1);
showPage(routes.has(initialRoute) ? initialRoute : 'about', false);



/* contact form: validate on submit, then on blur; say what to do; clear errors as soon as they are fixed.
   The site has no backend, so a valid message opens the visitor's email app with the text pre-filled. */

const form = document.querySelector('[data-form]');

if (form) {
  const summary = form.querySelector('[data-form-summary]');
  const status = form.querySelector('[data-form-status]');
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    fullname: function (value) {
      return value.trim() ? '' : 'Enter your full name.';
    },
    email: function (value) {
      return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter an email address like name@example.com.';
    },
    message: function (value) {
      return value.trim().length >= 20 ? '' : 'Write a message of at least 20 characters so there is enough context.';
    }
  };

  const fields = Array.from(form.querySelectorAll('.field')).map(function (wrap) {
    return {
      wrap: wrap,
      input: wrap.querySelector('.control'),
      message: wrap.querySelector('.field__error span')
    };
  });

  let attempted = false;

  function setError(field, text) {
    field.wrap.classList.toggle('has-error', Boolean(text));
    field.input.setAttribute('aria-invalid', text ? 'true' : 'false');
    field.message.textContent = text;
  }

  function check(field) {
    const text = rules[field.input.name](field.input.value);
    setError(field, text);
    return text;
  }

  function renderSummary(problems) {
    if (!problems.length) {
      summary.hidden = true;
      summary.textContent = '';
      return;
    }

    const items = problems.map(function (problem) {
      return '<li><a href="#' + problem.id + '">' + problem.text + '</a></li>';
    }).join('');

    summary.innerHTML =
      '<div class="sv-alert sv-alert--error">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-alert"></use></svg>' +
        '<div><strong class="sv-alert__title">There is a problem</strong>' +
        '<p>' + (problems.length === 1 ? 'One entry needs fixing.' : problems.length + ' entries need fixing.') + '</p>' +
        '<ul>' + items + '</ul></div>' +
      '</div>';
    summary.hidden = false;
  }

  function currentProblems() {
    return fields.filter(function (field) {
      return field.wrap.classList.contains('has-error');
    }).map(function (field) {
      return { id: field.input.id, text: field.message.textContent };
    });
  }

  fields.forEach(function (field) {
    field.input.addEventListener('blur', function () {
      if (attempted) {
        check(field);
        renderSummary(currentProblems());
      }
    });

    field.input.addEventListener('input', function () {
      if (field.wrap.classList.contains('has-error') && !rules[field.input.name](field.input.value)) {
        setError(field, '');
        renderSummary(currentProblems());
      }
    });
  });

  summary.addEventListener('click', function (event) {
    const link = event.target.closest('a');
    if (!link) return;
    event.preventDefault();
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target) target.focus();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    attempted = true;
    status.textContent = '';

    const failed = fields.filter(function (field) { return check(field); });
    renderSummary(currentProblems());

    if (failed.length) {
      summary.focus();
      return;
    }

    const name = form.elements.fullname.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    const subject = encodeURIComponent('Portfolio enquiry from ' + name);
    const body = encodeURIComponent(message + '\n\n' + name + ' (' + email + ')');

    status.innerHTML =
      '<div class="sv-alert sv-alert--success">' +
        '<svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>' +
        '<div><strong class="sv-alert__title">Opening your email app</strong>' +
        'If nothing opens, write to <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>. Your message has been kept here.</div>' +
      '</div>';

    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
  });
}



/* footer year */

const yearEl = document.querySelector('[data-current-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();
