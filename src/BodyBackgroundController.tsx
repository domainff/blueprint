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
            // A global `body { display:grid; place-items:center; padding:2rem 1rem }`
            // leaks in from a CSS module and centers #root into a narrow,
            // content-width column. `place-items:center` is the real culprit:
            // its `justify-items:center` makes #root (width:auto) collapse to
            // fit-content and center. Override it here so the dashboard can use
            // the full viewport width. Reset in cleanup so other (centered)
            // routes keep their layout.
            document.body.style.display = 'block';
            document.body.style.placeItems = 'stretch';
            document.body.style.padding = '0';
        }

        // Cleanup to avoid leftover styling when component unmounts
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.backgroundImage = '';
            document.body.style.display = '';
            document.body.style.placeItems = '';
            document.body.style.padding = '';
        };
    }, [location]);

    return null; // This component just manages side-effects
}
