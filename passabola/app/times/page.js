"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function TimesPage() {
  const [times, setTimes] = useState([]);
  const [userData, setUserData] = useState(null);

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
      const querySnapshot = await getDocs(collection(db, "teams"));
      const listaTimes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTimes(listaTimes);
    };

    fetchTimes();
    return () => unsubscribeAuth();
  }, []);

  const solicitarEntrada = async (timeId, timeNome) => {
    if (!userData) return;
    const user = auth.currentUser;

    const timeRef = doc(db, "teams", timeId);

    await updateDoc(timeRef, {
      entradasPendentes: arrayUnion({
        uid: user.uid,
        nome: userData.nome || "Jogadora",
        solicitadoEm: new Date(),
      }),
    });

    alert(`Solicitação enviada para o time "${timeNome}"`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Times Cadastrados</h1>

      {times.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhum time foi criado ainda.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {times.map((time) => (
            <div
              key={time.id}
              className="border rounded-lg shadow p-4 flex flex-col items-center text-center bg-white"
            >
              {time.escudo && (
                <img
                  src={time.escudo}
                  alt={`Escudo do ${time.nome}`}
                  className="w-24 h-24 object-cover rounded-full border mb-4"
                />
              )}

              <h2 className="text-xl font-bold mb-2 text-gray-800">{time.nome}</h2>
              <p className="text-gray-700">
                <b>Modalidade:</b> {
                  time.tipo?.toLowerCase() === 'campo' ? 'Campo' : 
                  time.tipo?.toLowerCase() === 'society' ? 'Society' : 
                  time.tipo?.toLowerCase() === 'salao' || time.tipo?.toLowerCase() === 'salão' ? 'Salão' : 
                  time.tipo
                }
              </p>
              <p className="text-gray-700">
                <b>Categoria:</b> {time.categoria || 'Não informado'}
              </p>
              <p className="text-gray-700">
                <b>Local:</b> {[time.estado, time.cidade, time.bairro].filter(Boolean).join(" - ")}
              </p>

              {userData?.tipoUsuario === "jogadora" && userData.teamId !== time.id && (
                <button
                  onClick={() => solicitarEntrada(time.id, time.nome)}
                  className="mt-4 bg-[#F250A9] text-white px-4 py-2 rounded hover:bg-[#8C2E62]"
                >
                  Solicitar entrada
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
