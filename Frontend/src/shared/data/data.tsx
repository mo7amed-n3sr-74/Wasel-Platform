import ProfilelBalance from "@/components/ProfileBalance";
import ProfileLook from "@/components/ProfileLook";
import ProfileReviews from "@/components/ProfileReviews";
import ProfileShipments from "@/components/ProfileShipments";
import {
    PiTruckTrailer,
    PiThermometerCold,
    PiWarning,
    PiDrop,
    PiTractor,
    PiCar,
    PiHouse,
    PiShippingContainer,
    PiTicket,
    PiGear,
    PiPath
} from "react-icons/pi";

export const ar_months = {
    '01': 'يناير',
    '02': 'فبراير',
    '03': 'مارس',
    '04': 'إبريل',
    '05': 'مايو',
    '06': 'يونيو',
    '07': 'يوليو',
    '08': 'أغسطس',
    '09': 'سبتمبر',
    '10': 'أكتوبر',
    '11': 'نوفمير',
    '12': 'ديسمبر'
}

export const shipmentTypes = [
    {
        type: "شحنة عامة",
        icon: PiTruckTrailer
    },
    {
        type: "مبردة / مجمدة",
        icon: PiThermometerCold
    },
    {
        type: "مواد خطر (ADR)",
        icon: PiWarning
    },
    {
        type: "بضاعة سائبة",
        icon: PiDrop
    },
    {
        type: "معدات ثقيلة",
        icon: PiTractor
    },
    {
        type: "سيارات",
        icon: PiCar
    },
]

export const shipmentTypesFilter = [
    "الكل", 
    "شحنة عامة", 
    "مواد بناء", 
    "مواد غذائية", 
    "سائل / كيميائي", 
    "مبردة / مجمدة", 
    "معدات ثقيلة"
]

// New Shipment
export const newShipmentSections = [
    {
        title: "نوع الشحنة",
        path: ""
    },
    {
        title: "تفاصيل الشحنة",
        path: ""
    },
    {
        title: "البيانات الرئيسية",
        path: ""
    },
    {
        title: "نقط التحميل والتفريغ",
        path: ""
    },
    {
        title: "الصور والمرفقات",
        path: ""
    },
    {
        title: "خيارات إضافية",
        path: ""
    },
    {
        title: "الدفع والمزانية",
        path: ""
    },
]

// Profile
export const profileTabs = [
    { title: "نظرة عامة", key: "public_view", component: ProfileLook },
    { title: "الحمولات", key: "shipments", component: ProfileShipments },
    { title: "الرصيد", key: "balance", component: ProfilelBalance },
    { title: "التقييم", key: "reviews", component: ProfileReviews },
]

export const packagingItems = [
    "كرتون",
    "بالتات",
    "صناديق خشب",
    "أكياس",
    "براميل",
    "رولات",
    "كراتين ملفوفة بشرنك",
    "أكياس نيلون ملفوفة",
    "عبوات زجاجية",
    "صناديق بلاستيك",
    "صناديق معدنية"<
    "أكياس كبيرة",
    "صفائح",
    "بدون تغليف",
]

// Dashboard
export const sidebarItems = [
    {
        name: "الرئيسية",
        icon: PiHouse,
        path: "/dashboard",
        hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"],
    },
    {
        name: "الحمولات",
        icon: PiShippingContainer,
        path: "shipments",
        hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"]
    },
    {
        name: "التتبعات",
        icon: PiPath,
        path: "tracking",
        hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"]
    },
    {
        name: "العروض",
        icon: PiTicket,
        path: "offers",
        hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"]
    },
    {
        name: "الإعدادت",
        icon: PiGear,
        path: "",
        hasAccess: ["admin", "manufacturer", "carrier_company", "independent_carrier"]
    },
];