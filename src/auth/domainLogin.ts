import axios from 'axios';

/** Domain API base. Override locally with VITE_DOMAIN_API_BASE in .env.local (gitignored). */
export const DOMAIN_API_BASE =
    import.meta.env.VITE_DOMAIN_API_BASE || 'https://domainffapi.azurewebsites.net/api';

/** Shape of the Domain API's login result (shared by the Flock password and Google paths). */
export type DomainLoginResult = {
    success: boolean;
    code: string;
    message: string;
    flockEmail?: string | null;
    flockUsername?: string | null;
    domainUserId?: string | null;
    token?: string | null;
    expires?: string | null;
};

/**
 * Exchanges a Google ID token for a Domain token. Resolves with the API's result on
 * both success and the mapped error statuses (400/401/409/500), so callers always
 * get a code and a user-facing message.
 */
export async function loginWithGoogle(idToken: string): Promise<DomainLoginResult> {
    try {
        const res = await axios.post<DomainLoginResult>(
            `${DOMAIN_API_BASE}/Auth/google`,
            {idToken}
        );
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.data?.code) {
            return err.response.data as DomainLoginResult;
        }
        return {
            success: false,
            code: 'NetworkError',
            message: 'Could not reach the Domain API. Please try again.',
        };
    }
}

/** Stores the Domain session exactly the way the password login always has. */
export function persistDomainLogin(result: DomainLoginResult): void {
    localStorage.setItem('flockAuthToken', result.token ?? '');
    localStorage.setItem('flockEmail', result.flockEmail ?? '');
    localStorage.setItem('flockUsername', result.flockUsername ?? '');
    localStorage.setItem('domainUserId', result.domainUserId ?? '');
}
