"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Wallet,
  Users,
  Truck,
  Fuel,
  UserCheck,
  ChevronLeft,
  Menu,
  ClipboardList,
  CircleDollarSign,
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Обзор",
    items: [
      { href: "/", label: "Дашборд", icon: LayoutDashboard },
    ],
  },
  {
    label: "Учёт",
    items: [
      { href: "/operations", label: "Операции", icon: ClipboardList },
      { href: "/sales", label: "Продажи", icon: ShoppingCart },
      { href: "/receivables", label: "Дебиторка", icon: CircleDollarSign },
    ],
  },
  {
    label: "Ресурсы",
    items: [
      { href: "/clients", label: "Клиенты", icon: UserCheck },
      { href: "/tankers", label: "Бензовозы", icon: Truck },
      { href: "/operators", label: "Операторы", icon: Users },
    ],
  },
  {
    label: "Отчёты",
    items: [
      { href: "/reports", label: "Отчёты операторов", icon: FileText },
      { href: "/expenses", label: "Расходы", icon: Wallet },
      { href: "/fuel-analysis", label: "Топливо", icon: Fuel },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-stone-200"
      >
        <Menu className="h-5 w-5 text-stone-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen sidebar-gradient text-white z-40 flex flex-col transition-all duration-300 custom-scrollbar",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
                E
              </div>
              <span className="text-lg font-semibold tracking-tight">ENO Portal</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold mx-auto">
              E
            </div>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className={cn(
              "hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors",
              collapsed && "mx-auto mt-2"
            )}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-stone-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-white/10 text-white relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-full before:bg-blue-400"
                          : "text-stone-300 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 py-4 border-t border-white/10">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider">Etive Neft Oil</p>
            <p className="text-xs text-stone-400 mt-0.5">v2.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
