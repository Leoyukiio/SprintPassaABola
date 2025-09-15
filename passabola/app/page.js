"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push("/inicio"); // página que o usuário verá após o login
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-pink-500 text-white py-20 px-4 w-full text-center">
        <h1 className="text-5xl font-bold mb-4">Bem-vinda ao Passa A Bola</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          A plataforma definitiva para organizar campeonatos, ligas e torneios
          de futebol feminino. Conecte-se com outras atletas e participe de
          competições incríveis!
        </p>
        {!user && (
          <div className="flex justify-center gap-4">
            <a
              href="/cadastro"
              className="bg-white border-2 border-white text-pink-500 px-8 py-3 rounded-lg hover:bg-pink-500 hover:text-white transition font-medium "
            >
              Cadastre-se
            </a>
            <a
              href="/login"
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg hover:bg-white hover:text-pink-500 transition font-medium"
            >
              Fazer Login
            </a>
          </div>
        )}
      </section>

      {/* Sobre Nós */}
      <section className="py-16 px-4 text-center max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-black mb-8">Sobre Nós</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-6">
          O Passa A Bola nasceu para apoiar e promover o futebol feminino no Brasil.
          Nosso objetivo é criar uma comunidade forte, conectando atletas, treinadores
          e torcedores em um ambiente seguro e competitivo.
        </p>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Aqui você encontra campeonatos, ligas e torneios personalizados, além de
          poder montar seu time e acompanhar toda a evolução do esporte feminino.
        </p>
      </section>

      {/* Galeria de Fotos */}
      <section className="py-16 px-4 bg-gray-100">
        <h2 className="text-4xl font-bold text-black text-center mb-8">
          Fotos
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg overflow-hidden shadow-md h-64">
            <img
              src="/images/landing/game.jpg"
              alt="Foto de partida"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white rounded-lg overflow-hidden shadow-md h-64">
            <img
              src="/images/landing/parti.jpg"
              alt="Foto de time"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white rounded-lg overflow-hidden shadow-md h-64">
            <img
              src="/images/landing/time.jpg"
              alt="Foto de torcida"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-16 px-4 text-center max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-black mb-8">Nossa Equipe</h2>
        <div className="grid md:grid-cols-5 gap-8">
          {/* equipe 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/equipe/yukio.JPEG"
              alt="Leonardo Yukio"
              className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
            />
            <h3 className="text-xl text-gray-800 font-semibold mb-2">Leonardo Yukio</h3>
            <p className="text-gray-600">Desenvolvedor <br></br> Full-Stack</p>
          </div>
          {/* equipe 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/equipe/vini.jpg"
              alt="Vinicius Gama"
              className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
            />
            <h3 className="text-xl text-gray-800 font-semibold mb-2">Vinicius Gama</h3>
            <p className="text-gray-600">Desenvolvedor <br></br> Front-end</p>
          </div>
          {/* equipe 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/equipe/victor.jpg"
              alt="Membro da equipe"
              className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
            />
            <h3 className="text-xl text-gray-800 font-semibold mb-2">Victor Pereira</h3>
            <p className="text-gray-600">Desenvolvedor <br></br> Back-end</p>
          </div>
          {/* equipe 4 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/equipe/gui.jpg"
              alt="Membro da equipe"
              className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
            />
            <h3 className="text-xl text-gray-800 font-semibold mb-2">Guilherme Reis</h3>
            <p className="text-gray-600">Edge Computing</p>
          </div>
          {/* equipe 5 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/equipe/paulo.JPEG"
              alt="Membro da equipe"
              className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
            />
            <h3 className="text-xl text-gray-800 font-semibold mb-2">Paulo Rodrigues</h3>
            <p className="text-gray-600">Data Scientist</p>
          </div>
        </div>
      </section>

      {/* Call to Action final */}
      {!user && (
        <section className="py-16 px-4 bg-pink-500 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Pronta para se juntar?</h2>
          <p className="mb-6">
            Crie sua conta e faça parte da maior comunidade de futebol feminino do Brasil!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/cadastro"
              className="bg-white border-2 border-white text-pink-500 px-8 py-3 rounded-lg hover:bg-pink-500 hover:text-white transition font-medium"
            >
              Cadastre-se
            </a>
            <a
              href="/login"
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg hover:bg-white hover:text-pink-500 transition font-medium"
            >
              Fazer Login
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
