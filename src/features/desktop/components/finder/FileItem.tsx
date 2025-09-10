import { motion } from "framer-motion";
import { FinderItem, getFileColor, getFileIcon, getFileType } from "../../constants/finder";
import { ViewMode } from "../../stores/finderStore";
import { formatDate, formatFileSize } from "../../utils/finderHelper";

interface FileItemProps {
  item: FinderItem;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: (item: FinderItem) => void;
  onDoubleClick: (item: FinderItem) => void;
}

export const FileItem: React.FC<FileItemProps> = ({ item, viewMode, isSelected, onSelect, onDoubleClick }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onSelect(item);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onDoubleClick(item);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onDoubleClick(item);
        } else if (e.key === ' ') {
            e.preventDefault();
            onSelect(item);
        }
    };

    if (viewMode === 'icon') {
        return (
            <motion.div
                className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 ${
                    isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                }`}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label={`${item.type === 'folder' ? 'Folder' : 'File'}: ${item.name}`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
            >
                <motion.div 
                    className="mb-2"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    <div 
                        className="text-4xl"
                        style={{ color: item.type === 'folder' ? '#007aff' : getFileColor(getFileType(item.extension || '')) }}
                    >
                        {item.type === 'folder' ? '📁' : getFileIcon(getFileType(item.extension || ''))}
                    </div>
                </motion.div>
                <div className="text-xs text-center text-gray-700 max-w-20 truncate">
                    {item.name}
                </div>
            </motion.div>
        );
    }
    
    return (
        <motion.div
            className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-50 min-w-0 ${
                isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''
            }`}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`${item.type === 'folder' ? 'Folder' : 'File'}: ${item.name}`}
            whileHover={{ x: 4, backgroundColor: "rgba(243, 244, 246, 0.8)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            layout
        >
            <div className="flex items-center flex-shrink-0">
                <motion.span 
                    className="text-lg"
                    style={{ color: item.type === 'folder' ? '#007aff' : getFileColor(getFileType(item.extension || '')) }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    {item.type === 'folder' ? '📁' : getFileIcon(getFileType(item.extension || ''))}
                </motion.span>
            </div>
            <div className="flex items-center text-gray-900 truncate min-w-0">{item.name}</div>
            <div className="flex items-center text-gray-600 whitespace-nowrap flex-shrink-0">
                {formatDate(item.dateModified)}
            </div>
            <div className="flex items-center text-gray-600 whitespace-nowrap flex-shrink-0">
                {'size' in item ? formatFileSize(item.size || 0) : '--'}
            </div>
            <div className="flex items-center text-gray-600 whitespace-nowrap flex-shrink-0">
                {item.type === 'folder' ? 'Folder' : item.name.split('.').pop()?.toUpperCase() || 'File'}
            </div>
        </motion.div>
    )
}