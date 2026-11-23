import React, { useMemo, useRef, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Search,
    ShoppingBag,
    Heart,
    ChevronRight,
    Plus,
    Tag,
    SlidersHorizontal,
    Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { productDetail } from "@/routes";

interface Category {
    id: number;
    name: string;
    slug?: string;
}

interface PromoProductItem {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    image: string;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    isOnSale?: boolean;
    category: Category[];
}

interface PromoPageProps {
    products: PromoProductItem[];
    categories?: Category[];
}

type PromoSortOption = "discount" | "latest" | "price-asc" | "price-desc";

export default function ProductsPromo({
    products = [],
    categories = [],
}: PromoPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sortBy, setSortBy] = useState<PromoSortOption>("discount");
    const [cartCount, setCartCount] = useState(2);

    // Drag-to-scroll horizontal untuk bar kategori
    const categoryScrollRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const [isDraggingCategory, setIsDraggingCategory] = useState(false);

    const handleCategoryMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = categoryScrollRef.current;
        if (!el) return;

        isDraggingRef.current = true;
        hasDraggedRef.current = false;
        startXRef.current = e.pageX - el.offsetLeft;
        scrollLeftRef.current = el.scrollLeft;
        setIsDraggingCategory(true);
    };

    const handleCategoryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Pastikan hanya item yang memang sedang promo/memiliki potongan harga yang tampil
    const promoItems = useMemo(() => {
        return products.filter(
            (item) =>
                Boolean(item.isOnSale) ||
                Boolean(item.originalPrice && item.originalPrice > item.price),
        );
    }, [products]);

    const categoryOptions = useMemo(() => {
        if (categories.length > 0) return categories;

        const map = new Map<number, Category>();
        promoItems.forEach((prod) => {
            prod.category?.forEach((cat) => {
                if (!map.has(cat.id)) {
                    map.set(cat.id, cat);
                }
            });
        });
        return Array.from(map.values());
    }, [categories, promoItems]);

    const filteredProducts = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        const result = promoItems.filter((item) => {
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

            return matchesSearch && matchesCategory;
        });

        return [...result].sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                case "latest":
                    return b.id - a.id;
                case "discount":
                default:
                    return (
                        (b.discountPercentage ?? 0) -
                        (a.discountPercentage ?? 0)
                    );
            }
        });
    }, [promoItems, searchQuery, selectedCategory, sortBy]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setSortBy("discount");
    };

    return (
        <>
            <Head title="Promo & Diskon - TokoKami" />

            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
                {/* ==================== MAIN PROMO CATALOG ==================== */}
                <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1 space-y-6">
                    {/* Breadcrumb & Header */}
                    <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                                    <Zap className="h-3.5 w-3.5 fill-destructive" />
                                    Penawaran Spesial Aktif
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                                    Semua Produk Promo
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan{" "}
                                    <span className="font-semibold text-foreground">
                                        {filteredProducts.length}
                                    </span>{" "}
                                    produk dengan potongan harga.
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
                                    placeholder="Cari produk promo..."
                                    className="w-full pl-10 pr-4 h-10 rounded-xl"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Filter & Sort Bar */}
                    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div
                            ref={categoryScrollRef}
                            onMouseDown={handleCategoryMouseDown}
                            onMouseMove={handleCategoryMouseMove}
                            onMouseUp={stopCategoryDragging}
                            onMouseLeave={stopCategoryDragging}
                            className={`flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                                isDraggingCategory
                                    ? "cursor-grabbing"
                                    : "cursor-grab"
                            }`}
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

                        <div className="flex items-center gap-2 shrink-0">
                            <Select
                                value={sortBy}
                                onValueChange={(val) =>
                                    setSortBy(val as PromoSortOption)
                                }
                                aria-label="Urutkan promo"
                            >
                                <SelectTrigger className="h-8 rounded-full border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="discount">
                                        Diskon Terbesar
                                    </SelectItem>
                                    <SelectItem value="latest">
                                        Terbaru
                                    </SelectItem>
                                    <SelectItem value="price-asc">
                                        Harga Terendah
                                    </SelectItem>
                                    <SelectItem value="price-desc">
                                        Harga Tertinggi
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Grid Produk Promo */}
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3">
                            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                                <Tag className="h-7 w-7" />
                            </div>
                            <h2 className="font-bold text-lg">
                                Belum Ada Promo yang Cocok
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Coba ubah kata kunci pencarian atau reset filter
                                kategori.
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
                                const savedAmount =
                                    product.originalPrice &&
                                    product.originalPrice > product.price
                                        ? product.originalPrice - product.price
                                        : null;

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
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                />

                                                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                                                    {product.discountPercentage
                                                        ? `-${product.discountPercentage}%`
                                                        : savedAmount
                                                        ? `Hemat ${formatRupiah(savedAmount)}`
                                                        : "PROMO"}
                                                </Badge>

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
                                                        href={`/product/${product.id}`}
                                                    >
                                                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                </div>

                                                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="text-base font-extrabold text-primary">
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
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
