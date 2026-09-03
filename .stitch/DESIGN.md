# VocalHub 2026 Refined Design System

## Product
VocalHub is a focused Vietnamese vocabulary-learning workspace for importing CSV/XLSX files and studying vocabulary quickly. The UI is desktop-first and responsive to 390px mobile.

## Visual direction
- Light, trustworthy, compact, content-first interface with polished 2026 SaaS/EdTech depth.
- Preserve the existing layout and flow; visual refinement only.
- Use subtle teal-to-mint radial washes only in dashboard/header regions. Keep study screens calm.
- Use layered soft shadows and tonal elevation instead of flat borders; primary cards may use 12-16px radius while compact controls stay 6-8px.
- Vietnamese copy throughout the interface.

## Color tokens
- Canvas: #F7F8FA
- Surface: #FFFFFF
- Text primary: #17202A
- Text secondary: #5B6673
- Border: #D9DEE5
- Accent teal: #0F766E
- Accent hover: #115E59
- Accent soft: #DDF4F0
- Success: #15803D
- Warning: #B45309
- Danger: #B42318
- Focus ring: #14B8A6
- Mint accent: #99F6E4
- Status new: #E0F2FE with #2457A6
- Status learning: #FEF3C7 with #9A6500
- Status mastered: #DCFCE7 with #176B3A

## Typography
- Font: Inter, fallback system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif.
- H1: 32-36px/40-42px, weight 700-750.
- H2: 22-24px/28-30px, weight 700.
- Body: 14-16px, line-height at least 1.5.
- Labels and helper text: 12-13px.
- Do not use all caps for UI copy.
- Important values such as 18, 120, 7 days, and 8/10 use a strong hero-stat hierarchy.

## Layout
- Desktop content max-width 1280px.
- Sidebar 248px expanded, 72px collapsed; hidden during study sessions.
- Desktop gutter 32px, mobile gutter 16px; grid gap 16px.
- Primary card radius 12-16px; compact control radius 6-8px; touch targets at least 44px.
- Use 150-200ms ease-out hover lift and press-scale transitions.

## Accessibility and interaction
- Every icon-only button has a Vietnamese aria-label and tooltip.
- Use visible focus rings and reading-order tab flow.
- Never communicate state by color alone; pair color with labels or icons.
- Confirm destructive actions. Toasts use role=status. Form errors use inline messages and aria-describedby.
- Flashcards support Space to flip and Escape to exit. Quiz supports number keys and Tab/Enter.
- Use restrained fade-cross/flip motion for flashcards, animated progress, and slide/fade toasts.
- Summary keeps all existing labels while emphasizing 8/10 with a circular progress ring and a compact distribution chart.

## Content examples
- Deck: TOEIC Part 5 — Công việc, 120 từ, 18 cần ôn hôm nay.
- Vocabulary: allocate — phân bổ; deadline — hạn chót; negotiate — đàm phán; reliable — đáng tin cậy.
- Statuses: Mới, Đang học, Đã thuộc.