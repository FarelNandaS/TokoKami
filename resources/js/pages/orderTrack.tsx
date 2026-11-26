import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    CheckCircle2,
    Clock,
    Package,
    Truck,
    XCircle,
    Copy,
    Check,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TrackOrderItem {
    id: number;
    product_id: number | null;
    product_variant_id: number | null;
    product_name: string;
    variant_label?: string | null;
    unit_price: number;
    original_unit_price?: number | null;
    quantity: number;
    line_total: number;
}

interface OrderTrackData {
    id: number;
    order_code: string;
    tracking_token: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code?: string | null;
    notes?: string | null;
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_gateway?: string | null;
    payment_reference?: string | null;
    payment_status: string;
    paid_at?: string | null;
    order_status: string;
    courier_name?: string | null;
    tracking_number?: string | null;
    admin_notes?: string | null;
    created_at?: string | null;
    items: TrackOrderItem[];
}

interface OrderTrackPageProps {
    order: OrderTrackData;
    isMockPayment?: boolean;
}

const ORDER_STEPS = [
    { key: "pending", label: "Menunggu Konfirmasi", Icon: Clock },
    { key: "confirmed", label: "Dikonfirmasi", Icon: CheckCircle2 },
    { key: "processing", label: "Dikemas", Icon: Package },
    { key: "shipped", label: "Dikirim", Icon: Truck },
    { key: "delivered", label: "Selesai", Icon: CheckCircle2 },
];

export default function OrderTrackPage({
    order,
    isMockPayment = false,
}: OrderTrackPageProps) {
    const [simulating, setSimulating] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const paymentMethodLabel = (method: string) => {
        switch (method) {
            case "bank_transfer":
                return "Virtual Account / Transfer";
            case "qris":
                return "QRIS";
            case "cod":
                return "COD (Bayar di Tempat)";
            default:
                return method;
        }
    };

    const paymentStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return (
                    <Badge className="bg-emerald-600 text-white">
                        Sudah Dibayar
                    </Badge>
                );
            case "expired":
                return <Badge variant="destructive">Kedaluwarsa / Gagal</Badge>;
            case "refunded":
                return <Badge variant="secondary">Refund</Badge>;
            default:
                return <Badge variant="outline">Menunggu Pembayaran</Badge>;
        }
    };

    const currentStepIndex = ORDER_STEPS.findIndex(
        (s) => s.key === order.order_status,
    );

    const handleCopyCode = () => {
        navigator.clipboard?.writeText(order.order_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const handleMockSimulate = (status: "paid" | "failed") => {
        if (simulating) return;
        setSimulating(true);
        router.post(
            `/order/track/${order.tracking_token}/mock-pay`,
            { status },
            {
                preserveScroll: true,
                onFinish: () => setSimulating(false),
            },
        );
    };

    return (
        <>
            <Head title={`Lacak Pesanan ${order.order_code} - TokoKami`} />

            <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex-1 space-y-6">
                {/* Header Kode Order */}
                <Card className="rounded-2xl border-border bg-card shadow-sm">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Kode Pesanan:
                                </span>
                                <span className="font-mono text-base font-black text-primary">
                                    {order.order_code}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted hover:bg-accent transition-colors cursor-pointer"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 text-emerald-500" />
                                            Tersalin
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            Salin
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Simpan URL halaman ini atau cek email{" "}
                                <span className="font-medium text-foreground">
                                    {order.customer_email}
                                </span>{" "}
                                untuk memantau status pesanan kapan saja.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {paymentStatusBadge(order.payment_status)}
                            <Badge
                                variant="secondary"
                                className="uppercase text-[11px] font-bold"
                            >
                                {order.order_status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Panel Simulasi Pembayaran (Hanya tampil jika PAYMENT_DRIVER=mock & order masih unpaid) */}
                {isMockPayment &&
                    order.payment_method !== "cod" &&
                    order.payment_status === "unpaid" &&
                    order.order_status !== "cancelled" && (
                        <Card className="rounded-2xl border-amber-500/40 bg-amber-500/5 shadow-sm">
                            <CardContent className="p-6 space-y-3">
                                <div className="space-y-1">
                                    <Badge className="bg-amber-500 text-white text-[10px]">
                                        MOCK PAYMENT MODE
                                    </Badge>
                                    <h2 className="text-base font-black tracking-tight">
                                        Simulasi Pembayaran Gateway (Demo)
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Aplikasi berjalan tanpa API key gateway
                                        eksternal. Pilih hasil simulasi untuk
                                        menguji webhook pembayaran otomatis.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={simulating}
                                        onClick={() =>
                                            handleMockSimulate("paid")
                                        }
                                        className="rounded-xl font-semibold cursor-pointer"
                                    >
                                        {simulating
                                            ? "Memproses..."
                                            : "Simulasikan Bayar Lunas"}
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={simulating}
                                        onClick={() =>
                                            handleMockSimulate("failed")
                                        }
                                        className="rounded-xl font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                                    >
                                        Simulasikan Gagal / Expired
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                {/* Timeline Status Order */}
                <Card className="rounded-2xl border-border bg-card shadow-sm">
                    <CardContent className="p-6 space-y-5">
                        <h2 className="text-sm font-black uppercase tracking-wide text-muted-foreground">
                            Progres Pesanan
                        </h2>

                        {order.order_status === "cancelled" ? (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive">
                                <XCircle className="h-5 w-5 shrink-0" />
                                <div className="text-xs font-semibold">
                                    Pesanan ini telah dibatalkan.
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {ORDER_STEPS.map((step, idx) => {
                                    const Icon = step.Icon;
                                    const active = currentStepIndex >= idx;
                                    return (
                                        <div
                                            key={step.key}
                                            className={`p-3 rounded-2xl border transition-colors ${
                                                active
                                                    ? "border-primary bg-primary/5 text-foreground"
                                                    : "border-border text-muted-foreground opacity-60"
                                            }`}
                                        >
                                            <Icon
                                                className={`h-4 w-4 mb-1.5 ${
                                                    active ? "text-primary" : ""
                                                }`}
                                            />
                                            <div className="text-xs font-bold">
                                                {step.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {(order.courier_name || order.tracking_number) && (
                            <div className="p-4 rounded-2xl bg-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground">
                                        Kurir &amp; Nomor Resi:{" "}
                                    </span>
                                    <span className="font-bold text-foreground">
                                        {order.courier_name || "Kurir"} —{" "}
                                        <span className="font-mono">
                                            {order.tracking_number || "-"}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {order.admin_notes && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                                <span className="font-bold">
                                    Catatan Admin:{" "}
                                </span>
                                <span>{order.admin_notes}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Rincian Barang & Info Transaksi */}
                    <div className="lg:col-span-7">
                        <Card className="rounded-2xl border-border bg-card shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-base font-black tracking-tight">
                                    Rincian Barang &amp; Pembayaran
                                </h2>
                                <div className="divide-y divide-border">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-sm">
                                                    {item.product_name}
                                                </div>
                                                {item.variant_label && (
                                                    <div className="text-muted-foreground">
                                                        Varian:{" "}
                                                        {item.variant_label}
                                                    </div>
                                                )}
                                                <div className="text-muted-foreground">
                                                    {item.quantity} x{" "}
                                                    {formatRupiah(
                                                        item.unit_price,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="font-extrabold text-sm">
                                                {formatRupiah(item.line_total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-border space-y-1.5 text-sm">
                                    <div className="flex justify-between text-muted-foreground text-xs">
                                        <span>Metode Pembayaran</span>
                                        <span className="font-semibold text-foreground">
                                            {paymentMethodLabel(
                                                order.payment_method,
                                            )}
                                        </span>
                                    </div>
                                    {order.payment_reference && (
                                        <div className="flex justify-between text-muted-foreground text-xs">
                                            <span>Referensi Transaksi</span>
                                            <span className="font-mono font-semibold text-foreground">
                                                {order.payment_reference}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground text-xs">
                                        <span>Ongkos Kirim</span>
                                        <span className="font-semibold text-foreground">
                                            {order.shipping_cost === 0
                                                ? "Gratis"
                                                : formatRupiah(
                                                      order.shipping_cost,
                                                  )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-bold">Total</span>
                                        <span className="text-lg font-black text-primary">
                                            {formatRupiah(order.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>
                                        Status pembayaran diverifikasi otomatis
                                        melalui sistem gateway.
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Informasi Penerima */}
                    <div className="lg:col-span-5">
                        <Card className="rounded-2xl border-border bg-card shadow-sm">
                            <CardContent className="p-6 space-y-3 text-xs">
                                <h2 className="text-base font-black tracking-tight">
                                    Informasi Pengiriman
                                </h2>
                                <div>
                                    <span className="text-muted-foreground block">
                                        Penerima
                                    </span>
                                    <span className="font-bold text-sm">
                                        {order.customer_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">
                                        Kontak
                                    </span>
                                    <span className="font-medium">
                                        {order.customer_phone} •{" "}
                                        {order.customer_email}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">
                                        Alamat Tujuan
                                    </span>
                                    <p className="font-medium leading-relaxed mt-0.5">
                                        {order.shipping_address},{" "}
                                        {order.shipping_city}
                                        {order.shipping_postal_code
                                            ? ` ${order.shipping_postal_code}`
                                            : ""}
                                    </p>
                                </div>
                                {order.notes && (
                                    <div>
                                        <span className="text-muted-foreground block">
                                            Catatan Pembeli
                                        </span>
                                        <p className="italic mt-0.5">
                                            "{order.notes}"
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}
