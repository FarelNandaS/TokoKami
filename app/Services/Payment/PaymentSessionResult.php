<?php

namespace App\Services\Payment;

class PaymentSessionResult
{
    /**
     * Create a new class instance.
     */
    public function __construct(
        public readonly string $driver,
        public readonly ?string $reference = null,
        public readonly ?string $tokenOrUrl = null,
        public readonly ?string $redirectUrl = null,
        public readonly bool $isMock = false,
    ) {
        //
    }
}
