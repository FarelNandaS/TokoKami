import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ShoppingBag,
    ChevronRight,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    Sparkles,
} from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ServerCartItem {
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
    category?: string;
}

interface CartPageProps {
    cartItems?: ServerCartItem[];
}

export default function CartPage({ cartItems = [] }: CartPageProps) {
    const {
        items: localItems,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart();

    const [isSyncing, setIsSyncing] = useState(false);
    const lastFetchedKeyRef = useRef<string>("");

    useEffect(() => {
        const serialized = JSON.stringify(localItems);

        if (localItems.length === 0) {
            lastFetchedKeyRef.current = "";
            return;
        }

        if (serialized === lastFetchedKeyRef.current) {
            return;
        }

        lastFetchedKeyRef.current = serialized;
        setIsSyncing(true);

        router.get(
            "/cart",
            { items: serialized },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["cartItems"],
                onFinish: () => setIsSyncing(false),
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

    // Gabungkan data harga/stok/promo dari server dengan kuantitas lokal agar perubahan +/- instan
    const mergedItems = useMemo(() => {
        return localItems
            .map((local) => {
                const server = cartItems.find(
                    (s) =>
                        s.productId === local.productId &&
                        (s.variantId ?? null) === (local.variantId ?? null),
                );

                if (!server) return null;

                const effectiveQty =
                    server.stock > 0
                        ? Math.min(local.quantity, server.stock)
                        : local.quantity;

                return {
                    ...server,
                    quantity: effectiveQty,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [localItems, cartItems]);

    const summary = useMemo(() => {
        let totalItems = 0;
        let subtotal = 0;
        let normalSubtotal = 0;

        mergedItems.forEach((item) => {
            totalItems += item.quantity;
            subtotal += item.price * item.quantity;
            const baseUnitPrice =
                item.originalPrice && item.originalPrice > item.price
                    ? item.originalPrice
                    : item.price;
            normalSubtotal += baseUnitPrice * item.quantity;
        });

        const totalSavings = Math.max(0, normalSubtotal - subtotal);

        return {
            totalItems,
            subtotal,
            totalSavings,
        };
    }, [mergedItems]);

    const handleClearCart = () => {
        clearCart();
        lastFetchedKeyRef.current = "";
        router.get(
            "/cart",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["cartItems"],
            },
        );
    };

    return (
        <>
            <Head title="Keranjang Belanja - TokoKami" />

            <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
                {/* Breadcrumb & Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Link
                            href="/"
                            className="hover:text-primary transition-colors"
                        >
                            Beranda
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">
                            Keranjang
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                                Keranjang Belanja
                                {summary.totalItems > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full text-xs font-bold"
                                    >
                                        {summary.totalItems} Produk
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Periksa kembali item dan potongan promo sebelum
                                lanjut ke checkout.
                            </p>
                        </div>

                        {mergedItems.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearCart}
                                className="rounded-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 self-start sm:self-auto gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Kosongkan Keranjang
                            </Button>
                        )}
                    </div>
                </div>

                {isSyncing && mergedItems.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2].map((n) => (
                            <div
                                key={n}
                                className="h-28 rounded-2xl border border-border bg-card animate-pulse"
                            />
                        ))}
                    </div>
                ) : mergedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-bold text-lg">
                                Keranjang Belanjamu Masih Kosong
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Yuk pilih produk favoritmu di katalog dan
                                manfaatkan promo yang sedang berlangsung.
                            </p>
                        </div>
                        <Link href="/product/catalog">
                            <Button className="rounded-full gap-1.5 font-semibold">
                                Mulai Belanja
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Daftar Item Keranjang */}
                        <div className="lg:col-span-8 space-y-4">
                            {mergedItems.map((item) => {
                                const isOutOfStock = item.stock <= 0;
                                const lineTotal = item.price * item.quantity;

                                return (
                                    <Card
                                        key={`${item.productId}-${item.variantId ?? "base"}`}
                                        className="rounded-2xl border-border bg-card shadow-sm overflow-hidden"
                                    >
                                        <CardContent className="p-4 flex gap-4">
                                            <Link
                                                href={`/product/${item.productId}`}
                                                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted shrink-0 border border-border"
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </Link>

                                            <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="space-y-1 min-w-0">
                                                        <Link
                                                            href={`/product/${item.productId}`}
                                                            className="font-bold text-sm sm:text-base line-clamp-1 hover:text-primary transition-colors"
                                                        >
                                                            {item.name}
                                                        </Link>

                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            {item.variantLabel && (
                                                                <span className="bg-muted px-2 py-0.5 rounded-md font-medium text-foreground">
                                                                    Varian:{" "}
                                                                    {
                                                                        item.variantLabel
                                                                    }
                                                                </span>
                                                            )}
                                                            {item.isOnSale &&
                                                                Boolean(
                                                                    item.discountPercentage,
                                                                ) && (
                                                                    <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 rounded-full">
                                                                        -
                                                                        {
                                                                            item.discountPercentage
                                                                        }
                                                                        %
                                                                    </Badge>
                                                                )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.productId,
                                                                item.variantId,
                                                            )
                                                        }
                                                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Hapus item
                                                        </span>
                                                    </Button>
                                                </div>

                                                <div className="flex flex-wrap items-end justify-between gap-3 pt-2 border-t border-border">
                                                    <div>
                                                        <div className="text-sm sm:text-base font-extrabold text-primary">
                                                            {formatRupiah(
                                                                lineTotal,
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {formatRupiah(
                                                                item.price,
                                                            )}{" "}
                                                            / item
                                                            {item.originalPrice &&
                                                                item.originalPrice >
                                                                    item.price && (
                                                                    <span className="ml-1.5 line-through">
                                                                        {formatRupiah(
                                                                            item.originalPrice,
                                                                        )}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isOutOfStock ? (
                                                            <span className="text-xs font-semibold text-destructive">
                                                                Stok Habis
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-none"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.productId,
                                                                            item.variantId,
                                                                            item.quantity -
                                                                                1,
                                                                            item.stock,
                                                                        )
                                                                    }
                                                                >
                                                                    <Minus className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <span className="w-9 text-center text-xs font-bold">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled={
                                                                        item.quantity >=
                                                                        item.stock
                                                                    }
                                                                    className="h-8 w-8 rounded-none"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            item.productId,
                                                                            item.variantId,
                                                                            item.quantity +
                                                                                1,
                                                                            item.stock,
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Ringkasan Belanja */}
                        <div className="lg:col-span-4">
                            <Card className="rounded-2xl border-border bg-card shadow-sm sticky top-24">
                                <CardContent className="p-6 space-y-4">
                                    <h2 className="text-base font-black tracking-tight">
                                        Ringkasan Belanja
                                    </h2>

                                    <div className="space-y-2.5 text-sm border-t border-b border-border py-4">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>
                                                Total Item ({summary.totalItems}
                                                )
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatRupiah(summary.subtotal)}
                                            </span>
                                        </div>

                                        {summary.totalSavings > 0 && (
                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    Hemat Promo
                                                </span>
                                                <span>
                                                    -
                                                    {formatRupiah(
                                                        summary.totalSavings,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-baseline justify-between">
                                        <span className="text-sm font-bold">
                                            Total Pembayaran
                                        </span>
                                        <span className="text-xl font-black text-primary">
                                            {formatRupiah(summary.subtotal)}
                                        </span>
                                    </div>

                                    <Link href="/checkout" className="block">
                                        <Button
                                            size="lg"
                                            disabled={mergedItems.some(
                                                (i) => i.stock <= 0,
                                            )}
                                            className="w-full rounded-2xl font-bold py-6 gap-2 shadow-lg shadow-primary/20"
                                        >
                                            Lanjut ke Checkout
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
