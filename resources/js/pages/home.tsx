import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ==================== INTERFACES (Untuk Props CMS) ====================
interface HeroBanner {
  id: number;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
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

interface Product {
  id: number;
  name: string;
  category: string;
  tags?: string[];
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviews: number;
  badge?: string | null;
  image: string;
}

interface HomeProps {
  banners?: HeroBanner[];
  flashSale?: FlashSaleConfig;
  featuredProducts?: Product[];
}

// ==================== MOCK DATA (Fallback) ====================
const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: 1,
    badge: 'Koleksi Terbaru 2026',
    title: 'Gaya Hidup Modern, Harga Terbaik di TokoKami.',
    description: 'Temukan berbagai produk berkualitas mulai dari fashion, gadget, hingga kebutuhan rumah tangga dengan garansi resmi.',
    buttonText: 'Belanja Sekarang',
    buttonLink: '/products',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    badge: 'Flash Sale Promo',
    title: 'Diskon Hingga 50% Untuk Gadget Impianmu!',
    description: 'Upgrade smartphone dan aksesoris audio favoritmu hari ini sebelum kehabisan stok promo.',
    buttonText: 'Cek Promo Gadget',
    buttonLink: '/products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
  },
];

const DEFAULT_FLASH_SALE: FlashSaleConfig = {
  title: 'FLASH SALE HARI INI',
  subtitle: 'Harga miring khusus waktu terbatas!',
  endTime: new Date(Date.now() + 4 * 3600 * 1000 + 25 * 60 * 1000).toISOString(),
  items: [
    {
      id: 101,
      name: 'Wireless Noise Canceling Headphones V2',
      price: 899000,
      originalPrice: 1299000,
      discountPercentage: 30,
      soldCount: 42,
      stockCount: 50,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 102,
      name: 'Smartwatch Sport Fitness Tracker - Black',
      price: 349000,
      originalPrice: 499000,
      discountPercentage: 30,
      soldCount: 18,
      stockCount: 20,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 103,
      name: 'Mechanical Gaming Keyboard RGB',
      price: 529000,
      originalPrice: 799000,
      discountPercentage: 33,
      soldCount: 88,
      stockCount: 100,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 104,
      name: 'Portable Bluetooth Speaker Bass Pro',
      price: 279000,
      originalPrice: 450000,
      discountPercentage: 38,
      soldCount: 15,
      stockCount: 30,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    },
  ],
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Sneakers Casual TokoKami Edition - Emerald Green',
    category: 'Sepatu',
    tags: ['Sneakers', 'Trending', 'Fashion'],
    price: 459000,
    originalPrice: 699000,
    rating: 4.9,
    reviews: 128,
    badge: 'Diskon 34%',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Oversized Cotton Heavyweight T-Shirt',
    category: 'Pakaian',
    tags: ['Streetwear', 'Casual'],
    price: 129000,
    originalPrice: null,
    rating: 5.0,
    reviews: 64,
    badge: 'Baru',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Minimalist Leather Backpack 15 Inch',
    category: 'Tas',
    tags: ['Accessories', 'Travel'],
    price: 389000,
    originalPrice: 550000,
    rating: 4.8,
    reviews: 42,
    badge: null,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Stainless Steel Vacuum Insulated Tumbler 500ml',
    category: 'Rumah Tangga',
    tags: ['Lifestyle', 'Eco'],
    price: 149000,
    originalPrice: 199000,
    rating: 4.9,
    reviews: 180,
    badge: 'Terlaris',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
  },
];

export default function StorefrontHome({
  banners = DEFAULT_BANNERS,
  flashSale = DEFAULT_FLASH_SALE,
  featuredProducts = DEFAULT_PRODUCTS,
}: HomeProps) {
  const [cartCount, setCartCount] = useState(2);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    if (!flashSale?.endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(flashSale.endTime).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Head title="TokoKami - Belanja Online Mudah & Terpercaya" />

      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        
        {/* ==================== 1. ANNOUNCEMENT BAR ==================== */}
      {/* <div className="bg-primary text-primary-foreground text-xs py-2 px-4 text-center font-medium">
        🎉 Promo Spesial Peluncuran TokoKami! Gunakan kode <span className="font-bold underline">TOKOKAMI2026</span> untuk Gratis Ongkir.
      </div> */}

        {/* ==================== 2. HEADER / NAVBAR (Tanpa Login/Register) ==================== */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              
              <Link href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-sm">
                  TK
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Toko<span className="text-primary">Kami</span>
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

              {/* Hanya Wishlist dan Shopping Bag / Cart */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-full">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Button>

                <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-full">
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

        {/* ==================== 3. HERO BANNER SLIDER ==================== */}
        <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white shadow-xl">
            
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {banners.map((banner) => (
                  <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                    <div className="relative z-10 p-8 md:p-14 lg:p-16 max-w-2xl space-y-4">
                      <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                        {banner.badge}
                      </Badge>
                      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        {banner.title}
                      </h1>
                      <p className="text-zinc-300 text-sm sm:text-base font-normal line-clamp-2">
                        {banner.description}
                      </p>
                      <div className="pt-2">
                        <Link href={banner.buttonLink}>
                          <Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-lg shadow-primary/25">
                            {banner.buttonText} <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="absolute inset-0 z-0">
                      <img 
                        src={banner.image} 
                        alt={banner.title} 
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
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
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    selectedIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>

          </div>
        </section>

        {/* ==================== 4. FLASH SALE SECTION ==================== */}
        {flashSale && flashSale.items.length > 0 && (
          <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-primary/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary text-primary-foreground rounded-2xl animate-pulse">
                    <Zap className="h-6 w-6 fill-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">{flashSale.title}</h2>
                    <p className="text-xs text-zinc-400">{flashSale.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold bg-zinc-900/90 border border-zinc-800 px-3.5 py-2 rounded-2xl">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-zinc-400">Berakhir dalam:</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md font-extrabold">{timeLeft.hours}</span> :
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md font-extrabold">{timeLeft.minutes}</span> :
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md font-extrabold">{timeLeft.seconds}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {flashSale.items.map((item) => {
                  const percentageSold = Math.round((item.soldCount / item.stockCount) * 100);

                  return (
                    <Card key={item.id} className="bg-zinc-900/90 border-zinc-800 overflow-hidden group hover:border-primary/50 transition-all">
                      <div className="relative aspect-square overflow-hidden bg-zinc-800">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
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
                            {formatRupiah(item.price)}
                          </div>
                          <div className="text-[11px] text-zinc-500 line-through">
                            {formatRupiah(item.originalPrice)}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                            <span>Terjual {item.soldCount}</span>
                            <span>Stok {item.stockCount}</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percentageSold}%` }} />
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

        {/* ==================== 5. FEATURED PRODUCTS ==================== */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Katalog Produk</h2>
              <p className="text-sm text-muted-foreground">Temukan berbagai produk pilihan dengan tag dan kategori relevan.</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-primary hover:underline hidden sm:flex items-center gap-1">
              Lihat Semua <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold text-[10px] px-2.5 py-1 rounded-full">
                      {product.badge}
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-foreground h-8 w-8">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                        {product.category}
                      </span>
                      {product.tags?.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-base font-extrabold text-foreground">{formatRupiah(product.price)}</div>
                      {product.originalPrice && (
                        <div className="text-xs text-muted-foreground line-through">{formatRupiah(product.originalPrice)}</div>
                      )}
                    </div>
                    <Button size="icon" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ==================== 6. FOOTER ==================== */}
        <footer className="bg-background border-t border-border pt-12 pb-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-border">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center font-black text-primary-foreground text-lg">
                    TK
                  </div>
                  <span className="text-lg font-bold tracking-tight">TokoKami</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Platform e-commerce terpercaya dengan sistem guest checkout instan. Pesanan & link tracking otomatis dikirim langsung ke email Anda.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-sm mb-3">Belanja</h5>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="/products" className="hover:text-primary">Semua Produk</Link></li>
                  <li><Link href="/promo" className="hover:text-primary">Promo Hari Ini</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-sm mb-3">Bantuan</h5>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="/faq" className="hover:text-primary">Pusat Bantuan & Cek Resi</Link></li>
                  <li><Link href="/terms" className="hover:text-primary">Syarat & Ketentuan</Link></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-sm mb-3">Hubungi Kami</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Email: support@tokokami.com<br />
                  WhatsApp: +62 812-3456-7890<br />
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
    </>
  );
}