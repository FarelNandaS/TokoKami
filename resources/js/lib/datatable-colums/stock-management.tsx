"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/lib/data-table-features";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Diff, SlidersHorizontal } from "lucide-react";
import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";
import { adjustStock } from "@/routes";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type VariantStock = {
    id: number;
    sku: string;
    combination: string;
    stock: number;
};

export type Stock = {
    id: number;
    name: string;
    has_variants: boolean;
    stock: number;
    variants: VariantStock[];
};

function AdjustStockModal({ product }: { product: Stock }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        stock: product.stock,
        variants: product.variants || [],
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
        } else {
            setData("variants", product.variants || []);
        }
    };

    const handleVariantStockChange = (variantId: number, newStock: number) => {
        const updated = data.variants.map((v) =>
            v.id === variantId ? { ...v, stock: newStock } : v,
        );
        setData("variants", updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(adjustStock(product.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
            },
            onError: (error) => {
                console.error("Gagal mengubah stock product: ", error);
                toast.error("Gagal mengubah stock product!");
            },
        });
    };

    return (
        <Modal
            btnTrigger={
                <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1.5 text-xs"
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust Stock
                </Button>
            }
            title={`Adjust Stock - ${product.name}`}
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                    {/* KONDISI 1: Jika produk punya varian, tampilkan tabel varian */}
                    {product.has_variants ? (
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-muted text-muted-foreground border-b">
                                    <tr>
                                        <th className="p-2.5">Kombinasi Varian</th>
                                        <th className="p-2.5">SKU</th>
                                        <th className="p-2.5 w-32">Stok Varian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.variants.map((variant) => (
                                        <tr key={variant.id} className="border-b">
                                            <td className="p-2.5 font-medium">
                                                {variant.combination}
                                            </td>
                                            <td className="p-2.5 text-muted-foreground">
                                                {variant.sku}
                                            </td>
                                            <td className="p-2.5">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={variant.stock}
                                                    onChange={(e) =>
                                                        handleVariantStockChange(
                                                            variant.id,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* KONDISI 2: Jika produk TANPA varian, tampilkan input stok biasa */
                        <Field className="gap-2">
                            <FieldLabel htmlFor="stock" className="gap-0">
                                Jumlah Stok Produk
                                <span className="text-lg text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={data.stock}
                                onChange={(e) => setData("stock", Number(e.target.value))}
                                placeholder="Masukkan jumlah stok"
                                required
                            />
                        </Field>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="cursor-pointer"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </Modal>
    );
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Stock>();

export const columns = columnHelper.columns([
    columnHelper.display({
        id: "no",
        header: "No",
        cell: ({ row, table }) => {
            return (
                <span className="text-center">
                    {table.getFilteredRowModel().rows.indexOf(row) + 1}
                </span>
            );
        },
    }),
    columnHelper.accessor("name", {
        header: "Name",
    }),
    columnHelper.accessor("stock", {
        header: "Stock",
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
            const product = row.original as Stock;

            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <AdjustStockModal product={product}/>
                </div>
            );
        },
    }),
]);
