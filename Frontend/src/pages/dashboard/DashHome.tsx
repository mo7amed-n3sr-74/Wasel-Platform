import Stats from "./components/Stats";
import ActiveShipments from "./components/ActiveShipments";
import RecentOffers from "./components/RecentOffers";
import TrackingPreview from "./components/TrackingPreview";
import ActivityTimeline from "./components/ActivityTimeline";
import DashHeader from "./components/DashHeader";

function DashHome() {
	return (
		<div className="w-full h-full overflow-hidden flex flex-col">
			<DashHeader title="الرئيسية"/>

			{/* Scrollable Content */}
			<div className="h-[calc(100%-52px)] overflow-y-auto scrollbar-hidden">
				{/* Stats Section */}
				<Stats />

				{/* Main Grid - 2 columns */}
				<div className="grid grid-cols-12 gap-4 my-4">
					{/* Left Column - Active Shipments (8/12) */}
					<div className="col-span-12 lg:col-span-8 h-full">
						<ActiveShipments />
					</div>

					{/* Right Column - Recent Offers (4/12) */}
					<div className="col-span-12 lg:col-span-4 h-full">
						<RecentOffers />	
					</div>
				</div>

				{/* Second Row - 2 equal columns */}
				<div className="grid grid-cols-12 gap-8">
					{/* Tracking Preview (6/12) */}
					<div className="col-span-12 lg:col-span-6">
						<TrackingPreview />
					</div>

					{/* Activity Timeline (6/12) */}
					{/* <div className="col-span-12 lg:col-span-6">
						<ActivityTimeline />
					</div> */}
				</div>

				{/* Footer spacer */}
				<div className="h-4"></div>
			</div>
		</div>
	);
}

export default DashHome;
