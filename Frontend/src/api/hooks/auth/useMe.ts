import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";

export function useMe() {
    return (
        useMutation({
            mutationKey: ["me"],
            mutationFn: () => authService.me()
        })
    )
}