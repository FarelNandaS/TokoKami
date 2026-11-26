"use client";

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useForm } from "@inertiajs/react";
import { Eye, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { DataTableFeatures } from "../data-table-features";
import { Modal } from "@/components/modal";
import { ConfirmationAlert } from "@/components/confirmationAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export interface AdminOrderItem {
    id: number;
    product_name: string;
    variant_label?: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
}

export interface AdminOrderRecord {
    id: number;
    order_code: string;
    tracking_token: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code?: string | null;
    notes?: string | null;
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_gateway?: string | null;
    payment_reference?: string | null;
    payment_status: string;
    paid_at?: string | null;
    order_status: string;
    courier_name?: string | null;
    tracking_number?: string | null;
    admin_notes?: string | null;
    created_at?: string | null;
    items_count: number;
    items: AdminOrderItem[];
}

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

function ManageOrderModal({ order }: { order: AdminOrderRecord }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, patch, reset, errors, clearErrors, processing } =
        useForm({
            order_status: order.order_status,
            courier_name: order.courier_name || "",
            tracking_number: order.tracking_number || "",
            admin_notes: order.admin_notes || "",
        });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            reset();
            clearErrors();
        } else {
            setData({
                order_status: order.order_status,
                courier_name: order.courier_name || "",
                tracking_number: order.tracking_number || "",
                admin_notes: order.admin_notes || "",
            });
        }
    };

    const handleOrderStatus = (
        nextStatus:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled",
    ) => {
        data.order_status = nextStatus;

        patch(`/admin/orders/${order.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                if (nextStatus === "delivered" || nextStatus === "cancelled") {
                    setIsOpen(false);
                }
                toast.success(`Status pesanan diubah menjadi ${nextStatus}.`);
            },
            onError: () => {
                toast.error("Gagal memperbarui status pesanan.");
            },
        });
    };

    return (
        <Modal
            btnTrigger={
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Kelola
                </Button>
            }
            title={`Kelola Pesanan ${order.order_code}`}
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <div className="space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div>
                        <div className="font-bold text-sm">
                            {order.customer_name}
                        </div>
                        <div className="text-muted-foreground">
                            {order.customer_phone} • {order.customer_email}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {order.shipping_address}, {order.shipping_city}{" "}
                            {order.shipping_postal_code || ""}
                        </p>
                        {order.notes && (
                            <p className="italic text-muted-foreground mt-1">
                                Catatan: "{order.notes}"
                            </p>
                        )}
                    </div>

                    <a
                        href={`/order/track/${order.tracking_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary font-semibold hover:underline"
                    >
                        Buka Tracking ↗
                    </a>
                </div>

                {/* Daftar Item */}
                <div className="space-y-1.5">
                    <div className="font-bold uppercase text-[10px] text-muted-foreground">
                        Item Pesanan
                    </div>
                    <div className="divide-y rounded-lg border px-3">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="py-2 flex items-center justify-between gap-2"
                            >
                                <div>
                                    <span className="font-semibold">
                                        {item.product_name}
                                    </span>
                                    {item.variant_label && (
                                        <span className="text-muted-foreground">
                                            {" "}
                                            ({item.variant_label})
                                        </span>
                                    )}
                                    <span className="text-muted-foreground">
                                        {" "}
                                        x{item.quantity}
                                    </span>
                                </div>
                                <span className="font-bold">
                                    {formatRupiah(item.line_total)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-bold pt-1">
                        <span>Total Pembayaran</span>
                        <span className="text-sm font-black text-primary">
                            {formatRupiah(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* Ringkasan Status Gateway (Read-only) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <div className="space-y-0.5">
                        <div className="font-bold uppercase text-[10px] text-muted-foreground">
                            Gateway Pembayaran
                        </div>
                        <div className="text-muted-foreground">
                            {(order.payment_gateway || order.payment_method).toUpperCase()}
                            {order.payment_reference
                                ? ` • Ref: ${order.payment_reference}`
                                : ""}
                        </div>
                    </div>

                    <Badge
                        variant={
                            order.payment_status === "paid"
                                ? "default"
                                : order.payment_status === "expired"
                                  ? "destructive"
                                  : "outline"
                        }
                        className="text-[10px] uppercase"
                    >
                        {order.payment_status}
                    </Badge>
                </div>

                {/* Pengiriman & Status Order */}
                <FieldGroup className="gap-3 border-t pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Field className="gap-1">
                            <FieldLabel
                                htmlFor={`courier-${order.id}`}
                                className="text-xs"
                            >
                                Kurir
                            </FieldLabel>
                            <Input
                                id={`courier-${order.id}`}
                                value={data.courier_name}
                                onChange={(e) =>
                                    setData("courier_name", e.target.value)
                                }
                                placeholder="JNE, J&T, SiCepat..."
                                className="h-8 text-xs"
                            />
                        </Field>

                        <Field className="gap-1">
                            <FieldLabel
                                htmlFor={`resi-${order.id}`}
                                className="text-xs"
                            >
                                Nomor Resi
                            </FieldLabel>
                            <Input
                                id={`resi-${order.id}`}
                                value={data.tracking_number}
                                onChange={(e) =>
                                    setData("tracking_number", e.target.value)
                                }
                                placeholder="Masukkan resi..."
                                className="h-8 text-xs font-mono"
                            />
                            {errors.tracking_number && (
                                <span className="text-destructive text-[11px]">
                                    {errors.tracking_number}
                                </span>
                            )}
                        </Field>
                    </div>

                    <Field className="gap-1">
                        <FieldLabel
                            htmlFor={`notes-${order.id}`}
                            className="text-xs"
                        >
                            Catatan Admin
                        </FieldLabel>
                        <Input
                            id={`notes-${order.id}`}
                            value={data.admin_notes}
                            onChange={(e) =>
                                setData("admin_notes", e.target.value)
                            }
                            placeholder="Catatan untuk pembeli / internal..."
                            className="h-8 text-xs"
                        />
                    </Field>

                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={processing}
                            onClick={() => handleOrderStatus("processing")}
                            className="cursor-pointer h-8 text-xs"
                        >
                            Proses / Kemas
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            disabled={processing}
                            onClick={() => handleOrderStatus("shipped")}
                            className="cursor-pointer gap-1 h-8 text-xs"
                        >
                            <Truck className="h-3.5 w-3.5" />
                            Kirim (Resi)
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={processing}
                            onClick={() => handleOrderStatus("delivered")}
                            className="cursor-pointer h-8 text-xs"
                        >
                            Selesai
                        </Button>

                        {order.order_status !== "cancelled" && (
                            <ConfirmationAlert
                                handle={() => handleOrderStatus("cancelled")}
                                title="Batalkan Pesanan Ini?"
                                desc="Membatalkan pesanan akan otomatis mengembalikan stok produk/varian ke inventaris."
                            >
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    disabled={processing}
                                    className="cursor-pointer gap-1 h-8 text-xs"
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Batalkan Order
                                </Button>
                            </ConfirmationAlert>
                        )}
                    </div>
                </FieldGroup>
            </div>
        </Modal>
    );
}

const columnHelper = createColumnHelper<DataTableFeatures, AdminOrderRecord>();

export const columns = columnHelper.columns([
    columnHelper.display({
        id: "no",
        header: "No",
        cell: ({ row, table }) => (
            <span>{table.getFilteredRowModel().rows.indexOf(row) + 1}</span>
        ),
    }),
    columnHelper.accessor("order_code", {
        header: "Kode Order",
        cell: ({ row }) => (
            <span className="font-mono font-bold text-xs text-primary">
                {row.original.order_code}
            </span>
        ),
    }),
    columnHelper.accessor("customer_name", {
        header: "Pembeli",
        cell: ({ row }) => (
            <div className="space-y-0.5">
                <div className="font-semibold text-xs">
                    {row.original.customer_name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                    {row.original.customer_email} • {row.original.shipping_city}
                </div>
            </div>
        ),
    }),
    columnHelper.accessor("total_amount", {
        header: "Total",
        cell: ({ row }) => (
            <span className="font-extrabold text-xs">
                {formatRupiah(row.original.total_amount)}
            </span>
        ),
    }),
    columnHelper.accessor("payment_status", {
        header: "Pembayaran",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5">
                <Badge
                    variant={
                        row.original.payment_status === "paid"
                            ? "default"
                            : row.original.payment_status === "expired"
                              ? "destructive"
                              : "outline"
                    }
                    className="text-[10px]"
                >
                    {row.original.payment_status}
                </Badge>
                <span className="text-[10px] text-muted-foreground uppercase">
                    {row.original.payment_gateway || row.original.payment_method}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("order_status", {
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.order_status === "cancelled"
                        ? "destructive"
                        : "secondary"
                }
                className="text-[10px] uppercase font-bold"
            >
                {row.original.order_status}
            </Badge>
        ),
    }),
    columnHelper.accessor("created_at", {
        header: "Tanggal",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
                {row.original.created_at || "-"}
            </span>
        ),
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => <ManageOrderModal order={row.original} />,
    }),
]);