import { useState } from "react";
import { CreditCard, Mail } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface PaymentDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

type PaymentMethod = "paypal" | "stripe" | null;
type InputMethod = "card" | "email";

function PaymentDialog({ isOpen, onClose }: PaymentDialogProps) {
	const [selectedPayment, setSelectedPayment] =
		useState<PaymentMethod>(null);
	const [inputMethod, setInputMethod] = useState<InputMethod>("card");
	const [amount, setAmount] = useState("");
	const [cardData, setCardData] = useState({
		cardNumber: "",
		expiryDate: "",
		cvv: "",
	});
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handlePaymentMethodSelect = (method: PaymentMethod) => {
		setSelectedPayment(method);
	};

	const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCardData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleProcessPayment = async () => {
		if (!amount || !selectedPayment) {
			alert("الرجاء ملء جميع الحقول المطلوبة");
			return;
		}

		if (
			inputMethod === "card" &&
			(!cardData.cardNumber ||
				!cardData.expiryDate ||
				!cardData.cvv)
		) {
			alert("الرجاء ملء بيانات البطاقة");
			return;
		}

		if (inputMethod === "email" && !email) {
			alert("الرجاء إدخال البريد الإلكتروني");
			return;
		}

		setLoading(true);
		try {
			// TODO: Integrate with actual payment API
			const paymentData = {
				method: selectedPayment,
				amount: parseFloat(amount),
				inputMethod,
				...(inputMethod === "card"
					? { card: cardData }
					: { email }),
			};

			console.log("Processing payment:", paymentData);

			// Call your backend API here
			// const response = await paymentService.processPayment(paymentData);

			// For now, simulate successful payment
			alert("تم معالجة الدفع بنجاح!");
			resetForm();
			onClose();
		} catch (error) {
			console.error("Payment error:", error);
			alert("حدث خطأ أثناء معالجة الدفع");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setSelectedPayment(null);
		setInputMethod("card");
		setAmount("");
		setCardData({ cardNumber: "", expiryDate: "", cvv: "" });
		setEmail("");
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader dir="rtl">
					<DialogTitle>شحن المحفظة</DialogTitle>
					<DialogDescription>
						اختر طريقة الدفع المناسبة لك وأدخل المبلغ
						المراد شحنه
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Amount Input */}
					<div>
						<label className="block text-sm font-medium text-(--main-text) mb-2">
							المبلغ (ر.ص)
						</label>
						<Input
							type="number"
							placeholder="أدخل المبلغ"
							value={amount}
							onChange={(e) =>
								setAmount(e.target.value)
							}
							className="text-right"
							dir="rtl"
						/>
					</div>

					{/* Payment Methods */}
					<div>
						<label className="block text-sm font-medium text-(--main-text) mb-3">
							اختر طريقة الدفع
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() =>
									handlePaymentMethodSelect(
										"stripe",
									)
								}
								className={`p-4 rounded-lg border-2 transition-all ${
									selectedPayment ===
									"stripe"
										? "border-(--primary-color) bg-(--primary-color)/5"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<div className="flex flex-col items-center gap-2">
									<CreditCard className="w-6 h-6 text-(--primary-color)" />
									<span className="text-sm font-medium">
										Stripe
									</span>
								</div>
							</button>

							<button
								onClick={() =>
									handlePaymentMethodSelect(
										"paypal",
									)
								}
								className={`p-4 rounded-lg border-2 transition-all ${
									selectedPayment ===
									"paypal"
										? "border-(--primary-color) bg-(--primary-color)/5"
										: "border-gray-300 hover:border-gray-400"
								}`}
							>
								<div className="flex flex-col items-center gap-2">
									<Mail className="w-6 h-6 text-(--primary-color)" />
									<span className="text-sm font-medium">
										PayPal
									</span>
								</div>
							</button>
						</div>
					</div>

					{/* Payment Input Method - Only show if payment method selected */}
					{selectedPayment && (
						<div>
							<label className="block text-sm font-medium text-(--main-text) mb-3">
								طريقة الإدخال
							</label>
							<div className="flex gap-3 mb-4">
								<button
									onClick={() =>
										setInputMethod(
											"card",
										)
									}
									className={`flex-1 py-2 rounded-lg border transition-all ${
										inputMethod ===
										"card"
											? "border-(--primary-color) bg-(--primary-color)/10"
											: "border-gray-300"
									}`}
								>
									<span className="text-sm font-medium">
										بطاقة ائتمان
									</span>
								</button>
								<button
									onClick={() =>
										setInputMethod(
											"email",
										)
									}
									className={`flex-1 py-2 rounded-lg border transition-all ${
										inputMethod ===
										"email"
											? "border-(--primary-color) bg-(--primary-color)/10"
											: "border-gray-300"
									}`}
								>
									<span className="text-sm font-medium">
										البريد الإلكتروني
									</span>
								</button>
							</div>

							{/* Card Input Fields */}
							{inputMethod === "card" && (
								<div className="space-y-3">
									<div>
										<label className="block text-xs font-medium text-(--secondary-text) mb-1">
											رقم البطاقة
										</label>
										<Input
											type="text"
											name="cardNumber"
											placeholder="1234 5678 9012 3456"
											value={
												cardData.cardNumber
											}
											onChange={
												handleCardChange
											}
											maxLength={19}
											className="text-right"
											dir="rtl"
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-(--secondary-text) mb-1">
												تاريخ
												انتهاء
												الصلاحية
											</label>
											<Input
												type="text"
												name="expiryDate"
												placeholder="MM/YY"
												value={
													cardData.expiryDate
												}
												onChange={
													handleCardChange
												}
												maxLength={
													5
												}
												className="text-center"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-(--secondary-text) mb-1">
												CVV
											</label>
											<Input
												type="text"
												name="cvv"
												placeholder="123"
												value={
													cardData.cvv
												}
												onChange={
													handleCardChange
												}
												maxLength={
													3
												}
												className="text-center"
											/>
										</div>
									</div>
								</div>
							)}

							{/* Email Input Field */}
							{inputMethod === "email" && (
								<div>
									<label className="block text-xs font-medium text-(--secondary-text) mb-1">
										البريد الإلكتروني
									</label>
									<Input
										type="email"
										placeholder="your@email.com"
										value={email}
										onChange={(e) =>
											setEmail(
												e.target
													.value,
											)
										}
										className="text-right"
										dir="rtl"
									/>
								</div>
							)}
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							onClick={handleClose}
							variant="outline"
							className="flex-1"
						>
							إلغاء
						</Button>
						<Button
							onClick={handleProcessPayment}
							disabled={
								!selectedPayment ||
								!amount ||
								loading
							}
							className="flex-1"
						>
							{loading
								? "جاري المعالجة..."
								: "تأكيد الدفع"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default PaymentDialog;
