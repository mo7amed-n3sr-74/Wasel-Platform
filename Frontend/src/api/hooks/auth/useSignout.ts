import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useProps } from "@/components/PropsProvider";

export function useSignout() {
    const { setUser } = useProps();

    return (
        useMutation({
            mutationKey: ["signout"],
            mutationFn: () => authService.signout(),

            onSuccess: () => {
                setUser(null);
            }
        })
    )
}