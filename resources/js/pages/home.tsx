import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import Icons dari Lucide React
import {
    Search,
    ShoppingBag,
    Heart,
    ChevronRight,
    ChevronLeft,
    Star,
    Plus,
    Zap,
    Clock,
    PackageX,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Banner } from "@/lib/datatable-colums/banner-slider";
import { productCatalog, productDetail, promo } from "@/routes";
import { useWishlist } from "@/hooks/use-whislist";
import { useCart } from "@/hooks/use-cart";

// ==================== INTERFACES (Untuk Props CMS) ====================
interface Category {
    id: number;
    name: string;
    slug: string;
}

interface ProductItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    originalPrice?: number | null;
    discountPercentage?: number | null;
    isOnSale?: boolean;
    stock?: number;
    hasVariants: boolean;
    category: Category[];
}

interface HomeProps {
    banners?: Banner[];
    products?: ProductItem[];
    promoProducts?: ProductItem[];
}

export default function StorefrontHome({
    banners,
    products,
    promoProducts,
}: HomeProps) {
    const [cartCount, setCartCount] = useState(2);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false }),
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { isWishlisted, toggleWishlist } = useWishlist();
    const { addItem } = useCart();

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title="TokoKami - Belanja Online Mudah & Terpercaya" />

            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
                {/* ==================== HERO BANNER SLIDER / PLACEHOLDER ==================== */}
                <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white shadow-xl">
                        {!banners || banners.length === 0 ? (
                            /* PLACEHOLDER KETIKA BANNER KOSONG */
                            <div className="relative z-10 p-8 md:p-14 lg:p-16 max-w-2xl space-y-4">
                                <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold">
                                    <Sparkles className="h-3.5 w-3.5" /> Selamat
                                    Datang
                                </div>
                                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                                    Jelajahi Produk Terbaik di TokoKami
                                </h1>
                                <p className="text-zinc-300 text-sm sm:text-base font-normal">
                                    Platform belanja online terpercaya dengan
                                    pilihan produk berkualitas tinggi untuk
                                    memenuhi kebutuhan Anda.
                                </p>
                                <div className="pt-2">
                                    <Link href="#products-section">
                                        <Button
                                            size="lg"
                                            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-lg shadow-primary/25"
                                        >
                                            Lihat Produk{" "}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* SLIDER NORMAL KETIKA BANNER ADA */
                            <>
                                <div className="overflow-hidden" ref={emblaRef}>
                                    <div className="flex">
                                        {banners.map((banner) => (
                                            <div
                                                key={banner.id}
                                                className="flex-[0_0_100%] min-w-0 relative"
                                            >
                                                {/* 1. Berikan tinggi tetap (h-...) dan flexbox untuk merapikan posisi teks */}
                                                <div className="relative z-10 p-6 sm:p-10 md:p-14 lg:p-16 max-w-2xl h-[320px] sm:h-[400px] lg:h-[450px] flex flex-col justify-center space-y-4">
                                                    {/* Title (Hanya dirender jika ada isinya) */}
                                                    {banner.title && (
                                                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md">
                                                            {banner.title}
                                                        </h1>
                                                    )}

                                                    {/* Subtitle (Hanya dirender jika ada isinya) */}
                                                    {banner.subtitle && (
                                                        <p className="text-zinc-200 text-xs sm:text-sm md:text-base font-normal line-clamp-2 drop-shadow">
                                                            {banner.subtitle}
                                                        </p>
                                                    )}

                                                    {/* Button (Hanya dirender jika btn_text & link_url terisi) */}
                                                    {banner.link_url && (
                                                        <div className="pt-2">
                                                            <Link
                                                                href={
                                                                    banner.link_url
                                                                }
                                                            >
                                                                <Button
                                                                    size="lg"
                                                                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-lg shadow-primary/25"
                                                                >
                                                                    {banner.btn_text ??
                                                                        "Cek Sekarang"}{" "}
                                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 2. Gambar background dibuat absolute agar selalu menutup kontainer dengan rapi */}
                                                <div className="absolute inset-0 z-0">
                                                    <img
                                                        src={`/storage/${banner.image_path}`}
                                                        alt={
                                                            banner.title ||
                                                            "Banner TokoKami"
                                                        }
                                                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                                                    />
                                                    {/* Gradient overlay agar teks tetap terbaca meskipun gambar terang */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-background/40 h-9 w-9"
                                        onClick={() => emblaApi?.scrollPrev()}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-full bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-background/40 h-9 w-9"
                                        onClick={() => emblaApi?.scrollNext()}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="absolute bottom-6 left-8 z-20 flex items-center gap-2">
                                    {banners.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() =>
                                                emblaApi?.scrollTo(idx)
                                            }
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                selectedIndex === idx
                                                    ? "w-8 bg-primary"
                                                    : "w-2 bg-white/40"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* ==================== PROMO / SALE SECTION ==================== */}
                {promoProducts && promoProducts.length > 0 && (
                    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Produk Lagi Promo
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Penawaran spesial & potongan harga yang
                                    sedang berlangsung.
                                </p>
                            </div>
                            <Link
                                href={promo()}
                                className="text-sm font-semibold text-primary hover:underline hidden sm:flex items-center gap-1"
                            >
                                Lihat Semua <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {promoProducts.map((product) => {
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

                                                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                                                    {product.discountPercentage
                                                        ? `-${product.discountPercentage}%`
                                                        : product.originalPrice
                                                          ? `Hemat ${formatRupiah(product.originalPrice - product.price)}`
                                                          : "SALE"}
                                                </Badge>

                                                {isOutOfStock && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="absolute bottom-3 left-3 text-[10px] font-bold"
                                                    >
                                                        Stok Habis
                                                    </Badge>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(
                                                            product.id,
                                                        );
                                                    }}
                                                    className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground h-8 w-8"
                                                >
                                                    <Heart
                                                        className={`h-4 w-4 transition-colors ${
                                                            isWishlisted(
                                                                product.id,
                                                            )
                                                                ? "fill-rose-500 text-rose-500"
                                                                : "text-foreground"
                                                        }`}
                                                    />
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

                                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>
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
                    </section>
                )}

                {/* ==================== FEATURED PRODUCTS / PLACEHOLDER ==================== */}
                <section
                    id="products-section"
                    className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Katalog Produk
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Temukan berbagai produk pilihan dengan tag dan
                                kategori relevan.
                            </p>
                        </div>
                        <Link
                            href={productCatalog()}
                            className="text-sm font-semibold text-primary hover:underline hidden sm:flex items-center gap-1"
                        >
                            Lihat Semua <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {!products || products.length === 0 ? (
                        /* PLACEHOLDER KETIKA PRODUK KOSONG */
                        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50 text-center space-y-3 my-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <PackageX className="h-7 w-7" />
                            </div>
                            <h3 className="font-bold text-lg">
                                Belum Ada Produk Tersedia
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                Produk terbaru sedang disiapkan oleh admin toko.
                                Silakan periksa kembali beberapa saat lagi.
                            </p>
                        </div>
                    ) : (
                        /* GRID PRODUK NORMAL KETIKA DATA ADA */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => {
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
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleWishlist(
                                                            product.id,
                                                        );
                                                    }}
                                                    className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground h-8 w-8"
                                                >
                                                    <Heart
                                                        className={`h-4 w-4 transition-colors ${
                                                            isWishlisted(
                                                                product.id,
                                                            )
                                                                ? "fill-rose-500 text-rose-500"
                                                                : "text-foreground"
                                                        }`}
                                                    />
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

                                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>
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
                                                            if (!product.hasVariants) {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                addItem(product.id, 1);
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
                </section>
            </div>
        </>
    );
}
