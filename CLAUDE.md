# ENO Portal — Claude Code Guide

## Project Overview

Demo/prototype portal for Etive Neft Oil (ENO) — a fuel distribution company in Uzbekistan. Russian-language UI, all data is static mock (no backend). Built for live presentations.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts 3.8
- **Animation**: Framer Motion 12
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
      layout.tsx                # sidebar + header layout
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
    layout/header.tsx           # white header, notifications, avatar
    shared/
      kpi-card.tsx              # KPI card with count-up animation
      status-badge.tsx          # data-driven status badge
      ai-insight-card.tsx       # violet-tinted AI recommendation card
      page-header.tsx           # page title + description + actions slot
      motion-container.tsx      # Framer Motion stagger wrapper
    ui/                         # shadcn/ui primitives (do not edit directly)
  hooks/
    use-count-up.ts             # rAF-based number count-up hook
  lib/
    types.ts                    # all shared TypeScript interfaces
    constants.ts                # FUEL_DENSITY, BONUS_RATE_PER_LITER, BASES,
                                #   STATUS_COLORS, STATUS_LABELS, ENO_PRICES, etc.
    format.ts                   # formatCurrency, formatVolume, formatDateShort, etc.
    utils.ts                    # cn() utility (clsx + tailwind-merge)
    mock/                       # static mock data (no API calls anywhere)
      operators.ts, managers.ts, clients.ts, tankers.ts   # entities
      sales.ts, reports.ts, expenses.ts                   # transactions
      fuel.ts, market.ts, logistics.ts                    # standalone
```

## Design System

### Colors
- Page bg: `bg-slate-50`
- Sidebar: dark gradient `#0f172a` → `#162040` (CSS class `sidebar-gradient`)
- Cards: `bg-white rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-950/[0.03]`
- Primary action: `blue-600`
- Success: `emerald-500` | Warning: `amber-500` | Danger: `rose-500` | AI: `violet-500`

### Glassmorphism (used only on login + sidebar active states)
- Login card: `bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15]`
- Sidebar active: `bg-white/10 backdrop-blur-sm`
- Do NOT apply to content cards, inputs, or table rows

### Typography
- KPI values: `text-3xl font-light tracking-tight`
- Page titles: `text-2xl font-semibold tracking-tight`
- Table headers: `text-xs font-medium uppercase tracking-wider text-slate-500`
- Body: `text-sm text-slate-600`

### Motion (exactly 3 effects)
1. Stagger page enter — wrap page content in `<MotionContainer>`, sections in `<MotionItem>`
2. KPI count-up — `useCountUp(target)` hook in `KpiCard`
3. Card hover lift — `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200` (CSS only)

No shimmer, no orbs, no glow pulses — keep it controlled.

### Status Badges
Always use `<StatusBadge status={value} />` — never inline colored spans.
All status keys and their colors/labels live in `lib/constants.ts` (`STATUS_COLORS`, `STATUS_LABELS`).
To add a new status: add entries to both maps in constants.ts.

Current status keys: `in_progress`, `shipped`, `paid`, `pending`, `approved`, `rejected`, `new`,
`on_shift`, `off_shift`, `handover`, `loyal`, `one-time`, `profitable`, `unprofitable`,
`vip`, `promising`, `declining`, `booked`, `planned`

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
Inline `Select` + optional search `Input` in a `flex flex-wrap gap-3` row above the table.
Filter with `useMemo` — add filter state values to the dependency array.

### Charts
- Area charts: `linearGradient` fill, `stroke="#3b82f6"`, `strokeWidth={2}`, `dot={false}`
- Bar charts: `radius={[6,6,0,0]}` (vertical) or `radius={[0,6,6,0]}` (horizontal), `fill="#3b82f6"`, `activeBar={{ fill: "#2563eb" }}`
- Grid: `stroke="#e2e8f0" strokeOpacity={0.5}`
- Tooltip: white card `bg-white border border-slate-200/60 rounded-xl shadow-lg px-4 py-3`
- Always wrap in `<ResponsiveContainer width="100%" height={N}>`

### AI insight cards
```tsx
<AiInsightCard title="...">Hardcoded Russian recommendation text.</AiInsightCard>
```
Uses violet tint. "ИИ-рекомендация" badge + Sparkles icon built into the component.

## Adding a New Page

1. Create `src/app/(portal)/[route]/page.tsx` with `"use client"`
2. Wrap content in `<MotionContainer>` with `<MotionItem>` per section
3. Start with `<PageHeader title="..." description="..." />`
4. Add mock data to `src/lib/mock/` if needed
5. Add navigation entry to `navGroups` in `src/components/layout/sidebar.tsx`

## Language

All user-facing text is in Russian. No i18n framework — strings are hardcoded.
TypeScript identifiers, status enum values, and CSS classes remain in English.
