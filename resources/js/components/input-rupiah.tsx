import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

// Perluas props agar mewarisi semua atribut bawaan HTML InputElement (seperti id, required, placeholder, dll)
interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
    value: string | number;
    onValueChange: (value: string) => void; // Mengembalikan nilai angka murni ke parent
}

export function InputRupiah({ value, onValueChange, ...props }: CurrencyInputProps) {
    // Fungsi format rupiah untuk tampilan visual
    const formatRupiah = (val: string | number) => {
        if (!val) return "";
        const numbers = String(val).replace(/\D/g, "");
        if (!numbers) return "";
        return new Intl.NumberFormat("id-ID").format(Number(numbers));
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        // Ambil hanya digit angka saja
        const cleanNumber = rawValue.replace(/\D/g, "");
        
        // Kirim angka bersih kembali ke parent component (misal: state form)
        onValueChange(cleanNumber);
    };

    return (
        <InputGroup>
            <InputGroupInput
                type="text"
                value={formatRupiah(value)}
                onChange={handleChange}
                onKeyDown={(e) => {
                    // Opsional: Mencegah karakter seperti 'e', '+', '-', '.'
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                        e.preventDefault();
                    }
                }}
                {...props}
            />
            <InputGroupAddon align='inline-start'>
                Rp.
            </InputGroupAddon>
        </InputGroup>
    );
}