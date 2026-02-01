# 🚫 Project Rules & Architecture

> **Critical**: This project is migrating to **React-Style MVVM (Model-View-ViewModel)**.
> All new features MUST use this pattern. Existing code will be refactored incrementally.

---

## 🏗️ Architecture: Hook-based React-MVVM

We adapt standard MVVM for React's functional paradigm using **Custom Hooks** as ViewModels.

### 1. View (UI Layer)

- **Role**: Render UI, capture user events.
- **Implementation**: Functional Components (`.tsx`)
- **Location**: `src/app/`, `src/components/`, `src/ui/`
- **Rules**:
    - ❌ **No Business Logic**: No complex `useEffect`, data transformations, or API calls.
    - ❌ **No Class Components**: Use Function Components only.
    - ✅ **Binding**: Must consume a `use[Feature]ViewModel` hook.
    - ✅ **Dumb Components**: Receives data via props or ViewModel hooks.

### 2. ViewModel (Presentation Logic Layer)

- **Role**: Manage state, handle user interactions, communicate with Model.
- **Implementation**: Custom Hooks (`use[Feature]ViewModel.ts`)
- **Location**: `src/hooks/viewmodels/` or Feature-folder based `_hooks/`
- **Naming**: `use[Feature]ViewModel` (e.g., `useBookingViewModel`)
- **Rules**:
    - ❌ **No UI**: No JSX, no HTML return types.
    - ❌ **No Classes**: Do not use ES6 classes for ViewModels.
    - ✅ **State Management**: Holds `useState`, `useReducer`, or forms.
    - ✅ **Logic**: Handles `onSubmit`, `onPress`, validation.
    - ✅ **Return**: Exposes `{ state, actions }` object to the View.

### 3. Model (Data Layer)

- **Role**: Data structures, API communication, Global Store.
- **Location**: `src/services/`, `src/types/`, `src/store/`
- **Rules**:
    - ✅ **Pure TS/JS**: Independent of React where possible.
    - ✅ **Services**: `BookingService.create()`, `AuthService.login()`
    - ✅ **Types**: Zod schemas or TypeScript interfaces.

---

## 🚫 Forbidden Patterns (Strict)

1. **Massive Components**: If a component has >1 `useEffect` or complex state, **EXTRACT** to a ViewModel.
2. **Logic within View**: `onClick={async () => { await fetch(...) }}` is **FORBIDDEN**. Use `onClick={viewModel.actions.submit}`.
3. **Direct API calls**: Views should NEVER import `fetch` or `axios`.
4. **Mixed Responsibilities**: Do not mix data fetching and UI rendering in the same file.

## 🚀 Migration Strategy

- **New Features**: Strict MVVM adoption.
- **Bug Fixes**: Refactor the specific component to MVVM before fixing if complexity helps.
- **Legacy Code**: Leave as-is until touched.

## 📂 Recommend Directory Structure

```
src/
  app/
    booking/
      page.tsx          # View (Consumes ViewModel)
      layout.tsx        # View
  components/           # Reusable UI (Dumb)
  hooks/
    viewmodels/         # ViewModels (Business Logic)
      useBookingViewModel.ts
  services/             # API/Backend interaction
    bookingService.ts
  types/                # Shared Types
```
