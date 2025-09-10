import { FileItem, FinderItem } from "../constants/finder";
import { FinderState } from "../stores/finderStore";

export function sortItems(
  items: FinderItem[],
  sortBy: FinderState['sortBy'],
  direction: FinderState['sortDirection']
): FinderItem[] {
  const sorted = [...items].sort((a, b) => {
    // Always put folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'dateModified':
        comparison = a.dateModified.getTime() - b.dateModified.getTime();
        break;
      case 'size':
        const aSize = a.type === 'folder' ? 0 : (a as FileItem).size || 0;
        const bSize = b.type === 'folder' ? 0 : (b as FileItem).size || 0;
        comparison = aSize - bSize;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 2) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}