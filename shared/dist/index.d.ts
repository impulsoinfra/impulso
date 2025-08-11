export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'artist' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}
export interface Artist {
    id: string;
    userId: string;
    bio: string;
    genre: string;
    socialLinks: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        website?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface Support {
    id: string;
    supporterId: string;
    artistId: string;
    amount: number;
    message?: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
export declare const formatCurrency: (amount: number) => string;
export declare const formatDate: (date: Date) => string;
export declare const validateEmail: (email: string) => boolean;
export declare const generateSlug: (text: string) => string;
//# sourceMappingURL=index.d.ts.map