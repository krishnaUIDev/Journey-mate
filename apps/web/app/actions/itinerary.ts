"use server";

import { auth } from "@clerk/nextjs/server";
import * as Shared from "@journey-mate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function addItineraryItem(item: Shared.ItineraryItem) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${API_URL}/itinerary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to add itinerary item');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Add Itinerary Error:", error);
        throw new Error(error.message || "Failed to add itinerary item.");
    }
}

export async function getJourneyItinerary(journeyId: string) {
    try {
        const response = await fetch(`${API_URL}/itinerary/journey/${journeyId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch itinerary');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Fetch Itinerary Error:", error);
        return [];
    }
}

export async function deleteItineraryItem(id: string) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${API_URL}/itinerary/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete itinerary item');
        }

        return { success: true };
    } catch (error: any) {
        console.error("Delete Itinerary Error:", error);
        throw new Error("Failed to delete itinerary item.");
    }
}
