/** Google OAuth web-client ID baked in at build time. Empty means the feature is off. */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

/** True when the site was built with a client ID, so the login modal should offer Google. */
export const googleSignInEnabled = GOOGLE_CLIENT_ID.length > 0;
