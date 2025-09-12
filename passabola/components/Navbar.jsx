"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; // biblioteca de ícones (instalar: npm i lucide-react)

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-purple-800 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Botão Hamburguer - lado esquerdo */}
        <button
          className="flex flex-col space-y-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="w-7 h-0.5 bg-white"></span>
          <span className="w-7 h-0.5 bg-white"></span>
          <span className="w-7 h-0.5 bg-white"></span>
        </button>

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Passa A Bola
        </Link>

        {/* Botões Login/Cadastro */}
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="bg-white text-purple-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Login
          </Link>
          <Link
            href="/cadastro"
            className="bg-yellow-400 text-purple-800 px-4 py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Cadastro
          </Link>
        </div>
      </div>

      {/* Overlay abaixo da navbar */}
      {isOpen && (
        <div
          className="fixed top-16 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar com card branco */}
      <div
        className={`fixed top-16 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white shadow-xl rounded-r-lg p-4 h-fit mt-4 ml-2">
          <h2 className="text-sm text-gray-600 mb-4">MENU</h2>
          <div className="flex flex-col space-y-3">
            {[
              { href: "/", label: "Início" },
              { href: "/campeonatos", label: "Campeonatos" },
              { href: "/ligas", label: "Ligas" },
              { href: "/times", label: "Times" },
              { href: "/meuperfil", label: "Meu Perfil" },
              { href: "/meutime", label: "Meu Time" },
              { href: "/criarliga", label: "Criar Liga" },
            ].map((item, i) => (
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
