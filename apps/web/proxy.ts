import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;

const isDevelopment = process.env.NODE_ENV === 'development';
const allowBypass = process.env.NEXT_PUBLIC_ALLOW_AUTH_BYPASS === 'true';

export default clerkMiddleware(async (auth, req) => {
    if (isDevelopment && allowBypass) {
        console.log("⚠️ Auth bypass enabled in development");
        return;
    }

    if (isProtectedRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
            const homeUrl = new URL("/", req.url);
            return NextResponse.redirect(homeUrl);
        }
    }
}, {
    publishableKey
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
