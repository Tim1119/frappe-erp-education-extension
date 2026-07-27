import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { initials } from "@/utils/format";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemePicker from "./ThemePicker";

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout, isAdmin, school } = useAuth();
  const { mode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const roleLabel = isAdmin ? "Administrator" : "Teacher";
  const fullName = user?.full_name || roleLabel;

  async function handleLogout() {
    await logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left: mobile hamburger */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: theme + user */}
      <div className="flex items-center gap-1.5">
        {/* Theme mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleMode}>
          {mode === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Color picker */}
        <ThemePicker />

        {/* User chip — avatar + name + role visible inline */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-accent">
              <Avatar className="h-8 w-8">
                {user?.photo_url && <AvatarImage src={user.photo_url} alt="" />}
                <AvatarFallback className="text-[11px]">
                  {initials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-[13px] font-semibold">{fullName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {roleLabel}
                </div>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {roleLabel} · {school?.name}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
