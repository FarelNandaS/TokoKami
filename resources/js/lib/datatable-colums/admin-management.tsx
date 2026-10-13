"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/lib/data-table-features";
import { Button } from "@/components/ui/button";
import { KeyRound, Trash } from "lucide-react";
import { ConfirmationAlert } from "@/components/confirmationAlert";
import { router, useForm } from "@inertiajs/react";
import { deleteUser, editPermission } from "@/routes";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { FormEvent, useState } from "react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Admin = {
    id: number;
    name: string;
    email: string;
    permissions: string[];
};

function AdminPermissionModal({ admin }: { admin: Admin }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, put, processing } = useForm({
        id: admin.id,
        permissions: admin.permissions || [],
    });

    const handleCheckboxChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData("permissions", [...data.permissions, permissionName]);
        } else {
            setData(
                "permissions",
                data.permissions.filter((p) => p !== permissionName),
            );
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        put(editPermission().url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
            },
            onError: (error) => {
                console.error("Gagal memperbarui hak akses: ", error);
                toast.error("Gagal memperbarui hak akses.");
            },
        });
    };

    const permissionList = [
        "Product Management",
        "Stock Management",
        "Category Management",
        "Banner Organize",
        "Sale Management",
        "Admin Management",
    ];

    return (
        <Modal
            open={isOpen}
            onOpenChange={setIsOpen}
            btnTrigger={
                <Button variant="outline" className="cursor-pointer">
                    <KeyRound />
                </Button>
            }
            title="User Access"
            desc="Ubah konfigurasi akses keamanan untuk memastikan admin ini hanya dapat mengelola modul dan fitur sesuai dengan tanggung jawabnya."
        >
            <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                    {permissionList.map((permission) => (
                        <Field orientation="horizontal" key={permission}>
                            <Checkbox
                                id={`${admin.id}-${permission}`}
                                checked={data.permissions.includes(permission)}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange(
                                        permission,
                                        checked === true,
                                    )
                                }
                            />
                            <FieldLabel htmlFor={`${admin.id}-${permission}`}>
                                {permission}
                            </FieldLabel>
                        </Field>
                    ))}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </Modal>
    );
}

const handleDelete = (id: number) => {
    router.delete(deleteUser(), {
        data: { id },
        preserveScroll: true,
        onSuccess: () => {
            toast.success(`Berhasil menghapus user`);
        },
        onError: (error) => {
            console.error("Gagal menghapus user:", error);
            toast.error("Gagal menghapus user");
        },
    });
};

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Admin>();

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
    columnHelper.accessor("email", {
        header: "Email",
    }),
    columnHelper.display({
        id: "action",
        header: "Action",
        cell: ({ row }) => {
            const admin = row.original as Admin;
            // console.log('test')
            return (
                <div className="flex gap-2">
                    <AdminPermissionModal admin={admin} />

                    <ConfirmationAlert
                        handle={() => handleDelete(admin.id)}
                        title="Anda Yakin Menghapus User Admin Ini?"
                        desc="Tindakan ini tidak dapat dibatalkan. Menghapus akun admin ini akan menghilangkan seluruh data profil dan hak aksesnya ke panel kontrol."
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
