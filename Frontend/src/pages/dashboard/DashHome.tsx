import DashHeader from "./components/DashHeader";
import Stats from "./components/Stats";

function DashHome() {

    return (
        <div className="w-full h-full">
            <DashHeader title={"الرئيسية"} />
            <Stats />
        </div>
    )
};

export default DashHome;