import {blankLogo, teamLogos} from '../consts/images';

export function logoImage(team?: string, className?: string) {
    return (
        <img
            src={teamLogos.get(team ?? '') ?? blankLogo}
            className={className}
        />
    );
}
