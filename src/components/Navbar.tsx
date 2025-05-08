import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket } from "lucide-react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu: any = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <span className="text-heart-600 font-montserrat font-bold text-xl">
              💖 Rifa por Negrita
            </span>
          </a>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#historia"
            className="text-gray-700 hover:text-heart-500 font-medium"
          >
            Historia
          </a>
          <a
            href="#rifa"
            className="text-gray-700 hover:text-heart-500 font-medium"
          >
            La Rifa
          </a>
          <a
            href="#faq"
            className="text-gray-700 hover:text-heart-500 font-medium"
          >
            FAQ
          </a>
          <a
            href="/Tickets"
            className="text-gray-700 hover:text-heart-500 font-medium flex items-center"
          >
            <Ticket size={18} className="mr-1" />
            Boletos
          </a>
          <a href="/Tickets">
            <Button className="btn-primary">Comprar Boleto</Button>
          </a>
        </nav>

        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-heart-500"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 border-t">
          <nav className="flex flex-col space-y-4">
            <a
              href="#historia"
              className="text-gray-700 hover:text-heart-500 font-medium py-2"
              onClick={toggleMenu}
            >
              Historia
            </a>
            <a
              href="#rifa"
              className="text-gray-700 hover:text-heart-500 font-medium py-2"
              onClick={toggleMenu}
            >
              La Rifa
            </a>
            <a
              href="#faq"
              className="text-gray-700 hover:text-heart-500 font-medium py-2"
              onClick={toggleMenu}
            >
              FAQ
            </a>
            <Button className="btn-primary w-full" onClick={toggleMenu}>
              Comprar Boleto
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};
