import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket, User, LogIn } from "lucide-react";

const validPaths = ["/", "/tickets"];

export const Navbar = ({ pathname }: { pathname: string }) => {
  console.log({pathname});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isValidPath = validPaths.includes(pathname);
  const [token, setToken] = useState<{ name: string } | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  useEffect(() => {
    const storedToken = sessionStorage.getItem("access_token");
    const participant = JSON.parse(localStorage.getItem("participant") || "{}");
    setUser({ name: participant?.fullName?.split(" ")[0] || "" });
    if (storedToken) {
      setToken(JSON.parse(storedToken));
    }
  }, []);
  const toggleMenu: any = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  if (!isValidPath) {
    return null;
  }
  return (
    <div className="container mx-100 px-4">
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
            href="/#historia"
            className="text-gray-700 hover:text-heart-500 font-medium"
          >
            Historia
          </a>
          <a
            href="/#rifa"
            className="text-gray-700 hover:text-heart-500 font-medium"
          >
            La Rifa
          </a>
          <a
            href="/#faq"
            className="text-gray-700 hover:text-heart-500 font-medium"
          >
            FAQ
          </a>
          {pathname !== "/tickets" && (
            <a href="/tickets">
              <Button className="btn-primary animate-pulse-gentle">
                <Ticket size={18} className="mr-1" />
                Boletos
              </Button>
            </a>
          )}
          {token ? (
            <div className="flex items-center space-x-4">
              <a href="/dashboard">
                <Button
                  variant="outline"
                  className="border-heart-500 text-heart-500 hover:bg-heart-500 hover:text-white text-black"
                >
                  <User size={18} />
                  {user?.name}
                </Button>
              </a>
            </div>
          ) : (
            <a href="/auth/login">
              <Button
                variant="outline"
                className="border-heart-500 text-heart-500 hover:bg-heart-50"
              >
                <LogIn size={18} className="mr-1" />
                Iniciar sesión
              </Button>
            </a>
          )}
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
            {pathname !== "/tickets" && (
              <a href="/tickets">
                <Button
                  className="btn-primary animate-pulse-gentle w-full"
                  onClick={toggleMenu}
                >
                  <Ticket size={18} className="mr-1" />
                 Comprar Boleto
                </Button>
              </a>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};
