import { useQuery } from "@tanstack/react-query";
import { shipmentsService } from "@/api/services/shipments.service";
import type { ShipmentFilter } from "@/shared/interfaces/Interfaces";

export function useShipments(query: ShipmentFilter) {
	const queryParams = Object.fromEntries(
		Object.entries(query).filter(([, value]) => Boolean(value)),
	);

	return useQuery({
		queryKey: ["shipments ", query],
		queryFn: () => shipmentsService.getShipments(queryParams),
		retry: false,
	});
}
