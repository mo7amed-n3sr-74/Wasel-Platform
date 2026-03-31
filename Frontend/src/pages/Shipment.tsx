import Main from "@/components/Main";
import { useShipment } from "@/api/hooks/shipments/useShipment";
import { Link, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import axios from "axios";
import { useNotification } from "@/components/NotificationContext";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import type {
	Attachment,
	Offer,
	Shipment,
	ShipmentAttachment,
} from "@/shared/interfaces/Interfaces";
import { numFormat } from "@/utils/UtilsFuns";
import {
	PiCheckCircle,
	PiDownloadSimple,
	PiFileText,
	PiFlag,
	PiFrameCorners,
	PiMapPin,
	PiShippingContainer,
	PiTruck,
	PiTruckTrailer,
	PiVectorThree,
} from "react-icons/pi";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { useCreateOffer } from "@/api/hooks/offers/useCreateOffer";
import { Spinner } from "@/components/ui/spinner";
import ShipmentMap from "@/components/ShipmentMap";
dayjs.locale("ar");

function Shipment() {
	const offerInitial: Offer = {
		price: 0,
		proposal: "",
	};

	const { id: shipmentId } = useParams();
	const { t } = useTranslation();
	const { addNotification } = useNotification();

	// Shipment states
	const [offer, setOffer] = useState<Offer>(offerInitial);

	// Shipment queries
	const {
		data,
		isLoading: isShipmentLoading,
		error: shipmentError,
		isError: isShipmentError,
	} = useShipment(shipmentId);
	const {
		data: newOffer,
		mutate: createOffer,
		error: OfferError,
		isError: isOfferError,
		isPending: isOfferPending,
		isSuccess: isOfferSuccess,
	} = useCreateOffer(shipmentId, offer);

	const shipment: Shipment = data?.data;
	const profile = data?.data.profile;
	const shipmentImgs: ShipmentAttachment[] =
		data?.data.attachments.filter((attachment: Attachment) => {
			return attachment.attachmentType === "Image";
		}) || [];

	const shipmentFiles: ShipmentAttachment[] =
		data?.data.attachments.filter((attachment: Attachment) => {
			return attachment.attachmentType === "File";
		}) || [];

	useEffect(() => {
		if (isShipmentError || isOfferError) {
			const error = isShipmentError ? shipmentError : OfferError;

			// const status = axios.isAxiosError(error)? error.status : 501
			const axiosMeg = axios.isAxiosError(error)
				? error.response?.data.message
				: 501;

			addNotification(t(axiosMeg), "error", 5000);
		}

		if (isOfferSuccess) {
			addNotification(t(newOffer.data.message), "error", 5000);
		}
	}, [
		isOfferSuccess,
		isShipmentError,
		isOfferError,
		shipmentError,
		OfferError,
		shipmentId,
		t,
	]);

	const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		const { price } = offer;

		if (!price) {
			addNotification(t("أدخل سعرك أولاً"), "warning", 5000);
			return;
		}

		createOffer();
	};

	const dateFormat = (date: Date | undefined): string => {
		return dayjs(date).format("DD MMMM YYYY");
	};

	if (isShipmentLoading) return <Loader />;

	return (
		<Main>
			<section className="container mx-auto px-4 sm:px-0 min-h-screen pt-28 mb-24">
				<div className="flex items-center justify-start">
					<PageTitle
						title={shipment.shipmentId}
						subTitle="تصفح تفاصيل الحمولة كاملةً وقم بتقديم عرضك لنقلها بأمان وسرعة"
					/>
				</div>
				<div className="w-full h-full grid grid-cols-12 gap-5">
					<div className="col-span-3">
						<div className="flex flex-col gap-5">
							<div className="w-full flex flex-col gap-6 p-4 rounded-2xl bg-(--secondary-color)">
								<div className="flex items-center gap-2">
									<div className="min-w-14 h-14 rounded-full border border-(--primary-color) overflow-hidden">
										<img
											src={
												profile?.picture
											}
											alt="picture"
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="">
										<h2 className="font-main text-lg font-medium text-(--primary-text) capitalize m-0">
											{profile?.first_name +
												" " +
												profile?.last_name}
										</h2>
										<h3 className="font-main text-base font-medium text-(--secondary-text) capitalize">
											subtitle
										</h3>
									</div>
								</div>
								<p className="font-main">
									{profile?.bio}
								</p>
								<div className="flex flex-col gap-2">
									<div className="flex items-center justify-between">
										<h3 className="font-main text-base text-(--secondary-text) capitalize">
											حمولة منجزة
											عبر المنصة:
										</h3>
										<span className="font-main text-base font-bold text-(--primary-text)">
											63
										</span>
									</div>
									<div className="flex items-center justify-between">
										<h3 className="font-main text-base text-(--secondary-text) capitalize">
											حمولة في آخر
											30 يوم:
										</h3>
										<span className="font-main text-base font-bold text-(--primary-text)">
											63
										</span>
									</div>
									<div className="flex items-center justify-between">
										<h3 className="font-main text-base text-(--secondary-text) capitalize">
											معدل استجابة
											العروض:
										</h3>
										<span className="font-main text-base font-bold text-(--primary-text)">
											63
										</span>
									</div>
									<div className="flex items-center justify-between">
										<h3 className="font-main text-base text-(--secondary-text) capitalize">
											التقييم:
										</h3>
										<span className="font-main text-base font-bold text-(--primary-text)">
											63
										</span>
									</div>
								</div>
								<div>
									<Link
										to={{
											pathname: `/profile/${profile?.username}`,
										}}
									>
										<Button
											size={"lg"}
											className="w-full text-sm rounded-20"
										>
											{t(
												"عرض الملف",
											)}
										</Button>
									</Link>
								</div>
							</div>
							<div className="w-full p-4 rounded-2xl bg-(--secondary-color)">
								{shipment.suggestedBudget && (
									<>
										<h2 className="font-main text-lg text-(--secondary-text) font-normal capitalize mb-2">
											الميزانية
											المقترحة من
											الشاحن
										</h2>
										<h3 className="font-main text-3xl text-(--primary-text) font-bold capitalize mb-2">
											{
												shipment.suggestedBudget
											}
											<span className="text-sm font-light text-(--secondary-text)">
												- جنية
												مصري
											</span>
										</h3>
									</>
								)}
								{shipment.paymentType !==
									"ON_DELIVER" && (
									<h3 className="font-main text-sm text-green-400 font-light capitalize mb-3">
										الدفع عند الإستلام
										متاح
									</h3>
								)}

								<label
									htmlFor="price"
									className="flex flex-col gap-1 mb-4"
								>
									<span className="font-main text-base text-(--primary-text) font-medium">
										عرض السعر الخاص بك
									</span>
									<input
										type="number"
										onChange={(e) => {
											setOffer({
												...offer,
												[e
													.target
													.name]:
													Number(
														e
															.target
															.value,
													),
											});
										}}
										name="price"
										id="price"
										placeholder="0.00"
										className="h-12 bg-(--tertiary-color)/25 font-main text-lg font-medium text-(--primary-text) rounded-xl px-3 focus:outline-0"
									/>
								</label>

								<label
									htmlFor="notes"
									className="flex flex-col gap-1 mb-6"
								>
									<span className="font-main text-base text-(--primary-text) font-medium">
										ملاحظات ( اختياري )
									</span>
									<textarea
										onChange={(e) => {
											setOffer({
												...offer,
												[e
													.target
													.name]:
													e
														.target
														.value,
											});
										}}
										name="notes"
										id="notes"
										placeholder="اكتب تفاصيل إضافية لعرضك..."
										className="font-main bg-(--tertiary-color)/25 placeholder:text-base text-base font-medium text-(--primary-text) rounded-xl p-3 focus:outline-0"
									/>
								</label>

								<Button
									onClick={handleClick}
									disabled={isOfferPending}
									size={"lg"}
									className="w-full text-sm rounded-20 mb-3"
								>
									{!isOfferPending ? (
										<span>
											{t(
												"إرسال العرض",
											)}
										</span>
									) : (
										<Spinner />
									)}
								</Button>

								<h5 className="font-main text-xs font-medium text-(--secondary-text) text-center">
									بإرسالك عرضك انت توافق علي
									شروط الخدمة
								</h5>
							</div>
						</div>
					</div>

					<div className="col-span-9 flex flex-col gap-6">
						{/* Shipment path */}
						<div className="w-full p-5 rounded-2xl bg-(--secondary-color)">
							<div className="flex ietms-center justify-between mb-6">
								<h2 className="font-main font-semibold text-2xl text-(--primary-text) capitalize">
									مسار الرحلة
								</h2>
								<span className="font-main font-normal text-base text-(--secondary-text) capitalize">
									منذ 4 ساعات
								</span>
							</div>
							<div className="px-10">
								<div className="relative flex justify-between before:absolute before:w-full before:top-7 before:z-1 before:h-px before:bg-[linear-gradient(to_right,gray_50%,transparent_50%)] before:bg-size-[30px_1px] before:bg-repeat-x">
									<div className="flex flex-col items-center z-3">
										<div className="w-14 h-14 rounded-full flex items-center justify-center bg-(--primary-color) mb-6">
											<PiFlag className="text-3xl text-(--secondary-color)" />
										</div>
										<span className="font-main text-lg text-(--secondary-text) capitalize font-medium mb-2">
											الإنطلاق
										</span>
										<h2 className="font-main text-2xl text-(--primary-text) capitalize font-bold mb-1">
											{
												shipment.origin.split(
													"-",
												)[0]
											}{" "}
											-{" "}
											{
												shipment.origin.split(
													"-",
												)[1]
											}
										</h2>
										<h3 className="font-main text-lg text-(--primary-text) capitalize font-medium">
											{dateFormat(
												shipment.pickupAt,
											)}
										</h3>
									</div>
									<div className="flex flex-col items-center z-3 gap-2 mt-3">
										<span className="font-main text-sm text-(--primary-text) capitalize font-medium py-2 px-3 rounded-full bg-[#E7E7E7]">
											300 كم . 4.5
											ساعات
										</span>
										<PiTruckTrailer className="text-3xl text-(--secondary-text)" />
									</div>
									<div className="flex flex-col items-center z-3">
										<div className="w-14 h-14 rounded-full flex items-center justify-center bg-(--primary-color) mb-6">
											<PiMapPin className="text-3xl text-(--secondary-color)" />
										</div>
										<span className="font-main text-lg text-(--secondary-text) capitalize font-medium mb-2">
											الوصول
										</span>
										<h2 className="font-main text-2xl text-(--primary-text) capitalize font-bold mb-1">
											{
												shipment.destination.split(
													"-",
												)[0]
											}{" "}
											-{" "}
											{
												shipment.destination.split(
													"-",
												)[1]
											}
										</h2>
										<h3 className="font-main text-lg text-(--primary-text) capitalize font-medium">
											{dateFormat(
												shipment.deliveryAt,
											)}
										</h3>
									</div>
								</div>
							</div>
						</div>
						{/* Shipment images */}
						<div className="w-full p-5 rounded-2xl bg-(--secondary-color)">
							<div className="flex ietms-center justify-between mb-4">
								<h2 className="font-main font-semibold text-2xl text-(--primary-text) capitalize">
									الصور
								</h2>
								<span className="font-main font-normal text-base text-(--secondary-text) capitalize">
									{numFormat(
										shipmentImgs.length,
										[
											"صورة",
											"صورتين",
											"صور",
										],
									)}
								</span>
							</div>
							<div className="w-full flex items-center gap-3 overflow-x-scroll scrollbar-hidden">
								{shipmentImgs.map((img) => {
									return (
										<img
											src={img.url}
											alt="image"
											className="h-36 w-36 rounded-xl duration-300 hover:scale-98 border border-(--primary-color) object-cover"
										/>
									);
								})}
							</div>
						</div>
						{/* Shipment docs */}
						<div className="w-full p-5 rounded-2xl bg-(--secondary-color)">
							<div className="flex ietms-center justify-between mb-4">
								<h2 className="font-main font-semibold text-2xl text-(--primary-text) capitalize">
									المستندات
								</h2>
								<span className="font-main font-normal text-base text-(--secondary-text) capitalize">
									{numFormat(
										shipmentFiles.length,
										[
											"مرفق",
											"مرفقين",
											"مرفقات",
										],
									)}
								</span>
							</div>
							<div className="w-full flex items-center flex-wrap gap-3 overflow-x-scroll scrollbar-hidden">
								{shipmentFiles.map((file) => {
									return (
										<div className="flex items-center gap-4 p-2 border border-(--tertiary-color)/50 rounded-xl">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 flex items-center justify-center bg-(--primary-color)/10 rounded-lg">
													<PiFileText className="text-2xl text-(--primary-text)" />
												</div>
												<div className="flex flex-col gap-0.5">
													<h5 className="w-30 font-main text-base text-(--primary-text) font-normal capitalize whitespace-nowrap overflow-clip text-ellipsis">
														{
															file.name
														}
													</h5>
													<h6 className="font-main text-sm text-(--secondary-text) font-normal capitalize text-ellipsis">{`${file.extension} . ${file.size}`}</h6>
												</div>
											</div>
											<a
												href={
													file.url
												}
												download="file.pdf"
												target="_blank"
											>
												<PiDownloadSimple className="text-2xl text-(--primary-text) duration-300 hover:text-(--primary-color) cursor-pointer" />
											</a>
										</div>
									);
								})}
							</div>
						</div>
						{/* Shipment info */}
						<div className="flex items-center gap-5">
							<div className="w-full p-5 rounded-2xl bg-(--secondary-color) flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<div className="w-12 h-12 rounded-full bg-(--primary-color)/10 flex items-center justify-center">
										<PiShippingContainer className="text-2xl text-(--primary-color)" />
									</div>
									<span className="font-main font-normal text-xl text-(--primary-text) capitalize">
										النوع
									</span>
								</div>
								<h4 className="font-main text-xl text-(--secondary-text) capitalize">
									{shipment.goodsType}
								</h4>
							</div>
							<div className="w-full p-5 rounded-2xl bg-(--secondary-color) flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<div className="w-12 h-12 rounded-full bg-(--primary-color)/10 flex items-center justify-center">
										<PiVectorThree className="text-2xl text-(--primary-color)" />
									</div>
									<span className="font-main font-normal text-xl text-(--primary-text) capitalize">
										الإبعاد
									</span>
								</div>
								<h4 className="font-main text-xl text-(--secondary-text) capitalize">
									{` ${shipment.length}م `}
									<span className="text-base">
										*
									</span>
									{` ${shipment.width}م `}
									<span className="text-base">
										*
									</span>
									{` ${shipment.height} م`}
								</h4>
							</div>
							<div className="w-full p-5 rounded-2xl bg-(--secondary-color) flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<div className="w-12 h-12 rounded-full bg-(--primary-color)/10 flex items-center justify-center">
										<PiFrameCorners className="text-2xl text-(--primary-color)" />
									</div>
									<span className="font-main font-normal text-xl text-(--primary-text) capitalize">
										الوزن
									</span>
								</div>
								<h4 className="font-main text-xl text-(--secondary-text) capitalize">
									{shipment.weight} طن
								</h4>
							</div>
							<div className="w-full p-5 rounded-2xl bg-(--secondary-color) flex flex-col gap-4">
								<div className="flex items-center gap-2">
									<div className="w-12 h-12 rounded-full bg-(--primary-color)/10 flex items-center justify-center">
										<PiTruck className="text-2xl text-(--primary-color)" />
									</div>
									<span className="font-main font-normal text-xl text-(--primary-text) capitalize">
										التغليف
									</span>
								</div>
								<h4 className="font-main text-xl text-(--secondary-text) capitalize">
									{shipment.packaging}
								</h4>
							</div>
						</div>
						{/* Shipment desc */}
						<div className="w-full p-5 rounded-2xl bg-(--secondary-color)">
							<div className="flex flex-col gap-2 mb-3">
								<h2 className="font-main font-semibold text-2xl text-(--primary-text) capitalize">
									الوصف
								</h2>
								<p className="font-main text-xl text-(--secondary-text) font-normal">
									{shipment.description}
								</p>
							</div>
							<div className="flex flex-col gap-2">
								<h2 className="font-main font-semibold text-2xl text-(--primary-text) capitalize">
									متطلبات إضافية
								</h2>
								<div className="w-full px-6 grid grid-cols-12 gap-2">
									{shipment.noFriday && (
										<div className="col-span-6 flex items-center gap-2">
											<PiCheckCircle className="text-xl text-(--primary-color)" />
											<h3 className="font-main text-lg text-(--secondary-text) capitalize">
												ممنوع
												التحميل
												يوم
												الجمعة
											</h3>
										</div>
									)}
									{shipment.twoDrivers && (
										<div className="col-span-6 flex items-center gap-2">
											<PiCheckCircle className="text-xl text-(--primary-color)" />
											<h3 className="font-main text-lg text-(--secondary-text) capitalize">
												مطلوب
												سواقين
												اثنين
											</h3>
										</div>
									)}
									{shipment.stacking && (
										<div className="col-span-6 flex items-center gap-2">
											<PiCheckCircle className="text-xl text-(--primary-color)" />
											<h3 className="font-main text-lg text-(--secondary-text) capitalize">
												يمكنك
												ضغط
												الحمولة
												عند
												التحميل
											</h3>
										</div>
									)}
									{shipment.additionalInsurance && (
										<div className="col-span-6 flex items-center gap-2">
											<PiCheckCircle className="text-xl text-(--primary-color)" />
											<h3 className="font-main text-lg text-(--secondary-text) capitalize">
												يمكنك
												ضغط
												الحمولة
												عند
												التحميل
											</h3>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="w-full p-5 rounded-2xl bg-(--secondary-color)">
							<div className="flex items-center justify-between mb-4">
								<h2 className="font-main font-semibold text-2xl text-(--primary-text) capitalize">
									الخريطة
								</h2>
							</div>
                            <div className="w-full h-80">
                                <ShipmentMap
                                    originLat={shipment.origin_lat}
                                    originLng={shipment.origin_lng}
                                    destinationLat={
                                        shipment.destination_lat
                                    }
                                    destinationLng={
                                        shipment.destination_lng
                                    }
                                    originName={shipment.origin}
                                    destinationName={
                                        shipment.destination
                                    }
                                />
                            </div>
						</div>
					</div>
				</div>
			</section>
		</Main>
	);
}

export default Shipment;
