import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-deep-navy px-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <span className="text-3xl font-bold text-navy dark:text-offwhite">
                        Journey<span className="text-forest dark:text-sand/80">-mate</span>
                    </span>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-navy hover:bg-navy/90 text-sm normal-case",
                            card: "shadow-2xl border-none p-8 rounded-3xl",
                            headerTitle: "text-2xl font-bold text-navy",
                            headerSubtitle: "text-gray-500"
                        }
                    }}
                />
            </div>
        </div>
    );
}
