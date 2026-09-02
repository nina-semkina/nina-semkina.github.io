'use strict';

const THEME_STORAGE_KEY = 'portfolio-theme';
const root = document.documentElement;
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

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
  const copyEmailButton = document.querySelector('[data-copy-email]');
  const copyNotice = document.querySelector('[data-copy-notice]');
  let noticeTimer;

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
    try {
      await navigator.clipboard.writeText(copyEmailButton.dataset.copyEmail);
      copyEmailButton.dataset.copied = 'true';
      copyEmailButton.setAttribute('aria-label', 'Email address copied');
      showCopyNotice('Email copied to clipboard');

      window.setTimeout(() => {
        delete copyEmailButton.dataset.copied;
        copyEmailButton.setAttribute('aria-label', 'Copy email address');
      }, 2000);
    } catch {
      copyEmailButton.setAttribute('aria-label', 'Unable to copy email address');
      showCopyNotice('Unable to copy email address');
    }
  });
});
