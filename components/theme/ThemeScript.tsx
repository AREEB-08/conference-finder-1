/**
 * Applies the saved theme before first paint.
 *
 * This runs as a blocking inline script in <head>, which is what prevents the
 * light-then-dark flash you get if the class is only applied after hydration.
 * It is a fixed string with no interpolated values, so there is no injection
 * surface here.
 */
const script = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var dark = mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    // Signals that JS is running, which is what unlocks the reveal animations.
    document.documentElement.classList.add('js');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    /* localStorage can throw in private mode; the light default still applies. */
  }
})();
`;

export default function ThemeScript() {
  return (
    <script
      // Static, developer-authored string. No user input reaches this.
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
