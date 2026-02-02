const API_URL = 'http://localhost:8000/api';
const CREDENTIALS = { username: 'Administrator', password: 'Administrator' };

async function run() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(CREDENTIALS)
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Logged in. Token acquired.');

        console.log('Fetching Maintenances...');
        const res = await fetch(`${API_URL}/maintenances`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            console.error('Fetch failed:', await res.text());
            return;
        }

        const data = await res.json();
        const maintenances = Array.isArray(data) ? data : data.data;

        console.log(`Fetched ${maintenances.length} records.`);

        if (maintenances.length > 0) {
            const first = maintenances[0];
            console.log('First Record Sample:');
            console.log(JSON.stringify(first, null, 2));

            // Check specifically for room issues
            const missingRoom = maintenances.filter(m => !m.room);
            const missingRoomNumber = maintenances.filter(m => m.room && !m.room.room_number);

            console.log(`Records with missing room object: ${missingRoom.length}`);
            console.log(`Records with room object but missing room_number: ${missingRoomNumber.length}`);
        } else {
            console.log('No maintenance records found.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
