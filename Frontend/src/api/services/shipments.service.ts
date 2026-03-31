import { privateHttpClient } from "../client/HttpClient";

class ShipmentsService {
	getShipment(id: string | undefined) {
		return privateHttpClient.get(`/shipments/${id}`);
	}

	getShipments(query: Record<string, unknown>) {
		const params = new URLSearchParams(
			Object.entries(query).map(([key, value]) => [
				key,
				String(value),
			]),
		);
		return privateHttpClient.get(`/shipments?${params}`);
	}

	getShipmentOffers(shipmentId: string) {
		return privateHttpClient.get(`/shipments/${shipmentId}/offers`)
	}

	createShipment(data: Record<string, unknown>) {
		return privateHttpClient.post("/shipments/create", data);
	}
}

export const shipmentsService = new ShipmentsService();
