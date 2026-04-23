import { useShipments } from "@/api/hooks/shipments/useShipments";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Shipment } from "@/shared/interfaces/Interfaces";
import { PiEye, PiMapPin } from "react-icons/pi";
import { Link } from "react-router-dom";

const getStatusBadgeColor = (
	status: "PENDING" | "IN_PROGRESS" | "IN_TRANSIT" | "DELAYED" | "DELIVERED" | "CANCELLED" | undefined,
): {
	bg: string;
	text: string;
	label: string;
} => {
	switch (status) {
		case "PENDING":
			return {
				bg: "bg-yellow-500/10",
				text: "text-yellow-700",
				label: "قيد الانتظار",
			};
		case "IN_PROGRESS":
			return {
				bg: "bg-blue-500/10",
				text: "text-blue-700",
				label: "قيد التنفيذ",
			};
		case "DELIVERED":
			return {
				bg: "bg-green-500/10",
				text: "text-green-700",
				label: "تم التسليم",
			};
		default:
			return { bg: "", text: "", label: "" };
	}
};

function ActiveShipments() {

	const { data } = useShipments();
	const shipments: Shipment[] | [] = data?.data.shipments || [];
	console.log(shipments)

	return (
		<div className="w-full h-full flex flex-col bg-(--secondary-color) rounded-20 p-6 border border-(--tertiary-color)/20">
			<div className="flex items-center justify-between mb-6">
				<h2 className="font-main text-xl font-bold text-(--primary-text)">
					الشحنات النشطة
				</h2>
				<span className="text-sm font-main text-(--tertiary-color)">
					{shipments.length} شحنة
				</span>
			</div>

			{shipments.length === 0 ? (
				<div className="py-12 flex flex-col items-center justify-center">
					<div className="w-16 h-16 rounded-full bg-(--primary-color)/10 flex items-center justify-center mb-4">
						<PiMapPin className="text-3xl text-(--primary-color)" />
					</div>
					<p className="font-main text-(--tertiary-color) text-center">
						لا توجد شحنات نشطة حالياً
					</p>
				</div>
			) : (
				<div className="min-h-46 overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="border-b border-(--tertiary-color)/20 hover:bg-transparent">
								<TableHead className="font-main font-bold text-(--primary-text)">
									رقم الشحنة
								</TableHead>
								<TableHead className="font-main font-bold text-(--primary-text)">
									المسار
								</TableHead>
								<TableHead className="font-main font-bold text-(--primary-text)">
									الحالة
								</TableHead>
								<TableHead className="font-main font-bold text-(--primary-text) text-center">
									العروض
								</TableHead>
								<TableHead className="font-main font-bold text-(--primary-text) text-right">
									أفضل سعر
								</TableHead>
								<TableHead className="font-main font-bold text-(--primary-text) text-right">
									وقت الحمولة
								</TableHead>
								<TableHead className="font-main font-bold text-(--primary-text) text-right">
									الإجراءات
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{shipments.map((shipment) => {
								const statusColor =
									getStatusBadgeColor(
										shipment.status,
									);
								return (
									<TableRow
										key={shipment.id}
										className="border-b border-(--tertiary-color)/10 hover:bg-(--primary-color)/5 transition-colors"
									>
										<TableCell className="font-main font-medium text-(--primary-text)">
											{shipment.shipmentId}
										</TableCell>
										<TableCell className="font-main text-(--secondary-text)">
											<div className="flex items-center gap-2">
												<span>
													{
														shipment.origin.split("-")[0]
													}
												</span>
												<span className="text-(--tertiary-color)">
													←
												</span>
												<span>
													{
														shipment.destination.split("-")[0]
													}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span
												className={`font-main text-sm px-3 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
											>
												{
													statusColor.label
												}
											</span>
										</TableCell>
										<TableCell className="text-center font-main text-(--primary-text) font-medium">
											{
												shipment.offerCount || 0
											}
										</TableCell>
										<TableCell className="text-right font-main font-bold text-(--primary-color)">
											{
												shipment.suggestedBudget
											}{" "}
											ر.س
										</TableCell>
										<TableCell className="text-right font-main font-bold text-(--primary-color)">
											{
												shipment.ETA
											}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex items-center justify-start gap-2">
												<Link to={{ pathname: `/dashboard/shipments/${shipment.id}` }}>
													<Button
														size="sm"
														variant="outline"
														className="h-9 px-3 rounded-8"
													>
														<PiEye className="text-lg" />
													</Button>
												</Link>
												<Button
													size="sm"
													className="h-9 px-3 rounded-8"
												>
													<PiMapPin className="text-lg" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			)}

			<div className="flex items-center justify-center pt-4">
				<Link to={{ pathname: "/dashboard/shipments" }}>
					<Button variant="outline" className="h-11 text-base">
						عرض جميع الشحنات
					</Button>
				</Link>
			</div>
		</div>
	);
}

export default ActiveShipments;
