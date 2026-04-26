"use server";

import { auth } from "@clerk/nextjs/server";
import * as Shared from "@journey-mate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function addSouvenir(souvenir: Shared.Souvenir) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${API_URL}/souvenirs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(souvenir)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to add souvenir');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Add Souvenir Error:", error);
        throw new Error(error.message || "Failed to add souvenir.");
    }
}

export async function getJourneySouvenirs(journeyId: string) {
    try {
        const response = await fetch(`${API_URL}/souvenirs/journey/${journeyId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch souvenirs');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Fetch Souvenirs Error:", error);
        return [];
    }
}

export async function deleteSouvenir(id: string) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${API_URL}/souvenirs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete souvenir');
        }

        return { success: true };
    } catch (error: any) {
        console.error("Delete Souvenir Error:", error);
        throw new Error("Failed to delete souvenir.");
    }
}
