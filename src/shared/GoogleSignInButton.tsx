import {useEffect, useRef, useState} from 'react';
import {GOOGLE_CLIENT_ID as CLIENT_ID} from '../auth/googleSignIn';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

let gsiLoader: Promise<void> | null = null;

/** Loads Google Identity Services once per page. */
function loadGsi(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (!gsiLoader) {
        gsiLoader = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = GSI_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => {
                gsiLoader = null;
                reject(new Error('Failed to load Google Sign-In'));
            };
            document.head.appendChild(script);
        });
    }
    return gsiLoader;
}

type Props = {
    /** Receives the Google ID token (credential). Send it to the Domain API to verify. */
    onCredential: (idToken: string) => void;
    disabled?: boolean;
    width?: number;
};

/**
 * Renders Google's own "Continue with Google" button. Hidden entirely when
 * VITE_GOOGLE_CLIENT_ID is not configured, so the modal degrades to password only.
 */
export default function GoogleSignInButton({onCredential, disabled, width = 360}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onCredentialRef = useRef(onCredential);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        onCredentialRef.current = onCredential;
    });

    useEffect(() => {
        if (!CLIENT_ID) {
            console.warn('VITE_GOOGLE_CLIENT_ID is not set; Google sign-in is hidden.');
            return;
        }
        let cancelled = false;
        loadGsi()
            .then(() => {
                const google = window.google;
                if (cancelled || !containerRef.current || !google) return;
                google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: resp => onCredentialRef.current(resp.credential),
                    ux_mode: 'popup',
                });
                // A re-render (a width change, for one) would stack a second button. Start clean.
                containerRef.current.replaceChildren();
                google.accounts.id.renderButton(containerRef.current, {
                    type: 'standard',
                    theme: 'filled_black',
                    size: 'large',
                    text: 'continue_with',
                    shape: 'pill',
                    width: Math.min(width, 400),
                });
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [width]);

    if (!CLIENT_ID) return null;
    if (failed) {
        return <div style={{color: '#E84D57'}}>Google sign-in failed to load.</div>;
    }
    return (
        <div
            ref={containerRef}
            style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? 'none' : 'auto',
            }}
        />
    );
}
