import { DataTable } from "@/components/datatable";
import { Button } from "@/components/ui/button";
import { columns, Order } from "@/lib/datatable-colums/order-management";
import { orderManagement } from "@/routes";
import { Head } from "@inertiajs/react";
import { useMemo, useState } from "react";

interface OrderManagementProps {
    orders: Order[];
}

const STATUS_TABS = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Dikonfirmasi" },
    { key: "processing", label: "Dikemas" },
    { key: "shipped", label: "Dikirim" },
    { key: "delivered", label: "Selesai" },
    { key: "cancelled", label: "Dibatalkan" },
];

export default function OrderManagement({ orders = [] }: OrderManagementProps) {
    const [statusFilter, setStatusFilter] = useState("all");
    const filteredOrders = useMemo(() => {
        if (statusFilter !== 'all') {
            return orders.filter((order) => order.order_status === statusFilter);
        }

        return orders;
    }, [statusFilter, orders]);

    const handleStatusTabChange = (nextStatus: string) => {
        setStatusFilter(nextStatus);
    };

    const statusToolbar = (
        <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => (
                <Button
                    key={tab.key}
                    type="button"
                    size="sm"
                    variant={statusFilter === tab.key ? "default" : "outline"}
                    className="rounded-full text-xs h-8 cursor-pointer"
                    onClick={() => handleStatusTabChange(tab.key)}
                >
                    {tab.label}
                </Button>
            ))}
        </div>
    );

    return (
        <>
            <Head title="Order Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    canFilter={true}
                    filterWhat="order_code"
                    sideElement={statusToolbar}
                />
            </div>
        </>
    )
}

OrderManagement.layout = {
    breadcrumbs: [
        {
            title: "Order Management",
            href: orderManagement(),
        },
    ],
};
