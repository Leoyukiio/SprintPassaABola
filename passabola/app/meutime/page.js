"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";

export default function MeuTimePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [team, setTeam] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pendingDetails, setPendingDetails] = useState({});
  const [memberDetails, setMemberDetails] = useState({});

  const [form, setForm] = useState({
    nome: "",
    escudo: "",
    categoria: "",
    tipo: "",
    cidade: "",
    bairro: "",
    estado: "",
  });

  // Carregar usuário e time
  useEffect(() => {
    let unsubscribeTeam = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setTeam(null);
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);

        if (data.teamId) {
          const teamRef = doc(db, "teams", data.teamId);
          unsubscribeTeam = onSnapshot(teamRef, (teamSnap) => {
            if (teamSnap.exists()) {
              const teamData = { id: teamSnap.id, ...teamSnap.data() };
              setTeam(teamData);
            }
          });
        }
      }

      // Verificar notificações da jogadora
      if (currentUser && userDoc.exists()) {
        const userSnapRef = doc(db, "users", currentUser.uid);
        const unsubscribeNotif = onSnapshot(userSnapRef, (snap) => {
          const data = snap.data();
          if (data.notification) {
            setNotifications(data.notification);
            // Limpar notificação após exibir
            updateDoc(userSnapRef, { notification: [] }).catch(() => {});
          }
        });
        return () => unsubscribeNotif();
      }
    });

    return () => {
      if (unsubscribeTeam) unsubscribeTeam();
      unsubscribeAuth();
    };
  }, []);

  // Sincroniza o formulário com os dados do time carregado
  useEffect(() => {
    if (userData?.tipoUsuario === "time" && team) {
      setForm({
        nome: team?.nome || "",
        escudo: team?.escudo || "",
        categoria: team?.categoria || "",
        tipo: team?.tipo || "",
        cidade: team?.cidade || "",
        bairro: team?.bairro || "",
        estado: team?.estado || "",
      });
    }
  }, [team, userData?.tipoUsuario]);

  // Carrega detalhes (nomeCompleto e posicoes) das jogadoras com solicitação pendente
  useEffect(() => {
    const loadDetails = async () => {
      if (!team?.entradasPendentes || team.entradasPendentes.length === 0) {
        setPendingDetails({});
        return;
      }

      const entries = team.entradasPendentes;
      const results = await Promise.all(
        entries.map(async (s) => {
          try {
            const snap = await getDoc(doc(db, "users", s.uid));
            if (snap.exists()) {
              const d = snap.data();
              const nomeCompleto = d?.nomeCompleto || d?.nome || s?.nome || "Jogadora";
              const posicoesArr = Array.isArray(d?.posicoes)
                ? d.posicoes
                : (d?.posicao ? [d.posicao] : []);
              return [s.uid, { nomeCompleto, posicoes: posicoesArr }];
            }
          } catch (_) {}
          const fallbackPosicoes = typeof s?.posicao === "string" && s.posicao.length > 0
            ? s.posicao.split(",").map((p) => p.trim())
            : [];
          return [s.uid, { nomeCompleto: s?.nome || "Jogadora", posicoes: fallbackPosicoes }];
        })
      );

      const map = {};
      results.forEach(([uid, info]) => {
        map[uid] = info;
      });
      setPendingDetails(map);
    };

    loadDetails();
  }, [team?.entradasPendentes]);

  // Carrega detalhes dos membros (nomeCompleto) para exibição correta
  useEffect(() => {
    const loadMembers = async () => {
      if (!team?.membros || team.membros.length === 0) {
        setMemberDetails({});
        return;
      }

      const entries = team.membros;
      const results = await Promise.all(
        entries.map(async (m) => {
          try {
            const snap = await getDoc(doc(db, "users", m.uid));
            if (snap.exists()) {
              const d = snap.data();
              const nomeCompleto = d?.nomeCompleto || d?.nome || m?.nome || "Jogadora";
              return [m.uid, { nomeCompleto }];
            }
          } catch (_) {}
          return [m.uid, { nomeCompleto: m?.nomeCompleto || m?.nome || "Jogadora" }];
        })
      );

      const map = {};
      results.forEach(([uid, info]) => {
        map[uid] = info;
      });
      setMemberDetails(map);
    };

    loadMembers();
  }, [team?.membros]);

  // Upload de escudo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, escudo: reader.result }));
    reader.readAsDataURL(file);
  };

  // Criar ou atualizar time
  const handleSaveTeam = async () => {
    if (!user || !userData) return;

    if (form.nome.trim() === "") {
      alert("Digite o nome do time!");
      return;
    }

    const teamId = userData.teamId || user.uid;
    const teamDocRef = doc(db, "teams", teamId);

    await setDoc(
      teamDocRef,
      {
        ...form,
        dono: user.uid,
        atualizadoEm: new Date(),
        entradasPendentes: team?.entradasPendentes || [],
        membros: team?.membros || [],
      },
      { merge: true }
    );

    if (!userData.teamId) {
      await setDoc(doc(db, "users", user.uid), { teamId }, { merge: true });
    }

    setTeam({ id: teamId, ...form, dono: user.uid });
    alert("Informações do time salvas com sucesso!");
  };

  // Apagar time
  const handleDeleteTeam = async () => {
    if (!user || !team) return;

    await deleteDoc(doc(db, "teams", team.id));
    await setDoc(doc(db, "users", user.uid), { teamId: null }, { merge: true });

    setTeam(null);
    setForm({
      nome: "",
      escudo: "",
      categoria: "",
      tipo: "",
      cidade: "",
      bairro: "",
      estado: "",
    });
    alert("Time apagado com sucesso!");
  };

  // Jogadora solicita entrada
  const handleSolicitarEntrada = async () => {
    if (!user || !team) return;

    // Deriva nome e posição(s) corretamente do perfil
    const nomeJogadora = userData?.nomeCompleto || user?.displayName || "Jogadora";
    const posicoesPerfil = Array.isArray(userData?.posicoes) ? userData.posicoes : [];
    const posicaoJogadora =
      posicoesPerfil.length > 0
        ? posicoesPerfil.join(", ")
        : (userData?.posicao || "Não definida");

    const solicitacao = {
      uid: user.uid,
      nome: nomeJogadora,
      posicao: posicaoJogadora,
    };

    await updateDoc(doc(db, "teams", team.id), {
      entradasPendentes: arrayUnion(solicitacao),
    });

    alert("Solicitação enviada para o time!");
  };

  // Aprovar/Negar solicitação
  const handleSolicitacao = async (solicitacao, aprovar = true) => {
    if (!team) return;
    const teamRef = doc(db, "teams", team.id);

    const userRef = doc(db, "users", solicitacao.uid);

    if (aprovar) {
      // Monta o membro sem campos undefined
      const detalhes = pendingDetails?.[solicitacao.uid] || {};
      const nomeMembro = (solicitacao?.nome || detalhes?.nomeCompleto || "Jogadora");
      const posicoesArray = Array.isArray(detalhes?.posicoes) && detalhes.posicoes.length > 0
        ? detalhes.posicoes
        : (typeof solicitacao?.posicao === "string" && solicitacao.posicao.length > 0
            ? solicitacao.posicao.split(",").map((p) => p.trim())
            : []);
      const posicaoMembro = posicoesArray.length > 0 ? posicoesArray.join(", ") : "Não definida";

      await updateDoc(teamRef, {
        membros: arrayUnion({ uid: solicitacao.uid, nome: nomeMembro, nomeCompleto: nomeMembro, posicao: posicaoMembro }),
        entradasPendentes: (team?.entradasPendentes || []).filter((s) => s.uid !== solicitacao.uid),
      });
      await setDoc(userRef, { teamId: team.id, notification: [{ msg: `Sua entrada no time ${team.nome} foi aprovada!` }] }, { merge: true });
    } else {
      await updateDoc(teamRef, {
        entradasPendentes: (team?.entradasPendentes || []).filter((s) => s.uid !== solicitacao.uid),
      });
      await setDoc(userRef, { notification: [{ msg: `Sua entrada no time ${team.nome} foi negada.` }] }, { merge: true });
    }
  };

  if (!userData) return <p className="p-6">Carregando...</p>;

  if (userData.tipoUsuario === "jogadora" && !userData.teamId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">⚠️ Você ainda não pertence a nenhum time</h1>
        <p>Solicite entrada em um time para acessar seu time.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">⚽ Meu Time</h1>

      {/* Notificações para jogadora */}
      {notifications.length > 0 && (
        <div className="p-4 border rounded bg-yellow-100 mb-4">
          {notifications.map((n, idx) => (
            <p key={idx}>{n.msg}</p>
          ))}
        </div>
      )}

      {/* Tipo time: criar/editar */}
      {userData.tipoUsuario === "time" && (
        <div className="p-4 border rounded shadow mb-4">
          {form.escudo && <img src={form.escudo} alt="Escudo" className="w-24 h-24 object-cover rounded mb-2" />}
          <input id="escudo-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <label htmlFor="escudo-upload" className="inline-block cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded border mb-2">
            {form.escudo ? "Alterar escudo" : "Enviar escudo"}
          </label>

          <input type="text" placeholder="Nome do time" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border p-2 rounded mb-2" />
          <input type="text" placeholder="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border p-2 rounded mb-2" />
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="w-full border p-2 rounded mb-2">
            <option value="">Selecione o tipo</option>
            <option value="campo">Campo</option>
            <option value="society">Society</option>
            <option value="salão">Salão</option>
          </select>
          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full border p-2 rounded mb-2">
            <option value="">Estado (UF)</option>
            <option value="SP">SP - São Paulo</option>
            <option value="RJ">RJ - Rio de Janeiro</option>
          </select>
          <input type="text" placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="w-full border p-2 rounded mb-2" />
          <input type="text" placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} className="w-full border p-2 rounded mb-2" />
          <button onClick={handleSaveTeam} className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2">{team ? "Atualizar Time" : "Criar Time"}</button>
          {team && <button onClick={handleDeleteTeam} className="bg-red-600 text-white px-4 py-2 rounded w-full mt-2">Apagar Time</button>}
        </div>
      )}

      {/* Jogadora: ver informações */}
      {userData.tipoUsuario === "jogadora" && team && (
        <div className="p-4 border rounded shadow mb-4">
          <h2 className="text-xl font-bold mb-2">{team.nome}</h2>
          {team.escudo && <img src={team.escudo} alt="Escudo" className="w-24 h-24 object-cover rounded mb-2" />}
          <p>Categoria: {team.categoria}</p>
          <p>Tipo: {team.tipo}</p>
          <p>Local: {[team.cidade, team.bairro, team.estado].filter(Boolean).join(" - ")}</p>
        </div>
      )}

      {/* Solicitar entrada (jogadora) */}
      {userData.tipoUsuario === "jogadora" && !userData.teamId && (
        <button onClick={handleSolicitarEntrada} className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4">Solicitar entrada</button>
      )}

      {/* Solicitações pendentes (time) */}
      {userData.tipoUsuario === "time" && team?.entradasPendentes?.length > 0 && (
        <div className="p-4 border rounded shadow mb-4">
          <h3 className="font-bold text-lg mb-2">Solicitações de Entrada</h3>
          {team.entradasPendentes.map((sol, idx) => (
            <div key={idx} className="flex justify-between items-center mb-2">
              {(() => {
                const details = pendingDetails[sol.uid] || {};
                const displayNome = details.nomeCompleto || sol?.nome || "Jogadora";
                const displayPosicoes = Array.isArray(details.posicoes) && details.posicoes.length > 0
                  ? details.posicoes.join(", ")
                  : (sol?.posicao || "Não definida");
                return (
                  <span>{displayNome} - Posição: {displayPosicoes}</span>
                );
              })()}
              <div className="space-x-2">
                <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => handleSolicitacao(sol, true)}>Aprovar</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleSolicitacao(sol, false)}>Negar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de membros */}
      {team?.membros?.length > 0 && (
        <div className="p-4 border rounded shadow mb-4">
          <h3 className="font-bold text-lg mb-2">Membros do Time</h3>
          <ul className="list-disc list-inside">
            {team.membros.map((m, idx) => {
              const details = memberDetails[m.uid] || {};
              const displayNome = m?.nomeCompleto || details?.nomeCompleto || m?.nome || "Jogadora";
              return (
                <li key={idx}>{displayNome} - Posição: {m?.posicao || "Não definida"}</li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
