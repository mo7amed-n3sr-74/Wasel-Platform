import { Link } from "react-router-dom";
import { useProps } from "./PropsProvider";
import {
    PiTruckTrailer,
    PiArrowsClockwise,
    PiStar,
    PiCheck,
} from "react-icons/pi";

function ProfileLook() {
    const { user } = useProps();

    const isManufacturer = user?.role === "MANUFACTURER";
    const companyName = isManufacturer
        ? "شركة الخبر للإنتاج الحيواني"
        : user?.username || "العميل";

    const accountType = isManufacturer ? "شركة مصنعة" : "مستخدم";
    const industry = isManufacturer ? "إنتاج حيواني" : user?.bio || "قطاع عام";
    const publishedShipments = isManufacturer ? 12 : 0;

    return (
        <>
            <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
                {[
                    { label: "عدد الشحنات", value: 45, icon: PiTruckTrailer },
                    { label: "الحمولات النشطة", value: 45, icon: PiArrowsClockwise },
                    { label: "التقييم", value: "4/5", icon: PiStar },
                    { label: "الحمولات المكتملة", value: 45, icon: PiCheck },
                ].map((item) => (
                    <div key={item.label} className="rounded-3xl p-5 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-(--primary-color)/10 text-(--primary-color)">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-semibold text-(--main-text)">{item.value}</p>
                        <p className="mt-2 text-base text-(--secondary-text)">{item.label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 mb-6 border-b border-(--tertiary-color)/25">
                    <h2 className="text-2xl font-semibold text-(--main-text)">معلومات الحساب</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl bg-(--primary-color)/8 p-4">
                        <span className="text-lg text-(--secondary-text)">اسم الشركة:</span>
                        <span className="font-medium text-(--main-text)">{companyName}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-(--primary-color)/8 p-4">
                        <span className="text-lg text-(--secondary-text)">نوع الحساب:</span>
                        <span className="font-medium text-(--main-text)">{accountType}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-(--primary-color)/8 p-4">
                        <span className="text-lg text-(--secondary-text)">الحمولات المنشورة:</span>
                        <span className="font-medium text-(--main-text)">{publishedShipments}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-(--primary-color)/8 p-4">
                        <span className="text-lg text-(--secondary-text)">مجال الصناعة:</span>
                        <span className="font-medium text-(--main-text)">{industry}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-[28px] bg-(--primary-color) p-6 text-white shadow-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-2xl font-semibold">ابدأ الآن في توصيل بضاعتك</h3>
                        <p className="mt-2 max-w-3xl text-sm text-white/80">
                            نحن منصة رائدة في مجال نقل الحمولات. نهدف إلى تسهيل عملية النقل من خلال ربط أصحاب الحمولات بشركات الشحن والأفراد الناقلين. قم بتجربة خدماتنا الآن ووسع نشاطك بأمان وكفاءة.
                        </p>
                    </div>
                    <Link to="/shipments" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-(--primary-color) transition hover:bg-white/90">
                        تصفح الشحنات
                    </Link>
                </div>
            </div>
        </>
    )
}

export default ProfileLook;