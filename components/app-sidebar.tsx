'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Flag,
  Home,
  LogOut,
  Settings,
  Shield,
  Swords,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type Role = 'PLAYER' | 'REFEREE' | 'ADMIN';

interface UserData {
  id: string;
  adSoyad: string;
  eposta?: string;
  rol?: Role;
}

interface Team {
  id: string;
  name: string;
}

interface MenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: Array<{ title: string; url: string }>;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface SidebarScaffoldProps {
  header?: React.ReactNode;
  menuGroups: MenuGroup[];
  user: UserData | null;
  onLogout: () => Promise<void> | void;
  isLoggingOut: boolean;
  profilePath?: string;
  settingsPath?: string;
}

function useUserInfo() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) {
          setUser(data);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Kullanıcı bilgileri alınamadı:', error);
        }
      }
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = React.useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.replace('/login');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Çıkış yapılırken hata oluştu:', error);
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  return { user, handleLogout, isLoggingOut };
}

function SidebarMenuTree({ items }: { items: MenuItem[] }) {
  return (
    <SidebarMenu>
      {items.map((item) =>
        item.subItems && item.subItems.length > 0 ? (
          <Collapsible key={item.title} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={subItem.url} onClick={() => NProgress.start()}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <Link href={item.url} onClick={() => NProgress.start()}>
                {item.icon && <item.icon className="size-4" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      )}
    </SidebarMenu>
  );
}

function SidebarFooterProfile({
  user,
  onLogout,
  isLoggingOut,
  profilePath,
  settingsPath,
}: {
  user: UserData | null;
  onLogout: () => Promise<void> | void;
  isLoggingOut: boolean;
  profilePath: string;
  settingsPath: string;
}) {
  const router = useRouter();
  const { state } = useSidebar();

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <User className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.adSoyad || 'Kullanıcı'}
                  </span>
                  <span className="truncate text-xs">
                    {user?.eposta || 'Profil Bilgileri'}
                  </span>
                </div>
                <ChevronDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={state === 'collapsed' ? 'right' : 'top'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => router.push(profilePath)}
              >
                <User className="size-4" />
                <span>Profilim</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => router.push(settingsPath)}
              >
                <Settings className="size-4" />
                <span>Ayarlar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onSelect={onLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="size-4" />
                <span>{isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function SidebarScaffold({
  header,
  menuGroups,
  user,
  onLogout,
  isLoggingOut,
  profilePath = '/dashboard/profile',
  settingsPath = '/dashboard/settings',
}: SidebarScaffoldProps) {
  return (
    <Sidebar collapsible="icon">
      {header ? <SidebarHeader>{header}</SidebarHeader> : null}
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuTree items={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooterProfile
        user={user}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        profilePath={profilePath}
        settingsPath={settingsPath}
      />
    </Sidebar>
  );
}

function TeamSwitcher({
  teams,
  selectedTeam,
  onSelect,
}: {
  teams: Team[];
  selectedTeam: Team | null;
  onSelect: (team: Team | null) => void;
}) {
  const { state } = useSidebar();
  const router = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Trophy className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedTeam?.name || 'Takım Seç'}
                </span>
                <span className="truncate text-xs">Turnuva Yönetimi</span>
              </div>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={state === 'collapsed' ? 'right' : 'bottom'}
            sideOffset={4}
          >
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                className="gap-2 p-2"
                onSelect={() => onSelect(team)}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border bg-sidebar-primary text-sidebar-primary-foreground">
                  <Trophy className="size-4" />
                </div>
                {team.name}
                {selectedTeam?.id === team.id && (
                  <div className="ml-auto size-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onSelect={() => router.push('/teams')}
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Users className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Takımları Yönet</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function useTeams() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams/my-teams');
        if (!response.ok) return;
        const data = await response.json();
        const fetchedTeams: Team[] = (data.teams || []).map((team: Team) => ({
          id: team.id,
          name: team.name,
        }));

        if (isMounted) {
          setTeams(fetchedTeams);
          setSelectedTeam((prev) => prev ?? fetchedTeams[0] ?? null);
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Takımlar alınamadı:', error);
        }
      }
    };

    fetchTeams();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectTeam = React.useCallback((team: Team | null) => {
    setSelectedTeam(team);
  }, []);

  return { teams, selectedTeam, handleSelectTeam };
}

export function PlayerSidebar() {
  const { user, handleLogout, isLoggingOut } = useUserInfo();
  const { teams, selectedTeam, handleSelectTeam } = useTeams();

  const playerMenuGroups: MenuGroup[] = [
    {
      label: 'Menü',
      items: [
        { title: 'Ana Sayfa', url: '/dashboard', icon: Home },
        { title: 'Takımım', url: '/dashboard/team', icon: Users },
        { title: 'Maçlar', url: '/dashboard/matches', icon: Swords },
        { title: 'Takvim', url: '/dashboard/calendar', icon: Calendar },
        { title: 'İstatistikler', url: '/dashboard/stats', icon: BarChart3 },
      ],
    },
  ];

  return (
    <SidebarScaffold
      header={<TeamSwitcher teams={teams} selectedTeam={selectedTeam} onSelect={handleSelectTeam} />}
      menuGroups={playerMenuGroups}
      user={user}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  );
}

export function AdminSidebar() {
  const { user, handleLogout, isLoggingOut } = useUserInfo();
  const { state } = useSidebar();

  const adminMenuGroups: MenuGroup[] = [
    {
      label: 'Yönetim',
      items: [
        { title: 'Kontrol Paneli', url: '/admin', icon: Shield },
        { title: 'Kullanıcılar', url: '/admin/users', icon: Users },
      ],
    },
  ];

  return (
    <SidebarScaffold
      header={
        <div className={state === 'collapsed' ? 'flex items-center justify-center py-4' : 'px-3 py-4'}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Shield className="size-5 shrink-0" />
            </div>
            {state !== 'collapsed' && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Yönetici Paneli</p>
                <p className="truncate text-xs text-muted-foreground">Sistem denetimi</p>
              </div>
            )}
          </div>
        </div>
      }
      menuGroups={adminMenuGroups}
      user={user}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
      profilePath="/admin/profile"
      settingsPath="/admin/settings"
    />
  );
}

export function RefereeSidebar() {
  const { user, handleLogout, isLoggingOut } = useUserInfo();
  const { state } = useSidebar();

  const refereeMenuGroups: MenuGroup[] = [
    {
      label: 'Hakemlik',
      items: [
        { title: 'Dashboard', url: '/referee', icon: Home },
        { title: 'Maçlar', url: '/referee/matches', icon: Swords },
      ],
    },
  ];

  return (
    <SidebarScaffold
      header={
        <div className={state === 'collapsed' ? 'flex items-center justify-center py-4' : 'px-3 py-4'}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Flag className="size-5 shrink-0" />
            </div>
            {state !== 'collapsed' && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Hakem Paneli</p>
                <p className="truncate text-xs text-muted-foreground">Maç görevleri</p>
              </div>
            )}
          </div>
        </div>
      }
      menuGroups={refereeMenuGroups}
      user={user}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
      profilePath="/referee/profile"
      settingsPath="/referee/settings"
    />
  );
}
