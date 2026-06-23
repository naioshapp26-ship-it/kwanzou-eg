/**
 * Apply store theme colors to CSS variables
 */
const LumiereTheme = (() => {
  const MAP = {
    primary: '--text-primary',
    accent: '--champagne',
    accentLight: '--champagne-light',
    accentDark: '--champagne-dark',
    background: '--ivory',
    cream: '--cream',
    textSecondary: '--text-secondary'
  };

  function tintFromAccent(hex) {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return null;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.14)`;
  }

  function apply(settings) {
    const theme = settings?.theme || {};
    const root = document.documentElement;
    Object.entries(MAP).forEach(([key, cssVar]) => {
      if (theme[key]) root.style.setProperty(cssVar, theme[key]);
    });
    const borderTint = tintFromAccent(theme.accent);
    if (borderTint) root.style.setProperty('--glass-border', borderTint);
  }

  return { apply };
})();
