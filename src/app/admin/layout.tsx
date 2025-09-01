import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/cotiza-listo/Logo";
import { LayoutDashboard, Boxes, SpellCheck, DollarSign, Settings, Bell, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/admin" isActive>
                                <LayoutDashboard />
                                Dashboard
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Boxes />
                                Catálogo
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <SpellCheck />
                                Sinónimos
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <DollarSign />
                                Reglas de Precios
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Settings />
                            Configuración
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <UserCircle2 />
                            Mi Perfil
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <SidebarTrigger className="sm:hidden" />
                <div className="relative ml-auto flex-1 md:grow-0">
                    {/* Future search bar */}
                </div>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                    <Bell />
                </Button>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                    <UserCircle2 />
                </Button>
            </header>
            <main className="p-4 sm:px-6 sm:py-0">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  )
}
