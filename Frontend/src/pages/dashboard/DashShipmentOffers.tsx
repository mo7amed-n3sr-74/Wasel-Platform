import { useParams } from "react-router-dom";
import { useShipmentOffers } from "@/api/hooks/shipments/useShipmentOffers";
import DashHeader from "./components/DashHeader";
import Loader from "@/components/Loader";
import { useNotification } from "@/components/NotificationContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { Button } from "@/components/ui/button";
import {
	PiCheckCircle,
	PiXCircle,
	PiClock,
	PiMapPin,
} from "react-icons/pi";
dayjs.locale("ar");
import type { Offer } from "@/shared/interfaces/Interfaces";
import { useRejectOffer } from "@/api/hooks/offers/useRejectOffer";
import { Spinner } from "@/components/ui/spinner";
import { useAcceptOffer } from "@/api/hooks/offers/useAcceptOffer";



export default function DashShipmentOffers() {
	const { shipmentId } = useParams<{ shipmentId: string }>();
	const {
		data: response,
		isLoading,
		error,
		isError,
	} = useShipmentOffers(shipmentId || "");
	const { addNotification } = useNotification();
	const { t } = useTranslation();

	const offers: Offer[] = Array.isArray(response?.data)
		? response.data
		: [];
	const shipment = offers[0]?.shipment;

	useEffect(() => {
		if (isError) {
			const axiosMsg = isAxiosError(error)
				? error.response?.data.message
				: "حدث خطأ ما";
			addNotification(t(axiosMsg), "error", 5000);
		}
	}, [isError, error, addNotification, t]);

	if (isLoading) {
		return (
			<section className="w-full h-full">
				<DashHeader title={"تفاصيل الحمولة"} />
				<div className="h-[calc(100%-52px)] flex items-center justify-center">
					<Loader />
				</div>
			</section>
		);
	}

	if (!shipment) {
		return (
			<section className="w-full h-full">
				<DashHeader title={"تفاصيل الحمولة"} />
				<div className="h-[calc(100%-52px)] flex items-center justify-center">
					<div className="text-center">
						<p className="font-main text-lg text-(--secondary-text)">
							لم يتم العثور على الحمولة
						</p>
					</div>
				</div>
			</section>
		);
    }

	return (
		<section className="w-full h-full">
			<DashHeader title={"تفاصيل الحمولة"} />
			<div className="h-[calc(100%-52px)] overflow-y-auto">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Shipment Details Card */}
					<div className="bg-(--secondary-color) border border-(--tertiary-color) rounded-xl p-6">
						<div className="flex items-center gap-2 mb-6">
							{/* <PiTruck className="text-2xl text-(--primary-color)" /> */}
							<h2 className="font-main text-2xl font-bold text-(--primary-text)">
								{shipment.shipmentId}
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* Origin */}
							<div className="space-y-2">
								<div className="flex items-center gap-1 text-(--secondary-text)">
									<PiMapPin className="text-lg" />
									<p className="font-main text-sm">
										الانطلاق
									</p>
								</div>
								<p className="font-main font-semibold text-(--primary-text)">
									{shipment.origin}
								</p>
							</div>

							{/* Destination */}
							<div className="space-y-2">
								<div className="flex items-center gap-1 text-(--secondary-text)">
									<PiMapPin className="text-lg" />
									<p className="font-main text-sm">
										الوصول
									</p>
								</div>
								<p className="font-main font-semibold text-(--primary-text)">
									{shipment.destination}
								</p>
							</div>

							{/* Shipment Type */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									نوع الحمولة
								</p>
								<p className="font-main font-semibold text-(--primary-text)">
									{shipment.shipmentType}
								</p>
							</div>

							{/* Weight */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									الوزن
								</p>
								<p className="font-main font-semibold text-(--primary-text)">
									{shipment.weight} طن
								</p>
							</div>

							{/* Dimensions */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									الأبعاد
								</p>
								<p className="font-main font-semibold text-(--primary-text) text-sm">
									{shipment.length} ×{" "}
									{shipment.width} ×{" "}
									{shipment.height} سم
								</p>
							</div>

							{/* Packaging */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									التغليف
								</p>
								<p className="font-main font-semibold text-(--primary-text) text-sm">
									{shipment.packaging}
								</p>
							</div>

							{/* Pickup Date */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									تاريخ الانطلاق
								</p>
								<p className="font-main font-semibold text-(--primary-text)">
									{dayjs(
										shipment.pickupAt,
									).format("DD MMM YYYY")}
								</p>
							</div>

							{/* Delivery Date */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									تاريخ الوصول
								</p>
								<p className="font-main font-semibold text-(--primary-text)">
									{dayjs(
										shipment.deliveryAt,
									).format("DD MMM YYYY")}
								</p>
							</div>

							{/* Budget Type */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									نوع الميزانية
								</p>
								<span className="inline-block font-main text-xs font-semibold px-2.5 py-0.5 bg-(--tertiary-color)/20 text-(--tertiary-color) rounded-lg">
									{shipment.budgetType ===
									"OPEN_BUDGET"
										? "ميزانية مفتوحة"
										: "ميزانية محدودة"}
								</span>
							</div>

							{/* Payment Type */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									نوع الدفع
								</p>
								<p className="font-main font-semibold text-(--primary-text) text-sm">
									{shipment.paymentType ===
									"ON_DELIVER"
										? "عند التسليم"
										: "عند الانطلاق"}
								</p>
							</div>

							{/* Urgent */}
							{shipment.urgent && (
								<div className="space-y-2">
									<p className="font-main text-sm text-(--secondary-text)">
										الأولوية
									</p>
									<span className="inline-block font-main text-xs font-semibold px-2.5 py-0.5 bg-red-100 text-red-800 rounded-lg">
										عاجل
									</span>
								</div>
							)}

							{/* Offer Count */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									عدد العروض
								</p>
								<p className="font-main font-semibold text-(--primary-color) text-lg">
									{shipment.offerCount}
								</p>
							</div>

							{/* Offer Count */}
							<div className="space-y-2">
								<p className="font-main text-sm text-(--secondary-text)">
									الناقل
								</p>
								<p className="font-main font-semibold text-(--primary-color) text-lg">
									{/* {offer. && shipment.acceptedBy.first_name + " " + shipment.acceptedBy.last_name} */}
								</p>
							</div>
						</div>

						{/* Description and Goods Type */}
						<div className="mt-6 pt-6 border-t border-(--tertiary-color)/30 space-y-4">
							<div>
								<p className="font-main text-sm text-(--secondary-text) mb-2">
									نوع البضاعة
								</p>
								<p className="font-main text-(--primary-text)">
									{shipment.goodsType}
								</p>
							</div>
							<div>
								<p className="font-main text-sm text-(--secondary-text) mb-2">
									الوصف
								</p>
								<p className="font-main text-(--primary-text)">
									{shipment.description}
								</p>
							</div>
						</div>
					</div>

					{/* Offers Section */}
					<div className="space-y-4">
						<h3 className="font-main text-xl font-bold text-(--primary-text)">
							العروض ({offers.length})
						</h3>

						{offers.length === 0 ? (
							<div className="bg-(--secondary-color) border border-(--tertiary-color) rounded-xl p-8 text-center">
								<p className="font-main text-(--secondary-text)">
									لا توجد عروض حتى الآن
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{offers.map((offer) => (
									<OfferCard
										key={offer.id}
										offer={offer}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

interface OfferCardProps {
	offer: Offer;
}

function OfferCard({ offer }: OfferCardProps) {
	const getStatusColor = (
		status: string,
	): { bg: string; text: string; icon: React.ReactNode } => {
		switch (status) {
			case "PENDING":
				return {
					bg: "bg-yellow-100",
					text: "text-yellow-800",
					icon: (
						<PiClock className="text-lg text-yellow-600" />
					),
				};
			case "ACCEPTED":
				return {
					bg: "bg-green-100",
					text: "text-green-800",
					icon: (
						<PiCheckCircle className="text-lg text-green-600" />
					),
				};
			case "REJECTED":
				return {
					bg: "bg-red-100",
					text: "text-red-800",
					icon: (
						<PiXCircle className="text-lg text-red-600" />
					),
				};
			default:
				return {
					bg: "bg-gray-100",
					text: "text-gray-800",
					icon: null,
				};
		}
	};

	const statusInfo = getStatusColor(offer.status);
    const [ offerId, setOfferId ] = useState<string>("");
    const { addNotification } = useNotification();
    const { t } = useTranslation()

    const {
        mutate: rejectOffer,
        isPending: isRejectPending,
        error: rejectError,
        isError: isRejectError,
        isSuccess: isRejectSuccess,
    } = useRejectOffer(offerId);

	const {
		mutate: acceptOffer,
		isPending: isAcceptPending,
		error: acceptError,
		isError: isAcceptError,
		isSuccess: isAcceptSuccess
	} = useAcceptOffer(offerId)

    useEffect(() => {
		if (isRejectSuccess) {
			addNotification(
                t("تم رفض العرض بنجاح"),
                "success", 
                5000
            );
			setOfferId("");
		}
		
		if (isAcceptSuccess) {
			addNotification(
                t("تم قبول العرض بنجاح"),
                "success", 
                5000
            );
			setOfferId("");
		}

		if (isRejectError) {
			const axiosMsg = isAxiosError(rejectOffer)? rejectOffer.response?.data.message : "حدث خطأ ما";

			addNotification(
				t(axiosMsg),
				"error",
				5000
			)
		}

		if (isAcceptError) {
			const axiosMsg = isAxiosError(acceptError)? acceptError.response?.data.message : "حدث خطأ ما";

			addNotification(
				t(axiosMsg),
				"error",
				5000
			)
		}
	}, [
		isRejectSuccess, 
		isRejectError, 
		rejectError,
		isAcceptSuccess,
		isAcceptError,
		acceptError,
		addNotification,
		rejectOffer,
		t,
	]);

    const handleRejectOffer = (offerId: string) => {
        setOfferId(offerId);
        rejectOffer();
    }

    const handleAcceptOffer = (offerId: string) => {
        setOfferId(offerId);
        acceptOffer();
    }

	return (
		<div className="bg-(--secondary-color) border border-(--tertiary-color) rounded-xl p-6 hover:shadow-lg transition-shadow">
			{/* Profile Section */}
			<div className="flex items-start gap-4 mb-6 pb-2 border-b border-(--tertiary-color)/30">
                <div className="flex items-center flex-1 gap-2">
                    <img
                        src={offer.profile.picture}
                        alt={offer.profile.username}
                        className="w-14 h-14 rounded-full object-cover border border-(--primary-color)"
                    />
                    <div>
                        <h4 className="font-main font-semibold text-(--primary-text)">
                            {offer.profile.first_name ||
                            offer.profile.last_name
                                ? `${offer.profile.first_name || ""} ${offer.profile.last_name || ""}`.trim()
                                : offer.profile.username}
                        </h4>
                        {/* <p className="font-main text-sm text-(--secondary-text)">
                            @{offer.profile.username}
                        </p> */}
                        <p className="font-main text-sm text-(--secondary-text) mt-1">
                            {dayjs(offer.createdAt).format(
                                "DD MMM YYYY",
                            )}
                        </p>
                    </div>
                </div>

				{/* Status Badge */}
                <div
                    className={`flex items-start gap-2 px-3 py-1.5 ${statusInfo.bg} ${statusInfo.text} rounded-lg`}
                >
                    {statusInfo.icon}
                    <span className="font-main text-xs font-semibold">
                        {offer.status === "PENDING"
                            ? "قيد الانتظار"
                            : offer.status === "ACCEPTED"
                                ? "مقبول"
                                : "مرفوض"}
                    </span>
                </div>
			</div>

			{/* Offer Details */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<p className="font-main text-sm text-(--secondary-text)">
						السعر المقترح:
					</p>
					<p className="font-main text-2xl font-bold text-(--primary-color)">
						{offer.price.toLocaleString("en-US")} ر.س
					</p>
				</div>

				{offer.proposal && (
					<div>
						<p className="font-main text-sm text-(--secondary-text) mb-2">
							الملاحظات
						</p>
						<p className="font-main text-(--primary-text) text-base">
							{offer.proposal}
						</p>
					</div>
				)}

				{/* Actions */}
				{offer.status === "PENDING" && (
					<div className="pt-4 flex gap-3">
						<Button
							type="button"
							className="flex-1 font-main bg-(--primary-color) hover:bg-(--primary-color)/90 text-white"
							onClick={() => handleAcceptOffer(offer.id)}
							disabled={isAcceptPending}
						>
							{ isRejectPending? <Spinner /> : "قبول" }
						</Button>
						<Button
							type="button"
							variant="outline"
							className="flex-1 font-main"
                            onClick={() => handleRejectOffer(offer.id)}
							disabled={isRejectPending}
						>
							{ isRejectPending? <Spinner /> : "رفض" }
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
