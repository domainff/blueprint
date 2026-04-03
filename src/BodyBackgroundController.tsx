import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import { dashboardBg } from './consts/images';

export default function BodyBackgroundController() {
    const location = useLocation();

    useEffect(() => {
        // Map routes to background colors
        const routeBg: Record<string, string> = {
            '/': '#ffffff',
            // '/blueprintmodule': '#04121C',
            // '/blueprintpremiummodule': '#04121C',
            // '/live': '#04121C',
            '/dashboard': '#04121C',
        };

        const bg = routeBg[location.pathname.toLowerCase()] || '#ffffff';
        document.body.style.backgroundColor = bg;

        if (location.pathname.toLowerCase() === '/dashboard') {
            document.body.style.backgroundImage =
                'url(' + dashboardBg + ')';
        }

        // Cleanup to avoid leftover styling when component unmounts
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.backgroundImage = '';
        };
    }, [location]);

    return null; // This component just manages side-effects
}
