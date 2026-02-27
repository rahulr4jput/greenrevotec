import { ReactElement, SVGAttributes } from 'react';

declare module 'react-icons' {
    export interface IconBaseProps extends SVGAttributes<SVGElement> {
        size?: string | number;
        color?: string;
        title?: string;
    }
    export type IconType = (props: IconBaseProps) => ReactElement | null;
}

// Ensure all sub-libraries are covered
declare module 'react-icons/fa' {
    import { IconType } from 'react-icons';
    export const FaLeaf: IconType;
    export const FaTractor: IconType;
    export const FaFlask: IconType;
    export const FaSeedling: IconType;
    export const FaRobot: IconType;
    export const FaMicrochip: IconType;
    export const FaUsers: IconType;
    export const FaChartLine: IconType;
    export const FaHandshake: IconType;
    export const FaShieldAlt: IconType;
    export const FaBug: IconType;
    export const FaTint: IconType;
    export const FaSatellite: IconType;
    export const FaMicroscope: IconType;
    export const FaAtom: IconType;
    export const FaCogs: IconType;
    export const FaGlobe: IconType;
    export const FaAward: IconType;
    export const FaTrophy: IconType;
    export const FaMedal: IconType;
    export const FaStar: IconType;
    export const FaCheck: IconType;
    export const FaArrowRight: IconType;
    export const FaArrowUp: IconType;
    export const FaArrowDown: IconType;
    export const FaChevronLeft: IconType;
    export const FaChevronRight: IconType;
    export const FaPhone: IconType;
    export const FaEnvelope: IconType;
    export const FaMapMarkerAlt: IconType;
    export const FaCalendarAlt: IconType;
    export const FaClock: IconType;
    export const FaWhatsapp: IconType;
    export const FaLinkedin: IconType;
    export const FaFacebook: IconType;
    export const FaInstagram: IconType;
    export const FaTwitter: IconType;
    export const FaYoutube: IconType;
    export const FaPlay: IconType;
    export const FaBars: IconType;
    export const FaTimes: IconType;
    export const FaUserTie: IconType;
    export const FaStore: IconType;
    export const FaQuoteLeft: IconType;
    export const FaTree: IconType;
    export const FaSun: IconType;
}
