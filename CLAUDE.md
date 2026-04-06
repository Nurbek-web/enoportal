# ENO Portal — Claude Code Guide

## Project Overview

Demo/prototype portal for Etive Neft Oil (ENO) — a fuel distribution company in Uzbekistan. Russian-language UI, all data is static mock (no backend). Built for live presentations.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts 3.8 (code-split via `next/dynamic` — never import Recharts directly in page files)
- **Animation**: CSS keyframes (Framer Motion removed)
- **Dates**: date-fns 4
- **Icons**: Lucide React

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build (validates all routes)
npx tsc --noEmit # type-check without building
```

Always run `npx tsc --noEmit` after changes. The build must stay clean.

## Project Structure

```
src/
  app/
    login/page.tsx              # login page (glassmorphic dark bg)
    (portal)/                   # route group — all portal pages
      layout.tsx                # sidebar + header layout (server component)
      loading.tsx               # shared skeleton loading screen for all portal pages
      page.tsx                  # dashboard
      sales/page.tsx
      fuel-analysis/page.tsx
      operators/page.tsx
      reports/page.tsx
      tankers/page.tsx
      clients/page.tsx
      bonuses/page.tsx
      logistics/page.tsx
      expenses/page.tsx
      market/page.tsx
  components/
    layout/sidebar.tsx          # dark gradient sidebar, collapsible
    layout/header.tsx           # white header, notifications, avatar, base filter
    layout/portal-providers.tsx # client wrapper that provides BaseFilterContext
    shared/
      kpi-card.tsx              # KPI card with count-up animation + accent tint + hover lift
      mini-kpi-card.tsx         # compact KPI card (no animation) for summary rows
      fuel-gauge.tsx            # SVG ring gauge with CSS stroke animation (light bg, stone palette)
      filter-bar.tsx            # flex filter row wrapper (use instead of inline div)
      status-badge.tsx          # data-driven status badge
      ai-insight-card.tsx       # violet-tinted AI recommendation card (present on every page)
      page-header.tsx           # page title + description + actions slot
      motion-container.tsx      # CSS stagger wrapper (no framer-motion)
    charts/                     # lazy-loaded Recharts components (always use next/dynamic)
      weekly-sales-chart.tsx
      fuel-levels-chart.tsx
      client-volume-chart.tsx
      market-price-chart.tsx
      manager-volume-chart.tsx
    ui/                         # shadcn/ui primitives (do not edit directly)
                                # installed: button, input, textarea, select, sheet, dialog,
                                #   table, tabs, badge, separator, avatar, scroll-area
  contexts/
    base-filter-context.tsx     # BaseFilterProvider + useBaseFilter hook
  hooks/
    use-count-up.ts             # rAF-based number count-up (animates once per session)
  lib/
    types.ts                    # all shared TypeScript interfaces + BaseFilter type
    constants.ts                # FUEL_DENSITY, BONUS_RATE_PER_LITER, BASES,
                                #   STATUS_COLORS, STATUS_LABELS, ENO_PRICES, etc.
    format.ts                   # formatCurrency, formatVolume, formatDateShort, etc.
    utils.ts                    # cn() utility (clsx + tailwind-merge)
    filter-by-base.ts           # filterByBase<T extends { base: Base }>() utility
    mock/                       # static mock data (no API calls anywhere)
      operators.ts, managers.ts, clients.ts, tankers.ts   # entities
      sales.ts, reports.ts, expenses.ts                   # transactions
      fuel.ts, market.ts, logistics.ts                    # standalone
```

## Design System

### Colors
- Page bg: `bg-stone-50` (warm neutral — use stone palette, not slate)
- Sidebar: dark gradient `#1a1a2e` → `#1e2a3a` (CSS class `sidebar-gradient`)
- Cards: `bg-white rounded-2xl border border-stone-200/50 shadow-sm shadow-stone-900/[0.04]`
- Primary action: `blue-600`
- Success: `emerald-500` | Warning: `amber-500` | Danger: `rose-500` | AI: `violet-500`

**Color palette:** Use `stone-*` throughout (warm grays). Do NOT use `slate-*` in new code.

### Glassmorphism (used only on login + sidebar active states)
- Login card: `bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15]`
- Sidebar active: `bg-white/10` with a `before:` pseudo-element accent bar (see sidebar.tsx)
- Do NOT apply to content cards, inputs, or table rows

### Typography
- KPI values: `text-3xl font-semibold tracking-tight`
- Page titles: `text-2xl font-semibold tracking-tight`
- Table headers: `text-xs font-medium uppercase tracking-wider text-stone-500`
- Body: `text-sm text-stone-600`

### Motion (exactly 3 effects)
1. Stagger page enter — wrap page content in `<MotionContainer>`, sections in `<MotionItem>` (CSS-only, no framer-motion)
2. KPI count-up — `useCountUp(target)` hook in `KpiCard` (animates once per browser session, not on every revisit)
3. Card hover lift — `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200` (CSS only)

No shimmer, no orbs, no glow pulses — keep it controlled.

### CSS Animation Classes (globals.css)
- `.fuel-gauge-ring` — SVG stroke-dashoffset fill animation (1.2s, uses `--gauge-circumference`, `--gauge-target`, `--gauge-delay` CSS vars)
- `.status-pulse` — pulsing dot for live status indicators (2s ease-in-out infinite)
- `.activity-item` — slide-in from left for activity feed items (0.4s, use with inline `animationDelay`)

### Status Badges
Always use `<StatusBadge status={value} />` — never inline colored spans.
All status keys and their colors/labels live in `lib/constants.ts` (`STATUS_COLORS`, `STATUS_LABELS`).
To add a new status: add entries to both maps in constants.ts.

Current status keys: `in_progress`, `shipped`, `paid`, `pending`, `approved`, `rejected`, `new`,
`on_shift`, `off_shift`, `handover`, `loyal`, `one-time`, `profitable`, `unprofitable`,
`vip`, `promising`, `declining`, `booked`, `planned`,
`cash`, `bank` (payment types), `urgent` (expense type)

## Mock Data Conventions

- All data lives in `src/lib/mock/` — no inline arrays in page files
- Uzbek names, UZ phone format (`+998 9X XXX XXXX`), Uzbek plates (`01 A 123 BA`)
- Fuel prices: AI-92 ~10 800 сум/л, AI-95 ~12 200 сум/л
- Currency: UZS, formatted via `formatCurrency()` (e.g., `270 000 000 сум`)
- Dates: ISO strings, displayed via `formatDateShort()` (`dd.MM.yyyy`) or `formatDate()`
- Bases: `'chirchik'` | `'akhangaran'` (display labels via `BASE_LABELS` in constants)

## Page Patterns

### Detail drawer (Sheet)
Row click → `setSelectedItem(item)` → `<Sheet open={!!item} onOpenChange={() => setSelectedItem(null)}>` 
Use `side="right" className="w-[480px] overflow-y-auto"`. See `tankers/page.tsx` or `clients/page.tsx`.

### New item dialog/sheet
Small forms (≤4 fields): `Dialog`. Large forms: `Sheet`.
All form fields must be controlled (`value` + `onChange`). Submit must do something visible (add to list, close dialog). Validate before submit.

### Filters
Use `<FilterBar>` from `@/components/shared/filter-bar` to wrap filter controls — don't use a raw div.
Filter with `useMemo` — add filter state values AND `selectedBase` to the dependency array.

### Base filter (global)
The header has a base selector (Все базы / Чирчик / Ахангаран) that filters data globally via `BaseFilterContext`.
- Consume with `const { selectedBase } = useBaseFilter()` from `@/contexts/base-filter-context`
- Filter data with `filterByBase(items, selectedBase)` from `@/lib/filter-by-base` (for types with `base` field)
- Add `selectedBase` to all relevant `useMemo` dependency arrays
- Pages where base doesn't apply (tankers, market, expenses, logistics): no changes needed
- Avoid adding a page-level base filter Select if the global header filter already covers it

### Charts
- **Never import Recharts directly in page files** — extract to `src/components/charts/` and use `next/dynamic`
- Area charts: `linearGradient` fill, `stroke="#3b82f6"`, `strokeWidth={2}`, `dot={false}`
- Bar charts: `radius={[6,6,0,0]}` (vertical) or `radius={[0,6,6,0]}` (horizontal), `fill="#3b82f6"`, `activeBar={{ fill: "#2563eb" }}`
- Grid: `stroke="#e7e5e4"` (stone-200), axis ticks: `fill="#a8a29e"` (stone-400)
- Tooltip: white card `bg-white border border-stone-200/60 rounded-xl shadow-lg px-4 py-3`
- Always wrap in `<ResponsiveContainer width="100%" height={N}>`
- Dynamic import pattern:
```tsx
const MyChart = dynamic(() => import("@/components/charts/my-chart"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-stone-100" />,
});
```

### AI insight cards
```tsx
<AiInsightCard title="...">Hardcoded Russian recommendation text.</AiInsightCard>
```
Uses violet tint. "ИИ-рекомендация" badge + Sparkles icon built into the component.
**Every portal page has at least one AiInsightCard.** When adding a new page, always include one.
Content can mix static text with dynamic computed values (JSX expressions are fine inside).

### FuelGauge
```tsx
<FuelGauge label="AI-92" baseName="Чирчик" level={72} status="ok" daysRemaining={18} volumeRemaining={45000} index={0} />
```
SVG ring gauge. `status` drives color (ok=emerald, warning=amber, critical=rose). `index` staggers the fill animation by 150ms per gauge. Light background only (stone palette text/strokes).

## Adding a New Page

1. Create `src/app/(portal)/[route]/page.tsx` with `"use client"`
2. Wrap content in `<MotionContainer>` with `<MotionItem>` per section
3. Start with `<PageHeader title="..." description="..." />`
4. Add a KPI summary row (`MiniKpiCard` or `KpiCard`) — every page has one
5. Add at least one `<AiInsightCard>` — every page has one
6. Add mock data to `src/lib/mock/` if needed
7. Add navigation entry to `navGroups` in `src/components/layout/sidebar.tsx`
8. If the page has data with a `base` field, consume `useBaseFilter()` and filter with `filterByBase()`
9. If the page has charts, extract to `src/components/charts/` and use `next/dynamic`
10. Use only shadcn/ui components for buttons, inputs, selects, dialogs — never raw HTML form elements

## Language

All user-facing text is in Russian. No i18n framework — strings are hardcoded.
TypeScript identifiers, status enum values, and CSS classes remain in English.
