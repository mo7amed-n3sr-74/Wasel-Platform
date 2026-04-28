export interface ShipmentAttachments {
    shipmentImgs: Express.Multer.File[];
    shipmentDocs: Express.Multer.File[];
}

export interface TruckAttachments {
    truck_license_front: Express.Multer.File,
    truck_license_back: Express.Multer.File,
    truck_front: Express.Multer.File,
}