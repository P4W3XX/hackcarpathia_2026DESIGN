/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";

interface MenuProps {
  onNavigate?: (
    page:
      | "contract-analyzer"
      | "cv-creator"
      | "jobs"
      | "career"
      | "salary-calculator"
      | "home"
      | "taxes"
      | "doctors"
      | "interview"
      | "laundry",
  ) => void;
  isExpanded: boolean;
  onToggleMenu: () => void;
}
import {
  Briefcase,
  Menu as MenuIcon,
  X,
  TrendingUp,
  CheckCircle,
  ChevronUp,
  Sparkles,
  Settings,
  ShoppingBag,
  Receipt,
  LogOut,
  Calculator,
  Newspaper,
  Stethoscope,
  ClipboardClock,
  WashingMachine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth-action";
import { useUserStore } from "@/store/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Menu: React.FC<MenuProps> = ({
  onNavigate,
  isExpanded,
  onToggleMenu,
}) => {
  const [activeItem, setActiveItem] = useState<string>("salary-calculator");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const menuItems = [
    {
      id: "salary-calculator",
      label: "Kalkulator wynagrodzeń",
      icon: Calculator,
      description: "Oblicz swoje potencjalne zarobki",
      page: "salary-calculator" as const,
    },
    {
      id: "jobs",
      label: "Oferty pracy",
      icon: Briefcase,
      description: "Porównaj warunki pracy i wynagrodzenie",
      page: "jobs" as const,
    },
    {
      id: "career",
      label: "Ścieżka rozwoju",
      icon: TrendingUp,
      description: "Wymagania do awansu i wyższych zarobków",
      page: "career" as const,
    },
    {
      id: "taxes",
      label: "Podatki i terminy",
      icon: Receipt,
      description: "Instrukcje odprowadzania podatków",
      page: "taxes" as const,
    },
    {
      id: "doctors",
      label: "Wizyty u lekarza",
      icon: Stethoscope,
      description: "Planuj wizyty i monitoruj zdrowie",
      page: "doctors" as const,
    },
    {
      id: "form",
      label: "Sprawdź zgodność formularza",
      icon: CheckCircle,
      description: "Walidacja i weryfikacja danych",
      page: "contract-analyzer" as const,
    },
    {
      id: "cv-creator",
      label: "Kreator CV",
      icon: Newspaper,
      description: "Stwóż swoje pierwsze CV",
      page: "cv-creator" as const,
    },
    {
      id: "interview",
      label: "Symulator rozmowy o pracę",
      icon: ClipboardClock,
      description: "Przeprowadź testową rozmowę o pracę",
      page: "interview" as const,
    },
    {
      id: "laundry",
      label: "Poradnik prania",
      icon: WashingMachine,
      description: "Sprawdź jak wyprać twoje ubrania",
      page: "laundry" as const,
    },
  ];

  const handleMenuItemClick = (item: (typeof menuItems)[0]) => {
    if (onNavigate) {
      onNavigate(item.page);
    }
    setActiveItem(item.id);
  };

  return (
    <aside
      className={cn(
        "fixed z-50 h-svh bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-500 ease-in-out overflow-hidden flex flex-col",
        isExpanded ? "w-72" : "w-17",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border h-18">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg  text-primary-foreground">
              <img
                src="/adultify.png"
                alt="adultify logo"
                className="w-full h-full"
              />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Adultify</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleMenu}
          aria-label="Toggle menu"
          className="ml-auto"
        >
          {isExpanded ? (
            <X className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </Button>
      </div>

      <nav className="p-3 flex flex-col gap-1 overflow-y-auto flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
              className={cn(
                "group relative w-full rounded-lg text-left transition-all duration-200 flex items-center gap-3 px-3 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "size-5 flex-shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                )}
              />

              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight truncate">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs truncate mt-0.5",
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "relative flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors",
                !isExpanded && "justify-center",
              )}
            >
              <div className="relative flex size-9 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground flex-shrink-0 text-sm">
                {user?.name
                  ?.split(" ")
                  .map((word) => word.charAt(0))
                  .join("")
                  .toUpperCase()}
              </div>
              {isExpanded && (
                <>
                  <span className="flex-1 text-left text-sm font-medium truncate">
                    {user?.name || "User"}
                  </span>
                  <ChevronUp
                    className={cn(
                      "size-4 text-muted-foreground transition-transform",
                      isDropdownOpen && "rotate-180",
                    )}
                  />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={10}
            className="w-64"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="size-4" />
                Ustawienia
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => logoutAction()}
                variant="destructive"
              >
                <LogOut className="size-4" />
                Wyloguj
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};
