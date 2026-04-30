---
name: pixel-connect-design
description: Design principles and style guide for the Pixel Connect (Connectivity) admin page.
---

# Pixel Connect Design Guide

This skill defines the design language for the Pixel Connect (Connectivity CRM) admin page. Follow these principles to maintain consistency in future modifications.

## Core Design Principles

1.  **High Contrast & High Density**: Bold, heavy typography combined with high-contrast color choices (primarily Black and White).
2.  **Modern Minimalist Modernity**: A sleek, premium look using large border radii and wide letter spacing for labels.
3.  **Visual Hierarchy**: Clear separation of sections using thick borders (`border-b-2 border-black`) and distinct background colors (`bg-black` vs `bg-white`).
4.  **Premium Micro-interactions**: Use of smooth transitions, subtle hover scales, and fade-in animations.

## Typography

- **Header 1**: `text-5xl font-black text-gray-900 tracking-tighter uppercase` (Example: "운영 대시보드")
- **Sidebar Menu Items**: `text-[11px] font-black uppercase tracking-widest` (Example: "고객 관리")
- **Labels (Small Capitals)**: `text-[10px] font-black uppercase tracking-widest` or `tracking-[0.4em]` (Used for category tags, small headers).
- **Body Text**: Default Inter font, `text-sm font-bold` or `text-gray-400`.

## UI Components

### Cards

- **Base Class**: `p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group`.
- **White Card**: `bg-white text-black border-gray-100`.
- **Black Card**: `bg-black text-white border-black`.
- **Stat Value**: `text-4xl font-black tracking-tighter`.
- **Decorative Icon**: `absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none`.

### Header & Navigation

- **Sidebar Width**: `w-72`.
- **Header Structure**: `h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30`.
- **Search Input (Modern)**: Use `bg-transparent text-sm font-medium focus:outline-none` with a custom focus underline: `<div className="absolute bottom-0 left-0 w-0 h-px bg-black group-focus-within:w-full transition-all duration-500"></div>`.
- **User Profile/Icons**: Large rounded squares (`rounded-2xl`) for avatars/icons.
- **Active Menu Item**: `bg-black text-white`.
- **Inactive Menu Item**: `text-gray-400 hover:bg-gray-50 hover:text-black`.
- **Border Radius**: `rounded-2xl` for menu buttons and icons.

### Layout & Spacing

- **Main Dashboard Container**: `w-full py-10 space-y-10`.
- **Section Gaps**: Use between `gap-6` to `gap-10` for grid layouts.
- **Page Container Max Width**: `max-w-7xl mx-auto`.

## Layout Details

- **Page Header**: Always includes a bottom border: `border-b-2 border-black pb-8`.
- **Alerts/Notifications**: Use `bg-black rounded-3xl p-6` for prominent info bars.

## Styling Rules

1.  **Do NOT use generic colors**: Avoid plain red, green, etc. unless absolutely necessary for status (and even then, use them subtly).
2.  **Maintain Consistent Corners**: Always use `rounded-[32px]` for major cards and `rounded-2xl` or `rounded-3xl` for smaller elements.
3.  **Typography Consistency**: Always use `font-black` and `tracking-tighter` or `tracking-widest` for headings/labels.
4.  **Animations**: All page containers should have `animate-in fade-in duration-700`.

## Example Component (JSX Reference)

```tsx
<div className="p-8 rounded-[32px] border bg-white border-gray-100 group">
  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
    Statistics
  </div>
  <div className="text-4xl font-black tracking-tighter mt-4">1,234</div>
</div>
```
