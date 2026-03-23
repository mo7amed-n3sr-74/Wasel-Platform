import { shipmentsService } from "@/api/services/shipments.service";
import { useQuery } from "@tanstack/react-query";

export function useShipment(id: string | undefined) {
	return useQuery({
		queryKey: ["shipment", id],
		queryFn: () => shipmentsService.getShipment(id),
	});
}
