export type UserRole = 'Admin' | 'DormAdmin' | 'Manager' | 'Tenant' | 'Technician' | 'Visitor';

export interface UserPermissions {
    accessOverview?: boolean;
    accessUserManagement?: boolean;
    accessRoomManagement?: boolean;
    accessOperations?: boolean;
    accessRepair?: boolean;
    accessFinance?: boolean;
}

export interface User {
    id: string;
    username: string;
    password?: string; // Optional for security when sending to client
    name: string;
    role: UserRole;
    role_id?: number;
    email?: string; // Optional contact info
    isActive?: boolean;
    permissions?: UserPermissions;
}

export type SessionPayload = {
    userId: string;
    role: UserRole;
    name: string;
}
