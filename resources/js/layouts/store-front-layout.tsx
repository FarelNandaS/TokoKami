import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Search, ShoppingBag, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/hooks/use-whislist";
import { wishlish } from "@/routes";

interface StorefrontLayoutProps {
    children: React.ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    cartCount?: number;
}

export default function StorefrontLayout({
    children,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Cari produk favoritmu di TokoKami...",
    cartCount: externalCartCount = 2,
}: StorefrontLayoutProps) {
    const [internalSearch, setInternalSearch] = useState("");

    const {wishlistCount} = useWishlist();

    const currentSearch = searchValue !== undefined ? searchValue : internalSearch;

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (onSearchChange) {
            onSearchChange(val);
        } else {
            setInternalSearch(val);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onSearchChange) {
            router.get("/product/catalog", currentSearch ? { search: currentSearch } : {});
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* ==================== HEADER / NAVBAR ==================== */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-sm">
                                TK
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Toko<span className="text-primary">Kami</span>
                            </span>
                        </Link>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="hidden md:flex flex-1 max-w-md relative"
                        >
                            <Input
                                type="text"
                                value={currentSearch}
                                onChange={handleSearchInput}
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 h-10 rounded-full border-input focus-visible:ring-primary"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </form>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <Link href={wishlish()}>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative hover:bg-accent rounded-full cursor-pointer"
                                >
                                    <Heart className="h-5 w-5" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                                            {wishlistCount}
                                        </span>
                                    )}
                                    <span className="sr-only">Wishlist</span>
                                </Button>
                            </Link>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-accent rounded-full cursor-pointer"
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {externalCartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                                        {externalCartCount}
                                    </span>
                                )}
                                <span className="sr-only">Keranjang</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ==================== PAGE CONTENT ==================== */}
            {children}

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
                                Platform e-commerce terpercaya dengan sistem guest
                                checkout instan. Pesanan &amp; link tracking otomatis
                                dikirim langsung ke email Anda.
                            </p>
                        </div>

                        <div>
                            <h5 className="font-bold text-sm mb-3">Belanja</h5>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li>
                                    <Link
                                        href="/product/catalog"
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
                            <h5 className="font-bold text-sm mb-3">Bantuan</h5>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li>
                                    <Link href="/faq" className="hover:text-primary">
                                        Pusat Bantuan &amp; Cek Resi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="hover:text-primary">
                                        Syarat &amp; Ketentuan
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-sm mb-3">Hubungi Kami</h5>
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
                        © {new Date().getFullYear()} TokoKami. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}