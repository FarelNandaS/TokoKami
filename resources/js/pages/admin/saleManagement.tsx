import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { createSale, saleManagement } from "@/routes";
import { DataTable } from "@/components/datatable";
import { columns } from "@/lib/datatable-colums/sale-management";
import { product, productVariant } from "@/lib/datatable-colums/product-management";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InputRupiah } from "@/components/input-rupiah";

interface ProductSale {
    id: number;
    product_id: number;
    product_variant_id?: number | null;
    sale_price: number;
    discount_percentage?: number | null;
    start_sale: string;
    end_sale: string;
    product: product;
    variant?: productVariant | null;
}

interface Props {
    saleProducts: ProductSale[];
    products: product[];
}

export default function SaleManagement({ saleProducts, products }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const {
        data: formData,
        setData,
        post,
        processing,
        reset,
        clearErrors,
        errors,
    } = useForm({
        product_id: "",
        variant_scope: "single" as "single" | "all",
        product_variant_id: "",
        discount_mode: "nominal" as "nominal" | "percentage",
        sale_price: "",
        discount_percentage: "",
        start_sale: "",
        end_sale: "",
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            reset();
            clearErrors();
        }
    };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(createSale().url, {
          onSuccess: () => {
            reset();
            clearErrors();
            setIsOpen(false);
          },
        });
      };

    const selectedProduct = products.find(
        (p) => String(p.id) === formData.product_id,
    );

    const hasVariants =
        selectedProduct?.variants && selectedProduct.variants.length > 0;

    const selectedVariant = selectedProduct?.variants?.find(
        (v) => String(v.id) === formData.product_variant_id,
    );

    const referenceNormalPrice =
        selectedVariant?.price ?? selectedProduct?.price ?? 0;

    const variantPrices =
        selectedProduct?.variants?.map(
            (v) => v.price ?? selectedProduct.price ?? 0,
        ) ?? [];

    const minVariantPrice =
        variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
    const maxVariantPrice =
        variantPrices.length > 0 ? Math.max(...variantPrices) : 0;

    const discountPercentValue = Number(formData.discount_percentage);
    const hasValidPercent =
        formData.discount_mode === "percentage" &&
        !Number.isNaN(discountPercentValue) &&
        discountPercentValue > 0 &&
        discountPercentValue <= 100;

    const calcDiscounted = (normal: number) =>
        Math.round(normal - normal * (discountPercentValue / 100));

    const previewDiscountedPrice =
        hasValidPercent && referenceNormalPrice > 0
            ? calcDiscounted(referenceNormalPrice)
            : null;

    const minPreviewSalePrice =
        hasValidPercent && minVariantPrice > 0
            ? calcDiscounted(minVariantPrice)
            : null;

    const maxPreviewSalePrice =
        hasValidPercent && maxVariantPrice > 0
            ? calcDiscounted(maxVariantPrice)
            : null;

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title="Manajemen Diskon Produk - Admin TokoKami" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={saleProducts}
                    canFilter
                    filterWhat="name"
                    sideElement={
                        <Modal
                            title="Create Sale"
                            open={isOpen}
                            onOpenChange={handleOpenChange}
                            btnTrigger={
                                <Button className="cursor-pointer">
                                    Add Sale
                                </Button>
                            }
                        >
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field className="gap-2">
                                        <FieldLabel
                                            className="gap-0"
                                            htmlFor="product_id"
                                        >
                                            Product{" "}
                                            <span className="text-destructive text-lg">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Select
                                            value={formData.product_id}
                                            onValueChange={(val) => {
                                                setData("product_id", val);
                                                setData(
                                                    "product_variant_id",
                                                    "",
                                                );
                                                setData(
                                                    "variant_scope",
                                                    "single",
                                                );
                                                setData(
                                                    "discount_mode",
                                                    "nominal",
                                                );
                                                setData(
                                                    "discount_percentage",
                                                    "",
                                                );
                                                setData("sale_price", "");
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="-- Pilih Product --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem
                                                        key={product.id}
                                                        value={String(
                                                            product.id,
                                                        )}
                                                    >
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.product_id && (
                                            <span className="text-xs text-destructive">
                                                {errors.product_id}
                                            </span>
                                        )}
                                    </Field>

                                    {selectedProduct && hasVariants && (
                                        <Field className="gap-1.5">
                                            <FieldLabel className="gap-0">
                                                Target Varian
                                            </FieldLabel>
                                            <RadioGroup
                                                value={formData.variant_scope}
                                                onValueChange={(val) => {
                                                    const scope = val as
                                                        | "single"
                                                        | "all";
                                                    setData(
                                                        "variant_scope",
                                                        scope,
                                                    );
                                                    setData(
                                                        "discount_mode",
                                                        "nominal",
                                                    );
                                                    setData("sale_price", "");
                                                    setData(
                                                        "discount_percentage",
                                                        "",
                                                    );
                                                    if (scope === "all") {
                                                        setData(
                                                            "product_variant_id",
                                                            "",
                                                        );
                                                    }
                                                }}
                                                className="flex gap-5 pt-0.5"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem
                                                        value="single"
                                                        id="scope_single"
                                                    />
                                                    <FieldLabel
                                                        htmlFor="scope_single"
                                                        className="font-normal cursor-pointer"
                                                    >
                                                        Satu Varian
                                                    </FieldLabel>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <RadioGroupItem
                                                        value="all"
                                                        id="scope_all"
                                                    />
                                                    <FieldLabel
                                                        htmlFor="scope_all"
                                                        className="font-normal cursor-pointer"
                                                    >
                                                        Semua Varian
                                                    </FieldLabel>
                                                </div>
                                            </RadioGroup>
                                        </Field>
                                    )}

                                    {hasVariants &&
                                        formData.variant_scope === "single" && (
                                            <Field className="gap-1.5">
                                                <FieldLabel
                                                    className="gap-0"
                                                    htmlFor="product_variant_id"
                                                >
                                                    Varian{" "}
                                                    <span className="text-destructive text-lg">
                                                        *
                                                    </span>
                                                </FieldLabel>
                                                <Select
                                                    value={
                                                        formData.product_variant_id
                                                    }
                                                    onValueChange={(val) =>
                                                        setData(
                                                            "product_variant_id",
                                                            val,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="-- Pilih Varian --" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedProduct?.variants?.map(
                                                            (variant) => {
                                                                const combination =
                                                                    variant.attribute_values
                                                                        ?.map(
                                                                            (
                                                                                av,
                                                                            ) =>
                                                                                av.value,
                                                                        )
                                                                        .join(
                                                                            " / ",
                                                                        );
                                                                return (
                                                                    <SelectItem
                                                                        key={
                                                                            variant.id
                                                                        }
                                                                        value={String(
                                                                            variant.id,
                                                                        )}
                                                                    >
                                                                        {combination ||
                                                                            variant.sku}{" "}
                                                                    </SelectItem>
                                                                );
                                                            },
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.product_variant_id && (
                                                    <span className="text-xs text-destructive">
                                                        {
                                                            errors.product_variant_id
                                                        }
                                                    </span>
                                                )}
                                            </Field>
                                        )}

                                    {selectedProduct &&
                                        hasVariants &&
                                        formData.variant_scope === "all" && (
                                            <p className="text-xs text-muted-foreground">
                                                Rentang harga varian:{" "}
                                                <span className="font-semibold text-foreground">
                                                    {minVariantPrice ===
                                                    maxVariantPrice
                                                        ? formatRupiah(
                                                              minVariantPrice,
                                                          )
                                                        : `${formatRupiah(minVariantPrice)} – ${formatRupiah(maxVariantPrice)}`}
                                                </span>
                                                {formData.discount_mode ===
                                                    "nominal" && (
                                                    <span className="block text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                                                        Maksimal potongan aman
                                                        agar tidak minus:{" "}
                                                        {formatRupiah(
                                                            minVariantPrice,
                                                        )}
                                                    </span>
                                                )}
                                            </p>
                                        )}

                                    {selectedProduct &&
                                        (!hasVariants || selectedVariant) && (
                                            <p className="text-xs text-muted-foreground">
                                                Harga Normal:{" "}
                                                <span className="font-semibold text-foreground">
                                                    {formatRupiah(
                                                        referenceNormalPrice,
                                                    )}
                                                </span>
                                            </p>
                                        )}

                                    {(selectedProduct && !hasVariants) ||
                                    (selectedProduct &&
                                        hasVariants &&
                                        (selectedVariant ||
                                            formData.variant_scope ===
                                                "all")) ? (
                                        <>
                                            <Field className="gap-1.5">
                                                <FieldLabel className="gap-0">
                                                    Tipe Diskon
                                                </FieldLabel>
                                                <RadioGroup
                                                    value={
                                                        formData.discount_mode
                                                    }
                                                    onValueChange={(val) => {
                                                        setData(
                                                            "discount_mode",
                                                            val as
                                                                | "nominal"
                                                                | "percentage",
                                                        );
                                                        if (val === "nominal") {
                                                            setData(
                                                                "discount_percentage",
                                                                "",
                                                            );
                                                        } else {
                                                            setData(
                                                                "sale_price",
                                                                "",
                                                            );
                                                        }
                                                    }}
                                                    className="flex gap-5 pt-0.5"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="nominal"
                                                            id="mode_nominal"
                                                        />
                                                        <FieldLabel
                                                            htmlFor="mode_nominal"
                                                            className="font-normal cursor-pointer"
                                                        >
                                                            Harga Diskon (Rp)
                                                        </FieldLabel>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem
                                                            value="percentage"
                                                            id="mode_percentage"
                                                        />
                                                        <FieldLabel
                                                            htmlFor="mode_percentage"
                                                            className="font-normal cursor-pointer"
                                                        >
                                                            Persentase (%)
                                                        </FieldLabel>
                                                    </div>
                                                </RadioGroup>
                                            </Field>

                                            {formData.discount_mode ===
                                            "percentage" ? (
                                                <Field className="gap-1.5">
                                                    <FieldLabel
                                                        className="gap-0"
                                                        htmlFor="discount_percentage"
                                                    >
                                                        Diskon (%){" "}
                                                        <span className="text-destructive text-lg">
                                                            *
                                                        </span>
                                                    </FieldLabel>
                                                    <Input
                                                        id="discount_percentage"
                                                        type="number"
                                                        min={1}
                                                        max={100}
                                                        step="any"
                                                        placeholder="Contoh: 20"
                                                        value={
                                                            formData.discount_percentage
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "discount_percentage",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    {hasValidPercent && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Estimasi harga sale:{" "}
                                                            {hasVariants &&
                                                            formData.variant_scope ===
                                                                "all" ? (
                                                                minPreviewSalePrice !==
                                                                    null &&
                                                                maxPreviewSalePrice !==
                                                                    null ? (
                                                                    <span className="font-semibold text-primary">
                                                                        {minPreviewSalePrice ===
                                                                        maxPreviewSalePrice
                                                                            ? formatRupiah(
                                                                                  minPreviewSalePrice,
                                                                              )
                                                                            : `${formatRupiah(minPreviewSalePrice)} – ${formatRupiah(maxPreviewSalePrice)}`}
                                                                    </span>
                                                                ) : null
                                                            ) : (
                                                                previewDiscountedPrice !==
                                                                    null && (
                                                                    <span className="font-semibold text-primary">
                                                                        {formatRupiah(
                                                                            previewDiscountedPrice,
                                                                        )}
                                                                    </span>
                                                                )
                                                            )}
                                                        </p>
                                                    )}
                                                    {errors.discount_percentage && (
                                                        <span className="text-xs text-destructive">
                                                            {
                                                                errors.discount_percentage
                                                            }
                                                        </span>
                                                    )}
                                                </Field>
                                            ) : (
                                                <Field className="gap-1.5">
                                                    <FieldLabel
                                                        className="gap-0"
                                                        htmlFor="sale_price"
                                                    >
                                                        Harga Diskon (Rp){" "}
                                                        <span className="text-destructive text-lg">
                                                            *
                                                        </span>
                                                    </FieldLabel>
                                                    <InputRupiah
                                                        id="sale_price"
                                                        min={0}
                                                        placeholder="Contoh: 150.000"
                                                        value={
                                                            formData.sale_price
                                                        }
                                                        onValueChange={(val) =>
                                                            setData(
                                                                "sale_price",
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    {errors.sale_price && (
                                                        <span className="text-xs text-destructive">
                                                            {errors.sale_price}
                                                        </span>
                                                    )}
                                                </Field>
                                            )}
                                        </>
                                    ) : null}

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Field className="gap-2">
                                            <FieldLabel className="text-xs gap-0">
                                                Mulai Diskon
                                                <span className="text-destructive text-lg">
                                                    *
                                                </span>
                                            </FieldLabel>
                                            <Input
                                                type="datetime-local"
                                                value={formData.start_sale}
                                                onChange={(e) =>
                                                    setData(
                                                        "start_sale",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field className="gap-2">
                                            <FieldLabel className="text-xs gap-0">
                                                Berakhir Diskon
                                                <span className="text-destructive text-lg">
                                                    *
                                                </span>
                                            </FieldLabel>
                                            <Input
                                                type="datetime-local"
                                                value={formData.end_sale}
                                                onChange={(e) =>
                                                    setData(
                                                        "end_sale",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="cursor-pointer"
                                        >
                                            Create
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

SaleManagement.layout = {
    breadcrumbs: [
        {
            title: "Sale Management",
            href: saleManagement(),
        },
    ],
};
