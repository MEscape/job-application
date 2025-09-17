import { FinderItem } from "../../constants/finder";
import { useFinderStore } from "../../hooks/useFinderStore";
import { useWindowStore } from "../../hooks/useWindowStore";
import { PDFViewer } from "../pdf/PDFViewer";
import { VideoViewer } from "../video/VideoViewer";
import { FileItem } from "./FileItem";

export const FinderContent: React.FC = () => {
    const {
        items,
        isLoading,
        viewMode,
        selectedItems,
        selectItem,
        currentPath,
        navigateTo
    } = useFinderStore();

    const { addWindow } = useWindowStore();

    const handleItemDoubleClick = (item: FinderItem) => {
        if (item.type === 'folder') {
            const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
            navigateTo(newPath);
        }

        if (item.name.split('.').pop() === 'pdf') {
            console.log('Opening PDF:', item.name);
            addWindow({
                title: item.name,
                content: <PDFViewer fileId={item.id} fileName={item.name} />,
                size: { width: 900, height: 700 }
            });
        } else if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(item.name.split('.').pop()?.toLowerCase() || '')) {
            console.log('Opening Video:', item.name);
            addWindow({
                title: item.name,
                content: <VideoViewer fileId={item.id} fileName={item.name} />,
                size: { width: 1000, height: 700 }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-gray-600">Loading items...</span>
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">📁</div>
            <div className="text-xl font-medium text-gray-900 mb-2">This folder is empty</div>
            <div className="text-gray-600">Drop files here or create new items</div>
            </div>
        </div>
        );
    }

    return (
        <div 
            className="flex-1 bg-white overflow-y-auto overflow-x-hidden"
        >
            {viewMode === 'list' && (
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50 min-w-0">
                    <div></div>
                    <div className="truncate">Name</div>
                    <div className="whitespace-nowrap">Date Modified</div>
                    <div className="whitespace-nowrap">Size</div>
                    <div className="whitespace-nowrap">Kind</div>
                </div>
            )}

            <div className={viewMode === 'icon' ? 'grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4 p-4' : 'divide-y divide-gray-100'}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="min-w-0"
                    >
                        <FileItem
                            item={item}
                            viewMode={viewMode}
                            isSelected={selectedItems.has(item.id)}
                            onSelect={item => selectItem(item.id)}
                            onDoubleClick={handleItemDoubleClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}