# Design System — Cơm Tấm Làng (Saigon Ops Fresh)
> Phiên bản: 2.0.0 · Cập nhật: 2026-07-07
> Source: tailwind.config.ts + chain-dashboard/c3-craft.html (emil-design-eng style)
> Implementation: **Tailwind CSS** (không phải raw CSS tokens)
> Đây là nguồn sự thật duy nhất (single source of truth). Mọi UI phải tuân theo.

---

## 1. Tổng quan

### 1.1 Triết lý: Saigon Ops Fresh
Kết hợp giữa **truyền thống F&B Việt** (ấm, đỏ, kem) và **hiện đại dashboard** (compact, dense, responsive). Màu ấm phản ánh thương hiệu Cơm Tấm Làng, layout dense tối ưu cho kế toán đọc nhanh số liệu.

### 1.2 Nguyên tắc cốt lõi
- **Warm, not cold**: palette đỏ/kem/nâu — phản ánh F&B truyền thống, không dùng cool blue
- **Dense data-first**: spacing compact (10-12px gap), ưu tiên hiển thị nhiều data trên 1 màn
- **Tabular numbers**: mọi số dùng `tabular-nums` + font mono cho align
- **Polished feedback**: hover có transform (translateY/translateX), shadow 3 lớp warm
- **Touch-first**: touch target ≥ 40px desktop, ≥ 44px mobile
- **Brand accent = red**: mọi CTA dùng `lang-red`, không dùng blue

### 1.3 Persona
- **Dùng cho**: web app dashboard kế toán F&B, admin panel chuỗi nhà hàng
- **Người dùng**: kế toán, quản lý, CEO, admin (không phải developer)
- **Thiết bị**: desktop chính (1280px+), mobile phụ (375px)

---

## 2. Color Tokens

### 2.1 Brand & Accent (Tailwind `lang-*`)
```ts
// tailwind.config.ts → theme.extend.colors.lang
lang: {
  red:      '#8F1D1D',   // Accent chính — CTA, sidebar active, link
  redDark:  '#641414',   // Hover/pressed cho red
  redDeep:  '#3F0D0D',   // Sidebar gradient end (đậm nhất)
  redSoft:  '#FFF1F0',   // Background nhạt cho red (alert danger bg)
}
```

### 2.2 Surface & Background
```ts
lang: {
  cream:    '#F6F3EE',   // Nền trang — kem ấm (không xám xanh)
  cream2:   '#FFFDF8',   // Surface phụ — gần trắng, ấm
  paper:    '#FFFDF8',   // Card surface — paper trắng kem
  mist:     '#FFF3DD',   // Highlight nhạt (warning bg nhẹ)
  surface:  '#FFFDF8',   // Alias paper
}
```

### 2.3 Neutral Warm (C-balance tầng trung tính)
```ts
lang: {
  hover:    '#F3EDE3',   // Hover row/button — trung tính ấm, không vàng đậm
  zebra:    '#FBF8F2',   // Zebra row table — nhạt hơn paper
  toolbar:  '#F4EFE6',   // Toolbar/filter bar — trung tính
}
```

### 2.4 Text
```ts
lang: {
  ink:      '#231A16',   // Text chính (gần đen nâu — contrast AAA trên paper)
  muted:    '#6F6254',   // Text phụ/hint (nâu xám — AA 4.6:1)
  brown:    '#4D3724',   // Text heading phụ (nâu đậm)
}
```

### 2.5 Border & Line
```ts
lang: {
  line:     '#EADFCF',   // Viền mặc định (kem đậm — ấm, không xám)
}
// Hover border: lang-line + opacity, hoặc lang-red/30
```

### 2.6 Semantic (trạng thái)
```ts
lang: {
  green:    '#22C55E',   // Success — good status, positive delta
  orange:   '#F97316',   // Warning accent — caution
  yellow:   '#F6C453',   // Warning bg/border — V3 warm (#F1D09B cho MetricCard)
  yellowSoft: '#FFF6D8', // Warning bg nhạt
}
// Danger: lang-red (#8F1D1D) + lang-redSoft bg
// External semantic: emerald-50/700, red-50/700, amber-50/900, blue-50/800 (Tailwind原生)
```

### 2.7 Chart Palette (mới — cho recharts)
```ts
// Line/Bar chart series colors — cân bằng warm + cool để dễ phân biệt
const CHART_COLORS = {
  primary:    '#8F1D1D',   // lang-red — series chính (doanh thu)
  secondary:  '#059669',   // emerald-600 — positive (tiền vào)
  tertiary:   '#dc2626',   // red-600 — negative (tiền ra, thất thoát)
  quaternary: '#2563EB',   // blue-600 — neutral data
  muted:      '#9ca3af',   // gray-400 — data phụ/empty
  // Net/dòng ròng: dùng lang-red (#7F1717) cho brand
};
// Donut/Pie: [lang-red, lang-yellow, emerald-600, blue-600, gray-400]
// Tooltip bg: white, border lang-line, font 12px
// Axis: text lang-muted 11px, grid #e5e7eb (gray-200 dashed)
```

### 2.8 Rules màu
- ❌ KHÔNG dùng raw hex trong component — LUÔN dùng `bg-lang-*`, `text-lang-*`
- ❌ KHÔNG trộn 2 hệ màu (lang-* vs raw Tailwind slate/blue) trong cùng component
- ✅ Accent = `lang-red` cho mọi CTA (button primary, link, active)
- ✅ Semantic dùng Tailwind nguyên sinh: `emerald-*`, `red-*`, `amber-*`, `blue-*`
- ✅ Chart colors theo CHART_COLORS constant — không random

---

## 3. Typography

### 3.1 Font
```css
font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
```
- 1 font duy nhất: **Inter** (cần add Google Fonts trong layout.tsx)
- Weight: 400 / 500 / 600 / 700 / 800 / 900
- ❌ KHÔNG dùng weight lạ (650, 750, 850)
- ❌ KHÔNG trộn font (không serif)

### 3.2 Type Scale (Tailwind class)
| Token | Size | Weight | Class | Dùng cho |
|---|---|---|---|---|
| Display | 32px | 800 | `text-[32px] font-extrabold` | KPI value lớn |
| H1 | 24px | 800 | `text-2xl font-extrabold` | Page title |
| H2 | 20px | 700 | `text-xl font-bold` | Card header |
| H3 | 16px | 800 | `text-base font-extrabold` | Card title |
| Body | 14px | 400-500 | `text-sm` | Default body |
| Data | 12.5px | 400 | `text-data` (custom) | Table cell dense |
| Label | 11px | 600 | `text-[11px] font-semibold uppercase` | KPI label, table header |
| Caption | 12px | 500 | `text-xs font-medium` | Meta, hint |
| Micro | 10px | 700 | `text-[10px] font-bold uppercase` | Badge, nav badge |

### 3.3 Line Height
- Body: `leading-5` (20px / 1.4)
- Heading: `leading-tight` (1.1-1.2)
- KPI value: `leading-none` (1 — compact)

### 3.4 Tabular Numbers (BẮT BUỘC)
```css
.number { font-variant-numeric: tabular-nums; }
```
- Class `.number` apply cho: số tiền, số lượng, %, mọi data numeric
- Lý do: cột số căn đều, dễ so sánh

### 3.5 Gradient Text (chỉ cho KPI nổi bật)
```css
.grad-text {
  background: linear-gradient(120deg, var(--lang-red), var(--lang-brown));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
- Chỉ dùng cho: **KPI value nổi bật**, **display number**
- ❌ Không dùng cho body text

---

## 4. Spacing

### 4.1 Scale (dense-friendly, 4px base)
```ts
// Tailwind defaults + custom cho dense
--sp-0.5: 2px    // gap-0.5
--sp-1:   4px    // gap-1
--sp-1.5: 6px    // gap-1.5 (dense)
--sp-2:   8px    // gap-2
--sp-2.5: 10px   // gap-2.5 (dense dashboard)
--sp-3:   12px   // gap-3
--sp-4:   16px   // gap-4
--sp-5:   20px   // gap-5
--sp-6:   24px   // gap-6
--sp-8:   32px   // gap-8
```

### 4.2 Rules
- ✅ Dense dashboard cho phép 6px, 10px gap (không cấm như v1.0)
- ✅ Section gap: `space-y-2.5` (10px) — compact cho kế toán
- ✅ Card padding: `p-3` (12px compact) hoặc `p-4` (16px standard)
- ✅ KPI grid gap: `gap-2` (8px)
- ❌ KHÔNG dùng giá trị lạ (7, 9, 11, 13, 15, 17)

---

## 5. Border Radius (Tailwind)

```ts
// Mapping Tailwind radius → semantic
--r-xs:   6px    // rounded-md     — small chip
--r-sm:   8px    // rounded-lg     — button, input, sidebar item
--r-md:   10px   // rounded-[10px] — KPI card, badge
--r-lg:   12px   // rounded-xl     — card, panel
--r-xl:   16px   // rounded-2xl    — hero box, modal
--r-full: 999px  // rounded-full   — pill, avatar
```

### Rules
- 4 cấp chính: `rounded-lg` (8) / `rounded-xl` (12) / `rounded-2xl` (16) / `rounded-full`
- ❌ KHÔNG dùng 6+ giá trị khác nhau
- ✅ Inner radius < outer radius (nested elements)

---

## 6. Shadow (3 lớp warm)

```ts
// tailwind.config.ts → theme.extend.boxShadow
shadow: {
  soft:  '0 8px 22px rgba(80, 50, 20, 0.06)',    // Button, chip, input
  card:  '0 18px 42px rgba(80, 50, 20, 0.10)',   // Card, KPI, panel (mặc định)
  glow:  '0 16px 32px rgba(143, 29, 29, 0.16)',  // Hover card, CTA emphasis
}
// Lưu ý: rgba dùng (80, 50, 20) — nâu ấm, KHÔNG dùng slate (15, 23, 42)
```

### Usage
| Cấp | Class | Dùng cho |
|---|---|---|
| soft | `shadow-soft` | Button secondary, chip, user-pill, input |
| card | `shadow-card` | Card, KPI (mặc định) |
| glow | `shadow-glow` | Card hover, CTA primary, modal |

### Hover Lift
```css
.card { box-shadow: var(--shadow-card); transition: transform .3s, box-shadow .3s; }
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow); }
```

---

## 7. Motion

### 7.1 Easing
```css
--ease: cubic-bezier(.4, 0, .2, 1);   /* Craft mặc định */
--t-fast: .15s;
--t-base: .2s;
--t-slow: .3s;
```

### 7.2 Rules
- ✅ Mọi transition dùng `cubic-bezier(.4,0,.2,1)` — Tailwind `transition-all duration-200`
- ✅ Hover: `duration-200` (button, item) hoặc `duration-300` (card lift)
- ✅ `hover:-translate-y-0.5` cho button (translateY -2px)
- ✅ `hover:-translate-y-1` cho card (translateY -4px)
- ✅ `hover:translate-x-0.5` cho sidebar item (translateX 2px)
- ❌ KHÔNG animate `width`, `height`, `top`, `left`
- ❌ KHÔNG transition `all` (liệt kê properties cụ thể khi cần perf)

### 7.3 Reduced Motion (BẮT BUỘC)
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

---

## 8. Layout

### 8.1 App Shell
```
┌──────────┬───────────────────────────────┐
│          │  Topbar h-[52px]              │
│ Sidebar  │  (title + actions + user)     │
│ 72px     ├───────────────────────────────┤
│ (mobile: │                               │
│ drawer)  │  Main content (scroll)        │
│          │  padding: 10px 16px           │
└──────────┴───────────────────────────────┘
```
- Sidebar: 72px collapsed (icon only), 260px expanded
- Sidebar bg: `linear-gradient(180deg, #7F1717, #531010)` — dark red warm
- Main: `overflow-y: auto`, `p-4` (16px) hoặc `p-2.5` (10px compact)
- Topbar: `h-[52px]` sticky, bg `#F6F3EE/95 backdrop-blur`

### 8.2 Breakpoints (Tailwind)
```css
sm:  640px   /* mobile landscape */
md:  768px   /* tablet portrait */
lg:  1024px  /* tablet landscape / small desktop */
xl:  1280px  /* desktop */
2xl: 1536px  /* large desktop */
```

### 8.3 Grid Patterns
- **KPI grid**: `grid gap-2 sm:grid-cols-2 lg:grid-cols-5` (5 cột desktop)
- **Chart row**: `grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]` (2 cột lệch)
- **Table**: full width, `overflow-auto`, sticky header

### 8.4 Sidebar Structure
```
┌─────────────────────────┐
│ Brand logo (58px h)     │
├─────────────────────────┤
│ Section: TỔNG QUAN      │  ← uppercase, text-white/60, text-[10px]
│   ◎ Tổng quan           │  ← active: bg-white/12
│   ◎ Nhiệm vụ            │
│ Section: NHẬP LIỆU      │
│   ◎ Upload              │
│   ...                   │
└─────────────────────────┘
```
- Text trắng trên dark red
- Active: `bg-white/12 text-white`
- Hover: `bg-white/8`

---

## 9. Components

### 9.1 Button
| Variant | Class | Background | Text | Hover |
|---|---|---|---|---|
| Primary | `bg-lang-red` | lang-red | white | `bg-lang-redDark -translate-y-0.5` |
| Secondary | `border-lang-line bg-lang-paper` | paper | ink | `bg-lang-hover -translate-y-0.5` |
| Danger | `bg-lang-red` (icon trash) | red | white | `bg-lang-redDark` |
| Disabled | `bg-lang-cream text-lang-muted` | cream | muted | `cursor-not-allowed` |

**Spec:**
- Height: `h-9` (36px) hoặc `h-10` (40px mobile)
- Padding: `px-3` (12px)
- Radius: `rounded-lg` (8px)
- Font: `text-[13px] font-bold`
- Shadow: `shadow-soft`
- Transition: `transition-all duration-200`

### 9.2 KPI Card (MetricCard)
```tsx
<div className="min-h-[112px] rounded-lg border shadow-soft p-4">
  <p className="text-[12px] font-semibold text-lang-muted">{label}</p>
  <StatusBadge status={status} />
  <p className="number text-[23px] font-bold text-lang-ink">{value}</p>
  <p className="text-[12px] font-semibold">{trend}</p>
</div>
```
**Variant bg theo status:**
- good: `border-emerald-200 bg-emerald-50/35`
- warning: `border-[#F1D09B] bg-lang-toolbar` (V3 warm)
- danger: `border-red-200 bg-red-50/70`
- neutral: `border-lang-line bg-lang-paper`

### 9.3 Card
```tsx
<div className="rounded-lg border border-lang-line bg-lang-paper p-4 shadow-soft">
  <CardTitle>Tiêu đề</CardTitle>
  {/* content */}
</div>
```
- Radius: `rounded-lg` hoặc `rounded-xl`
- Header: `pb-2 border-b border-lang-line`
- Title: `text-base font-extrabold text-lang-ink`

### 9.4 Sidebar Item
```tsx
<Link className="flex h-9 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold hover:bg-white/8 hover:translate-x-0.5">
  <Icon className="h-4 w-4" />
  <span>Label</span>
</Link>
```
- Active: `bg-white/12 text-white shadow-soft`
- Badge: `bg-white/15 text-white rounded-full text-[9px]`

### 9.5 Table (ReportTable)
```tsx
<table className="w-full text-[12.5px]">
  <thead className="bg-lang-toolbar sticky top-0">
    <tr><th className="px-3 py-2 text-left text-[11px] font-bold uppercase text-lang-muted">Header</th></tr>
  </thead>
  <tbody>
    <tr className="border-b border-lang-line hover:bg-lang-hover">
      <td className="px-3 py-2">Data</td>
      <td className="number px-3 py-2 text-right font-bold">123.456đ</td>
    </tr>
  </tbody>
</table>
```
- Header: `bg-lang-toolbar`, uppercase, lang-muted
- Cell: `py-2 px-3` (8px 12px)
- Numeric: `.number` right-align + tabular-nums
- Zebra: `even:bg-lang-zebra`
- Hover: `hover:bg-lang-hover`
- Container: `overflow-auto max-h-[Xpx]`

### 9.6 Badge / Chip
| Variant | Class | Color |
|---|---|---|
| Up/positive | `bg-emerald-50 text-emerald-700` | green |
| Down/negative | `bg-red-50 text-red-700` | red |
| Warning | `bg-amber-50 text-amber-900` | amber |
| Neutral | `bg-lang-mist text-lang-brown` | warm |

- Padding: `px-2 py-0.5`
- Radius: `rounded-full`
- Font: `text-[10px] font-bold`

### 9.7 Alert (AlertPanel)
```tsx
<div className="rounded-lg border border-red-200 bg-red-50/70 p-2.5">
  <AlertTriangle className="h-4 w-4 text-red-800" />
  <p className="text-[12px] font-black text-red-800">{title}</p>
  <p className="text-[11px] font-semibold text-lang-muted">{detail}</p>
  <div className="bg-white/60 p-1">
    <Lightbulb className="h-3 w-3 text-amber-600" />
    <p>Đề xuất: {suggestion}</p>
  </div>
</div>
```
- 3 severity: critical (red), warning (amber), info (blue)
- Mỗi alert có: title + detail + suggestion

### 9.8 Charts (recharts)
- **LineChart**: `TrendLineChart` — 3 series (cashIn green, cashOut red, net lang-red)
- **BarChart**: `TopMoversBarChart` — vertical bar, color theo positive/negative
- Tooltip: white bg, lang-line border, 12px font
- Axis: lang-muted 11px, grid gray-200 dashed
- Empty state: "Chưa đủ dữ liệu" dashed border placeholder

### 9.9 StatusBadge
| Status | Color | Label |
|---|---|---|
| Tốt / good | emerald | "Tốt" |
| Cần đối chiếu / warning | amber | "Cần đối chiếu" |
| Đỏ / danger | red | "Đỏ" |
| Chưa đủ dữ liệu / neutral | lang-muted | "Chưa đủ dữ liệu" |

---

## 10. Iconography

### 10.1 Library: **Lucide React** (đã cài)
```tsx
import { AlertTriangle, FileInput, ShieldCheck } from 'lucide-react';
<AlertTriangle className="h-4 w-4 text-lang-red" aria-hidden="true" />
```
- Size: `h-4 w-4` (16px inline), `h-5 w-5` (20px sidebar), `h-6 w-6` (24px feature)
- Stroke: 2px (default), color = `currentColor` hoặc `text-lang-*`
- ❌ KHÔNG dùng emoji làm primary icon (chỉ decorative)

### 10.2 Icon cho module tabs
| Module | Icon |
|---|---|
| Tổng quan | Home |
| Nhiệm vụ | ClipboardCheck |
| Import | FileInput |
| Doanh thu | DollarSign |
| Kho cửa hàng | Store |
| Kho BTT | Archive |
| Tài chính | Scale |
| Lương | Users |
| Báo cáo | FileText |
| Tài liệu | BookOpen |
| Cài đặt | Settings |

---

## 11. Accessibility (A11y)

### 11.1 Bắt buộc
```css
/* Focus ring rõ */
*:focus-visible {
  outline: 2px solid theme('colors.lang.red');
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

### 11.2 Semantic HTML
- `<nav aria-label="Điều hướng chính">` cho sidebar
- `<main id="main">` cho content
- `<button type="button">` cho mọi interactive
- `aria-hidden="true"` cho decorative icon
- `aria-label` cho icon-only button

### 11.3 Contrast (verified)
| Element | Ratio | Status |
|---|---|---|
| lang-ink trên lang-paper | 14:1 | AAA ✓ |
| lang-muted trên lang-paper | 5.2:1 | AA ✓ |
| lang-red trên white | 5.1:1 | AA ✓ |
| White trên lang-red | 5.1:1 | AA ✓ |

### 11.4 Touch Target
- Sidebar item: `h-9` (36px) → `h-11` (44px) mobile
- Button: `h-9` → `h-11` mobile
- KPI card: click-to-detail (toàn card click được)

---

## 12. Interaction Patterns

### 12.1 Hover States
| Element | Hiệu ứng | Class |
|---|---|---|
| Button primary | bg dark hơn + translateY | `hover:bg-lang-redDark hover:-translate-y-0.5` |
| Button secondary | translateY + shadow | `hover:bg-lang-hover hover:-translate-y-0.5` |
| Card | translateY + shadow glow | `hover:-translate-y-1 hover:shadow-glow` |
| Sidebar item | bg + translateX | `hover:bg-white/8 hover:translate-x-0.5` |
| Table row | bg hover | `hover:bg-lang-hover` |
| Alert | translateX | `hover:translate-x-0.5` |

### 12.2 Active States
- Sidebar active: `bg-white/12 text-white shadow-soft`

### 12.3 Disabled
- `opacity-60 cursor-not-allowed`
- KHÔNG có hover effect

---

## 13. Responsive Behavior

| Breakpoint | Sidebar | KPI grid | Chart | Table |
|---|---|---|---|---|
| > 1280px (xl) | 72px collapsed / 260px expand | 5 cột | 2 cột (1.6fr/1fr) | Full + sticky |
| 1024-1280 (lg) | 72px | 4 cột | 2 cột | Full |
| 768-1024 (md) | 72px | 2-3 cột | 1 cột | Scroll x |
| < 768 (sm) | Drawer (hamburger) | 1-2 cột | 1 cột | Card list |

### Mobile sidebar
- `<button onClick={toggleMenu}>` hamburger trong Topbar
- Sidebar: `fixed -left-[280px] transition-all duration-200`
- Open: `left-0`
- Overlay: `bg-black/40` click to close

---

## 14. Dark Mode (đề xuất — chưa implement)

```ts
// tailwind.config.ts
darkMode: 'class'  // toggle bằng .dark class

// Color mapping
lang: {
  // Light (mặc định)
  cream: '#F6F3EE',
  // Dark
  '@dark': {
    cream: '#1A1410',     // nền dark — nâu đen
    paper: '#241B16',     // card dark
    ink: '#F6F3EE',       // text ngược
    muted: '#A89888',     // text phụ dark
    line: '#3D2F24',      // viền dark
  }
}
```
- Sidebar dark mode: giữ gradient red (đã dark)
- Charts: invert grid color, giữ series colors

---

## 15. Anti-Patterns (KHÔNG làm)

| ❌ Sai | ✅ Đúng |
|---|---|
| Raw hex `color: #8F1D1D` | `text-lang-red` (token) |
| Cool blue accent `#3B82F6` | `lang-red` (warm brand) |
| Font-weight 650/750 | Chỉ 400/500/600/700/800/900 |
| Transition `all .2s` (perf) | Liệt kê: `transition-colors duration-200` |
| Shadow slate rgba(15,23,42) | Shadow warm rgba(80,50,20) |
| Hover không transform | Hover phải có translateY/translateX |
| Easing `linear` | `cubic-bezier(.4,0,.2,1)` (Tailwind default) |
| Emoji as primary icon | Lucide SVG |
| Body text 13px | Body 14px+, data 12.5px |
| Outline:none | `focus-visible:ring-2` |
| 2 hệ màu conflict | 1 hệ lang-* + Tailwind semantic |

---

## 16. Checklist Production

Trước khi ship, verify:
- [ ] Mọi màu dùng `lang-*` token hoặc Tailwind semantic (grep `#[0-9A-F]` = 0 trong component)
- [ ] Mọi spacing dùng Tailwind scale (2/4/6/8/10/12/16/20/24)
- [ ] Mọi radius dùng `rounded-lg/xl/2xl/full`
- [ ] Mọi shadow dùng `shadow-soft/card/glow`
- [ ] Mọi hover có transform (translate/scale)
- [ ] `focus-visible:ring-2` trên mọi interactive
- [ ] `prefers-reduced-motion` có
- [ ] Touch target ≥ 36px desktop / 44px mobile
- [ ] Contrast AA pass
- [ ] Responsive: test 1280 / 1024 / 768 / 375
- [ ] `.number` class trên mọi cột số (tabular-nums)
- [ ] `aria-label` cho nav, `aria-hidden` cho decorative icon
- [ ] Chart colors theo CHART_COLORS constant
- [ ] Lucide icon (không emoji primary)

---

## 17. File Structure (thực tế)

```
src/
├── components/
│   ├── ui/
│   │   ├── Card.tsx           ← Card + CardTitle
│   │   └── Button.tsx
│   ├── report/
│   │   ├── MetricCard.tsx     ← KPI card
│   │   ├── ReportTable.tsx    ← Dense data table
│   │   ├── StatusBadge.tsx
│   │   └── ChartCard.tsx      ← CSS bar (legacy)
│   ├── charts/                ← Phase mới (recharts)
│   │   ├── TrendLineChart.tsx
│   │   ├── TopMoversBarChart.tsx
│   │   ├── AlertPanel.tsx
│   │   └── KpiDelta.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx        ← Dark red gradient
│   │   ├── TopBar.tsx
│   │   └── PageHeader.tsx
│   └── dashboard/
│       ├── AccountingOverviewCompactPage.tsx
│       └── CeoCockpitPage.tsx
├── styles/
│   └── globals.css            ← Tailwind directives
├── lib/
│   └── tailwind.config.ts     ← File này (tokens)
└── DESIGN-SYSTEM.md           ← File này
```

---

## 18. Tailwind ↔ Token Mapping

```ts
// tailwind.config.ts (đã có)
colors: { lang: { red, redDark, cream, paper, ink, muted, line, ... } }
boxShadow: { soft, card, glow }
fontSize: { data: ['12.5px', { lineHeight: '1.4' }] }

// Cần bổ sung (đề xuất):
extend: {
  colors: {
    chart: {                   // Chart palette mới
      primary: '#8F1D1D',
      positive: '#059669',
      negative: '#dc2626',
      neutral: '#2563EB',
      muted: '#9ca3af'
    }
  },
  transitionTimingFunction: {
    craft: 'cubic-bezier(.4, 0, .2, 1)'
  }
}
```

---

## 19. Versioning

| Phiên bản | Ngày | Thay đổi |
|---|---|---|
| 1.0.0 | 2026-07-05 | Khởi tạo Craft Modern (cool blue) — KHÔNG dùng |
| 2.0.0 | 2026-07-07 | **Rewrite match code**: warm palette, Tailwind mapping, chart colors, Lucide, dense spacing |

---

**EOF · Design System Cơm Tấm Làng v2.0.0 (Saigon Ops Fresh)**
