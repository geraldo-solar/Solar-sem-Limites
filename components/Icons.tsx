import React from 'react';
import { 
  Calendar, 
  Coffee, 
  Star, 
  Users, 
  Ship, 
  ArrowRightLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Heart,
  Ban,
  X
} from 'lucide-react';

interface IconProps {
  className?: string;
}

export const IconCalendar: React.FC<IconProps> = ({ className }) => <Calendar className={className} />;
export const IconCoffee: React.FC<IconProps> = ({ className }) => <Coffee className={className} />;
export const IconStar: React.FC<IconProps> = ({ className }) => <Star className={className} />;
export const IconUsers: React.FC<IconProps> = ({ className }) => <Users className={className} />;
export const IconShip: React.FC<IconProps> = ({ className }) => <Ship className={className} />;
export const IconTransfer: React.FC<IconProps> = ({ className }) => <ArrowRightLeft className={className} />;
export const IconShield: React.FC<IconProps> = ({ className }) => <ShieldCheck className={className} />;
export const IconClock: React.FC<IconProps> = ({ className }) => <Clock className={className} />;
export const IconCheck: React.FC<IconProps> = ({ className }) => <CheckCircle className={className} />;
export const IconChevronDown: React.FC<IconProps> = ({ className }) => <ChevronDown className={className} />;
export const IconChevronUp: React.FC<IconProps> = ({ className }) => <ChevronUp className={className} />;
export const IconPlay: React.FC<IconProps> = ({ className }) => <PlayCircle className={className} />;
export const IconHeart: React.FC<IconProps> = ({ className }) => <Heart className={className} />;
export const IconBan: React.FC<IconProps> = ({ className }) => <Ban className={className} />;
export const IconX: React.FC<IconProps> = ({ className }) => <X className={className} />;

export const IconWhatsApp: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const IconGoogle: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const IconBooking: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="#003580">
    <path d="M15.25 14.5c.6 0 1.08.3 1.32.78.24.48.24 1.2 0 1.92-.36.9-1.2 1.56-2.52 1.56H9.5v-4.2h4.8c.84 0 1.56.36 1.86.96.12.3.18.66.18 1.02 0 .48-.12.9-.36 1.26-.24.36-.6.6-1.08.72l.35-.02zM19 12c0-.96-.18-1.86-.54-2.64-.42-.9-1.08-1.62-1.98-2.04-.78-.36-1.8-.54-3.12-.54H6v13.2h8.4c1.62 0 2.88-.3 3.78-.9.9-.6 1.56-1.5 1.98-2.64.24-.72.36-1.56.36-2.46 0-.84-.12-1.62-.42-2.34-.3-.72-.78-1.32-1.44-1.8.66-.42 1.14-1.02 1.44-1.74.24-.72.42-1.56.42-2.52zm-5.4-1.8c.42 0 .78.18.96.48.18.3.18.72 0 1.14-.18.42-.66.78-1.38.78H9.5V10.2h4.1z"/>
  </svg>
);

export const IconTripAdvisor: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.61 13.91c-.48.45-1.12.72-1.83.72-1.3 0-2.38-.95-2.58-2.2-.27.1-.55.15-.84.15s-.57-.05-.84-.15c-.21 1.25-1.28 2.2-2.58 2.2-.71 0-1.35-.27-1.83-.72-.45-.42-.72-1.01-.72-1.66 0-1.27 1.03-2.3 2.3-2.3.17 0 .34.02.5.06.52-1.26 1.76-2.14 3.2-2.14 1.44 0 2.68.88 3.2 2.14.16-.04.33-.06.5-.06 1.27 0 2.3 1.03 2.3 2.3 0 .65-.27 1.24-.72 1.66zM7 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm10 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-5-1.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#00AA6C"/>
    <circle cx="7" cy="12" r="1.5" fill="black"/>
    <circle cx="17" cy="12" r="1.5" fill="black"/>
  </svg>
);
