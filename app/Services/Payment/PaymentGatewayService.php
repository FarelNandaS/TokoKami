<?php
// app/Services/Payment/PaymentGatewayService.php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Payment\Drivers\MidtransPaymentDriver;
use App\Services\Payment\Drivers\MockPaymentDriver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class PaymentGatewayService
{
    public function driver(?string $driverName = null): PaymentGatewayDriver
    {
        $name = $driverName ?? (string) config('payment.default', 'mock');

        return match ($name) {
            'mock' => new MockPaymentDriver(),
            'midtrans' => new MidtransPaymentDriver(),
            default => throw new InvalidArgumentException("Driver pembayaran [{$name}] tidak didukung."),
        };
    }

    public function isMockMode(): bool
    {
        return (string) config('payment.default', 'mock') === 'mock'
            && (bool) config('payment.mock.enabled', true);
    }

    public function initiatePayment(Order $order): PaymentSessionResult
    {
        $driverName = (string) config('payment.default', 'mock');
        $result = $this->driver($driverName)->createPayment($order);

        $order->update([
            'payment_gateway' => $result->driver,
            'payment_reference' => $result->reference,
            'payment_token' => $result->tokenOrUrl,
        ]);

        return $result;
    }

    public function handleWebhook(Request $request, ?string $driverName = null): Order
    {
        $driver = $this->driver($driverName);
        $parsed = $driver->parseWebhook($request);

        return DB::transaction(function () use ($parsed) {
            /** @var Order $order */
            $order = Order::with('items')
                ->where('order_code', $parsed->orderCode)
                ->lockForUpdate()
                ->firstOrFail();

            // Idempotensi: abaikan jika status pembayaran sudah final
            if (in_array($order->payment_status, ['paid', 'expired', 'refunded'], true)) {
                return $order;
            }

            if ($parsed->outcome === 'paid') {
                $order->update([
                    'payment_status' => 'paid',
                    'order_status' => $order->order_status === 'pending' ? 'confirmed' : $order->order_status,
                    'payment_reference' => $parsed->transactionId ?? $order->payment_reference,
                    'paid_at' => now(),
                ]);
            } elseif ($parsed->outcome === 'failed' && $order->order_status !== 'cancelled') {
                foreach ($order->items as $item) {
                    $qty = (int) $item->quantity;
                    if ($qty <= 0) {
                        continue;
                    }

                    if ($item->product_variant_id) {
                        ProductVariant::where('id', $item->product_variant_id)
                            ->lockForUpdate()
                            ->first()
                            ?->increment('stock', $qty);
                    } elseif ($item->product_id) {
                        Product::where('id', $item->product_id)
                            ->lockForUpdate()
                            ->first()
                            ?->increment('stock', $qty);
                    }
                }

                $order->update([
                    'payment_status' => 'expired',
                    'order_status' => 'cancelled',
                ]);
            }

            return $order->fresh('items');
        });
    }
}