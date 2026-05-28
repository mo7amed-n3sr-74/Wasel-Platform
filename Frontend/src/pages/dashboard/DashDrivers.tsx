import { useState } from "react";
import { useDrivers } from "@/api/hooks/drivers/useDrivers";
import DriverCard from "@/components/DriverCard";
import AddDriverDialog from "@/components/AddDriverDialog";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { Plus } from "lucide-react";
import DashHeader from "./components/DashHeader";

function DashDrivers() {
	const { data: driversData, isLoading, error } = useDrivers();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const drivers = driversData?.data || [];

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
            <DashHeader title="السائقين"/>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				{/* <div>
					<h1 className="text-3xl font-bold">السائقون</h1>
					<p className="text-gray-600 mt-2">
						إدارة السائقين والتحقق من بيانات المستندات
					</p>
				</div> */}
                {drivers.length >= 1 && (
                    <Button
                        size={'lg'}
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-2 text-md"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة سائق جديد
                    </Button>
                ) }
			</div>

			{/* Drivers Grid */}
			{drivers.length === 0 ? (
				<div className="text-center py-16">
					<p className="text-gray-500 text-lg mb-4">
						لا توجد سائقين حالياً
					</p>
					<Button onClick={() => setIsDialogOpen(true)}>
						إضافة أول سائق
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-12 gap-4">
					{drivers.map((driver) => (
						<DriverCard
							key={driver.id}
							driver={driver}
						/>
					))}
				</div>
			)}

			{/* Add Driver Dialog */}
			<AddDriverDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>
		</div>
	);
}

export default DashDrivers;
