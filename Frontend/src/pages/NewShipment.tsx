import { useEffect, useRef, useState } from "react";
import { useProps } from "@/components/PropsProvider";
import type { ChangeEvent, FormEvent } from "react";
import {
	PiDotsThree,
	PiInfo,
	PiCameraLight,
	PiFileArrowUpLight,
	PiX,
	PiTrash,
	PiFilePdf,
	PiFileDoc,
} from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/components/NotificationContext";
import type { Shipment } from "@/shared/interfaces/Interfaces";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Main from "@/components/Main";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateShipment } from "@/api/hooks/shipments/useCreateShipment";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
	newShipmentSections,
	packagingItems,
	shipmentTypes,
} from "@/shared/data/data";
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

dayjs.locale("ar");

function NewShipment() {
	const newShipmentObject: Shipment = {
		origin: "",
		destination: "",
		shipmentType: "",
		packaging: "",
		goodsType: "",
		weight: 0,
		length: 0,
		width: 0,
		height: 0,
		pickupAt: undefined,
		deliveryAt: undefined,
		description: "",

		budgetType: "",
		paymentType: "",
	};

	const { user } = useProps();
	const navigate = useNavigate();
	const { addNotification } = useNotification();
	const { t } = useTranslation();
	const spansRef = useRef<HTMLSpanElement[]>([]);
	const { data, mutate, isPending, isError, error, isSuccess } =
		useCreateShipment();

	// Components' states
	const [newShipment, setNewShipment] =
		useState<Shipment>(newShipmentObject);
	const [shipmentImgs, setShipmentImgs] = useState<File[]>([]);
	const [shipmentDocs, setShipmentDocs] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	useEffect(() => {
		if (!user) {
			navigate("/");
		}
	}, [user]);

	useEffect(() => {
		if (!shipmentImgs) return;

		setPreviewUrls(
			shipmentImgs.map((img) => {
				return URL.createObjectURL(img);
			}),
		);

		return () => {
			previewUrls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [shipmentImgs]);

	useEffect(() => {
		if (isSuccess) {
			addNotification(t(data.data?.message), "success", 5000);
			setNewShipment(newShipmentObject);			
		}

		if (isError) {
			const axiosMeg = axios.isAxiosError(error)
				? error.response?.data.message
				: "حدث خطأ ما";
			addNotification(t(axiosMeg), "error", 5000);
		}
	}, [isError, isSuccess]);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		setNewShipment((prev) => {
			if (e.target.type === "checkbox") {
				return { ...prev, [e.target.name]: e.target.checked };
			} else if (e.target.type === "number") {
				return { ...prev, [e.target.name]: +e.target.value };
			} else {
				return { ...prev, [e.target.name]: e.target.value };
			}
		});
	};

	const handleFileUploading = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (!e.target.files?.length || !spansRef.current) return;

		if (e.target.files.length > e.target.maxLength) {
			spansRef.current.forEach((span) => {
				if (span.dataset.span === e.target.name) {
					span.classList.remove("hidden");
					span.textContent = `لا يمكنك رفع أكثر من 3 ${span.dataset.span === "shipmentImgs" ? "صور" : "ملفات"}`;

					setTimeout(() => {
						span.classList.add("hidden");
					}, 5000);
					return;
				}
			});
		} else if (
			e.target.files.length < e.target.maxLength &&
			e.target.name !== "shipmentDocs"
		) {
			spansRef.current.forEach((span) => {
				if (span.dataset.span === e.target.name) {
					span.classList.remove("hidden");
					span.textContent = `قم بتحديد ورفع 3 ${span.dataset.span === "shipmentImgs" ? "صور" : "ملفات"} علي الاقل`;

					setTimeout(() => {
						span.classList.add("hidden");
					}, 5000);
					return;
				}
			});
		} else {
			if (e.target.name === "shipmentImgs") {
				setShipmentImgs(Array.from(e.target.files));
			} else {
				setShipmentDocs(Array.from(e.target.files));
			}
		}
	};

	const handleFileDeleting = (field: string, index: number) => {
		if (field === "shipmentDocs") {
			setShipmentDocs(shipmentDocs.filter((_, i) => i !== index));
		} else {
			URL.revokeObjectURL(previewUrls[index]); // Release url of removed img
			setShipmentImgs(shipmentImgs.filter((_, i) => i !== index));
		}
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

				// Convert duration to human-readable format
				const hours = Math.floor(durationSeconds / 3600);
				const minutes = Math.floor(
					(durationSeconds % 3600) / 60,
				);
				const eta =
					hours > 0
						? `${hours}h ${minutes}m`
						: `${minutes}m`;


				// setNewShipment({ ...newShipment, ETA: eta, distance: distance })
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

		if (shipmentImgs.length < 3) {
			addNotification("لا يمكنك رفع أقل من 3 صور", "warning", 5000);
			return;
		}

		if (shipmentDocs.length < 1) {
			addNotification("لا يمكنك رفع أقل مرفق", "warning", 5000);
			return;
		}

		const formData = new FormData();
		for (const shipmentImg of shipmentImgs) {
			formData.append("shipmentImgs", shipmentImg);
		}

		for (const shipmentDoc of shipmentDocs) {
			formData.append("shipmentDocs", shipmentDoc);
		}

		const validDate = dayjs(newShipment.deliveryAt).diff(newShipment.pickupAt, "days")  > 1? true : false;
		if(!validDate) {
			addNotification(
				`تاريخ غير صالح`,
				"warning",
				5000,
			);
			return;
		}

		// for (const value of Object.values(newShipmentObject)) {
		// 	if (typeof value !== "boolean" && !value) {
		// 		addNotification(
		// 			`من فضلك أدخل تفاصيل الحمولة كاملة أولاً`,
		// 			"warning",
		// 			5000,
		// 		);
		// 		return;
		// 	}
		// }

		formData.set("data", JSON.stringify(newShipment));

		mutate(formData);
	};

	return (
		<Main>
			<section className="container mx-auto px-4 sm:px-0 min-h-screen pt-34 mb-24">
				<div className="w-full h-full grid grid-cols-12 gap-5">
					<div className="md:hidden lg:block col-span-3">
						<ul className="flex flex-col gap-3">
							{newShipmentSections.map(
								(sec, idx) => {
									return (
										<li className="w-full py-2 flex items-center gap-3 text-xl text-(--scondary-color) p-3 bg-(--primary-color)/6 rounded-20 border border-transparent hover:border-(--primary-color) cursor-pointer">
											<div className="w-12 h-12 flex items-center justify-center rounded-full border border-(--primary-color)">
												<span className="font-main font-medium text-2xl text-(--primary-color)">
													{idx +
														1}
												</span>
											</div>
											<span className="font-main font-medium text-lg text-(--primary-text) capitalize">
												{
													sec.title
												}
											</span>
										</li>
									);
								},
							)}
						</ul>
					</div>
					<div className="col-span-12 lg:col-span-9">
						<form
							encType="multipart/form-data"
							onSubmit={handleSubmit}
							className="flex flex-col"
						>
							<div className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5">
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
									{shipmentTypes.map(
										(i, idx) => {
											const Icon =
												i.icon;
											return (
												<div className="col-span-3">
													<label
														htmlFor={`shipment-type-${idx}`}
														className="h-36 flex flex-col items-center justify-center gap-2 border border-(--secondary-text) rounded-20 transition-colors duration-200 has-[input:checked]:border-transparent has-[input:checked]:bg-(--tertiary-color)/25 hover:bg-(--tertiary-color)/25 cursor-pointer"
													>
														<div className="w-14 h-14 flex items-center justify-center rounded-full bg-(--primary-color)/10">
															<Icon className="text-3xl text-(--primary-color)" />
														</div>
														<h5 className="font-main font-medium text-lg text-(--primary-text)">
															{
																i.type
															}
														</h5>
														<input
															type="radio"
															onChange={
																handleChange
															}
															value={
																i.type
															}
															name="shipmentType"
															id={`shipment-type-${idx}`}
															className="hidden"
														/>
													</label>
												</div>
											);
										},
									)}
									<div className="col-span-3 h-36 flex flex-col items-center justify-center gap-2 border border-(--secondary-text) rounded-20 transition-colors duration-300 hover:border-transparent hover:bg-(--tertiary-color)/25 cursor-pointer">
										<div className="w-14 h-14 flex items-center justify-center rounded-full bg-(--primary-color)/10">
											<PiDotsThree className="text-3xl text-(--primary-color)" />
										</div>
										<h5 className="font-main font-medium text-lg text-(--primary-text)">
											أخري
										</h5>
									</div>
								</div>
							</div>

							<div className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5">
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
										<label
											htmlFor="packaging"
											className="font-main font-medium text-xl text-(--primary-text)"
										>
											نوع التغليف
										</label>
										<Select
											onValueChange={(
												value,
											) =>
												setNewShipment(
													{
														...newShipment,
														packaging:
															value,
													},
												)
											}
											name="packaging"
										>
											<SelectTrigger
												className="w-full font-main font-medium text-base text-(--primary-text) border border-(--tertiary-color) rounded-10"
												size="xl"
											>
												<SelectValue placeholder="إختر نوع التغليف" />
											</SelectTrigger>
											<SelectContent className="w-full">
												<SelectGroup className="font-main">
													<SelectLabel>
														التغليف
													</SelectLabel>
													{packagingItems.map(
														(
															item,
															idx,
														) => {
															return (
																<SelectItem
																	key={
																		idx
																	}
																	value={
																		item
																	}
																>
																	{
																		item
																	}
																</SelectItem>
															);
														},
													)}
												</SelectGroup>
											</SelectContent>
										</Select>
									</div>

									<div className="w-1/2 flex flex-col items-start gap-1">
										<label
											htmlFor="goodsType"
											className="font-main font-medium text-xl text-(--primary-text)"
										>
											طبيعة المواد
										</label>
										<input
											type="text"
											onChange={
												handleChange
											}
											name="goodsType"
											placeholder="مثال: مواد بناء، ملابس، إلكترونتات..."
											className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main font-medium placeholder:text-base text-base text-(--primary-text) focus:outline-none px-3 "
										/>
									</div>
								</div>
							</div>

							<div className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5">
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
									<label
										htmlFor="weight"
										className="col-span-4 flex flex-col items-start gap-1"
									>
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
												placeholder="0"
												className="w-full h-full font-main font-medium placeholder:text-base text-lg text-(--primary-text) focus:outline-none"
											/>
											<span className="font-main font-light text-base text-(--tertiary-color)">
												طن
											</span>
										</div>
									</label>
									<label
										htmlFor="chunksCount"
										className="col-span-4 flex flex-col items-start gap-1"
									>
										<span className="font-main font-medium text-xl text-(--primary-text)">
											عدد القطع /
											البالتات
										</span>
										<input
											type="number"
											name="chunksCount"
											placeholder="0"
											className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main font-medium placeholder:text-base text-base text-(--primary-text) focus:outline-none px-3"
										/>
									</label>
									<label
										htmlFor="stacking"
										className="col-span-4 flex items-end mb-3"
									>
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												onChange={
													handleChange
												}
												name="stacking"
												id="stacking"
												className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
											/>
											<h3 className="font-main text-xl font-medium text-(--secondary-text)">
												قابل
												للتكديس
											</h3>
										</div>
									</label>
									<div className="col-span-12 flex flex-col items-start gap-1">
										<label
											htmlFor="packaging"
											className="font-main font-medium text-xl text-(--primary-text)"
										>
											أبعاد الحمولة
										</label>
										<div className="w-full flex items-center gap-5">
											<label
												htmlFor="length"
												className="w-full flex flex-col gap-1"
											>
												<span className="font-main font-normal text-lg text-(--secondary-text)">
													الطول
												</span>
												<input
													type="number"
													onChange={
														handleChange
													}
													name="length"
													placeholder="0"
													className="w-full h-12 px-3 font-main font-medium placeholder:text-base text-base text-(--primary-text) rounded-10 border border-(--tertiary-color) focus:outline-none"
												/>
											</label>
											<label
												htmlFor="width"
												className="w-full flex flex-col gap-1"
											>
												<span className="font-main font-normal text-lg text-(--secondary-text)">
													العرض
												</span>
												<input
													type="number"
													onChange={
														handleChange
													}
													name="width"
													placeholder="0"
													className="w-full h-12 px-3 font-main font-medium placeholder:text-base text-base text-(--primary-text) rounded-10 border border-(--tertiary-color) focus:outline-none"
												/>
											</label>
											<label
												htmlFor="height"
												className="w-full flex flex-col gap-1"
											>
												<span className="font-main font-normal text-lg text-(--secondary-text)">
													الإرتفاع
												</span>
												<input
													type="number"
													onChange={
														handleChange
													}
													name="height"
													placeholder="0"
													className="w-full h-12 px-3 font-main font-medium placeholder:text-base text-base text-(--primary-text) rounded-10 border border-(--tertiary-color) focus:outline-none"
												/>
											</label>
										</div>
									</div>
									<div className="col-span-12 flex flex-col items-start gap-1">
										<label
											htmlFor="description"
											className="font-main font-medium text-xl text-(--primary-text)"
										>
											الوصف{" "}
											<span className="text-(--red-color)">
												*
											</span>
										</label>
										<textarea
											onChange={(
												e,
											) =>
												setNewShipment(
													{
														...newShipment,
														[e
															.target
															.name]:
															e
																.target
																.value,
													},
												)
											}
											name="description"
											maxLength={
												300
											}
											id="shipmentDesc"
											placeholder="اكتب تفاصيل إضافية..."
											className="w-full font-main font-normal border border-(--tertiary-color) rounded-10 p-3"
										></textarea>
									</div>
								</div>
								<div className="flex items-center gap-1">
									<PiInfo className="text-2xl text-(--tertiary-color)" />
									<h6 className="font-main font-medium text-base text-(--tertiary-color)">
										يمنع مشاركة معلومات
										الإتصال في هذا الحقل
									</h6>
								</div>
							</div>

							<div
								id="journeyPath"
								className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5"
							>
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
									<label
										htmlFor="pickup-date"
										className="w-full flex flex-col gap-1"
									>
										<span className="font-main font-normal text-lg text-(--secondary-text)">
											تاريخ الإنطلاق
										</span>
										{/* <div className="w-full h-12 flex items-center justify-between px-3 rounded-10 border border-(--tertiary-color)">
                                            <input type="date" onChange={(e) => setNewShipment({ ...newShipment, pickupAt: e.target.value })} id="pickup-date" placeholder="يوم/شهر/سنة" className="w-full h-full font-main font-medium placeholder:text-base text-lg text-(--primary-text) focus:outline-none" />
                                        </div> */}
										<Popover>
											<PopoverTrigger
												asChild
											>
												<Button
													type="button"
													variant="outline"
													data-empty={
														!newShipment.pickupAt
													}
													className="w-full h-12 font-main flex items-center justify-between px-3 rounded-10 border border-(--tertiary-color) bg-transparent hover:bg-transparent data-[empty=true]:text-muted-foreground"
												>
													{newShipment.pickupAt ? (
														dayjs(
															newShipment.pickupAt,
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
													{/* <ChevronDownIcon /> */}
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0 z-50"
												align="end"
											>
												<Calendar
													mode="single"
													selected={
														newShipment.pickupAt
													}
													onSelect={(
														date,
													) => {
														setNewShipment(
															(
																prev,
															) => {
																return {
																	...prev,
																	pickupAt: date,
																};
															},
														);
													}}
													locale={
														ar
													}
													dir="rtl"
												/>
											</PopoverContent>
										</Popover>
									</label>
									<label
										htmlFor="dest-date"
										className="w-full flex flex-col gap-1"
									>
										<span className="font-main font-normal text-lg text-(--secondary-text)">
											تاريخ الوصول
										</span>
										<Popover>
											<PopoverTrigger
												asChild
											>
												<Button
													type="button"
													variant="outline"
													data-empty={
														!newShipment.deliveryAt
													}
													className="w-full h-12 font-main flex items-center justify-between px-3 rounded-10 border border-(--tertiary-color) bg-transparent hover:bg-transparent data-[empty=true]:text-muted-foreground"
												>
													{newShipment.deliveryAt ? (
														dayjs(
															newShipment.deliveryAt,
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
												className="w-auto p-0 z-50"
												align="end"
												dir="rtl"
											>
												<Calendar
													mode="single"
													selected={
														newShipment.deliveryAt
													}
													onSelect={(
														date,
													) => {
														setNewShipment(
															(
																prev,
															) => {
																return {
																	...prev,
																	deliveryAt:
																		date,
																};
															},
														);
													}}
													locale={
														ar
													}
													dir="rtl"
												/>
											</PopoverContent>
										</Popover>
									</label>
								</div>

								<div className="w-full mt-5">
									<LocationTracker
										origin={
											newShipment.origin
												? {
														lat:
															newShipment.origin_lat ||
															0,
														lng:
															newShipment.origin_lng ||
															0,
														name: newShipment.origin,
													}
												: undefined
										}
										destination={
											newShipment.destination
												? {
														lat:
															newShipment.destination_lat ||
															0,
														lng:
															newShipment.destination_lng ||
															0,
														name: newShipment.destination,
													}
												: undefined
										}
										onOriginSelect={(
											lat,
											lng,
											name,
										) => {
											setNewShipment(
												(
													prev,
												) => {
													const updated =
														{
															...prev,
															origin: name,
															origin_lat:
																lat,
															origin_lng:
																lng,
														};

													// Calculate distance and ETA if both locations are set
													if (
														updated.destination_lat &&
														updated.destination_lng
													) {
														calculateDistanceAndETA(
															lat,
															lng,
															updated.destination_lat,
															updated.destination_lng,
														).then(
															(
																result,
															) => {
																if (
																	result
																) {
																	setNewShipment(
																		(
																			prev,
																		) => ({
																			...prev,
																			distance: result.distance,
																			ETA: result.eta,
																		}),
																	);
																}
															},
														);
													}

													return updated;
												},
											);
										}}
										onDestinationSelect={(
											lat,
											lng,
											name,
										) => {
											setNewShipment(
												(
													prev,
												) => {
													const updated =
														{
															...prev,
															destination:
																name,
															destination_lat:
																lat,
															destination_lng:
																lng,
														};

													// Calculate distance and ETA if both locations are set
													if (
														updated.origin_lat &&
														updated.origin_lng
													) {
														calculateDistanceAndETA(
															updated.origin_lat,
															updated.origin_lng,
															lat,
															lng,
														).then(
															(
																result,
															) => {
																if (
																	result
																) {
																	setNewShipment(
																		(
																			prev,
																		) => ({
																			...prev,
																			distance: result.distance,
																			ETA: result.eta,
																		}),
																	);
																}
															},
														);
													}

													return updated;
												},
											);
										}}
										onOriginReset={() => {
											setNewShipment(
												(
													prev,
												) => ({
													...prev,
													origin: "",
													origin_lat:
														undefined,
													origin_lng:
														undefined,
													distance: undefined,
													ETA: undefined,
												}),
											);
										}}
										onDestinationReset={() => {
											setNewShipment(
												(
													prev,
												) => ({
													...prev,
													destination:
														"",
													destination_lat:
														undefined,
													destination_lng:
														undefined,
													distance: undefined,
													ETA: undefined,
												}),
											);
										}}
									/>
								</div>

								{/* Distance and ETA Display */}
								{newShipment.distance &&
									newShipment.ETA && (
										<div className="w-full rounded-20 bg-(--secondary-color) my-5">
											<div className="flex items-center gap-3 mb-4">
												<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--primary-color)/10 text-(--primary-color)">
													<PiInfo className="text-lg" />
												</div>
												<h3 className="font-main font-medium text-2xl text-(--primary-text)">
													تفاصيل
													المسافة
												</h3>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="p-4 bg-(--tertiary-color)/5 rounded-10 border border-(--tertiary-color)">
													<p className="font-main text-sm text-(--secondary-text) mb-2">
														المسافة
														الكلية
													</p>
													<p className="font-main font-bold text-xl text-(--primary-text)">
														{
															newShipment.distance
														}
													</p>
												</div>
												<div className="p-4 bg-(--tertiary-color)/5 rounded-10 border border-(--tertiary-color)">
													<p className="font-main text-sm text-(--secondary-text) mb-2">
														الوقت
														المتوقع
													</p>
													<p className="font-main font-bold text-xl text-(--primary-text)">
														{
															newShipment.ETA
														}
													</p>
												</div>
											</div>
										</div>
									)}
							</div>

							<div className="flex items-stretch gap-5">
								<div className="w-full h-full rounded-20 bg-(--secondary-color) p-5 mb-5">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
											<span className="font-main font-medium text-xl">
												5
											</span>
										</div>
										<h3 className="font-main font-medium text-2xl text-(--primary-text)">
											صور الحمولة
										</h3>
									</div>

									<label
										htmlFor="shipmentImgs"
										className="w-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-(--tertiary-color) rounded-10 cursor-pointer mb-3"
									>
										<PiCameraLight className="text-5xl text-(--primary-text) mb-1" />
										<h5 className="font-main font-medium text-base text-(--primary-text)">
											إسحب الصورة
											هنا أو إضغط
											للرفع
										</h5>
										<h6 className="font-main font-normal text-sm text-(--tertiary-color)">
											صورة للبضاعة
											والتغليف
											والموقع
										</h6>
									</label>
									<input
										type="file"
										disabled={
											shipmentImgs?.length ===
											3
												? true
												: false
										}
										onChange={
											handleFileUploading
										}
										name="shipmentImgs"
										id="shipmentImgs"
										className="hidden"
										multiple
										maxLength={3}
										accept="image/png, image/webp, image/jpeg"
									/>

									<ul className="flex items-center gap-2">
										<li className="group relative w-full h-24 flex items-center justify-center rounded-10 overflow-hidden bg-(--secondary-text)/15">
											{previewUrls[0] ? (
												<>
													<img
														src={
															previewUrls[0]
														}
														alt="image"
														className="w-full h-full object-cover"
													/>
													<div className="group-hover:flex hidden absolute top-0 left-0 w-full h-full items-center justify-center bg-(--primary-text)/75">
														<PiTrash
															onClick={() =>
																handleFileDeleting(
																	"shipmentImgs",
																	0,
																)
															}
															className="text-2xl text-(--red-color) cursor-pointer transition-transform duration-300 hover:scale-110"
														/>
													</div>
												</>
											) : (
												<span className="font-main text-base text-(--primary-text)">
													صورة
													1
												</span>
											)}
										</li>
										<li className="group relative w-full h-24 flex items-center justify-center rounded-10 overflow-hidden bg-(--secondary-text)/15">
											{previewUrls[1] ? (
												<>
													<img
														src={
															previewUrls[1]
														}
														alt="image"
														className="w-full h-full object-cover"
													/>
													<div className="group-hover:flex hidden absolute top-0 left-0 w-full h-full items-center justify-center bg-(--primary-text)/75">
														<PiTrash
															onClick={() =>
																handleFileDeleting(
																	"shipmentImgs",
																	1,
																)
															}
															className="text-2xl text-(--red-color) cursor-pointer transition-transform duration-300 hover:scale-110"
														/>
													</div>
												</>
											) : (
												<span className="font-main text-base text-(--primary-text)">
													صورة
													2
												</span>
											)}
										</li>
										<li className="group relative w-full h-24 flex items-center justify-center rounded-10 overflow-hidden bg-(--secondary-text)/15">
											{previewUrls[2] ? (
												<>
													<img
														src={
															previewUrls[2]
														}
														alt="image"
														className="w-full h-full object-cover"
													/>
													<div className="group-hover:flex hidden absolute top-0 left-0 w-full h-full items-center justify-center bg-(--primary-text)/75">
														<PiTrash
															onClick={() =>
																handleFileDeleting(
																	"shipmentImgs",
																	2,
																)
															}
															className="text-2xl text-(--red-color) cursor-pointer transition-transform duration-300 hover:scale-110"
														/>
													</div>
												</>
											) : (
												<span className="font-main text-base text-(--primary-text)">
													صورة
													3
												</span>
											)}
										</li>
									</ul>
									<span
										ref={(
											el: HTMLSpanElement | null,
										) => {
											if (el)
												spansRef.current[0] =
													el;
										}}
										data-span="shipmentImgs"
										className={`hidden font-main font-medium text-sm text-(--red-color)`}
									>
										hgh
									</span>
								</div>

								<div className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5">
									<div className="flex items-center gap-3 mb-4">
										<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
											<span className="font-main font-medium text-xl">
												6
											</span>
										</div>
										<h3 className="font-main font-medium text-2xl text-(--primary-text)">
											ملفات مرفقه
										</h3>
									</div>

									<label
										htmlFor="shipmentDocs"
										className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-(--tertiary-color) rounded-10 cursor-pointer mb-3"
									>
										<PiFileArrowUpLight className="text-5xl text-(--primary-text) mb-1" />
										<h5 className="font-main font-medium text-base text-(--primary-text)">
											رفع المستندات
										</h5>
									</label>
									<input
										type="file"
										onChange={
											handleFileUploading
										}
										name="shipmentDocs"
										id="shipmentDocs"
										className="hidden"
										multiple
										maxLength={3}
										accept="application/pdf, .doc, .docx"
									/>

									<ul className="flex flex-col gap-2">
										{shipmentDocs &&
											Array.from(
												shipmentDocs,
											).map(
												(
													doc,
													index,
												) => (
													<li
														key={
															index
														}
														className="h-12 flex items-center justify-between rounded-10 bg-gray-50 px-3"
													>
														<div className="flex items-center gap-1">
															{doc.name
																.split(
																	".",
																)
																.pop() ===
															"pdf" ? (
																<PiFilePdf className="text-2xl text-(--red-color)" />
															) : (
																<PiFileDoc className="text-2xl text-(--blue-color)" />
															)}
															<h6 className="w-30 font-main font-light text-base text-(--secondary-text) whitespace-nowrap overflow-hidden text-ellipsis">
																{
																	doc.name
																}
															</h6>
														</div>
														<PiX
															onClick={() =>
																handleFileDeleting(
																	"shipmentDocs",
																	index,
																)
															}
															className="text-xl text-(--red-color) cursor-pointer"
														/>
													</li>
												),
											)}
									</ul>
									<span
										ref={(
											el: HTMLSpanElement | null,
										) => {
											if (el)
												spansRef.current[1] =
													el;
										}}
										data-span="shipmentDocs"
										className={`hidden font-main font-medium text-sm text-(--red-color)`}
									></span>
								</div>
							</div>

							<div className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
										<span className="font-main font-medium text-xl">
											7
										</span>
									</div>
									<h3 className="font-main font-medium text-2xl text-(--primary-text)">
										خيارات إضافية
									</h3>
								</div>

								<div className="flex items-center justify-between flex-wrap gap-5">
									<div className="flex items-center gap-3 mb-3">
										<input
											type="checkbox"
											onChange={
												handleChange
											}
											name="urgent"
											id="urgent"
											className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
										/>
										<label
											htmlFor="urgent"
											className="font-main text-xl font-medium text-(--secondary-text)"
										>
											حمولة عاجلة
										</label>
									</div>
									<div className="flex items-center gap-3 mb-3">
										<input
											type="checkbox"
											onChange={
												handleChange
											}
											name="additionalInsurance"
											id="additionalInsurance"
											className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
										/>
										<label
											htmlFor="additionalInsurance"
											className="font-main text-xl font-medium text-(--secondary-text)"
										>
											تأمين إضافي
										</label>
									</div>
									<div className="flex items-center gap-3 mb-3">
										<input
											type="checkbox"
											onChange={
												handleChange
											}
											name="twoDrivers"
											id="twoDrivers"
											className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
										/>
										<label
											htmlFor="twoDrivers"
											className="font-main text-xl font-medium text-(--secondary-text)"
										>
											سائقين اثنين
										</label>
									</div>
									<div className="flex items-center gap-3 mb-3">
										<input
											type="checkbox"
											onChange={
												handleChange
											}
											name="noFriday"
											id="noFriday"
											className="relative appearance-none w-5 h-5 rounded-sm border border-(--secondary-text) before:absolute before:top-2/4 before:left-2/4 before:-translate-2/4 before:text-(--secondary-color) checked:before:content-['\2713'] checked:border-(--primary-color) checked:bg-(--primary-color)"
										/>
										<label
											htmlFor="noFriday"
											className="font-main text-xl font-medium text-(--secondary-text)"
										>
											لا تحميل
											الجمعة
										</label>
									</div>
								</div>
							</div>

							<div className="w-full rounded-20 bg-(--secondary-color) p-5 mb-5">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 flex items-center justify-center rounded-full bg-(--tertiary-color)/10 text-(--primary-text)">
										<span className="font-main font-medium text-xl">
											8
										</span>
									</div>
									<h3 className="font-main font-medium text-2xl text-(--primary-text)">
										الدفع والمزانية
									</h3>
								</div>

								<div className="flex flex-col items-start gap-1.5">
									<label
										htmlFor="packaging"
										className="font-main font-medium text-xl text-(--primary-text)"
									>
										نظام التسعير
									</label>
									<div className="w-full flex items-center gap-5 mb-3">
										<label
											htmlFor="openBudget"
											className="w-1/2 py-10 flex items-center justify-center rounded-20 border border-(--tertiary-color) has-[input:checked]:bg-(--secondary-text)/10 transition-colors duration-300 hover:bg-(--secondary-text)/10 hover:border-transparent cursor-pointer"
										>
											<div className="flex flex-col gap-1">
												<h5 className="font-main font-medium text-lg text-(--primary-text) text-center">
													ميزانية
													مفتوحة
												</h5>
												<h6 className="font-main font-light text-sm text-(--tertiary-color) text-center">
													استقبل
													أفضل
													العروض
													لحمولتك
												</h6>
											</div>
											<input
												type="radio"
												onChange={
													handleChange
												}
												id="openBudget"
												name="budgetType"
												value="OPEN_BUDGET"
												className="hidden"
											/>
										</label>
										<label
											htmlFor="limitedBudget"
											className="w-1/2 py-10 flex items-center justify-center rounded-20 border border-(--tertiary-color) has-[input:checked]:bg-(--secondary-text)/10 transition-colors duration-300 hover:bg-(--secondary-text)/10 hover:border-transparent cursor-pointer"
										>
											<div className="flex flex-col gap-1">
												<h5 className="font-main font-medium text-lg text-(--primary-text) text-center">
													ميزانية
													محدودة
												</h5>
												<h6 className="font-main font-light text-sm text-(--tertiary-color) text-center">
													استقبل
													أفضل
													العروض
													لحمولتك
												</h6>
											</div>
											<input
												type="radio"
												onChange={
													handleChange
												}
												id="limitedBudget"
												name="budgetType"
												value="LIMITED_BUDGET"
												className="hidden"
											/>
										</label>
									</div>

									<div className="w-full flex flex-col gap-3">
										<div
											className={`${newShipment.budgetType === "LIMITED_BUDGET" ? "block" : "hidden"}  w-1/2 flex flex-col items-start gap-1`}
										>
											<label
												htmlFor="suggested-budget"
												className="font-main font-medium text-xl text-(--primary-text)"
											>
												الميزانية
												المقترحة
											</label>
											<input
												type="number"
												onChange={
													handleChange
												}
												name="suggestedBudget"
												id="suggested-budget"
												placeholder="0"
												className="w-full h-12 border border-(--tertiary-color) rounded-10 font-main font-medium placeholder:text-base text-lg text-(--primary-text) focus:outline-none px-3"
											/>
										</div>
										<div className="w-1/2 flex flex-col items-start gap-1">
											<label
												htmlFor="paymentType"
												className="font-main font-medium text-xl text-(--primary-text) "
											>
												نوع
												الدفع
												المفضلة
											</label>
											<Select
												onValueChange={(
													value,
												) =>
													setNewShipment(
														{
															...newShipment,
															paymentType:
																value,
														},
													)
												}
												name="paymentType"
											>
												<SelectTrigger
													className="w-full font-main text-base text-(--primary-text) border border-(--tertiary-color) rounded-10"
													size="xl"
												>
													<SelectValue placeholder="إختر نوع الدفع" />
												</SelectTrigger>
												<SelectContent className="w-full">
													<SelectGroup className="font-main">
														<SelectLabel>
															وسائل
															الدفع
														</SelectLabel>
														<SelectItem value="ON_DELIVER">
															الدفع
															عند
															الإستلام
														</SelectItem>
														<SelectItem value="BANK_TRNASFER">
															تحويل
															بنكي
														</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							</div>

							<Button
								className="w-64 h-13"
								size={"xl"}
								disabled={
									isPending ? true : false
								}
							>
								{isPending ? (
									<Spinner
										className={`${isPending ? "block" : "hidden"}`}
									/>
								) : (
									<span className="font-main font-medium text-lg text-(--secondary-color) capitalize">
										رفع الحمولة الآن
									</span>
								)}
							</Button>
						</form>
					</div>
				</div>
			</section>
		</Main>
	);
}

export default NewShipment;
