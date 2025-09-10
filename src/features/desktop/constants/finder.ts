import {
  FileText,
  Monitor,
  Download,
  Image,
  Music,
  Film,
  Laptop,
  Cloud,
  Trash2
} from "lucide-react";

export type FileType = 'folder' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size?: number;
  dateModified: Date;
  dateCreated: Date;
  path: string;
  parentPath: string;
  isHidden?: boolean;
  tags?: string[];
  color?: string;
  extension?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  path: string;
  parentPath: string;
  dateModified: Date;
  dateCreated: Date;
  isHidden?: boolean;
  tags?: string[];
  color?: string;
  children?: (FileItem | FolderItem)[];
}

export type FinderItem = FileItem | FolderItem;

export const SIDEBAR_SECTIONS = {
  FAVORITES: 'Favorites',
  DEVICES: 'Devices',
} as const;

export const DEFAULT_FAVORITES = [
  { label: 'Documents', path: '/Documents', icon: FileText },
  { label: 'Desktop', path: '/Desktop', icon: Monitor },
  { label: 'Downloads', path: '/Downloads', icon: Download },
  { label: 'Pictures', path: '/Pictures', icon: Image },
  { label: 'Music', path: '/Music', icon: Music },
  { label: 'Movies', path: '/Movies', icon: Film },
];

export const DEFAULT_DEVICES = [
  { icon: Laptop, label: 'This Mac', path: '/Users' },
  { icon: Cloud, label: 'iCloud Drive', path: '/iCloud' },
  { icon: Trash2, label: 'Trash', path: '/Trash' }
];

export const FILE_TYPE_COLORS: Record<FileType, string> = {
  folder: 'text-blue-500',
  document: 'text-red-500',
  image: 'text-green-500',
  video: 'text-purple-500',
  audio: 'text-pink-500',
  archive: 'text-orange-500',
  code: 'text-gray-700',
  other: 'text-gray-500',
};

export const FILE_TYPE_ICONS: Record<FileType, string> = {
  folder: '📁',
  document: '📄',
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  archive: '📦',
  code: '💻',
  other: '📄',
};

export const getFileIcon = (type: FileType): string => {
  return FILE_TYPE_ICONS[type] || FILE_TYPE_ICONS.other;
};

export const getFileColor = (type: FileType): string => {
  return FILE_TYPE_COLORS[type] || FILE_TYPE_COLORS.other;
};

export const getFileType = (extension: string): FileType => {
  const ext = extension.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
    return 'image';
  }
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) {
    return 'video';
  }
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) {
    return 'audio';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(ext)) {
    return 'code';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    return 'document';
  }
  
  return 'other';
};