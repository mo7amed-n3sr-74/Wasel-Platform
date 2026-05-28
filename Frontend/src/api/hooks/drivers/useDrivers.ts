import { useQuery } from "@tanstack/react-query";
import { drievrsService } from "@/api/services/drivers.service";

export function useDrivers() {
	return useQuery({
		queryKey: ["drivers"],
		queryFn: () => drievrsService.getDrivers(),
	});
}
