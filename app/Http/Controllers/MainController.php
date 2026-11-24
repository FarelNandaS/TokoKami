<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class MainController extends Controller
{
    // Controller Guest
    public function home()
    {
        // Ambil banner yang aktif, urutkan berdasarkan order dan tanggal dibuat
        $banners = Banner::where('is_active', true)
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Ambil semua sale yang sedang aktif
        $now = Carbon::now();

        $activeSales = ProductSale::with('variant')
            ->where(function ($q) use ($now) {
                $q->where('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->where('end_sale', '>=', $now);
            })
            ->get()
            ->groupBy('product_id');

        // Ambil produk beserta gambar utamanya (cover_image)
        $products = Product::with([
            'images' => function ($query) {
                $query->where('is_primary', true);
            }
        ])->latest()->paginate(8);

        // Format struktur produk agar sesuai dengan yang dibaca oleh frontend home.tsx
        $formattedProducts = collect($products->items())->map(function ($product) use ($activeSales) {
            $coverImage = $product->images->first();
            $category = $product->categories;
            $salesForProduct = $activeSales->get($product->id, collect());

            $displayPrice = (int) $product->price;
            $originalPrice = null;
            $discountPercentage = null;
            $isOnSale = false;

            if ($salesForProduct->isNotEmpty()) {
                $bestSale = $salesForProduct
                    ->map(function ($sale) use ($product) {
                        $normalPrice = (int) ($sale->variant?->price ?? $product->price);
                        $salePrice = (int) $sale->sale_price;

                        $percent = $sale->discount_percentage === null
                            ? (int) round((float) $sale->discount_percentage)
                            : ($normalPrice > 0 && $salePrice < $normalPrice
                                ? (int) round((($normalPrice - $salePrice) / $normalPrice) * 100)
                                : 0);

                        return [
                            'sale' => $sale,
                            'normal_price' => $normalPrice,
                            'sale_price' => $salePrice,
                            'percent' => $percent,
                        ];
                    })
                    ->filter(fn($item) => $item['sale_price'] < $item['normal_price'])
                    ->sortBy('sale_price')
                    ->first();

                if ($bestSale) {
                    $isOnSale = true;
                    $displayPrice = $bestSale['sale_price'];
                    $originalPrice = $bestSale['normal_price'];
                    $discountPercentage = $bestSale['percent'] > 0 ? $bestSale['percent'] : null;
                }
            }

            $totalStock = $product->variants->count() > 0
                ? $product->variants->sum('stock')
                : ($product->stock ?? 0);

            $hasVariants = $product->variants->count() > 0
                ? true
                : false;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $displayPrice,
                'image' => $coverImage ? '/storage/' . $coverImage->image_path : '/images/placeholder.jpg',
                'originalPrice' => $originalPrice,
                'discountPercentage' => $discountPercentage,
                'isOnSale' => $isOnSale,
                'stock' => $totalStock,
                'hasVariants' => $hasVariants,
                'category' => $category,
            ];
        });

        $promoProducts = $formattedProducts->where('isOnSale', true)->values();

        return Inertia::render('home', [
            'banners' => $banners,
            'products' => $formattedProducts,
            'promoProducts' => $promoProducts,
        ]);
    }

    public function productDetail($id)
    {
        // Ambil produk beserta gambar dan varian atributnya
        $product = Product::with(['images', 'categories', 'variants.attributeValues.attribute'])->findOrFail($id);

        // Ambil sale yang aktif
        $now = Carbon::now();

        $activeSale = ProductSale::where('product_id', $product->id)
            ->where(function ($q) use ($now) {
                $q->where('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->where('end_sale', '>=', $now);
            })
            ->get();

        // Sale untuk product utama (tanpa variant)
        $productLavelSale = $activeSale->firstWhere('product_variant_id', null);

        // Sale per variant (key: product_variant_id)
        $variantSaleMap = $activeSale
            ->whereNotNull('product_variant_id')
            ->keyBy('product_variant_id');

        $helperSaleInfo = function (int $normalPrice, ?ProductSale $sale): array {
            if ($sale && (int) $sale->sale_price < $normalPrice) {
                $salePrice = (int) $sale->sale_price;
                $percent = $sale->discount_percentage !== null
                    ? (int) round((float) $sale->discount_percentage)
                    : ($normalPrice > 0
                        ? (int) round((($normalPrice - $salePrice) / $normalPrice) * 100)
                        : 0);

                return [
                    'price' => $salePrice,
                    'originalPrice' => $normalPrice,
                    'discountPercentage' => max(0, $percent),
                    'isOnSale' => true,
                ];
            }

            return [
                'price' => $normalPrice,
                'originalPrice' => null,
                'discountPercentage' => 0,
                'isOnSale' => false,
            ];
        };

        // Mengambil semua gambar product
        $coverImage = $product->images->where('is_primary', true)->first();
        $otherImages = $product->images->where('is_primary', false)->values();

        // Format kumpulan gambar produk
        $allImages = [];
        if ($coverImage) {
            $allImages[] = ['id' => $coverImage->id, 'url' => '/storage/' . $coverImage->image_path];
        }
        foreach ($otherImages as $img) {
            $allImages[] = ['id' => $img->id, 'url' => '/storage/' . $img->image_path];
        }
        if (empty($allImages)) {
            $allImages[] = ['id' => 0, 'url' => '/images/placeholder.jpg'];
        }

        $category = $product->categories()->get();

        // Format varian atribut (Cth: Warna, Ukuran) dari database
        $variants = $product->variants;
        $attributesMap = [];
        $formattedVariants = [];

        foreach ($variants as $variant) {
            $attrSelection = [];
            foreach ($variant->attributeValues as $attrVal) {
                $attrName = $attrVal->attribute->name ?? 'Varian';
                $valText = $attrVal->value ?? '';

                if ($attrName !== '' && $valText !== '') {
                    $attrSelection[$attrName] = $valText;
                }

                if (!isset($attributesMap[$attrName])) {
                    $attributesMap[$attrName] = [];
                }

                if (!in_array($valText, $attributesMap[$attrName])) {
                    $attributesMap[$attrName][] = $valText;
                }
            }

            $normalVariantPrice = (int) ($variant->price ?? $product->price);
            $variantSale = $variantSaleMap->get($variant->id) ?? $productLavelSale;
            $saleInfo = $helperSaleInfo($normalVariantPrice, $variantSale);

            $formattedVariants[] = [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'stock' => (int) ($variant->stock ?? 0),
                'attributes' => $attrSelection,
                'price' => $saleInfo['price'],
                'originalPrice' => $saleInfo['originalPrice'],
                'discountPercentage' => $saleInfo['discountPercentage'],
                'isOnSale' => $saleInfo['isOnSale'],
            ];
        }

        $formattedAttributes = [];
        foreach ($attributesMap as $name => $options) {
            $formattedAttributes[] = [
                'name' => $name,
                'options' => $options,
            ];
        }

        $hasVariants = count($formattedVariants) > 0;
        $totalStock = $hasVariants
            ? collect($formattedVariants)->sum('stock')
            : (int) ($product->stock ?? 0);

        // Harga default sebelum ganti-ganti varian: pakai varian pertama jika ada, atau produk utama
        if ($hasVariants) {
            $defaultInfo = [
                'price' => $formattedVariants[0]['price'],
                'originalPrice' => $formattedVariants[0]['originalPrice'],
                'discountPercentage' => $formattedVariants[0]['discountPercentage']
            ];
        } else {
            $defaultInfo = $helperSaleInfo((int) $product->price, $productLavelSale);
        }

        $formattedProduct = [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $defaultInfo['price'],
            'originalPrice' => $defaultInfo['originalPrice'],
            'discountPercentage' => $defaultInfo['discountPercentage'],
            'rating' => 4.8,
            'reviewsCount' => 15,
            'stock' => $totalStock,
            'category' => $category,
            'tags' => ['Produk Pilihan', 'Terlaris'],
            'images' => $allImages,
            'attributes' => $formattedAttributes,
            'variants' => $formattedVariants,
        ];

        return Inertia::render('product', [
            'product' => $formattedProduct
        ]);
    }

    public function productCatalog(Request $request)
    {
        $now = Carbon::now();
        $search = trim((string) $request->query('search', ''));

        $activeSales = ProductSale::with('variant')
            ->where(function ($q) use ($now) {
                $q->where('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->where('end_sale', '>=', $now);
            })
            ->get()
            ->groupBy('product_id');

        $productsQuery = Product::with([
            'images' => function ($query) {
                $query->where('is_primary', true);
            },
            'categories',
            'variants',
        ])->latest();

        if ($search !== '') {
            $productsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%')
                    ->orWhereHas('categories', function ($catQuery) use ($search) {
                        $catQuery->where('name', 'like', '%' . $search . '%');
                    });
            });
        }

        $products = $productsQuery->get();

        $formattedProducts = $products->map(function ($product) use ($activeSales) {
            $coverImage = $product->images->first();
            $salesForProduct = $activeSales->get($product->id, collect());

            $displayPrice = (int) $product->price;
            $originalPrice = null;
            $discountPercentage = null;
            $isOnSale = false;

            if ($salesForProduct->isNotEmpty()) {
                $bestSale = $salesForProduct
                    ->map(function ($sale) use ($product) {
                        $normalPrice = (int) ($sale->variant?->price ?? $product->price);
                        $salePrice = (int) $sale->sale_price;

                        $percent = $sale->discount_percentage !== null
                            ? (int) round((float) $sale->discount_percentage)
                            : ($normalPrice > 0 && $salePrice < $normalPrice
                                ? (int) round((($normalPrice - $salePrice) / $normalPrice) * 100)
                                : 0);

                        return [
                            'normal_price' => $normalPrice,
                            'sale_price' => $salePrice,
                            'percent' => $percent,
                        ];
                    })
                    ->filter(fn($item) => $item['sale_price'] < $item['normal_price'])
                    ->sortBy('sale_price')
                    ->first();

                if ($bestSale) {
                    $isOnSale = true;
                    $displayPrice = $bestSale['sale_price'];
                    $originalPrice = $bestSale['normal_price'];
                    $discountPercentage = $bestSale['percent'] > 0 ? $bestSale['percent'] : null;
                }
            }

            $totalStock = $product->variants->count() > 0
                ? $product->variants->sum('stock')
                : ($product->stock ?? 0);

            $hasVariants = $product->variants->count() > 0
                ? true
                : false;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $displayPrice,
                'image' => $coverImage ? '/storage/' . $coverImage->image_path : '/images/placeholder.jpg',
                'originalPrice' => $originalPrice,
                'discountPercentage' => $discountPercentage,
                'isOnSale' => $isOnSale,
                'stock' => $totalStock,
                'hasVariants' => $hasVariants,
                'category' => $product->categories,
            ];
        });

        $categories = Category::orderBy('name')->get();

        return Inertia::render('productCatalog', [
            'products' => $formattedProducts,
            'categories' => $categories,
        ]);
    }

    public function promo()
    {
        $now = Carbon::now();

        $activeSales = ProductSale::with('variant')
            ->where(function ($q) use ($now) {
                $q->whereNull('start_sale')->orWhere('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_sale')->orWhere('end_sale', '>=', $now);
            })
            ->get()
            ->groupBy('product_id');

        $products = Product::with([
            'images' => function ($query) {
                $query->where('is_primary', true);
            },
            'categories',
            'variants',
        ])->latest()->get();

        $promoProducts = $products->map(function ($product) use ($activeSales) {
            $coverImage = $product->images->first();
            $salesForProduct = $activeSales->get($product->id, collect());

            $displayPrice = (int) $product->price;
            $originalPrice = null;
            $discountPercentage = null;
            $isOnSale = false;

            if ($salesForProduct->isNotEmpty()) {
                $bestSale = $salesForProduct
                    ->map(function ($sale) use ($product) {
                        $normalPrice = (int) ($sale->variant?->price ?? $product->price);
                        $salePrice = (int) $sale->sale_price;

                        $percent = $sale->discount_percentage !== null
                            ? (int) round((float) $sale->discount_percentage)
                            : ($normalPrice > 0 && $salePrice < $normalPrice
                                ? (int) round((($normalPrice - $salePrice) / $normalPrice) * 100)
                                : 0);

                        return [
                            'normal_price' => $normalPrice,
                            'sale_price' => $salePrice,
                            'percent' => $percent,
                        ];
                    })
                    ->filter(fn($item) => $item['sale_price'] < $item['normal_price'])
                    ->sortBy('sale_price')
                    ->first();

                if ($bestSale) {
                    $isOnSale = true;
                    $displayPrice = $bestSale['sale_price'];
                    $originalPrice = $bestSale['normal_price'];
                    $discountPercentage = $bestSale['percent'] > 0 ? $bestSale['percent'] : null;
                }
            }

            $totalStock = $product->variants->count() > 0
                ? $product->variants->sum('stock')
                : ($product->stock ?? 0);

            $hasVariants = $product->variants->count() > 0
                ? true
                : false;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $displayPrice,
                'image' => $coverImage ? '/storage/' . $coverImage->image_path : '/images/placeholder.jpg',
                'originalPrice' => $originalPrice,
                'discountPercentage' => $discountPercentage,
                'isOnSale' => $isOnSale,
                'stock' => $totalStock,
                'hasVariants' => $hasVariants,
                'category' => $product->categories,
            ];
        })->filter(fn($item) => $item['isOnSale'])->values();

        $categories = Category::orderBy('name')->get();

        return Inertia::render('productPromo', [
            'products' => $promoProducts,
            'categories' => $categories,
        ]);
    }

    public function wishlist(Request $request)
    {
        $idsParam = (string) $request->query('ids', '');
        $ids = collect(explode(',', $idsParam))
            ->map(fn($id) => (int) trim($id))
            ->filter(fn($id) => $id > 0)
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return Inertia::render('wishlist', [
                'products' => [],
            ]);
        }

        $now = Carbon::now();

        $activeSales = ProductSale::with('variant')
            ->whereIn('product_id', $ids)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_sale')->orWhere('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_sale')->orWhere('end_sale', '>=', $now);
            })
            ->get()
            ->groupBy('product_id');

        $products = Product::with([
            'images' => function ($query) {
                $query->where('is_primary', true);
            },
            'categories',
            'variants',
        ])
            ->whereIn('id', $ids)
            ->get();

        // Pertahankan urutan sesuai yang tersimpan di wishlist user
        $productsById = $products->keyBy('id');

        $formattedProducts = $ids
            ->map(fn($id) => $productsById->get($id))
            ->filter()
            ->map(function ($product) use ($activeSales) {
                $coverImage = $product->images->first();
                $salesForProduct = $activeSales->get($product->id, collect());

                $displayPrice = (int) $product->price;
                $originalPrice = null;
                $discountPercentage = null;
                $isOnSale = false;

                if ($salesForProduct->isNotEmpty()) {
                    $bestSale = $salesForProduct
                        ->map(function ($sale) use ($product) {
                            $normalPrice = (int) ($sale->variant?->price ?? $product->price);
                            $salePrice = (int) $sale->sale_price;

                            $percent = $sale->discount_percentage !== null
                                ? (int) round((float) $sale->discount_percentage)
                                : ($normalPrice > 0 && $salePrice < $normalPrice
                                    ? (int) round((($normalPrice - $salePrice) / $normalPrice) * 100)
                                    : 0);

                            return [
                                'normal_price' => $normalPrice,
                                'sale_price' => $salePrice,
                                'percent' => $percent,
                            ];
                        })
                        ->filter(fn($item) => $item['sale_price'] < $item['normal_price'])
                        ->sortBy('sale_price')
                        ->first();

                    if ($bestSale) {
                        $isOnSale = true;
                        $displayPrice = $bestSale['sale_price'];
                        $originalPrice = $bestSale['normal_price'];
                        $discountPercentage = $bestSale['percent'] > 0 ? $bestSale['percent'] : null;
                    }
                }

                $totalStock = $product->variants->count() > 0
                    ? $product->variants->sum('stock')
                    : ($product->stock ?? 0);

                $hasVariants = $product->variants->count() > 0
                ? true
                : false;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => $displayPrice,
                    'image' => $coverImage ? '/storage/' . $coverImage->image_path : '/images/placeholder.jpg',
                    'originalPrice' => $originalPrice,
                    'discountPercentage' => $discountPercentage,
                    'isOnSale' => $isOnSale,
                    'stock' => (int) $totalStock,
                    'hasVariants' => $hasVariants,
                    'category' => $product->categories,
                ];
            })
            ->values();

        return Inertia::render('wishlist', [
            'products' => $formattedProducts,
        ]);
    }

    public function cart(Request $request)
    {
        $rawItems = $request->query('items', '');
        $decoded = is_string($rawItems) && $rawItems !== ''
            ? json_decode($rawItems, true)
            : [];

        if (!is_array($decoded) || empty($decoded)) {
            return Inertia::render('cart', [
                'cartItems' => [],
            ]);
        }

        $requestedItems = collect($decoded)
            ->map(function ($row) {
                $productId = isset($row['productId']) ? (int) $row['productId'] : 0;
                $variantId = isset($row['variantId']) && $row['variantId'] !== null && $row['variantId'] !== ''
                    ? (int) $row['variantId']
                    : null;
                $quantity = isset($row['quantity']) ? max(1, (int) $row['quantity']) : 1;

                return [
                    'productId' => $productId,
                    'variantId' => $variantId,
                    'quantity' => $quantity,
                ];
            })
            ->filter(fn($row) => $row['productId'] > 0)
            ->values();

        if ($requestedItems->isEmpty()) {
            return Inertia::render('cart', [
                'cartItems' => [],
            ]);
        }

        $productIds = $requestedItems->pluck('productId')->unique()->values();
        $now = Carbon::now();

        $activeSales = ProductSale::whereIn('product_id', $productIds)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_sale')->orWhere('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_sale')->orWhere('end_sale', '>=', $now);
            })
            ->get()
            ->groupBy('product_id');

        $products = Product::with([
            'images' => function ($query) {
                $query->where('is_primary', true);
            },
            'categories',
            'variants.attributeValues.attribute',
        ])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $resolveSaleInfo = function (int $normalPrice, ?ProductSale $sale): array {
            if ($sale && (int) $sale->sale_price < $normalPrice) {
                $salePrice = (int) $sale->sale_price;
                $percent = $sale->discount_percentage !== null
                    ? (int) round((float) $sale->discount_percentage)
                    : ($normalPrice > 0
                        ? (int) round((($normalPrice - $salePrice) / $normalPrice) * 100)
                        : 0);

                return [
                    'price' => $salePrice,
                    'originalPrice' => $normalPrice,
                    'discountPercentage' => max(0, $percent),
                    'isOnSale' => true,
                ];
            }

            return [
                'price' => $normalPrice,
                'originalPrice' => null,
                'discountPercentage' => 0,
                'isOnSale' => false,
            ];
        };

        $formattedCartItems = $requestedItems
            ->map(function ($req) use ($products, $activeSales, $resolveSaleInfo) {
                $product = $products->get($req['productId']);
                if (!$product) {
                    return null;
                }

                $salesForProduct = $activeSales->get($product->id, collect());
                $productLevelSale = $salesForProduct->firstWhere('product_variant_id', null);
                $variantSalesMap = $salesForProduct->whereNotNull('product_variant_id')->keyBy('product_variant_id');

                $variant = null;
                $variantLabel = null;
                $variantId = null;

                if ($product->variants->isNotEmpty()) {
                    $variant = $req['variantId']
                        ? $product->variants->firstWhere('id', $req['variantId'])
                        : $product->variants->first();

                    if (!$variant) {
                        return null;
                    }

                    $variantId = (int) $variant->id;
                    $combination = $variant->attributeValues
                        ->pluck('value')
                        ->filter()
                        ->join(' / ');
                    $variantLabel = $combination !== '' ? $combination : ($variant->sku ?? "Varian #{$variant->id}");
                }

                $normalPrice = (int) ($variant?->price ?? $product->price);
                $matchedSale = $variantId !== null
                    ? ($variantSalesMap->get($variantId) ?? $productLevelSale)
                    : $productLevelSale;

                $saleInfo = $resolveSaleInfo($normalPrice, $matchedSale);
                $availableStock = $variant
                    ? (int) ($variant->stock ?? 0)
                    : (int) ($product->stock ?? 0);

                $safeQty = $availableStock > 0
                    ? min($req['quantity'], $availableStock)
                    : $req['quantity'];

                $coverImage = $product->images->first();

                return [
                    'productId' => (int) $product->id,
                    'variantId' => $variantId,
                    'variantLabel' => $variantLabel,
                    'name' => $product->name,
                    'image' => $coverImage ? '/storage/' . $coverImage->image_path : '/images/placeholder.jpg',
                    'price' => $saleInfo['price'],
                    'originalPrice' => $saleInfo['originalPrice'],
                    'discountPercentage' => $saleInfo['discountPercentage'],
                    'isOnSale' => $saleInfo['isOnSale'],
                    'quantity' => $safeQty,
                    'stock' => $availableStock,
                    'category' => $product->categories->first()->name ?? 'Umum',
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('cart', [
            'cartItems' => $formattedCartItems,
        ]);
    }

    // Controller Admin 
    public function dashboard()
    {
        return Inertia::render('admin/dashboard');
    }

    public function productManagement()
    {
        $products = Product::all();

        $data = $products->map(function ($product) {
            $coverImage = ProductImage::where('product_id', $product->id)->where('is_primary', true)->first();
            $images = ProductImage::where('product_id', $product->id)->where('is_primary', false)->get();

            $categories = $product->categories()->get()->pluck('id')->values();

            $variants = $product->variants()->with('attributeValues.attribute')->get();

            $groupedAttributes = [];
            foreach ($variants as $variant) {
                foreach ($variant->attributeValues as $attrVal) {
                    $attrName = $attrVal->attribute->name ?? null;
                    $valText = $attrVal->value ?? null;

                    if ($attrName && $valText) {
                        if (!isset($groupedAttributes[$attrName])) {
                            $groupedAttributes[$attrName] = [];
                        }

                        if (!in_array($valText, $groupedAttributes[$attrName])) {
                            $groupedAttributes[$attrName][] = $valText;
                        }
                    }
                }
            }

            $attributesForFrontend = [];
            $attrId = 1;
            foreach ($groupedAttributes as $name => $valuesArray) {
                $attributesForFrontend[] = [
                    'id' => $attrId++,
                    'name' => $name,
                    'values' => implode(', ', $valuesArray),
                ];
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'cover_image' => $coverImage,
                'images' => $images,
                'variants' => $variants,
                'attributes' => $attributesForFrontend,
                'category_ids' => $categories,
            ];
        });

        $categories = Category::all();

        return Inertia::render('admin/productManagement', [
            'data' => $data,
            'categories' => $categories
        ]);
    }

    public function stockManagement()
    {
        $data = Product::with(['variants.attributeValues'])->get()->map(function ($product) {
            $hasVariants = $product->variants->count() > 0;

            return [
                'id' => $product->id,
                'name' => $product->name,
                'has_variants' => $hasVariants,
                'stock' => $hasVariants ? $product->variants->sum('stock') : ($product->stock ?? 0),
                'variants' => $product->variants->map(function ($v) {
                    return [
                        'id' => $v->id,
                        'sku' => $v->sku,
                        'stock' => $v->stock,
                        'combination' => $v->attributeValues->pluck('value')->join(' / '),
                    ];
                })
            ];
        });

        return Inertia::render('admin/stockManagement', [
            'data' => $data,
        ]);
    }

    public function categoryManagement()
    {
        $categories = Category::all();

        return Inertia::render('admin/categoryManagement', [
            'data' => $categories
        ]);
    }

    public function bannerSlider()
    {
        $banners = Banner::all();

        return Inertia::render('admin/bannerSlider', [
            'data' => $banners
        ]);
    }

    public function saleManagement()
    {
        $saleProducts = ProductSale::with(['product', 'variant.attributeValues.attribute'])->latest()->get();

        $products = Product::with(['variants.attributeValues.attribute'])->orderBy('name')->get();

        return Inertia::render('admin/saleManagement', [
            'saleProducts' => $saleProducts,
            'products' => $products,
        ]);
    }

    public function adminManagement()
    {
        $admins = User::where('id', '!=', Auth::id())->get();

        $data = $admins->map(function ($admin) {
            return [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'permissions' => $admin->getAllPermissions()->pluck('name')->values()->all(),
            ];
        })->values()->all();

        return Inertia::render('admin/adminManagement', [
            'data' => $data
        ]);
    }
}
