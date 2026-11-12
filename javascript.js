'use strict';

const header = document.querySelector('#site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const internalLinks = document.querySelectorAll('a[href^="#"]');
let lastFocusedElement = null;

function closeNavigation() {
    if (!navToggle || !navLinks) return;

    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    document.body.classList.remove('nav-open');
}

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isOpen));
        navLinks.classList.toggle('is-open', !isOpen);
        document.body.classList.toggle('nav-open', !isOpen);
    });

    document.addEventListener('click', (event) => {
        if (!navLinks.classList.contains('is-open')) return;
        if (navLinks.contains(event.target) || navToggle.contains(event.target)) return;
        closeNavigation();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 820) closeNavigation();
    });
}

internalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');

        if (!href || href === '#') {
            event.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeNavigation();
    });
});

function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const pageSections = document.querySelectorAll('main section[id]');
const navigationAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navigationAnchors.forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0
    });

    pageSections.forEach((section) => sectionObserver.observe(section));
}

function setModalState(modal, isOpen) {
    if (!modal) return;

    modal.classList.toggle('is-open', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('modal-open', document.querySelector('.modal.is-open') !== null);
}

window.openModal = function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    setModalState(modal, true);
    modal.querySelector('.modal-content')?.focus();
};

window.closeModal = function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    setModalState(modal, false);
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
};

document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) window.closeModal(modal.id);
    });

    modal.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;

        const focusableElements = modal.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const openModal = document.querySelector('.modal.is-open');
    if (openModal) {
        window.closeModal(openModal.id);
        return;
    }

    closeNavigation();
});
