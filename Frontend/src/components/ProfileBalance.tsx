import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
	id: string;
	title: string;
	date: string;
	amount: number;
	type: "credit" | "debit";
}

function ProfileBalance() {
	const totalBalance = 300000;
	const pendingBalance = 20000;
	const transferredBalance = 20000;

	const transactions: Transaction[] = [
		{
			id: "1",
			title: "دفعة شحنة -12",
			date: "11 أبريل 2026",
			amount: 0.0,
			type: "credit",
		},
		{
			id: "2",
			title: "سحب رصيد",
			date: "10 أبريل 2026",
			amount: 0,
			type: "debit",
		},
		{
			id: "3",
			title: "دفعة شحنة -13",
			date: "14 أبريل 2026",
			amount: 12000,
			type: "credit",
		},
	];

	const formatCurrency = (amount: number) => {
		return `${amount.toLocaleString("ar-SA")} ر.ص`;
	};

	return (
		<div className="space-y-6">
			{/* Balance Card */}
			<div className="rounded-[28px] bg-gradient-to-l from-[#3b5bdb] to-[#4568e2] p-8 text-white shadow-lg">
				<div className="flex flex-col gap-6">
					<div>
						<p className="text-sm font-medium text-white/80 mb-2">
							الرصيد الإجمالي
						</p>
						<h2 className="text-4xl sm:text-5xl font-bold mb-8">
							{totalBalance.toLocaleString("ar-SA")}
							<span className="text-2xl mr-2">
								ر.ص
							</span>
						</h2>
					</div>

					<div className="flex gap-4 sm:text-right">
						<div>
							<p className="text-sm text-white/70 mb-1">
								معلق
							</p>
							<p className="text-2xl font-semibold">
								{formatCurrency(pendingBalance)}
							</p>
						</div>
						<div>
							<p className="text-sm text-white/70 mb-1">
								محول
							</p>
							<p className="text-2xl font-semibold">
								{formatCurrency(
									transferredBalance,
								)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="grid grid-cols-2 gap-4 sm:gap-6">
				<button className="rounded-full border-2 border-(--primary-color) py-4 px-6 font-semibold text-(--primary-color) transition duration-300 hover:bg-(--primary-color)/5">
					<span className="flex items-center justify-center gap-2">
						<Wallet className="w-5 h-5" />
						شحن المحفظة
					</span>
				</button>
				<button className="rounded-full bg-(--primary-color) py-4 px-6 font-semibold text-(--secondary-color) transition duration-300 hover:opacity-90">
					<span className="flex items-center justify-center gap-2">
						<ArrowUpRight className="w-5 h-5" />
						سحب رصيد
					</span>
				</button>
			</div>

			{/* Transaction History */}
			<div className="rounded-[28px] border border-(--border-color) bg-(--secondary-color) p-6 shadow-sm">
				<h3 className="text-xl font-semibold text-(--main-text) mb-6">
					سجل المعاملات
				</h3>

				<div className="space-y-0 divide-y divide-[#e5e7eb]">
					{transactions.map((transaction) => (
						<div
							key={transaction.id}
							className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
						>
							<div className="flex items-center gap-3">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-full ${
										transaction.type ===
										"credit"
											? "bg-green-100"
											: "bg-(--primary-color)/10"
									}`}
								>
									{transaction.type ===
									"credit" ? (
										<ArrowDownLeft className="w-5 h-5 text-green-600" />
									) : (
										<ArrowUpRight className="w-5 h-5 text-(--primary-color)" />
									)}
								</div>
								<div>
									<p className="font-medium text-(--main-text)">
										{transaction.title}
									</p>
									<p className="text-sm text-(--secondary-text)">
										{transaction.date}
									</p>
								</div>
							</div>

							<p
								className={`text-lg font-semibold ${
									transaction.type ===
									"credit"
										? "text-green-600"
										: "text-red-600"
								} text-right`}
							>
								{transaction.type === "credit"
									? "+"
									: "-"}
								{formatCurrency(
									transaction.amount,
								)}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default ProfileBalance;
