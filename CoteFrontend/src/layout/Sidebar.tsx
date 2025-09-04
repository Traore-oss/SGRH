import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  Building2, 
  FileText, 
  Menu,
  UserCheck,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'employees', label: 'Employés', icon: Users },
  { id: 'leaves', label: 'Congés', icon: Calendar },
  { id: 'attendance', label: 'Présences', icon: Clock },
  { id: 'departments', label: 'Départements', icon: Building2 },
  { id: 'training', label: 'Formations', icon: GraduationCap },
  { id: 'performance', label: 'Évaluations', icon: TrendingUp },
  { id: 'recruitment', label: 'Recrutement', icon: UserCheck },
  { id: 'reports', label: 'Rapports', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  collapsed, 
  setCollapsed 
}) => {
  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">SGRH</h1>
              <p className="text-xs text-gray-500">Système RH</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};