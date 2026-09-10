'use strict';

// element toggle helper
const elementToggleFunc = function (elem) { elem.classList.toggle('active'); };



// sidebar toggle (mobile "Show contacts")
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener('click', function () {
    const isOpen = sidebar.classList.toggle('active');
    sidebarBtn.setAttribute('aria-expanded', isOpen);
    sidebarBtn.querySelector('span').textContent = isOpen ? 'Hide Contacts' : 'Show Contacts';
  });
}



// page navigation (tabs)
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');

const activatePage = function (pageName) {
  pages.forEach(function (page) {
    const isMatch = page.dataset.page === pageName;
    page.classList.toggle('active', isMatch);
  });

  navigationLinks.forEach(function (link) {
    const isMatch = link.dataset.navLink === pageName;
    link.classList.toggle('active', isMatch);
    link.setAttribute('aria-selected', isMatch);
  });

  window.scrollTo(0, 0);
};

navigationLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    activatePage(this.dataset.navLink);
  });
});

// CTA buttons that jump to a page (e.g. "View My Work", "Let's Connect")
document.querySelectorAll('[data-cta-nav]').forEach(function (cta) {
  cta.addEventListener('click', function (event) {
    event.preventDefault();
    activatePage(this.dataset.ctaNav);
  });
});



// contact form — validates, then opens the visitor's email client with a
// pre-filled message (this site has no backend, so no data is transmitted
// anywhere; the visitor reviews and sends the email themselves).
const form = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn = document.querySelector('[data-form-btn]');
const formSuccess = document.querySelector('[data-form-success]');

if (form) {
  formInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      formBtn.disabled = !form.checkValidity();
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!form.checkValidity()) return;

    const fullname = form.querySelector('[name="fullname"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    const subject = encodeURIComponent('Portfolio enquiry from ' + fullname);
    const body = encodeURIComponent(message + '\n\n— ' + fullname + ' (' + email + ')');

    window.location.href = 'mailto:victorwambua004@gmail.com?subject=' + subject + '&body=' + body;

    if (formSuccess) formSuccess.classList.add('active');
  });
}



// footer year
const yearEl = document.querySelector('[data-current-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();
