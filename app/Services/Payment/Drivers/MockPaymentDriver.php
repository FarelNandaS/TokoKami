<?php

namespace App\Services\Payment\Drivers;

use App\Models\Order;
use App\Services\Payment\PaymentGatewayDriver;
use App\Services\Payment\PaymentSessionResult;
use App\Services\Payment\WebhookOutcome;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MockPaymentDriver implements PaymentGatewayDriver
{
    public function createPayment(Order $order): PaymentSessionResult
    {
        $mockRef = 'MOCK-' . strtoupper(Str::random(10));
        $trackUrl = route('order-track', [
            'token' => $order->tracking_token,
            'mock' => 1,
        ]);

        return new PaymentSessionResult(
            driver: 'mock',
            reference: $mockRef,
            tokenOrUrl: $trackUrl,
            redirectUrl: $trackUrl,
            isMock: true,
        );
    }

    public function parseWebhook(Request $request): WebhookOutcome
    {
        $orderCode = (string) $request->input('order_code');
        $simulatedStatus = (string) $request->input('status', 'paid');

        $outcome = match ($simulatedStatus) {
            'paid', 'settlement', 'capture' => 'paid',
            'failed', 'expired', 'cancel', 'deny' => 'failed',
            default => 'pending',
        };

        return new WebhookOutcome(
            orderCode: $orderCode,
            outcome: $outcome,
            transactionId: $request->input('transaction_id', 'MOCK-TX-' . strtoupper(Str::random(8))),
        );
    }
}