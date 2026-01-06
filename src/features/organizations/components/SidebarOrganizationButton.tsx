import { Suspense } from "react";
import { SidebarOrganizationButtonClient } from "./_SidebarOrganizationButtonClient";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

export function SidebarOrganizationButton() {
    return (<Suspense>
        <SidebarOrganizationSuspense />
    </Suspense>)
}

async function SidebarOrganizationSuspense() {
    const [{ organization }, { user }] = await Promise.all([
        getCurrentOrganization({ allData: true }),
        getCurrentUser({ allData: true })]
    );

    if (organization == null || user == null) {
        return (
            <SignOutButton>
                <SidebarMenuButton>
                    <LogOutIcon />
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SignOutButton>
        )
    }

    return <SidebarOrganizationButtonClient organization={organization} user={user} />
}

