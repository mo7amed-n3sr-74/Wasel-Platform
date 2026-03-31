import { shipmentsService } from "@/api/services/shipments.service";
import { useQuery } from "@tanstack/react-query";

export function useShipmentOffers(shipmentId: string) {
	return useQuery({
		queryKey: ["shipmentOffers", shipmentId],
		queryFn: () => shipmentsService.getShipmentOffers(shipmentId),
		enabled: !!shipmentId,
		retry: false,
	});
}
