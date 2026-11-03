"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/lib/data-table-features";
import { toast } from "sonner";
import { router, useForm } from "@inertiajs/react";
import { deleteBanner, editBanner } from "@/routes";
import { ConfirmationAlert } from "@/components/confirmationAlert";
import { Button } from "@/components/ui/button";
import { Pen, Trash } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/components/modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputFile } from "@/components/input-file";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Banner = {
    id: number;
    image_path: string;
    title: string;
    subtitle: string;
    link_url: string;
    order: number;
    is_active: boolean;
};

function EditBannerModal({ banner }: { banner: Banner }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            id: banner.id,
            banner: [] as File[],
            current_banner: banner.image_path || null,
            title: banner.title,
            subtitle: banner.subtitle,
            link_url: banner.link_url,
            order: banner.order,
            is_active: banner.is_active,
        });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            setData({
                id: banner.id,
                banner: [],
                current_banner: banner.image_path || null,
                title: banner.title,
                subtitle: banner.subtitle,
                link_url: banner.link_url,
                order: banner.order,
                is_active: banner.is_active,
            });
        } else {
            reset();
            clearErrors();
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Payload data: ", data);
        post(editBanner().url, {
            preserveScroll: false,
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
            onError: (error) => {
                console.error("Gagal mengupdate data banner: ", error);
                toast.error("Gagal mengupdate data banner!");
            },
        });
    };

    const initialBanner = useMemo(() => {
        if (!banner.image_path) {
            return [];
        }
        return [
            {
                id: banner.id,
                url: `/storage/${banner.image_path}`,
                name: banner.image_path.split("/").pop() || "Banner",
                size: "Saved",
                isImage: true,
            },
        ];
    }, [banner.image_path]);

    const handleRemoveCurrentBanner = (id: number) => {
        setData("current_banner", null);
    };

    return (
        <Modal
            btnTrigger={
                <Button className="cursor-pointer" variant="outline">
                    <Pen />
                </Button>
            }
            title="Edit Banner"
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Field className="gap-2">
                        <FieldLabel className="gap-0" htmlFor="banner">
                            Banner
                            <span className="text-destructive text-lg">*</span>
                        </FieldLabel>
                        <InputFile
                            id="banner"
                            value={data.banner}
                            onChange={(files) => setData("banner", files)}
                            initialFiles={initialBanner}
                            onRemoveExisting={handleRemoveCurrentBanner}
                            error={errors.banner}
                            accept="image/png, image/jpg, image/jpeg, image/webp"
                        />
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel className="gap-0" htmlFor="title">
                            Title
                        </FieldLabel>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            placeholder="New Product Arrive"
                            aria-invalid={errors.title ? true : false}
                        />
                        {errors.title && (
                            <span className="text-xs text-destructive">
                                {errors.title}
                            </span>
                        )}
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="subtitle">Subtitle</FieldLabel>
                        <Textarea
                            id="subtitle"
                            value={data.subtitle}
                            onChange={(e) =>
                                setData("subtitle", e.target.value)
                            }
                            placeholder="Product baru, baru saja keluar silahkan di checkout..."
                            aria-invalid={errors.subtitle ? true : false}
                        />
                        {errors.subtitle && (
                            <span className="text-xs text-destructive">
                                {errors.subtitle}
                            </span>
                        )}
                    </Field>
                    <Field className="gap-2">
                        <FieldLabel htmlFor="link_url">Link URL</FieldLabel>
                        <Input
                            id="link_url"
                            value={data.link_url}
                            onChange={(e) =>
                                setData("link_url", e.target.value)
                            }
                            placeholder="https://tokokami.com/baru-nih"
                            aria-invalid={errors.link_url ? true : false}
                        />
                        {errors.link_url && (
                            <span className="text-xs text-destructive">
                                {errors.link_url}
                            </span>
                        )}
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
                        <Field className="gap-2">
                            <FieldLabel htmlFor="order">Sort Order</FieldLabel>
                            <Input
                                id="order"
                                type="number"
                                min="0"
                                value={data.order}
                                onChange={(e) =>
                                    setData("order", Number(e.target.value))
                                }
                                placeholder="0"
                                aria-invalid={errors.order ? true : false}
                            />
                            <span className="text-[11px] text-muted-foreground">
                                Angka kecil akan tampil lebih awal.
                            </span>
                            {errors.order && (
                                <span className="text-xs text-destructive">
                                    {errors.order}
                                </span>
                            )}
                        </Field>

                        <Field className="gap-2">
                            <FieldLabel htmlFor="is_active">
                                Publish Status
                            </FieldLabel>
                            <div className="flex items-center justify-between rounded-lg border p-2.5 shadow-sm bg-muted/20">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-medium">
                                        {data.is_active
                                            ? "Active"
                                            : "Draft / Inactive"}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {data.is_active
                                            ? "Tampil di homepage"
                                            : "Disembunyikan"}
                                    </span>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData("is_active", checked)
                                    }
                                />
                            </div>
                            {errors.is_active && (
                                <span className="text-xs text-destructive">
                                    {errors.is_active}
                                </span>
                            )}
                        </Field>
                    </div>

                    <div className="flex justify-end">
                        <Button className="cursor-pointer" type="submit">
                            {processing ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </Modal>
    );
}

const handleDelete = (id: number) => {
    toast.info("Deleting banner...");

    router.delete(deleteBanner(), {
        data: { id },
        preserveScroll: false,
        onSuccess: () => {},
        onError: (error) => {
            console.error("Gagal menghapus banner: ", error);
            toast.error("Gagal menghapus banner.");
        },
    });
};

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Banner>();

export const columns = columnHelper.columns([
    columnHelper.display({
        id: "no",
        header: "No",
        cell: ({ row, table }) => {
            return (
                <span className="text-center text-muted-foreground font-medium">
                    {table.getFilteredRowModel().rows.indexOf(row) + 1}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: "image",
        header: "Image",
        cell: ({ row }) => {
            const data = row.original as Banner;

            return (
                <img
                    src={`/storage/${data.image_path}`}
                    alt={data.title || "Banner"}
                    className="w-16 h-12 object-cover rounded-md border shadow-sm"
                />
            );
        },
    }),
    columnHelper.accessor("title", {
        header: "Title",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.title || "-"}</span>
        ),
    }),
    columnHelper.accessor("subtitle", {
        header: "Subtitle",
        cell: ({ row }) => (
            <span className="text-muted-foreground truncate max-w-50 block">
                {row.original.subtitle || "-"}
            </span>
        ),
    }),
    columnHelper.accessor("link_url", {
        header: "Link",
        cell: ({ row }) => {
            const link = row.original.link_url;
            return link ? (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-37.5 block"
                >
                    {link}
                </a>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    }),
    columnHelper.accessor("order", {
        header: "Order",
        cell: ({ row }) => (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                {row.original.order}
            </span>
        ),
    }),
    columnHelper.accessor("is_active", {
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.is_active;

            return (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                >
                    {isActive ? "Active" : "Inactive"}
                </span>
            );
        },
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
            const banner = row.original as Banner;

            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <EditBannerModal banner={banner} />

                    <ConfirmationAlert
                        handle={() => handleDelete(banner.id)}
                        title="Anda Yakin Menghapus Banner Ini?"
                        desc="Tindakan ini tidak dapat dibatalkan. Jika anda melakukan ini data banner yang anda pilih akan terhapus secara permanen."
                    >
                        <Button
                            className="cursor-pointer"
                            variant="destructive"
                        >
                            <Trash />
                        </Button>
                    </ConfirmationAlert>
                </div>
            );
        },
    }),
]);
