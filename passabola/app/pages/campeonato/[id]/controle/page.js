"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "../../../../lib/firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

// Usando react-qr-code em vez de qrcode.react
function QRCodeComponent({ value, size = 200 }) {
  const [QRCode, setQRCode] = useState(null);

  useEffect(() => {
    import("react-qr-code").then((module) => {
      setQRCode(() => module.QRCodeSVG);
    }).catch((error) => {
      console.error("Erro ao carregar react-qr-code:", error);
    });
  }, []);

  if (!QRCode) {
    return (
      <div 
        className="bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm text-center">
          Carregando<br/>QR Code...
        </span>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '16px',
      display: 'inline-block',
      border: '2px dashed #d1d5db',
      borderRadius: '8px'
    }}>
      <QRCode 
        value={value}
        size={size - 32} // Subtrai o padding
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        viewBox={`0 0 ${size - 32} ${size - 32}`}
      />
    </div>
  );
}

export default function ControleCampeonato() {
  const params = useParams();
  const router = useRouter();
  const campeonatoId = params.id;
  const [campeonato, setCampeonato] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partidas, setPartidas] = useState([]);
  const [partidaSelecionada, setPartidaSelecionada] = useState(null);
  const [showCreatePartida, setShowCreatePartida] = useState(false);
  const [novaPartida, setNovaPartida] = useState({
    timeCasa: "",
    timeVisitante: "",
    data: "",
    local: ""
  });

  // Verificar usuário e permissões
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        try {
          const campeonatoRef = doc(db, "ligas", campeonatoId);
          const campeonatoSnap = await getDoc(campeonatoRef);
          
          if (campeonatoSnap.exists()) {
            const campeonatoData = { id: campeonatoSnap.id, ...campeonatoSnap.data() };
            setCampeonato(campeonatoData);
            
            if (campeonatoData.organizadorId !== u.uid) {
              alert("Acesso negado! Você não é o organizador deste campeonato.");
              router.push("/meuscampeonatos");
              return;
            }
          } else {
            alert("Campeonato não encontrado!");
            router.push("/meuscampeonatos");
          }
        } catch (error) {
          console.error("Erro ao carregar campeonato:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [campeonatoId, router]);

  // Carregar partidas do campeonato
  useEffect(() => {
    if (!campeonatoId) return;

    const partidasRef = collection(db, `ligas/${campeonatoId}/partidas`);
    const unsubscribe = onSnapshot(partidasRef, (snapshot) => {
      const partidasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPartidas(partidasData);
    });

    return () => unsubscribe();
  }, [campeonatoId]);

  // Gerar dados do QR Code
  const gerarQRCodeData = (partidaId) => {
    return JSON.stringify({
      tipo: "partida_campeonato",
      campeonatoId: campeonatoId,
      partidaId: partidaId,
      timestamp: new Date().toISOString()
    });
  };

  // Criar nova partida
  const criarPartida = async (e) => {
    e.preventDefault();
    if (!campeonatoId) return;

    try {
      const partidaRef = collection(db, `ligas/${campeonatoId}/partidas`);
      await addDoc(partidaRef, {
        timeCasa: novaPartida.timeCasa,
        timeVisitante: novaPartida.timeVisitante,
        data: novaPartida.data,
        local: novaPartida.local || "Local a definir",
        status: "nao_iniciada",
        placar: { casa: 0, visitante: 0 },
        eventos: [],
        criadoEm: new Date()
      });

      setShowCreatePartida(false);
      setNovaPartida({ timeCasa: "", timeVisitante: "", data: "", local: "" });
      alert("Partida criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar partida:", error);
      alert("Erro ao criar partida.");
    }
  };

  // Finalizar partida
  const finalizarPartida = async (partidaId) => {
    try {
      const partidaRef = doc(db, `ligas/${campeonatoId}/partidas`, partidaId);
      await updateDoc(partidaRef, {
        status: "finalizada",
        finalizadoEm: new Date()
      });
      alert("Partida finalizada!");
    } catch (error) {
      console.error("Erro ao finalizar partida:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!campeonato) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600">Campeonato não encontrado</h1>
        <Link href="/meuscampeonatos" className="text-blue-500 hover:underline mt-4 inline-block">
          ← Voltar para Meus Campeonatos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl shadow border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {campeonato.imagem && (
              <img src={campeonato.imagem} alt={campeonato.nome} className="w-16 h-16 object-cover rounded-lg" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Controle: {campeonato.nome}</h1>
              <p className="text-gray-600">{campeonato.descricao}</p>
              <p className="text-sm text-gray-500">Organizador: {campeonato.organizadorNome}</p>
            </div>
          </div>
          
          <Link href="/meuscampeonatos" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
            ← Voltar
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-medium text-blue-800">Partidas</span>
            <p className="text-2xl font-bold text-blue-600">{partidas.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <span className="font-medium text-green-800">Times</span>
            <p className="text-2xl font-bold text-green-600">{campeonato.timesInscritos?.length || 0}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <span className="font-medium text-purple-800">Status</span>
            <p className="text-lg font-bold text-purple-600 capitalize">{campeonato.status}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <span className="font-medium text-yellow-800">Tipo</span>
            <p className="text-lg font-bold text-yellow-600">
              {campeonato.tipo === "pontos-corridos" ? "Pontos Corridos" : "Mata-Mata"}
            </p>
          </div>
        </div>
      </div>

      {/* Botão para criar partida */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Partidas do Campeonato</h2>
        <button onClick={() => setShowCreatePartida(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
          + Nova Partida
        </button>
      </div>

      {/* Lista de Partidas */}
      <div className="bg-white rounded-xl shadow border p-6">
        {partidas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma partida cadastrada ainda.</p>
            <button onClick={() => setShowCreatePartida(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mt-4">
              Criar Primeira Partida
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {partidas.map((partida) => (
              <div key={partida.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{partida.timeCasa} vs {partida.timeVisitante}</h3>
                    <p className="text-sm text-gray-600">
                      {partida.data && new Date(partida.data).toLocaleDateString('pt-BR')}
                      {partida.local && ` • ${partida.local}`}
                    </p>
                    <p className={`text-sm font-medium ${
                      partida.status === 'finalizada' ? 'text-green-600' : 
                      partida.status === 'em_andamento' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      Status: {partida.status || 'Não iniciada'}
                    </p>
                    {partida.placar && (
                      <p className="text-lg font-bold text-gray-800">
                        Placar: {partida.placar.casa || 0} - {partida.placar.visitante || 0}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setPartidaSelecionada(partidaSelecionada?.id === partida.id ? null : partida)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      {partidaSelecionada?.id === partida.id ? 'Fechar QR' : '📱 Gerar QR Code'}
                    </button>
                    
                    {partida.status !== 'finalizada' && (
                      <button
                        onClick={() => finalizarPartida(partida.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Finalizar Partida
                      </button>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                {partidaSelecionada?.id === partida.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col items-center">
                      <h4 className="font-medium mb-3 text-gray-700 text-center">
                        Escaneie este QR Code com o app para registrar estatísticas
                      </h4>
                      
                      <QRCodeComponent value={gerarQRCodeData(partida.id)} />
                      
                      <div className="mt-4 text-center text-sm text-gray-600">
                        <p><strong>Partida:</strong> {partida.timeCasa} vs {partida.timeVisitante}</p>
                        <p><strong>ID:</strong> {partida.id}</p>
                        <p className="text-xs mt-2 text-orange-600">Este QR Code é válido para esta partida</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para criar partida */}
      {showCreatePartida && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Criar Nova Partida</h2>
              <form onSubmit={criarPartida}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Time da Casa</label>
                  <input
                    type="text"
                    value={novaPartida.timeCasa}
                    onChange={(e) => setNovaPartida({...novaPartida, timeCasa: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    placeholder="Nome do time da casa"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Time Visitante</label>
                  <input
                    type="text"
                    value={novaPartida.timeVisitante}
                    onChange={(e) => setNovaPartida({...novaPartida, timeVisitante: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    placeholder="Nome do time visitante"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <input
                    type="date"
                    value={novaPartida.data}
                    onChange={(e) => setNovaPartida({...novaPartida, data: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Local (opcional)</label>
                  <input
                    type="text"
                    value={novaPartida.local}
                    onChange={(e) => setNovaPartida({...novaPartida, local: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Local da partida"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowCreatePartida(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Criar Partida
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}