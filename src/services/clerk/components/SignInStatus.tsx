import { SignedOut as ClerkSignedOut, SignedIn as ClerkSignedIn } from "@clerk/nextjs";
import { Suspense } from "react";

export function SignedOut({ children }: { children: React.ReactNode }) {
    return (<Suspense>
        <ClerkSignedOut>
            {children}
        </ClerkSignedOut>
    </Suspense>)
}

export function SignedIn({ children }: { children: React.ReactNode }) {
    return (<Suspense>
        <ClerkSignedIn>
            {children}
        </ClerkSignedIn>
    </Suspense>)
} 