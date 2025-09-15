"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Cadastro com email/senha
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      router.push("/inicio");
    } catch (err) {
      setError("Erro ao cadastrar. Verifique os dados.");
      console.error(err);
    }
  };

  // Cadastro/Login com Google
  const handleGoogleSignup = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/inicio");
    } catch (err) {
      setError("Erro ao cadastrar com Google.");
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-100 flex items-center justify-center"
      style={{ paddingTop: "64px", paddingBottom: "20px" }}
    >
      <div className="w-full max-w-sm border border-[#8C2E62] bg-white p-8 rounded-2xl shadow-lg max-h-full overflow-y-auto">
        <h1 className="text-2xl font-bold text-black text-center mb-6">
          Criar Conta
        </h1>

        {/* Cadastro com email e senha */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-black font-medium mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#8C2E62] text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F250A9]"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border border-[#8C2E62] text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F250A9]"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#F250A9] text-white py-2 rounded-lg hover:bg-[#8C2E62] transition"
          >
            Cadastrar
          </button>
        </form>

        {/* Separador */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Botão Google */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          <span className="text-gray-700">Cadastrar com Google</span>
        </button>

        <p className="text-sm text-center text-black mt-4">
          Já tem conta?{" "}
          <a href="/login" className="text-[#F250A9] hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
