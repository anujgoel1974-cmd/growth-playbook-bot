import { NavLink, useLocation } from 'react-router-dom';
import {
  Rocket,
  Package,
  BarChart3,
  History,
  Target,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { RoleSwitcher } from './RoleSwitcher';

const navigationGroups = [
  {
    label: 'Campaign Creation',
    items: [
      {
        title: 'New Campaign',
        icon: Rocket,
        url: '/new-campaign',
        description: 'Analyze landing page',
      },
      {
        title: 'Catalog Analysis',
        icon: Package,
        url: '/sitemap',
        description: 'Multi-product campaigns',
        showOnlyWhen: (location: Location) => location.search.includes('url='),
      },
    ],
  },
  {
    label: 'Analytics & Insights',
    items: [
      {
        title: 'Dashboard',
        icon: BarChart3,
        url: '/dashboard',
        description: 'Campaign analytics',
      },
      {
        title: 'History',
        icon: History,
        url: '/history',
        description: 'Saved analyses',
      },
      {
        title: 'Current Analysis',
        icon: Target,
        url: '/results',
        description: 'Active campaign',
        showOnlyWhen: (location: Location) => location.pathname === '/results',
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        title: 'Platforms',
        icon: Zap,
        url: '/connect-platforms',
        description: 'Connected accounts',
      },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/new-campaign') return location.pathname === '/new-campaign';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <Sparkles className="h-6 w-6 text-primary shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-semibold text-sm truncate">Campaign AI</h2>
              <p className="text-xs text-muted-foreground truncate">Growth Playbook</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.showOnlyWhen || item.showOnlyWhen(location as any)
          );

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={collapsed ? item.title : undefined}
                          className={
                            active
                              ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
                              : 'hover:bg-accent/50'
                          }
                        >
                          <NavLink to={item.url}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="space-y-2 px-2 py-2">
          <RoleSwitcher collapsed={collapsed} />
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              <p>v1.0.0</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
