import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Sprout,
  ShoppingCart,
  Package,
  User,
  Store,
  Search,
  LogOut
} from 'lucide-react';

const farmerLinks = [
  { path: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farmer/crops', label: 'My Crops', icon: Sprout },
  { path: '/farmer/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/farmer/profile', label: 'Profile', icon: User },
];

const retailerLinks = [
  { path: '/retailer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/retailer/marketplace', label: 'Marketplace', icon: Store },
  { path: '/retailer/orders', label: 'My Orders', icon: Package },
  { path: '/retailer/cart', label: 'Cart', icon: ShoppingCart },
];

const Sidebar = ({ userType }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  const links = userType === 'farmer' ? farmerLinks : retailerLinks;

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-50">
      {/* Logo & Role Badge */}
      <div className="p-6 border-b border-gray-100">
        <NavLink to={`/${userType}/dashboard`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-leaf-500 rounded-xl flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Farmsetu</h1>
            <p className="text-xs text-gray-500">Connecting Farms to Markets</p>
          </div>
        </NavLink>
        
        {/* Role Indicator Badge */}
        <div className={`mt-4 px-3 py-2 rounded-lg text-center ${userType === 'farmer' ? 'bg-leaf-100' : 'bg-primary-100'}`}>
          <div className="flex items-center justify-center gap-2">
            {userType === 'farmer' ? (
              <Sprout className="w-4 h-4 text-leaf-600" />
            ) : (
              <ShoppingCart className="w-4 h-4 text-primary-600" />
            )}
            <span className={`text-xs font-bold uppercase tracking-wide ${userType === 'farmer' ? 'text-leaf-700' : 'text-primary-700'}`}>
              {userType === 'farmer' ? "Farmer's Site" : "Retailer's Site"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-leaf-50 text-leaf-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-leaf-500' : ''}`} />
              <span>{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-8 bg-leaf-500 rounded-r-full"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div className="w-10 h-10 bg-leaf-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-leaf-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
