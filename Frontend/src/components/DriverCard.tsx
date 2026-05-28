import { useState } from "react";
import type { Driver } from "@/shared/interfaces/Interfaces";
import { useDeleteDriver } from "@/api/hooks/drivers/useDeleteDriver";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface DriverCardProps {
	driver: Driver;
	onDelete?: (driverId: string) => void;
}

interface ImageModal {
	src: string;
	alt: string;
}

function DriverCard({ driver, onDelete }: DriverCardProps) {
	const [selectedImage, setSelectedImage] = useState<ImageModal | null>(
		null,
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const { mutate: deleteDriver, isPending: isDeleting } = useDeleteDriver();

	const handleDeleteClick = () => {
		setIsDeleteDialogOpen(true);
	};

	const handleConfirmDelete = () => {
		deleteDriver(driver.id, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				onDelete?.(driver.id);
			},
		});
	};

	return (
		<div className="col-span-6 md:col-span-4 rounded-20 p-4 shadow-lg shadow-black/10 bg-(--secondary-color) border border-gray-200">
			{/* Header with profile and delete button */}
			<TooltipProvider>
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-3 flex-1">
						<img
							src={driver.picture}
							alt={`${driver.first_name} ${driver.last_name}`}
							className="w-16 h-16 rounded-full object-cover"
						/>
						<div className="flex-1">
							<h3 className="text-lg font-semibold">
								{driver.first_name}{" "}
								{driver.last_name}
							</h3>
							<p className="text-sm text-gray-500">
								{driver.driverId}
							</p>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="sm"
									variant="ghost"
									onClick={
										handleDeleteClick
									}
									disabled={isDeleting}
									className="text-red-500 hover:text-red-600 hover:bg-red-50"
								>
									<Trash2 className="w-5 h-5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>حذف السائق</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</TooltipProvider>

			{/* Driver Details */}
			<div className="space-y-2 mb-4 text-sm">
				<div className="flex justify-between">
					<span className="text-gray-600">العمر:</span>
					<span className="font-medium">{driver.age}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-600">الهاتف:</span>
					<span className="font-medium">
						{driver.phone}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-600">رقم الهوية:</span>
					<span className="font-medium">
						{driver.national_id}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-600">الحالة:</span>
					<span
						className={`font-medium px-2 py-1 rounded text-xs ${
							driver.status === "APPROVED"
								? "bg-green-100 text-green-700"
								: driver.status === "REJECTED"
									? "bg-red-100 text-red-700"
									: "bg-yellow-100 text-yellow-700"
						}`}
					>
						{driver.status === "APPROVED"
							? "موافق عليه"
							: driver.status === "REJECTED"
								? "مرفوض"
								: "قيد الانتظار"}
					</span>
				</div>
			</div>

			{/* Document Images */}
			<div className="border-t pt-3">
				<p className="text-sm font-semibold mb-3">المستندات:</p>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					<TooltipProvider>
						{driver.license_front && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center cursor-pointer">
										<img
											src={
												driver.license_front
											}
											alt="رخصة القيادة - الأمام"
											className="w-full h-20 object-cover rounded transition-all duration-300 hover:scale-105 hover:shadow-lg"
											onClick={() =>
												setSelectedImage(
													{
														src: driver.license_front,
														alt: "رخصة القيادة - الأمام",
													},
												)
											}
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>رخصة القيادة - أمام</p>
								</TooltipContent>
							</Tooltip>
						)}
						{driver.license_back && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center cursor-pointer">
										<img
											src={
												driver.license_back
											}
											alt="رخصة القيادة - الخلف"
											className="w-full h-20 object-cover rounded transition-all duration-300 hover:scale-105 hover:shadow-lg"
											onClick={() =>
												setSelectedImage(
													{
														src: driver.license_back,
														alt: "رخصة القيادة - الخلف",
													},
												)
											}
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>رخصة القيادة - خلف</p>
								</TooltipContent>
							</Tooltip>
						)}
						{driver.national_id_card_front && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center cursor-pointer">
										<img
											src={
												driver.national_id_card_front
											}
											alt="بطاقة الهوية - الأمام"
											className="w-full h-20 object-cover rounded transition-all duration-300 hover:scale-105 hover:shadow-lg"
											onClick={() =>
												setSelectedImage(
													{
														src: driver.national_id_card_front,
														alt: "بطاقة الهوية - الأمام",
													},
												)
											}
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>بطاقة الهوية - أمام</p>
								</TooltipContent>
							</Tooltip>
						)}
						{driver.national_id_card_back && (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center cursor-pointer">
										<img
											src={
												driver.national_id_card_back
											}
											alt="بطاقة الهوية - الخلف"
											className="w-full h-20 object-cover rounded transition-all duration-300 hover:scale-105 hover:shadow-lg"
											onClick={() =>
												setSelectedImage(
													{
														src: driver.national_id_card_back,
														alt: "بطاقة الهوية - الخلف",
													},
												)
											}
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>بطاقة الهوية - خلف</p>
								</TooltipContent>
							</Tooltip>
						)}
					</TooltipProvider>
				</div>
			</div>

			{/* Image Preview Modal */}
			<Dialog
				open={!!selectedImage}
				onOpenChange={() => setSelectedImage(null)}
			>
				<DialogContent className="max-w-2xl bg-(--bg-color) border-0">
					{/* <button
						onClick={() => setSelectedImage(null)}
						className="absolute right-4 top-4 text-white hover:bg-white/10 rounded-full p-1 transition-colors"
					>
						<X className="w-6 h-6" />
					</button> */}
					{selectedImage && (
						<div className="flex flex-col items-center justify-center py-4">
							<img
								src={selectedImage.src}
								alt={selectedImage.alt}
								className="max-w-full max-h-[70vh] object-contain rounded"
							/>
							<p className="text-(--primary-text) text-center mt-4">
								{selectedImage.alt}
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
				title="حذف السائق"
				description={`هل أنت متأكد من رغبتك في حذف السائق ${driver.first_name} ${driver.last_name}؟ هذا الإجراء لا يمكن التراجع عنه.`}
				isLoading={isDeleting}
			/>
		</div>
	);
}

export default DriverCard;
