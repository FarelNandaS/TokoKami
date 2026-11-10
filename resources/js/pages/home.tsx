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
    category: Category[];
}

interface FlashSaleItem {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    soldCount: number;
    stockCount: number;
    image: string;
}

interface FlashSaleConfig {
    title: string;
    subtitle: string;
    endTime: string;
    items: FlashSaleItem[];
}

interface HomeProps {
    banners?: Banner[];
    flashSale?: FlashSaleConfig;
    products?: ProductItem[];
}

export default function StorefrontHome({
    banners,
    flashSale,
    products,
}: HomeProps) {
    const [cartCount, setCartCount] = useState(2);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false }),
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);

    const [timeLeft, setTimeLeft] = useState({
        hours: "00",
        minutes: "00",
        seconds: "00",
    });

    useEffect(() => {
        if (!flashSale?.endTime) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(flashSale.endTime).getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
                return;
            }

            const hours = Math.floor(
                (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor(
                (distance % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                hours: hours < 10 ? `0${hours}` : `${hours}`,
                minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
                seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [flashSale]);

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
                {/* ==================== HEADER / NAVBAR ==================== */}
                <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-sm">
                                    TK
                                </div>
                                <span className="text-xl font-bold tracking-tight text-foreground">
                                    Toko
                                    <span className="text-primary">Kami</span>
                                </span>
                            </Link>

                            <div className="hidden md:flex flex-1 max-w-md relative">
                                <Input
                                    type="text"
                                    placeholder="Cari produk favoritmu di TokoKami..."
                                    className="w-full pl-10 pr-4 h-10 rounded-full border-input focus-visible:ring-primary"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>

                            {/* Wishlist dan Shopping Bag / Cart */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative hover:bg-accent rounded-full"
                                >
                                    <Heart className="h-5 w-5" />
                                    <span className="sr-only">Wishlist</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative hover:bg-accent rounded-full"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                                            {cartCount}
                                        </span>
                                    )}
                                    <span className="sr-only">Keranjang</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

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
                                                                    {
                                                                        banner.btn_text ?? "Cek Sekarang"
                                                                    }{" "}
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

                {/* ==================== FLASH SALE SECTION (Opsional) ==================== */}
                {flashSale && flashSale.items.length > 0 && (
                    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-primary/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary text-primary-foreground rounded-2xl animate-pulse">
                                        <Zap className="h-6 w-6 fill-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight uppercase">
                                            {flashSale.title}
                                        </h2>
                                        <p className="text-xs text-zinc-400">
                                            {flashSale.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-bold bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-2xl">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-zinc-400">
                                        Berakhir dalam:
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md font-extrabold">
                                            {timeLeft.hours}
                                        </span>{" "}
                                        :
                                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md font-extrabold">
                                            {timeLeft.minutes}
                                        </span>{" "}
                                        :
                                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md font-extrabold">
                                            {timeLeft.seconds}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {flashSale.items.map((item) => {
                                    const percentageSold = Math.round(
                                        (item.soldCount / item.stockCount) *
                                            100,
                                    );

                                    return (
                                        <Card
                                            key={item.id}
                                            className="bg-zinc-900/90 border-zinc-800 overflow-hidden group hover:border-primary/50 transition-all"
                                        >
                                            <div className="relative aspect-square overflow-hidden bg-zinc-800">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground font-black text-[10px] px-2 py-0.5 rounded-full">
                                                    -{item.discountPercentage}%
                                                </Badge>
                                            </div>

                                            <CardContent className="p-3.5 space-y-3">
                                                <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">
                                                    {item.name}
                                                </h4>

                                                <div>
                                                    <div className="text-base font-black text-primary">
                                                        {formatRupiah(
                                                            item.price,
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-zinc-500 line-through">
                                                        {formatRupiah(
                                                            item.originalPrice,
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                                                        <span>
                                                            Terjual{" "}
                                                            {item.soldCount}
                                                        </span>
                                                        <span>
                                                            Stok{" "}
                                                            {item.stockCount}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-primary h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${percentageSold}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
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
                            href="/products"
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
                            {products.map((product) => (
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground h-8 w-8"
                                        >
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex flex-wrap gap-1 mb-1.5">
                                                {product.category?.map(
                                                    (category, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                                                        >
                                                            #{category.name}
                                                        </span>
                                                    ),
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="pt-2 border-t border-border flex items-center justify-between">
                                            <div>
                                                <div className="text-base font-extrabold text-foreground">
                                                    {formatRupiah(
                                                        product.price,
                                                    )}
                                                </div>
                                                {product.originalPrice && (
                                                    <div className="text-xs text-muted-foreground line-through">
                                                        {formatRupiah(
                                                            product.originalPrice,
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                size="icon"
                                                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* ==================== FOOTER ==================== */}
                <footer className="bg-background border-t border-border pt-12 pb-8 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-border">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-lg">
                                        TK
                                    </div>
                                    <span className="text-lg font-bold tracking-tight">
                                        TokoKami
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Platform e-commerce terpercaya dengan sistem
                                    guest checkout instan. Pesanan & link
                                    tracking otomatis dikirim langsung ke email
                                    Anda.
                                </p>
                            </div>

                            <div>
                                <h5 className="font-bold text-sm mb-3">
                                    Belanja
                                </h5>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>
                                        <Link
                                            href="/products"
                                            className="hover:text-primary"
                                        >
                                            Semua Produk
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/promo"
                                            className="hover:text-primary"
                                        >
                                            Promo Hari Ini
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-sm mb-3">
                                    Bantuan
                                </h5>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>
                                        <Link
                                            href="/faq"
                                            className="hover:text-primary"
                                        >
                                            Pusat Bantuan & Cek Resi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/terms"
                                            className="hover:text-primary"
                                        >
                                            Syarat & Ketentuan
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="font-bold text-sm mb-3">
                                    Hubungi Kami
                                </h5>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Email: support@tokokami.com
                                    <br />
                                    WhatsApp: +62 812-3456-7890
                                    <br />
                                    Surabaya, Indonesia
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 text-center text-xs text-muted-foreground">
                            © {new Date().getFullYear()} TokoKami. All rights
                            reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
