"use strict";

/**
    This is my dark/light mode logic for my webpage

        By using typescript with local storage, I was able hold the state of the page across html pages
        There is an event listen waiting for the dark/light mode to be pressed, once it is, there is logic to check what the 
        state of the mode is, then it will switch to the opposite. 

 */

// Theme management
var THEME_KEY = 'theme-preference';

// Get initial theme from localStorage or system preference
function getInitialTheme() {
  var savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme to document
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

// Toggle between light and dark theme
function toggleTheme() {
  var currentTheme = document.documentElement.getAttribute('data-theme');
  var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  updateThemeIcon(newTheme === 'dark');
}

// Update theme icon based on current theme
function updateThemeIcon(isDark) {
  var themeIcon = document.querySelector('.theme-toggle__icon');
  if (themeIcon) {
    themeIcon.textContent = isDark ? '☀️' : '🌙';
  }
}

// Initialize theme functionality
function initializeTheme() {
  var themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;

  // Set initial theme
  var initialTheme = getInitialTheme();
  applyTheme(initialTheme);
  updateThemeIcon(initialTheme === 'dark');

  // Add click event listener
  themeToggle.addEventListener('click', toggleTheme);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTheme);