import { LucideIcon, Folder, Terminal, Settings, Calculator, Mail, Camera, Music, FileText, Globe, Image } from "lucide-react";

export interface AppType {
    id: string;
    type: 'documents' | 'terminal' | 'settings' | 'calculator' | 'mail' | 'camera' | 'music' | 'notes' | 'browser' | 'photos';
    title: string;
    icon: LucideIcon;
    gradient: string;
}

export const DOCK_APPS: AppType[] = [
    {
        id: 'documents',
        type: 'documents',
        title: 'Documents',
        icon: Folder,
        gradient: 'from-blue-500 to-blue-700'
    },
    {
        id: 'terminal',
        type: 'terminal',
        title: 'Terminal',
        icon: Terminal,
        gradient: 'from-gray-800 to-black'
    },
    {
        id: 'settings',
        type: 'settings',
        title: 'System Preferences',
        icon: Settings,
        gradient: 'from-gray-500 to-gray-700'
    },
    {
        id: 'calculator',
        type: 'calculator',
        title: 'Calculator',
        icon: Calculator,
        gradient: 'from-orange-500 to-orange-700'
    },
    {
        id: 'mail',
        type: 'mail',
        title: 'Mail',
        icon: Mail,
        gradient: 'from-blue-600 to-indigo-700'
    },
    {
        id: 'camera',
        type: 'camera',
        title: 'Camera',
        icon: Camera,
        gradient: 'from-gray-600 to-gray-800'
    },
    {
        id: 'music',
        type: 'music',
        title: 'Music',
        icon: Music,
        gradient: 'from-pink-500 to-red-600'
    },
    {
        id: 'notes',
        type: 'notes',
        title: 'Notes',
        icon: FileText,
        gradient: 'from-yellow-400 to-yellow-600'
    },
    {
        id: 'browser',
        type: 'browser',
        title: 'Safari',
        icon: Globe,
        gradient: 'from-blue-400 to-blue-600'
    },
    {
        id: 'photos',
        type: 'photos',
        title: 'Photos',
        icon: Image,
        gradient: 'from-purple-500 to-pink-600'
    }
];

export const DOCK_HEIGHT = 100;
export const DOCK_ITEM_SIZE = 60;
export const DOCK_GAP = 8;
export const RUNNING_INDICATOR_SIZE = 4;