"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/lib/data-table-features";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Diff, Pen, Trash } from "lucide-react";
import { toast } from "sonner";
import { router, useForm } from "@inertiajs/react";
import { deleteCategory, editCategory } from "@/routes";
import { ConfirmationAlert } from "@/components/confirmationAlert";
import { FormEvent, useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Category = {
    id: number;
    name: string;
    slug: string;
};

function EditCategoryModal({ category }: { category: Category }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            id: category.id,
            name: category.name,
            slug: category.slug,
        });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const sanitized = val
            .toLowerCase()
            .replace(/\s+/g, "-") // Ubah spasi menjadi '-'
            .replace(/--+/g, "-") // Cegah tanda hubung ganda (--)
            .replace(/[^a-z0-9-]/g, "") // Hanya izinkan huruf kecil, angka, dan '-'
            .replace(/^-+/, "");         // Langsung hapus tanda hubung jika ada di AWAL

        setData("slug", sanitized);
    };

    const handleSlugBlur = () => {
        const cleaned = data.slug.replace(/-+$/, ""); // Hapus tanda hubung di akhir kalimat
        setData("slug", cleaned);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const finalSlug = data.slug.replace(/-+$/, ""); // Hapus tanda hubung di akhir kalimat
        setData("slug", finalSlug);

        put(editCategory().url, {
            preserveScroll: false,
            onSuccess: () => {
                handleOpenChange(false);
            },
            onError: (error) => {
                console.error(
                    "Terjadi kesalahan saat mengedit category: ",
                    error,
                );
                toast.error("Terjadi kesalahan saat mengedit category!");
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
            open={isOpen}
            onOpenChange={handleOpenChange}
            title="Edit Category"
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Field className="gap-2">
                        <FieldLabel className="gap-0" htmlFor="name">
                            Name
                            <span className="text-lg text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="name"
                            required
                            placeholder="Fashion & Style"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            aria-invalid={errors.name ? true : false}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">
                                {errors.name}
                            </span>
                        )}
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel className="gap-0" htmlFor="slug">
                            slug
                            <span className="text-lg text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            id="slug"
                            required
                            placeholder="fashion-style"
                            value={data.slug}
                            onChange={handleSlugChange}
                            onBlur={handleSlugBlur}
                            aria-invalid={errors.slug ? true : false}
                        />
                        {errors.slug && (
                            <span className="text-xs text-destructive">
                                {errors.slug}
                            </span>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                            Gunakan huruf kecil, angka, dan tanda hubung (
                            <code className="bg-muted px-1 rounded">-</code>)
                            tanpa spasi atau simbol khusus, tidak boleh ada (
                            <code className="bg-muted px-1 rounded">-</code>) di
                            awal atau akhir slug.
                        </p>
                    </Field>
                    <div className="flex justify-end">
                        <Button className="cursor-pointer" type="submit">
                            {processing ? "Saving..." : "Create"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </Modal>
    );
}

const handleDelete = (id: number) => {
    toast.info("Processiong Delete...");

    router.delete(deleteCategory(), {
        data: { id },
        preserveScroll: false,
        onSuccess: () => {
            // toast.success('Berhasil menghapus category')
        },
        onError: (error) => {
            console.error("Gagal menghapus user:", error);
            toast.error("Gagal menghapus user");
        },
    });
};

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Category>();

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
    columnHelper.accessor("slug", {
        header: "slug",
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
            const category = row.original as Category;

            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <EditCategoryModal category={category} />

                    <ConfirmationAlert
                        handle={() => handleDelete(category.id)}
                        title="Anda Yakin Menghapus Category Ini?"
                        desc="Tindakan ini tidak dapat dibatalkan. Menghapus category akan bedampak ke product dan menghapus relasi data yang berhubungan dengan category ini."
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
