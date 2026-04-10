import { privateHttpClient } from "../client/HttpClient";

class OfferService {
	getOffer(offerId: string) {
		return privateHttpClient.get(`/offers/${offerId}`);
	}

	getOffers() {
		return privateHttpClient.get(`/offers`);
	}

	getRecentOffers() {
		return privateHttpClient.get("/offers/recent");
	}

	sendOffer(
		shipmentId: string | undefined,
		data: { price: number; proposal: string },
	) {
		return privateHttpClient.post(`/offers/${shipmentId}`, data);
	}

	acceptOffer(offerId: string) {
		return privateHttpClient.post(`/offers/${offerId}/accept`);
	}

	rejectOffer(offerId: string) {
		return privateHttpClient.post(`/offers/${offerId}/reject`);
	}

	deleteOffer(offerId: string) {
		return privateHttpClient.delete(`/offers/${offerId}`);
	}
}

export const offerService = new OfferService();
