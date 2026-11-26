<?php

namespace App\Services\Payment;

use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentGatewayDriver
{
    public function createPayment(Order $order): PaymentSessionResult;

    public function parseWebhook(Request $request): WebhookOutcome;
}
