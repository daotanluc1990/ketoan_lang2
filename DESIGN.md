# Design System

## Direction

Base system: Saigon Ops Fresh, evolved from Executive Ledger Warm.

Supporting patterns:
- Operations Control Room for overview, accounting tasks, report close, alert queues.
- Accounting Workbench Dense for revenue, inventory, finance, payroll, import, and other data-heavy tabs.

This app is an internal accounting and operations dashboard for Com Tam Lang. It should feel warm, professional, fast to scan, trustworthy, and visibly connected to Vietnamese F&B operations. It should not feel like a bank trading terminal, a playful game UI, or a documentation portal.

## Principles

1. Tables are the primary workspace.
2. Alerts must include severity, owner, deadline, and next action.
3. Missing data must be visible and explain what to upload or why a report is closed with exception.
4. Desktop density is intentional; the user should not scroll through decorative cards before seeing data.
5. Documents and AI are support surfaces, never the center of the app.

## Tokens

- Primary: grounded Com Tam Lang red `#A61919`.
- Primary dark/sidebar: oxblood `#6F1515`.
- Primary deep: `#3F0D0D`.
- Background: cool operational neutral `#F5F7FA`.
- Surface: white `#FFFFFF`.
- Sidebar: white `#FFFFFF` with red active states.
- Table header / control surface: cool mist `#EEF2F7`.
- Line: cool gray `#D8E0EA`.
- Text: operational ink `#172033`.
- Muted text: `#64748B`.
- Success accent: fresh green `#22C55E`.
- Warning accent: warm amber `#F6C453`.
- Action warning accent: clay orange `#F97316`.

## Component Rules

### App Shell

- Left sidebar is fixed.
- Expanded sidebar is white with dark text; active items use a soft red surface and brand red icon/text.
- Desktop content must reserve the current sidebar width.
- Header and global filters stay compact.
- Sidebar may collapse, but expanded state must never cover content.

### Tables

- Use dense rows.
- Freeze the first two columns for wide tables.
- Use tabular numbers.
- Status values render as badges.
- Tables scroll internally, not by stretching the page.
- Table headers use the herb-mist surface, not plain gray.
- Rows can use a very subtle fresh-neutral hover/zebra state.

### KPI Cards

- Compact cards only.
- Value is the visual anchor.
- Status is visible in the top right.
- Danger and warning states may tint the whole card subtly; no large side stripes.
- Cards use 8px radius, white surface, green-gray border, and a slightly warmer shadow.

### Alerts And Tasks

- Use an action queue pattern: severity, issue/task, owner, deadline, next action.
- Keep red/orange obvious but restrained.
- Do not create standalone sidebar tabs for alerts, reconciliation, AI, or data quality.

### Import

- Import must be preview-first.
- Confirm writes only after preview passes.
- Auth/permission errors must explain what user action is needed.

## Bans

- No decorative dark/neon system for the whole app.
- No playful game styling, glow-heavy controls, ribbons, or emojis as structure.
- No side stripe borders greater than 1px.
- No gradient text.
- No glassmorphism as default.
- No large hero metrics before operational data.
