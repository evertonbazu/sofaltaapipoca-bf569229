
import React from "react";
import { Link } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const AdminHeader = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">
        Painel Administrativo
      </h1>
      <div className="flex space-x-2">
        <Link to="/">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Início
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
