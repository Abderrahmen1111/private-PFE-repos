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

function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  /** When set (dashboard), the small header avatar shows this business; the menu panel still shows `user`. */
  businessTrigger?: { name: string; logoUrl?: string | null } | null;
  onAction?: (action: string) => void;
  onSwitchStore?: (storeId: string) => void;
}


export const UserDropdown = ({
  user,
  businessTrigger,
  onAction = () => {},
  onSwitchStore,
}: UserDropdownProps) => {

  const isClient = user.role?.toLowerCase() === 'client';
  const isAdmin = user.role?.toLowerCase() === 'admin';
  const triggerName = businessTrigger?.name ?? user.name;
  const triggerImg = businessTrigger ? businessTrigger.logoUrl : user.avatar;
  const triggerSrc = getAvatarUrl(triggerImg, triggerName);
  const triggerInitials = businessTrigger
    ? initialsFromDisplayName(businessTrigger.name)
    : user.initials;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-9 border border-white/20 hover:border-black/40 transition">
          <AvatarImage src={triggerSrc} alt={triggerName} />
          <AvatarFallback className="bg-black/50 text-white text-sm font-semibold">
            {triggerInitials}
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
          
          {isAdmin ? (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
                onClick={() => onAction('account-settings')}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
                onClick={() => onAction('security')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="text-sm font-medium">Security</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition"
                onClick={() => onAction('activity-logs')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span className="text-sm font-medium">Activity Logs</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
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
            </>
          )}
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