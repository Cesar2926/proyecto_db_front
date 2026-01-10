/**
 * 🎨 CONSTANTES DE COLORES
 *
 * Este archivo centraliza todos los colores del proyecto.
 * Los colores están definidos en formato HSL (Hue, Saturation, Lightness)
 * para compatibilidad con shadcn/ui y Tailwind CSS.
 *
 * USO:
 * - En componentes: importa y usa las constantes
 * - En CSS: las variables CSS ya están definidas en global.css
 * - En Tailwind: usa las clases como bg-primary, text-foreground, etc.
 */

// ============================================
// 🎨 COLORES BASE (HSL)
// ============================================

/**
 * Color Vinotinto Principal (#7C0A02)
 * Usado para elementos destacados, botones primarios, tarjetas del home
 */
export const VINOTINTO_PRIMARY = {
  h: 0,
  s: 95,
  l: 25,
  hsl: '0 95% 25%',
  hex: '#7C0A02',
};

/**
 * Color Vinotinto Claro
 * Usado para hover states, elementos secundarios
 */
export const VINOTINTO_LIGHT = {
  h: 0,
  s: 95,
  l: 35,
  hsl: '0 95% 35%',
  hex: '#B91C1C',
};

/**
 * Color Vinotinto Oscuro
 * Usado para elementos más sutiles
 */
export const VINOTINTO_DARK = {
  h: 0,
  s: 95,
  l: 15,
  hsl: '0 95% 15%',
  hex: '#450A0A',
};

// ============================================
// 🌞 MODO CLARO
// ============================================

export const LIGHT_COLORS = {
  // Fondos
  background: '0 0% 100%', // Blanco puro
  card: '0 0% 100%', // Blanco para cards
  popover: '0 0% 100%', // Blanco para popovers

  // Textos
  foreground: '0 0% 13%', // Negro suave
  cardForeground: '0 0% 13%',
  popoverForeground: '0 0% 13%',

  // Primario (Vinotinto)
  primary: VINOTINTO_PRIMARY.hsl,
  primaryForeground: '0 0% 100%', // Blanco para texto sobre vinotinto

  // Secundario
  secondary: '0 0% 98%', // Gris muy claro
  secondaryForeground: '0 0% 13%',

  // Muted (textos secundarios)
  muted: '0 0% 96%',
  mutedForeground: '0 0% 45%',

  // Accent
  accent: '0 0% 96%',
  accentForeground: '0 0% 13%',

  // Destructive (errores)
  destructive: '0 84% 60%',
  destructiveForeground: '0 0% 100%',

  // Bordes e inputs
  border: '0 0% 90%',
  input: '0 0% 90%',
  ring: VINOTINTO_PRIMARY.hsl,
} as const;

// ============================================
// 🌙 MODO OSCURO
// ============================================

export const DARK_COLORS = {
  // Fondos (vinotinto oscuro)
  background: '0 95% 8%', // Vinotinto muy oscuro #1a0503
  card: '0 80% 12%', // Vinotinto oscuro para cards
  popover: '0 80% 10%', // Vinotinto oscuro para popovers

  // Textos
  foreground: '0 0% 95%', // Blanco roto
  cardForeground: '0 0% 95%',
  popoverForeground: '0 0% 95%',

  // Primario (vinotinto más claro para contraste)
  primary: '0 85% 35%', // Vinotinto más claro
  primaryForeground: '0 0% 100%', // Blanco

  // Secundario
  secondary: '0 60% 15%', // Vinotinto oscuro secundario
  secondaryForeground: '0 0% 95%',

  // Muted
  muted: '0 50% 20%',
  mutedForeground: '0 0% 70%',

  // Accent
  accent: '0 70% 18%',
  accentForeground: '0 0% 95%',

  // Destructive
  destructive: '0 62% 50%',
  destructiveForeground: '0 0% 98%',

  // Bordes e inputs
  border: '0 50% 25%', // Bordes vinotinto
  input: '0 60% 20%',
  ring: '0 85% 35%',
} as const;

// ============================================
// 🎯 COLORES ESPECÍFICOS DEL PROYECTO
// ============================================

/**
 * Colores para tarjetas del Home
 * Siempre mantienen el color vinotinto independientemente del tema
 */
export const HOME_CARD_COLORS = {
  light: {
    from: 'from-red-900',
    to: 'to-red-950',
    icon: 'text-red-700/30',
  },
  dark: {
    from: 'from-red-700',
    to: 'to-red-800',
    icon: 'text-red-500/30',
  },
} as const;

/**
 * Colores para el Sidebar
 * Siempre mantiene el color vinotinto
 */
export const SIDEBAR_COLORS = {
  gradient: 'from-red-900 to-red-950',
  button: 'bg-red-800/50 hover:bg-red-700/70',
  logout: 'bg-red-950 hover:bg-black/50 border-red-800/50',
} as const;

// ============================================
// 🔧 UTILIDADES
// ============================================

/**
 * Convierte HSL a formato CSS variable
 * @example hslToCssVar('0 95% 25%') => 'hsl(0, 95%, 25%)'
 */
export const hslToCssVar = (hsl: string): string => {
  return `hsl(${hsl})`;
};

/**
 * Convierte HSL a formato Tailwind
 * @example hslToTailwind('0 95% 25%') => 'hsl(0 95% 25%)'
 */
export const hslToTailwind = (hsl: string): string => {
  return `hsl(${hsl})`;
};

/**
 * Obtiene el color según el tema actual
 * Útil para componentes que necesitan colores dinámicos
 */
export const getThemeColor = (isDark: boolean, lightColor: string, darkColor: string): string => {
  return isDark ? darkColor : lightColor;
};

// ============================================
// 📝 EJEMPLOS DE USO
// ============================================

/**
 * EJEMPLO 1: Usar en componente con Tailwind
 *
 * ```tsx
 * import { VINOTINTO_PRIMARY } from '@/constants/colors';
 *
 * <div className="bg-primary text-primary-foreground">
 *   Usa las clases de Tailwind que ya están configuradas
 * </div>
 * ```
 *
 * EJEMPLO 2: Usar en estilos inline
 *
 * ```tsx
 * import { VINOTINTO_PRIMARY, hslToCssVar } from '@/constants/colors';
 *
 * <div style={{ backgroundColor: hslToCssVar(VINOTINTO_PRIMARY.hsl) }}>
 *   Color vinotinto
 * </div>
 * ```
 *
 * EJEMPLO 3: Usar colores específicos del proyecto
 *
 * ```tsx
 * import { HOME_CARD_COLORS } from '@/constants/colors';
 *
 * <div className={`bg-gradient-to-br ${HOME_CARD_COLORS.light.from} ${HOME_CARD_COLORS.light.to}`}>
 *   Tarjeta del home
 * </div>
 * ```
 */
