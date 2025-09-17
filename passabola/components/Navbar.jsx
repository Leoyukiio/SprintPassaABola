"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, LogOut, Settings } from "lucide-react";
import { auth, db } from "../app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState("/images/perfil/user.jpg");
  const [profileMenu, setProfileMenu] = useState(false);
  const [userData, setUserData] = useState(null);

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
  };

  // 🔹 Links do menu com regras de acesso
  const menuLinks = [
    { href: "/inicio", label: "Início", show: true },
    { href: "/campeonato", label: "Campeonatos", show: true },
    { href: "/times", label: "Times", show: true },
    {
      href: "/meutime",
      label: "Meu Time",
      show:
        userData?.tipoUsuario === "time" || userData?.tipoUsuario === "jogadora",
    },
    {
      href: "/criarcampeonato",
      label: "Meus Campeonatos",
      show: userData?.tipoUsuario === "organizador",
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#F250A9] text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 relative">
        {/* Menu hambúrguer */}
        <button
          className="flex flex-col space-y-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="w-7 h-0.5 bg-black"></span>
          <span className="w-7 h-0.5 bg-black"></span>
          <span className="w-7 h-0.5 bg-black"></span>
        </button>

        {/* Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo/passabola.png"
              alt="Logo Passa A Bola"
              className="h-10 w-10 text-center rounded-full object-cover"
            />
          </Link>
        </div>

        {/* Perfil ou login */}
        {!user ? (
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="bg-[#F250A9] text-black px-4 py-2 rounded-lg hover:bg-[#8C2E62] transition border border-black"
            >
              Login
            </Link>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setProfileMenu(!profileMenu)}
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-white"
            >
              <img
                src={photoURL}
                alt="Perfil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/perfil/user.jpg";
                }}
              />
            </button>

            {profileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-purple-800 rounded-lg shadow-lg overflow-hidden">
                <Link
                  href="/configuracoes"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  onClick={() => setProfileMenu(false)}
                >
                  <Settings size={16} /> Configurações
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed top-16 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={`fixed top-16 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white shadow-xl rounded-r-lg p-4 h-fit mt-4 ml-2">
          <h2 className="text-sm text-gray-600 mb-4">MENU</h2>
          <div className="flex flex-col space-y-3">
            {menuLinks
              .filter((item) => item.show)
              .map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex justify-between items-center text-lg font-medium text-purple-800 hover:text-purple-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
