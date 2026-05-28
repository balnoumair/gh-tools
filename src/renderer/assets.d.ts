// Ambient declarations for non-code asset imports handled by Vite.
// This file is intentionally a *script* (no top-level import/export) so the
// `declare module` below creates a real ambient module rather than augmenting
// a non-existent one.

declare module '*.svg' {
  const src: string;
  export default src;
}
