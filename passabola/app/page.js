"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Trophy, 
  Users, 
  Star, 
  Shield, 
  ArrowRight,
  Calendar,
  Award,
  Heart,
  Instagram,
  Linkedin,
  Github
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        router.push("/inicio");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Trophy,
      title: "Campeonatos",
      description: "Participe de competições exclusivas para mulheres"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se com jogadoras de todo o Brasil"
    },
    {
      icon: Shield,
      title: "Seu Time",
      description: "Crie ou entre em times da sua região"
    },
    {
      icon: Calendar,
      title: "Organização",
      description: "Tudo organizado em um só lugar"
    }
  ];

  const teamMembers = [
    {
      name: "Leonardo Yukio",
      role: "Desenvolvedor Full-Stack",
      image: "/images/equipe/yukio.JPEG",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Vinicius Gama",
      role: "Desenvolvedor Front-end",
      image: "/images/equipe/vini.jpg",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Victor Pereira",
      role: "Desenvolvedor Back-end",
      image: "/images/equipe/victor.jpg",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Guilherme Reis",
      role: "Edge Computing",
      image: "/images/equipe/gui.jpg",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Paulo Rodrigues",
      role: "Data Scientist",
      image: "/images/equipe/paulo2.webp",
      social: {
        linkedin: "#",
        github: "#"
      }
    }
  ];

  const stats = [
    { number: "1K+", label: "Jogadoras Ativas" },
    { number: "200+", label: "Campeonatos" },
    { number: "50+", label: "Times Cadastrados" },
    { number: "10+", label: "Cidades" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
              Passa A Bola
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-pink-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            A plataforma definitiva para o futebol feminino brasileiro. 
            Conecte-se, compete e cresça junto com a comunidade.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a
                href="/cadastro"
                className="group bg-white text-pink-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-2"
              >
                Começar Agora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/login"
                className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                Fazer Login
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-pink-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Uma plataforma completa desenvolvida especialmente para o futebol feminino
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
                Sobre Nós
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  O <strong className="text-pink-600">Passa A Bola</strong> nasceu da paixão pelo futebol feminino 
                  e da vontade de criar um espaço dedicado exclusivamente para mulheres no esporte.
                </p>
                <p>
                  Nossa missão é fortalecer a comunidade do futebol feminino brasileiro, 
                  proporcionando ferramentas modernas para atletas, times e organizadores.
                </p>
                <p>
                  Acreditamos no poder transformador do esporte e trabalhamos todos os dias 
                  para criar um ambiente inclusivo, seguro e competitivo.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <Award className="h-8 w-8 text-pink-500 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Competições</h3>
                  <p className="text-gray-600 text-sm">Campeonatos organizados e seguros</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <Heart className="h-8 w-8 text-pink-500 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Comunidade</h3>
                  <p className="text-gray-600 text-sm">Conecte-se com outras atletas</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <Users className="h-8 w-8 text-pink-500 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Networking</h3>
                  <p className="text-gray-600 text-sm">Encontre times e parceiras</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <Star className="h-8 w-8 text-pink-500 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Crescimento</h3>
                  <p className="text-gray-600 text-sm">Desenvolva seu potencial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Momentos Incríveis
            </h2>
            <p className="text-gray-600 text-lg">A energia do futebol feminino em ação</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-80">
              <img
                src="/images/landing/game.jpg"
                alt="Partida emocionante"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold">Partidas Competitivas</p>
              </div>
            </div>
            <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-80">
              <img
                src="/images/landing/parti.jpg"
                alt="Time unido"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold">Amizade em Campo</p>
              </div>
            </div>
            <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-80">
              <img
                src="/images/landing/time.jpg"
                alt="Comemoração"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-semibold">Vitórias Conquistadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Nossa Equipe
            </h2>
            <p className="text-gray-600 text-lg">
              Conheça as pessoas por trás da plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="group text-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 p-1 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                    <button className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <Linkedin className="h-4 w-4 text-white" />
                    </button>
                    <button className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <Github className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-pink-600 text-sm font-medium mb-3">{member.role}</p>
                <div className="flex justify-center gap-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="py-20 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronta para fazer parte?
            </h2>
            <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de mulheres que já estão transformando o futebol feminino no Brasil
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/cadastro"
                className="group bg-white text-pink-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-2"
              >
                Criar Minha Conta
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/login"
                className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                Fazer Login
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Passa A Bola</span>
          </div>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Transformando o futebol feminino brasileiro através da tecnologia e comunidade
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Instagram className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Linkedin className="h-5 w-5" />
            </button>
            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Github className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Passa A Bola. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}