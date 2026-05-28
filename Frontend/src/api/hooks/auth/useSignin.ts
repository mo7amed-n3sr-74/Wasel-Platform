import { privateHttpClient } from "@/api/client/HttpClient"
import { authService } from "@/api/services/auth.service"
import { useMutation } from "@tanstack/react-query"
import { useProps } from "@/components/PropsProvider"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { isAxiosError } from "axios"
import { useTranslation } from "react-i18next"

export function useSignin() {
    const { user, setUser } = useProps();
    const navigate = useNavigate();
    const { t } = useTranslation();

    return useMutation({
        mutationKey: ["signin"],
        mutationFn: (data: { email: string; password: string }) => authService.signin(data),

        onSuccess: async (res) => {
            privateHttpClient.setAccessToken(res.data.accessToken)
            const { data } = await authService.me();
            setUser(data);
            if (!user)
                navigate('/shipments');
        },

        onError: (err) => {
            const axiosMeg = isAxiosError(err)
				? err?.response?.data?.message
				: "شء ما حدث خطا";
			toast.error(t(axiosMeg));
        }
    })
}