"use client"

import { Sheet } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ClientSheet({ children }: { children: React.ReactNode }) {
    const [open, setIsOpen] = useState(true)
    const router = useRouter();
    const searchParams = useSearchParams()

    return <Sheet open={open} onOpenChange={open => {
        if (open) return;
        setIsOpen(false)

        router.push(`/?${searchParams.toString()}`)
    }}
        modal>
        {children}
    </Sheet>
}