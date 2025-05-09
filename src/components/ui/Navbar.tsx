import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { APP_VERSION } from '@/App';

const Navbar = () => {
  const { authState, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getNavLinkClasses = (isActive: boolean) => {
    return `block px-4 py-2 rounded-md ${
      isActive 
        ? 'bg-indigo-100 text-indigo-800 font-medium' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  const AdminNavLinks = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <>
        <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/subscriptions" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Anúncios
        </NavLink>
        <NavLink to="/admin/pending" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Aprovações
        </NavLink>
        <NavLink to="/admin/export" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Exportar TXT
        </NavLink>
        <NavLink to="/admin/export-all" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Exportar Tudo
        </NavLink>
        <NavLink to="/admin/import" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Importar TXT
        </NavLink>
        <NavLink to="/admin/import-bulk" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Importação em Massa
        </NavLink>
        <NavLink to="/admin/users" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Usuários
        </NavLink>
        <NavLink to="/admin/messages" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Mensagens
        </NavLink>
        <NavLink to="/admin/profile" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
          Meu Perfil
        </NavLink>
      </>
    );
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white shadow-sm transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">🍿 Só Falta a Pipoca</span>
              <span className="ml-2 text-xs text-gray-500">v{APP_VERSION}</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              Início
            </NavLink>
            
            <NavLink to="/contact" className={({ isActive }) => 
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }>
              Contato
            </NavLink>

            {authState.user ? (
              <>
                <NavLink to="/new" className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }>
                  Novo Anúncio
                </NavLink>
                
                {/* Admin dropdown for desktop */}
                {authState.userDetails?.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Admin
                      {isAdminDropdownOpen ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <AdminNavLinks closeMenu={() => setIsAdminDropdownOpen(false)} />
                      </div>
                    )}
                  </div>
                )}
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{authState.userDetails?.username || 'Usuário'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
              Início
            </NavLink>
            
            <NavLink to="/contact" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
              Contato
            </NavLink>
            
            {authState.user && (
              <NavLink to="/new" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
                Novo Anúncio
              </NavLink>
            )}
            
            {authState.user && (
              <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => getNavLinkClasses(isActive)}>
                Meu Perfil
              </NavLink>
            )}
            
            {/* Admin links for mobile */}
            {authState.userDetails?.role === 'admin' && (
              <>
                <div className="px-4 py-2 text-sm font-medium text-gray-500 border-t border-gray-200 mt-2">
                  Admin
                </div>
                <AdminNavLinks closeMenu={closeMenu} />
              </>
            )}
            
            {authState.user ? (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/auth');
                  closeMenu();
                }}
                className="flex w-full items-center px-4 py-2 text-left text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
