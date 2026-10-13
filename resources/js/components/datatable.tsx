"use client";

import {
    useTable,
    type ColumnDef,
    type RowData,
    type ColumnFiltersState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { features, type DataTableFeatures } from "@/lib/data-table-features";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ReactNode, useState } from "react";

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[];
    data: TData[];
    canFilter?: boolean;
    filterWhat?: string | null;
    sideElement?: ReactNode;
    handleDelete?: (id: number) => void;
}

export function DataTable<TData extends RowData>({
    columns,
    data,
    canFilter = false,
    filterWhat = null,
    sideElement,
}: DataTableProps<TData>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useTable({
        features,
        data,
        columns,
        onColumnFiltersChange: setColumnFilters,
        state: {
            columnFilters,
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                {canFilter && filterWhat ? (
                    <Input
                        placeholder={"Filter " + filterWhat + "..."}
                        value={
                            (table
                                .getColumn(filterWhat)
                                ?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) =>
                            table
                                .getColumn(filterWhat)
                                ?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                ) : null}
                {sideElement}
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <table.FlexRender
                                                    header={header}
                                                />
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
