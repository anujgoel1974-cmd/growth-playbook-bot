import { useState, useEffect } from "react";
import { User, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { roles } from "@/constants/roles";

interface RoleSwitcherProps {
  collapsed: boolean;
}

export function RoleSwitcher({ collapsed }: RoleSwitcherProps) {
  const [currentRole, setCurrentRole] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "Other";
    setCurrentRole(role);
    
    // Check if current role is custom (not in predefined list)
    const isPredefinedRole = roles.some(r => r.value === role);
    if (!isPredefinedRole) {
      setCustomRole(role);
    }
  }, []);

  const getCurrentRoleDisplay = () => {
    const predefinedRole = roles.find(r => r.value === currentRole);
    if (predefinedRole) {
      return predefinedRole.label;
    }
    // If custom role, truncate if too long
    return currentRole.length > 20 
      ? currentRole.substring(0, 17) + "..." 
      : currentRole;
  };

  const handleRoleChange = (newRole: string) => {
    if (newRole !== 'Other') {
      localStorage.setItem("userRole", newRole);
      setCurrentRole(newRole);
      setCustomRole("");
      setIsOpen(false);
      
      toast({
        title: "Role Updated",
        description: `Your insights are now personalized for ${roles.find(r => r.value === newRole)?.label}`,
      });
    } else {
      setCurrentRole('Other');
      // Keep popover open for custom role input
    }
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim().length === 0) return;
    
    const roleToSave = customRole.trim();
    localStorage.setItem("userRole", roleToSave);
    setCurrentRole(roleToSave);
    setIsOpen(false);
    
    toast({
      title: "Role Updated",
      description: `Your insights are now personalized for ${roleToSave}`,
    });
  };

  const isRoleSelected = (roleValue: string) => {
    if (roleValue === 'Other') {
      return !roles.some(r => r.value === currentRole) || currentRole === 'Other';
    }
    return currentRole === roleValue;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-2 h-10"
          title={collapsed ? getCurrentRoleDisplay() : undefined}
        >
          <User className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm truncate">
                {getCurrentRoleDisplay()}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="right" 
        align="end"
        className="w-80"
      >
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Select Your Role</h4>
          
          <div className="space-y-1">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = isRoleSelected(role.value);
              
              return (
                <Button
                  key={role.value}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-3 px-3",
                    isSelected && "bg-primary/10 text-primary"
                  )}
                  onClick={() => handleRoleChange(role.value)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{role.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </Button>
              );
            })}
          </div>
          
          {/* Custom Role Input - shows when "Other" is selected or custom role exists */}
          {(currentRole === 'Other' || !roles.some(r => r.value === currentRole)) && (
            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-medium">Custom Role</label>
              <Textarea
                placeholder="Describe your role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="min-h-[80px] text-sm"
                maxLength={100}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={handleCustomRoleSubmit}
                disabled={customRole.trim().length === 0}
              >
                Save Custom Role
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
