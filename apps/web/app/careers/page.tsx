import CareersClient from "./CareersClient";

export const revalidate = 60; // revalidate every 60 seconds

export default async function CareersPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    let jobs = [];
    try {
        const response = await fetch(`${apiUrl}/jobs`, { next: { revalidate: 60 } });
        if (response.ok) {
            jobs = await response.json();
        }
    } catch (err) {
        console.error("Error fetching jobs from API:", err);
    }

    return <CareersClient jobs={jobs} />;
}
