import { string } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware"; 

interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
    salary: number;
    city_name: string;
  } | null;
  setUser: (user: UserState["user"]) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "user-storage", 
    }
  )
);