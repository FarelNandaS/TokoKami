"use client";

import { createColumnHelper } from "@tanstack/react-table";

import { type DataTableFeatures } from "@/lib/data-table-features";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Diff } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Stock = {
    id: number;
    name: string;
    stock: number;
};

function AdjustStockModal() {
    return (
        <Modal btnTrigger={
            <Button className="cursor-pointer">
                <Diff />
            </Button>
        }>
            hellow
        </Modal>
    )
}

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Stock>();

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
    columnHelper.accessor('name', {
        header: 'Name',
    }),
    columnHelper.accessor('stock', {
        header: 'Stock',
    }),
    columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) => {
            return (
                <div className="flex flex-col md:flex-row gap-2">
                    <AdjustStockModal />
                </div>
            )
        }
    })
]);
