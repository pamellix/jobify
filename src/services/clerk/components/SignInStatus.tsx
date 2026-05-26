import { Show } from '@clerk/nextjs';
import React, { Suspense } from "react";

export function SignedOut({ children }: { children: React.ReactNode }) {
    return <Suspense><Show when="signed-out">{children}</Show></Suspense>
}

export function SignedIn({ children }: { children: React.ReactNode }) {
    return <Show when="signed-in">{children}</Show>;
}
