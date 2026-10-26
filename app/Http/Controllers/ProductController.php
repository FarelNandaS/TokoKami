<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function createProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'price' => 'required|integer',
            'product_attributes' => 'nullable|array|min:1',
            'variants' => 'nullable|array|min:1',
            'variants.*.sku' => 'string|unique:product_variants,sku',
            'variants.*.price' => 'integer',
            'images' => 'array|min:1',
            'images.*' => 'image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
            ]);

            $valueMap = [];

            if ($request->has('product_attributes')) {
                foreach ($request->product_attributes as $attrData) {
                    $attribute = Attribute::firstOrCreate(['name' => trim($attrData['name'])]);

                    $values = explode(',', $attrData['values']);

                    foreach ($values as $val) {
                        $cleanVal = trim($val);
                        if (empty($cleanVal)) continue;

                        $attrValue = AttributeValue::firstOrCreate([
                            'attribute_id' => $attribute->id,
                            'value' => $cleanVal,
                        ]);

                        $valueMap[$cleanVal] = $attrValue->id;
                    }
                }
            }

            if ($request->has('variants')) {
                foreach ($request->variants as $variantData) {
                    $variant = $product->variants()->create([
                        'sku' => $variantData['sku'],
                        'price' => $variantData['price'],
                        'stock' => 0,
                    ]);

                    $combinationPart = explode('/', $variantData['combination']);
                    $attributeValueIds = [];

                    foreach ($combinationPart as $part) {
                        $partClean = trim($part);

                        if (isset($valueMap[$partClean])) {
                            $attributeValueIds[] = $valueMap[$partClean];
                        }
                    }

                    if (!empty($attributeValueIds)) {
                        $variant->attributeValues()->attach($attributeValueIds);
                    }
                }
            }

            if ($request->hasFile('cover_image')) {
                $path = $request->file('cover_image')[0]->store('products', 'public');

                $product->images()->create([
                    'image_path' => $path,
                    'is_primary' => true,
                ]);
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');

                    $product->images()->create([
                        'image_path' => $path,
                        'is_primary' => false,
                    ]);
                }
            }

            DB::commit();

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil membuat product baru!']);

            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal membuat product baru!']);

            return back()->withErrors(['error' => $e->getMessage()]);
        }

    }

    public function deleteProduct(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
        ]);

        $product = Product::findOrFail($request->id);
        $name = $product->name;

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasi menghapus product dengan nama: ' . $name]);

        return back();
    }

    public function editProduct(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'name' => 'required|string',
            'description' => 'required|string',
            'price' => 'required|integer',
            'product_attributes' => 'nullable|array',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.sku' => 'required|string',
            'variants.*.price' => 'required|integer',
            'variants.*.stock' => 'required|integer|min:0',
            'existing_cover_id' => 'nullable|integer',
            'existing_images' => 'array|nullable',
            'existing_images.*' => 'integer',
            'cover_image' => 'array|nullable',
            'cover_image.*' => 'image|nullable|mimes:png,jpg,jpeg,webp|max:2048',
            'images' => 'array|nullable',
            'images.*' => 'image|nullable|mimes:png,jpg,jpeg,webp|max:2048',
        ]);
        // dd($request->file('cover_image')[0]);
        DB::beginTransaction();

        try {
            $product = Product::with('images')->findOrFail($request->id);

            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
            ]);

            if ($request->has('product_attributes') && $request->has('variants')) {
                $valueMap = [];

                foreach ($request->product_attributes as $attrData) {
                    if (empty($attrData['name']) || empty($attrData['values'])) continue;

                    $attribute = Attribute::firstOrCreate(['name' => trim($attrData['name'])]);
                    $values = explode(',', $attrData['values']);

                    foreach ($values as $val) {
                        $cleanVal = trim($val);
                        if (empty($cleanVal)) continue;

                        $attrValue = AttributeValue::firstOrCreate([
                            'attribute_id' => $attribute->id,
                            'value' => $cleanVal,
                        ]);

                        $valueMap[$cleanVal] = $attrValue->id;
                    }
                }

                $incomingVariantIds = collect($request->variants)->pluck('id')->filter()->toArray();

                $product->variants()->whereNotIn('id', $incomingVariantIds)->delete();

                foreach ($request->variants as $variantData) {
                    $variant = $product->variants()->updateOrCreate(
                        ['id' => $variantData['id'] ?? null],
                        [
                            'combination' => $variantData['combination'],
                            'sku' => $variantData['sku'],
                            'price' => $variantData['price'],
                            'stock' => $variantData['stock'],
                        ]
                    );

                    $combinationParts = explode('/', $variantData['combination']);
                    $attributeValueIds = [];

                    foreach ($combinationParts as $part) {
                        $partClean = trim($part);
                        if (isset($valueMap[$partClean])) {
                            $attributeValueIds[] = $valueMap[$partClean];
                        }
                    }

                    if (!empty($attributeValueIds)) {
                        $variant->attributeValues()->sync($attributeValueIds);
                    }
                }
            }

            $currentCover = $product->images()->where('is_primary', true)->first();

            if ($request->hasFile('cover_image')) {
                if ($currentCover) {
                    if (Storage::disk('public')->exists($currentCover->image_path)) {
                        Storage::disk('public')->delete($currentCover->image_path);
                    }
                    $currentCover->delete();
                }

                $coverPath = $request->file('cover_image')[0]->store('products', 'public');

                $product->images()->create([
                    'image_path' => $coverPath,
                    'is_primary' => true,
                ]);
            } else if (is_null($request->existing_cover_id) && $currentCover) {
                if (Storage::disk('public')->exists($currentCover->image_path)) {
                    Storage::disk('public')->delete($currentCover->image_path);
                }
                $currentCover->delete();
            }

            $existingImgIds = $request->input('existing_images', []);

            $imagesToDelete = $product->images()->where('is_primary', false)->whereNotIn('id', $existingImgIds)->get();

            foreach ($imagesToDelete as $oldImage) {
                if (Storage::disk('public')->exists($oldImage->image_path)) {
                    Storage::disk('public')->delete($oldImage->image_path);
                }

                $oldImage->delete();
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('products', 'public');

                    $product->images()->create([
                        'image_path' => $path,
                        'is_primary' => false,
                    ]);
                }
            }

            DB::commit();

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil merubah data product!']);

            return back();
        } catch (\Exception $e) {
            DB::rollBack();

            Inertia::flash('toast', ['type' => 'error', 'message' => 'Gagal merubah data product!']);

            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
