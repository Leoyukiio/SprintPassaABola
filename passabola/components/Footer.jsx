"use client";

import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Send, 
  ArrowRight, 
  Heart,
  Instagram,
  Youtube,
  Music,
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    
    // Simulação de envio - você pode integrar com sua API aqui
    setTimeout(() => {
      alert('Obrigado pela sua sugestão! Vamos analisar com carinho.');
      setSuggestion('');
      setIsSubmitting(false);
    }, 1000);
  };

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/passaabola",
      label: "Instagram",
      color: "hover:text-pink-500"
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/@passabola",
      label: "YouTube",
      color: "hover:text-red-500"
    },
    {
      icon: Music,
      href: "https://open.spotify.com/show/18H1ysI9zyDIRahuCnZGQr?si=ae34d53115774b7b",
      label: "Spotify",
      color: "hover:text-green-500"
    }
  ];

  const quickLinks = [
    { href: "/pages/auth/login", label: "Login" },
    { href: "/pages/auth/cadastro", label: "Cadastro" },
    { href: "/pages/inicio", label: "Início" },
    { href: "/pages/campeonato", label: "Campeonatos" }
  ];

  const legalLinks = [
    { 
      href: "/termos/Termos_de_Uso_Passa_a_Bola.pdf", 
      label: "Termos de Uso",
      external: true
    },
    { 
      href: "/termos/Politica_de_Privacidade_Passa_a_Bola.pdf", 
      label: "Política de Privacidade",
      external: true
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo e Redes Sociais */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Passa A Bola
              </span>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Transformando o futebol feminino brasileiro através da tecnologia, 
              comunidade e paixão pelo esporte.
            </p>
            
            {/* Redes Sociais */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-gray-700 hover:scale-110 ${social.color}`}
                    title={social.label}
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Contatos */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              Contatos
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:contato@passaabola.com" 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">E-mail</div>
                    <div className="text-sm">contato@passaabola.com</div>
                  </div>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Telefone</div>
                    <div className="text-sm">(11) 99999-9999</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Navegação
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="font-bold text-lg mb-4 mt-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sugestões */}
          <div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Sua Opinião
            </h3>
            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <div>
                <label htmlFor="suggestion" className="block text-sm font-medium text-gray-400 mb-2">
                  Tem alguma sugestão?
                </label>
                <textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Conte pra gente como podemos melhorar..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !suggestion.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Sugestão
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2024 Passa A Bola. Feito com <Heart className="h-4 w-4 inline text-pink-500" /> para o futebol feminino.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Desenvolvido por</span>
              <span className="text-pink-400 font-semibold">Time Passa A Bola</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
    </footer>
  );
}