// Minimal typings for Google Identity Services (accounts.google.com/gsi/client).
// Only the pieces GoogleSignInButton uses.

interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
}

interface GoogleIdConfiguration {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode?: 'popup' | 'redirect';
    auto_select?: boolean;
}

interface GsiButtonConfiguration {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    width?: number;
    logo_alignment?: 'left' | 'center';
}

interface Window {
    google?: {
        accounts: {
            id: {
                initialize(config: GoogleIdConfiguration): void;
                renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
                prompt(): void;
            };
        };
    };
}
