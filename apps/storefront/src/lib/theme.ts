export function hexToHsl(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [
    Math.round(h * 360 * 10) / 10,
    Math.round(s * 100 * 10) / 10,
    Math.round(l * 100 * 10) / 10,
  ];
}

function hslString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

export function generateStoreThemeVars(config: {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}): Record<string, string> {
  const [ph, ps, pl] = hexToHsl(config.primaryColor);
  const [sh, ss, sl] = hexToHsl(config.secondaryColor);
  const [ah, as, al] = hexToHsl(config.accentColor);

  return {
    "--primary": hslString(ph, ps, pl),
    "--primary-foreground": pl > 50 ? hslString(ph, ps, 10) : hslString(ph, ps, 98),
    "--secondary": hslString(sh, Math.min(ss, 30), 96),
    "--secondary-foreground": hslString(sh, ss, 15),
    "--accent": hslString(ah, as, al),
    "--accent-foreground": al > 50 ? hslString(ah, as, 10) : hslString(ah, as, 98),
    "--ring": hslString(ph, ps, pl),
  };
}
