import { Star } from "lucide-react";

interface Review {
	id: string;
	companyName: string;
	rating: number;
	date: string;
	reviewText: string;
}

interface RatingDistribution {
	stars: number;
	count: number;
	percentage: number;
}

function ProfileReviews() {
	const averageRating = 4.7;
	const totalReviews = 5;

	const ratingDistribution: RatingDistribution[] = [
		{ stars: 5, count: 4, percentage: 80 },
		{ stars: 4, count: 3, percentage: 60 },
		{ stars: 3, count: 1, percentage: 20 },
		{ stars: 2, count: 0, percentage: 0 },
		{ stars: 1, count: 0, percentage: 0 },
	];

	const reviews: Review[] = [
		{
			id: "1",
			companyName: "شركة الأهرام للتصدير",
			rating: 5,
			date: "10 أبريل 2026",
			reviewText:
				"شركة محترفه وموثوقه، أفضل شركة نقل تعاملنا معها.",
		},
		{
			id: "2",
			companyName: "مصنع القاهرة للمنسوجات",
			rating: 5,
			date: "12 أبريل 2026",
			reviewText: "خدمة ممتازة وأسعار تنافسية، شكراً لفريق العمل.",
		},
		{
			id: "3",
			companyName: "مجموعة النيل الدولية",
			rating: 4,
			date: "14 أبريل 2026",
			reviewText: "تجربة جيدة، شحنات تصل في الوقت المحدد.",
		},
	];

	const renderStars = (rating: number, size: string = "w-5 h-5") => {
		return (
			<div className="flex items-center gap-1">
				{Array.from({ length: 5 }).map((_, i) => (
					<Star
						key={i}
						className={`${size} ${
							i < rating
								? "fill-[#f5b400] text-[#f5b400]"
								: "text-[#e5e7eb]"
						}`}
					/>
				))}
			</div>
		);
	};

	return (
		<div className="space-y-8">
			{/* Rating Overview */}
			<div className="rounded-[28px] border border-(--border-color) bg-(--secondary-color) p-8 shadow-sm">
				<div className="grid gap-8 md:grid-cols-2">
					{/* Left: Rating Distribution */}
					<div className="space-y-6">
						{ratingDistribution.map((item) => (
							<div
								key={item.stars}
								className="flex items-center gap-4"
							>
								<div className="flex items-center gap-1 w-12">
									<span className="text-sm font-medium text-(--main-text)">
										{item.stars}
									</span>
									<Star className="w-4 h-4 fill-[#f5b400] text-[#f5b400]" />
								</div>
								<div className="flex-1 h-2 bg-(--background) rounded-full overflow-hidden">
									<div
										className="h-full bg-[#f5b400] rounded-full transition-all duration-300"
										style={{
											width: `${item.percentage}%`,
										}}
									/>
								</div>
								<span className="text-xs text-(--secondary-text) w-8 text-right">
									{item.count}
								</span>
							</div>
						))}
					</div>

					{/* Right: Overall Rating */}
					<div className="flex flex-col items-center justify-center py-6">
						<div className="text-6xl font-bold text-(--primary-color) mb-3">
							{averageRating}
						</div>
						<div className="mb-4">
							{renderStars(
								Math.round(averageRating),
							)}
						</div>
						<p className="text-sm text-(--secondary-text)">
							بناء على {totalReviews} تقييمات
						</p>
					</div>
				</div>
			</div>

			{/* Reviews List */}
			<div className="space-y-4">
				{reviews.map((review) => (
					<div
						key={review.id}
						className="rounded-[24px] border border-(--border-color) bg-(--secondary-color) p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
					>
						<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div className="flex-1">
								<div className="flex flex-col gap-3">
									<h3 className="text-lg font-semibold text-(--main-text)">
										{review.companyName}
									</h3>
									<div className="flex items-center gap-2">
										{renderStars(
											review.rating,
											"w-4 h-4",
										)}
									</div>
								</div>
							</div>
							<p className="text-sm text-(--secondary-text) md:text-right">
								{review.date}
							</p>
						</div>

						<p className="mt-5 text-sm leading-relaxed text-(--secondary-text)">
							{review.reviewText}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default ProfileReviews;
