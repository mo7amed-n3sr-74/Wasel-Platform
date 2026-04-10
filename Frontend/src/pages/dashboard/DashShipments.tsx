import { ShipmentsDataTable } from "@/pages/dashboard/components/ShipmentsDataTable";
import { useUserShipments } from "@/api/hooks/user/useUserShipments";
import type { Shipment } from "@/shared/interfaces/Interfaces";
import { isAxiosError } from "axios";
import DashHeader from "./components/DashHeader";
import { useNotification } from "@/components/NotificationContext";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function DashShipments() {
	const { data: response, isLoading, error, isError } = useUserShipments();
    const { addNotification } = useNotification();
    const { t } = useTranslation();

	// Extract shipments array from response
	const shipments: Shipment[] = Array.isArray(response?.data)
		? response.data
		: [];

    useEffect(() => {
        const axiosMsg = isAxiosError(error)? error.response?.data.message : "حدث خطأ ما";

        if (isError) {
            addNotification(
                t(axiosMsg),
                "error",
                5000
            )
        }
    }, [isError, error])

	return (
		<section className="w-full h-full">
            <DashHeader title={"حمولاتي"} />
			<div className="h-[calc(100%-52px)] w-full mx-auto">
                {
                    response && (
                        <ShipmentsDataTable
                            data={shipments}
                            isLoading={isLoading}
                        />
                    )
                }   
			</div>
		</section>
	);
}

export default DashShipments;
