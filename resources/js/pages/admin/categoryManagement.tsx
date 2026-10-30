import { DataTable } from "@/components/datatable";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Category, columns } from "@/lib/datatable-colums/category-management";
import { categoryManagement, createCategory } from "@/routes";
import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function CategoryManagement({ data }: { data: Category[] }) {
    const [isOpen, setIsOpen] = useState(false);

    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: "",
        slug: "",
    });

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Hapus karakter spesial
            .replace(/[\s_-]+/g, "-") // Ganti spasi/underscore/tanda hubung berlebih jadi satu '-'
            .replace(/--+/g, "-") // Pastikan tidak ada double dash (--)
            .replace(/^-+|-+$/g, ""); // Hapus dash di awal atau akhir string
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData((prev) => ({
            ...prev,
            name: val,
            slug: generateSlug(val),
        }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        const sanitized = val
            .toLowerCase()
            .replace(/\s+/g, "-") // Jika admin mengetik spasi (sekali atau beberapa kali), ubah jadi '-'
            .replace(/--+/g, "-") // Mencegah tanda hubung ganda (--) menjadi satu '-'
            .replace(/[^a-z0-9-]/g, ""); // Menghapus semua karakter selain huruf kecil, angka, dan '-'

        setData("slug", sanitized);
    };

    const handleSlugBlur = () => {
        const cleaned = formData.slug.replace(/-+$/, ""); // Hapus tanda hubung di akhir kalimat
        setData("slug", cleaned);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const finalSlug = formData.slug.replace(/-+$/, ""); // Hapus tanda hubung di akhir kalimat
        setData("slug", finalSlug);

        post(createCategory().url, {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
            onError: (error) => {
                console.error(
                    "Terjadi kesalahan saat menyimpan category baru: ",
                    error,
                );
                toast.error("Terjadi kesalahan saat menyimpan category baru!");
            },
        });
    };

    return (
        <>
            <Head title="Category Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    data={data}
                    columns={columns}
                    canFilter
                    filterWhat="name"
                    sideElement={
                        <Modal
                            btnTrigger={
                                <Button className="cursor-pointer">
                                    New Category
                                </Button>
                            }
                            title="Create Category"
                            open={isOpen}
                            onOpenChange={handleOpenChange}
                        >
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field className="gap-2">
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="name"
                                        >
                                            Name
                                            <span className="text-lg text-destructive">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            required
                                            placeholder="Fashion & Style"
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            aria-invalid={
                                                errors.name ? true : false
                                            }
                                        />
                                        {errors.name && (
                                            <span className="text-xs text-destructive">
                                                {errors.name}
                                            </span>
                                        )}
                                    </Field>

                                    <Field className="gap-2">
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="slug"
                                        >
                                            Slug
                                            <span className="text-lg text-destructive">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="slug"
                                            required
                                            placeholder="fashion-style"
                                            value={formData.slug}
                                            onChange={handleSlugChange}
                                            onBlur={handleSlugBlur}
                                            aria-invalid={
                                                errors.slug ? true : false
                                            }
                                        />
                                        {errors.slug && (
                                            <span className="text-xs text-destructive">
                                                {errors.slug}
                                            </span>
                                        )}
                                        <p className="text-[11px] text-muted-foreground">
                                            Gunakan huruf kecil, angka, dan
                                            tanda hubung (
                                            <code className="bg-muted px-1 rounded">
                                                -
                                            </code>
                                            ) tanpa spasi atau simbol khusus,
                                            tidak boleh ada (
                                            <code className="bg-muted px-1 rounded">
                                                -
                                            </code>
                                            ) di awal atau akhir slug.
                                        </p>
                                    </Field>

                                    <div className="flex justify-end">
                                        <Button
                                            className="cursor-pointer"
                                            type="submit"
                                        >
                                            {processing
                                                ? "Saving..."
                                                : "Create"}
                                        </Button>
                                    </div>
                                </FieldGroup>
                            </form>
                        </Modal>
                    }
                />
            </div>
        </>
    );
}

CategoryManagement.layout = {
    breadcrumbs: [
        {
            title: "Category Management",
            href: categoryManagement(),
        },
    ],
};
