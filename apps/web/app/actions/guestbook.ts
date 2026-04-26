"use server";

import { auth } from "@clerk/nextjs/server";
import { GuestbookEntry } from "@journey-mate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function submitGuestbookEntry(entry: GuestbookEntry) {
    const { getToken } = await auth();
    const token = await getToken();

    try {
        const response = await fetch(`${API_URL}/guestbook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entry)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Failed to submit guestbook entry via API");
        }

        return await response.json();
    } catch (error: any) {
        console.error("Submit Guestbook Error:", error);
        throw new Error(error.message || "Failed to submit guestbook entry.");
    }
}

export async function getJourneyGuestbook(journeyId: string) {
    try {
        const response = await fetch(`${API_URL}/guestbook/journey/${journeyId}`, {
            next: { revalidate: 30 }
        });

        if (!response.ok) throw new Error("Failed to fetch guestbook from API");
        return await response.json();
    } catch (error: any) {
        console.error("Fetch Guestbook Error:", error);
        return [];
    }
}
