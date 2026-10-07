// Small line icons for the dashboard (16px stroke icons, currentColor), so the
// page needs no MUI icon imports. Sizes come from CSS (.ico).
import type {SVGProps} from 'react';

const base: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

export const Eye = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const Cart = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
);
export const Ticket = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /><path d="M13 5v14" strokeDasharray="2 3" /></svg>
);
export const Chat = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
export const LogOut = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
export const Help = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
export const ZoomIn = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
);
export const ZoomOut = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
);
export const Maximize = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
);
export const Minimize = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
);
export const Download = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
export const X = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><polyline points="9 18 15 12 9 6" /></svg>
);
export const ArrowLeft = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
export const ClipboardCheck = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><polyline points="9 14 11 16 15 12" /></svg>
);
export const Hourglass = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M6 2h12M6 22h12M7 2c0 5 5 6 5 10s-5 5-5 10M17 2c0 5-5 6-5 10s5 5 5 10" /></svg>
);
export const Pencil = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);
export const Send = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);
export const Clock = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base} {...p}><polyline points="6 9 12 15 18 9" /></svg>
);
