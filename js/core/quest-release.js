// Authoritative release metadata. VERSION.txt and package.json are checked mirrors.
(() => {
  const release = Object.freeze({version: '3.4.1', cacheRevision: 'master-art-foundation-1'});
  (typeof window !== 'undefined' ? window : self).QuestRelease = release;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-release-version]').forEach(el => { el.textContent = 'v' + release.version; });
  });
})();
