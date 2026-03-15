import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Sprout,
  ShoppingCart,
  Package,
  User,
  Store,
} from 'lucide-react';

const farmerLinks = [
  { path: '/farmer/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/farmer/crops', label: 'Crops', icon: Sprout },
  { path: '/farmer/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/farmer/profile', label: 'Profile', icon: User },
];

const retailerLinks = [
  { path: '/retailer/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/retailer/marketplace', label: 'Shop', icon: Store },
  { path: '/retailer/orders', label: 'Orders', icon: Package },
  { path: '/retailer/cart', label: 'Cart', icon: ShoppingCart },
];

const MobileNav = ({ userType }) => {
  const location = useLocation();
  const links = userType === 'farmer' ? farmerLinks : retailerLinks;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex items-center justify-around py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-leaf-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'text-leaf-500' : ''}`} />
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-leaf-500 rounded-full"
                  />
                )}
              </div>
              <span className="text-xs font-medium">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
