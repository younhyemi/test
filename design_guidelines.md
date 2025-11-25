# Design Guidelines: Mobile Restaurant Order Management System

## Design Approach
**Design System**: Material Design 3 - optimized for mobile touch interfaces with clear component states and excellent accessibility for utility applications.

**Design Philosophy**: Function-first interface prioritizing speed, clarity, and error prevention for busy restaurant staff operating under pressure.

---

## Core Design Elements

### Typography
- **Primary Font**: Roboto (Google Fonts)
- **Headings**: 24px/bold (page titles), 20px/semibold (section headers)
- **Body**: 16px/regular (minimum for mobile readability)
- **Buttons**: 18px/medium
- **Price/Numbers**: 18px/semibold (tabular figures for alignment)
- **Small Labels**: 14px/regular (secondary info only)

### Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12 system
- Card padding: `p-6`
- Button spacing: `space-y-4`
- Section gaps: `gap-8`
- Screen padding: `p-4` (mobile), `p-6` (larger screens)

**Container**: `max-w-2xl mx-auto` (optimized reading width for single-column mobile layout)

---

## Component Library

### Navigation
**Main Dashboard** (index.html):
- Full-width card buttons in vertical stack
- Each card: 80px height minimum
- Icon + Label layout (icon left, 32px size)
- Icons: 🛠️ 관리 | 🧾 주문 | 📋 주문확인 | ✅ 음식확인 | 💰 계산

**Header**: 
- Fixed top bar with page title (centered)
- Back button (left) on sub-pages
- Height: 64px

### Forms
**Input Fields**:
- Height: 56px
- Full-width with clear labels above
- Number inputs trigger numeric keyboard
- Rounded corners: `rounded-lg`

**Number Steppers** (+/- buttons):
- 3-button group: [−] [qty] [+]
- Each button: 48px × 48px minimum
- Display: `text-2xl` for quantity number
- Spacing: `gap-2` between buttons

### Cards
**Menu/Order Cards**:
- Full-width with `rounded-xl` corners
- Padding: `p-6`
- Shadow: `shadow-md`
- Spacing between cards: `space-y-4`

**Card Content Structure**:
```
[메뉴명 - bold, 18px]
[가격 - semibold, 16px]
[Action buttons row - right-aligned]
```

### Buttons
**Primary Action** (주문등록, 계산완료):
- Fixed bottom bar: 72px height
- Full-width minus padding
- `rounded-t-2xl` only (flat bottom)
- Font: 20px/bold
- Minimum touch target: 60px

**Secondary Actions** (수정, 삭제, 마감):
- Inline buttons: 44px height
- Padding: `px-6 py-3`
- `rounded-lg`
- Spacing: `gap-3` in button groups

**Icon Buttons**:
- 48px × 48px (checkbox alternatives)
- Centered icon, 24px size

### Data Display
**Lists**:
- Card-based, not tables
- Vertical scroll only
- Pull-to-refresh consideration

**Customer Name Groups**:
- Accordion-style expansion
- Name header: 56px height, chevron right
- Expanded content: indented `pl-4`

**Price Display**:
- Right-aligned in cards
- Bold weight for totals
- Format: "₩15,000" (comma separators)

### Modals/Dialogs
**Confirmation Dialog** (주문취소):
- Centered overlay
- Max-width: 320px
- Title: 20px/bold
- Message: 16px/regular
- Button pair: [취소] [확인]

### States
**Empty States**:
- Centered icon (64px) + message
- Gray text with helpful guidance
- "아직 주문이 없습니다" style messaging

**Loading States**:
- Spinner: 40px centered
- Skeleton screens for lists

**Success Feedback**:
- Toast notifications (bottom)
- 3-second auto-dismiss
- Green accent for success actions

---

## Interaction Patterns
- **Single Tap Only**: No swipe gestures or long-press
- **Instant Feedback**: Active state on all touchable elements
- **Confirmation Required**: Destructive actions (delete, cancel order)
- **Auto-focus**: First input on page load
- **Scroll Restoration**: Return to previous scroll position on back navigation

---

## Accessibility
- Minimum 44px touch targets (WCAG 2.5.5)
- High contrast ratios for text
- Clear focus indicators
- Semantic HTML form elements
- Large, readable fonts throughout

---

## Images
**No hero images required** - this is a functional admin interface. All visual communication through icons, typography, and component design.

---

## Performance Considerations
- Minimize page transitions (use modals/accordions where appropriate)
- Optimistic UI updates (update UI before server confirmation)
- Clear visual feedback for all actions
- Fast tap response (<100ms perceived delay)