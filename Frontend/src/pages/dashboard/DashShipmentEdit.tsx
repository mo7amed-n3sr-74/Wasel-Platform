import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { PiInfo } from "react-icons/pi";
import { useNotification } from "@/components/NotificationContext";
import type { Shipment } from "@/shared/interfaces/Interfaces";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUpdateShipment } from "@/api/hooks/shipments/useUpdateShipment";
import { useShipment } from "@/api/hooks/shipments/useShipment";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { packagingItems, shipmentTypes } from "@/shared/data/data";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { ar } from "date-fns/locale";
import LocationTracker from "@/components/LocationPicker";
import DashHeader from "./components/DashHeader";
import Loader from "@/components/Loader";

dayjs.locale("ar");

function DashShipmentEdit() {
	const { shipmentId } = useParams<{ shipmentId: string }>();
	const navigate = useNavigate();
	const { addNotification } = useNotification();
	const { t } = useTranslation();

	// Fetch existing shipment
	const { data: shipmentResponse, isLoading: isShipmentLoading } =
		useShipment(shipmentId);
	const shipment = shipmentResponse?.data as Shipment | undefined;

	// Update mutation
	const { mutate, isPending, isError, error, isSuccess } =
		useUpdateShipment(shipmentId);

	// States
	const [editShipment, setEditShipment] = useState<Shipment | null>(null);

	// Initialize form with shipment data
	useEffect(() => {
		if (shipment) {
			setEditShipment(shipment);
		}
	}, [shipment]);

	// Handle success/error
	useEffect(() => {
		if (isSuccess) {
			addNotification(t("تم تحديث الشحنة بنجاح"), "success", 5000);
			navigate(`/dashboard/shipments/${shipmentId}/offers`);
		}

		if (isError) {
			const axiosMeg = axios.isAxiosError(error)
				? error.response?.data.message
				: "حدث خطأ ما";
			addNotification(t(axiosMeg), "error", 5000);
		}
	}, [isError, isSuccess, error, addNotification, navigate, shipmentId, t]);

	const handleChange = (
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		if (!editShipment) return;

		setEditShipment((prev) => {
			if (!prev) return prev;
			if (
				e.target instanceof HTMLInputElement &&
				e.target.type === "checkbox"
			) {
				return { ...prev, [e.target.name]: e.target.checked };
			} else if (
				e.target instanceof HTMLInputElement &&
				e.target.type === "number"
			) {
				return { ...prev, [e.target.name]: +e.target.value };
			} else {
				return { ...prev, [e.target.name]: e.target.value };
			}
		});
	};

	// Calculate distance and ETA using OSRM API
	const calculateDistanceAndETA = async (
		originLat: number,
		originLng: number,
		destinationLat: number,
		destinationLng: number,
	): Promise<{ distance: string; eta: string } | null> => {
		try {
			const response = await fetch(
				`https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}?overview=false`,
			);
			const data = await response.json();

			if (data.routes && data.routes.length > 0) {
				const route = data.routes[0];
				const distanceKm = (route.distance / 1000).toFixed(2);
				const durationSeconds = route.duration;

				const hours = Math.floor(durationSeconds / 3600);
				const minutes = Math.floor(
					(durationSeconds % 3600) / 60,
				);
				const eta =
					hours > 0
						? `${hours}h ${minutes}m`
						: `${minutes}m`;

				return {
					distance: `${distanceKm} km`,
					eta: eta,
				};
			}
			return null;
		} catch (error) {
			console.error("Error calculating distance:", error);
			return null;
		}
	};

	const handleSubmit = async (
		e: FormEvent<HTMLFormElement | HTMLInputElement>,
	) => {
		e.preventDefault();
		if (!editShipment) return;

		mutate(editShipment as unknown as Record<string, unknown>);
	};

	if (isShipmentLoading) {
		return (
			<section className="w-full h-full">
				<DashHeader title="تعديل الشحنة" />
				<div className="h-[calc(100%-52px)] flex items-center justify-center">
					<Loader />
				</div>
			</section>
		);
	}

	if (!shipment || !editShipment) {
		return (
			<section className="w-full h-full">
				<DashHeader title="تعديل الشحنة" />
				<div className="h-[calc(100%-52px)] flex items-center justify-center">
					<div className="text-center">
						<p className="font-main text-lg text-(--secondary-text)">
							لم يتم العثور على الشحنة
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="w-full h-full overflow-hidden">
			<DashHeader title="تعديل الشحنة" />
			<div className="h-[calc(100%-52px)] overflow-y-auto scrollbar-hidden">
				<form
					encType="multipart/form-data"
					onSubmit={handleSubmit}
					className="h-full flex flex-col gap-5 py-6"
				>
					{/* Shipment Type */}
					<div className="w-full rounded-20 bg-(--secondary-color) p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--primary-color) text-(--secondary-color)">
								<span className="font-main font-medium text-xl">
									1
								</span>
							</div>
							<h3 className="font-main font-medium text-2xl text-(--primary-text)">
								نوع الشحنة
							</h3>
						</div>
						<div className="grid grid-cols-12 gap-2.5">
							{shipmentTypes.map((i) => (
								<div
									key={i.type}
									onClick={() =>
										setEditShipment({
											...editShipment,
											shipmentType:
												i.type,
										})
									}
									className={`col-span-3 h-36 flex flex-col items-center justify-center gap-2 border-2 rounded-20 transition-all cursor-pointer ${
										editShipment.shipmentType ===
										i.type
											? "border-(--primary-color) bg-(--primary-color)/5"
											: "border-(--secondary-text) hover:border-(--primary-color)/50"
									}`}
								>
									<div className="w-14 h-14 flex items-center justify-center rounded-full bg-(--primary-color)/10">
										<i.icon className="text-3xl text-(--primary-color)" />
									</div>
									<h5 className="font-main font-medium text-base text-(--primary-text)">
										{i.type}
									</h5>
								</div>
							))}
						</div>
					</div>

					{/* General Details */}
					<div className="w-full rounded-20 bg-(--secondary-color) p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
								<span className="font-main font-medium text-xl">
									2
								</span>
							</div>
							<h3 className="font-main font-medium text-2xl text-(--primary-text)">
								تفاصيل الشحنة العامة
							</h3>
						</div>

						<div className="flex items-center gap-5">
							<div className="w-1/2 flex flex-col items-start gap-1">
								<label className="font-main font-medium text-xl text-(--primary-text)">
									نوع التغليف
								</label>
								<Select
									value={
										editShipment.packaging
									}
									onValueChange={(value) =>
										setEditShipment({
											...editShipment,
											packaging:
												value,
										})
									}
								>
									<SelectTrigger className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main">
										<SelectValue placeholder="اختر نوع التغليف" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>
												أنواع
												التغليف
											</SelectLabel>
											{(
												packagingItems as string[]
											).map(
												(
													item,
												) => (
													<SelectItem
														key={
															item
														}
														value={
															item
														}
													>
														{
															item
														}
													</SelectItem>
												),
											)}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="w-1/2 flex flex-col items-start gap-1">
								<label className="font-main font-medium text-xl text-(--primary-text)">
									طبيعة المواد
								</label>
								<input
									type="text"
									onChange={handleChange}
									name="goodsType"
									value={
										editShipment.goodsType
									}
									placeholder="مثال: مواد بناء، ملابس، إلكترونتات..."
									className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main font-medium placeholder:text-base text-base text-(--primary-text) focus:outline-none px-3"
								/>
							</div>
						</div>
					</div>

					{/* Basic Data */}
					<div className="w-full rounded-20 bg-(--secondary-color) p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
								<span className="font-main font-medium text-xl">
									3
								</span>
							</div>
							<h3 className="font-main font-medium text-2xl text-(--primary-text)">
								البيانات الأساسية
							</h3>
						</div>

						<div className="grid grid-cols-12 gap-5 mb-3">
							<label className="col-span-4 flex flex-col items-start gap-1">
								<span className="font-main font-medium text-xl text-(--primary-text)">
									الوزن الكلي
								</span>
								<div className="relative w-full h-12 flex items-center border border-(--tertiary-color) rounded-10 px-3">
									<input
										type="number"
										onChange={
											handleChange
										}
										name="weight"
										value={
											editShipment.weight
										}
										placeholder="0"
										className="w-full h-full font-main font-medium placeholder:text-base text-lg text-(--primary-text) focus:outline-none"
									/>
									<span className="font-main font-light text-base text-(--tertiary-color)">
										طن
									</span>
								</div>
							</label>

							<label className="col-span-4 flex flex-col items-start gap-1">
								<span className="font-main font-medium text-xl text-(--primary-text)">
									عدد القطع / البالتات
								</span>
								<input
									type="number"
									name="chunksCount"
									value={editShipment.width}
									placeholder="0"
									className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main font-medium placeholder:text-base text-base text-(--primary-text) focus:outline-none px-3"
								/>
							</label>

							<label className="col-span-4 flex items-end mb-3">
								<div className="flex items-center gap-3">
									<input
										type="checkbox"
										onChange={
											handleChange
										}
										checked={
											editShipment.stacking
										}
										name="stacking"
										id="stacking"
										className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
									/>
									<h3 className="font-main text-xl font-medium text-(--secondary-text)">
										قابل للتكديس
									</h3>
								</div>
							</label>

							<div className="col-span-12 flex flex-col items-start gap-1">
								<label className="font-main font-medium text-xl text-(--primary-text)">
									أبعاد الحمولة
								</label>
								<div className="w-full flex items-center gap-5">
									<label className="w-full flex flex-col gap-1">
										<span className="font-main text-sm text-(--secondary-text)">
											الطول (سم)
										</span>
										<input
											type="number"
											onChange={
												handleChange
											}
											name="length"
											value={
												editShipment.length
											}
											placeholder="0"
											className="w-full h-12 px-3 font-main font-medium placeholder:text-base text-base text-(--primary-text) rounded-10 border border-(--tertiary-color) focus:outline-none"
										/>
									</label>
									<label className="w-full flex flex-col gap-1">
										<span className="font-main text-sm text-(--secondary-text)">
											العرض (سم)
										</span>
										<input
											type="number"
											onChange={
												handleChange
											}
											name="width"
											value={
												editShipment.width
											}
											placeholder="0"
											className="w-full h-12 px-3 font-main font-medium placeholder:text-base text-base text-(--primary-text) rounded-10 border border-(--tertiary-color) focus:outline-none"
										/>
									</label>
									<label className="w-full flex flex-col gap-1">
										<span className="font-main text-sm text-(--secondary-text)">
											الارتفاع (سم)
										</span>
										<input
											type="number"
											onChange={
												handleChange
											}
											name="height"
											value={
												editShipment.height
											}
											placeholder="0"
											className="w-full h-12 px-3 font-main font-medium placeholder:text-base text-base text-(--primary-text) rounded-10 border border-(--tertiary-color) focus:outline-none"
										/>
									</label>
								</div>
							</div>

							<div className="col-span-12 flex flex-col items-start gap-1">
								<label className="font-main font-medium text-xl text-(--primary-text)">
									الوصف
								</label>
								<textarea
									onChange={handleChange}
									name="description"
									value={
										editShipment.description
									}
									maxLength={300}
									placeholder="اكتب تفاصيل إضافية..."
									className="w-full font-main font-normal border border-(--tertiary-color) rounded-10 p-3"
								/>
							</div>
						</div>
						<div className="flex items-center gap-1">
							<PiInfo className="text-2xl text-(--tertiary-color)" />
							<h6 className="font-main font-medium text-base text-(--tertiary-color)">
								يمنع مشاركة معلومات الإتصال في
								هذا الحقل
							</h6>
						</div>
					</div>

					{/* Journey Path */}
					<div className="w-full rounded-20 bg-(--secondary-color) p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
								<span className="font-main font-medium text-xl">
									4
								</span>
							</div>
							<h3 className="font-main font-medium text-2xl text-(--primary-text)">
								مسار الرحلة
							</h3>
						</div>

						<div className="w-full flex items-center gap-5 mb-3">
							<label className="w-full flex flex-col gap-1">
								<span className="font-main font-normal text-lg text-(--secondary-text)">
									تاريخ الإنطلاق
								</span>
								<Popover>
									<PopoverTrigger>
										<Button
											type="button"
											variant="outline"
											data-empty={
												!editShipment.pickupAt
											}
											className="w-full h-12 font-main flex items-center justify-between px-3 rounded-10 border border-(--tertiary-color) bg-transparent hover:bg-transparent data-[empty=true]:text-muted-foreground"
										>
											{editShipment.pickupAt ? (
												dayjs(
													editShipment.pickupAt,
												).format(
													"DD MMMM YYYY",
												)
											) : (
												<span className="text-base text-(--primary-text)/50">
													{t(
														"Pick a pickup date",
													)}
												</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0 z-9999"
										align="end"
									>
										<Calendar
											mode="single"
											selected={
												editShipment.pickupAt
											}
											onSelect={(
												date,
											) => {
												setEditShipment(
													{
														...editShipment,
														pickupAt: date,
													},
												);
											}}
											locale={ar}
											dir="rtl"
										/>
									</PopoverContent>
								</Popover>
							</label>

							<label className="w-full flex flex-col gap-1">
								<span className="font-main font-normal text-lg text-(--secondary-text)">
									تاريخ الوصول
								</span>
								<Popover>
									<PopoverTrigger>
										<Button
											type="button"
											variant="outline"
											data-empty={
												!editShipment.deliveryAt
											}
											className="w-full h-12 font-main flex items-center justify-between px-3 rounded-10 border border-(--tertiary-color) bg-transparent hover:bg-transparent data-[empty=true]:text-muted-foreground"
										>
											{editShipment.deliveryAt ? (
												dayjs(
													editShipment.deliveryAt,
												).format(
													"DD MMMM YYYY",
												)
											) : (
												<span className="text-base text-(--primary-text)/50">
													{t(
														"Pick a deliver date",
													)}
												</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0 z-9999"
										align="end"
										dir="rtl"
									>
										<Calendar
											mode="single"
											selected={
												editShipment.deliveryAt
											}
											onSelect={(
												date,
											) => {
												setEditShipment(
													{
														...editShipment,
														deliveryAt:
															date,
													},
												);
											}}
											locale={ar}
											dir="rtl"
										/>
									</PopoverContent>
								</Popover>
							</label>
						</div>

						<div className="w-full">
							<LocationTracker
								origin={
									editShipment.origin
										? {
												lat:
													editShipment.origin_lat ||
													0,
												lng:
													editShipment.origin_lng ||
													0,
												name: editShipment.origin,
											}
										: undefined
								}
								destination={
									editShipment.destination
										? {
												lat:
													editShipment.destination_lat ||
													0,
												lng:
													editShipment.destination_lng ||
													0,
												name: editShipment.destination,
											}
										: undefined
								}
								onOriginSelect={(
									lat,
									lng,
									name,
								) => {
									const updated = {
										...editShipment,
										origin: name,
										origin_lat: lat,
										origin_lng: lng,
									};

									if (
										updated.destination_lat &&
										updated.destination_lng
									) {
										calculateDistanceAndETA(
											lat,
											lng,
											updated.destination_lat,
											updated.destination_lng,
										).then((result) => {
											if (result) {
												setEditShipment(
													(
														prev,
													) =>
														prev
															? {
																	...prev,
																	distance: result.distance,
																	ETA: result.eta,
																}
															: prev,
												);
											}
										});
									}

									setEditShipment(updated);
								}}
								onDestinationSelect={(
									lat,
									lng,
									name,
								) => {
									const updated = {
										...editShipment,
										destination: name,
										destination_lat:
											lat,
										destination_lng:
											lng,
									};

									if (
										updated.origin_lat &&
										updated.origin_lng
									) {
										calculateDistanceAndETA(
											updated.origin_lat,
											updated.origin_lng,
											lat,
											lng,
										).then((result) => {
											if (result) {
												setEditShipment(
													(
														prev,
													) =>
														prev
															? {
																	...prev,
																	distance: result.distance,
																	ETA: result.eta,
																}
															: prev,
												);
											}
										});
									}

									setEditShipment(updated);
								}}
								onOriginReset={() => {
									setEditShipment({
										...editShipment,
										origin: "",
										origin_lat:
											undefined,
										origin_lng:
											undefined,
										distance: undefined,
										ETA: undefined,
									});
								}}
								onDestinationReset={() => {
									setEditShipment({
										...editShipment,
										destination: "",
										destination_lat:
											undefined,
										destination_lng:
											undefined,
										distance: undefined,
										ETA: undefined,
									});
								}}
							/>
						</div>

						{editShipment.distance &&
							editShipment.ETA && (
								<div className="w-full rounded-20 bg-(--secondary-color) my-5 p-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="p-4 bg-(--tertiary-color)/5 rounded-10 border border-(--tertiary-color)">
											<p className="font-main text-sm text-(--tertiary-color) mb-2">
												المسافة
												الكلية
											</p>
											<p className="font-main font-bold text-xl text-(--primary-text)">
												{
													editShipment.distance
												}
											</p>
										</div>
										<div className="p-4 bg-(--tertiary-color)/5 rounded-10 border border-(--tertiary-color)">
											<p className="font-main text-sm text-(--tertiary-color) mb-2">
												الوقت
												المتوقع
											</p>
											<p className="font-main font-bold text-xl text-(--primary-text)">
												{
													editShipment.ETA
												}
											</p>
										</div>
									</div>
								</div>
							)}
					</div>

					{/* Additional Options */}
					<div className="w-full rounded-20 bg-(--secondary-color) p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
								<span className="font-main font-medium text-xl">
									5
								</span>
							</div>
							<h3 className="font-main font-medium text-2xl text-(--primary-text)">
								خيارات إضافية
							</h3>
						</div>

						<div className="flex items-center justify-between flex-wrap gap-5">
							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									onChange={handleChange}
									checked={
										editShipment.urgent
									}
									name="urgent"
									id="urgent"
									className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
								/>
								<h3 className="font-main text-xl font-medium text-(--secondary-text)">
									عاجل
								</h3>
							</div>

							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									onChange={handleChange}
									checked={
										editShipment.additionalInsurance
									}
									name="additionalInsurance"
									id="additionalInsurance"
									className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
								/>
								<h3 className="font-main text-xl font-medium text-(--secondary-text)">
									تأمين إضافي
								</h3>
							</div>

							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									onChange={handleChange}
									checked={
										editShipment.twoDrivers
									}
									name="twoDrivers"
									id="twoDrivers"
									className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
								/>
								<h3 className="font-main text-xl font-medium text-(--secondary-text)">
									سائقين
								</h3>
							</div>

							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									onChange={handleChange}
									checked={
										editShipment.noFriday
									}
									name="noFriday"
									id="noFriday"
									className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
								/>
								<h3 className="font-main text-xl font-medium text-(--secondary-text)">
									بدون يوم جمعة
								</h3>
							</div>
						</div>
					</div>

					{/* Budget and Payment */}
					<div className="w-full rounded-20 bg-(--secondary-color) p-5">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
								<span className="font-main font-medium text-xl">
									6
								</span>
							</div>
							<h3 className="font-main font-medium text-2xl text-(--primary-text)">
								الميزانية والدفع
							</h3>
						</div>

						<div className="flex items-center gap-5">
							<div className="w-1/2 flex flex-col items-start gap-1">
								<label className="font-main font-medium text-xl text-(--primary-text)">
									نوع الميزانية
								</label>
								<Select
									value={
										editShipment.budgetType
									}
									onValueChange={(value) =>
										setEditShipment({
											...editShipment,
											budgetType:
												value,
										})
									}
								>
									<SelectTrigger className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main">
										<SelectValue placeholder="اختر نوع الميزانية" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="OPEN_BUDGET">
												ميزانية
												مفتوحة
											</SelectItem>
											<SelectItem value="FIXED_BUDGET">
												ميزانية
												محدودة
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className="w-1/2 flex flex-col items-start gap-1">
								<label className="font-main font-medium text-xl text-(--primary-text)">
									نوع الدفع
								</label>
								<Select
									value={
										editShipment.paymentType
									}
									onValueChange={(value) =>
										setEditShipment({
											...editShipment,
											paymentType:
												value,
										})
									}
								>
									<SelectTrigger className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main">
										<SelectValue placeholder="اختر نوع الدفع" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="ON_DELIVER">
												عند
												التسليم
											</SelectItem>
											<SelectItem value="ON_PICKUP">
												عند
												الانطلاق
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-3">
						<Button
							className="w-48 h-13"
							size="xl"
							type="submit"
							disabled={isPending}
						>
							{isPending ? (
								<Spinner />
							) : (
								"حفظ التعديلات"
							)}
						</Button>
						<Button
							variant="outline"
							className="w-48 h-13"
							size="xl"
							type="button"
							onClick={() =>
								navigate(
									`/dashboard/shipments/${shipmentId}`,
								)
							}
						>
							إلغاء
						</Button>
					</div>
				</form>
			</div>
		</section>
	);
}

export default DashShipmentEdit;
