<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $trackUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Order $order,
        public string $type = 'created',
    )
    {
        $this->order->loadMissing('items');
        $this->trackUrl = route('order-track', ['token' => $this->order->tracking_token]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->type === 'paid'
            ? "Pembayaran Diterima - Pesanan {$this->order->order_code} | TokoKami"
            : "Terima Kasih atas Pesanan Anda ({$this->order->order_code}) | TokoKami";

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.notification',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
