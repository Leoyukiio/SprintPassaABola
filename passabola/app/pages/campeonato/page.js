"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Filter,
  List,
  Grid,
  Eye,
  Crown,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function TodosCampeonatosPage() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [user, setUser] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [expandedCampeonato, setExpandedCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(null);
  const [filtro, setFiltro] = useState("todos"); // "todos", "inscritos", "disponiveis"
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"

  // Verifica usuário logado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setTeamData(userData);
        }
      }
    });
    return () => unsub();
  }, []);

  // Carrega TODOS os campeonatos
  useEffect(() => {
    const fetchCampeonatos = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "campeonatos"));
        const campeonatosData = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          timesInscritos: doc.data().timesInscritos || [],
          solicitacoes: doc.data().solicitacoes || []
        }));
        setCampeonatos(campeonatosData);
        console.log("Campeonatos carregados:", campeonatosData);
      } catch (error) {
        console.error("Erro ao carregar campeonatos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonatos();
  }, []);

  // Filtrar campeonatos baseado no filtro selecionado
  const campeonatosFiltrados = campeonatos.filter(campeonato => {
    if (filtro === "todos") return true;
    if (filtro === "inscritos") return isUsuarioInscrito(campeonato);
    if (filtro === "disponiveis") return !isUsuarioInscrito(campeonato) && getStatusSolicitacao(campeonato) !== "pendente";
    return true;
  });

  // Solicitar entrada
  const handleSolicitarEntrada = async (campeonatoId) => {
    if (!user || !teamData) {
      alert("Você precisa estar logado como time para solicitar entrada!");
      return;
    }

    // Verificar se já existe uma solicitação pendente
    const campeonato = campeonatos.find(c => c.id === campeonatoId);
    const solicitacaoExistente = campeonato.solicitacoes.find(s => s.teamId === user.uid && s.status === "pendente");
    
    if (solicitacaoExistente) {
      alert("Você já tem uma solicitação pendente para este campeonato!");
      return;
    }

    // Verificar se o time já está inscrito
    const timeInscrito = campeonato.timesInscritos.find(t => t.teamId === user.uid);
    if (timeInscrito) {
      alert("Seu time já está inscrito neste campeonato!");
      return;
    }

    setSolicitando(campeonatoId);
    try {
      const campeonatoRef = doc(db, "campeonatos", campeonatoId);
      await updateDoc(campeonatoRef, {
        solicitacoes: arrayUnion({
          teamId: user.uid,
          nome: teamData.nomeTime || teamData.nomeCompleto || "Sem nome",
          escudo: teamData.escudo || "",
          status: "pendente",
          enviadoEm: new Date().toISOString(),
        }),
      });

      // Atualizar estado local
      setCampeonatos(campeonatos.map(campeonato => 
        campeonato.id === campeonatoId 
          ? { 
              ...campeonato, 
              solicitacoes: [...campeonato.solicitacoes, {
                teamId: user.uid,
                nome: teamData.nomeTime || teamData.nomeCompleto || "Sem nome",
                escudo: teamData.escudo || "",
                status: "pendente",
                enviadoEm: new Date().toISOString(),
              }]
            } 
          : campeonato
      ));

      alert("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSolicitando(null);
    }
  };

  // Alternar expansão do campeonato
  const toggleExpand = (campeonatoId) => {
    if (expandedCampeonato === campeonatoId) {
      setExpandedCampeonato(null);
    } else {
      setExpandedCampeonato(campeonatoId);
    }
  };

  // Verificar status da solicitação do usuário
  const getStatusSolicitacao = (campeonato) => {
    if (!user) return null;
    
    const solicitacao = campeonato.solicitacoes.find(s => s.teamId === user.uid);
    if (!solicitacao) return null;
    
    return solicitacao.status;
  };

  // Verificar se o usuário já está inscrito
  const isUsuarioInscrito = (campeonato) => {
    if (!user) return false;
    return campeonato.timesInscritos.some(t => t.teamId === user.uid);
  };

  // Função para obter cor baseada no tipo de campeonato
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "pontos-corridos":
        return "from-blue-500 to-cyan-600";
      case "mata-mata":
        return "from-red-500 to-pink-600";
      case "grupos-mata-mata":
        return "from-purple-500 to-indigo-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Função para obter cor baseada na modalidade
  const getModalidadeColor = (modalidade) => {
    switch (modalidade) {
      case "feminino":
        return "from-pink-500 to-purple-600";
      case "masculino":
        return "from-blue-500 to-indigo-600";
      case "misto":
        return "from-green-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  // Função para obter ícone do plano
  const getPlanoIcone = (plano) => {
    switch (plano) {
      case "premium":
        return <Crown className="w-4 h-4" />;
      case "profissional":
        return <Zap className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  // Função para obter texto do status do campeonato
  const getStatusText = (status) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "rascunho":
        return "Rascunho";
      case "finalizado":
        return "Finalizado";
      case "cancelado":
        return "Cancelado";
      default:
        return status || "Ativo";
    }
  };

  // Função para obter cor do status do campeonato
  const getStatusColor = (status) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "rascunho":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "finalizado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Estatísticas para o header
  const stats = {
    total: campeonatos.length,
    timesParticipantes: campeonatos.reduce((total, campeonato) => total + campeonato.timesInscritos.length, 0),
    comPremiacao: campeonatos.filter(campeonato => campeonato.premiacao).length,
    meusCampeonatos: campeonatos.filter(campeonato => isUsuarioInscrito(campeonato)).length,
    ativos: campeonatos.filter(campeonato => campeonato.status === "ativo").length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-pink-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Todos os Campeonatos
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Explore todos os campeonatos criados na plataforma</p>
          </div>
          
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Todos os Campeonatos
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore todos os campeonatos criados na plataforma. 
            Participe dos torneios e mostre o talento do seu time!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-3">
              <Trophy className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-gray-600">Total</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.ativos}</div>
            <div className="text-gray-600">Ativos</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.timesParticipantes}</div>
            <div className="text-gray-600">Times</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.comPremiacao}</div>
            <div className="text-gray-600">Com Prêmio</div>
          </div>

          {user && teamData?.tipoUsuario === "time" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stats.meusCampeonatos}</div>
              <div className="text-gray-600">Meus</div>
            </div>
          )}
        </div>

        {/* Filtros e Controles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          {/* <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Filtrar:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltro("todos")}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filtro === "todos" 
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              {user && teamData?.tipoUsuario === "time" && (
                <>
                  <button
                    onClick={() => setFiltro("inscritos")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filtro === "inscritos" 
                        ? "bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Meus Campeonatos
                  </button>
                  <button
                    onClick={() => setFiltro("disponiveis")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      filtro === "disponiveis" 
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Disponíveis
                  </button>
                </>
              )}
            </div>
          </div> */}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid" 
                    ? "bg-pink-100 text-pink-600" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list" 
                    ? "bg-pink-100 text-pink-600" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
            
            {user && (
              <Link
                href="/pages/criarcampeonato"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                <Trophy className="w-4 h-4" />
                Criar Campeonato
              </Link>
            )}
          </div>
        </div>

        {/* Lista de Campeonatos */}
        {campeonatosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filtro === "inscritos" ? "Nenhum campeonato inscrito" : 
               filtro === "disponiveis" ? "Nenhum campeonato disponível" : 
               "Nenhum campeonato encontrado"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              {filtro === "inscritos" ? 
                "Você ainda não está inscrito em nenhum campeonato. Explore os campeonatos disponíveis!" :
               filtro === "disponiveis" ? 
                "Todos os campeonatos disponíveis já têm sua participação solicitada ou confirmada." :
                "Ainda não há campeonatos criados na plataforma."}
            </p>
            {user && (
              <Link
                href="/pages/criarcampeonato"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 inline-flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Criar Primeiro Campeonato
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contador de resultados */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {campeonatosFiltrados.length} de {campeonatos.length} campeonatos
                {filtro !== "todos" && ` (filtrado por: ${filtro === "inscritos" ? "Meus Campeonatos" : "Disponíveis"})`}
              </div>
            </div>

            {campeonatosFiltrados.map((campeonato) => {
              const statusSolicitacao = getStatusSolicitacao(campeonato);
              const usuarioInscrito = isUsuarioInscrito(campeonato);
              
              return (
                <div 
                  key={campeonato.id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  {/* Cabeçalho do campeonato */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpand(campeonato.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {campeonato.imagem ? (
                          <img
                            src={campeonato.imagem}
                            alt={campeonato.nome}
                            className="w-20 h-20 object-cover rounded-xl shadow-md"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl shadow-md flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-white" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-800 truncate">{campeonato.nome}</h2>
                            
                            {/* Status do campeonato */}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campeonato.status)}`}>
                              {getStatusText(campeonato.status)}
                            </span>
                            
                            {/* Plano */}
                            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                              {getPlanoIcone(campeonato.plano)}
                              <span>{campeonato.plano?.toUpperCase() || "BÁSICO"}</span>
                            </div>

                            {usuarioInscrito && (
                              <span className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                INSCRITO
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{campeonato.descricao}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {campeonato.tipo && (
                              <span className={`bg-gradient-to-r ${getTipoColor(campeonato.tipo)} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                                {campeonato.tipo === "pontos-corridos" ? "Pontos Corridos" : 
                                 campeonato.tipo === "mata-mata" ? "Mata-Mata" : 
                                 "Grupos + Mata-Mata"}
                              </span>
                            )}
                            {campeonato.modalidade && (
                              <span className={`bg-gradient-to-r ${getModalidadeColor(campeonato.modalidade)} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                                {campeonato.modalidade}
                              </span>
                            )}
                            {campeonato.categoria && (
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                {campeonato.categoria}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-4">
                        {/* Status do usuário */}
                        {!user ? (
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Faça login para participar</div>
                          </div>
                        ) : usuarioInscrito ? (
                          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Inscrito</span>
                          </div>
                        ) : statusSolicitacao === "pendente" ? (
                          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Pendente</span>
                          </div>
                        ) : statusSolicitacao === "aprovado" ? (
                          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Aprovado</span>
                          </div>
                        ) : statusSolicitacao === "negado" ? (
                          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-full">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Negado</span>
                          </div>
                        ) : null}
                        
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          {expandedCampeonato === campeonato.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {expandedCampeonato === campeonato.id && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Informações do Campeonato */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-pink-500" />
                            Informações do Campeonato
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {campeonato.local && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="text-sm text-gray-600">Local</div>
                                  <div className="font-medium text-gray-800">{campeonato.local}</div>
                                </div>
                              </div>
                            )}
                            
                            {campeonato.dataInicio && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="text-sm text-gray-600">Data de Início</div>
                                  <div className="font-medium text-gray-800">
                                    {new Date(campeonato.dataInicio).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {campeonato.dataFim && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="text-sm text-gray-600">Data de Término</div>
                                  <div className="font-medium text-gray-800">
                                    {new Date(campeonato.dataFim).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Users className="h-4 w-4 text-gray-600" />
                              <div>
                                <div className="text-sm text-gray-600">Times Inscritos</div>
                                <div className="font-medium text-gray-800">
                                  {campeonato.timesInscritos.length}/{campeonato.maxTimes || "∞"}
                                </div>
                              </div>
                            </div>
                            
                            {campeonato.premiacao && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Award className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="text-sm text-gray-600">Premiação</div>
                                  <div className="font-medium text-gray-800">{campeonato.premiacao}</div>
                                </div>
                              </div>
                            )}

                            {campeonato.criadorNome && (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Eye className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="text-sm text-gray-600">Organizador</div>
                                  <div className="font-medium text-gray-800">{campeonato.criadorNome}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Times Inscritos e Regras */}
                        <div className="space-y-4">
                          {/* Times Inscritos */}
                          {campeonato.timesInscritos.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                Times Inscritos ({campeonato.timesInscritos.length})
                              </h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {campeonato.timesInscritos.slice(0, 6).map((time, index) => (
                                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                    {time.escudo ? (
                                      <img
                                        src={time.escudo}
                                        alt={time.nome}
                                        className="w-8 h-8 object-cover rounded-full"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {time.nome?.charAt(0) || "T"}
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-800 truncate">{time.nome}</span>
                                  </div>
                                ))}
                                {campeonato.timesInscritos.length > 6 && (
                                  <div className="flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 p-3 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">
                                      +{campeonato.timesInscritos.length - 6} mais
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Regras */}
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-500" />
                              Regras e Informações
                            </h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                              {campeonato.regras || "Nenhuma regra específica informada. Entre em contato com os organizadores para mais detalhes."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Botão de Ação */}
                      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          {campeonato.timesInscritos.length} times já confirmados
                        </div>
                        
                        <div>
                          {!user ? (
                            <button 
                              className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-xl font-semibold cursor-not-allowed"
                              disabled
                            >
                              Faça login para participar
                            </button>
                          ) : usuarioInscrito ? (
                            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-semibold">Seu time já está inscrito</span>
                            </div>
                          ) : statusSolicitacao === "pendente" ? (
                            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                              <Clock className="h-5 w-5" />
                              <span className="font-semibold">Solicitação pendente de aprovação</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSolicitarEntrada(campeonato.id)}
                              disabled={solicitando === campeonato.id}
                              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {solicitando === campeonato.id ? (
                                <div className="flex items-center gap-2">
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Enviando...
                                </div>
                              ) : (
                                "Solicitar Participação"
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}