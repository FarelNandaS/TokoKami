<?php

namespace App\Http\Controllers;

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
        return Inertia::render('home');
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

            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'cover_image' => $coverImage,
                'images' => $images,
            ];
        });

        return Inertia::render('admin/productManagement', [
            'data' => $data,
        ]);
    }

    public function stockManagement()
    {
        $products = Product::all();

        $data = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'stock' => $product->stock,
            ];
        });

        return Inertia::render('admin/stockManagement', [
            'data' => $data,
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
