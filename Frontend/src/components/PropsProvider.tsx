import React, { useContext, createContext, type ReactNode, useState } from "react";
// import type { Shipment } from "@/utils/Interfaces";

export type User = {
    id: string,
    username: string,
    first_name: string,
    last_name: string,
    companyName: string,
    picture: string,
    bio: string,
    gender: string,
    phone: string,
    dateOfBith: string,
    age: string,
    commercialRegister: string,
    carCount: string,
    role: string,
    isActive: boolean,
    verify: boolean,
    createAt: string,
    updateAt: string,
    userId: string
}

interface ContextProps {
    user: User | null,
    setUser: (user: User | null) => void,
    isLoading: boolean,
    setIsLoading: (value: boolean) => void
}

const PropsContext = createContext<ContextProps | undefined>(undefined);

export const useProps = () => {
    const context = useContext(PropsContext);
    if (!context) {
        throw new Error('useProps must be used within PropProvider');
    }
    return context;
}

const PropsProvider: React.FC<{ children: ReactNode }> =  ({ children }) => {
    const [ user, setUser ] = useState<User | null>(null);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    // const [ shipments, setShipments ] = useState<Shipment[]>([]);

    return (
        <PropsContext.Provider value={{ 
            user, 
            setUser,
            isLoading,
            setIsLoading,
            }}>
            { children }
        </PropsContext.Provider>
    )
}

export default PropsProvider;