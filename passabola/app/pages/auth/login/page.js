"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Shield,
  Users,
  Trophy,
  Star
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Login com email e senha
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/pages/inicio");
    } catch (err) {
      setError("Erro ao fazer login. Verifique seu email e senha.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/pages/inicio");
    } catch (err) {
      setError("Erro ao fazer login com Google.");
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header com Gradiente */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vinda de volta!</h1>
            <p className="text-pink-100 text-sm">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Conteúdo do Formulário */}
          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-pink-50 rounded-xl">
                <Users className="h-5 w-5 text-pink-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-pink-700">1K+</div>
                <div className="text-xs text-pink-600">Jogadoras</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <Trophy className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-purple-700">200+</div>
                <div className="text-xs text-purple-600">Campeonatos</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Star className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-blue-700">50+</div>
                <div className="text-xs text-blue-600">Times</div>
              </div>
            </div>

            {/* Formulário de Login */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="seu@email.com"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Entrar na Conta
                  </>
                )}
              </button>
            </form>

            {/* Separador */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-sm text-gray-500 font-medium">ou</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botão Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                    className="w-5 h-5 transition-transform group-hover:scale-110"
                  />
                </>
              )}
              <span className="text-gray-700 font-medium">
                {googleLoading ? "Conectando..." : "Continuar com Google"}
              </span>
            </button>

            {/* Link para Cadastro */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Não tem uma conta?{" "}
                <a 
                  href="/auth/cadastro" 
                  className="text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  Cadastre-se agora
                </a>
              </p>
            </div>

            {/* Recursos Adicionais */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              {/* <a 
                href="/esqueci-senha" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Esqueci a senha
              </a> */}
              <a 
                href="/sobre" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Sobre a plataforma
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Ao fazer login, você concorda com nossos{" "}
            <a href="/termos/Termos_de_Uso_Passa_a_Bola.pdf" className="text-gray-600 hover:text-gray-800 underline">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="/termos/Politica_de_Privacidade_Passa_a_Bola.pdf" className="text-gray-600 hover:text-gray-800 underline">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}