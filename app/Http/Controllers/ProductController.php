<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function createProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|integer',
            'image' => 'image|nullable'
        ]);

        if (!empty($request->image)) {

        }

        Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil membuat product baru!']);

        return back();
    }

    public function deleteProduct(Request $request) {
        $request->validate([
            'id' => 'required|integer',
        ]);

        $product = Product::findOrFail($request->id);
        $name = $product->name;

        $product->delete();

        Inertia::flash('toast', ['type'=>'success', 'message'=>'Berhasi menghapus product dengan nama: ' . $name]);

        return back();
    }

    public function editProduct(Request $request) {
        $request->validate([
            'id'=>'required|integer',
            'name'=>'required|string',
            'description'=>'required|string',
            'price'=>'required|integer',
            'image'=>'image|nullable',
        ]);

        if (!empty($request->image)) {

        }

        Product::findOrFail($request->id)->update([
            'name'=>$request->name,
            'description'=>$request->description,
            'price'=>$request->price,
        ]);

        Inertia::flash('toast', ['type'=>'success', 'message'=>'Berhasil merubah data product!']);

        return back();
    }
}
