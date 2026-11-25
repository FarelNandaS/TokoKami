<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->string('tracking_token')->unique();

            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');

            $table->text('shipping_address');
            $table->string('shipping_city');
            $table->string('shipping_postal_code', 20)->nullable();
            $table->text('notes')->nullable();

            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('shipping_cost')->default(0);
            $table->unsignedBigInteger('total_amount');

            $table->string('payment_method'); // bank_transfer, qris, cod
            $table->string('payment_gateway')->nullable(); // mock | midtrans | manual
            $table->string('payment_reference')->nullable();
            $table->text('payment_token')->nullable();
            $table->string('payment_status')->default('unpaid'); // unpaid, waiting_verification, paid, rejected, refunded
            $table->string('payment_proof_path')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->string('order_status')->default('pending'); // pending, confirmed, processing, shipped, delivered, cancelled
            $table->string('courier_name')->nullable();
            $table->string('tracking_number')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
