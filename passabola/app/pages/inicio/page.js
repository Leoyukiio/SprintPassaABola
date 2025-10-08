"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trophy, Calendar, Star, Users, Target } from "lucide-react";
import NewsCarousel from "../../../components/Carrossel";
import { FootballApiService } from "../../lib/football-api";

export default function InicioPage() {
  const [activeTab, setActiveTab] = useState("BRASILEIRO");
  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiSource, setApiSource] = useState("");

  // Mapeamento CORRETO dos campeonatos femininos
  const championships = {
    "BRASILEIRO": { 
      type: "brazilian", 
      id: 10, 
      name: "Brasileiro Feminino A1",
      api: "futebol",
      color: "from-green-500 to-emerald-600"
    },
    "COPA DO BRASIL": { 
      type: "brazilian", 
      id: 11, 
      name: "Copa do Brasil Feminina",
      api: "futebol",
      color: "from-blue-500 to-cyan-600"
    },
    "PAULISTÃO": { 
      type: "brazilian", 
      id: 12, 
      name: "Paulistão Feminino",
      api: "futebol",
      color: "from-red-500 to-pink-600"
    },
    "LIBERTADORES": { 
      type: "international", 
      id: 1073, 
      name: "Libertadores Feminina",
      api: "football",
      color: "from-yellow-500 to-orange-600"
    },
    "CHAMPIONS": { 
      type: "international", 
      id: 1074, 
      name: "Champions Feminina",
      api: "football",
      color: "from-purple-500 to-indigo-600"
    },
    "COPA DO MUNDO": { 
      type: "international", 
      id: 1101, 
      name: "Copa do Mundo Feminina",
      api: "football",
      color: "from-gray-500 to-blue-600"
    }
  };

  const tabs = ["COPA DO MUNDO", "PAULISTÃO", "BRASILEIRO", "LIBERTADORES", "CHAMPIONS", "COPA DO BRASIL"];

  useEffect(() => {
    fetchWomenData();
  }, [activeTab]);

  const fetchWomenData = async () => {
    try {
      setLoading(true);
      setError(null);
      setStandings([]);
      setFixtures([]);
      
      const championship = championships[activeTab];
      
      if (!championship) {
        throw new Error(`Campeonato ${activeTab} não encontrado`);
      }

      console.log(`🏆 Buscando: ${championship.name} (ID: ${championship.id})`);

      let standingsData = [];
      let fixturesData = [];

      // ESCOLHER API CORRETA
      if (championship.api === "futebol") {
        setApiSource("API-Futebol.com.br");
        
        // Buscar da API brasileira
        const [standingsResult, fixturesResult] = await Promise.all([
          fetchWithTimeout(`https://api.api-futebol.com.br/v1/campeonatos/${championship.id}/tabela`, {
            headers: {
              'Authorization': `Bearer test_b9ac9fd142018989701d6f00426e27`,
              'Content-Type': 'application/json'
            }
          }),
          fetchWithTimeout(`https://api.api-futebol.com.br/v1/campeonatos/${championship.id}/partidas`, {
            headers: {
              'Authorization': `Bearer test_b9ac9fd142018989701d6f00426e27`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        standingsData = standingsResult || [];
        fixturesData = fixturesResult || [];

      } else {
        setApiSource("API-Football.com");
        
        // Buscar da API internacional
        const params = new URLSearchParams({
          league: championship.id,
          season: 2024
        });

        const [standingsResult, fixturesResult] = await Promise.all([
          fetchWithTimeout(`https://v3.football.api-sports.io/standings?${params}`, {
            headers: {
              'x-apisports-key': 'bd4c7bac40a7d470b2d5d4453d2a72ae',
              'Content-Type': 'application/json'
            }
          }),
          fetchWithTimeout(`https://v3.football.api-sports.io/fixtures?league=${championship.id}&season=2024&next=10`, {
            headers: {
              'x-apisports-key': 'bd4c7bac40a7d470b2d5d4453d2a72ae',
              'Content-Type': 'application/json'
            }
          })
        ]);

        standingsData = standingsResult?.response || [];
        fixturesData = fixturesResult?.response || [];
      }

      console.log('📊 Dados recebidos:', { standingsData, fixturesData });

      // PROCESSAR CLASSIFICAÇÃO
      if (championship.api === "futebol") {
        // Formato API-Futebol.com.br
        if (Array.isArray(standingsData)) {
          const processedStandings = standingsData.slice(0, 8).map((team, index) => ({
            rank: team.posicao || index + 1,
            team: {
              name: team.time?.nome_popular || team.nome_popular || `Time ${index + 1}`
            },
            points: team.pontos || 0,
            all: {
              played: team.jogos || 0,
              win: team.vitorias || 0,
              draw: team.empates || 0,
              lose: team.derrotas || 0
            }
          }));
          setStandings(processedStandings);
        }
      } else {
        // Formato API-Football
        if (standingsData.length > 0) {
          const leagueStandings = standingsData[0]?.league?.standings?.[0] || [];
          setStandings(leagueStandings.slice(0, 8));
        }
      }

      // PROCESSAR JOGOS
      if (championship.api === "futebol") {
        // Formato API-Futebol.com.br
        if (Array.isArray(fixturesData)) {
          const processedFixtures = fixturesData.slice(0, 8).map(match => ({
            fixture: {
              date: match.data_realizacao || new Date().toISOString()
            },
            teams: {
              home: { name: match.time_mandante?.nome_popular || "Time Mandante" },
              away: { name: match.time_visitante?.nome_popular || "Time Visitante" }
            }
          }));
          setFixtures(processedFixtures);
        }
      } else {
        // Formato API-Football
        setFixtures(fixturesData.slice(0, 8));
      }

    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err.message);
      setApiSource("Erro na API");
      
      // Usar dados de exemplo em caso de erro
      setStandings(getExampleStandings());
      setFixtures(getExampleFixtures());
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para fetch com timeout
  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // Dados de exemplo para fallback
  const getExampleStandings = () => [
    {
      rank: 1,
      team: { name: "Corinthians" },
      points: 45,
      all: { played: 15, win: 14, draw: 3, lose: 0 }
    },
    {
      rank: 2,
      team: { name: "Palmeiras" },
      points: 42,
      all: { played: 15, win: 13, draw: 3, lose: 0 }
    },
    {
      rank: 3,
      team: { name: "São Paulo" },
      points: 39,
      all: { played: 15, win: 12, draw: 3, lose: 0 }
    },
    {
      rank: 4,
      team: { name: "Flamengo" },
      points: 36,
      all: { played: 15, win: 11, draw: 3, lose: 1 }
    },
    {
      rank: 5,
      team: { name: "Internacional" },
      points: 33,
      all: { played: 15, win: 10, draw: 3, lose: 2 }
    },
    {
      rank: 6,
      team: { name: "Grêmio" },
      points: 30,
      all: { played: 15, win: 9, draw: 3, lose: 3 }
    },
    {
      rank: 7,
      team: { name: "Santos" },
      points: 27,
      all: { played: 15, win: 8, draw: 3, lose: 4 }
    },
    {
      rank: 8,
      team: { name: "Fluminense" },
      points: 24,
      all: { played: 15, win: 7, draw: 3, lose: 5 }
    }
  ];

  const getExampleFixtures = () => [
    { 
      fixture: { date: "2024-05-18T20:00:00+00:00" },
      teams: { home: { name: "Corinthians" }, away: { name: "Palmeiras" } }
    },
    { 
      fixture: { date: "2024-05-19T16:00:00+00:00" },
      teams: { home: { name: "São Paulo" }, away: { name: "Flamengo" } }
    },
    { 
      fixture: { date: "2024-05-19T18:30:00+00:00" },
      teams: { home: { name: "Internacional" }, away: { name: "Grêmio" } }
    },
    { 
      fixture: { date: "2024-05-20T15:00:00+00:00" },
      teams: { home: { name: "Santos" }, away: { name: "Fluminense" } }
    }
  ];

  // Funções de formatação
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Horário inválido";
    }
  };

  const getTeamInitial = (teamName) => {
    return teamName ? teamName.charAt(0).toUpperCase() : "?";
  };

  const highlights = [
    {
      title: "Corinthians Feminino acerta parcela de premiação da Libertadores 2024 com jogadoras",
      category: "Libertadores",
      image: "⚽",
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "Seleção Feminina: Arthur Elias comanda primeiro treino para amistosos contra o Japão",
      category: "Seleção",
      image: "🇧🇷",
      color: "from-green-400 to-blue-500"
    },
    {
      title: "Nova competição feminina pode fazer times brasileiros enfrentarem campeão do Champions; entenda",
      category: "Internacional",
      image: "🌎",
      color: "from-purple-400 to-pink-500"
    },
    {
      title: "Time feminino do Palmeiras sofre com lesões na temporada, e técnica diz: 'é um desafio'",
      category: "Brasileiro",
      image: "🏥",
      color: "from-red-400 to-pink-500"
    }
  ];

  const stats = [
    { icon: Users, value: "2.5M+", label: "Torcedoras" },
    { icon: Trophy, value: "150+", label: "Títulos" },
    { icon: Target, value: "89%", label: "Crescimento" },
    { icon: Star, value: "4.8", label: "Avaliação" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header Hero */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            FUTEBOL FEMININO
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Acompanhe tudo sobre as principais competições e atletas do futebol feminino brasileiro e mundial
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-pink-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carrossel de Notícias */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Destaques do Futebol Feminino
            </h2>
            <p className="text-gray-600 text-lg">As principais notícias e novidades do universo feminino</p>
          </div>
          <NewsCarousel />
        </div>
      </section>

      {/* Seção de Campeonatos Femininos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-pink-500" />
              <h2 className="text-4xl font-bold text-gray-800">CAMPEONATOS FEMININOS</h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Acompanhe a classificação e os próximos jogos dos principais torneios
            </p>
          </div>
          
          {/* Tabs de Campeonatos */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tabs.map((tab) => {
              const championship = championships[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab
                      ? `bg-gradient-to-r ${championship.color} text-white shadow-lg`
                      : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
              <span className="ml-4 text-gray-600 text-lg">Carregando dados do campeonato...</span>
            </div>
          )}

          {/* Conteúdo dos Campeonatos */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Tabela de Classificação */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-pink-500" />
                  <h3 className="text-xl font-bold text-gray-800">Classificação</h3>
                </div>
                <span className="text-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium">
                  {standings.length} times
                </span>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="text-left text-gray-700 py-4 px-4 font-semibold">Pos</th>
                      <th className="text-left text-gray-700 py-4 px-4 font-semibold">Time</th>
                      <th className="text-center text-gray-700 py-4 px-4 font-semibold">Pts</th>
                      <th className="text-center text-gray-700 py-4 px-4 font-semibold">PJ</th>
                      <th className="text-center text-gray-700 py-4 px-4 font-semibold">V</th>
                      <th className="text-center text-gray-700 py-4 px-4 font-semibold">E</th>
                      <th className="text-center text-gray-700 py-4 px-4 font-semibold">D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.length > 0 ? (
                      standings.map((team, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                          <td className="py-4 px-4 font-medium">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              team.rank <= 4 ? 'bg-green-100 text-green-800 border border-green-200' : 
                              team.rank <= 6 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                              team.rank >= 13 ? 'bg-red-100 text-red-800 border border-red-200' : 
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {team.rank}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                {getTeamInitial(team.team.name)}
                              </div>
                              <span className="font-semibold text-gray-800">{team.team.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-800 font-bold text-base">{team.points}</td>
                          <td className="py-4 px-4 text-center text-gray-700">{team.all.played}</td>
                          <td className="py-4 px-4 text-center text-green-600 font-semibold">{team.all.win}</td>
                          <td className="py-4 px-4 text-center text-yellow-600 font-semibold">{team.all.draw}</td>
                          <td className="py-4 px-4 text-center text-red-600 font-semibold">{team.all.lose}</td>
                        </tr>
                      ))
                    ) : (
                      !loading && (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                                <span className="text-3xl">⚽</span>
                              </div>
                              <p className="text-lg font-medium">Nenhum dado de classificação disponível</p>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Próximos Jogos */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-800">Próximos Jogos</h3>
                </div>
                <span className="text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full font-medium">
                  {fixtures.length} jogos
                </span>
              </div>
              
              <div className="space-y-4">
                {fixtures.length > 0 ? (
                  fixtures.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                          {getTeamInitial(match.teams.home.name)}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm truncate">
                          {match.teams.home.name}
                        </span>
                      </div>
                      
                      <div className="text-center mx-4 flex-shrink-0">
                        <div className="text-xs text-gray-500 font-medium mb-1">VS</div>
                        <div className="text-sm text-gray-800 font-bold">
                          {formatDate(match.fixture.date)}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1">
                          {formatTime(match.fixture.date)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                        <span className="font-semibold text-gray-800 text-sm truncate text-right">
                          {match.teams.away.name}
                        </span>
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                          {getTeamInitial(match.teams.away.name)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !loading && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto shadow-inner">
                        <span className="text-3xl">⏰</span>
                      </div>
                      <p className="text-lg font-medium">Nenhum jogo agendado</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Info do Campeonato */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
              <span className="text-sm text-gray-600">Dados fornecidos por:</span>
              <span className="text-sm font-semibold text-pink-500">{apiSource}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Destaques */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">DESTAQUES DO FEMININO</h2>
            <p className="text-gray-600 text-lg">As últimas notícias e novidades do universo do futebol feminino</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, index) => (
              <article key={index} className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg border border-gray-100">
                <div className={`h-40 bg-gradient-to-br ${highlight.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-4xl mb-2 z-10">{highlight.image}</div>
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                  <div className="absolute bottom-3 left-4 right-4 z-10">
                    <span className="text-xs font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-full">
                      {highlight.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium mb-4 line-clamp-3">
                    {highlight.title}
                  </p>
                  <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-200 text-sm">
                    Ler mais
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Futebol Feminino</h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            O maior portal dedicado ao futebol feminino brasileiro e internacional. 
            Acompanhe todas as competições, estatísticas e notícias.
          </p>
        </div>
      </footer>
    </div>
  );
}