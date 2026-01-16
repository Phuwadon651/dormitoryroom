export interface Role {
    id: number;
    name: string;
    key: string;
    description: string;
    permissions: Permissions;
    is_active: boolean;
    users_count?: number;
    users?: RoleUser[];
    created_at?: string;
    updated_at?: string;
}

export interface Permissions {
    accessOverview: boolean;
    accessUserManagement: boolean;
    accessRoomManagement: boolean;
    accessOperations: boolean;
    accessRepair: boolean;
    accessFinance: boolean;
    [key: string]: boolean;
}

export interface RoleUser {
    id: number;
    name: string;
    email: string;
    username: string;
    role_id: number;
    role: string; // Legacy string
    is_active: boolean;
}
