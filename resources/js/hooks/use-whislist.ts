import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tokokami_wishlist";
const WISHLIST_EVENT = "tokokami:wishlist-updated";

function readWishlist(): number[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.map(Number).filter((id) => !Number.isNaN(id))
            : [];
    } catch {
        return [];
    }
}

function writeWishlist(ids: number[]) {
    if (typeof window === "undefined") return;
    const uniqueIds = Array.from(new Set(ids));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
    window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function useWishlist() {
    const [wishlistIds, setWishlistIds] = useState<number[]>(() => readWishlist());

    useEffect(() => {
        const sync = () => setWishlistIds(readWishlist());

        window.addEventListener(WISHLIST_EVENT, sync);
        window.addEventListener("storage", sync);

        return () => {
            window.removeEventListener(WISHLIST_EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    const isWishlisted = useCallback(
        (productId: number) => wishlistIds.includes(productId),
        [wishlistIds],
    );

    const toggleWishlist = useCallback((productId: number) => {
        const current = readWishlist();
        const exists = current.includes(productId);
        const next = exists
            ? current.filter((id) => id !== productId)
            : [...current, productId];

        writeWishlist(next);
        setWishlistIds(next);
        return !exists; // true jika baru ditambahkan, false jika dihapus
    }, []);

    const removeWishlist = useCallback((productId: number) => {
        const next = readWishlist().filter((id) => id !== productId);
        writeWishlist(next);
        setWishlistIds(next);
    }, []);

    const clearWishlist = useCallback(() => {
        writeWishlist([]);
        setWishlistIds([]);
    }, []);

    return {
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isWishlisted,
        toggleWishlist,
        removeWishlist,
        clearWishlist,
    };
}