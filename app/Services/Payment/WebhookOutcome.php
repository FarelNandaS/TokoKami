<?php

namespace App\Services\Payment;

class WebhookOutcome
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public readonly string $orderCode,
        public readonly string $outcome, // 'paid' | 'failed' | 'pending'
        public readonly ?string $transactionId = null,
    ) {
        //
    }
}
