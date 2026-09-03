'use strict';

const THEME_STORAGE_KEY = 'portfolio-theme';
const EMAIL_DECODE_KEY = 91;
const OBFUSCATED_EMAIL = [
  53, 50, 53, 58, 117, 40, 117, 40, 62, 54, 48, 50,
  53, 58, 27, 60, 54, 58, 50, 55, 117, 56, 52, 54,
];
const root = document.documentElement;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function decodeEmail() {
  return String.fromCharCode(
    ...OBFUSCATED_EMAIL.map((value) => value ^ EMAIL_DECODE_KEY),
  );
}

async function copyToClipboard(value) {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
  } catch {
    return null;
  }
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies for the current page if storage is unavailable.
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function preferredTheme() {
  return systemTheme.matches ? 'dark' : 'light';
}

applyTheme(getSavedTheme() ?? preferredTheme());

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.querySelector('[data-theme-toggle]');

  if (!themeToggle) {
    return;
  }

  function updateToggleState() {
    const isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme',
    );
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
    updateToggleState();
  });

  systemTheme.addEventListener('change', (event) => {
    if (getSavedTheme() === null) {
      applyTheme(event.matches ? 'dark' : 'light');
      updateToggleState();
    }
  });

  updateToggleState();
});

document.addEventListener('DOMContentLoaded', () => {
  const emailLink = document.querySelector('[data-email-link]');
  const emailText = document.querySelector('[data-email-text]');
  const copyEmailButton = document.querySelector('[data-copy-email]');
  const copyNotice = document.querySelector('[data-copy-notice]');
  const emailAddress = decodeEmail();
  let noticeTimer;

  if (emailLink) {
    emailLink.href = `mailto:${emailAddress}`;
  }

  if (emailText) {
    emailText.textContent = emailAddress;
  }

  if (!copyEmailButton) {
    return;
  }

  function showCopyNotice(message) {
    if (!copyNotice) {
      return;
    }

    window.clearTimeout(noticeTimer);
    copyNotice.textContent = message;
    copyNotice.hidden = false;
    noticeTimer = window.setTimeout(() => {
      copyNotice.hidden = true;
    }, 2000);
  }

  copyEmailButton.addEventListener('click', async () => {
    const isCopied = await copyToClipboard(emailAddress);

    if (!isCopied) {
      copyEmailButton.setAttribute('aria-label', 'Unable to copy email address');
      showCopyNotice('Unable to copy email address');
      return;
    }

    copyEmailButton.dataset.copied = 'true';
    copyEmailButton.setAttribute('aria-label', 'Email address copied');
    showCopyNotice('Email copied.');

    window.setTimeout(() => {
      delete copyEmailButton.dataset.copied;
      copyEmailButton.setAttribute('aria-label', 'Copy email address');
    }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const desktopViewport = window.matchMedia('(min-width: 48rem)');

  if (!header || !menuToggle) {
    return;
  }

  function setMenuOpen(isOpen) {
    header.dataset.menuOpen = String(isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Close navigation menu' : 'Open navigation menu',
    );
  }

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  header.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  desktopViewport.addEventListener('change', (event) => {
    if (event.matches) {
      setMenuOpen(false);
    }
  });
});
