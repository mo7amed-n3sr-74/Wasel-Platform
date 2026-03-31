import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { PiX } from "react-icons/pi";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
	iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
	shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

interface LocationTrackerProps {
	origin?: { lat: number; lng: number; name: string };
	destination?: { lat: number; lng: number; name: string };
	onOriginSelect: (lat: number, lng: number, name: string) => void;
	onDestinationSelect: (lat: number, lng: number, name: string) => void;
	onOriginReset?: () => void;
	onDestinationReset?: () => void;
}

function MapClickHandler({
	onLocationSelect,
}: {
	onLocationSelect: (lat: number, lng: number) => void;
}) {
	useMapEvents({
		click: (e: any) => {
			const { lat, lng } = e.latlng;
			onLocationSelect(lat, lng);
		},
	});
	return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&accept-language=ar&lat=${lat}&lon=${lng}`,
		);
		const data = await response.json();
		// Extract location name from address
		const address = data.address || {};
		const locationName =
			address.city ||
			address.town ||
			address.village ||
			address.county ||
			address.state ||
			`${lat.toFixed(4)}, ${lng.toFixed(4)}`;
		return locationName + " - " + address?.country;
	} catch (error) {
		console.error("Reverse geocoding error:", error);
		return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
	}
}

export default function LocationTracker({
	origin,
	destination,
	onOriginSelect,
	onDestinationSelect,
	onOriginReset,
	onDestinationReset,
}: LocationTrackerProps) {
	const [mode, setMode] = useState<"origin" | "destination">("origin");
	const [isLoading, setIsLoading] = useState(false);

	const handleLocationSelect = useCallback(
		async (lat: number, lng: number) => {
			setIsLoading(true);
			const locationName = await reverseGeocode(lat, lng);

			if (mode === "origin") {
				onOriginSelect(lat, lng, locationName);
			} else {
				onDestinationSelect(lat, lng, locationName);
			}
			setIsLoading(false);
		},
		[mode, onOriginSelect, onDestinationSelect],
	);

	return (
		<div className="w-full flex flex-col gap-4">
			{/* Mode Selector */}
			<div className="flex items-center gap-3 p-4 bg-(--secondary-color) rounded-10 border border-(--tertiary-color)">
				<div className="flex-1">
					<h3 className="font-main font-medium text-lg text-(--primary-text)">
						اختيار الموقع / Location Picker
					</h3>
					<p className="font-main text-sm text-(--tertiary-color)">
						{mode === "origin"
							? "اختر موقع الانطلاق"
							: "اختر موقع الوصول"}
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant={
							mode === "origin" ? "default" : "outline"
						}
						onClick={() => setMode("origin")}
						className="font-main"
					>
						الانطلاق
					</Button>
					<Button
						type="button"
						variant={
							mode === "destination"
								? "default"
								: "outline"
						}
						onClick={() => setMode("destination")}
						className="font-main"
					>
						الوصول
					</Button>
				</div>
			</div>

			{/* Map */}
			<div className="w-full">
				<p className="font-main font-light text-sm text-(--tertiary-color) mb-2">
					اضغط على الخريطة لاختيار الموقع / Click on map to select
					location
				</p>
				<MapContainer
					center={[24.7136, 46.6753]}
					zoom={5}
					style={{
						height: "400px",
						width: "100%",
						borderRadius: "10px",
						border: "1px solid var(--tertiary-color)",
					}}
					className="rounded-10"
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					{origin && (
						<Marker
							position={[origin.lat, origin.lng]}
							icon={new L.Icon({
								iconUrl:
									"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
								shadowUrl:
									"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
								iconSize: [25, 41],
								iconAnchor: [12, 41],
								popupAnchor: [1, -34],
								shadowSize: [41, 41],
							})}
						>
							<Popup>
								<div className="text-center">
									<p className="font-main font-medium text-sm">
										الانطلاق
									</p>
									<p className="font-main text-xs">
										{origin.name}
									</p>
								</div>
							</Popup>
						</Marker>
					)}
					{destination && (
						<Marker
							position={[destination.lat, destination.lng]}
							icon={new L.Icon({
								iconUrl:
									"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
								shadowUrl:
									"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
								iconSize: [25, 41],
								iconAnchor: [12, 41],
								popupAnchor: [1, -34],
								shadowSize: [41, 41],
							})}
						>
							<Popup>
								<div className="text-center">
									<p className="font-main font-medium text-sm">
										الوصول
									</p>
									<p className="font-main text-xs">
										{destination.name}
									</p>
								</div>
							</Popup>
						</Marker>
					)}
					<MapClickHandler
						onLocationSelect={handleLocationSelect}
					/>
				</MapContainer>
			</div>

			{/* Current Selection & Controls */}
			<div className="grid grid-cols-2 gap-3">
				{/* Origin */}
				<div className="p-3 bg-gray-50 rounded-10 border border-(--tertiary-color)">
					<h4 className="font-main font-medium text-sm text-(--primary-text) mb-2">
						📍 الانطلاق
					</h4>
					{origin ? (
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1">
								<p className="font-main text-sm text-(--primary-text) break-words">
									{origin.name}
								</p>
								<p className="font-main text-xs text-(--tertiary-color)">
									{origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
								</p>
							</div>
							<button
								type="button"
								onClick={onOriginReset}
								className="text-(--red-color) hover:scale-110 transition"
								title="حذف"
							>
								<PiX className="text-lg" />
							</button>
						</div>
					) : (
						<p className="font-main text-sm text-(--tertiary-color) italic">
							لم يتم الاختيار
						</p>
					)}
				</div>

				{/* Destination */}
				<div className="p-3 bg-gray-50 rounded-10 border border-(--tertiary-color)">
					<h4 className="font-main font-medium text-sm text-(--primary-text) mb-2">
						📍 الوصول
					</h4>
					{destination ? (
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1">
								<p className="font-main text-sm text-(--primary-text) break-words">
									{destination.name}
								</p>
								<p className="font-main text-xs text-(--tertiary-color)">
									{destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
								</p>
							</div>
							<button
								type="button"
								onClick={onDestinationReset}
								className="text-(--red-color) hover:scale-110 transition"
								title="حذف"
							>
								<PiX className="text-lg" />
							</button>
						</div>
					) : (
						<p className="font-main text-sm text-(--tertiary-color) italic">
							لم يتم الاختيار
						</p>
					)}
				</div>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="text-center p-2 bg-blue-50 rounded-10">
					<p className="font-main text-sm text-blue-600">
						جاري الحصول على اسم الموقع...
					</p>
				</div>
			)}
		</div>
	);
}

