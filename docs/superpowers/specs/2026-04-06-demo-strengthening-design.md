# ENO Portal — Demo Strengthening Design

**Date:** 2026-04-06  
**Goal:** Strengthen three thin pages (Logistics, Fuel Analysis, Reports) so the demo holds up under interactive client use. All data remains static mock — no backend changes.

---

## Context

The portal is a demo/prototype for Etive Neft Oil (ENO). The client (management) and investors will both receive a link and click through the portal interactively. The three pages below are the weakest and need to be brought up to demo quality before sharing.

---

## Page 1: Logistics (`/logistics`)

### Current state
Transport comparison cards (plane/train/bus) + a basic upcoming trips table. No cost data, no interactivity, no KPIs.

### Changes

#### KPI Row (3 mini-cards)
Shown at the top, below `PageHeader`. Computed from the trips mock data:
- **Поездок в апреле** — count of all trips in `upcomingTrips`
- **Общая стоимость** — sum of all trip prices, formatted with `formatCurrency()`
- **Средняя стоимость** — total / count, formatted with `formatCurrency()`

Use `MiniKpiCard` from `@/components/shared/mini-kpi-card`.

#### Mock data update (`src/lib/mock/logistics.ts`)
Add `price: number` (UZS) to each `Trip` entry and update the `Trip` interface in `src/lib/types.ts`. Example prices: Авиа ~450 000, Ж/Д ~180 000, Автобус ~95 000 (with small variation per trip).

#### Trips table — add Стоимость column
New last column before Status: `Стоимость` — renders `formatCurrency(trip.price)` with `tabular-nums` class.

#### "Запланировать поездку" Dialog
Button in `PageHeader` actions slot: `+ Запланировать`. Opens a `Dialog` (small form, ≤4 fields):
- Оператор (Select — from `operators` mock)
- Направление (Select — "Алматы → Ташкент" | "Ташкент → Алматы")
- Транспорт (Select — Авиа | Ж/Д | Автобус)
- Дата выезда (plain `<input type="date">` styled with Tailwind)

On submit:
1. Derive price from transport type (Авиа=450 000, Ж/Д=180 000, Автобус=95 000)
2. If date is 3+ days from today, show a "−18% ранняя покупка" badge next to the price
3. Add new trip to local state (prepend to list)
4. Close dialog

All controlled fields. Validate: all fields must be filled before submit button is enabled.

#### AI Insight card
Update text to reference specific numbers: "Покупка за 3+ дня до вылета экономит в среднем 81 000 сум на авиабилете (−18% от 450 000 сум)."

---

## Page 2: Fuel Analysis (`/fuel-analysis`)

### Current state
4 status cards with traffic lights + 30-day chart + 3 AI insight cards. No summary KPIs, no daily burn rate.

### Changes

#### KPI Row (3 mini-cards)
Shown between `PageHeader` and the status cards. Computed from `filteredFuelStatus` (respects base filter):
- **Общий остаток** — sum of `volumeRemaining` across all filtered items, formatted with `formatNumber()` + " л"
- **Средний запас** — average `daysRemaining`, rounded, + " дней"
- **Требуют внимания** — count of items where `status === 'warning' || status === 'critical'`

Use `MiniKpiCard`.

#### Daily burn rate on status cards
Add one line to each status card below the progress bar:
```
Расход: ~{Math.round(item.volumeRemaining / item.daysRemaining / 1000)}к л/день
```
Shown in `text-xs text-stone-500`, left-aligned, beside the existing "Осталось / Хватит на" row.

No new mock data fields needed — computed from existing `volumeRemaining` and `daysRemaining`.

---

## Page 3: Reports (`/reports`)

### Current state
Filtered table (status/base/operator) + detail drawer with photo placeholder, weight before/after, seal number, vehicle data. No interactive actions.

### Changes

#### Approve / Reject buttons in drawer
In `ReportDetailSheet`, below the Status detail section, add an action row visible only when `report.status === 'pending'`:

```
[ ✓ Подтвердить ]   [ ✗ Отклонить ]
```

- "Подтвердить" — `bg-emerald-600 text-white`, on click: update report status to `'approved'` in parent state, close drawer
- "Отклонить" — `bg-rose-600 text-white`, on click: update report status to `'rejected'` in parent state, close drawer

State management: lift `reports` array into `useState` in the page component (initialized from the mock). The `setReports` updater is passed down to `ReportDetailSheet` via props. After status update, call `onClose()`.

No new mock data fields needed.

---

## Shared constraints

- All data is static mock — no API calls, no persistence between page reloads
- Follow existing design system: `stone-*` palette, `rounded-2xl`, card shadow pattern
- No new chart components needed
- Run `npx tsc --noEmit` after implementation — build must stay clean
- All user-facing text in Russian
