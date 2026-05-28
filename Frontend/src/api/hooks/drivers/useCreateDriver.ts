import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drievrsService } from "@/api/services/drivers.service";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function useCreateDriver() {
	const queryClient = useQueryClient();
	const { t } = useTranslation();

	return useMutation({
		mutationFn: (formData: FormData) => drievrsService.createDriver(formData),
		onSuccess: (res) => {
            toast.success(t(res.data.message))
			queryClient.invalidateQueries({ queryKey: ["drivers"] });
		},
		onError: (err) => {
			const axiosMeg = isAxiosError(err)
				? err.response?.data?.message
				: "شئ ما حدث خطأ";
			toast.error(t(axiosMeg));
		},
	});
}
