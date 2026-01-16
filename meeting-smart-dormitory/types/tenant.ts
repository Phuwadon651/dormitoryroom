export interface Tenant {
    id: string
    name: string
    avatar?: string
    phone: string
    room: string
    building: string
    floor: string
    status: 'Active' | 'MovingOut' | 'Pending'
    email: string
    moveInDate: string
}
