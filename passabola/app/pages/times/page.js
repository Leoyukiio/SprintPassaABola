"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, getDocs, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Users, 
  MapPin, 
  Target, 
  Calendar,
  Shield,
  Star,
  Search,
  Filter,
  Send,
  CheckCircle
} from "lucide-react";

export default function TimesPage() {
  const [times, setTimes] = useState([]);
  const [userData, setUserData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalidade, setFilterModalidade] = useState("todas");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setUserData(userSnap.data());
    });

    const fetchTimes = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "teams"));
        const listaTimes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTimes(listaTimes);
      } catch (error) {
        console.error("Erro ao carregar times:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
    return () => unsubscribeAuth();
  }, []);

  const solicitarEntrada = async (timeId, timeNome) => {
    if (!userData) {
      alert("Você precisa estar logado para solicitar entrada em um time!");
      return;
    }

    if (userData.teamId === timeId) {
      alert("Você já faz parte deste time!");
      return;
    }

    setSolicitando(timeId);
    try {
      const timeRef = doc(db, "teams", timeId);

      await updateDoc(timeRef, {
        entradasPendentes: arrayUnion({
          uid: auth.currentUser.uid,
          nome: userData.nome || "Jogadora",
          solicitadoEm: new Date(),
          email: userData.email || "",
          posicao: userData.posicao || "Não informada",
        }),
      });

      alert(`✅ Solicitação enviada para o time "${timeNome}"`);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("❌ Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSolicitando(null);
    }
  };

  // Filtros e busca
  const timesFiltrados = times.filter(time => {
    const matchesSearch = time.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         time.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         time.estado?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModalidade = filterModalidade === "todas" || 
                             time.tipo?.toLowerCase() === filterModalidade;
    
    const matchesCategoria = filterCategoria === "todas" || 
                            time.categoria?.toLowerCase() === filterCategoria;

    return matchesSearch && matchesModalidade && matchesCategoria;
  });

  // Estatísticas
  const estatisticas = {
    total: times.length,
    campo: times.filter(t => t.tipo?.toLowerCase() === 'campo').length,
    society: times.filter(t => t.tipo?.toLowerCase() === 'society').length,
    salao: times.filter(t => t.tipo?.toLowerCase() === 'salao' || t.tipo?.toLowerCase() === 'salão').length,
  };

  // Função para obter cor da modalidade
  const getModalidadeColor = (modalidade) => {
    switch (modalidade?.toLowerCase()) {
      case 'campo':
        return 'from-green-500 to-emerald-600';
      case 'society':
        return 'from-blue-500 to-cyan-600';
      case 'salao':
      case 'salão':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Função para formatar modalidade
  const formatModalidade = (modalidade) => {
    switch (modalidade?.toLowerCase()) {
      case 'campo':
        return 'Campo';
      case 'society':
        return 'Society';
      case 'salao':
      case 'salão':
        return 'Salão';
      default:
        return modalidade || 'Não informada';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Users className="h-10 w-10 text-pink-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Times Cadastrados
              </h1>
            </div>
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Users className="h-10 w-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Times Cadastrados
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Encontre o time perfeito para você! Conheça os times cadastrados e solicite sua participação.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-3">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{estatisticas.total}</div>
            <div className="text-gray-600">Times Total</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{estatisticas.campo}</div>
            <div className="text-gray-600">Campo</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{estatisticas.society}</div>
            <div className="text-gray-600">Society</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{estatisticas.salao}</div>
            <div className="text-gray-600">Salão</div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar times..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Modalidade */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterModalidade}
                onChange={(e) => setFilterModalidade(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="todas">Todas Modalidades</option>
                <option value="campo">Campo</option>
                <option value="society">Society</option>
                <option value="salao">Salão</option>
              </select>
            </div>

            {/* Filtro Categoria */}
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="todas">Todas Categorias</option>
                <option value="sub-17">Sub-17</option>
                <option value="sub-20">Sub-20</option>
                <option value="profissional">Profissional</option>
                <option value="veterano">Veterano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Times */}
        {timesFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {times.length === 0 ? 'Nenhum time cadastrado' : 'Nenhum time encontrado'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {times.length === 0 
                ? 'Ainda não há times cadastrados na plataforma.' 
                : 'Tente ajustar os filtros ou termos de busca.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timesFiltrados.map((time) => (
              <div
                key={time.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                {/* Header do Card */}
                <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200">
                  {time.escudo ? (
                    <img
                      src={time.escudo}
                      alt={`Escudo do ${time.nome}`}
                      className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="pt-8 pb-6 px-6 text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{time.nome}</h2>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <span className={`bg-gradient-to-r ${getModalidadeColor(time.tipo)} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                      {formatModalidade(time.tipo)}
                    </span>
                    {time.categoria && (
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        {time.categoria}
                      </span>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[time.cidade, time.estado].filter(Boolean).join(" - ") || 'Local não informado'}
                      </span>
                    </div>
                    
                    {time.bairro && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Bairro:</span> {time.bairro}
                      </div>
                    )}
                  </div>

                  {/* Botão de Solicitação */}
                  {userData?.tipoUsuario === "jogadora" && userData.teamId !== time.id && (
                    <button
                      onClick={() => solicitarEntrada(time.id, time.nome)}
                      disabled={solicitando === time.id}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {solicitando === time.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Solicitar Entrada
                        </>
                      )}
                    </button>
                  )}

                  {userData?.teamId === time.id && (
                    <div className="flex items-center justify-center gap-2 bg-green-100 text-green-800 py-2 px-4 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Seu time</span>
                    </div>
                  )}

                  {!userData && (
                    <button 
                      className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-xl font-semibold cursor-not-allowed"
                      disabled
                    >
                      Faça login para participar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contador de resultados */}
        {timesFiltrados.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Mostrando <span className="font-semibold text-pink-600">{timesFiltrados.length}</span> de{" "}
              <span className="font-semibold text-gray-800">{times.length}</span> times
            </p>
          </div>
        )}
      </div>
    </div>
  );
}