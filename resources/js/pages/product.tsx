import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  ChevronRight, 
  Star, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Share2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProductImage {
  id: number;
  url: string;
}

interface ProductVariantAttribute {
  name: string;
  options: string[];
}

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    discountPercentage?: number;
    rating: number;
    reviewsCount: number;
    stock: number;
    category: string;
    tags: string[];
    images: ProductImage[];
    attributes: ProductVariantAttribute[];
  };
}

export default function Product({ product }: ProductProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]?.url || '/images/placeholder.jpg');
  const [quantity, setQuantity] = useState(1);
  
  // State untuk menyimpan opsi varian yang dipilih (inisialisasi dinamis dari data produk)
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
    const initial: { [key: string]: string } = {};
    product.attributes.forEach(attr => {
      if (attr.options.length > 0) {
        initial[attr.name] = attr.options[0];
      }
    });
    return initial;
  });

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      if (quantity < product.stock) setQuantity(prev => prev + 1);
    } else {
      if (quantity > 1) setQuantity(prev => prev - 1);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // DUMMY DATA UNTUK ULASAN (Belum dibuat di database)
  const dummyReviews = [
    { id: 1, user: "Budi Santoso", rating: 5, comment: "Barang sangat bagus, pengiriman cepat dan packaging rapi!", date: "12 November 2026" },
    { id: 2, user: "Siti Aminah", rating: 4, kualitas: "Sangat baik", comment: "Kualitas sesuai dengan harganya. Recommended seller!", date: "10 November 2026" }
  ];

  return (
    <>
      <Head title={`${product.name} - TokoKami`} />

      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        
        {/* ==================== HEADER ==================== */}
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

              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                    2
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* ==================== MAIN PRODUCT SECTION ==================== */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Galeri Gambar */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-300"
                />
                {product.discountPercentage ? (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-black text-xs px-3 py-1 rounded-full shadow">
                    -{product.discountPercentage}% OFF
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img.url ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Informasi & Aksi Pembelian */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                    {product.category}
                  </span>
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewsCount} Ulasan)
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {product.stock > 0 ? `Stok Tersedia (${product.stock})` : 'Stok Habis'}
                  </span>
                </div>
              </div>

              <div className="py-4 space-y-1">
                <div className="text-3xl font-extrabold text-primary">
                  {formatRupiah(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatRupiah(product.originalPrice)}
                  </div>
                )}
              </div>

              {/* Varian Atribut Dinamis */}
              {product.attributes.length > 0 && (
                <div className="space-y-4 pt-2">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">
                        Pilih {attr.name}: <span className="text-foreground font-semibold">{selectedOptions[attr.name]}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {attr.options.map((opt, optIdx) => {
                          const isSelected = selectedOptions[attr.name] === opt;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: opt }))}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                isSelected 
                                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20' 
                                  : 'bg-background text-foreground border-border hover:border-primary/50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Kuantitas & Tombol Aksi */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Kuantitas:</span>
                  <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden shadow-sm">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleQuantityChange('decrement')}
                      className="h-10 w-10 rounded-none hover:bg-accent"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleQuantityChange('increment')}
                      className="h-10 w-10 rounded-none hover:bg-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button size="lg" className="flex-1 rounded-2xl font-bold py-6 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    <ShoppingBag className="h-5 w-5" /> Masukkan Keranjang
                  </Button>
                  <Button size="lg" className="flex-1 rounded-2xl font-bold py-6 gap-2 shadow-lg shadow-primary/25">
                    Beli Sekarang
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi Produk */}
          <div className="mt-16 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-black tracking-tight">Deskripsi Produk</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description || "Tidak ada deskripsi untuk produk ini."}
            </p>
          </div>

          {/* Bagian Ulasan (Dummy) */}
          <div className="mt-8 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black tracking-tight">Ulasan Pembeli (Dummy)</h3>
            <div className="space-y-4">
              {dummyReviews.map((rev) => (
                <div key={rev.id} className="border-b border-border pb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{rev.user}</span>
                    <span className="text-xs text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ==================== FOOTER ==================== */}
        <footer className="bg-background border-t border-border pt-12 pb-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} TokoKami. All rights reserved.
          </div>
        </footer>

      </div>
    </>
  );
}