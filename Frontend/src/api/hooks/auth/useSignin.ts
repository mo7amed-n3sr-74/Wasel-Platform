import { privateHttpClient } from "@/api/client/HttpClient"
import { authService } from "@/api/services/auth.service"
import { useMutation } from "@tanstack/react-query"

export function useSignin(data: { email: string, password: string }) {
    return (
        useMutation({
            mutationKey: ["signin"],
            mutationFn: () => authService.signin(data),

            onSuccess: (res) => {
                privateHttpClient.setAccessToken(res.data)
                return authService.me()
            }
        })
    )
}