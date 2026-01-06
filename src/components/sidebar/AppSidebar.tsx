import { Sidebar, SidebarHeader, SidebarProvider, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarFooter } from "../ui/sidebar";
import { AppSidebarClient } from "./_AppSidebarClient";
import { ReactNode } from "react";

export function AppSidebar({ content, footerButton, children }: { content: ReactNode, footerButton: ReactNode, children: ReactNode }) {
    return (
        <SidebarProvider className="overflow-y-hidden">
            <AppSidebarClient>
                <Sidebar collapsible="icon" className="overflow-hidden">
                    <SidebarHeader className="flex-row">
                        <SidebarTrigger />
                        <span className="text-xl text-nowrap">Jobify</span>
                    </SidebarHeader>
                    <SidebarContent>
                        {content}
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                {footerButton}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
            </AppSidebarClient>
            <main className="flex-1">{children}</main>
        </SidebarProvider>
    )
}

/**
 * 
 * <SidebarGroup>
                            <SidebarMenu>
                                <SignedOut>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/sign-in">
                                                <LogInIcon />
                                                <span>Log In</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SignedOut>
                            </SidebarMenu>
                        </SidebarGroup>
 * 
 */