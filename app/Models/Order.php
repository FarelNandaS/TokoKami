<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
#[Fillable([
    'order_code',
    'tracking_token',
    'customer_name',
    'customer_email',
    'customer_phone',
    'shipping_address',
    'shipping_city',
    'shipping_postal_code',
    'notes',
    'subtotal',
    'shipping_cost',
    'total_amount',
    'payment_method',
    'payment_status',
    'payment_proof_path',
    'order_status',
    'courier_name',
    'tracking_number',
    'admin_notes',
])]
class Order extends Model
{
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
