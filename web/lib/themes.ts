// Theme configuration for the Queensland Water Dashboard
// Each theme provides a consistent color palette across all components

export type ThemeName = 'ocean' | 'earth' | 'slate';

export interface ThemeColors {
  name: string;
  description: string;

  // Header
  headerGradient: string;
  headerBorder: string;
  headerTitle: string;
  headerSubtitle: string;
  headerText: string;
  headerIcon: string;
  headerIconBg: string;
  headerAccentLine: string;

  // Tabs
  tabActiveBg: string;
  tabActiveShadow: string;
  tabInactiveBg: string;
  tabInactiveText: string;
  tabInactiveBorder: string;
  tabHoverBg: string;

  // Cards & Containers
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardHoverShadow: string;
  cardIconBg: string;

  // Filters
  filterBg: string;
  filterIconBg: string;
  filterIcon: string;
  inputFocusRing: string;
  inputFocusBorder: string;

  // Primary accent (buttons, links, highlights)
  primaryGradient: string;
  primaryShadow: string;
  primaryText: string;
  primaryHover: string;

  // Secondary accent (for variety/contrast)
  secondaryGradient: string;
  secondaryShadow: string;
  secondaryText: string;

  // KPI Cards (large stat cards)
  kpiPrimaryGradient: string;
  kpiSecondaryGradient: string;

  // Status colors
  statusSuccess: string;
  statusWarning: string;
  statusDanger: string;
  statusInfo: string;

  // Charts
  chartPrimary: string;
  chartSecondary: string;
  chartTertiary: string;
  chartColors: string[];

  // Table
  tableHeaderBg: string;
  tableRowHover: string;
  tableAccent: string;

  // Tags/Badges
  tagBg: string;
  tagText: string;
  tagBorder: string;
  tagHoverBg: string;
  tagHoverText: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  // OCEAN THEME - Blue/Cyan water-inspired palette (refined version of current)
  ocean: {
    name: 'Ocean',
    description: 'Cool blue tones inspired by water',

    // Header
    headerGradient: 'from-slate-900 via-blue-900 to-cyan-900',
    headerBorder: 'border-cyan-500/30',
    headerTitle: 'text-cyan-100',
    headerSubtitle: 'text-cyan-300',
    headerText: 'text-slate-200',
    headerIcon: 'text-white',
    headerIconBg: 'from-cyan-400 to-blue-500',
    headerAccentLine: 'from-transparent via-cyan-400 to-transparent',

    // Tabs
    tabActiveBg: 'from-blue-500 to-cyan-600',
    tabActiveShadow: 'shadow-blue-500/30',
    tabInactiveBg: 'bg-white',
    tabInactiveText: 'text-gray-600',
    tabInactiveBorder: 'border-gray-200',
    tabHoverBg: 'hover:bg-gray-50',

    // Cards
    cardBg: 'from-white via-gray-50 to-white',
    cardBorder: 'border-gray-200/50',
    cardHoverBorder: 'hover:border-blue-200',
    cardHoverShadow: 'hover:shadow-blue-100',
    cardIconBg: 'from-blue-50 to-cyan-50',

    // Filters
    filterBg: 'from-white to-blue-50',
    filterIconBg: 'bg-blue-100',
    filterIcon: 'text-blue-700',
    inputFocusRing: 'focus:ring-blue-500/20',
    inputFocusBorder: 'focus:border-blue-500',

    // Primary accent
    primaryGradient: 'from-blue-500 to-cyan-600',
    primaryShadow: 'shadow-blue-500/30',
    primaryText: 'text-blue-600',
    primaryHover: 'hover:text-blue-800',

    // Secondary
    secondaryGradient: 'from-cyan-500 to-teal-600',
    secondaryShadow: 'shadow-cyan-500/30',
    secondaryText: 'text-cyan-600',

    // KPI Cards
    kpiPrimaryGradient: 'from-blue-500 to-cyan-600',
    kpiSecondaryGradient: 'from-cyan-500 to-teal-600',

    // Status
    statusSuccess: 'from-green-500 to-emerald-600',
    statusWarning: 'from-amber-500 to-orange-600',
    statusDanger: 'from-red-500 to-rose-600',
    statusInfo: 'from-blue-500 to-cyan-600',

    // Charts
    chartPrimary: '#0891b2',
    chartSecondary: '#3b82f6',
    chartTertiary: '#22c55e',
    chartColors: ['#0891b2', '#3b82f6', '#06b6d4', '#0ea5e9', '#22c55e', '#14b8a6'],

    // Table
    tableHeaderBg: 'from-blue-50 to-cyan-50',
    tableRowHover: 'hover:bg-blue-50/50',
    tableAccent: 'text-blue-600',

    // Tags
    tagBg: 'from-blue-50 to-cyan-50',
    tagText: 'text-blue-700',
    tagBorder: 'border-blue-200',
    tagHoverBg: 'hover:from-blue-500 hover:to-cyan-600',
    tagHoverText: 'hover:text-white',
  },

  // EARTH THEME - Warm, natural resource palette
  earth: {
    name: 'Earth',
    description: 'Warm natural tones for a grounded feel',

    // Header
    headerGradient: 'from-stone-900 via-amber-900 to-orange-900',
    headerBorder: 'border-amber-500/30',
    headerTitle: 'text-amber-100',
    headerSubtitle: 'text-amber-300',
    headerText: 'text-stone-200',
    headerIcon: 'text-white',
    headerIconBg: 'from-amber-400 to-orange-500',
    headerAccentLine: 'from-transparent via-amber-400 to-transparent',

    // Tabs
    tabActiveBg: 'from-amber-500 to-orange-600',
    tabActiveShadow: 'shadow-amber-500/30',
    tabInactiveBg: 'bg-white',
    tabInactiveText: 'text-gray-600',
    tabInactiveBorder: 'border-gray-200',
    tabHoverBg: 'hover:bg-amber-50',

    // Cards
    cardBg: 'from-white via-stone-50 to-white',
    cardBorder: 'border-stone-200/50',
    cardHoverBorder: 'hover:border-amber-200',
    cardHoverShadow: 'hover:shadow-amber-100',
    cardIconBg: 'from-amber-50 to-orange-50',

    // Filters
    filterBg: 'from-white to-amber-50',
    filterIconBg: 'bg-amber-100',
    filterIcon: 'text-amber-700',
    inputFocusRing: 'focus:ring-amber-500/20',
    inputFocusBorder: 'focus:border-amber-500',

    // Primary accent
    primaryGradient: 'from-amber-500 to-orange-600',
    primaryShadow: 'shadow-amber-500/30',
    primaryText: 'text-amber-600',
    primaryHover: 'hover:text-amber-800',

    // Secondary
    secondaryGradient: 'from-orange-500 to-red-600',
    secondaryShadow: 'shadow-orange-500/30',
    secondaryText: 'text-orange-600',

    // KPI Cards
    kpiPrimaryGradient: 'from-amber-500 to-orange-600',
    kpiSecondaryGradient: 'from-orange-500 to-red-500',

    // Status
    statusSuccess: 'from-green-500 to-emerald-600',
    statusWarning: 'from-yellow-500 to-amber-600',
    statusDanger: 'from-red-500 to-rose-600',
    statusInfo: 'from-amber-500 to-orange-600',

    // Charts
    chartPrimary: '#d97706',
    chartSecondary: '#ea580c',
    chartTertiary: '#16a34a',
    chartColors: ['#d97706', '#ea580c', '#f59e0b', '#fb923c', '#16a34a', '#65a30d'],

    // Table
    tableHeaderBg: 'from-amber-50 to-orange-50',
    tableRowHover: 'hover:bg-amber-50/50',
    tableAccent: 'text-amber-600',

    // Tags
    tagBg: 'from-amber-50 to-orange-50',
    tagText: 'text-amber-700',
    tagBorder: 'border-amber-200',
    tagHoverBg: 'hover:from-amber-500 hover:to-orange-600',
    tagHoverText: 'hover:text-white',
  },

  // SLATE THEME - Clean, minimal, professional
  slate: {
    name: 'Slate',
    description: 'Clean minimal design with teal accents',

    // Header
    headerGradient: 'from-slate-800 via-slate-800 to-slate-900',
    headerBorder: 'border-teal-500/30',
    headerTitle: 'text-slate-100',
    headerSubtitle: 'text-teal-400',
    headerText: 'text-slate-300',
    headerIcon: 'text-white',
    headerIconBg: 'from-teal-400 to-teal-600',
    headerAccentLine: 'from-transparent via-teal-500 to-transparent',

    // Tabs
    tabActiveBg: 'from-slate-700 to-slate-800',
    tabActiveShadow: 'shadow-slate-500/30',
    tabInactiveBg: 'bg-white',
    tabInactiveText: 'text-slate-600',
    tabInactiveBorder: 'border-slate-200',
    tabHoverBg: 'hover:bg-slate-50',

    // Cards
    cardBg: 'from-white via-slate-50 to-white',
    cardBorder: 'border-slate-200/50',
    cardHoverBorder: 'hover:border-teal-300',
    cardHoverShadow: 'hover:shadow-slate-200',
    cardIconBg: 'from-slate-100 to-teal-50',

    // Filters
    filterBg: 'from-white to-slate-50',
    filterIconBg: 'bg-slate-100',
    filterIcon: 'text-slate-700',
    inputFocusRing: 'focus:ring-teal-500/20',
    inputFocusBorder: 'focus:border-teal-500',

    // Primary accent
    primaryGradient: 'from-teal-500 to-teal-600',
    primaryShadow: 'shadow-teal-500/30',
    primaryText: 'text-teal-600',
    primaryHover: 'hover:text-teal-800',

    // Secondary
    secondaryGradient: 'from-slate-600 to-slate-700',
    secondaryShadow: 'shadow-slate-500/30',
    secondaryText: 'text-slate-600',

    // KPI Cards
    kpiPrimaryGradient: 'from-slate-700 to-slate-800',
    kpiSecondaryGradient: 'from-teal-500 to-teal-600',

    // Status
    statusSuccess: 'from-emerald-500 to-emerald-600',
    statusWarning: 'from-amber-500 to-amber-600',
    statusDanger: 'from-rose-500 to-rose-600',
    statusInfo: 'from-teal-500 to-teal-600',

    // Charts
    chartPrimary: '#0d9488',
    chartSecondary: '#475569',
    chartTertiary: '#10b981',
    chartColors: ['#0d9488', '#475569', '#14b8a6', '#64748b', '#10b981', '#334155'],

    // Table
    tableHeaderBg: 'from-slate-50 to-slate-100',
    tableRowHover: 'hover:bg-teal-50/30',
    tableAccent: 'text-teal-600',

    // Tags
    tagBg: 'from-slate-50 to-teal-50',
    tagText: 'text-slate-700',
    tagBorder: 'border-slate-200',
    tagHoverBg: 'hover:from-teal-500 hover:to-teal-600',
    tagHoverText: 'hover:text-white',
  },
};

export const defaultTheme: ThemeName = 'ocean';
