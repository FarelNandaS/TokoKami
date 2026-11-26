<?php
// app/Services/Payment/Drivers/MidtransPaymentDriver.php

namespace App\Services\Payment\Drivers;

use App\Models\Order;
use App\Services\Payment\PaymentGatewayDriver;
use App\Services\Payment\PaymentSessionResult;
use App\Services\Payment\WebhookOutcome;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class MidtransPaymentDriver implements PaymentGatewayDriver
{
    public function createPayment(Order $order): PaymentSessionResult
    {
        $serverKey = (string) config('payment.midtrans.server_key');
        if ($serverKey === '') {
            throw new RuntimeException('MIDTRANS_SERVER_KEY belum dikonfigurasi.');
        }

        $snapUrl = (string) config('payment.midtrans.snap_url');

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->post($snapUrl, [
                'transaction_details' => [
                    'order_id' => $order->order_code,
                    'gross_amount' => (int) $order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Gagal membuat transaksi Midtrans: ' . $response->body());
        }

        $data = $response->json();
        $snapToken = $data['token'] ?? null;
        $redirectUrl = $data['redirect_url'] ?? route('order-track', ['token' => $order->tracking_token]);

        return new PaymentSessionResult(
            driver: 'midtrans',
            reference: $snapToken,
            tokenOrUrl: $snapToken,
            redirectUrl: $redirectUrl,
            isMock: false,
        );
    }

    public function parseWebhook(Request $request): WebhookOutcome
    {
        $serverKey = (string) config('payment.midtrans.server_key');
        $orderCode = (string) $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $signatureKey = (string) $request->input('signature_key');

        $expectedSignature = hash('sha512', $orderCode . $statusCode . $grossAmount . $serverKey);
        if ($serverKey === '' || !hash_equals($expectedSignature, $signatureKey)) {
            throw new AccessDeniedHttpException('Signature Midtrans tidak valid.');
        }

        $txStatus = (string) $request->input('transaction_status');
        $fraudStatus = (string) $request->input('fraud_status');

        $isPaid = ($txStatus === 'capture' && $fraudStatus === 'accept')
            || $txStatus === 'settlement';
        $isFailed = in_array($txStatus, ['cancel', 'deny', 'expire'], true);

        $outcome = $isPaid ? 'paid' : ($isFailed ? 'failed' : 'pending');

        return new WebhookOutcome(
            orderCode: $orderCode,
            outcome: $outcome,
            transactionId: $request->input('transaction_id'),
        );
    }
}