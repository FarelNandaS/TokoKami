<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
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

    // Ambil produk beserta gambar utamanya (cover_image)
    $products = Product::with(['images' => function($query) {
        $query->where('is_primary', true);
    }])->latest()->paginate(8);

    // Format struktur produk agar sesuai dengan yang dibaca oleh frontend home.tsx
    $formattedProducts = collect($products->items())->map(function ($product) {
        $coverImage = $product->images->first();
        $category = $product->categories;
        
        return [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'image' => $coverImage ? '/storage/' . $coverImage->image_path : '/images/placeholder.jpg',
            'originalPrice' => null,
            'category' => $category,
        ];
    });

    return Inertia::render('home', [
        'banners' => $banners,
        'products' => $formattedProducts,
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
