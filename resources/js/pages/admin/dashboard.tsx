import { Head, Link } from '@inertiajs/react';
import {
    Wallet,
    ShoppingBag,
    Clock,
    Package,
    AlertTriangle,
    ArrowUpRight,
    TrendingUp,
} from 'lucide-react';

import { dashboard, orderManagement, productManagement, stockManagement } from '@/routes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
    total_revenue: number;
    today_revenue: number;
    total_orders: number;
    action_needed_orders: number;
    total_products: number;
    active_promos: number;
}

interface DailyChartItem {
    date: string;
    revenue: number;
    orders: number;
}

interface RecentOrderItem {
    id: number;
    order_code: string;
    customer_name: string;
    total_amount: number;
    payment_status: string;
    order_status: string;
    items_count: number;
    created_at?: string | null;
}

interface LowStockItem {
    id: string;
    name: string;
    variant?: string | null;
    sku?: string | null;
    stock: number;
}

interface DashboardProps {
    stats: DashboardStats;
    dailyChart: DailyChartItem[];
    recentOrders: RecentOrderItem[];
    lowStockList: LowStockItem[];
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);

export default function Dashboard({
    stats,
    dailyChart = [],
    recentOrders = [],
    lowStockList = [],
}: DashboardProps) {
    const maxRevenue = Math.max(...dailyChart.map((d) => d.revenue), 1);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Header & Aksi Cepat */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Dashboard TokoKami</h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan penjualan, status pesanan, dan ketersediaan stok hari ini.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href={productManagement()}>Kelola Produk</Link>
                        </Button>
                        <Button asChild size="sm" className="rounded-xl">
                            <Link href={orderManagement()}>
                                Lihat Pesanan
                                <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="rounded-2xl border-sidebar-border/70">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Pendapatan
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Wallet className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight">
                                {formatRupiah(stats.total_revenue)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Hari ini: <span className="font-semibold text-foreground">{formatRupiah(stats.today_revenue)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-sidebar-border/70">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Total Pesanan
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight">
                                {stats.total_orders}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Seluruh transaksi masuk
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-sidebar-border/70">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Perlu Diproses
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Clock className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight">
                                {stats.action_needed_orders}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pending, konfirmasi, atau dikemas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-sidebar-border/70">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Katalog &amp; Promo
                            </CardTitle>
                            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                                <Package className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight">
                                {stats.total_products} Produk
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-semibold text-foreground">{stats.active_promos}</span> promo sedang aktif
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Grafik 7 Hari & Peringatan Stok */}
                <div className="grid gap-4 lg:grid-cols-12">
                    <Card className="lg:col-span-7 rounded-2xl border-sidebar-border/70 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Pendapatan 7 Hari Terakhir
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Dihitung dari pesanan dengan status pembayaran lunas
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-52 pt-4">
                                {dailyChart.map((day) => {
                                    const heightPct = day.revenue > 0
                                        ? Math.max(12, Math.round((day.revenue / maxRevenue) * 100))
                                        : 4;

                                    return (
                                        <div
                                            key={day.date}
                                            className="flex flex-col items-center gap-2 h-full justify-end group"
                                        >
                                            <div className="text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                                {day.orders} ord
                                            </div>
                                            <div className="w-full max-w-[42px] bg-muted/60 rounded-t-xl h-36 flex items-end overflow-hidden p-0.5">
                                                <div
                                                    style={{ height: `${heightPct}%` }}
                                                    title={`${day.date}: ${formatRupiah(day.revenue)} (${day.orders} pesanan)`}
                                                    className={`w-full rounded-t-lg transition-all ${
                                                        day.revenue > 0
                                                            ? 'bg-primary group-hover:bg-primary/85'
                                                            : 'bg-muted-foreground/20'
                                                    }`}
                                                />
                                            </div>
                                            <span className="text-[11px] font-medium text-muted-foreground">
                                                {day.date}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stok Menipis */}
                    <Card className="lg:col-span-5 rounded-2xl border-sidebar-border/70">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    Stok Menipis
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Produk atau varian dengan stok &le; 5
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                                <Link href={stockManagement()}>Atur Stok</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {lowStockList.length === 0 ? (
                                <div className="py-10 text-center text-xs text-muted-foreground">
                                    Semua stok produk dalam kondisi aman.
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {lowStockList.map((item) => (
                                        <div
                                            key={item.id}
                                            className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-semibold truncate">
                                                    {item.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground truncate">
                                                    {item.variant ? `Varian: ${item.variant}` : 'Produk Utama'}
                                                    {item.sku ? ` • ${item.sku}` : ''}
                                                </div>
                                            </div>
                                            <Badge
                                                variant={item.stock === 0 ? 'destructive' : 'outline'}
                                                className="shrink-0 font-mono text-[11px]"
                                            >
                                                {item.stock === 0 ? 'Habis' : `Sisa ${item.stock}`}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Pesanan Terbaru */}
                <Card className="rounded-2xl border-sidebar-border/70">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold">Pesanan Terbaru</CardTitle>
                            <CardDescription className="text-xs">
                                5 transaksi paling baru yang masuk ke toko
                            </CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-8">
                            <Link href={orderManagement()}>Semua Pesanan</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                                Belum ada pesanan yang masuk.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="border-b text-muted-foreground uppercase text-[11px]">
                                        <tr>
                                            <th className="py-2.5 pr-4">Kode Order</th>
                                            <th className="py-2.5 px-4">Pembeli</th>
                                            <th className="py-2.5 px-4">Total</th>
                                            <th className="py-2.5 px-4">Pembayaran</th>
                                            <th className="py-2.5 px-4">Status</th>
                                            <th className="py-2.5 pl-4 text-right">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentOrders.map((ord) => (
                                            <tr key={ord.id} className="hover:bg-muted/40">
                                                <td className="py-3 pr-4 font-mono font-bold text-primary">
                                                    {ord.order_code}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold">{ord.customer_name}</div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {ord.items_count} item
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-bold">
                                                    {formatRupiah(ord.total_amount)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={
                                                            ord.payment_status === 'paid'
                                                                ? 'default'
                                                                : ord.payment_status === 'expired'
                                                                  ? 'destructive'
                                                                  : 'outline'
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {ord.payment_status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={
                                                            ord.order_status === 'cancelled'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                        }
                                                        className="text-[10px] uppercase font-bold"
                                                    >
                                                        {ord.order_status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pl-4 text-right text-muted-foreground">
                                                    {ord.created_at || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};