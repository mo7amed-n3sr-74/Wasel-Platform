import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
	iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

interface ShipmentMapProps {
	originLat?: number;
	originLng?: number;
	destinationLat?: number;
	destinationLng?: number;
	originName?: string;
	destinationName?: string;
}

export default function ShipmentMap({
	originLat,
	originLng,
	destinationLat,
	destinationLng,
	originName = "نقطة الانطلاق",
	destinationName = "نقطة الوصول",
}: ShipmentMapProps) {
	// Default center if coordinates are not available
	const defaultCenter: [number, number] = [24.7136, 46.6753];

	// Calculate center point between origin and destination
	let center = defaultCenter;
	let bounds: [[number, number], [number, number]] | null = null;

	if (originLat && originLng && destinationLat && destinationLng) {
		const centerLat = (originLat + destinationLat) / 2;
		const centerLng = (originLng + destinationLng) / 2;
		center = [centerLat, centerLng];
		bounds = [
			[
				Math.min(originLat, destinationLat) - 0.1,
				Math.min(originLng, destinationLng) - 0.1,
			],
			[
				Math.max(originLat, destinationLat) + 0.1,
				Math.max(originLng, destinationLng) + 0.1,
			],
		];
	}

	return (
		<div className="w-full h-full rounded-10">
			<MapContainer
				center={center}
				zoom={6}
				bounds={bounds || undefined}
				style={{
					height: "100%",
					width: "100%",
					borderRadius: "10px",
				}}
				className="rounded-10"
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>

				{/* Origin Marker */}
				{originLat && originLng && (
					<Marker
						position={[originLat, originLng]}
						icon={
							new L.Icon({
								iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
								shadowUrl:
									"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
								iconSize: [25, 41],
								iconAnchor: [12, 41],
								popupAnchor: [1, -34],
								shadowSize: [41, 41],
							})
						}
					>
						<Popup>
							<div className="text-center">
								<p className="font-main font-medium text-sm text-(--primary-text)">
									📍 {originName}
								</p>
								<p className="font-main text-xs text-(--secondary-text)">
									{originLat.toFixed(4)},{" "}
									{originLng.toFixed(4)}
								</p>
							</div>
						</Popup>
					</Marker>
				)}

				{/* Destination Marker */}
				{destinationLat && destinationLng && (
					<Marker
						position={[destinationLat, destinationLng]}
						icon={
							new L.Icon({
								iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
								shadowUrl:
									"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
								iconSize: [25, 41],
								iconAnchor: [12, 41],
								popupAnchor: [1, -34],
								shadowSize: [41, 41],
							})
						}
					>
						<Popup>
							<div className="text-center">
								<p className="font-main font-medium text-sm text-(--primary-text)">
									📍 {destinationName}
								</p>
								<p className="font-main text-xs text-(--secondary-text)">
									{destinationLat.toFixed(
										4,
									)}
									,{" "}
									{destinationLng.toFixed(
										4,
									)}
								</p>
							</div>
						</Popup>
					</Marker>
				)}

				{/* Route Line */}
				{originLat &&
					originLng &&
					destinationLat &&
					destinationLng && (
						<Polyline
							positions={[
								[originLat, originLng],
								[
									destinationLat,
									destinationLng,
								],
							]}
							color="#0066cc"
							weight={3}
							opacity={0.8}
							dashArray="5, 5"
						/>
					)}
			</MapContainer>
		</div>
	);
}
