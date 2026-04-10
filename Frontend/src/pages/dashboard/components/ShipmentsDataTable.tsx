import { useState } from "react";
import type {
	HeaderContext,
	CellContext,
	Row,
	HeaderGroup,
	Cell,
	ColumnDef,
	SortingState as TanstackSortingState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	getSortedRowModel,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Shipment } from "@/shared/interfaces/Interfaces";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { PiCaretLeft, PiCaretRight, PiWarningCircle } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

dayjs.locale("ar");

interface ShipmentsDataTableProps {
	data: Shipment[];
	isLoading: boolean;
}

export function ShipmentsDataTable({
	data,
	isLoading,
}: ShipmentsDataTableProps) {
	const [sorting, setSorting] = useState<TanstackSortingState>([]);
	const { t } = useTranslation();

	const columns: ColumnDef<Shipment>[] = [
		{
			accessorKey: "shipmentId",
			header: ({ column }: HeaderContext<Shipment, unknown>) => (
				<button
					type="button"
					onClick={() =>
						column.toggleSorting(
							column.getIsSorted() === "asc",
						)
					}
					className="font-main font-medium text-(--primary-text) hover:text-(--primary-color)"
				>
					رقم الحمولة
				</button>
			),
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<Link
					to={`/dashboard/shipments/${row.original.id}`}
					className="font-main font-medium text-(--primary-color) hover:text-(--primary-text) underline"
				>
					{row.getValue("shipmentId")}
				</Link>
			),
		},
		{
			accessorKey: "origin",
			header: "الانطلاق",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main text-(--secondary-text)">
					{row.getValue("origin")}
				</span>
			),
		},
		{
			accessorKey: "destination",
			header: "الوصول",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main text-(--secondary-text)">
					{row.getValue("destination")}
				</span>
			),
		},
		{
			accessorKey: "shipmentType",
			header: "نوع الحمولة",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main text-sm text-(--secondary-text) bg-(--tertiary-color)/15 px-2 py-1 rounded-lg">
					{row.getValue("shipmentType")}
				</span>
			),
		},
		{
			accessorKey: "weight",
			header: "الوزن",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main text-(--secondary-text)">
					{row.getValue("weight")} طن
				</span>
			),
		},
		{
			accessorKey: "status",
			header: "الحالة",
			cell: ({ row }: CellContext<Shipment, unknown>) => {
				const status = row.getValue("status");
				const statusColors: Record<string, string> = {
					PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
					ACTIVE: "bg-blue-100 text-blue-800 border-blue-300",
					IN_PROGRESS: "bg-blue-50 text-blue-800 border-blue-300",
					COMPLETED:
						"bg-green-100 text-green-800 border-green-300",
					CANCELLED:
						"bg-red-100 text-red-800 border-red-300",
				};
				const colors =
					statusColors[status as string] ||
					"bg-gray-100 text-gray-800 border-gray-300";
				const statusText: Record<string, string> = {
					PENDING: "قيد الانتظار",
					ACTIVE: "نشط",
					IN_PROGRESS: "قيد الانطلاق",
					COMPLETED: "مكتمل",
					CANCELLED: "ملغى",
				};
				return (
					<span
						className={`font-main text-xs font-medium px-2.5 py-0.5 rounded-lg border ${colors}`}
					>
						{statusText[status as string]}
					</span>
				);
			},
		},
		{
			accessorKey: "pickupAt",
			header: "تاريخ الانطلاق",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main text-sm text-(--secondary-text)">
					{dayjs(row.getValue("pickupAt")).format(
						"DD MMM YYYY",
					)}
				</span>
			),
		},
		{
			accessorKey: "deliveryAt",
			header: "تاريخ الوصول",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main text-sm text-(--secondary-text)">
					{dayjs(row.getValue("deliveryAt")).format(
						"DD MMM YYYY",
					)}
				</span>
			),
		},
		{
			accessorKey: "offerCount",
			header: "العروض",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main font-medium text-(--primary-color)">
					{row.getValue("offerCount")}
				</span>
			),
		},
		{
			accessorKey: "distance",
			header: "المسافة",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main font-medium text-(--primary-color)">
					{row.getValue("distance")}
				</span>
			),
		},
		{
			accessorKey: "ETA",
			header: "الوقت",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main font-medium text-(--primary-color)">
					{row.getValue("ETA")}
				</span>
			),
		},	
		{
			accessorKey: "suggestedBudget",
			header: "الميزانية",
			cell: ({ row }: CellContext<Shipment, unknown>) => (
				<span className="font-main font-medium text-(--primary-color)">
					{row.getValue("suggestedBudget") ? row.getValue("suggestedBudget") + " ج.م" : "—"}
				</span>
			),
		},
		{
			accessorKey: "urgent",
			header: "عاجل",
			cell: ({ row }: CellContext<Shipment, unknown>) => {
				const isUrgent = row.getValue("urgent");
				return isUrgent ? (
					<PiWarningCircle className="text-lg text-red-500" />
				) : (
					<span className="text-gray-300">—</span>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<div className="w-12 h-12 rounded-full border-4 border-(--tertiary-color) border-t-(--primary-color) animate-spin mx-auto mb-4"></div>
					<p className="font-main text-(--secondary-text)">
						جاري التحميل...
					</p>
				</div>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="flex items-center justify-center w-full h-full">
				<p className="font-main text-2xl text-(--primary-color)">
					لا توجد حمولات
				</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full">
			<div className="h-[calc(100%-56px)] rounded-xl border border-(--tertiary-color) bg-(--secondary-color) overflow-hidden">
				<Table className="h-full">
					<TableHeader className="bg-(--tertiary-color)/10">
						{table
							.getHeaderGroups()
							.map(
								(
									headerGroup: HeaderGroup<Shipment>,
								) => (
									<TableRow
										key={headerGroup.id}
										className="border-b border-(--tertiary-color)/50 hover:bg-transparent"
									>
										{headerGroup.headers.map(
											(
												header: any,
											) => (
												<TableHead
													key={
														header.id
													}
													className="font-main font-semibold text-(--primary-text) px-4 py-3 text-right"
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header
																	.column
																	.columnDef
																	.header,
																header.getContext(),
															)}
												</TableHead>
											),
										)}
									</TableRow>
								),
							)}
					</TableHeader>
					<TableBody>
						{table
							.getRowModel()
							.rows.map((row: Row<Shipment>) => (
								<TableRow
									key={row.id}
									className="border-b border-(--tertiary-color)/30 hover:bg-(--tertiary-color)/5 transition-colors"
								>
									{row
										.getVisibleCells()
										.map(
											(
												cell: Cell<
													Shipment,
													unknown
												>,
											) => (
												<TableCell
													key={
														cell.id
													}
													className="font-main text-(--primary-text) px-4 py-3"
												>
													{flexRender(
														cell
															.column
															.columnDef
															.cell,
														cell.getContext(),
													)}
												</TableCell>
											),
										)}
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between mt-6">
				<div className="text-sm font-main text-(--secondary-text)">
					الصفحة{" "}
					<span className="font-semibold text-(--primary-text)">
						{table.getState().pagination.pageIndex + 1}
					</span>{" "}
					من{" "}
					<span className="font-semibold text-(--primary-text)">
						{table.getPageCount()}
					</span>
					- إجمالي{" "}
					<span className="font-semibold text-(--primary-color)">
						{data.length}
					</span>{" "}
					حمولة
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="font-main text-lg"
					>
						<PiCaretRight className="mr-1" />
						السابق
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="font-main text-lg"
					>
						التالي
						<PiCaretLeft className="ml-1" />
					</Button>
				</div>
			</div>
		</div>
	);
}
