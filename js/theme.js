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

  function apply(settings) {
    const theme = settings?.theme || {};
    const root = document.documentElement;
    Object.entries(MAP).forEach(([key, cssVar]) => {
      if (theme[key]) root.style.setProperty(cssVar, theme[key]);
    });
  }

  return { apply };
})();
