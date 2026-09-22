'use strict';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function amazonSearchUrl(query) {
  return `https://www.amazon.it/s?k=${encodeURIComponent(query)}&tag=willitwork-21`;
}

function checkerUrl(device, product) {
  return `/?device=${encodeURIComponent(device)}&product=${encodeURIComponent(product)}#checker`;
}

module.exports = { escapeHtml, amazonSearchUrl, checkerUrl };
