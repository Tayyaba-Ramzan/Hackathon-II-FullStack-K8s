# UI Component Contracts

**Feature**: 003-frontend-ui
**Created**: 2026-02-23
**Status**: Draft

## Overview

This document defines the interface contracts for all reusable UI components in the frontend application. Each component follows atomic design principles and has clearly defined props, events, and behavior.

## Component Hierarchy

```
Pages (Templates)
├── Landing Page
├── Signup Page
├── Signin Page
└── Dashboard Page

Organisms
├── TaskList
├── TaskForm
├── AuthForm
└── Header

Molecules
├── TaskCard
├── TaskFilter
├── EmptyState
└── LoadingSpinner

Atoms
├── Button
├── Input
├── Textarea
├── Checkbox
└── ErrorMessage
```

## Atomic Components

### Button

**Purpose**: Reusable button with consistent styling and loading states

**Props**:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}
```

**Behavior**:
- Shows loading spinner when `isLoading` is true
- Disables interaction when `disabled` or `isLoading`
- Applies variant-specific colors and hover states
- Supports keyboard navigation (Enter/Space)

**Accessibility**:
- `aria-disabled` when disabled
- `aria-busy` when loading
- Proper focus indicators

---

### Input

**Purpose**: Text input field with validation and error display

**Props**:
```typescript
interface InputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
}
```

**Behavior**:
- Displays label above input if provided
- Shows error message below input if error exists
- Applies error styling when error is present
- Supports controlled component pattern

**Accessibility**:
- Associates label with input via `htmlFor`
- `aria-invalid` when error exists
- `aria-describedby` for error messages
- `aria-required` when required

---

### Textarea

**Purpose**: Multi-line text input for longer content

**Props**:
```typescript
interface TextareaProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}
```

**Behavior**:
- Auto-resizes based on content (optional)
- Shows character count if maxLength provided
- Same validation and error display as Input

**Accessibility**:
- Same as Input component

---

### Checkbox

**Purpose**: Toggle control for boolean values

**Props**:
```typescript
interface CheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}
```

**Behavior**:
- Toggles on click or Space key
- Visual feedback on hover and focus
- Displays checkmark when checked

**Accessibility**:
- `aria-checked` reflects state
- Keyboard navigable
- Focus indicators

---

### ErrorMessage

**Purpose**: Consistent error message display

**Props**:
```typescript
interface ErrorMessageProps {
  message: string;
  className?: string;
}
```

**Behavior**:
- Displays error text with icon
- Red color scheme
- Dismissible (optional)

**Accessibility**:
- `role="alert"` for screen readers
- `aria-live="polite"`

---

## Molecular Components

### TaskCard

**Purpose**: Display individual task with actions

**Props**:
```typescript
interface TaskCardProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}
```

**Behavior**:
- Displays task title, description, completion status
- Shows formatted timestamps (created/updated)
- Hover reveals action buttons (Edit, Delete)
- Click on checkbox toggles completion
- Strikethrough styling for completed tasks
- Loading state disables interactions

**Events**:
- `onToggle`: Fired when checkbox clicked
- `onEdit`: Fired when Edit button clicked
- `onDelete`: Fired when Delete button clicked

**Accessibility**:
- Checkbox has proper label
- Action buttons have descriptive labels
- Keyboard navigable

---

### TaskFilter

**Purpose**: Filter tasks by completion status

**Props**:
```typescript
interface TaskFilterProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

type TaskFilter = 'all' | 'active' | 'completed';
```

**Behavior**:
- Displays three filter buttons: All, Active, Completed
- Shows count for each filter
- Highlights active filter
- Updates on click

**Events**:
- `onFilterChange`: Fired when filter button clicked

**Accessibility**:
- `role="tablist"` for filter group
- `aria-selected` for active filter
- Keyboard navigation with arrow keys

---

### EmptyState

**Purpose**: Display when no tasks match current filter

**Props**:
```typescript
interface EmptyStateProps {
  filter: TaskFilter;
  onCreateTask?: () => void;
  className?: string;
}
```

**Behavior**:
- Shows contextual message based on filter
- Displays illustration or icon
- Shows "Create Task" button if onCreateTask provided
- Different messages for each filter:
  - All: "No tasks yet. Create your first task!"
  - Active: "All tasks completed! 🎉"
  - Completed: "No completed tasks yet."

**Events**:
- `onCreateTask`: Fired when Create button clicked

---

### LoadingSpinner

**Purpose**: Indicate loading state

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}
```

**Behavior**:
- Animated spinner icon
- Optional loading message below spinner
- Can be inline or full-screen overlay
- Blocks interaction when full-screen

**Accessibility**:
- `role="status"`
- `aria-live="polite"`
- `aria-label="Loading"`

---

## Organism Components

### TaskList

**Purpose**: Display collection of tasks with filtering

**Props**:
```typescript
interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  onToggle: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}
```

**Behavior**:
- Filters tasks based on current filter
- Renders TaskCard for each task
- Shows EmptyState when no tasks
- Shows LoadingSpinner when loading
- Responsive grid/list layout

**Composition**:
- Uses TaskCard for each task
- Uses EmptyState when empty
- Uses LoadingSpinner when loading

**Accessibility**:
- `role="list"` for task container
- Each TaskCard has `role="listitem"`

---

### TaskForm

**Purpose**: Create or edit task

**Props**:
```typescript
interface TaskFormProps {
  initialData?: Task;
  onSubmit: (data: TaskCreateInput | TaskUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Behavior**:
- Two modes: Create (no initialData) or Edit (with initialData)
- Validates title (required, 1-200 chars)
- Validates description (optional, max 2000 chars)
- Shows inline validation errors
- Disables submit when invalid or loading
- Clears form after successful create
- Calls onCancel when Cancel button clicked

**Events**:
- `onSubmit`: Fired when form submitted with valid data
- `onCancel`: Fired when Cancel button clicked

**Composition**:
- Uses Input for title
- Uses Textarea for description
- Uses Button for Submit and Cancel
- Uses ErrorMessage for validation errors

**Accessibility**:
- Proper form semantics
- Field labels and error associations
- Focus management (focus first field on mount)

---

### AuthForm

**Purpose**: Handle signup and signin

**Props**:
```typescript
interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface AuthFormData {
  email: string;
  password: string;
  username?: string;
}
```

**Behavior**:
- Two modes: Login or Register
- Register mode shows username field
- Validates email format
- Validates password (min 8 chars)
- Validates username (3-50 chars, register only)
- Shows API error at top of form
- Disables submit when invalid or loading
- Link to switch between login/register

**Events**:
- `onSubmit`: Fired when form submitted with valid data

**Composition**:
- Uses Input for email, password, username
- Uses Button for Submit
- Uses ErrorMessage for API errors

**Accessibility**:
- Proper form semantics
- Password field has show/hide toggle
- Error announcements

---

### Header

**Purpose**: Application header with navigation and user menu

**Props**:
```typescript
interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}
```

**Behavior**:
- Shows app logo/title
- Shows user info when authenticated
- Shows Logout button when authenticated
- Responsive: collapses to hamburger menu on mobile

**Events**:
- `onLogout`: Fired when Logout button clicked

**Composition**:
- Uses Button for Logout

**Accessibility**:
- `role="banner"` for header
- `role="navigation"` for nav
- Keyboard navigable menu

---

## Page Components

### Landing Page

**Purpose**: Public homepage with hero section

**Props**:
```typescript
interface LandingPageProps {
  // No props - uses AuthContext internally
}
```

**Behavior**:
- Displays hero section with gradient background
- Shows app title and description
- CTA buttons: "Get Started" (→ signup), "Sign In" (→ login)
- Redirects to dashboard if already authenticated

**Composition**:
- Uses Button for CTAs
- Custom hero section layout

**Route**: `/`

---

### Signup Page

**Purpose**: User registration

**Props**:
```typescript
interface SignupPageProps {
  // No props - uses AuthContext internally
}
```

**Behavior**:
- Displays AuthForm in register mode
- Redirects to dashboard on success
- Link to login page
- Redirects to dashboard if already authenticated

**Composition**:
- Uses AuthForm with mode="register"

**Route**: `/signup`

---

### Signin Page

**Purpose**: User authentication

**Props**:
```typescript
interface SigninPageProps {
  // No props - uses AuthContext internally
}
```

**Behavior**:
- Displays AuthForm in login mode
- Redirects to dashboard on success
- Link to signup page
- Redirects to dashboard if already authenticated

**Composition**:
- Uses AuthForm with mode="login"

**Route**: `/signin`

---

### Dashboard Page

**Purpose**: Main task management interface

**Props**:
```typescript
interface DashboardPageProps {
  // No props - uses AuthContext and TaskContext internally
}
```

**Behavior**:
- Displays Header with user info
- Shows TaskFilter
- Shows TaskList with all tasks
- "Create Task" button opens TaskForm modal
- Fetches tasks on mount
- Redirects to login if not authenticated

**Composition**:
- Uses Header
- Uses TaskFilter
- Uses TaskList
- Uses TaskForm (in modal)
- Uses LoadingSpinner (initial load)

**Route**: `/dashboard`

---

## Modal Components

### Modal

**Purpose**: Generic modal dialog container

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
}
```

**Behavior**:
- Renders children in centered overlay
- Closes on Escape key
- Closes on overlay click (if enabled)
- Traps focus within modal
- Prevents body scroll when open

**Accessibility**:
- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` for title
- Focus trap
- Returns focus to trigger on close

---

### ConfirmDialog

**Purpose**: Confirmation dialog for destructive actions

**Props**:
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}
```

**Behavior**:
- Shows title and message
- Two buttons: Confirm and Cancel
- Closes on Cancel or Escape
- Calls onConfirm and closes on Confirm

**Composition**:
- Uses Modal as container
- Uses Button for actions

**Accessibility**:
- Same as Modal
- Focus on Cancel button by default

---

## Component Testing Requirements

Each component must have:

1. **Unit Tests**:
   - Renders without crashing
   - Renders with all prop variations
   - Handles user interactions correctly
   - Calls event handlers with correct arguments
   - Displays error states correctly

2. **Accessibility Tests**:
   - Has proper ARIA attributes
   - Keyboard navigable
   - Screen reader friendly
   - Focus management works

3. **Visual Regression Tests** (Optional):
   - Matches design snapshots
   - Responsive breakpoints work

## Styling Conventions

- **TailwindCSS**: All components use Tailwind utility classes
- **Responsive**: Mobile-first approach (320px → 768px → 1024px)
- **Dark Mode**: Not implemented in MVP (structure supports future addition)
- **Animations**: Subtle transitions (200-300ms) for hover, focus, state changes
- **Colors**: Consistent palette from Tailwind config
- **Spacing**: 4px base unit (Tailwind spacing scale)

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── molecules/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskFilter.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── organisms/
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── AuthForm.tsx
│   │   │   └── Header.tsx
│   │   └── modals/
│   │       ├── Modal.tsx
│   │       └── ConfirmDialog.tsx
│   └── app/
│       ├── page.tsx (Landing)
│       ├── signup/
│       │   └── page.tsx
│       ├── signin/
│       │   └── page.tsx
│       └── dashboard/
│           └── page.tsx
```
