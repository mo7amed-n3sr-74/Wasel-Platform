import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";

export function useSignout() {
    return (
        useMutation({
            mutationKey: ["signout"],
            mutationFn: () => authService.signout(),
        })
    )
}