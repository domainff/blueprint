/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Google OAuth web-client ID for "Continue with Google". Empty hides the button. */
    readonly VITE_GOOGLE_CLIENT_ID?: string;
    /** Local override for the Domain API base URL, e.g. http://localhost:5003/api. Defaults to production. */
    readonly VITE_DOMAIN_API_BASE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
