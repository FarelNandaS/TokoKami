import { DataTable } from "@/components/datatable";
import { columns, Stock } from "@/lib/datatable-colums/stock-management";
import { stockManagement } from "@/routes";
import { Head } from "@inertiajs/react";

export default function StockManagement({ data }: { data: Stock[] }) {
    return (
        <>
            <Head title="Stock Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable data={data} columns={columns} />
            </div>
        </>
    );
}

StockManagement.layout = {
    breadcrumbs: [
        {
            title: "Stock Management",
            herf: stockManagement(),
        },
    ],
};
