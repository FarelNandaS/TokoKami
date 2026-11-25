import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ChevronRight,
    ShoppingBag,
    ArrowLeft,
    CreditCard,
    QrCode,
    Banknote,
    ShieldCheck,
} from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CheckoutItem {
    productId: number;
    variantId: number | null;
    variantLabel?: string | null;
    name: string;
    image: string;
    price: number;
    originalPrice?: number | null;
    discountPercentage?: number;
    isOnSale?: boolean;
    quantity: number;
    stock: number;
}

interface CheckoutPageProps {
    checkoutItems?: CheckoutItem[];
    shippingCost?: number;
    errors?: Record<string, string>;
}

type PaymentMethod = "bank_transfer" | "qris" | "cod";

export default function CheckoutPage({
    checkoutItems = [],
    shippingCost = 0,
    errors = {},
}: CheckoutPageProps) {
    const { items: localItems, clearCart } = useCart();

    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [shippingCity, setShippingCity] = useState("");
    const [shippingPostalCode, setShippingPostalCode] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("bank_transfer");
    const [submitting, setSubmitting] = useState(false);

    const lastSyncedRef = useRef<string>("");

    useEffect(() => {
        const serialized = JSON.stringify(localItems);
        if (localItems.length === 0 || serialized === lastSyncedRef.current) {
            return;
        }

        lastSyncedRef.current = serialized;
        router.get(
            "/checkout",
            { items: serialized },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["checkoutItems", "shippingCost"],
            },
        );
    }, [localItems]);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const itemsToRender = useMemo(() => {
        return localItems
            .map((local) => {
                const server = checkoutItems.find(
                    (c) =>
                        c.productId === local.productId &&
                        (c.variantId ?? null) === (local.variantId ?? null),
                );
                if (!server) return null;
                return {
                    ...server,
                    quantity: local.quantity,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [localItems, checkoutItems]);

    const totals = useMemo(() => {
        const subtotal = itemsToRender.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );
        return {
            subtotal,
            shipping: itemsToRender.length > 0 ? shippingCost : 0,
            grandTotal:
                subtotal + (itemsToRender.length > 0 ? shippingCost : 0),
        };
    }, [itemsToRender, shippingCost]);

    const hasStockIssue = useMemo(
        () => itemsToRender.some((i) => i.stock <= 0 || i.quantity > i.stock),
        [itemsToRender],
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (itemsToRender.length === 0 || hasStockIssue || submitting) return;

        setSubmitting(true);
        router.post(
            "/checkout",
            {
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                shipping_address: shippingAddress,
                shipping_city: shippingCity,
                shipping_postal_code: shippingPostalCode,
                notes,
                payment_method: paymentMethod,
                items: itemsToRender.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: i.quantity,
                })),
            },
            {
                onSuccess: () => {
                    clearCart();
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            },
        );
    };

    return (
        <>
            <Head title="Checkout - TokoKami" />

            <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Checkout Pesanan
                        </h1>
                        <Link
                            href="/cart"
                            className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kembali ke Keranjang
                        </Link>
                    </div>
                </div>

                {itemsToRender.length === 0 ? (
                    <Card className="rounded-3xl border-dashed border-border bg-card/50">
                        <CardContent className="py-16 text-center space-y-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                <ShoppingBag className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="font-bold text-lg">
                                    Tidak Ada Item untuk Di-checkout
                                </h2>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    Tambahkan produk ke keranjang terlebih
                                    dahulu sebelum melanjutkan checkout.
                                </p>
                            </div>
                            <Link href="/product/catalog">
                                <Button className="rounded-full font-semibold">
                                    Jelajahi Produk
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                    >
                        {/* Form Pengiriman & Pembayaran */}
                        <div className="lg:col-span-7 space-y-6">
                            <Card className="rounded-2xl border-border bg-card shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <h2 className="text-base font-black tracking-tight">
                                        Data Penerima &amp; Pengiriman
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold">
                                                Nama Lengkap <span className="text-destructive text-lg">*</span>
                                            </label>
                                            <Input
                                                required
                                                value={customerName}
                                                onChange={(e) =>
                                                    setCustomerName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                            {errors.customer_name && (
                                                <p className="text-xs text-destructive">
                                                    {errors.customer_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold">
                                                Nomor WhatsApp / HP <span className="text-destructive text-lg">*</span>
                                            </label>
                                            <Input
                                                required
                                                value={customerPhone}
                                                onChange={(e) =>
                                                    setCustomerPhone(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0812xxxxxxxx"
                                            />
                                            {errors.customer_phone && (
                                                <p className="text-xs text-destructive">
                                                    {errors.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold">
                                            Email (untuk info order &amp; link
                                            tracking) <span className="text-destructive text-lg">*</span>
                                        </label>
                                        <Input
                                            type="email"
                                            required
                                            value={customerEmail}
                                            onChange={(e) =>
                                                setCustomerEmail(e.target.value)
                                            }
                                            placeholder="nama@email.com"
                                        />
                                        {errors.customer_email && (
                                            <p className="text-xs text-destructive">
                                                {errors.customer_email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold">
                                                Kota / Kabupaten <span className="text-destructive text-lg">*</span>
                                            </label>
                                            <Input
                                                required
                                                value={shippingCity}
                                                onChange={(e) =>
                                                    setShippingCity(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Surabaya"
                                            />
                                            {errors.shipping_city && (
                                                <p className="text-xs text-destructive">
                                                    {errors.shipping_city}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold">
                                                Kode Pos
                                            </label>
                                            <Input
                                                value={shippingPostalCode}
                                                onChange={(e) =>
                                                    setShippingPostalCode(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="60291"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold">
                                            Alamat Lengkap <span className="text-destructive text-lg">*</span>
                                        </label>
                                        <Textarea
                                            required
                                            rows={3}
                                            value={shippingAddress}
                                            onChange={(e) =>
                                                setShippingAddress(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                                        />
                                        {errors.shipping_address && (
                                            <p className="text-xs text-destructive">
                                                {errors.shipping_address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold">
                                            Catatan Tambahan (Opsional)
                                        </label>
                                        <Input
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            placeholder="Pesan untuk penjual / kurir..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-border bg-card shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <h2 className="text-base font-black tracking-tight">
                                        Metode Pembayaran
                                    </h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            {
                                                id: "bank_transfer" as const,
                                                label: "Transfer Bank",
                                                desc: "BCA / Mandiri / BRI",
                                                Icon: CreditCard,
                                            },
                                            {
                                                id: "qris" as const,
                                                label: "QRIS",
                                                desc: "E-Wallet & M-Banking",
                                                Icon: QrCode,
                                            },
                                            {
                                                id: "cod" as const,
                                                label: "COD",
                                                desc: "Bayar di tempat",
                                                Icon: Banknote,
                                            },
                                        ].map(({ id, label, desc, Icon }) => {
                                            const active = paymentMethod === id;
                                            return (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() =>
                                                        setPaymentMethod(id)
                                                    }
                                                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                                                        active
                                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                            : "border-border hover:border-primary/40"
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4 text-primary" />
                                                    <div className="text-xs font-bold">
                                                        {label}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {desc}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ringkasan Pesanan */}
                        <div className="lg:col-span-5">
                            <Card className="rounded-2xl border-border bg-card shadow-sm sticky top-24">
                                <CardContent className="p-6 space-y-5">
                                    <h2 className="text-base font-black tracking-tight">
                                        Ringkasan Pesanan
                                    </h2>

                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {itemsToRender.map((item) => (
                                            <div
                                                key={`${item.productId}-${item.variantId ?? "base"}`}
                                                className="flex items-center gap-3 text-xs"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-xl object-cover bg-muted border border-border shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold line-clamp-1">
                                                        {item.name}
                                                    </div>
                                                    {item.variantLabel && (
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {item.variantLabel}
                                                        </div>
                                                    )}
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {item.quantity} x{" "}
                                                        {formatRupiah(
                                                            item.price,
                                                        )}
                                                    </div>
                                                    {item.quantity >
                                                        item.stock && (
                                                        <div className="text-[11px] font-semibold text-destructive">
                                                            Stok tersisa:{" "}
                                                            {item.stock}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-bold shrink-0">
                                                    {formatRupiah(
                                                        item.price *
                                                            item.quantity,
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {errors.items && (
                                        <p className="text-xs font-semibold text-destructive">
                                            {errors.items}
                                        </p>
                                    )}

                                    <div className="space-y-2 text-sm border-t border-b border-border py-4">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span className="font-semibold text-foreground">
                                                {formatRupiah(totals.subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Ongkos Kirim</span>
                                            <span className="font-semibold text-foreground">
                                                {totals.shipping === 0
                                                    ? "Gratis"
                                                    : formatRupiah(
                                                          totals.shipping,
                                                      )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline justify-between">
                                        <span className="text-sm font-bold">
                                            Total Bayar
                                        </span>
                                        <span className="text-xl font-black text-primary">
                                            {formatRupiah(totals.grandTotal)}
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={submitting || hasStockIssue}
                                        className="w-full rounded-2xl font-bold py-6 shadow-lg shadow-primary/20"
                                    >
                                        {submitting
                                            ? "Memproses Pesanan..."
                                            : "Buat Pesanan"}
                                    </Button>

                                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>
                                            Harga &amp; promo divalidasi
                                            otomatis oleh sistem
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                )}
            </main>
        </>
    );
}
