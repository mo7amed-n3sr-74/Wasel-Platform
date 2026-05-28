import { authService } from "@/api/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function useSignup() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ["signup"],
        mutationFn: (data: { role: string | null, username: string, email: string, password: string }) => authService.signup(data),

        onSuccess: (res) => {
            toast.success(t(res.data.message));
            setTimeout(() => {
                navigate('/signin');
            }, 3000)
        },

        onError: (err) => {
            const axiosMeg = isAxiosError(err) ? err.response?.data?.message : "شء ما حدث خطأ";
            toast.error(t(axiosMeg));
        }
    })
}