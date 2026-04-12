# Fix Sidebar State Conflict and Tailwind Class Issues

## Problem Summary
The "deepseek" commit (54 files, +12,729/-3,896 lines) introduced a massive UI overhaul that broke the sidebar in the Builder workspace due to:
1. **Triple-layer state conflict** between `useDesktopBreakpoint`, `CollapsibleSidePanel`, and `BuilderSidebar`
2. **Dynamic Tailwind class failure** with `w-[${sidebarWidth}px]`

## Fix A: Resolve Triple-Layer State Conflict

### Files to modify:
- `src/components/ui/CollapsibleSidePanel.tsx`
- `src/modules/ai-content/adapters/components/builder/layout/BuilderSidebar.tsx`

### Changes:
1. **Remove `isExpanded`/`isPinned` localStorage persistence from `CollapsibleSidePanel`** - The parent `BuilderSidebar` and `useDesktopBreakpoint` already manage visibility. `CollapsibleSidePanel` should be a controlled component that renders based on props, not its own persisted state.
2. **Remove the collapsed icon-bar render path from `CollapsibleSidePanel`** (lines 153-253) - The `BuilderSidebar` already handles the collapsed state (`isCollapsed` on line 16). Having two components each rendering their own collapsed state creates the empty-space bug.
3. **Make `CollapsibleSidePanel` purely controlled**: Remove internal `isExpanded` state, remove `persistState` prop, and let the parent dictate visibility via `activeKey`.

## Fix B: Fix Dynamic Tailwind Class in BuilderSidebar

### File: `src/modules/ai-content/adapters/components/builder/layout/BuilderSidebar.tsx`

### Changes:
1. **Remove the dynamic Tailwind class** on line 77: `w-[${sidebarWidth}px]` cannot be compiled by Tailwind's JIT.
2. **Rely solely on inline `style` prop** for dynamic width (already on line 105).
3. **Use a static fallback class** for the collapsed state only: `w-[72px]` (which is fine since it's static).

## Fix C: Update Type Definitions

### File: `src/modules/ai-content/adapters/components/builder/layout/types.ts`

### Changes:
1. Add `shortcut?: string` and `badge?: number` to `SidebarPanelConfig` to match what `useSidebarPanels` provides.
2. Add `isResizable?: boolean` to `BuilderSidebarProps`.

## Fix D: Fix Keyboard Shortcut Conflicts

### File: `src/components/ui/CollapsibleSidePanel.tsx`

### Changes:
1. Add input/textarea target check to the number key handler (lines 106-114) to prevent panel switching while typing.

## Implementation Order
1. Fix B (simple, high impact)
2. Fix A (complex, root cause)
3. Fix C (type safety)
4. Fix D (UX improvement)
