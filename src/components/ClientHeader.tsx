import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';

const ClientHeader: React.FC = () => {
  const { logout, profile, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/shop" className="text-2xl font-bold text-blue-600">
              E-Shop
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/shop"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/shop')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Produtos
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/shop/cart"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/shop/cart')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            <Link
              to="/shop/profile"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/shop/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{profile?.full_name}</p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;