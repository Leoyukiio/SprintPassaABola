"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Shield,
  Users,
  Trophy,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const router = useRouter();

  // Validação de senha
  const validarSenha = (senha) => {
    const requisitos = {
      minLength: senha.length >= 6,
      hasNumber: /\d/.test(senha),
      hasLetter: /[a-zA-Z]/.test(senha),
    };
    return requisitos;
  };

  const requisitosSenha = validarSenha(senha);

  // Cadastro com email/senha
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!aceitouTermos) {
      setError("Você precisa aceitar os termos e condições para se cadastrar.");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!requisitosSenha.minLength) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      router.push("/pages/inicio");
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está em uso. Tente fazer login.");
      } else if (err.code === 'auth/invalid-email') {
        setError("E-mail inválido. Verifique o formato.");
      } else if (err.code === 'auth/weak-password') {
        setError("Senha muito fraca. Use uma senha mais forte.");
      } else {
        setError("Erro ao cadastrar. Tente novamente.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cadastro/Login com Google
  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/pages/inicio");
    } catch (err) {
      setError("Erro ao cadastrar com Google.");
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const beneficios = [
    {
      icon: Users,
      title: "Encontre Times",
      description: "Conecte-se com times da sua região"
    },
    {
      icon: Trophy,
      title: "Participe de Campeonatos",
      description: "Competições exclusivas para mulheres"
    },
    {
      icon: Star,
      title: "Mostre seu Talento",
      description: "Crie seu perfil e seja vista"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Coluna Esquerda - Benefícios */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                Junte-se à Comunidade
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                Faça parte da maior plataforma de futebol feminino do Brasil
              </p>
            </div>

            <div className="space-y-6 max-w-md mx-auto lg:mx-0">
              {beneficios.map((beneficio, index) => {
                const Icon = beneficio.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl backdrop-blur-sm border border-white/20">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 mb-1">{beneficio.title}</h3>
                      <p className="text-sm text-gray-600">{beneficio.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estatísticas */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-pink-600">1K+</div>
                <div className="text-xs text-gray-600">Jogadoras</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-purple-600">200+</div>
                <div className="text-xs text-gray-600">Campeonatos</div>
              </div>
              <div className="text-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-xs text-gray-600">Times</div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Formulário */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
              <p className="text-pink-100 text-sm">
                Comece sua jornada no futebol feminino
              </p>
            </div>

            {/* Conteúdo do Formulário */}
            <div className="p-8">
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

                  {/* Indicadores de Força da Senha */}
                  {senha && (
                    <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-700 mb-2">Sua senha precisa de:</div>
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-xs ${requisitosSenha.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                          <CheckCircle className="h-3 w-3" />
                          Pelo menos 6 caracteres
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${requisitosSenha.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                          <CheckCircle className="h-3 w-3" />
                          Pelo menos 1 número
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${requisitosSenha.hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                          <CheckCircle className="h-3 w-3" />
                          Pelo menos 1 letra
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo Confirmar Senha */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Shield className="h-4 w-4 inline mr-2" />
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox Termos */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termos"
                    checked={aceitouTermos}
                    onChange={(e) => setAceitouTermos(e.target.checked)}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 mt-1 flex-shrink-0"
                  />
                  <label htmlFor="termos" className="text-sm text-gray-600">
                    Concordo com os{" "}
                    <a href="/termos/Termos_de_Uso_Passa_a_Bola.pdf" className="text-pink-600 hover:text-pink-700 font-medium underline">
                      Termos de Serviço
                    </a>{" "}
                    e{" "}
                    <a href="/termos/Politica_de_Privacidade_Passa_a_Bola.pdf" className="text-pink-600 hover:text-pink-700 font-medium underline">
                      Política de Privacidade
                    </a>
                  </label>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Botão de Cadastro */}
                <button
                  type="submit"
                  disabled={loading || !aceitouTermos}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Criar Minha Conta
                      <ArrowRight className="h-4 w-4" />
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
                onClick={handleGoogleSignup}
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
                  {googleLoading ? "Cadastrando..." : "Cadastrar com Google"}
                </span>
              </button>

              {/* Link para Login */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Já tem uma conta?{" "}
                  <a 
                    href="/auth/login" 
                    className="text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200 hover:underline"
                  >
                    Fazer login
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}