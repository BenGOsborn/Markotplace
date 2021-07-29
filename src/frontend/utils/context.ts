import { createContext, Dispatch, SetStateAction } from "react";

// Store the authentication state across the app
export const authenticated = createContext<
    [boolean, Dispatch<SetStateAction<boolean>>]
>(undefined as any);
