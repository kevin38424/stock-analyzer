export const appLayoutClasses = {
  page: "min-h-screen bg-[#050f2b] text-slate-100",
  shell: "grid min-h-screen lg:grid-cols-[300px_1fr]",
  content: "px-5 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-10",
  panel: "rounded-xl border border-slate-800 bg-slate-900/75 p-6",
} as const;

export const appTypographyClasses = {
  eyebrow: "app-display text-xs font-semibold uppercase tracking-[0.24em] text-slate-400",
  pageTitle: "app-display mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl",
  pageSubtitle: "mt-4 max-w-4xl text-base leading-relaxed text-slate-300 sm:text-lg",
  sectionTitle: "app-display text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl",
  body: "text-sm leading-relaxed text-slate-300 sm:text-base",
  muted: "text-xs text-slate-400 sm:text-sm",
} as const;
