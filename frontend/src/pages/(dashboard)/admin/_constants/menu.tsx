import { Home, FileText } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  lucideIcon: any;
  hasNotification?: boolean;
}

export const mainMenuItems: MenuItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    iconName: "/admin/icon/icon-home.png",
    lucideIcon: Home,
  },
  {
    id: "report",
    label: "Report",
    path: "/report",
    iconName: "/admin/icon/icon-report.png",
    lucideIcon: FileText,
  },
  /*
    {
        id: 'booking',
        label: 'Booking',
        path: '/booking',
        iconName: '/admin/icon/icon-booking.png',
        lucideIcon: Calendar,
    },
    {
        id: 'event',
        label: 'Event',
        path: '/events',
        iconName: '/admin/icon/icon-event.png',
        lucideIcon: CalendarDays,
        hasNotification: true,
    },
    {
        id: 'private-club',
        label: 'Private club',
        path: '/benefits',
        iconName: '/admin/icon/icon-private.png',
        lucideIcon: Armchair,
    },
    */
];

export const secondaryMenuItems: MenuItem[] = [
  /*
    {
        id: 'notifications',
        label: 'Notifications',
        path: '/notifications',
        iconName: '/admin/icon/icon-notification.png',
        lucideIcon: Bell,
        hasNotification: true,
    },
    {
        id: 'profile',
        label: 'Profile',
        path: '/profile',
        iconName: '/admin/icon/icon-profie.png',
        lucideIcon: User,
    },
    {
        id: 'support',
        label: 'Support',
        path: '/support',
        iconName: '/admin/icon/icon-support.png',
        lucideIcon: Headphones,
    },
    */
];
