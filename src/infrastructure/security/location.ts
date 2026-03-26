/**
 * Retrieves geographic location data from an IP address using a free API.
 */
export async function getLocationFromIp(ip: string): Promise<string | null> {
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
        return 'Localhost';
    }

    try {
        // Use ip-api.com (Free for non-commercial, no API key required for basic)
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city`);
        const data = await response.json();

        if (data.status === 'success') {
            return `${data.city}, ${data.country}`;
        }
        
        return null;
    } catch (error) {
        console.error('Location lookup failed:', error);
        return null;
    }
}
