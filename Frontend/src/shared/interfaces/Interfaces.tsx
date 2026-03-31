export interface Shipment {
    id?: string,
    shipmentId?: string,
    origin: string,
    origin_lat?: number,
    origin_lng?: number,
    destination: string,
    destination_lat?: number,
    destination_lng?: number,
    shipmentType: string,
    packaging: string,
    goodsType: string,
    weight: number,
    length: number,
    height: number,
    width: number
    stacking?: boolean,
    pickupAt: Date | undefined,
    deliveryAt: Date | undefined,
    description: string,

    urgent?: boolean,
    additionalInsurance?: boolean,
    twoDrivers?: boolean,
    noFriday?: boolean,

    budgetType: string,
    suggestedBudget?: number,
    paymentType: string

    offerCount?: number

    attachments?: [{
        attachmentType: string,
        url: string
    }];

    profile?: {
        first_name: string,
        last_name: string
    }

    acceptedOffer: {
        id: string,
        price: number,
        proposal: string,
        status: string,
        createdAt: Date,
        updatedAt: Date,
        profile: {
            username: string,
            first_name: string | null,
            last_name: string | null,
            role: string
        }
    }
}

export interface Offer {
	id: string;
	price: number;
	proposal: string;
	status: "PENDING" | "IN_PROGRESS" | "IN_TRANSIT" | "DELAYED" | "DELIVERED" | "CANCELLED";
	createdAt: string;
	profileId: string;
	profile: {
		username: string;
		first_name: string | null;
		last_name: string | null;
		picture: string;
	};
	shipment: {
		id: string;
		shipmentId: string;
		origin: string;
		destination: string;
		shipmentType: string;
		weight: number;
		length: number;
		width: number;
		height: number;
		packaging: string;
		goodsType: string;
		description: string;
		status: string;
		pickupAt: string;
		deliveryAt: string;
		urgent: boolean;
		budgetType: string;
		paymentType: string;
		offerCount: number;
        acceptedBy?: {
            first_name: string,
            last_name: string,
            price: string
        }
	};
}

export interface Attachment {
    id: string,
    shipmentId: string,
    attachmentType: string, 
    createAt: string 
    updatedAt: string
    url: string
}

export interface SigninForm { 
    email: string,
    password: string,
}

export interface ResetPasswordForm {
    newPassword: string,
    confirmPassword: string
}

export interface ShipmentFilter {
    search: string,
    type: string,
    urgent: boolean,
    minWeight: number | undefined,
    maxWeight: number | undefined
}

export interface Offer {
    price: number,
    proposal: string
}

export interface ShipmentAttachment {
    id: string,
    url: string,
    attachmentType: string,
    name: string,
    extension: string,
    size: string,
    shipmentId: string,
    createdAt: string,
    updatedAt: string
}


