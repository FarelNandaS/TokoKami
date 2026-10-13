import { Head, useForm } from "@inertiajs/react";
import { adminManagement, createUser, deleteUser } from "@/routes";
import { DataTable } from "@/components/datatable";
import { Admin, columns } from "@/lib/datatable-colums/admin-management";
import { Modal } from "@/components/modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminManagement({ data }: { data: Admin[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(createUser().url, {
            onSuccess: (e) => {
                reset();
                setIsOpen(false);
                setShowPassword(false);
            },
        });
    };

    return (
        <>
            <Head title="Admin Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    canFilter={true}
                    filterWhat="name"
                    sideElement={
                        <Modal
                            btnTrigger={
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                >
                                    Create User
                                </Button>
                            }
                            title="Create Admin"
                            open={isOpen}
                            onOpenChange={setIsOpen}
                        >
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="grid flex-1 gap-2 w-full">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="Budi Santos"
                                    />
                                    {errors.name && (
                                        <span className="text-xs text-destructive">
                                            {errors.name}
                                        </span>
                                    )}
                                </div>
                                <div className="grid flex-1 gap-2 w-full">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="BudiSantos@gmail.com"
                                    />
                                    {errors.email && (
                                        <span className="text-xs text-destructive">
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                                <div className="grid flex-1 gap-2 w-full">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={formData.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="••••••••"
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <span className="text-xs text-destructive">
                                            {errors.password}
                                        </span>
                                    )}
                                </div>
                                <div className="flex w-full justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? "Saving..." : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </Modal>
                    }
                />
            </div>
        </>
    );
}

AdminManagement.layout = {
    breadcrumbs: [
        {
            title: "Admin Management",
            href: adminManagement(),
        },
    ],
};
