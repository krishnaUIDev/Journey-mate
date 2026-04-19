export interface Airport {
    name: string;
    city: string;
    country: string;
    iata: string;
}

export const AIRPORTS: Airport[] = [
    { name: "Rajiv Gandhi International Airport", city: "Hyderabad", country: "India", iata: "HYD" },
    { name: "John F. Kennedy International Airport", city: "New York", country: "USA", iata: "JFK" },
    { name: "London Heathrow Airport", city: "London", country: "UK", iata: "LHR" },
    { name: "Indira Gandhi International Airport", city: "Delhi", country: "India", iata: "DEL" },
    { name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", iata: "BOM" },
    { name: "Dubai International Airport", city: "Dubai", country: "UAE", iata: "DXB" },
    { name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", iata: "SIN" },
    { name: "Kempegowda International Airport", city: "Bengaluru", country: "India", iata: "BLR" },
    { name: "Chennai International Airport", city: "Chennai", country: "India", iata: "MAA" },
    { name: "San Francisco International Airport", city: "San Francisco", country: "USA", iata: "SFO" },
    { name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", iata: "LAX" },
    { name: "Toronto Pearson International Airport", city: "Toronto", country: "Canada", iata: "YYZ" },
    { name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", iata: "SYD" },
    { name: "Hamad International Airport", city: "Doha", country: "Qatar", iata: "DOH" },
    { name: "Incheon International Airport", city: "Seoul", country: "South Korea", iata: "ICN" },
    { name: "Narita International Airport", city: "Tokyo", country: "Japan", iata: "NRT" },
    { name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France", iata: "CDG" },
    { name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", iata: "FRA" },
    { name: "Hong Kong International Airport", city: "Hong Kong", country: "China", iata: "HKG" },
    { name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", iata: "BKK" },
];
