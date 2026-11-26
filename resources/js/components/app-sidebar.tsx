import { Link } from '@inertiajs/react';
import { BadgePercent, Boxes, Image, LayoutGrid, Package, Package2, ShoppingBag, Tags, Users, Zap } from 'lucide-react';
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
import { adminManagement, bannerSlider, categoryManagement, dashboard, home, orderManagement, productManagement, saleManagement, stockManagement } from '@/routes';
import { typeNavGroups } from '@/types';

const navGroups: typeNavGroups = [
    {
        label: 'Ringkasan',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        label: 'Transaksi & Penjualan',
        items: [
            {
                title: 'Pesanan',
                href: orderManagement(),
                icon: ShoppingBag,
                permission: 'Order Management',
            },
        ],
    },
    {
        label: 'Katalog & Inventaris',
        items: [
            {
                title: 'Produk',
                href: productManagement(),
                icon: Package,
                permission: 'Product Management',
            },
            {
                title: 'Kategori & Tag',
                href: categoryManagement(),
                icon: Tags,
                permission: 'Category Management',
            },
            {
                title: 'Stok & Gudang',
                href: stockManagement(),
                icon: Boxes,
                permission: 'Stock Management',
            },
        ],
    },
    {
        label: 'Promosi & Etalase',
        items: [
            {
                title: 'Promo & Diskon',
                href: saleManagement(),
                icon: BadgePercent,
                permission: 'Sale Management',
            },
            {
                title: 'Banner Toko',
                href: bannerSlider(),
                icon: Image,
                permission: 'Banner Organize',
            },
        ],
    },
    {
        label: 'Pengaturan Sistem',
        items: [
            {
                title: 'Kelola Admin',
                href: adminManagement(),
                icon: Users,
                permission: 'Admin Management',
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={home()} prefetch>
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
