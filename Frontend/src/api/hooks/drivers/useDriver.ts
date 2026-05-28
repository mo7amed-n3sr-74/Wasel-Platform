import { useMutation } from "@tanstack/react-query";
import { drievrsService } from "@/api/services/drivers.service";

export function useDriver() {
    return useMutation({
        mutationKey: ['driver'],
        mutationFn: (driverId: string) => drievrsService.getDriver(driverId)
    })
}