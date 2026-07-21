import { useBalance } from "@/api/hooks/balance/useBalance";
import { useTransactions } from "@/api/hooks/balance/useTransactions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import DashHeader from "./components/DashHeader";
import PaymentDialog from "@/components/PaymentDialog";
import { PiPlus, PiArrowDown, PiArrowUp, PiWallet, PiCheckCircle, PiClock } from "react-icons/pi";

function DashBalance() {
	const [isPaymentOpen, setIsPaymentOpen] = useState(false);
	const { data: balanceData, isLoading, error } = useBalance();
	const { data: transactionsData } = useTransactions();

	const balance = balanceData?.data?.balance || {
		total: 0,
		pending: 0,
		available: 0,
	};
	const transactions = transactionsData?.data?.transactions || [];

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
					حدث خطأ أثناء تحميل الرصيد
				</p>
				<p className="text-gray-600">
					{(error as Error).message}
				</p>
			</div>
		);
	}

	return (
		<div className="w-full h-full overflow-hidden flex flex-col">
			<DashHeader title="الرصيد" />

			{/* Balance Cards + Add Funds */}
			<div className="flex items-stretch justify-between gap-4 mb-6">
				<div className="flex items-stretch gap-4 flex-1">
					<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-(--primary-color) after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
						<div className="flex items-center gap-2">
							<PiWallet className="text-2xl text-(--primary-color)" />
							<h3 className="font-main text-sm text-(--primary-text) font-medium">
								الرصيد الكلي
							</h3>
						</div>
						<div>
							<span className="font-main text-2xl font-extrabold text-(--primary-text)">
								{balance.total?.toLocaleString() || 0}
							</span>
							<span className="font-main text-sm text-(--secondary-text) mr-1">
								ر.س
							</span>
						</div>
					</div>
					<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-green-500 after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
						<div className="flex items-center gap-2">
							<PiCheckCircle className="text-2xl text-green-500" />
							<h3 className="font-main text-sm text-(--primary-text) font-medium">
								متاح
							</h3>
						</div>
						<div>
							<span className="font-main text-2xl font-extrabold text-green-600">
								{balance.available?.toLocaleString() || 0}
							</span>
							<span className="font-main text-sm text-(--secondary-text) mr-1">
								ر.س
							</span>
						</div>
					</div>
					<div className="relative flex flex-col basis-full gap-4 rounded-2xl bg-(--secondary-color) p-5 after:absolute after:w-20 after:h-20 after:bg-yellow-500 after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
						<div className="flex items-center gap-2">
							<PiClock className="text-2xl text-yellow-500" />
							<h3 className="font-main text-sm text-(--primary-text) font-medium">
								معلق
							</h3>
						</div>
						<div>
							<span className="font-main text-2xl font-extrabold text-yellow-600">
								{balance.pending?.toLocaleString() || 0}
							</span>
							<span className="font-main text-sm text-(--secondary-text) mr-1">
								ر.س
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Transactions Table */}
			<div className="flex-1 rounded-xl border border-(--tertiary-color)/20 bg-(--secondary-color) overflow-hidden flex flex-col">
				<div className="px-5 py-4 border-b border-(--tertiary-color)/10 flex items-center justify-between">
					<h3 className="font-main font-semibold text-base text-(--primary-text)">
						المعاملات المالية
					</h3>
					<Button
						size="sm"
						onClick={() => setIsPaymentOpen(true)}
						className="flex items-center gap-1.5 whitespace-nowrap"
					>
						<PiPlus className="w-4 h-4" />
						شحن الرصيد
					</Button>
				</div>

				{transactions.length === 0 ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-500 text-lg">
							لا توجد معاملات بعد
						</p>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto">
						<table className="w-full text-right">
							<thead className="bg-(--tertiary-color)/5">
								<tr>
									<th className="font-main text-sm font-medium text-(--secondary-text) px-5 py-3">
										الوصف
									</th>
									<th className="font-main text-sm font-medium text-(--secondary-text) px-5 py-3">
										التاريخ
									</th>
									<th className="font-main text-sm font-medium text-(--secondary-text) px-5 py-3">
										المبلغ
									</th>
									<th className="font-main text-sm font-medium text-(--secondary-text) px-5 py-3">
										الحالة
									</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map(
									(
										t: any,
										idx: number,
									) => (
										<tr
											key={
												t.id ||
												idx
											}
											className="border-t border-(--tertiary-color)/10 hover:bg-(--tertiary-color)/5 transition-colors"
										>
											<td className="px-5 py-4">
												<div className="flex items-center gap-3">
													<div
														className={`w-8 h-8 rounded-full flex items-center justify-center ${
															t.type ===
															"credit"
																? "bg-green-100 text-green-600"
																: "bg-red-100 text-red-600"
														}`}
													>
														{t.type ===
														"credit" ? (
															<PiArrowDown className="text-sm" />
														) : (
															<PiArrowUp className="text-sm" />
														)}
													</div>
													<span className="font-main text-sm text-(--primary-text)">
														{t.title ||
															t.description}
													</span>
												</div>
											</td>
											<td className="px-5 py-4 font-main text-sm text-(--secondary-text)">
												{t.date}
											</td>
											<td className="px-5 py-4">
												<span
													className={`font-main text-sm font-medium ${
														t.type ===
														"credit"
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{t.type ===
													"credit"
														? "+"
														: "-"}
													{Number(
														t.amount,
													).toLocaleString()}{" "}
													ر.س
												</span>
											</td>
											<td className="px-5 py-4">
												<span
													className={`text-xs px-2 py-1 rounded-full font-medium ${
														t.status ===
															"completed" ||
														t.status ===
															"success"
															? "bg-green-100 text-green-700"
															: t.status ===
																  "pending"
																? "bg-yellow-100 text-yellow-700"
																: "bg-red-100 text-red-700"
													}`}
												>
													{t.status ===
														"completed" ||
													t.status ===
														"success"
														? "مكتمل"
														: t.status ===
															  "pending"
															? "معلق"
															: "فشل"}
												</span>
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<PaymentDialog
				isOpen={isPaymentOpen}
				onClose={() => setIsPaymentOpen(false)}
			/>
		</div>
	);
}

export default DashBalance;
