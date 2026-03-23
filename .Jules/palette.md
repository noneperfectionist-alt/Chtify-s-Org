## 2025-05-15 - [Accessible Form Inputs]
**Learning:** Forcing unique IDs on form inputs and linking them to labels via `htmlFor` significantly improves screen reader accessibility. Using React's `useId` hook ensures stable, unique IDs across renders and server-side rendering.
**Action:** Always wrap `input` components with a pattern that auto-generates IDs if not provided, and ensure `aria-describedby` is used to link error messages or helper text.
