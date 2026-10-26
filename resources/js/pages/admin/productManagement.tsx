import { DataTable } from "@/components/datatable";
import { InputFile } from "@/components/input-file";
import { InputRupiah } from "@/components/input-rupiah";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { columns, product } from "@/lib/datatable-colums/product-management";
import { createProduct, productManagement } from "@/routes";
import { Head, useForm } from "@inertiajs/react";
import { Layers, Plus, Trash, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type AttributeCard = {
    id: number;
    name: string;
    values: string;
};

type GeneratedVariant = {
    combination: string;
    sku: string;
    price: number;
};

export default function ProductManagement({ data }: { data: product[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributes, setAttributes] = useState<AttributeCard[]>([]);
    const [variants, setVariants] = useState<GeneratedVariant[]>([]);

    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
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
            setAttributes([]);
            setVariants([]);
        }
    };

    const hanldeAddAttributeCard = () => {
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

        if (validAttrs.length === 0 || formData.name === "") {
            toast.error(
                "Harap isi minimal satu attribut, nilainya, dan juga beri nama product dengan benar!",
            );
            setVariants([]);
            return;
        }

        const attrValueArrays = validAttrs.map((attr) =>
            attr.values
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v !== ""),
        );

        const cartesian = (arr: string[][]): string[][] =>
            arr.reduce<string[][]>((a, b) =>
                a.flatMap((x) => b.map((y) => [...x, y])),
                [[]]
            );

        const combinations = cartesian(attrValueArrays);

        const generated: GeneratedVariant[] = combinations.map((combo) => {
            const combinationName = combo.join(" / ");
            return {
                combination: combinationName,
                sku: `${formData.name ? formData.name.toUpperCase().replace(/\s+/g, '') : 'PROD'}${combo.join().toUpperCase()}`,
                price: Number(formData.price) || 0,
                stock: 0,
            }
        })

        setVariants(generated);
    };

    const handleVariantTableChange = (index: number, field: keyof GeneratedVariant, value: string | number) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value } as GeneratedVariant;
        setVariants(updated);
    }

    const handleSumbit = (e: FormEvent) => {
        e.preventDefault();

        transform((data) => ({
            ...data,
            product_attributes: attributes,
            variants,
        }));

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

                                    <div className="border-t pt-4 mt-2">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                                                    <Layers className="h-4 w-4" /> Atribut & Pilihan Varian
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Buat atribut (misal: Warna, Ukuran) dan pisahkan nilainya dengan koma.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={hanldeAddAttributeCard}
                                                className="cursor-pointer"
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Tambah Atribut
                                            </Button>
                                        </div>

                                        {/* List Card Atribut */}
                                        <div className="space-y-3 mb-4">
                                            {attributes.map((attr) => (
                                                <div key={attr.id} className="border p-3 rounded-lg bg-muted/30 flex gap-3 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-xs font-medium mb-1 block">Nama Atribut</label>
                                                        <Input
                                                            placeholder="Cth: Warna"
                                                            value={attr.name}
                                                            onChange={(e) => handleAttributeChange(attr.id, "name", e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex-[2]">
                                                        <label className="text-xs font-medium mb-1 block">Nilai (Pisahkan dengan koma)</label>
                                                        <Input
                                                            placeholder="Cth: Merah, Biru, Hijau"
                                                            value={attr.values}
                                                            onChange={(e) => handleAttributeChange(attr.id, "values", e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteAttributeCard(attr.id)}
                                                        className="h-8 w-8 p-0 cursor-pointer"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tombol Generate Matriks */}
                                        <Button
                                            type="button"
                                            onClick={handleGenerateVariant}
                                            className="w-full cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs h-9"
                                        >
                                            Generate Tabel Varian Otomatis
                                        </Button>
                                    </div>

                                    {/* --- BAGIAN 2: TABEL MATRIKS HASIL GENERATE --- */}
                                    {variants.length > 0 && (
                                        <div className="border-t pt-4 mt-2">
                                            <h3 className="font-semibold text-sm mb-2">Daftar Kombinasi Varian ({variants.length})</h3>
                                            <div className="border rounded-md overflow-hidden">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-muted text-muted-foreground border-b">
                                                        <tr>
                                                            <th className="p-2">Kombinasi Varian</th>
                                                            <th className="p-2">SKU Unik</th>
                                                            <th className="p-2">Harga (Rp)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {variants.map((v, idx) => (
                                                            <tr key={idx} className="border-b">
                                                                <td className="p-2 font-medium">{v.combination}</td>
                                                                <td className="p-2">
                                                                    <Input
                                                                        value={v.sku}
                                                                        onChange={(e) => handleVariantTableChange(idx, "sku", e.target.value)}
                                                                        className="h-7 text-xs"
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <InputRupiah
                                                                        value={v.price}
                                                                        onValueChange={(value) => handleVariantTableChange(idx, "price", Number(value))}
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
                                        <Button
                                            type="submit"
                                            className="cursor-pointer"
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

ProductManagement.layout = {
    breadcrumbs: [
        {
            title: "Kelola Produk",
            href: productManagement(),
        },
    ],
};
