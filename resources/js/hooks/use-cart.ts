import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tokokami_cart";
const CART_EVENT = "tokokami:cart-updated";

export interface CartStorageItem {
    productId: number;
    variantId?: number | null;
    quantity: number;
}

function readCart(): CartStorageItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((item) => ({
                productId: Number(item?.productId),
                variantId:
                    item?.variantId === null || item?.variantId === undefined
                        ? null
                        : Number(item.variantId),
                quantity: Math.max(1, Number(item?.quantity) || 1),
            }))
            .filter((item) => !Number.isNaN(item.productId) && item.productId > 0);
    } catch {
        return [];
    }
}

function writeCart(items: CartStorageItem[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
}

export function isSameCartItem(
    a: Pick<CartStorageItem, "productId" | "variantId">,
    b: Pick<CartStorageItem, "productId" | "variantId">,
): boolean {
    return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

export function useCart() {
    const [items, setItems] = useState<CartStorageItem[]>(() => readCart());

    useEffect(() => {
        const sync = () => setItems(readCart());

        window.addEventListener(CART_EVENT, sync);
        window.addEventListener("storage", sync);

        return () => {
            window.removeEventListener(CART_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    const addItem = useCallback(
        (
            productId: number,
            quantity = 1,
            variantId: number | null = null,
            maxStock?: number,
        ) => {
            const current = readCart();
            const safeQtyToAdd = Math.max(1, quantity);
            const idx = current.findIndex((item) =>
                isSameCartItem(item, { productId, variantId }),
            );

            let next: CartStorageItem[];
            if (idx >= 0) {
                const combined = current[idx].quantity + safeQtyToAdd;
                const finalQty =
                    typeof maxStock === "number" && maxStock > 0
                        ? Math.min(combined, maxStock)
                        : combined;

                next = current.map((item, i) =>
                    i === idx ? { ...item, quantity: finalQty } : item,
                );
            } else {
                const finalQty =
                    typeof maxStock === "number" && maxStock > 0
                        ? Math.min(safeQtyToAdd, maxStock)
                        : safeQtyToAdd;

                next = [...current, { productId, variantId, quantity: finalQty }];
            }

            writeCart(next);
            setItems(next);
        },
        [],
    );

    const updateQuantity = useCallback(
        (
            productId: number,
            variantId: number | null,
            quantity: number,
            maxStock?: number,
        ) => {
            const current = readCart();
            if (quantity <= 0) {
                const next = current.filter(
                    (item) => !isSameCartItem(item, { productId, variantId }),
                );
                writeCart(next);
                setItems(next);
                return;
            }

            const finalQty =
                typeof maxStock === "number" && maxStock > 0
                    ? Math.min(quantity, maxStock)
                    : quantity;

            const next = current.map((item) =>
                isSameCartItem(item, { productId, variantId })
                    ? { ...item, quantity: finalQty }
                    : item,
            );

            writeCart(next);
            setItems(next);
        },
        [],
    );

    const removeItem = useCallback(
        (productId: number, variantId: number | null = null) => {
            const next = readCart().filter(
                (item) => !isSameCartItem(item, { productId, variantId }),
            );
            writeCart(next);
            setItems(next);
        },
        [],
    );

    const clearCart = useCallback(() => {
        writeCart([]);
        setItems([]);
    }, []);

    const totalQuantity = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items],
    );

    return {
        items,
        totalQuantity,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
    };
}