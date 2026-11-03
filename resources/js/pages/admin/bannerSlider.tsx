import { DataTable } from "@/components/datatable";
import { InputFile } from "@/components/input-file";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Banner, columns } from "@/lib/datatable-colums/banner-slider";
import { bannerSlider, createBanner } from "@/routes";
import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function BannerSlider({ data }: { data: Banner[] }) {
    const [isOpen, setIsOpen] = useState(false);

    const {
        data: formData,
        setData,
        post,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        banner: [] as File[],
        title: "",
        subtitle: "",
        link_url: "",
        order: 0,
        is_active: true,
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(createBanner().url, {
            preserveScroll: false,
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
            onError: (error) => {
                console.error('Gagal membuat banner baru: ', error);
                toast.error('Gagal membuat banner baru!');
            }
        })
    }

    return (
        <>
            <Head title="Banner Slider" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    data={data}
                    columns={columns}
                    canFilter
                    filterWhat="title"
                    sideElement={
                        <Modal
                            btnTrigger={
                                <Button className="cursor-pointer">
                                    Add Banner
                                </Button>
                            }
                            title="Create Banner"
                            open={isOpen}
                            onOpenChange={handleOpenChange}
                        >
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field className="gap-2">
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="banner"
                                        >
                                            Banner
                                            <span className="text-destructive text-lg">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <InputFile
                                            id="banner"
                                            value={formData.banner}
                                            onChange={(files) =>
                                                setData("banner", files)
                                            }
                                            error={errors.banner}
                                            accept="image/png, image/jpg, image/jpeg, image/webp"
                                        />
                                    </Field>
                                    <Field className="gap-2">
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="title"
                                        >
                                            Title
                                        </FieldLabel>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            placeholder="New Product Arrive"
                                            aria-invalid={
                                                errors.title ? true : false
                                            }
                                        />
                                        {errors.title && (
                                            <span className="text-xs text-destructive">
                                                {errors.title}
                                            </span>
                                        )}
                                    </Field>
                                    <Field className="gap-2">
                                        <FieldLabel htmlFor="subtitle">
                                            Subtitle
                                        </FieldLabel>
                                        <Textarea
                                            id="subtitle"
                                            value={formData.subtitle}
                                            onChange={(e) =>
                                                setData(
                                                    "subtitle",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Product baru, baru saja keluar silahkan di checkout..."
                                            aria-invalid={
                                                errors.subtitle ? true : false
                                            }
                                        />
                                        {errors.subtitle && (
                                            <span className="text-xs text-destructive">
                                                {errors.subtitle}
                                            </span>
                                        )}
                                    </Field>
                                    <Field className="gap-2">
                                        <FieldLabel htmlFor="link_url">
                                            Link URL
                                        </FieldLabel>
                                        <Input
                                            id="link_url"
                                            value={formData.link_url}
                                            onChange={(e) =>
                                                setData(
                                                    "link_url",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://tokokami.com/baru-nih"
                                            aria-invalid={
                                                errors.link_url ? true : false
                                            }
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
                                                value={formData.order}
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
                                            <FieldLabel htmlFor="is_active">Publish Status</FieldLabel>
                                            <div className="flex items-center justify-between rounded-lg border p-2.5 shadow-sm bg-muted/20">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-medium">
                                                        {formData.is_active ? "Active" : "Draft / Inactive"}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {formData.is_active
                                                            ? "Tampil di homepage"
                                                            : "Disembunyikan"}
                                                    </span>
                                                </div>
                                                <Switch
                                                    id="is_active"
                                                    checked={formData.is_active}
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

BannerSlider.layout = {
    breadcrumbs: [
        {
            title: "Banner Slider",
            href: bannerSlider(),
        },
    ],
};
