import { Link } from '@inertiajs/react';
import { Boxes, Image, LayoutGrid, Package, Tags, Users, Zap } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { typeNavGroups } from '@/types';

const navGroups : typeNavGroups = [
    {
        label: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        label: 'Inventory (IMS)',
        items: [
            {
                title: 'Kelola Produk',
                href: '#',
                icon: Package,
            },
            {
                title: 'Stok & Gudang',
                href: '#',
                icon: Boxes,
            },
            {
                title: 'Kategori & Tag',
                href: '#',
                icon: Tags,
            },
        ],
    },
    {
        label: 'Content & Marketing (CMS)',
        items: [
            {
                title: 'Banner Slider',
                href: '#',
                icon: Image,
            },
            {
                title: 'Flash Sale',
                href: '#',
                icon: Zap,
            },
        ],
    },
    {
        label: 'Staff Management',
        items: [
            {
                title: 'Staff List',
                href: '#',
                icon: Users,
            }
        ]
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((navGroup, itemIndex) => {
                    return <NavMain label={navGroup.label} items={navGroup.items} />
                })}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
