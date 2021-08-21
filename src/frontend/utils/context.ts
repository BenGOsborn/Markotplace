import { createContext, Dispatch, SetStateAction } from "react";

// Store the authentication state across the app
export const authenticatedCtx = createContext<
    [boolean, Dispatch<SetStateAction<boolean>>]
>(undefined as any);

export interface MarketApp {
    name: string;
    title: string;
    description: string;
    author: string;
    price: number;
}

// Store the market apps state across the app
export const marketAppsCtx = createContext<
    [MarketApp[] | null, Dispatch<SetStateAction<MarketApp[] | null>>]
>(undefined as any);
