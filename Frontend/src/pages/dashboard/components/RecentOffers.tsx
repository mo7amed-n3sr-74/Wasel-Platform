import { Button } from "@/components/ui/button";
import { PiStar, PiCheckCircle, PiXCircle, PiChatDots } from "react-icons/pi";
import { useRecentOffer } from "@/api/hooks/offers/useRecentOffer";
import { Link } from "react-router-dom";
import { useAcceptOffer } from "@/api/hooks/offers/useAcceptOffer";
import { useRejectOffer } from "@/api/hooks/offers/useRejectOffer";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { useNotification } from "@/components/NotificationContext";
import { isAxiosError } from "axios";


function RecentOffers() {
	const [ offerId, setOfferId ] = useState<string>();
	const { t } = useTranslation();
	const { addNotification } = useNotification();
	const { data } = useRecentOffer();
	const recentOffers = data?.data;

	const { data: acceptedOffer, mutate: acceptOffer, isPending: isAcceptPending, isSuccess: isAcceptSuccess, isError: isAcceptError, error: acceptError } = useAcceptOffer(offerId);
	const { data: rejectedOffer, mutate: rejectOffer, isPending: isRejectPending, isSuccess: isRejectSuccess, isError: isRejectError, error: rejectError } = useRejectOffer(offerId);
	
	const handleAcceptOffer = (offerId: string) => {
		console.log(offerId + " - Accept");
	}

	const handleRejectOffer = (offerId: string) => {
		if (!offerId) return;
		setOfferId(offerId);
		rejectOffer();
	}

	useEffect(() => {
		if (isRejectError) {
			const axiosMsg = isAxiosError(rejectError)? rejectError.response?.data.message : "حدث خطأ ما";
			addNotification(
				t(axiosMsg),
				"error",
				5000
			);
			setOfferId("");
		}


		if (isRejectSuccess) {
			addNotification(
				t("تم رفض العرض بنجاح"),
				"success",
				5000
			);
			setOfferId("");
		}
	}, [
		isAcceptSuccess, isRejectSuccess, isAcceptError, isRejectError
	])

	const renderStars = (rating: number) => {
		return (
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((i) => (
					<PiStar
						key={i}
						className={`text-sm ${
							i <= Math.floor(rating)
								? "fill-yellow-500 text-yellow-500"
								: "text-gray-300"
						}`}
					/>
				))}
			</div>
		);
	};

	return (
		<div className="w-full h-full bg-(--secondary-color) rounded-20 p-6 border border-(--tertiary-color)/20">
			<div className="flex items-center justify-between mb-6">
				<h2 className="font-main text-xl font-bold text-(--primary-text)">
					آخر العروض المستلمة
				</h2>
				<span className="text-sm font-main text-(--tertiary-color)">
					{recentOffers?.length} عرض
				</span>
			</div>

			{recentOffers?.length === 0 ? (
				<div className="py-12 flex flex-col items-center justify-center">
					<div className="w-16 h-16 rounded-full bg-(--primary-color)/10 flex items-center justify-center mb-4">
						<PiChatDots className="text-3xl text-(--primary-color)" />
					</div>
					<p className="font-main text-(--tertiary-color) text-center">
						لم تتلقى أي عروض حتى الآن
					</p>
				</div>
			) : (
				<div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hidden">
					{recentOffers?.map((offer) => (
						<div
							key={offer.id}
							className={`p-4 rounded-10 border transition-all border border-(--primary-color)/25 bg-(--primary-color)/4`}
						>
							<div className="flex flex-col items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<h3 className="font-main font-bold text-(--primary-text) truncate">
											{
												offer.profile.company_name? offer.profile.company_name : "غير معروف"
											}	
										</h3>
										{/* {offer.isBestOffer && (
											<span className="text-xs font-main px-2 py-1 bg-(--primary-color) text-(--secondary-color) rounded-full whitespace-nowrap">
												أفضل عرض
											</span>
										)} */}
									</div>

									<div className="flex items-center gap-2 mb-3">
										{/* {renderStars(
											offer.rating,
										)} */}
										{/* <span className="text-sm font-main text-(--tertiary-color)">
											{offer.rating}{" "}
											(
											{
												offer.reviewsCount
											}
											)
										</span> */}
									</div>

									<div className="grid grid-cols-3 gap-3 text-sm">
										<div>
											<p className="font-main text-(--tertiary-color) text-xs mb-1">
												السعر
											</p>
											<p className="font-main font-bold text-(--primary-color) text-base">
												{
													offer.price
												}
											</p>
										</div>
										<div>
											<p className="font-main text-(--tertiary-color) text-xs mb-1">
												الوقت
												المتوقع
											</p>
											<p className="font-main font-bold text-(--primary-text)">
												{
													offer.shipment.ETA
												}
											</p>
										</div>
										<div>
											<p className="font-main text-(--tertiary-color) text-xs mb-1">
												الشحنة
											</p>
											<Link to={`/dashboard/shipments/${offer.shipment.id}`}>
												<p className="font-main font-bold text-(--primary-text) hover:text-(--primary-color) underline">
													{
														offer.shipment.shipmentId
													}
												</p>
											</Link>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Button
										size="sm"
										className="h-9 px-3 rounded-8 bg-(--primary-color) hover:bg-(--primary-color)/80 whitespace-nowrap text-sm"
										onClick={() => handleAcceptOffer(offer.id)}
										disabled={isAcceptPending}
									>
										{
											!isAcceptPending?
												<>
													<PiCheckCircle className="text-lg" />
													قبول
												</>
											:
												<Spinner />

										}
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="h-9 px-3 rounded-8 whitespace-nowrap text-sm"
										onClick={() => handleRejectOffer(offer.id)}
										disabled={isRejectPending}
									>
										{
											!isRejectPending?
												<>
													<PiXCircle className="text-lg" />
													رفض
												</>
											:
												<Spinner />

										}
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default RecentOffers;
