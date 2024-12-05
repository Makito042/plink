import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const categories = [
    { name: 'Medications', path: '/category/medications' },
    { name: 'Supplements', path: '/category/supplements' },
    { name: 'Personal Care', path: '/category/personal-care' },
    { name: 'Medical Devices', path: '/category/medical-devices' },
    { name: 'First Aid', path: '/category/first-aid' },
    { name: 'Hygiene', path: '/category/hygiene' },
    { name: 'Baby Care', path: '/category/baby-care' },
    { name: 'Other', path: '/category/other' }
  ];

  return (
    <footer className="bg-[#004d00] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">PharmaLink</h3>
            <p className="text-sm">Your trusted online pharmacy for quality healthcare products.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-[#66cc66]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#66cc66]">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-[#66cc66]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#66cc66]">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}><Link to={category.path} className="hover:text-[#66cc66]">{category.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:text-[#66cc66]"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="hover:text-[#66cc66]"><Twitter className="w-6 h-6" /></a>
              <a href="#" className="hover:text-[#66cc66]"><Instagram className="w-6 h-6" /></a>
            </div>
            <p className="text-sm">Email: contact@pharmalink.com</p>
            <p className="text-sm">Phone: +234 123 456 7890</p>
          </div>
        </div>

        <div className="border-t border-[#66cc66] mt-8 pt-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} PharmaLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}