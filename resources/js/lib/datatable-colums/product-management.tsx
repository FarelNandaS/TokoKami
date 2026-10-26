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

type AttributeCard = {
    id: number;
    name: string;
    values: string;
};

type attributeValue = {
    id: number;
    attribute_id: number;
    value: string;
};

type productVariant = {
    id: number;
    sku: string;
    price: number;
    stock: number;
    attribute_values: attributeValue[];
};

export type product = {
    id: number;
    name: string;
    description: string;
    price: number;
    cover_image: productImages;
    images: productImages[];
    variants: productVariant[];
    attributes: AttributeCard[];
};

function EditProductModal({ product }: { product: product }) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributes, setAttributes] = useState<AttributeCard[]>(
        product.attributes || [],
    );
    const [variants, setVariants] = useState<
        {
            id: number | null;
            combination: string;
            sku: string;
            price: number;
            stock: number;
        }[]
    >(
        product.variants
            ? product.variants.map((v) => ({
                  id: v.id,
                  combination: v.attribute_values
                      .map((av) => av.value)
                      .join(" / "),
                  sku: v.sku,
                  price: v.price,
                  stock: v.stock,
              }))
            : [],
    );

    const {
        data,
        setData,
        post,
        reset,
        errors,
        clearErrors,
        transform,
        processing,
    } = useForm({
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
        variants: variants,
        _method: "PUT",
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        } else {
            setVariants(
                product.variants
                    ? product.variants.map((v) => ({
                          id: v.id,
                          combination: v.attribute_values
                              .map((av) => av.value)
                              .join(" / "),
                          sku: v.sku,
                          price: v.price,
                          stock: v.stock,
                      }))
                    : [],
            );
            setAttributes(product.attributes || []);
        }
    };

    const handleAddAttributeCard = () => {
        const newId =
            attributes.length > 0
                ? attributes[attributes.length - 1].id + 1
                : 1;
        setAttributes([...attributes, { id: newId, name: "", values: "" }]);
    };

    const handleDeleteAttributeCard = (id: number) => {
        setAttributes(attributes.filter((attr) => attr.id !== id));
    };

    const handleAttributeChange = (
        id: number,
        field: "name" | "values",
        value: string,
    ) => {
        setAttributes(
            attributes.map((attr) =>
                attr.id === id ? { ...attr, [field]: value } : attr,
            ),
        );
    };

    const handleGenerateVariant = () => {
        const validAttrs = attributes.filter(
            (attr) => attr.name.trim() !== "" && attr.values.trim() !== "",
        );

        if (validAttrs.length === 0) {
            toast.error("Harap isi minimal satu atribut dan nilainya!");
            return;
        }

        const attrValueArrays = validAttrs.map((attr) =>
            attr.values
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v !== ""),
        );

        const cartesian = (arr: string[][]): string[][] =>
            arr.reduce<string[][]>(
                (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
                [[]],
            );

        const combinations = cartesian(attrValueArrays);

        // Buat list varian baru berdasarkan hasil generate
        const generated = combinations.map((combo) => {
            const combinationName = combo.join(" / ");

            // Cek apakah kombinasi ini sudah ada di variants sebelumnya
            const existingVariant = variants.find(
                (v) => v.combination === combinationName,
            );

            if (existingVariant) {
                // Jika sudah ada, GUNAKAN KEMBALI data lama (SKU, Harga, Stok, ID aman!)
                return existingVariant;
            } else {
                // Jika ini kombinasi BARU (misal baru nambah XL), buat data default baru
                return {
                    id: null, // ID null menandakan ini varian baru di backend
                    combination: combinationName,
                    sku: `${data.name ? data.name.toUpperCase().replace(/\s+/g, "-") : "PROD"}-${combo.join("-").toUpperCase()}`,
                    price: Number(data.price) || 0,
                    stock: 0,
                };
            }
        });

        setVariants(generated);
        console.log(generated);
    };

    const handleVariantChange = (
        index: number,
        field: "sku" | "price" | "stock",
        value: string | number,
    ) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
        setData("variants", updated);
    };

    const initialExistingFiles = useMemo(() => {
        return product.images
            ? product.images.map((img) => ({
                  id: img.id,
                  url: `/storage/${img.image_path}`,
                  name: img.image_path.split("/").pop() || "Image",
                  size: "Saved",
                  isImage: true,
              }))
            : [];
    }, [product.images]);

    const initialCoverExisting = useMemo(() => {
        if (!product.cover_image || !product.cover_image.image_path) {
            return [];
        }
        return [
            {
                id: product.cover_image.id,
                url: `/storage/${product.cover_image.image_path}`,
                name:
                    product.cover_image.image_path.split("/").pop() ||
                    "Cover Image",
                size: "Saved",
                isImage: true,
            },
        ];
    }, [product.cover_image]);

    const handleRemoveExisting = (id: number) => {
        const updatedExisting = data.existing_images.filter(
            (imgId) => imgId !== id,
        );
        setData("existing_images", updatedExisting);
    };

    const handleRemoveExistingCover = (id: number) => {
        setData("existing_cover_id", null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            product_attributes: attributes,
            variants,
        }));

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
                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-sm">
                                Edit Atribut & Varian Produk
                            </h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddAttributeCard}
                            >
                                Tambah Atribut
                            </Button>
                        </div>

                        <div className="space-y-3 mb-4">
                            {attributes.map((attr) => (
                                <div
                                    key={attr.id}
                                    className="border p-3 rounded-lg bg-muted/30 flex gap-3 items-end"
                                >
                                    <div className="flex-1">
                                        <label className="text-xs font-medium mb-1 block">
                                            Nama Atribut
                                        </label>
                                        <Input
                                            placeholder="Cth: Warna"
                                            value={attr.name}
                                            onChange={(e) =>
                                                handleAttributeChange(
                                                    attr.id,
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="flex-[2]">
                                        <label className="text-xs font-medium mb-1 block">
                                            Nilai (Pisahkan dengan koma)
                                        </label>
                                        <Input
                                            placeholder="Cth: Merah, Biru"
                                            value={attr.values}
                                            onChange={(e) =>
                                                handleAttributeChange(
                                                    attr.id,
                                                    "values",
                                                    e.target.value,
                                                )
                                            }
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteAttributeCard(attr.id)
                                        }
                                        className="h-8 w-8 p-0"
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <ConfirmationAlert
                            handle={handleGenerateVariant}
                            title="Anda yakin ingin melakukan ini?"
                            desc="Jika anda cuman menambah atau menganti attribute value itu aman. Tapi jika anda menganti attribute (menambah / mengurangi attribute) variant yang lama akan terhapus. Hal ini bisa membuat product yang sudah di order oleh customer bisa bermasalah. Jadi pastikan product / variant sudah aman untuk di ganti!"
                        >
                            <Button className="w-full text-xs h-9 cursor-pointer">
                                Generate Ulang Tabel Varian
                            </Button>
                        </ConfirmationAlert>
                    </div>
                    {variants.length > 0 && (
                        <div className="border-t pt-4 mt-2">
                            <h3 className="font-semibold text-sm mb-2">
                                Edit Varian Produk
                            </h3>
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-muted text-muted-foreground border-b">
                                        <tr>
                                            <th className="p-2">
                                                Kombinasi Varian
                                            </th>
                                            <th className="p-2">SKU Unik</th>
                                            <th className="p-2">Harga (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((v, idx) => (
                                            <tr
                                                key={v.id || idx}
                                                className="border-b"
                                            >
                                                <td className="p-2 font-medium">
                                                    {v.combination}
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={v.sku}
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                idx,
                                                                "sku",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-7 text-xs"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <InputRupiah
                                                        value={v.price}
                                                        onValueChange={(val) =>
                                                            handleVariantChange(
                                                                idx,
                                                                "price",
                                                                Number(val),
                                                            )
                                                        }
                                                        className="h-7 text-xs"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
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
                        <Button
                            disabled={processing}
                            type="submit"
                            className="cursor-pointer"
                        >
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
                        <Button
                            variant="destructive"
                            className="cursor-pointer"
                        >
                            <Trash />
                        </Button>
                    </ConfirmationAlert>
                </div>
            );
        },
    }),
]);
