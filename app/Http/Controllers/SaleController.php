<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function createSale(Request $request)
    {
        $product = Product::with('variants')->findOrFail($request->product_id);
        $hasVariants = $product->variants->count() > 0;
        $variantScope = $request->input('variant_scope', 'single');

        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_scope' => $hasVariants
                ? ['required', Rule::in(['single', 'all'])]
                : ['nullable', Rule::in(['single', 'all'])],
            'product_variant_id' => [
                Rule::requiredIf(fn() => $hasVariants && $variantScope === 'single'),
                'nullable',
                Rule::exists('product_variants', 'id')->where(
                    fn($query) => $query->where('product_id', $product->id)
                ),
            ],
            'discount_mode' => ['required', Rule::in(['nominal', 'percentage'])],
            'sale_price' => [
                Rule::requiredIf(fn() => $request->discount_mode === 'nominal'),
                'nullable',
                'numeric',
                'min:0',
            ],
            'discount_percentage' => [
                Rule::requiredIf(fn() => $request->discount_mode === 'percentage'),
                'nullable',
                'numeric',
                'min:1',
                'max:100',
            ],
            'start_sale' => ['required', 'date'],
            'end_sale' => ['required', 'date', 'after:start_sale'],
        ]);

        $calculateSalePrice = function (int $normalPrice) use ($validated): int {
            if ($validated['discount_mode'] === 'percentage') {
                $percent = (float) $validated['discount_percentage'];
                $discounted = (int) round($normalPrice - ($normalPrice * ($percent / 100)));
                return max(0, $discounted);
            }

            return max(0, (int) $validated['sale_price']);
        };

        $savedPercentage = $validated['discount_mode'] === 'percentage'
            ? (float) $validated['discount_percentage']
            : null;

        DB::transaction(function () use ($product, $hasVariants, $variantScope, $validated, $calculateSalePrice, $savedPercentage, ) {
            if ($hasVariants && $variantScope === 'all') {
                foreach ($product->variants as $variant) {
                    $normalPrice = (int) ($variant->price ?? $product->price);

                    ProductSale::updateOrCreate(
                        [
                            'product_id' => $product->id,
                            'product_variant_id' => $variant->id,
                        ],
                        [
                            'sale_price' => $calculateSalePrice($normalPrice),
                            'discount_percentage' => $savedPercentage,
                            'start_sale' => $validated['start_sale'],
                            'end_sale' => $validated['end_sale'],
                        ]
                    );
                }

                return;
            }

            $variantId = ($hasVariants && !empty($validated['product_variant_id']))
                ? (int) $validated['product_variant_id']
                : null;

            $selectedVariant = $variantId
                ? $product->variants->firstWhere('id', $variantId)
                : null;

            $normalPrice = (int) ($selectedVariant->price ?? $product->price);

            ProductSale::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'product_variant_id' => $variantId,
                ],
                [
                    'sale_price' => $calculateSalePrice($normalPrice),
                    'discount_percentage' => $savedPercentage,
                    'start_sale' => $validated['start_sale'],
                    'end_sale' => $validated['end_sale'],
                ],
            );
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil membuat promo baru']);

        return back();
    }

    public function deleteSale(Request $request)
    {
        $request->validate([
            'id' => 'required|numeric',
        ]);

        $saleProduct = ProductSale::findOrFail($request->id);

        $saleProduct->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Berhasil menghapus promo']);

        return back();
    }
}
