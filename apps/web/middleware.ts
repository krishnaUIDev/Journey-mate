import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);

console.log('CLERK DEBUG:', {
    hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasClerkPublishableKey: !!process.env.CLERK_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.CLERK_SECRET_KEY,
});

// Fallback mechanism to ensure the publishable key is available in the environment
// even if the prefixed version is missing on the server.
if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY;
}

export default clerkMiddleware(async (auth, req) => {
    // Temporarily disabled for development purpose
    /*
    if (isProtectedRoute(req)) {
        const { userId, redirectToSignIn } = await auth();
        if (!userId) return redirectToSignIn();
    }
    */
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
