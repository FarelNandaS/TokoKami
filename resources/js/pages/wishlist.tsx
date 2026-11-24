import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Heart,
    ChevronRight,
    Plus,
    Trash2,
    ShoppingBag,
    ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist } from "@/hooks/use-whislist";
import { useCart } from "@/hooks/use-cart";
import { productDetail } from "@/routes";

interface Category {
    id: number;
    name: string;
    slug?: string;
}

interface WishlistProductItem {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    image: string;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    isOnSale?: boolean;
    stock?: number;
    hasVariants: boolean | false;
    category: Category[];
}

interface WishlistPageProps {
    products?: WishlistProductItem[];
}

export default function WishlistPage({ products = [] }: WishlistPageProps) {
    const { wishlistIds, removeWishlist, clearWishlist } = useWishlist();

    const [searchQuery, setSearchQuery] = useState("");
    const [cartCount, setCartCount] = useState(2);
    const [isSyncing, setIsSyncing] = useState(false);
    const lastFetchedKeyRef = useRef<string>("");

    const { addItem } = useCart();

    // Sinkronkan ID di localStorage dengan data produk terbaru dari backend
    useEffect(() => {
        const idsKey = wishlistIds.join(",");

        if (wishlistIds.length === 0) {
            lastFetchedKeyRef.current = "";
            return;
        }

        const serverIdsKey = products.map((p) => p.id).join(",");
        if (idsKey === serverIdsKey || idsKey === lastFetchedKeyRef.current) {
            return;
        }

        lastFetchedKeyRef.current = idsKey;
        setIsSyncing(true);

        router.get(
            "/wishlist",
            { ids: idsKey },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["products"],
                onFinish: () => setIsSyncing(false),
            },
        );
    }, [wishlistIds, products]);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Filter item yang masih ada di wishlistIds + filter pencarian navbar
    const visibleProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return products.filter((item) => {
            if (!wishlistIds.includes(item.id)) return false;
            if (!q) return true;

            return (
                item.name.toLowerCase().includes(q) ||
                item.category?.some((c) => c.name.toLowerCase().includes(q))
            );
        });
    }, [products, wishlistIds, searchQuery]);

    const handleClearAll = () => {
        clearWishlist();
        lastFetchedKeyRef.current = "";
        router.get(
            "/wishlist",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ["products"],
            },
        );
    };

    return (
        <>
            <Head title="Wishlist Saya - TokoKami" />

            <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
                {/* Breadcrumb & Header */}
                <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                                Wishlist Saya
                                {wishlistIds.length > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full text-xs font-bold"
                                    >
                                        {wishlistIds.length} Item
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Produk favoritmu tersimpan otomatis di browser
                                ini tanpa perlu login.
                            </p>
                        </div>

                        {wishlistIds.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                className="rounded-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 self-start sm:self-auto gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus Semua
                            </Button>
                        )}
                    </div>
                </div>

                {/* Loading Skeleton saat sinkronisasi awal */}
                {isSyncing && visibleProducts.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({
                            length: Math.min(wishlistIds.length, 4),
                        }).map((_, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
                            >
                                <div className="aspect-square bg-muted" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 w-1/3 bg-muted rounded" />
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-8 w-full bg-muted rounded-xl mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : wishlistIds.length === 0 || visibleProducts.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <Heart className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-bold text-lg">
                                {searchQuery
                                    ? "Produk Tidak Ditemukan di Wishlist"
                                    : "Wishlist Kamu Masih Kosong"}
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                {searchQuery
                                    ? "Coba kata kunci lain atau hapus pencarian untuk melihat semua item tersimpan."
                                    : "Klik ikon hati pada produk yang kamu suka untuk menyimpannya di sini."}
                            </p>
                        </div>
                        {searchQuery ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="rounded-full"
                            >
                                Reset Pencarian
                            </Button>
                        ) : (
                            <Link href="/product/catalog">
                                <Button className="rounded-full gap-1.5 font-semibold">
                                    Jelajahi Produk
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    /* Grid Wishlist */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {visibleProducts.map((product) => {
                            const hasSale =
                                Boolean(product.isOnSale) ||
                                Boolean(
                                    product.originalPrice &&
                                    product.originalPrice > product.price,
                                );
                            const isOutOfStock =
                                typeof product.stock === "number" &&
                                product.stock <= 0;

                            return (
                                <Link href={productDetail(product.id)}>
                                    <Card
                                        key={product.id}
                                        className="group overflow-hidden rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-0 p-0"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-muted">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ${
                                                    isOutOfStock
                                                        ? "opacity-60"
                                                        : ""
                                                }`}
                                            />

                                            {hasSale && (
                                                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                                                    {product.discountPercentage
                                                        ? `-${product.discountPercentage}%`
                                                        : product.originalPrice
                                                          ? `Hemat ${formatRupiah(product.originalPrice - product.price)}`
                                                          : "SALE"}
                                                </Badge>
                                            )}

                                            {isOutOfStock && (
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute bottom-3 left-3 text-[10px] font-bold"
                                                >
                                                    Stok Habis
                                                </Badge>
                                            )}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeWishlist(product.id)
                                                }
                                                title="Hapus dari wishlist"
                                                className="absolute top-3 right-3 rounded-full bg-background/85 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground text-rose-500 h-8 w-8 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Hapus dari wishlist
                                                </span>
                                            </Button>
                                        </div>

                                        <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                            <div>
                                                <div className="flex flex-wrap gap-1 mb-1.5">
                                                    {product.category?.map(
                                                        (cat) => (
                                                            <span
                                                                key={cat.id}
                                                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                                                            >
                                                                #{cat.name}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/product/${product.id}`}
                                                >
                                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                            </div>

                                            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                                                <div>
                                                    <div className="text-base font-extrabold text-foreground">
                                                        {formatRupiah(
                                                            product.price,
                                                        )}
                                                    </div>
                                                    {product.originalPrice &&
                                                        product.originalPrice >
                                                            product.price && (
                                                            <div className="text-xs text-muted-foreground line-through">
                                                                {formatRupiah(
                                                                    product.originalPrice,
                                                                )}
                                                            </div>
                                                        )}
                                                </div>

                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    disabled={isOutOfStock}
                                                    onClick={(e) => {
                                                        if (
                                                            !product.hasVariants
                                                        ) {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            addItem(
                                                                product.id,
                                                                1,
                                                            );
                                                        }
                                                    }}
                                                    className="cursor-pointer rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 shrink-0"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    <span className="sr-only">
                                                        Tambah ke keranjang
                                                    </span>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}
