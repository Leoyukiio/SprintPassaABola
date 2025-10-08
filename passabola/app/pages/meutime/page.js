"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { 
  Users, 
  Settings, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Trash2, 
  Save,
  Upload,
  MapPin,
  Award,
  Shield,
  Bell,
  CheckCircle,
  XCircle,
  Camera,
  Edit3,
  Loader
} from "lucide-react";

export default function MeuTimePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [team, setTeam] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pendingDetails, setPendingDetails] = useState({});
  const [memberDetails, setMemberDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

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
        setLoading(false);
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
            setLoading(false);
          });
        } else {
          setLoading(false);
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

  // Carrega detalhes das jogadoras com solicitação pendente
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

  // Carrega detalhes dos membros
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

    setSaving(true);
    try {
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
      alert("✅ Informações do time salvas com sucesso!");
    } catch (error) {
      alert("❌ Erro ao salvar time. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Apagar time
  const handleDeleteTeam = async () => {
    if (!user || !team) return;

    if (!confirm("Tem certeza que deseja apagar este time? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
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
      alert("✅ Time apagado com sucesso!");
    } catch (error) {
      alert("❌ Erro ao apagar time. Tente novamente.");
    }
  };

  // Jogadora solicita entrada
  const handleSolicitarEntrada = async () => {
    if (!user || !team) return;

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

    try {
      await updateDoc(doc(db, "teams", team.id), {
        entradasPendentes: arrayUnion(solicitacao),
      });
      alert("✅ Solicitação enviada para o time!");
    } catch (error) {
      alert("❌ Erro ao enviar solicitação. Tente novamente.");
    }
  };

  // Aprovar/Negar solicitação
  const handleSolicitacao = async (solicitacao, aprovar = true) => {
    if (!team) return;
    const teamRef = doc(db, "teams", team.id);
    const userRef = doc(db, "users", solicitacao.uid);

    try {
      if (aprovar) {
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
    } catch (error) {
      alert("❌ Erro ao processar solicitação. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return <p className="p-6">Carregando...</p>;

  if (userData.tipoUsuario === "jogadora" && !userData.teamId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Você ainda não pertence a nenhum time</h1>
            <p className="text-gray-600 text-lg mb-8">
              Solicite entrada em um time para acessar as informações do seu time.
            </p>
            <button
              onClick={() => window.location.href = '/pages/times'}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              Explorar Times
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Meu Time
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {userData.tipoUsuario === "time" 
              ? "Gerencie seu time e solicitações de entrada" 
              : "Visualize as informações do seu time"
            }
          </p>
        </div>

        {/* Notificações */}
        {notifications.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl shadow-lg mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Notificações</h3>
            </div>
            {notifications.map((n, idx) => (
              <p key={idx} className="mt-2 text-sm">{n.msg}</p>
            ))}
          </div>
        )}

        {/* Abas de Navegação para Time */}
        {userData.tipoUsuario === "time" && (
          <div className="flex bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "info" 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Informações
            </button>
            <button
              onClick={() => setActiveTab("solicitacoes")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "solicitacoes" 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <UserPlus className="h-4 w-4 inline mr-2" />
              Solicitações
              {team?.entradasPendentes?.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {team.entradasPendentes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("membros")}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === "membros" 
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Membros
            </button>
          </div>
        )}

        {/* Conteúdo das Abas */}
        <div className="space-y-6">
          {/* Informações do Time */}
          {(activeTab === "info" || userData.tipoUsuario === "jogadora") && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {userData.tipoUsuario === "time" ? "Informações do Time" : "Meu Time"}
                </h2>
              </div>

              {userData.tipoUsuario === "time" ? (
                <div className="space-y-6">
                  {/* Upload de Escudo */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      {form.escudo ? (
                        <img
                          src={form.escudo}
                          alt="Escudo do time"
                          className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-lg mx-auto"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center mx-auto">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <label htmlFor="escudo-upload" className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 transition-colors shadow-lg">
                        <Upload className="h-4 w-4" />
                      </label>
                      <input
                        id="escudo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Formulário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Time *</label>
                      <input
                        type="text"
                        placeholder="Digite o nome do time"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                      <input
                        type="text"
                        placeholder="Ex: Sub-17, Profissional"
                        value={form.categoria}
                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
                      <select
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Selecione a modalidade</option>
                        <option value="campo">Campo</option>
                        <option value="society">Society</option>
                        <option value="salão">Salão</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">Selecione o estado</option>
                        <option value="SP">SP - São Paulo</option>
                        <option value="RJ">RJ - Rio de Janeiro</option>
                        <option value="MG">MG - Minas Gerais</option>
                        <option value="RS">RS - Rio Grande do Sul</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                      <input
                        type="text"
                        placeholder="Digite a cidade"
                        value={form.cidade}
                        onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                      <input
                        type="text"
                        placeholder="Digite o bairro"
                        value={form.bairro}
                        onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSaveTeam}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {team ? "Atualizar Time" : "Criar Time"}
                    </button>
                    
                    {team && (
                      <button
                        onClick={handleDeleteTeam}
                        className="px-6 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Apagar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Visualização para Jogadora
                team && (
                  <div className="text-center">
                    {team.escudo ? (
                      <img
                        src={team.escudo}
                        alt="Escudo do time"
                        className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-lg mx-auto mb-6"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                    )}
                    
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{team.nome}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <Award className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                        <div className="text-sm text-gray-600">Categoria</div>
                        <div className="font-semibold text-gray-800">{team.categoria || "Não informada"}</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <Shield className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                        <div className="text-sm text-gray-600">Modalidade</div>
                        <div className="font-semibold text-gray-800">{team.tipo || "Não informada"}</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <MapPin className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                        <div className="text-sm text-gray-600">Localização</div>
                        <div className="font-semibold text-gray-800">
                          {[team.cidade, team.estado].filter(Boolean).join(" - ") || "Não informada"}
                        </div>
                      </div>
                    </div>
                    
                    {team.bairro && (
                      <div className="mt-4 text-gray-600">
                        <span className="font-medium">Bairro:</span> {team.bairro}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* Solicitações Pendentes */}
          {activeTab === "solicitacoes" && userData.tipoUsuario === "time" && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-800">Solicitações de Entrada</h2>
              </div>

              {team?.entradasPendentes?.length > 0 ? (
                <div className="space-y-4">
                  {team.entradasPendentes.map((sol, idx) => {
                    const details = pendingDetails[sol.uid] || {};
                    const displayNome = details.nomeCompleto || sol?.nome || "Jogadora";
                    const displayPosicoes = Array.isArray(details.posicoes) && details.posicoes.length > 0
                      ? details.posicoes.join(", ")
                      : (sol?.posicao || "Não definida");

                    return (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {displayNome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{displayNome}</div>
                            <div className="text-sm text-gray-600">Posição: {displayPosicoes}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSolicitacao(sol, true)}
                            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                            title="Aprovar"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSolicitacao(sol, false)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                            title="Recusar"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma solicitação pendente</h3>
                  <p>As solicitações de entrada aparecerão aqui quando jogadoras solicitarem participar do seu time.</p>
                </div>
              )}
            </div>
          )}

          {/* Lista de Membros */}
          {(activeTab === "membros" || userData.tipoUsuario === "jogadora") && team?.membros?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold text-gray-800">Membros do Time</h2>
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                  {team.membros.length} {team.membros.length === 1 ? 'membro' : 'membros'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.membros.map((m, idx) => {
                  const details = memberDetails[m.uid] || {};
                  const displayNome = m?.nomeCompleto || details?.nomeCompleto || m?.nome || "Jogadora";
                  const isCurrentUser = m.uid === user?.uid;

                  return (
                    <div key={idx} className={`flex items-center gap-4 p-4 border border-gray-200 rounded-xl ${
                      isCurrentUser ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200' : 'hover:bg-gray-50'
                    } transition-colors`}>
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {displayNome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {displayNome}
                          {isCurrentUser && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Você</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Posição: {m?.posicao || "Não definida"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}