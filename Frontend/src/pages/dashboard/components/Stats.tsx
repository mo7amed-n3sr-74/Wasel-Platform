import {
    PiWallet,
    PiClock,
    PiPath,
    PiCheckCircle
} from "react-icons/pi";
import HasAccess from "@/components/HasAccess";
import { useTranslation } from "react-i18next";

function Stats() {

    const { t } = useTranslation();

    const stats = [
        {
            key: "active shipments",
            icon: PiPath,
            hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"]
        },
        {
            key: "completed shipments",
            icon: PiCheckCircle,
            hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"]
        },
        {
            key: "total spent",
            icon: PiWallet,
            hasAccess: ["manufacturer"]
        },
        {
            key: "balance",
            icon: PiWallet,
            hasAccess: ["admin", "manufacturer"]
        },
        {
            key: "Avg Delivery Time",
            icon: PiClock,
            hasAccess: ["admin"]
        },
    ]

    return (
        <div className="flex items-stretch justify-between gap-4">
            {
                stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <HasAccess key={idx} role={stat.hasAccess}>
                            <div key={`stat-${idx}`} className="relative flex flex-col grow gap-5 rounded-2xl bg-(--secondary-color) p-5 after:content-start after:absolute after:w-20 after:h-20 after:bg-(--primary-color) after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
                                <div className="flex items-center gap-2">
                                    {/* <div className="w-12 h-12 rounded-full bg-(--primary-color)/10 flex items-center justify-center">
                                    </div> */}
                                    <Icon className="text-3xl text-(--primary-color)"/>
                                    <h3 className="font-main text-lg text-(--primary-text) font-medium captalize">{ t(stat.key) }</h3>
                                </div>
                                <h1 className="font-main text-2xl font-extrabold capitalize text-(--primary-text)">100</h1>
                            </div>
                        </HasAccess>
                    )
                })
            }
        </div>
    )
};

export default Stats;