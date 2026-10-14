"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTableFeatures } from "../data-table-features";
import { ConfirmationAlert } from "@/components/confirmationAlert";
import { Button } from "@/components/ui/button";
import { Pen, Trash } from "lucide-react";
import { router, useForm } from "@inertiajs/react";
import { deleteProduct, editProduct } from "@/routes";
import { toast } from "sonner";
import { FormEvent, useState } from "react";
import { Modal } from "@/components/modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputRupiah } from "@/components/input-rupiah";

export type product = {
    id: number;
    name: string;
    description: string;
    price: number;
};

function EditProductModal({ product }: { product: product }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, reset, errors, clearErrors, processing } = useForm({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        put(editProduct().url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
            },
            onError: (error) => {
                console.error("Gagal mengubah data product: ", error);
                toast.error("Gagal mengubah product.");
            },
        });
    };

    return (
        <Modal
            btnTrigger={
                <Button variant="outline" className="cursor-pointer">
                    <Pen />
                </Button>
            }
            title="Edit Product"
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                    <Field className="gap-2">
                        <FieldLabel htmlFor="edit-name" className="gap-0">Name<span className="text-lg text-destructive">*</span></FieldLabel>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                            placeholder="Baju Putih"
                            aria-invalid={errors.name ? true : false}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">
                                {errors.name}
                            </span>
                        )}
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="edit-description" className="gap-0">Description<span className="text-lg text-destructive">*</span></FieldLabel>
                        <Textarea
                            id="edit-description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Baju dengan warna putih yang bersih."
                            required
                            aria-invalid={errors.description ? true : false}
                        />
                        {errors.description && (
                            <span className="text-xs text-destructive">
                                {errors.description}
                            </span>
                        )}
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="edit-price" className="gap-0">Price<span className="text-lg text-destructive">*</span></FieldLabel>
                        <InputRupiah
                            id="edit-price"
                            value={data.price}
                            onValueChange={(val) => setData("price", Number(val))}
                            required
                            placeholder="50000"
                            aria-invalid={errors.price ? true : false}
                        />
                        {errors.price && (
                            <span className="text-xs text-destructive">
                                {errors.price}
                            </span>
                        )}
                    </Field>
                    <div className="flex justify-end">
                        <Button disabled={processing} type="submit">
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </Modal>
    );
}

const handleDelete = (id: number) => {
    toast.info("Processing Delete...");

    router.delete(deleteProduct(), {
        data: {
            id: id,
        },
        preserveScroll: true,
        onError: (error) => {
            console.error("Gagal menghapus product: ", error);
            toast.error("Gagal menghapus product");
        },
    });
};

const columnHelper = createColumnHelper<DataTableFeatures, product>();

export const columns = columnHelper.columns([
    columnHelper.display({
        id: "no",
        header: "No",
        cell: ({ row, table }) => {
            return (
                <span>{table.getFilteredRowModel().rows.indexOf(row) + 1}</span>
            );
        },
    }),
    columnHelper.accessor("name", {
        header: "Name",
    }),
    columnHelper.accessor("description", {
        header: "Header",
    }),
    columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row, table }) => {
            const amount = row.original.price;

            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(amount);

            return formatted;
        },
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
            const product = row.original as product;

            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <EditProductModal product={product}/>

                    <ConfirmationAlert
                        handle={() => handleDelete(product.id)}
                        title="Anda Yakin Menghapus Product Ini?"
                        desc="Tindakan ini tidak dapat dibatalkan. Menghapus akun admin ini akan menghilangkan seluruh data profil dan hak aksesnya ke panel kontrol."
                    >
                        <Button variant="destructive">
                            <Trash />
                        </Button>
                    </ConfirmationAlert>
                </div>
            );
        },
    }),
]);
