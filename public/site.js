// Loaded as an external, same-origin module so the strict CSP (script-src 'self')
// allows it — an inline <script> would be blocked, which would silently hide every
// reveal-on-scroll section and disable the quick exit. Keep this a static file in
// /public; do NOT move it back inline.

// Quick exit (brief §10a): replace() leaves no back-button trail, and the new
// blank tab moves focus off this page. Also bound to Escape pressed twice.
function quickExit() {
  window.open('about:blank', '_blank');
  window.location.replace('https://www.google.com/search?q=weather');
}
document.querySelectorAll('[data-quick-exit]').forEach(function (b) {
  b.addEventListener('click', quickExit);
});

var esc = 0;
var escT;
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  esc++;
  clearTimeout(escT);
  escT = setTimeout(function () {
    esc = 0;
  }, 700);
  if (esc >= 2) quickExit();
});

// Reveal-on-scroll — the only ambient JS in the design.
var io = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.rv').forEach(function (el) {
  io.observe(el);
});
