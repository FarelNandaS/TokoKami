import { DataTable } from "@/components/datatable";
import { InputFile } from "@/components/input-file";
import { InputRupiah } from "@/components/input-rupiah";
import { Modal } from "@/components/modal";
import {
    Attachment,
    AttachmentAction,
    AttachmentActions,
    AttachmentContent,
    AttachmentDescription,
    AttachmentMedia,
    AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { columns, product } from "@/lib/datatable-colums/product-management";
import { createProduct, productManagement } from "@/routes";
import { Head, useForm } from "@inertiajs/react";
import { UploadCloud, XIcon } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

export default function ProductManagement({ data }: { data: product[] }) {
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
        description: "",
        price: "",
        cover_image: [] as File[],
        images: [] as File[],
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    };

    const handleSumbit = (e: FormEvent) => {
        e.preventDefault();

        post(createProduct().url, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
            onError: (error) => {
                console.error(error);
            },
        });
    };
    return (
        <>
            <Head title="Kelola Produk" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    canFilter
                    filterWhat="name"
                    sideElement={
                        <Modal
                            btnTrigger={
                                <Button className="cursor-pointer">
                                    New Product
                                </Button>
                            }
                            title="Create New Product"
                            open={isOpen}
                            onOpenChange={handleOpenChange}
                        >
                            <form onSubmit={handleSumbit}>
                                <FieldGroup className="gap-4">
                                    <Field
                                        className="gap-2"
                                        orientation="vertical"
                                    >
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
                                            value={formData.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            placeholder="Kaos Putih"
                                            required
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
                                    <Field
                                        className="gap-2"
                                        orientation="vertical"
                                    >
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="description"
                                        >
                                            Description
                                            <span className="text-lg text-destructive">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Kaos dengan warna putih yang bersih."
                                            required
                                            aria-invalid={
                                                errors.description
                                                    ? true
                                                    : false
                                            }
                                        />
                                        {errors.description && (
                                            <span className="text-xs text-destructive">
                                                {errors.description}
                                            </span>
                                        )}
                                    </Field>
                                    <Field
                                        className="gap-2"
                                        orientation="vertical"
                                    >
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="price"
                                        >
                                            Price
                                            <span className="text-lg text-destructive">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <InputRupiah
                                            value={formData.price}
                                            onValueChange={(val) =>
                                                setData("price", val)
                                            }
                                            id="price"
                                            placeholder="50.000"
                                            required
                                            aria-invalid={
                                                errors.price ? true : false
                                            }
                                        />
                                        {errors.price && (
                                            <span className="text-xs text-destructive">
                                                {errors.price}
                                            </span>
                                        )}
                                    </Field>
                                    <Field
                                        className="gap-2"
                                        orientation="vertical"
                                    >
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="images"
                                        >
                                            Cover Images
                                        </FieldLabel>
                                        <InputFile
                                            value={formData.cover_image}
                                            onChange={(files) =>
                                                setData("cover_image", files)
                                            }
                                            error={errors.cover_image}
                                            accept="image/png, image/jpg, image/jpeg, image/webp"
                                        />
                                    </Field>
                                    <Field
                                        className="gap-2"
                                        orientation="vertical"
                                    >
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="images"
                                        >
                                            Product Images
                                        </FieldLabel>
                                        <InputFile
                                            multiple
                                            value={formData.images}
                                            onChange={(files) =>
                                                setData("images", files)
                                            }
                                            error={errors.images}
                                            accept="image/png, image/jpg, image/jpeg, image/webp"
                                        />
                                    </Field>
                                    <div className="flex justify-end">
                                        <Button type="submit" className="cursor-pointer">
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

ProductManagement.layout = {
    breadcrumbs: [
        {
            title: "Kelola Produk",
            href: productManagement(),
        },
    ],
};
