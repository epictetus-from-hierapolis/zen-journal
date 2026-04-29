export interface Note {
    id?: number;
    title: string;
    content: string;
    notebookId: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    isArchived: boolean;
}

export interface Notebook {
    id?: number;
    name: string;
    createdAt: Date;
}

export interface Tag {
    id?: number;
    name: string;
    color: string;
}