import { Activity, FileText, LayoutDashboard, Users } from "lucide-react";

export const sidebarItems = [
    {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: Users
    },
    {
        name: 'Files',
        href: '/admin/files',
        icon: FileText
    },
    {
        name: 'Activity',
        href: '/admin/activity',
        icon: Activity
    }
];