# Palette UX & Accessibility Journal

## Project: Nexora (Formerly Chatify)

### UI Pattern: Cosmic Glassmorphism
- **Design:** Translucent panels (`bg-white/5` or `bg-black/40`) with high backdrop blur (`backdrop-blur-xl`) and thin, light borders (`border-white/10`).
- **Interaction:** Glow effects on focus and hover using `primary` color box-shadows.
- **Color Palette:** Default dark mode with a primary cyan (`#05acd1`) accent.

### Accessibility Standards (A11y)
1. **Form Labels:** Every form input must have a unique `id` and a corresponding `<label htmlFor="...">`.
2. **Icon Buttons:** All buttons containing only icons must have a descriptive `aria-label`.
3. **Loading States:** Buttons should provide visual feedback (e.g., a spinner) and be disabled while loading.
4. **Keyboard Navigation:** Components must include `focus-visible:ring` styles to ensure clear focus indicators for keyboard users.
5. **Screen Readers:** Use `aria-invalid` and `aria-describedby` to associate error messages with their respective input fields.

### Rebranding Guidelines
- **Core Brand Name:** Nexora
- **Sub-brands:** Nexora Vault (Military-grade encrypted storage), Nexora Cinema (Synchronized watch parties).
- **Technical Note:** IndexedDB is now named `NexoraDB` and root paths use `NexoraRoot`. Firebase project IDs remain `chatify-*` for backend consistency.
