"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NewsCarousel from "../../components/Carrossel";
import { FootballApiService } from "../lib/football-api";

export default function InicioPage() {
  const [activeTab, setActiveTab] = useState("BRASILEIRO");
  const [standings, setStandings] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiSource, setApiSource] = useState("");

  // Mapeamento CORRETO dos campeonatos femininos
  const championships = {
    // Campeonatos Brasileiros (API-Futebol.com.br)
    "BRASILEIRO": { 
      type: "brazilian", 
      id: 10, 
      name: "Brasileiro Feminino A1",
      api: "futebol" 
    },
    "COPA DO BRASIL": { 
      type: "brazilian", 
      id: 11, 
      name: "Copa do Brasil Feminina",
      api: "futebol" 
    },
    "PAULISTÃO": { 
      type: "brazilian", 
      id: 12, 
      name: "Paulistão Feminino",
      api: "futebol" 
    },
    
    // Campeonatos Internacionais (API-Football)
    "LIBERTADORES": { 
      type: "international", 
      id: 1073, 
      name: "Libertadores Feminina",
      api: "football" 
    },
    "CHAMPIONS": { 
      type: "international", 
      id: 1074, 
      name: "Champions Feminina",
      api: "football" 
    },
    "COPA DO MUNDO": { 
      type: "international", 
      id: 1101, 
      name: "Copa do Mundo Feminina",
      api: "football" 
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
      category: "Libertadores"
    },
    {
      title: "Seleção Feminina: Arthur Elias comanda primeiro treino para amistosos contra o Japão",
      category: "Seleção"
    },
    {
      title: "Nova competição feminina pode fazer times brasileiros enfrentarem campeão do Champions; entenda",
      category: "Internacional"
    },
    {
      title: "Time feminino do Palmeiras sofre com lesões na temporada, e técnica diz: 'é um desafio'",
      category: "Brasileiro"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Carrossel de Notícias */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#8C2E62]">Destaques do Futebol Feminino</h2>
          <NewsCarousel />
        </div>
      </section>

      {/* Seção de Campeonatos Femininos */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">CAMPEONATOS FEMININOS</h2>
          
          {/* Tabs de Campeonatos */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-pink-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600">Carregando dados da API...</span>
            </div>
          )}

          {/* Conteúdo dos Campeonatos */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tabela de Classificação */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Classificação - {activeTab}</h3>
                <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                  {standings.length} times
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
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
                    {standings.length > 0 ? (
                      standings.map((team, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-3 font-medium text-gray-800">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                              team.rank <= 4 ? 'bg-green-100 text-green-800' : 
                              team.rank <= 6 ? 'bg-blue-100 text-blue-800' : 
                              team.rank >= 13 ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {team.rank}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {getTeamInitial(team.team.name)}
                              </div>
                              <span className="font-medium text-gray-800">{team.team.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center text-gray-800 font-bold">{team.points}</td>
                          <td className="py-3 text-center text-gray-800">{team.all.played}</td>
                          <td className="py-3 text-center text-gray-800">{team.all.win}</td>
                          <td className="py-3 text-center text-gray-800">{team.all.draw}</td>
                          <td className="py-3 text-center text-gray-800">{team.all.lose}</td>
                        </tr>
                      ))
                    ) : (
                      !loading && (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <span className="text-2xl">⚽</span>
                              </div>
                              Nenhum dado de classificação disponível
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
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Próximos Jogos</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {fixtures.length} jogos
                </span>
              </div>
              
              <div className="space-y-3">
                {fixtures.length > 0 ? (
                  fixtures.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getTeamInitial(match.teams.home.name)}
                        </div>
                        <span className="font-medium text-gray-800 text-sm truncate">
                          {match.teams.home.name}
                        </span>
                      </div>
                      
                      <div className="text-center mx-4 flex-shrink-0">
                        <div className="text-xs text-gray-500 mb-1">VS</div>
                        <div className="text-xs text-gray-800 font-medium">
                          {formatDate(match.fixture.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(match.fixture.date)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-medium text-gray-800 text-sm truncate text-right">
                          {match.teams.away.name}
                        </span>
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getTeamInitial(match.teams.away.name)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !loading && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="text-2xl">⏰</span>
                      </div>
                      Nenhum jogo agendado
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Destaques */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">DESTAQUES DO FEMININO</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, index) => (
              <article key={index} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition shadow-md">
                <div className="h-40 bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center relative">
                  <div className="text-center text-white p-4 z-10">
                    <div className="text-sm font-medium mb-1">{highlight.category}</div>
                    <div className="text-xs opacity-90">Futebol Feminino</div>
                  </div>
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {highlight.title}
                  </p>
                  <button className="mt-3 text-pink-500 hover:text-pink-600 text-xs font-medium transition">
                    Ler mais →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}