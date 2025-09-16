"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

export default function CampeonatosPage() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
        });

        return () => unsubscribeDoc();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchCampeonatos = async () => {
      const querySnapshot = await getDocs(collection(db, "ligas"));
      const listaCampeonatos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCampeonatos(listaCampeonatos);
    };

    fetchCampeonatos();
  }, []);

  // Solicitar inscrição do time
  const handleSolicitarEntrada = async (campeonatoId) => {
    if (!userData?.teamId) {
      alert("Você precisa estar vinculado a um time para se inscrever.");
      return;
    }

    const campeonatoRef = doc(db, "ligas", campeonatoId);
    const campeonatoDocSnap = await getDoc(campeonatoRef);
    const campeonatoData = campeonatoDocSnap.data();

    const solicitacoes = campeonatoData?.solicitacoes || [];

    if (solicitacoes.some(s => s.teamId === userData.teamId)) {
      alert("Seu time já solicitou inscrição nesse campeonato.");
      return;
    }

    // Adiciona solicitação
    await setDoc(
      campeonatoRef,
      {
        solicitacoes: [
          ...(solicitacoes || []),
          { teamId: userData.teamId, status: "pendente" },
        ],
      },
      { merge: true }
    );

    alert("Solicitação enviada! Aguarde aprovação do organizador.");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Campeonatos</h1>

      {campeonatos.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhum campeonato foi criado ainda.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {campeonatos.map((campeonato) => {
            const timesInscritos = campeonato.timesInscritos || [];
            const solicitacoes = campeonato.solicitacoes || [];

            // Verifica se time do usuário já solicitou e qual o status
            const solicitacaoUsuario = userData?.teamId
              ? solicitacoes.find(s => s.teamId === userData.teamId)
              : null;
            
            const jaSolicitou = solicitacaoUsuario !== null;
            const statusSolicitacao = solicitacaoUsuario?.status;

            return (
              <div
                key={campeonato.id}
                className="border rounded-lg shadow p-4 flex flex-col items-center text-center bg-white"
              >
                <h2 className="text-xl font-bold mb-2">{campeonato.nome}</h2>
                <p className="text-gray-600">
                  <b>Local:</b> {campeonato.local}
                </p>
                <p className="text-gray-600">
                  <b>Data:</b> {campeonato.data}
                </p>
                <p className="text-gray-600">
                  <b>Modalidade:</b> {campeonato.modalidade}
                </p>
                <p className="text-gray-600">
                  <b>Número de jogos:</b> {campeonato.numeroJogos}
                </p>
                <p className="text-gray-600">
                  <b>Máximo de times:</b> {campeonato.maxTimes}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Criado em:{" "}
                  {campeonato.criadoEm?.toDate
                    ? campeonato.criadoEm.toDate().toLocaleDateString("pt-BR")
                    : "Data não disponível"}
                </p>
                <p className="text-gray-700 mt-2">
                  <b>Times inscritos:</b> {timesInscritos.length}
                </p>

                {/* Botão de inscrição apenas para tipo Time */}
                {userData?.tipoUsuario === "time" && !jaSolicitou && (
                  <button
                    onClick={() => handleSolicitarEntrada(campeonato.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
                  >
                    Solicitar Entrada
                  </button>
                )}

                {/* Mensagens de status da solicitação */}
                {jaSolicitou && statusSolicitacao === "pendente" && (
                  <p className="text-yellow-600 mt-2">⏳ Solicitação pendente</p>
                )}
                
                {jaSolicitou && statusSolicitacao === "aprovado" && (
                  <p className="text-green-600 mt-2">✅ Solicitação aprovada!</p>
                )}
                
                {jaSolicitou && statusSolicitacao === "negado" && (
                  <p className="text-red-600 mt-2">❌ Solicitação negada</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
