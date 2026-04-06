"use client";

import { Bell, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBaseFilter } from "@/contexts/base-filter-context";

const notifications = [
  { id: 1, text: "Оплатите бензовоз по сделке №18", time: "10 мин назад" },
  { id: 2, text: "Отчёт оператора Каримов ожидает проверки", time: "25 мин назад" },
  { id: 3, text: "АИ-92 на базе Чирчик: осталось на 5 дней", time: "1 час назад" },
  { id: 4, text: "Новая сделка от клиента ООО Нефтемаркет", time: "2 часа назад" },
  { id: 5, text: "АИ-95 на базе Ахангаран: критический уровень", time: "3 часа назад" },
];

export function Header() {
  const { selectedBase, setSelectedBase } = useBaseFilter();

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Select value={selectedBase} onValueChange={setSelectedBase}>
          <SelectTrigger className="w-[180px] h-9 text-sm border-stone-200">
            <SelectValue placeholder="Все базы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все базы</SelectItem>
            <SelectItem value="chirchik">Чирчик</SelectItem>
            <SelectItem value="akhangaran">Ахангаран</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors">
              <Bell className="h-5 w-5 text-stone-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-stone-100">
              <p className="text-sm font-medium text-stone-900">Уведомления</p>
            </div>
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 px-3 py-2.5">
                <span className="text-sm text-stone-700">{n.text}</span>
                <span className="text-xs text-stone-400">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                  АД
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-stone-900">Админ</p>
                <p className="text-xs text-stone-400">Руководство</p>
              </div>
              <ChevronDown className="h-4 w-4 text-stone-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Профиль</DropdownMenuItem>
            <DropdownMenuItem>Настройки</DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600">Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
