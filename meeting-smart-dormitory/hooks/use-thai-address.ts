import { useState, useEffect } from 'react';

export interface ThaiAddress {
    district: string;     // Tambon
    amphoe: string;       // Amphoe
    province: string;     // Changwat
    zipcode: number;
    district_code: number;
    amphoe_code: number;
    province_code: number;
}

export const useThaiAddress = () => {
    const [data, setData] = useState<ThaiAddress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Using a reliable source for Thai address data
        fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json')
            .then(res => res.json())
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load Thai address data", err);
                setLoading(false);
            });
    }, []);

    return { data, loading };
}
