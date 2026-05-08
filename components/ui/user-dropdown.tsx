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
import { LogOut, User, Settings, Bell, CreditCard, ShoppingCart, Plus } from "lucide-react";
import { getAvatarUrl } from "@/lib/utils/avatar";

interface UserDropdownProps {

  user: {
    name: string;
    username: string;
    avatar?: string;
    initials: string;
    status?: string;
    role?: string;
    ownedStores?: Array<{ id: string; name: string; status: string; logo?: string }>;
  };
  onAction?: (action: string) => void;
  onSwitchStore?: (storeId: string) => void;
}


export const UserDropdown = ({ user, onAction = () => {}, onSwitchStore }: UserDropdownProps) => {

  const isClient = user.role?.toLowerCase() === 'client';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-9 border border-white/20 hover:border-black/40 transition">
          <AvatarImage src={getAvatarUrl(user.avatar, user.name)} alt={user.name} />
          <AvatarFallback className="bg-black/50 text-white text-sm font-semibold">
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
            <AvatarImage src={getAvatarUrl(user.avatar, user.name)} alt={user.name} />
            <AvatarFallback className="bg-black/10 text-white text-sm font-semibold">
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
            <span className="text-sm font-medium">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
            onClick={() => onAction(isClient ? 'notifications' : 'business-settings')}
          >
            {isClient ? <Bell className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            <span className="text-sm font-medium">{isClient ? 'Notifications' : 'Business Settings'}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
            onClick={() => onAction(isClient ? 'panier' : 'billing')}
          >
            {isClient ? <ShoppingCart className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
            <span className="text-sm font-medium">{isClient ? 'Panier' : 'Billing'}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {!isClient && user.ownedStores && user.ownedStores.length > 1 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <div className="px-3 py-2">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1 mb-2">Mes Établissements</p>
              <DropdownMenuGroup className="space-y-1">
                {user.ownedStores.map((store) => (
                  <DropdownMenuItem
                    key={store.id}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition"
                    onClick={() => onSwitchStore?.(store.id)}
                  >
                    <div className="size-6 rounded-md bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                      {store.logo ? (
                        <img src={getAvatarUrl(store.logo, store.name)} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </div>
                    <span className="text-xs font-semibold truncate flex-1">{store.name}</span>
                    {store.status !== 'APPROVED' && (
                      <span className="text-[8px] px-1 bg-yellow-500/20 text-yellow-500 rounded">Wait</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </div>
          </>
        )}


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