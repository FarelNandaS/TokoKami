<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSale;
use App\Models\ProductVariant;
use App\Services\Payment\PaymentGatewayService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class OrderController extends Controller
{
    private function getActiveSalesByProduct($productIds, Carbon $now)
    {
        return ProductSale::whereIn('product_id', $productIds)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_sale')->orWhere('start_sale', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_sale')->orWhere('end_sale', '>=', $now);
            })
            ->get()
            ->groupBy('product_id');
    }

    private function resolveSaleInfo(int $normalPrice, ?ProductSale $sale): array
    {
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
    }

    public function order(Request $request, PaymentGatewayService $paymentGateway)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_email' => ['required', 'email', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'shipping_city' => ['required', 'string', 'max:100'],
            'shipping_postal_code' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', 'in:bank_transfer,qris,cod'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'integer', 'exists:products,id'],
            'items.*.variantId' => ['nullable', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($validated) {
            $now = Carbon::now();
            $requestedItems = collect($validated['items']);
            $productIds = $requestedItems->pluck('productId')->unique()->values();

            $activeSales = $this->getActiveSalesByProduct($productIds, $now);

            $products = Product::with(['variants.attributeValues.attribute'])
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $preparedItems = [];

            foreach ($requestedItems as $req) {
                $product = $products->get($req['productId']);
                if (!$product) {
                    throw ValidationException::withMessages([
                        'items' => ['Salah satu produk tidak ditemukan.'],
                    ]);
                }

                $salesForProduct = $activeSales->get($product->id, collect());
                $productLevelSale = $salesForProduct->firstWhere('product_variant_id', null);
                $variantSalesMap = $salesForProduct->whereNotNull('product_variant_id')->keyBy('product_variant_id');

                $variant = null;
                $variantId = null;
                $variantLabel = null;

                if ($product->variants->isNotEmpty()) {
                    $variantQuery = ProductVariant::where('product_id', $product->id);
                    if (!empty($req['variantId'])) {
                        $variant = $variantQuery->where('id', $req['variantId'])->lockForUpdate()->first();
                    } else {
                        $variant = $variantQuery->lockForUpdate()->first();
                    }

                    if (!$variant) {
                        throw ValidationException::withMessages([
                            'items' => ["Varian untuk produk {$product->name} tidak valid."],
                        ]);
                    }

                    $variantId = (int) $variant->id;
                    $combination = $variant->attributeValues
                        ->pluck('value')
                        ->filter()
                        ->join(' / ');
                    $variantLabel = $combination !== '' ? $combination : ($variant->sku ?? "Varian #{$variant->id}");
                }

                $qty = (int) $req['quantity'];
                $availableStock = $variant
                    ? (int) ($variant->stock ?? 0)
                    : (int) ($product->stock ?? 0);

                if ($availableStock < $qty) {
                    $label = $variantLabel ? "{$product->name} ({$variantLabel})" : $product->name;
                    throw ValidationException::withMessages([
                        'items' => ["Stok {$label} tidak mencukupi (tersedia: {$availableStock})."],
                    ]);
                }

                $normalPrice = (int) ($variant?->price ?? $product->price);
                $matchedSale = $variantId !== null
                    ? ($variantSalesMap->get($variantId) ?? $productLevelSale)
                    : $productLevelSale;
                $saleInfo = $this->resolveSaleInfo($normalPrice, $matchedSale);

                $unitPrice = (int) $saleInfo['price'];
                $lineTotal = $unitPrice * $qty;
                $subtotal += $lineTotal;

                // Kurangi stok secara atomic
                if ($variant) {
                    $variant->decrement('stock', $qty);
                } else {
                    $product->decrement('stock', $qty);
                }

                $preparedItems[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variantId,
                    'product_name' => $product->name,
                    'variant_label' => $variantLabel,
                    'unit_price' => $unitPrice,
                    'original_unit_price' => $saleInfo['originalPrice'],
                    'quantity' => $qty,
                    'line_total' => $lineTotal,
                ];
            }

            $shippingCost = 0; // Bisa dihitung berdasarkan kota / berat di sini
            $totalAmount = $subtotal + $shippingCost;

            $orderCode = 'TK-' . $now->format('Ymd') . '-' . strtoupper(Str::random(4));
            $trackingToken = (string) Str::uuid();

            $createdOrder = Order::create([
                'order_code' => $orderCode,
                'tracking_token' => $trackingToken,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? 'unpaid' : 'unpaid',
                'order_status' => 'pending',
            ]);

            foreach ($preparedItems as $item) {
                $createdOrder->items()->create($item);
            }

            return $createdOrder;
        });

        if ($order->payment_method === 'cod') {
            return redirect()->route('order-track', ['token' => $order->tracking_token]);
        }

        $session = $paymentGateway->initiatePayment($order);

        if ($session->isMock || empty($session->redirectUrl)) {
            return redirect()->route('order-track', [
                'token' => $order->tracking_token,
                'mock' => $session->isMock ? 1 : null,
            ]);
        }

        return Inertia::location($session->redirectUrl);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => ['required', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
            'courier_name' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:150'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validated['order_status'] === 'shipped' && empty($validated['tracking_number']) && empty($order->tracking_number)) {
            return back()->withErrors([
                'tracking_number' => 'Nomor resi wajib diisi sebelum menandai pesanan sebagai dikirim.',
            ]);
        }

        DB::transaction(function () use ($order, $validated) {
            $previousStatus = $order->order_status;
            $newStatus = $validated['order_status'];

            // Jika berubah menjadi cancelled dari status aktif, kembalikan stok secara atomic
            if ($newStatus === 'cancelled' && $previousStatus !== 'cancelled') {
                $order->load('items');

                foreach ($order->items as $item) {
                    $qty = (int) $item->quantity;
                    if ($qty <= 0) {
                        continue;
                    }

                    if ($item->product_variant_id) {
                        $variant = ProductVariant::where('id', $item->product_variant_id)
                            ->lockForUpdate()
                            ->first();
                        if ($variant) {
                            $variant->increment('stock', $qty);
                        }
                    } elseif ($item->product_id) {
                        $product = Product::where('id', $item->product_id)
                            ->lockForUpdate()
                            ->first();
                        if ($product) {
                            $product->increment('stock', $qty);
                        }
                    }
                }
            }

            $nextPaymentStatus = $order->payment_status;
            if ($newStatus === 'delivered' && $order->payment_method === 'cod' && $order->payment_status === 'unpaid') {
                $nextPaymentStatus = 'paid';
            }

            $order->update([
                'order_status' => $newStatus,
                'payment_status' => $nextPaymentStatus,
                'courier_name' => $validated['courier_name'] ?? $order->courier_name,
                'tracking_number' => $validated['tracking_number'] ?? $order->tracking_number,
                'admin_notes' => $validated['admin_notes'] ?? $order->admin_notes,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status pesanan berhasil diperbarui.']);

        return back();
    }

    public function mockSimulate(Request $request, string $token, PaymentGatewayService $paymentGateway)
    {
        if (!$paymentGateway->isMockMode()) {
            abort(403, 'Mode simulasi pembayaran tidak aktif.');
        }

        $validated = $request->validate([
            'status' => ['required', 'in:paid,failed'],
        ]);

        $order = Order::where('tracking_token', $token)->firstOrFail();

        $request->merge([
            'order_code' => $order->order_code,
            'status' => $validated['status'],
        ]);

        $paymentGateway->handleWebhook($request, 'mock');

        return back()->with(
            'success',
            $validated['status'] === 'paid'
                ? 'Simulasi pembayaran berhasil. Pesanan terkonfirmasi.'
                : 'Simulasi pembayaran gagal/kedaluwarsa. Pesanan dibatalkan & stok dikembalikan.',
        );
    }

    public function webhook(Request $request, PaymentGatewayService $paymentGateway)
    {
        $driverName = $request->query('driver')
            ?? $request->input('driver')
            ?? (string) config('payment.default', 'mock');

        $paymentGateway->handleWebhook($request, $driverName);

        return response()->json(['message' => 'OK']);
    }
}