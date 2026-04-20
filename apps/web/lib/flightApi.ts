const AVIATIONSTACK_API_KEY = process.env.NEXT_PUBLIC_AVIATIONSTACK_API_KEY || '';

export interface FlightDetails {
    flight_date: string;
    flight_status: string;
    departure: {
        airport: string;
        iata: string;
        scheduled: string;
    };
    arrival: {
        airport: string;
        iata: string;
        scheduled: string;
    };
    airline: {
        name: string;
    };
    flight: {
        number: string;
        iata: string;
    };
}

export async function verifyFlight(flightIata: string): Promise<FlightDetails | null> {
    if (!AVIATIONSTACK_API_KEY) {
        console.warn("AviationStack API Key missing. Flight verification will not work.");
        return null;
    }

    try {
        const response = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&flight_iata=${encodeURIComponent(flightIata)}`
        );
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return data.data[0] as FlightDetails;
        }
        return null;
    } catch (error) {
        console.error("Error verifying flight:", error);
        return null;
    }
}

export async function getFlightsOnRoute(depIata: string, arrIata: string): Promise<FlightDetails[]> {
    if (!AVIATIONSTACK_API_KEY) return [];

    try {
        const response = await fetch(
            `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&dep_iata=${encodeURIComponent(depIata)}&arr_iata=${encodeURIComponent(arrIata)}`
        );
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
            // Group by flight number to avoid duplicates and show unique options
            const uniqueFlights: FlightDetails[] = [];
            const seen = new Set();

            for (const f of data.data) {
                if (!seen.has(f.flight.iata)) {
                    uniqueFlights.push(f);
                    seen.add(f.flight.iata);
                }
                if (uniqueFlights.length >= 10) break; // Limit results
            }
            return uniqueFlights;
        }
        return [];
    } catch (error) {
        console.error("Error fetching flights on route:", error);
        return [];
    }
}
