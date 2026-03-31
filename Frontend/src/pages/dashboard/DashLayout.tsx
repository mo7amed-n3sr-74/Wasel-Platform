import { useState } from "react";
import DashSidebar from "./components/DashSidebar";
import { Outlet } from "react-router-dom";

function DashLayout() {
    const [ closeSidebar, setCloseSidebar ] = useState(false);

    return (
        <section className="h-screen flex items-center justify-center bg-(--bg-color)">
            <DashSidebar closeSidebar={closeSidebar} setCloseSidebar={setCloseSidebar} />
            <div className={`${closeSidebar? "w-full" : "w-4/5"} h-full duration-300 py-5 pl-5 pr-7`}>
                <Outlet />
            </div>
        </section>
    )
} 

export default DashLayout;