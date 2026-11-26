<?php
// config/payment.php

return [
    'default' => env('PAYMENT_DRIVER', 'mock'),

    'mock' => [
        'enabled' => env('PAYMENT_MOCK_ENABLED', env('PAYMENT_DRIVER', 'mock') === 'mock'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY', ''),
        'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    ],
];