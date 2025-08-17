"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, LogOut, FileText } from "lucide-react";
import LicenseModal from "./license-modal";

interface UserDropdownProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    image?: string | null;
  } | null | undefined;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  // Handle case where user is undefined or null
  if (!user || !user.email) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gray-600 text-white font-semibold text-lg">
            U
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  const userInitials = getUserInitials(user.name, user.email)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
            <Avatar className="h-10 w-10">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name || user.email || 'User'} />
              ) : (
                <AvatarFallback className="bg-green-600 text-white font-semibold text-lg">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <ChevronDown className="absolute -bottom-1 -right-1 h-4 w-4 text-gray-500 bg-white rounded-full" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <p className="text-xs leading-none text-muted-foreground capitalize">{user.role || 'User'}</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setLicenseModalOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>License Agreement</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" asChild>
            <form action="/api/auth/signout" method="post" className="w-full">
              <button type="submit" className="flex items-center w-full">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LicenseModal open={licenseModalOpen} onOpenChange={setLicenseModalOpen} />
    </>
  );
}
