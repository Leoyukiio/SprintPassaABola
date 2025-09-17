"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CampeonatoPage() {
  const [ligas, setLigas] = useState([]);
  const [user, setUser] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [expandedLiga, setExpandedLiga] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica usuário logado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, "users", u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTeamData(docSnap.data());
        }
      }
    });
    return () => unsub();
  }, []);

  // Carrega campeonatos
  useEffect(() => {
    const fetchLigas = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "ligas"));
        const ligasData = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          timesInscritos: doc.data().timesInscritos || [],
          solicitacoes: doc.data().solicitacoes || []
        }));
        setLigas(ligasData);
      } catch (error) {
        console.error("Erro ao carregar campeonatos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLigas();
  }, []);

  // Solicitar entrada
  const handleSolicitarEntrada = async (ligaId) => {
    if (!user || !teamData) {
      alert("Você precisa estar logado como time para solicitar entrada!");
      return;
    }

    // Verificar se já existe uma solicitação pendente
    const liga = ligas.find(l => l.id === ligaId);
    const solicitacaoExistente = liga.solicitacoes.find(s => s.teamId === user.uid && s.status === "pendente");
    
    if (solicitacaoExistente) {
      alert("Você já tem uma solicitação pendente para este campeonato!");
      return;
    }

    // Verificar se o time já está inscrito
    const timeInscrito = liga.timesInscritos.find(t => t.teamId === user.uid);
    if (timeInscrito) {
      alert("Seu time já está inscrito neste campeonato!");
      return;
    }

    try {
      const ligaRef = doc(db, "ligas", ligaId);
      await updateDoc(ligaRef, {
        solicitacoes: arrayUnion({
          teamId: user.uid,
          nome: teamData.nome || "Sem nome",
          escudo: teamData.escudo || "",
          status: "pendente",
          enviadoEm: new Date().toISOString(),
        }),
      });

      // Atualizar estado local
      setLigas(ligas.map(liga => 
        liga.id === ligaId 
          ? { 
              ...liga, 
              solicitacoes: [...liga.solicitacoes, {
                teamId: user.uid,
                nome: teamData.nome || "Sem nome",
                escudo: teamData.escudo || "",
                status: "pendente",
                enviadoEm: new Date().toISOString(),
              }]
            } 
          : liga
      ));

      alert("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      alert("Erro ao enviar solicitação. Tente novamente.");
    }
  };

  // Alternar expansão do campeonato
  const toggleExpand = (ligaId) => {
    if (expandedLiga === ligaId) {
      setExpandedLiga(null);
    } else {
      setExpandedLiga(ligaId);
    }
  };

  // Verificar status da solicitação do usuário
  const getStatusSolicitacao = (liga) => {
    if (!user) return null;
    
    const solicitacao = liga.solicitacoes.find(s => s.teamId === user.uid);
    if (!solicitacao) return null;
    
    return solicitacao.status;
  };

  // Verificar se o usuário já está inscrito
  const isUsuarioInscrito = (liga) => {
    if (!user) return false;
    return liga.timesInscritos.some(t => t.teamId === user.uid);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🏆 Campeonatos</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Campeonatos Disponíveis</h1>
      
      {ligas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border">
          <p className="text-gray-800">Nenhum campeonato disponível no momento.</p>
        </div>
      ) : (
        ligas.map((liga) => (
          <div key={liga.id} className="border p-4 rounded-xl shadow mb-4 bg-white transition-all duration-300">
            {/* Cabeçalho do campeonato */}
            <div 
              className="flex justify-between items-start cursor-pointer"
              onClick={() => toggleExpand(liga.id)}
            >
              <div className="flex items-start text-gray-800 space-x-4">
                {liga.imagem && (
                  <img
                    src={liga.imagem}
                    alt={liga.nome}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold">TIME: {liga.nome}</h2>
                  <p className="text-sm text-gray-800">{liga.descricao}</p>
                  
                  <div className="flex flex-wrap mt-2 gap-2">
                    {liga.tipo && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {liga.tipo === "pontos-corridos" ? "Pontos Corridos" : "Mata-Mata"}
                      </span>
                    )}
                    {liga.modalidade && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {liga.modalidade}
                      </span>
                    )}
                    {liga.categoria && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {liga.categoria}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button className="text-gray-500 hover:text-gray-700">
                {expandedLiga === liga.id ? "▲" : "▼"}
              </button>
            </div>

            {/* Detalhes expandidos */}
            {expandedLiga === liga.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-gray-800">
                  <div>
                    <h3 className="font-medium">Informações do Campeonato</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {liga.local && <li>📍 <span className="font-medium">Local:</span> {liga.local}</li>}
                      {liga.dataInicio && (
                        <li>📅 <span className="font-medium">Início:</span> {new Date(liga.dataInicio).toLocaleDateString('pt-BR')}</li>
                      )}
                      {liga.dataFim && (
                        <li>📅 <span className="font-medium">Término:</span> {new Date(liga.dataFim).toLocaleDateString('pt-BR')}</li>
                      )}
                      {liga.premiacao && (
                        <li>🏆 <span className="font-medium">Premiação:</span> {liga.premiacao}</li>
                      )}
                      <li>👥 <span className="font-medium">Times inscritos:</span> {liga.timesInscritos.length}/{liga.maxTimes || "Não definido"}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700">Regras e Informações Adicionais</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {liga.regras || "Nenhuma regra específica informada."}
                    </p>
                  </div>
                </div>

                {/* Times inscritos */}
                {liga.timesInscritos.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Times Inscritos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {liga.timesInscritos.slice(0, 4).map((time, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                          {time.escudo && (
                            <img
                              src={time.escudo}
                              alt={time.nome}
                              className="w-6 h-6 object-cover rounded-full"
                            />
                          )}
                          <span className="text-sm truncate">{time.nome}</span>
                        </div>
                      ))}
                      {liga.timesInscritos.length > 4 && (
                        <div className="flex items-center justify-center bg-gray-100 p-2 rounded">
                          <span className="text-sm">+{liga.timesInscritos.length - 4} mais</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Botão de ação */}
                <div className="flex justify-between items-center mt-4">
                  <div>
                    {!user ? (
                      <p className="text-sm text-gray-500">Faça login para solicitar participação</p>
                    ) : isUsuarioInscrito(liga) ? (
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        ✅ Seu time já está inscrito
                      </span>
                    ) : getStatusSolicitacao(liga) === "pendente" ? (
                      <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                        ⏳ Solicitação pendente
                      </span>
                    ) : getStatusSolicitacao(liga) === "aprovado" ? (
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        ✅ Solicitação aprovada
                      </span>
                    ) : getStatusSolicitacao(liga) === "negado" ? (
                      <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                        ❌ Solicitação negada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSolicitarEntrada(liga.id)}
                        className="bg-[#F250A9] hover:bg-[#8C2E62] text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Solicitar Participação
                      </button>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    Criado por: {liga.organizadorNome || "Organizador"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}