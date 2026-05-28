import { privateHttpClient } from "../client/HttpClient";
import type { CreateDriverForm } from "@/shared/interfaces/Interfaces";

class DriversService {
	getDriver(driverId: string) {
		return privateHttpClient.get(`/drivers/${driverId}`);
	}

	getDrivers() {
		return privateHttpClient.get("/drivers");
	}

	createDriver(formData: CreateDriverForm) {
		return privateHttpClient.post("/drivers/add", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	}

    deleteDriver(driverId: string) {
        return privateHttpClient.delete(`/drivers/${driverId}`)
    }
}

export const drievrsService = new DriversService();
