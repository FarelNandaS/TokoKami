"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { DataTableFeatures } from "../data-table-features";
import { ConfirmationAlert } from "@/components/confirmationAlert";
import { Button } from "@/components/ui/button";
import { FileInput, Pen, Trash } from "lucide-react";
import { router, useForm } from "@inertiajs/react";
import { deleteProduct, editProduct } from "@/routes";
import { toast } from "sonner";
import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputRupiah } from "@/components/input-rupiah";
import { InputFile } from "@/components/input-file";

type productImages = {
    id: number;
    image_path: string;
};

export type product = {
    id: number;
    name: string;
    description: string;
    price: number;
    cover_image: productImages;
    images: productImages[];
};

function EditProductModal({ product }: { product: product }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, reset, errors, clearErrors, processing } =
        useForm({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            existing_cover_id: product.cover_image ? product.cover_image.id : null,
            existing_images: product.images
                ? product.images.map((img) => img.id)
                : [],
            cover_image: [] as File[],
            images: [] as File[],
            _method: "PUT",
        });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    };

    const initialExistingFiles = useMemo(() => {
        return product.images
            ? product.images.map((img) => ({
                id: img.id,
                url: `/storage/${img.image_path}`,
                name: img.image_path.split("/").pop() || 'Image',
                size: 'Saved',
                isImage: true,
            })) : [];
    }, [product.images]);

    const initialCoverExisting = useMemo(() => {
        if (!product.cover_image || !product.cover_image.image_path) {
            return [];
        };
        return [
            {
                id: product.cover_image.id,
                url: `/storage/${product.cover_image.image_path}`,
                name: product.cover_image.image_path.split("/").pop() || 'Cover Image',
                size: 'Saved',
                isImage: true,
            }
        ];
    }, [product.cover_image]);

    const handleRemoveExisting = (id: number) => {
        const updatedExisting = data.existing_images.filter(
            (imgId) => imgId !== id,
        );
        setData("existing_images", updatedExisting);
    };

    const handleRemoveExistingCover = (id: number) => {
        setData('existing_cover_id', null);
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(editProduct().url, {
            forceFormData: true,
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
                        <FieldLabel htmlFor="edit-name" className="gap-0">
                            Name
                            <span className="text-lg text-destructive">*</span>
                        </FieldLabel>
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
                        <FieldLabel
                            htmlFor="edit-description"
                            className="gap-0"
                        >
                            Description
                            <span className="text-lg text-destructive">*</span>
                        </FieldLabel>
                        <Textarea
                            id="edit-description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
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
                        <FieldLabel htmlFor="edit-price" className="gap-0">
                            Price
                            <span className="text-lg text-destructive">*</span>
                        </FieldLabel>
                        <InputRupiah
                            id="edit-price"
                            value={data.price}
                            onValueChange={(val) =>
                                setData("price", Number(val))
                            }
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
                    <Field className="gap-2">
                        <FieldLabel htmlFor="edit-images" className="gap-0">
                            Cover Image
                        </FieldLabel>
                        <InputFile
                            value={data.cover_image}
                            onChange={(files) => setData("cover_image", files)}
                            initialFiles={initialCoverExisting}
                            onRemoveExisting={handleRemoveExistingCover}
                            error={errors.cover_image}
                        />
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="edit-images" className="gap-0">
                            Product Images
                        </FieldLabel>
                        <InputFile
                            multiple
                            value={data.images}
                            onChange={(files) => setData("images", files)}
                            initialFiles={initialExistingFiles}
                            onRemoveExisting={handleRemoveExisting}
                            error={errors.images}
                        />
                    </Field>
                    <div className="flex justify-end">
                        <Button disabled={processing} type="submit" className="cursor-pointer">
                            {processing ? "Saving..." : "Save"}
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
        header: "Description",
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
                    <EditProductModal product={product} />

                    <ConfirmationAlert
                        handle={() => handleDelete(product.id)}
                        title="Anda Yakin Menghapus Product Ini?"
                        desc="Tindakan ini tidak dapat dibatalkan. Menghapus akun admin ini akan menghilangkan seluruh data profil dan hak aksesnya ke panel kontrol."
                    >
                        <Button variant="destructive" className="cursor-pointer">
                            <Trash />
                        </Button>
                    </ConfirmationAlert>
                </div>
            );
        },
    }),
]);
