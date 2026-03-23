import { useQueryClient, useMutation } from "@tanstack/react-query";
import { shipmentsService } from "@/api/services/shipments.service";

export function useCreateShipment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (newShipment: Record<string, unknown>) => {
			return shipmentsService.createShipment(newShipment);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["shipments"] });
		},
	});
}
