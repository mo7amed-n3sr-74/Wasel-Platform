import { Link } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";

interface Shipment {
	id: string;
	shipmentId: string;
	price: number;
	status: "جاهز" | "مكتمل" | "قيد المراجعة" | "ملغى";
	date: string;
	fromLocation: string;
	toLocation: string;
}

function ProfileShipments() {
	const shipments: Shipment[] = [
		{
			id: "1",
			shipmentId: "14-W",
			price: 20000,
			status: "جاهز",
			date: "10 أبريل 2026",
			fromLocation: "القاهرة",
			toLocation: "جدة",
		},
		{
			id: "2",
			shipmentId: "15-W",
			price: 0,
			status: "مكتمل",
			date: "11 أبريل 2026",
			fromLocation: "الإسكندرية",
			toLocation: "القاهرة",
		},
		{
			id: "3",
			shipmentId: "18-W",
			price: 12000,
			status: "مكتمل",
			date: "14 أبريل 2026",
			fromLocation: "القاهرة",
			toLocation: "أسوان",
		},
		{
			id: "4",
			shipmentId: "16-W",
			price: 7000,
			status: "مكتمل",
			date: "11 أبريل 2026",
			fromLocation: "بورسعيد",
			toLocation: "القاهرة",
		},
	];

	const getStatusStyles = (status: string) => {
		switch (status) {
			case "جاهز":
				return "bg-blue-100 text-blue-700";
			case "مكتمل":
				return "bg-green-100 text-green-700";
			case "قيد المراجعة":
				return "bg-yellow-100 text-yellow-700";
			case "ملغى":
				return "bg-red-100 text-red-700";
			default:
				return "bg-(--background) text-(--secondary-text)";
		}
	};

	const formatCurrency = (amount: number) => {
		if (amount === 0) return "ر.ص 0.0++";
		return `ر.ص ${amount.toLocaleString("ar-SA")}`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h2 className="text-3xl font-semibold text-(--main-text)">
					الشحنات
				</h2>
				<Link to="/newShipment">
					<button className="inline-flex items-center justify-center gap-2 rounded-full bg-(--primary-color) px-6 py-3 font-semibold text-(--secondary-color) transition duration-300 hover:opacity-90">
						<Plus className="w-5 h-5" />
						إضافة شحنة +
					</button>
				</Link>
			</div>

			{/* Shipments List */}
			<div className="space-y-4">
				{shipments.map((shipment, index) => (
					<Link
						key={shipment.id}
						to={`/shipments/${shipment.shipmentId}`}
						className="block"
					>
						<div className="rounded-[24px] border border-(--border-color) bg-(--secondary-color) p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-(--primary-color)/30 cursor-pointer">
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{/* Left: ID and Price */}
								<div className="flex flex-col justify-between gap-3">
									<div>
										<p className="text-xs text-(--secondary-text) mb-1">
											رقم الشحنة
										</p>
										<p className="text-2xl font-bold text-(--primary-color)">
											{
												shipment.shipmentId
											}
										</p>
									</div>
									<p className="text-lg font-semibold text-(--main-text)">
										{formatCurrency(
											shipment.price,
										)}
									</p>
								</div>

								{/* Middle: Status and Date */}
								<div className="flex flex-col justify-between gap-3 lg:justify-start">
									<div className="flex items-center gap-3">
										<span
											className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyles(
												shipment.status,
											)}`}
										>
											{
												shipment.status
											}
										</span>
									</div>
									<p className="text-xs text-(--secondary-text)">
										{shipment.date}
									</p>
								</div>

								{/* Right: Location Info */}
								<div className="flex flex-col justify-between gap-3 md:col-span-2 lg:col-span-1 lg:text-right">
									<div className="flex items-center gap-2 lg:justify-end">
										<span className="text-(--main-text) font-medium">
											{
												shipment.toLocation
											}
										</span>
										<span className="text-(--secondary-text)">
											←
										</span>
										<span className="text-(--main-text) font-medium">
											{
												shipment.fromLocation
											}
										</span>
									</div>
									<div className="flex items-center gap-2 text-(--secondary-text) lg:justify-end">
										<MapPin className="w-4 h-4 flex-shrink-0" />
										<span className="text-xs">
											{
												shipment.fromLocation
											}{" "}
											←{" "}
											{
												shipment.toLocation
											}
										</span>
									</div>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>

			{shipments.length === 0 && (
				<div className="rounded-[24px] border-2 border-dashed border-(--border-color) bg-(--background) p-12 text-center">
					<p className="text-(--secondary-text) mb-4">
						لا توجد شحنات حالياً
					</p>
					<Link to="/newShipment">
						<button className="inline-flex items-center gap-2 rounded-full bg-(--primary-color) px-6 py-3 font-semibold text-(--secondary-color) transition hover:opacity-90">
							<Plus className="w-5 h-5" />
							إنشاء شحنة جديدة
						</button>
					</Link>
				</div>
			)}
		</div>
	);
}

export default ProfileShipments;
