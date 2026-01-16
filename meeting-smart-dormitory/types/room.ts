export type RoomType = 'แอร์' | 'พัดลม';
export type RoomStatus = 'ว่าง' | 'ไม่ว่าง';

export interface Room {
    room_id: number;
    room_number: string;
    floor: number;
    room_type: RoomType;
    price: number;
    status: RoomStatus;
    furniture_details?: string | null;
}
