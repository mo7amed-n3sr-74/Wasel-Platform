import { useState } from "react";
import { useDrivers } from "@/api/hooks/drivers/useDrivers";
import DriverCard from "@/pages/dashboard/components/DriverCard";
import AddDriverDialog from "@/pages/dashboard/components/AddDriverDialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { Plus } from "lucide-react";
import { PiUsers, PiClock, PiCheckCircle, PiSteeringWheel, PiPause } from "react-icons/pi";
import DashHeader from "./components/DashHeader";

function DashDrivers() {
	const { data: driversData, isLoading, error } = useDrivers();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const drivers = driversData?.data.drivers || [];
	const meta = driversData?.data.meta || {
		total: 0,
		pending: 0,
		available: 0,
		inWork: 0,
		inRest: 0,
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-screen gap-4">
				<p className="text-red-500 text-lg">
					حدث خطأ أثناء تحميل السائقين
				</p>
				<p className="text-gray-600">
					{(error as Error).message}
				</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full overflow-hidden flex flex-col">
			<DashHeader title="السائقين" />
			{/* Stats Cards */}
			<div className="flex items-stretch gap-4 mb-6">
				<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-(--primary-color) after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
					<div className="flex items-center gap-2">
						<PiUsers className="text-2xl text-(--primary-color)" />
						<h3 className="font-main text-sm text-(--primary-text) font-medium">
							إجمالي
						</h3>
					</div>
					<span className="font-main text-2xl font-extrabold text-(--primary-text)">
						{meta.total}
					</span>
				</div>
				<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-yellow-500 after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
					<div className="flex items-center gap-2">
						<PiClock className="text-2xl text-yellow-500" />
						<h3 className="font-main text-sm text-(--primary-text) font-medium">
							قيد الانتظار
						</h3>
					</div>
					<span className="font-main text-2xl font-extrabold text-yellow-600">
						{meta.pending}
					</span>
				</div>
				<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-green-500 after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
					<div className="flex items-center gap-2">
						<PiCheckCircle className="text-2xl text-green-500" />
						<h3 className="font-main text-sm text-(--primary-text) font-medium">
							متاح
						</h3>
					</div>
					<span className="font-main text-2xl font-extrabold text-green-600">
						{meta.available}
					</span>
				</div>
				<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-blue-500 after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
					<div className="flex items-center gap-2">
						<PiSteeringWheel className="text-2xl text-blue-500" />
						<h3 className="font-main text-sm text-(--primary-text) font-medium">
							في العمل
						</h3>
					</div>
					<span className="font-main text-2xl font-extrabold text-blue-600">
						{meta.inWork}
					</span>
				</div>
				<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-orange-500 after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
					<div className="flex items-center gap-2">
						<PiPause className="text-2xl text-orange-500" />
						<h3 className="font-main text-sm text-(--primary-text) font-medium">
							في الراحة
						</h3>
					</div>
					<span className="font-main text-2xl font-extrabold text-orange-600">
						{meta.inRest}
					</span>
				</div>
			</div>

			{/* Drivers Section */}
			<div className="flex-1 rounded-xl border border-(--tertiary-color)/20 bg-(--secondary-color) overflow-hidden flex flex-col">
				<div className="px-5 py-4 border-b border-(--tertiary-color)/10 flex items-center justify-between">
					<h3 className="font-main font-semibold text-base text-(--primary-text)">
						السائقين
					</h3>
					{drivers.length >= 1 && (
						<Button
							size="sm"
							onClick={() => setIsDialogOpen(true)}
							className="flex items-center gap-1.5 whitespace-nowrap"
						>
							<Plus className="w-4 h-4" />
							إضافة سائق جديد
						</Button>
					)}
				</div>

				{drivers.length === 0 ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-500 text-lg mb-4">
							لا توجد سائقين حالياً
						</p>
						<Button onClick={() => setIsDialogOpen(true)}>
							إضافة أول سائق
						</Button>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto p-4">
						<div className="grid grid-cols-12 gap-4">
							{drivers.map((driver) => (
								<DriverCard
									key={driver.id}
									driver={driver}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Add Driver Dialog */}
			<AddDriverDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>
		</div>
	);
}

export default DashDrivers;
