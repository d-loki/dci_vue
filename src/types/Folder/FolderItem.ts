import FolderItemStatus from '@/types/Folder/FolderItemStatus';
import FolderItemType from '@/types/Folder/FolderItemType';

interface FolderItem {
    id: number;
    reference: string;
    folderName: string;
    types: FolderItemType[];
    customer: string;
    totalTTC: number;
    isProspect: boolean;
    isClosed: boolean;
    status: FolderItemStatus;
    todos: string;
    createdAt: string;
    updatedAt: string;
    sendAt: string;
}

export default FolderItem;