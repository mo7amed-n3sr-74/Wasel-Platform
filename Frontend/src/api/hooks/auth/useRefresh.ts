import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";

export function useRefresh() {
    // const queryClient = useQueryClient();

    return (
        useMutation({
            mutationKey: ["refresh"],
            mutationFn: () => authService.refresh(),
        })
    )
}