import React, { MouseEvent, useMemo, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Search,
    ShoppingBag,
    Heart,
    ChevronRight,
    Plus,
    PackageX,
    SlidersHorizontal,
    Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
    id: number;
    name: string;
    slug?: string;
}

interface CatalogProductItem {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    image: string;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    isOnSale?: boolean;
    category: Category[];
    created_at?: string;
}

interface ProductsPageProps {
    products: CatalogProductItem[];
    categories?: Category[];
    initialCategory?: string;
    onlyPromo?: boolean;
}

type SortOption = "latest" | "price-asc" | "price-desc" | "discount";

export default function ProductsCatalog({
    products = [],
    categories = [],
    initialCategory = "all",
    onlyPromo = false,
}: ProductsPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<string>(initialCategory);
    const [promoOnly, setPromoOnly] = useState<boolean>(onlyPromo);
    const [sortBy, setSortBy] = useState<SortOption>("latest");
    const [cartCount, setCartCount] = useState(2);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Kumpulkan daftar kategori unik jika props categories tidak dikirim terpisah
    const categoryOptions = useMemo(() => {
        if (categories.length > 0) return categories;

        const map = new Map<number, Category>();
        products.forEach((prod) => {
            prod.category?.forEach((cat) => {
                if (!map.has(cat.id)) {
                    map.set(cat.id, cat);
                }
            });
        });
        return Array.from(map.values());
    }, [categories, products]);

    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const result = products.filter((item) => {
            const matchesSearch =
                !q ||
                item.name.toLowerCase().includes(q) ||
                (item.description &&
                    item.description.toLowerCase().includes(q)) ||
                item.category?.some((c) => c.name.toLowerCase().includes(q));

            const matchesCategory =
                selectedCategory === "all" ||
                item.category?.some(
                    (c) =>
                        String(c.id) === selectedCategory ||
                        c.slug === selectedCategory,
                );

            const hasSale =
                Boolean(item.isOnSale) ||
                Boolean(item.originalPrice && item.originalPrice > item.price);

            const matchesPromo = !promoOnly || hasSale;

            return matchesSearch && matchesCategory && matchesPromo;
        });

        return [...result].sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "discount":
                    return (
                        (b.discountPercentage ?? 0) -
                        (a.discountPercentage ?? 0)
                    );
                case "latest":
                default:
                    return b.id - a.id;
            }
        });
    }, [products, searchQuery, selectedCategory, promoOnly, sortBy]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setPromoOnly(false);
        setSortBy("latest");
    };

    // Fungsi variable dll untuk scrollbar kategori
    const categoryScrollRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [isDraggingCategory, setIsDraggingCategory] = useState(false);

    const handleCategoryMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        const el = categoryScrollRef.current;
        if (!el) return;

        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.pageX - el.offsetLeft;
        scrollLeftRef.current = el.scrollLeft;
        setIsDraggingCategory(true);
    };

    const handleCategoryMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !categoryScrollRef.current) return;

        const x = e.pageX - categoryScrollRef.current.offsetLeft;
        const walk = x - startXRef.current;

        if (Math.abs(walk) > 4) {
            hasDraggedRef.current = true;
        }

        categoryScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const stopCategoryDragging = () => {
        isDraggingRef.current = false;
        setIsDraggingCategory(false);
        setTimeout(() => {
            hasDraggedRef.current = false;
        }, 0);
    };

    return (
        <>
            <Head title="Semua Produk - TokoKami" />

            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
                {/* ==================== MAIN CATALOG ==================== */}
                <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
                    {/* Breadcrumb & Title */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                    Katalog Produk
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan{" "}
                                    <span className="font-semibold text-foreground">
                                        {filteredProducts.length}
                                    </span>{" "}
                                    produk tersedia.
                                </p>
                            </div>

                            {/* Search Mobile */}
                            <div className="relative md:hidden w-full">
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Cari produk..."
                                    className="w-full pl-10 pr-4 h-10 rounded-xl"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div className="bg-card border border-border rounded-2xl px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Filter Kategori */}
                        <div
                            ref={categoryScrollRef}
                            onMouseDown={handleCategoryMouseDown}
                            onMouseMove={handleCategoryMouseMove}
                            onMouseUp={stopCategoryDragging}
                            onMouseLeave={stopCategoryDragging}
                            className={`flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none py-6 ${isDraggingCategory ? "cursor-grabbing" : "cursor-grab"}`}
                        >
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                                Kategori:
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    selectedCategory === "all"
                                        ? "default"
                                        : "outline"
                                }
                                className="rounded-full h-8 text-xs shrink-0"
                                onClick={() => {
                                    if (hasDraggedRef.current) return;
                                    setSelectedCategory("all");
                                }}
                            >
                                Semua
                            </Button>
                            {categoryOptions.map((cat) => {
                                const val = cat.slug || String(cat.id);
                                const active = selectedCategory === val;
                                return (
                                    <Button
                                        key={cat.id}
                                        type="button"
                                        size="sm"
                                        variant={active ? "default" : "outline"}
                                        className="rounded-full h-8 text-xs shrink-0"
                                        onClick={() => {
                                            if (hasDraggedRef.current) return;
                                            setSelectedCategory(val);
                                        }}
                                    >
                                        {cat.name}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Promo Toggle & Sort */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                variant={promoOnly ? "default" : "outline"}
                                className="rounded-full h-8 text-xs gap-1.5"
                                onClick={() => setPromoOnly((prev) => !prev)}
                            >
                                <Tag className="h-3.5 w-3.5" />
                                Sedang Promo
                            </Button>

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(e.target.value as SortOption)
                                }
                                aria-label="Urutkan produk"
                                className="h-8 rounded-full border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="discount">
                                    Diskon Terbesar
                                </option>
                                <option value="price-asc">
                                    Harga Terendah
                                </option>
                                <option value="price-desc">
                                    Harga Tertinggi
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Grid Produk */}
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <PackageX className="h-7 w-7" />
                            </div>
                            <h2 className="font-bold text-lg">
                                Produk Tidak Ditemukan
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Coba ubah kata kunci pencarian atau reset filter
                                yang sedang aktif.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                className="rounded-full"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => {
                                const hasSale =
                                    Boolean(product.isOnSale) ||
                                    Boolean(
                                        product.originalPrice &&
                                        product.originalPrice > product.price,
                                    );

                                return (
                                    <Card
                                        key={product.id}
                                        className="group overflow-hidden rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-0 p-0"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-muted">
                                            <Link
                                                href={`/products/${product.id}`}
                                            >
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </Link>

                                            {hasSale && (
                                                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                                                    {product.discountPercentage
                                                        ? `-${product.discountPercentage}%`
                                                        : product.originalPrice
                                                          ? `Hemat ${formatRupiah(product.originalPrice - product.price)}`
                                                          : "SALE"}
                                                </Badge>
                                            )}

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground h-8 w-8"
                                            >
                                                <Heart className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Simpan ke wishlist
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
                                                    href={`/products/${product.id}`}
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
                                                    onClick={() =>
                                                        setCartCount(
                                                            (c) => c + 1,
                                                        )
                                                    }
                                                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 shrink-0"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                    <span className="sr-only">
                                                        Tambah ke keranjang
                                                    </span>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
