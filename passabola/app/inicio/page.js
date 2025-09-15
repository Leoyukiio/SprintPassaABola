"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Send } from "lucide-react";
import NewsCarousel from "../../components/Carrossel";


export default function InicioPage() {
  const [activeTab, setActiveTab] = useState("BRASILEIRO");
  const [currentRound, setCurrentRound] = useState(1);

  const tabs = ["COPA DO MUNDO", "PAULISTÃO", "BRASILEIRO", "LIBERTADORES", "CHAMPIONS", "COPA DO BRASIL"];

  const teams = [
    { position: 1, name: "Corinthians", points: 45, games: 15, wins: 14, draws: 3, losses: 0 },
    { position: 2, name: "Palmeiras", points: 42, games: 15, wins: 13, draws: 3, losses: 0 },
    { position: 3, name: "São Paulo", points: 39, games: 15, wins: 12, draws: 3, losses: 0 },
    { position: 4, name: "Flamengo", points: 36, games: 15, wins: 11, draws: 3, losses: 1 },
    { position: 5, name: "Internacional", points: 33, games: 15, wins: 10, draws: 3, losses: 2 },
    { position: 6, name: "Grêmio", points: 30, games: 15, wins: 9, draws: 3, losses: 3 },
    { position: 7, name: "Santos", points: 27, games: 15, wins: 8, draws: 3, losses: 4 },
    { position: 8, name: "Fluminense", points: 24, games: 15, wins: 7, draws: 3, losses: 5 },
    { position: 9, name: "Atlético-MG", points: 21, games: 15, wins: 6, draws: 3, losses: 6 },
    { position: 10, name: "Botafogo", points: 18, games: 15, wins: 5, draws: 3, losses: 7 },
    { position: 11, name: "Bahia", points: 15, games: 15, wins: 4, draws: 3, losses: 8 },
    { position: 12, name: "Fortaleza", points: 12, games: 15, wins: 3, draws: 3, losses: 9 },
    { position: 13, name: "Ceará", points: 9, games: 15, wins: 2, draws: 3, losses: 10 },
    { position: 14, name: "Sport", points: 6, games: 15, wins: 1, draws: 3, losses: 11 },
    { position: 15, name: "Goiás", points: 3, games: 15, wins: 0, draws: 3, losses: 12 },
    { position: 16, name: "Chapecoense", points: 0, games: 15, wins: 0, draws: 0, losses: 15 }
  ];

  const matches = [
    { home: "Corinthians", away: "Palmeiras", date: "18/05", time: "20:00" },
    { home: "São Paulo", away: "Flamengo", date: "19/05", time: "16:00" },
    { home: "Internacional", away: "Grêmio", date: "19/05", time: "18:30" },
    { home: "Santos", away: "Fluminense", date: "20/05", time: "15:00" },
    { home: "Atlético-MG", away: "Botafogo", date: "20/05", time: "17:00" },
    { home: "Bahia", away: "Fortaleza", date: "21/05", time: "19:00" },
    { home: "Ceará", away: "Sport", date: "21/05", time: "20:30" },
    { home: "Goiás", away: "Chapecoense", date: "22/05", time: "16:30" }
  ];

  const highlights = [
    {
      title: "Corinthians Feminino acerta parcela de premiação da Libertadores 2024 com jogadoras",
      image: "/images/noticias/libertadores.jpg",
      category: "Libertadores"
    },
    {
      title: "Seleção Feminina: Arthur Elias comanda primeiro treino para amistosos contra o Japão",
      image: "/images/noticias/selecao.jpg",
      category: "Seleção"
    },
    {
      title: "Nova competição feminina pode fazer times brasileiros enfrentarem campeão do Champions; entenda",
      image: "/images/noticias/champions.jpg",
      category: "Internacional"
    },
    {
      title: "Time feminino do Palmeiras sofre com lesões na temporada, e técnica diz: 'é um desafio'",
      image: "/images/noticias/palmeiras.jpg",
      category: "Brasileiro"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Carrossel de Notícias */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#8C2E62]">Destaques</h2>
          <NewsCarousel />
        </div>
      </section>
      {/* Seção de Campeonatos */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">CAMPEONATOS</h2>
          
          {/* Tabs de Campeonatos */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-pink-500 text-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Conteúdo dos Campeonatos */}
          <div className="grid  lg:grid-cols-2 gap-8">
            {/* Tabela de Classificação */}
            <div className="bg-white border border-[#8C2E62] rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Clubes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#8C2E62]">
                      <th className="text-left text-gray-800 py-2">Pos</th>
                      <th className="text-left text-gray-800 py-2">Time</th>
                      <th className="text-center text-gray-800 py-2">Pts</th>
                      <th className="text-center text-gray-800 py-2">PJ</th>
                      <th className="text-center text-gray-800 py-2">V</th>
                      <th className="text-center text-gray-800 py-2">E</th>
                      <th className="text-center text-gray-800 py-2">D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.slice(0, 8).map((team) => (
                      <tr key={team.position} className="border-b  hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-800">{team.position}</td>
                        <td className="py-2">
                          <div className="flex items-center text-gray-800 gap-2">
                            <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {team.name.charAt(0)}
                            </div>
                            {team.name}
                          </div>
                        </td>
                        <td className="py-2 text-center text-gray-800 font-medium">{team.points}</td>
                        <td className="py-2 text-center text-gray-800">{team.games}</td>
                        <td className="py-2 text-center text-gray-800">{team.wins}</td>
                        <td className="py-2 text-center text-gray-800">{team.draws}</td>
                        <td className="py-2 text-center text-gray-800">{team.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Jogos da Rodada */}
            <div className="bg-white border border-[#8C2E62] rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Jogos da Rodada</h3>
                <select className="border border-[#8C2E62] rounded text-gray-800 px-3 py-1 text-sm ">
                  <option>Rodada Atual</option>
                  <option>1ª Rodada</option>
                  <option>2ª Rodada</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg text-gray-800 font-medium">1ª Rodada</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100  text-[#8C2E62]  rounded">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 text-[#8C2E62] rounded">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {matches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-[#8C2E62] rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {match.home.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{match.home}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-800">x</div>
                      <div className="text-sm text-gray-800 font-medium">{match.date}</div>
                      <div className="text-xs text-gray-800">{match.time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">{match.away}</span>
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {match.away.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Destaques */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">DESTAQUES</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, index) => (
              <article key={index} className="bg-white border-2 border-pink-200 rounded-lg overflow-hidden hover:border-pink-400 transition">
                <div className="h-48 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-sm font-medium">{highlight.category}</div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {highlight.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
