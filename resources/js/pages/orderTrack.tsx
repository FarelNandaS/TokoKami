import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    CheckCircle2,
    Clock,
    Package,
    Truck,
    XCircle,
    Upload,
    Copy,
    Check,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { InputFile } from "@/components/input-file";

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
    payment_method: "bank_transfer" | "qris" | "cod" | string;
    payment_status:
        | "unpaid"
        | "waiting_verification"
        | "paid"
        | "rejected"
        | "refunded"
        | string;
    payment_proof_url?: string | null;
    order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | string;
    courier_name?: string | null;
    tracking_number?: string | null;
    admin_notes?: string | null;
    created_at?: string | null;
    items: TrackOrderItem[];
}

interface OrderTrackPageProps {
    order: OrderTrackData;
    errors?: Record<string, string>;
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
    errors = {},
}: OrderTrackPageProps) {
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
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
                return "Transfer Bank";
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
            case "waiting_verification":
                return (
                    <Badge className="bg-amber-500 text-white">
                        Menunggu Verifikasi
                    </Badge>
                );
            case "rejected":
                return <Badge variant="destructive">Bukti Ditolak</Badge>;
            case "refunded":
                return <Badge variant="secondary">Refund</Badge>;
            default:
                return <Badge variant="outline">Belum Dibayar</Badge>;
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

    const handleUploadProof = (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile || uploading) return;

        setUploading(true);
        router.post(
            `/order/track/${order.tracking_token}/payment-proof`,
            { payment_proof: proofFile },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setProofFile(null),
                onFinish: () => setUploading(false),
            },
        );
    };

    const canUploadProof =
        order.order_status !== "cancelled" &&
        order.payment_method !== "cod" &&
        order.payment_status !== "paid";

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
                                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted hover:bg-accent transition-colors"
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
                                Simpan halaman ini atau cek email{" "}
                                <span className="font-medium text-foreground">
                                    {order.customer_email}
                                </span>{" "}
                                untuk memantau status pengiriman kapan saja.
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
                    {/* Daftar Barang & Pembayaran */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="rounded-2xl border-border bg-card shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-base font-black tracking-tight">
                                    Rincian Barang
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
                            </CardContent>
                        </Card>

                        {/* Upload Bukti Pembayaran */}
                        {order.payment_method !== "cod" && (
                            <Card className="rounded-2xl border-border bg-card shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <h2 className="text-base font-black tracking-tight">
                                        Bukti Pembayaran
                                    </h2>

                                    {order.payment_proof_url && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">
                                                Bukti pembayaran terunggah saat
                                                ini:
                                            </p>
                                            <img
                                                src={order.payment_proof_url}
                                                alt="Bukti Pembayaran"
                                                className="max-h-60 rounded-xl border border-border object-contain bg-muted"
                                            />
                                        </div>
                                    )}

                                    {canUploadProof && (
                                        <form
                                            onSubmit={handleUploadProof}
                                            className="space-y-3 pt-2"
                                        >
                                            <InputFile
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                value={proofFile ? [proofFile] : []}
                                                onChange={(files) =>
                                                    setProofFile(
                                                        files[0] ?? null
                                                    )
                                                }
                                            />
                                            {errors.payment_proof && (
                                                <p className="text-xs text-destructive">
                                                    {errors.payment_proof}
                                                </p>
                                            )}
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={
                                                    !proofFile || uploading
                                                }
                                                className="rounded-xl gap-1.5 font-semibold"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                {uploading
                                                    ? "Mengunggah..."
                                                    : "Unggah Bukti Pembayaran"}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        )}
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
