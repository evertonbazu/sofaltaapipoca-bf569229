
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Cog, LayoutDashboard, ListOrdered, MessageSquare } from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarLink = ({ to, icon, label, isActive }: SidebarLinkProps) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 p-2 rounded-md ${
      isActive
        ? "bg-indigo-100 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath.includes(path);
  };

  return (
    <div className="w-full md:w-64 bg-white shadow-sm p-4 space-y-4">
      <div className="font-bold text-xl text-center md:text-left mb-6">
        Admin Panel
      </div>
      <nav className="space-y-2">
        <SidebarLink
          to="/admin"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isActive={currentPath === "/admin" || currentPath === "/admin/"}
        />
        <SidebarLink
          to="/admin/subscriptions"
          icon={<ListOrdered size={20} />}
          label="Assinaturas"
          isActive={isActive("/admin/subscriptions")}
        />
        <SidebarLink
          to="/admin/messages"
          icon={<MessageSquare size={20} />}
          label="Mensagens"
          isActive={isActive("/admin/messages")}
        />
        <SidebarLink
          to="/admin/settings"
          icon={<Cog size={20} />}
          label="Configurações"
          isActive={isActive("/admin/settings")}
        />
      </nav>
    </div>
  );
};

export default AdminSidebar;
