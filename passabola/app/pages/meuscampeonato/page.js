"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Edit3,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  Crown,
  Zap,
  Star,
  MoreVertical
} from "lucide-react";
import Link from "next/link";

export default function MeusCampeonatosPage() {
  const [user, setUser] = useState(null);
  const [campeonatos, setCampeonatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Verifica usuário logado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Usuário logado:", u);
      setUser(u);
      if (u) {
        carregarCampeonatos(u.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const carregarCampeonatos = async (userId) => {
    try {
      setLoading(true);
      console.log("Buscando campeonatos para userId:", userId);
      
      // Query simplificada - apenas pelo criadorId
      const q = query(
        collection(db, "campeonatos"),
        where("criadorId", "==", userId)
        // Removemos o orderBy para evitar necessidade de índice composto
      );
      
      const querySnapshot = await getDocs(q);
      console.log("Documentos encontrados:", querySnapshot.size);
      
      const campeonatosData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Campeonato encontrado:", data);
        campeonatosData.push({
          id: doc.id,
          ...data
        });
      });
      
      // Ordenar localmente por data de criação (mais recentes primeiro)
      campeonatosData.sort((a, b) => {
        const dateA = a.dataCriacao?.toDate?.() || new Date(0);
        const dateB = b.dataCriacao?.toDate?.() || new Date(0);
        return dateB - dateA; // Ordem decrescente
      });
      
      setCampeonatos(campeonatosData);
    } catch (error) {
      console.error("Erro ao carregar campeonatos:", error);
      
      // Fallback: tentar carregar sem filtro (apenas para debug)
      try {
        console.log("Tentando carregar todos os campeonatos...");
        const q = query(collection(db, "campeonatos"));
        const querySnapshot = await getDocs(q);
        const allCampeonatos = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allCampeonatos.push({
            id: doc.id,
            ...data
          });
        });
        
        console.log("Todos os campeonatos no banco:", allCampeonatos);
        
        // Filtrar localmente pelo userId
        const userCampeonatos = allCampeonatos.filter(camp => camp.criadorId === userId);
        setCampeonatos(userCampeonatos);
        
      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrar campeonatos
  const campeonatosFiltrados = campeonatos.filter(campeonato => {
    const matchesSearch = campeonato.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campeonato.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "todos" || 
                         campeonato.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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

  // Função para obter cor do status
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

  // Função para obter texto do status
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
        return status || "Rascunho";
    }
  };

  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return "Data não definida";
    
    try {
      if (data.toDate) {
        // Se for um timestamp do Firestore
        return data.toDate().toLocaleDateString('pt-BR');
      } else if (typeof data === 'string') {
        // Se for uma string
        return new Date(data).toLocaleDateString('pt-BR');
      }
      return "Data inválida";
    } catch (error) {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando seus campeonatos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Meus Campeonatos
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gerencie todos os seus campeonatos em um só lugar
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-gray-800 mb-2">{campeonatos.length}</div>
            <div className="text-gray-600 text-sm">Total</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {campeonatos.filter(c => c.status === "ativo").length}
            </div>
            <div className="text-gray-600 text-sm">Ativos</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {campeonatos.filter(c => c.status === "finalizado").length}
            </div>
            <div className="text-gray-600 text-sm">Finalizados</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {campeonatos.filter(c => c.status === "rascunho").length}
            </div>
            <div className="text-gray-600 text-sm">Rascunhos</div>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Busca */}
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar campeonatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filtro */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativos</option>
                  <option value="rascunho">Rascunhos</option>
                  <option value="finalizado">Finalizados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>
            </div>

            {/* Botão Criar Novo */}
            <Link
              href="/pages/criarcampeonato"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Criar Campeonato
            </Link>
          </div>
        </div>

        {/* Lista de Campeonatos */}
        {campeonatosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {campeonatos.length === 0 ? "Nenhum campeonato criado" : "Nenhum campeonato encontrado"}
            </h3>
            <p className="text-gray-600 mb-6">
              {campeonatos.length === 0 
                ? "Comece criando seu primeiro campeonato!" 
                : "Tente ajustar os filtros de busca"}
            </p>
            <Link
              href="/pages/criarcampeonato"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Criar Primeiro Campeonato
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {campeonatosFiltrados.map((campeonato) => (
              <div
                key={campeonato.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header do Card */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getPlanoIcone(campeonato.plano)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(campeonato.status)}`}>
                        {getStatusText(campeonato.status)}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors duration-200">
                    {campeonato.nome || "Campeonato sem nome"}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {campeonato.descricao || "Sem descrição"}
                  </p>
                </div>

                {/* Informações */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>
                      {formatarData(campeonato.dataInicio)} - {formatarData(campeonato.dataFim)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>{campeonato.local || "Local não definido"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-pink-500" />
                    <span>{campeonato.maxTimes || 0} times • {campeonato.modalidade || "Não definido"}</span>
                  </div>

                  {campeonato.premiacao && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-600">{campeonato.premiacao}</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="p-6 pt-0 flex gap-2">
                  <Link
                    href={`/pages/campeonato/${campeonato.id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Link>
                  
                  <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 group">
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                  
                  <button className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center group">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dica */}
        {campeonatos.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              💡 Dica: Use os filtros para encontrar rapidamente seus campeonatos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}