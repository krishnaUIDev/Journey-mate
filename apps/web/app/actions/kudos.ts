"use server";

import { auth } from "@clerk/nextjs/server";
import * as Shared from "@journey-mate/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function submitKudos(review: Shared.Kudos) {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) throw new Error("Unauthorized");

    try {
        const response = await fetch(`${API_URL}/kudos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(review)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to submit kudos');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Kudos Submit Error:", error);
        throw new Error(error.message || "Failed to submit kudos.");
    }
}

export async function getUserKudos(userId: string) {
    try {
        const response = await fetch(`${API_URL}/kudos/user/${userId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch kudos');
        }

        return await response.json();
    } catch (error: any) {
        console.error("Kudos Fetch Error:", error);
        return [];
    }
}
