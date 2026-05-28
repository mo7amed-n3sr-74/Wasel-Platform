import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	isLoading?: boolean;
}

function DeleteConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	isLoading = false,
}: DeleteConfirmationDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-sm" dir="rtl">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-0">
						<div className="bg-red-100 rounded-full p-3">
							<AlertCircle className="w-6 h-6 text-red-600" />
						</div>
						<DialogTitle className="text-lg">
							{title}
						</DialogTitle>
					</div>
				</DialogHeader>

				<DialogDescription className="text-base mb-2">
					{description}
				</DialogDescription>

				<DialogFooter className="gap-1">
					<Button
						size="lg"
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
					>
						إلغاء
					</Button>
					<Button
						size="lg"
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading
							? "جاري الحذف..."
							: "تأكيد الحذف"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DeleteConfirmationDialog;
