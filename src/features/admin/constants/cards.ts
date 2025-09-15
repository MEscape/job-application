import {Activity, FileText, Users} from "lucide-react";

export const dashboardCards = [
    {
        title: "User Management",
        description: "Manage users, roles, and permissions across your application",
        icon: Users,
        href: "/admin/users",
        color: "blue"
    },
    {
        title: "File Management",
        description: "Upload, organize, and manage files with advanced controls",
        icon: FileText,
        href: "/admin/files",
        color: "emerald"
    },
    {
        title: "System Activity",
        description: "Monitor system performance, logs, and real-time analytics",
        icon: Activity,
        href: "/admin/activity",
        color: "purple"
    }
]