<x-mail::message>
# Halo, {{ $order->customer_name }}!

@if ($type === 'paid')
Terima kasih! Pembayaran Anda untuk pesanan **{{ $order->order_code }}** telah berhasil kami terima. Pesanan Anda kini sedang kami konfirmasi untuk segera dikemas.
@else
Terima kasih telah berbelanja di **TokoKami**! Pesanan Anda dengan kode **{{ $order->order_code }}** telah berhasil dibuat.
@endif

### Ringkasan Pesanan
<x-mail::table>
| Produk | Qty | Subtotal |
| :--- | :---: | ---: |
@foreach ($order->items as $item)
| {{ $item->product_name }}@if($item->variant_label) ({{ $item->variant_label }})@endif | {{ $item->quantity }} | Rp{{ number_format($item->line_total, 0, ',', '.') }} |
@endforeach
| **Ongkos Kirim** | | **{{ $order->shipping_cost == 0 ? 'Gratis' : 'Rp' . number_format($order->shipping_cost, 0, ',', '.') }}** |
| **Total Pembayaran** | | **Rp{{ number_format($order->total_amount, 0, ',', '.') }}** |
</x-mail::table>

Anda dapat memantau status pembayaran dan progres pengiriman pesanan kapan saja melalui tautan berikut:

<x-mail::button :url="$trackUrl">
Lacak Pesanan Saya
</x-mail::button>

Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:  
[{{ $trackUrl }}]({{ $trackUrl }})

Terima kasih,<br>
**Tim {{ config('app.name', 'TokoKami') }}**
</x-mail::message>