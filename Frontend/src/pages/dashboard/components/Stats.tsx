import {
    PiWallet,
    PiClock,
    PiPath,
    PiCheckCircle
} from "react-icons/pi";
import HasAccess from "@/components/HasAccess";
import { useTranslation } from "react-i18next";
import { useStats } from "@/api/hooks/dashboard/useStats";
import type { StatsResponse } from "@/shared/interfaces/Interfaces";
import { statItems } from "@/shared/data/data";

function Stats() {

    const { t } = useTranslation();

    const { data, isLoading } = useStats();
    const stats: StatsResponse = data?.data;

    if (isLoading) return null;

    return (
        <div className="flex items-stretch justify-between gap-4">
            {
                statItems.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <HasAccess key={idx} role={stat.hasAccess}>
                            <div key={`stat-${idx}`} className="relative flex flex-col basis-full gap-5 rounded-2xl bg-(--secondary-color) p-5 after:content-start after:absolute after:w-20 after:h-20 after:bg-(--primary-color) after:-top-10 after:-left-10 after:rounded-full after:blur-3xl overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <Icon className="text-3xl text-(--primary-color)"/>
                                    <h3 className="font-main text-lg text-(--primary-text) font-medium captalize">{ t(stat.title) }</h3>
                                </div>
                                <h1 className="font-main text-2xl font-extrabold capitalize text-(--primary-text)">{ stats[stat.key as keyof Stats] }</h1>
                            </div>
                        </HasAccess>
                    )
                })
            }
        </div>
    )
};

export default Stats;