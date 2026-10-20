import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { dashboard } from "@/routes";

export default function Forbidden() {
    return (
        <>
            <Head title="403" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
                <div className="flex max-w-md flex-col items-center gap-4">
                    {/* Icon Peringatan */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm">
                        <ShieldAlert className="h-8 w-8" />
                    </div>

                    {/* Kode & Judul */}
                    <div className="space-y-1">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Error 403
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Forbidden
                        </h1>
                    </div>

                    {/* Deskripsi */}
                    <p className="text-sm text-muted-foreground">
                        Maaf, kamu tidak memiliki izin yang cukup untuk melihat halaman atau melakukan tindakan ini.
                    </p>

                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-2 mt-4">
                        <Button asChild variant="default" className="cursor-pointer">
                            <Link href={dashboard()}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}