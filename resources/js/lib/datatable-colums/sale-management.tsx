"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/lib/data-table-features";
import { product, productVariant } from "./product-management";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { router } from "@inertiajs/react";
import { deleteSale } from "@/routes";
import { ConfirmationAlert } from "@/components/confirmationAlert";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ProductSale = {
    id: number;
    product_id: number;
    product_variant_id?: number | null;
    sale_price: number;
    discount_percentage?: number | null;
    start_sale: string;
    end_sale: string;
    product: product;
    variant?: productVariant | null;
};

const getVariantSearchLabel = (variant?: productVariant | null): string => {
    if (!variant) return "";

    const attrValues = variant.attribute_values
        ?.map((av) => av.value)
        .filter(Boolean);

    if (attrValues && attrValues.length > 0) {
        return attrValues.join(" ");
    }

    return variant.sku ?? "";
};

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);

const formatDateShort = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const handleDelete = (id: number) => {
    toast.info("Deleting promo...");

    router.delete(deleteSale().url, {
        data: { id },
        preserveScroll: false,
        onError: (error) => {
            console.error("Gagal menghapus promo: ", error);
            toast.error("Gagal menghapus promo");
        },
    });
};

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, ProductSale>();

export const columns = columnHelper.columns([
    columnHelper.display({
        id: "no",
        header: "No",
        cell: ({ row, table }) => {
            return (
                <span className="text-muted-foreground font-medium">
                    {table.getFilteredRowModel().rows.indexOf(row) + 1}
                </span>
            );
        },
    }),
    columnHelper.accessor(
        (row) => {
            const productName = row.product?.name ?? "";
            const variantLabel = getVariantSearchLabel(row.variant);
            return `${productName} ${variantLabel}`.trim();
        },
        {
            id: "name",
            header: "Name",
            cell: ({ row }) => {
                const prod = row.original.product;
                const variantLabel = getVariantSearchLabel(
                    row.original.variant,
                );

                return (
                    <div className="flex flex-col">
                        <span>{prod?.name ?? "-"}</span>
                        {variantLabel && (
                            <span className="text-xs text-muted-foreground">
                                {variantLabel}
                            </span>
                        )}
                    </div>
                );
            },
        },
    ),
    columnHelper.display({
        id: "normal_price",
        header: "Normal Price",
        cell: ({ row }) => {
            const { product: prod, variant } = row.original;
            const normalPrice = variant?.price ?? prod?.price ?? 0;

            return (
                <span className="text-muted-foreground line-through">
                    {formatRupiah(normalPrice)}
                </span>
            );
        },
    }),
    columnHelper.accessor("sale_price", {
        header: "Harga Diskon",
        cell: ({ row }) => {
            const {
                product: prod,
                variant,
                sale_price,
                discount_percentage,
            } = row.original;
            const normalPrice = variant?.price ?? prod?.price ?? 0;

            const computedPercent =
                discount_percentage != null
                    ? Math.round(Number(discount_percentage))
                    : normalPrice > 0
                      ? Math.round(
                            ((normalPrice - sale_price) / normalPrice) * 100,
                        )
                      : 0;

            return (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                        {formatRupiah(sale_price)}
                    </span>
                    {computedPercent > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            -{computedPercent}%
                        </Badge>
                    )}
                </div>
            );
        },
    }),
    columnHelper.display({
        id: "period",
        header: "Periode",
        cell: ({ row }) => {
            const start = formatDateShort(row.original.start_sale);
            const end = formatDateShort(row.original.end_sale);

            if (!start && !end) {
                return (
                    <span className="text-xs text-muted-foreground">
                        Tanpa batas waktu
                    </span>
                );
            }

            return (
                <span className="text-xs text-muted-foreground">
                    {start ?? "Sekarang"} – {end ?? "Seterusnya"}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
            const item = row.original;

            return (
                <div className="flex items-center gap-2">
                    <ConfirmationAlert
                        handle={() => handleDelete(item.id)}
                        title="Anda Yakin Menghapus Promo Ini?"
                        desc="Tindakan ini tidak dapat dibatalkan. Jika anda melakukan ini data promo yang anda pilih akan terhapus secara permanen."
                    >
                        <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                        </Button>
                    </ConfirmationAlert>

                    {/* <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="cursor-pointer gap-1"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                    </Button> */}
                </div>
            );
        },
    }),
]);
