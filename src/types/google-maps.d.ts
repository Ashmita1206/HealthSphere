// src/types/google-maps.d.ts

export {};

declare global {
  interface Window {
    google: typeof google;
  }
}
