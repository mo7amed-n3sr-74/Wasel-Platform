import { userService } from "@/api/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useUserShipments() {
    return (
            useQuery({
            queryKey: ["userShipments"],
            queryFn: () => userService.userShipments(),
            retry: false
        })
    )
}