import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useProps } from "./components/PropsProvider";
import { privateHttpClient } from "./api/client/HttpClient";
import { useNotification } from "./components/NotificationContext";
// Auth Pages
import Account from "./pages/auth/Account";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// App Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";

// External Libraries
import "./i18n";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import Shipments from "./pages/Shipments";
import NewShipment from "./pages/NewShipment";
import NotFound from "./pages/NotFound";
import OneTimePassword from "./pages/auth/OneTimePassword";
import Shipment from "./pages/Shipment";
import DashLayout from "./pages/dashboard/DashLayout";
import DashHome from "./pages/dashboard/DashHome";
import DashShipments from "./pages/dashboard/DashShipments";
import DashShipmentOffers from "./pages/dashboard/DashShipmentOffers";
import HasAccess from "./components/HasAccess";
import { useRefresh } from "./api/hooks/auth/useRefresh";
import { useMe } from "./api/hooks/auth/useMe";

function App() {
	const { i18n, t } = useTranslation();
	const { setUser } = useProps();
	const { addNotification } = useNotification();
	const {
		data: refreshRes,
		mutate: refresh,
		isError: isRefreshError,
		error: refreshError,
		isSuccess: isRefreshSuccess,
	} = useRefresh();
	const {
		data: user,
		mutate: currentUser,
		isError: isUserError,
		error: userError,
		isSuccess: isUserSuccess,
	} = useMe();

	useEffect(() => {
		i18n.changeLanguage("ar");

		const noAuthPages = [
			"/account",
			"/signin",
			"/signup",
			"/forgetpassword",
			"/verification",
			"/resetpassword",
		];
		const currentPath = window.location.pathname;

		if (!noAuthPages.includes(currentPath)) {
			refresh();
		}
	}, []);

	useEffect(() => {
		if (isRefreshSuccess) {
			privateHttpClient.setAccessToken(refreshRes.data);
			currentUser();
		}

		if (isRefreshError) {
			const axiosMsg = isAxiosError(refreshError)
				? refreshError.response?.data?.message
				: "حدث خطأ ما";

			addNotification(t(axiosMsg), "error", 5000);
		}
	}, [isRefreshSuccess, isRefreshError, refreshError]);

	useEffect(() => {
		if (isUserSuccess) {
			setUser(user.data);
		}

		if (isUserError) {
			const axiosMsg = isAxiosError(userError)
				? userError.response?.data?.message
				: "حدث خطأ ما";

			addNotification(t(axiosMsg), "error", 5000);
		}
	}, [isUserSuccess, isUserError, userError]);

	return (
		<BrowserRouter>
			<Suspense>
				<Routes>
					<Route path="/" element={<Home />}></Route>
					{/* auth */}
					<Route
						path="/account"
						element={<Account />}
					></Route>
					<Route
						path="/signin"
						element={<Signin />}
					></Route>
					<Route
						path="/signup"
						element={<Signup />}
					></Route>
					<Route
						path="/forgetpassword"
						element={<ForgetPassword />}
					></Route>
					<Route
						path="/resetpassword"
						element={<ResetPassword />}
					></Route>
					<Route
						path="/verification"
						element={<OneTimePassword />}
					></Route>
					{/* Pages */}
					<Route
						path="/newShipment"
						element={<NewShipment />}
					/>
					<Route
						path="/profile/:username"
						element={<Profile />}
					></Route>
					<Route
						path="/shipments"
						element={<Shipments />}
					></Route>
					<Route
						path="/shipments/:id"
						element={<Shipment />}
					></Route>
					{/* Dashoard */}
					<Route
						path="/dashboard"
						element={
							<HasAccess
								role={[
									"admin",
									"manufacturer",
									"carrier_company",
									"independent_carrier",
								]}
							>
								<DashLayout />
							</HasAccess>
						}
					>
						<Route index element={<DashHome />} />
						<Route
							path="shipments"
							element={<DashShipments />}
						/>
						<Route
							path="shipments/:shipmentId"
							element={<DashShipmentOffers />}
						/>
						{/* <Route path="analytics" element={<DashAnalytics />} />
						<Route path="settings" element={<DashSettings />} /> */}
					</Route>
					{/* Default */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
