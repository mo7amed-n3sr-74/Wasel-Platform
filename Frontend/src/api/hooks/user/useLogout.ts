import { userService } from "@/api/services/user.service";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
    return useMutation({
        mutationFn: () => (userService.logout()),
    })
}