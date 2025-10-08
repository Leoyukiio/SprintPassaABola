"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  LogOut, 
  Settings, 
  User, 
  Menu, 
  X,
  Home,
  Trophy,
  Users,
  Shield,
  Calendar,
  Crown
} from "lucide-react";
import { auth, db } from "../app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState("/images/perfil/user.jpg");
  const [profileMenu, setProfileMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Efeito de scroll para navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);

            const nextPhoto = data?.photoBase64;
            setPhotoURL(
              nextPhoto && nextPhoto.length > 0
                ? nextPhoto
                : "/images/perfil/user.jpg"
            );
          } else {
            setUserData(null);
            setPhotoURL("/images/perfil/user.jpg");
          }
        });
      } else {
        setUser(null);
        setUserData(null);
        setPhotoURL("/images/perfil/user.jpg");
        if (typeof unsubscribeDoc === "function") {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
      }
    });

    return () => {
      if (typeof unsubscribeDoc === "function") {
        unsubscribeDoc();
      }
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setProfileMenu(false);
    setIsOpen(false);
  };

  // 🔹 Links do menu com ícones e regras de acesso
  const menuLinks = [
    { 
      href: "/pages/inicio", 
      label: "Início", 
      icon: Home,
      show: true,
      color: "text-blue-600"
    },
    { 
      href: "/pages/campeonato", 
      label: "Campeonatos", 
      icon: Trophy,
      show: true,
      color: "text-yellow-600"
    },
    { 
      href: "/pages/times", 
      label: "Times", 
      icon: Users,
      show: true,
      color: "text-green-600"
    },
    {
      href: "/pages/meutime",
      label: "Meu Time",
      icon: Shield,
      show: userData?.tipoUsuario === "time" || userData?.tipoUsuario === "jogadora",
      color: "text-purple-600"
    },
    {
      href: "/pages/meuscampeonato",
      label: "Meus Campeonatos",
      icon: Crown,
      show: userData?.tipoUsuario === "organizador",
      color: "text-orange-600"
    },
  ];

  // 🔹 Links do perfil
  const profileLinks = [
    {
      href: "/pages/configuracoes",
      label: "Configurações",
      icon: Settings,
    },
  ];

  const getTipoUsuarioLabel = (tipo) => {
    switch (tipo) {
      case "jogadora": return "Jogadora";
      case "organizador": return "Organizador";
      case "time": return "Time";
      default: return "Usuário";
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-gradient-to-r from-pink-500 to-purple-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Lado Esquerdo - Menu Hambúrguer e Logo */}
            <div className="flex items-center gap-4">
              {/* Menu Hambúrguer */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  scrolled 
                    ? 'text-gray-700 hover:bg-gray-100' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link href="/pages/inicio" className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <img
                      src="/images/logo/passabola.png"
                      alt="Logo Passa A Bola"
                      className="h-8 w-8 object-cover rounded-lg"
                    />
                  </div>
                </div>
                <div className={`hidden sm:block transition-all duration-300 ${
                  scrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  <div className="font-bold text-lg leading-tight">Passa A Bola</div>
                  <div className="text-xs opacity-80">Futebol Feminino</div>
                </div>
              </Link>
            </div>

            {/* Lado Direito - Perfil ou Login */}
            <div className="flex items-center gap-4">
              {!user ? (
                <div className="flex gap-3">
                  <Link
                    href="/pages/auth/login"
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      scrolled
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-white text-pink-600 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/pages/auth/cadastro"
                    className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      scrolled
                        ? 'border-2 border-pink-500 text-pink-600 hover:bg-pink-50'
                        : 'border-2 border-white text-white hover:bg-white/20'
                    }`}
                  >
                    Cadastrar
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenu(!profileMenu)}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${
                      scrolled 
                        ? 'hover:bg-gray-100' 
                        : 'hover:bg-white/20'
                    }`}
                  >
                    <div className="text-right hidden sm:block">
                      <div className={`font-semibold text-sm ${
                        scrolled ? 'text-gray-900' : 'text-white'
                      }`}>
                        {userData?.nomeCompleto || user.displayName || 'Usuário'}
                      </div>
                      <div className={`text-xs ${
                        scrolled ? 'text-gray-600' : 'text-pink-100'
                      }`}>
                        {userData?.tipoUsuario ? getTipoUsuarioLabel(userData.tipoUsuario) : 'Bem-vinda!'}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={photoURL}
                        alt="Perfil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/perfil/user.jpg";
                        }}
                      />
                    </div>
                  </button>

                  {/* Menu do Perfil */}
                  {profileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      {/* Header do Perfil */}
                      <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-white">
                            <img
                              src={photoURL}
                              alt="Perfil"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate">
                              {userData?.nomeCompleto || user.displayName || 'Usuário'}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {userData?.email || user.email}
                            </div>
                            <div className="text-xs text-pink-600 font-medium capitalize">
                              {userData?.tipoUsuario ? getTipoUsuarioLabel(userData.tipoUsuario) : 'Usuário'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Links do Perfil */}
                      <div className="p-2">
                        {profileLinks.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={index}
                              href={item.href}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setProfileMenu(false)}
                            >
                              <Icon className="h-5 w-5 text-gray-500" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          );
                        })}
                        
                        {/* Botão Sair */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 mt-2"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Sair</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer Lateral - SEM OVERLAY */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-full z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white h-full shadow-2xl flex flex-col border-r border-gray-200">
          {/* Header do Drawer */}
          <div className="p-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
                  <img
                    src={photoURL}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {userData?.nomeCompleto || user.displayName || 'Usuário'}
                  </div>
                  <div className="text-sm text-pink-100 truncate opacity-90">
                    {userData?.tipoUsuario ? getTipoUsuarioLabel(userData.tipoUsuario) : 'Bem-vinda!'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Links de Navegação */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuLinks
                .filter((item) => item.show)
                .map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center justify-between p-4 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 group-hover:scale-110 transition-transform duration-200 ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  );
                })}
            </div>

            {/* Footer do Drawer */}
            {!user && (
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Junte-se a nós!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Crie sua conta e comece sua jornada no futebol feminino
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/cadastro"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-2 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Cadastrar
                  </Link>
                  <Link
                    href="/auth/login"
                    className="flex-1 border-2 border-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Entrar
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}