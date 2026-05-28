import { useState } from "react";
import { useCreateDriver } from "@/api/hooks/drivers/useCreateDriver";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Loader from "./Loader";
import FileUploadField from "./FileUploadField";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { createDriverSchema } from "@/shared/validation/schemas";

interface AddDriverDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

function AddDriverDialog({ isOpen, onClose }: AddDriverDialogProps) {
	const { mutate: createDriver, isPending } = useCreateDriver();
	const [formData, setFormData] = useState({
		first_name: "",
		last_name: "",
		age: "",
		national_id: "",
		phone: "",
	});

	const [files, setFiles] = useState({
		picture: null as File | null,
		license_front: null as File | null,
		license_back: null as File | null,
		national_id_card_front: null as File | null,
		national_id_card_back: null as File | null,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const { t } = useTranslation();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error for this field when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, files: fileList } = e.target;
		if (fileList && fileList[0]) {
			setFiles((prev) => ({
				...prev,
				[name]: fileList[0],
			}));
			// Clear error for this field when file is selected
			if (errors[name]) {
				setErrors((prev) => ({
					...prev,
					[name]: "",
				}));
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Prepare data for validation
		const dataToValidate = {
			...formData,
			picture: files.picture,
			license_front: files.license_front,
			license_back: files.license_back,
			national_id_card_front: files.national_id_card_front,
			national_id_card_back: files.national_id_card_back,
		};

		try {
			// Validate using Yup schema
			await createDriverSchema.validate(dataToValidate, { abortEarly: false });

			// Create FormData for multipart request
			const formDataToSend = new FormData();
			formDataToSend.append("first_name", formData.first_name);
			formDataToSend.append("last_name", formData.last_name);
			formDataToSend.append("age", formData.age);
			formDataToSend.append("national_id", formData.national_id);
			formDataToSend.append("phone", formData.phone);
			formDataToSend.append("picture", files.picture!);
			formDataToSend.append("license_front", files.license_front!);
			formDataToSend.append("license_back", files.license_back!);
			formDataToSend.append(
				"national_id_card_front",
				files.national_id_card_front!,
			);
			formDataToSend.append(
				"national_id_card_back",
				files.national_id_card_back!,
			);

			createDriver(formDataToSend, {
				onSuccess: () => {
					resetForm();
					onClose();
				},
			});
		} catch (error: any) {
			// Handle validation errors
			if (error.inner && Array.isArray(error.inner)) {
				const formErrors: Record<string, string> = {};
				error.inner.forEach((err: any) => {
					formErrors[err.path] = err.message;
				});
				setErrors(formErrors);
				
				// Show first error as toast
				const firstErrorMessage = Object.values(formErrors)[0];
				if (firstErrorMessage) {
					toast.error(firstErrorMessage);
				}
			} else {
				toast.error(t("حدث خطأ أثناء التحقق من البيانات"));
			}
		}
	};

	const resetForm = () => {
		setFormData({
			first_name: "",
			last_name: "",
			age: "",
			national_id: "",
			phone: "",
		});
		setFiles({
			picture: null,
			license_front: null,
			license_back: null,
			national_id_card_front: null,
			national_id_card_back: null,
		});
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="max-h-[90vh] overflow-y-auto max-w-2xl text-right"
                dir="rtl"
            >
				<DialogHeader>
					<DialogTitle>إضافة سائق جديد</DialogTitle>
					<DialogDescription>
						يرجى ملء جميع الحقول والمستندات المطلوبة
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Personal Information */}
					<div className="space-y-4">
						<h3 className="font-semibold">
							المعلومات الشخصية
						</h3>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium mb-2 block">
									الاسم الأول
								</label>
								<Input
									type="text"
									name="first_name"
									value={
										formData.first_name
									}
									onChange={
										handleInputChange
									}
									placeholder="الاسم الأول"
									disabled={isPending}
                                    className={errors.first_name ? "border-red-500" : ""}
                                />
                                {errors.first_name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    الاسم الأخير
                                </label>
                                <Input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="الاسم الأخير"
                                    disabled={isPending}
                                    className={errors.last_name ? "border-red-500" : ""}
                                />
                                {errors.last_name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    رقم الهوية
                                </label>
                                <Input
                                    type="text"
                                    name="national_id"
                                    value={
                                        formData.national_id
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="رقم الهوية"
                                    disabled={isPending}
                                    className={errors.national_id ? "border-red-500" : ""}
                                />
                                {errors.national_id && (
                                    <p className="text-xs text-red-500 mt-1">{errors.national_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    رقم الهاتف
                                </label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="رقم الهاتف"
                                    disabled={isPending}
                                    className={errors.phone ? "border-red-500" : ""}
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    العمر
                                </label>
                                <Input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder="العمر"
                                    disabled={isPending}
                                    className={errors.age ? "border-red-500" : ""}
                                />
                                {errors.age && (
                                    <p className="text-xs text-red-500 mt-1">{errors.age}</p>
                                )}
                            </div>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="font-semibold">المستندات</h3>

						<div>
							<FileUploadField
								label="الصورة الشخصية"
								name="picture"
								file={files.picture}
								onChange={handleFileChange}
								disabled={isPending}
								accept="image/*"
							/>
							{errors.picture && (
								<p className="text-xs text-red-500 mt-1">{errors.picture}</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<FileUploadField
									label="رخصة القيادة - أمامية"
									name="license_front"
									file={files.license_front}
									onChange={handleFileChange}
									disabled={isPending}
									accept="image/*"
								/>
								{errors.license_front && (
									<p className="text-xs text-red-500 mt-1">{errors.license_front}</p>
								)}
							</div>
							<div>
								<FileUploadField
									label="رخصة القيادة - خلفية"
									name="license_back"
									file={files.license_back}
									onChange={handleFileChange}
									disabled={isPending}
									accept="image/*"
								/>
								{errors.license_back && (
									<p className="text-xs text-red-500 mt-1">{errors.license_back}</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<FileUploadField
									label="بطاقة الهوية - أمامية"
									name="national_id_card_front"
									file={
										files.national_id_card_front
									}
									onChange={handleFileChange}
									disabled={isPending}
									accept="image/*"
								/>
								{errors.national_id_card_front && (
									<p className="text-xs text-red-500 mt-1">{errors.national_id_card_front}</p>
								)}
							</div>
							<div>
								<FileUploadField
									label="بطاقة الهوية - خلفية"
									name="national_id_card_back"
									file={
										files.national_id_card_back
									}
									onChange={handleFileChange}
									disabled={isPending}
									accept="image/*"
								/>
								{errors.national_id_card_back && (
									<p className="text-xs text-red-500 mt-1">{errors.national_id_card_back}</p>
								)}
							</div>
						</div>
					</div>

					{/* Buttons */}
					<div className="flex gap-3 justify-end pt-4">
						<Button
							size={"lg"}
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isPending}
							className="text-md"
						>
							إلغاء
						</Button>
						<Button
							size={"lg"}
							type="submit"
							disabled={isPending}
							className="text-md"
						>
							{isPending ? (
								<>
									<Loader className="w-4 h-4 mr-2" />
									جاري الإضافة...
								</>
							) : (
								"إضافة السائق"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default AddDriverDialog;
