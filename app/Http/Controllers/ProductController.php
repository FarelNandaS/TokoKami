<?php

namespace App\Http\Controllers;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function createProduct(Request $request)
    {
        $request->validate(
            [
                'has_variants' => 'required|boolean',
                'name' => 'required|string|max:255',
                'description' => 'required|string|max:255',
                'price' => ['nullable', 'integer', Rule::requiredIf(fn() => !$request->boolean('has_variants'))],
                'category_ids' => 'nullable|array|min:1',
                'category_ids.*' => 'integer|exists:categories,id',
                'product_attributes' => 'nullable|array|min:1',
                'variants' => ['nullable', 'array', 'min:1', Rule::requiredIf(fn() => $request->boolean('has_variants'))],
                'variants.*.sku' => 'string|unique:product_variants,sku|required_with:variants|distinct',
                'variants.*.price' => 'integer|min:1|required_with:variants',
                'images' => 'array|min:1',
                'images.*' => 'image|mimes:png,jpg,jpeg,webp|max:2048',
            ],
            [
                'price.required' => 'Harga produk wajib diisi jika produk tidak memiliki varian.',
                'variants.required' => 'Minimal harus ada 1 varian jika produk memiliki varian.',
                'variants.*.sku.required_with' => 'Kode SKU pada setiap varian wajib diisi.',
                'variants.*.sku.distinct' => 'Kode SKU antar varian tidak boleh sama.',
                'variants.*.sku.unique' => 'Kode SKU ini sudah terdaftar di database.',
                'variants.*.price.required_with' => 'Harga pada setiap varian wajib diisi.',
                'variants.*.price.min' => 'Harga pada setiap varian harus lebih dari 0.',
            ]
        );

        DB::beginTransaction();

        try {
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
            ]);

            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            $valueMap = [];

            if ($request->has('product_attributes')) {
                foreach ($request->product_attributes as $attrData) {
                    $attribute = Attribute::firstOrCreate(['name' => trim($attrData['name'])]);

                    $values = explode(',', $attrData['values']);

                    foreach ($values as $val) {
                        $cleanVal = trim($val);
                        if (empty($cleanVal))
                            continue;

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

        $images = $product->images;

        foreach ($images as $image) {
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasi menghapus product dengan nama: ' . $name]);

        return back();
    }

    public function editProduct(Request $request)
    {
        $request->validate(
            [
                'has_variants' => 'required|boolean',
                'id' => 'required|integer',
                'name' => 'required|string',
                'description' => 'required|string',
                'price' => ['nullable', 'integer', Rule::requiredIf(fn() => !$request->boolean('has_variants'))],
                'category_ids' => 'nullable|array|min:1',
                'category_ids.*' => 'integer|exists:categories,id',
                'product_attributes' => 'nullable|array',
                'variants' => ['nullable', 'array', Rule::requiredIf(fn() => $request->boolean('has_variants'))],
                'variants.*.id' => 'nullable|integer|exists:product_variants,id',
                'variants.*.sku' => Rule::forEach(function ($value, $attribute, $data) {
                    $idKey = str_replace('.sku', '.id', $attribute);
                    $variantId = $data[$idKey] ?? null;

                    return [
                        'nullable',
                        'string',
                        'required_with:variants',
                        'distinct',
                        Rule::unique('product_variants', 'sku')->ignore($variantId),
                    ];
                    ;
                }),
                'variants.*.price' => 'integer|min:1|required_with:variants',
                'existing_cover_id' => 'nullable|integer',
                'existing_images' => 'array|nullable',
                'existing_images.*' => 'integer',
                'cover_image' => 'array|nullable',
                'cover_image.*' => 'image|nullable|mimes:png,jpg,jpeg,webp|max:2048',
                'images' => 'array|nullable',
                'images.*' => 'image|nullable|mimes:png,jpg,jpeg,webp|max:2048',
            ],
            [
                'price.required' => 'Harga produk wajib diisi jika produk tidak memiliki varian.',
                'variants.required' => 'Minimal harus ada 1 varian jika produk memiliki varian.',
                'variants.*.sku.required_with' => 'Kode SKU pada setiap varian wajib diisi.',
                'variants.*.sku.distinct' => 'Kode SKU antar varian tidak boleh sama.',
                'variants.*.sku.unique' => 'Kode SKU ini sudah terdaftar di database.',
                'variants.*.price.required_with' => 'Harga pada setiap varian wajib diisi.',
                'variants.*.price.min' => 'Harga pada setiap varian harus lebih dari 0.',
            ]
        );
        DB::beginTransaction();

        try {
            $product = Product::with('images')->findOrFail($request->id);
            $hasVariants = $request->boolean('has_variants');

            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
            ]);

            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            if ($hasVariants) {
                $product->update([
                    'price' => 0,
                ]);

                $valueMap = [];

                foreach ($request->product_attributes as $attrData) {
                    if (empty($attrData['name']) || empty($attrData['values']))
                        continue;

                    $attribute = Attribute::firstOrCreate(['name' => trim($attrData['name'])]);
                    $values = explode(',', $attrData['values']);

                    foreach ($values as $val) {
                        $cleanVal = trim($val);
                        if (empty($cleanVal))
                            continue;

                        $attrValue = AttributeValue::firstOrCreate([
                            'attribute_id' => $attribute->id,
                            'value' => $cleanVal,
                        ]);

                        $valueMap[$cleanVal] = $attrValue->id;
                    }
                }

                $variantList = $request->input('variants', []);
                $incomingVariantIds = collect($variantList)->pluck('id')->filter()->toArray();

                $removedVariants = $product->variants()->whereNotIn('id', $incomingVariantIds)->get();
                foreach ($removedVariants as $removedVariant) {
                    $removedVariant->attributeValues()->detach();
                    $removedVariant->delete();
                }

                foreach ($variantList as $variantData) {
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
            } else {
                $existingVariants = $product->variants()->get();
                foreach ($existingVariants as $existingVariant) {
                    $existingVariant->attributeValues()->detach();
                }
                $product->variants()->delete();
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

    public function adjustStock(Request $request, Product $product)
    {
        if ($product->variants()->count() > 0) {
            $request->validate([
                'variants' => 'required|array',
                'variants.*.id' => 'required|exists:product_variants,id',
                'variants.*.stock' => 'required|integer|min:0',
            ]);

            foreach ($request->variants as $variantData) {
                ProductVariant::where('id', $variantData['id'])->update([
                    'stock' => $variantData['stock'],
                ]);
            }
        } else {
            $request->validate([
                'stock' => 'required|integer|min:0',
            ]);

            $product->update([
                'stock' => $request->stock,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil merubah stock product']);

        return back();
    }
}
