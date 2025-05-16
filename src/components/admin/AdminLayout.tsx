
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { authState, isAdmin } = useAuth();
  const isAuthenticated = !!authState.session;

  useEffect(() => {
    const checkAuth = async () => {
      const adminStatus = await isAdmin();
      
      if (!isAuthenticated) {
        navigate('/auth');
      } else if (!adminStatus) {
        navigate('/');
      }
    };

    checkAuth();
  }, [isAuthenticated, navigate, isAdmin]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
