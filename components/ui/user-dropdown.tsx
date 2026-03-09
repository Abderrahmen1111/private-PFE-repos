'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Bell } from "lucide-react";

interface UserDropdownProps {
  user: {
    name: string;
    username: string;
    avatar?: string;
    initials: string;
    status?: string;
  };
  onAction?: (action: string) => void;
}

export const UserDropdown = ({ user, onAction = () => {} }: UserDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-9 border border-white/20 hover:border-white/40 transition">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl p-1"
        align="end"
        sideOffset={8}
      >
        {/* User info header */}
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="size-10 border border-white/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.username}</p>
          </div>
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400" title="Online" />
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
            onClick={() => onAction('profile')}
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Your profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
            onClick={() => onAction('settings')}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
            onClick={() => onAction('notifications')}
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition"
            onClick={() => onAction('logout')}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;