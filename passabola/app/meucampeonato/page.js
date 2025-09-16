"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, onSnapshot, deleteDoc } from "firebase/firestore";

export default function CriarLigaPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [ligas, setLigas] = useState([]);
  const [teamNames, setTeamNames] = useState({});
  const [editingLiga, setEditingLiga] = useState(null); 
  const [editForm, setEditForm] = useState({}); 
  const [form, setForm] = useState({
    nome: "",
    local: "",
    data: "",
    modalidade: "",
    numeroJogos: "",
    maxTimes: "",
    imagem: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        return;
      }

      setUser(currentUser);

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) setUserData(userDoc.data());

      // carregar ligas existentes
      const ligasSnapshot = await getDocs(collection(db, "ligas"));
      const listaLigas = ligasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLigas(listaLigas);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Carregar nomes dos times quando as ligas forem carregadas
  useEffect(() => {
    const loadTeamNames = async () => {
      const teamIds = new Set();
      ligas.forEach(liga => {
        if (liga.solicitacoes) {
          liga.solicitacoes.forEach(s => teamIds.add(s.teamId));
        }
      });

      for (const teamId of teamIds) {
        if (!teamNames[teamId]) {
          await fetchTeamName(teamId);
        }
      }
    };

    if (ligas.length > 0) {
      loadTeamNames();
    }
  }, [ligas, teamNames]);

  // 🔹 Buscar nome do time pelo ID
  const fetchTeamName = async (teamId) => {
    if (teamNames[teamId]) return teamNames[teamId];
    
    try {
      const teamRef = doc(db, "teams", teamId);
      const teamDoc = await getDoc(teamRef);
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const teamName = teamData.nome || "Time não encontrado";
        setTeamNames(prev => ({ ...prev, [teamId]: teamName }));
        return teamName;
      }
    } catch (error) {
      console.error("Erro ao buscar nome do time:", error);
    }
    return "Time não encontrado";
  };

  // 🔹 Converter imagem para base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // 🔹 Criar Liga
  const handleCriarLiga = async () => {
    if (!user || !userData) return;

    const hoje = new Date();
    const dataSelecionada = new Date(form.data);

    if (
      !form.nome ||
      !form.local ||
      !form.data ||
      !form.modalidade ||
      !form.numeroJogos ||
      !form.maxTimes
    ) {
      alert("Preencha todos os campos!");
      return;
    }

    if (dataSelecionada <= hoje) {
      alert("A data do campeonato deve ser posterior à data atual!");
      return;
    }

    // Converter imagem para base64 se houver
    let imagemBase64 = null;
    if (form.imagem) {
      try {
        imagemBase64 = await convertImageToBase64(form.imagem);
      } catch (error) {
        console.error("Erro ao converter imagem:", error);
        alert("Erro ao processar a imagem. Tente novamente.");
        return;
      }
    }

    const ligaId = `${user.uid}-${new Date().getTime()}`;
    const ligaRef = doc(db, "ligas", ligaId);

    await setDoc(ligaRef, {
      nome: form.nome,
      local: form.local,
      data: form.data,
      modalidade: form.modalidade,
      numeroJogos: parseInt(form.numeroJogos),
      maxTimes: parseInt(form.maxTimes),
      criador: user.uid,
      timesInscritos: [],
      solicitacoes: [], // lista de solicitações dos times
      criadoEm: new Date(),
      imagem: imagemBase64,
    });

    alert("Liga criada com sucesso!");
    setForm({ nome: "", local: "", data: "", modalidade: "", numeroJogos: "", maxTimes: "", imagem: null });

    setLigas((prev) => [
      ...prev,
      {
        id: ligaId,
        ...form,
        criador: user.uid,
        timesInscritos: [],
        solicitacoes: [],
        imagem: imagemBase64,
      },
    ]);
  };

  // Aprovar ou negar solicitação
  const handleSolicitacao = async (ligaId, teamId, aprovar) => {
    const ligaRef = doc(db, "ligas", ligaId);
    const ligaDoc = await getDoc(ligaRef);
    if (!ligaDoc.exists()) return;

    const data = ligaDoc.data();
    const solicitacoes = data.solicitacoes || [];
    const timesInscritos = data.timesInscritos || [];

    const solicitacaoIndex = solicitacoes.findIndex(s => s.teamId === teamId);
    if (solicitacaoIndex === -1) return;

    // Atualiza status da solicitação
    solicitacoes[solicitacaoIndex].status = aprovar ? "aprovado" : "negado";

    if (aprovar) {
      timesInscritos.push({ teamId });
    }

    await setDoc(ligaRef, { solicitacoes, timesInscritos }, { merge: true });
    
    // Recarregar a página após aprovar ou negar
    window.location.reload();
  };

  // 🔹 Iniciar edição de liga
  const handleEditLiga = (liga) => {
    setEditingLiga(liga.id);
    setEditForm({
      nome: liga.nome,
      local: liga.local,
      data: liga.data,
      modalidade: liga.modalidade,
      numeroJogos: liga.numeroJogos.toString(),
      maxTimes: liga.maxTimes.toString(),
      imagem: null,
      imagemAtual: liga.imagem || null,
    });
  };

  // 🔹 Cancelar edição
  const handleCancelEdit = () => {
    setEditingLiga(null);
    setEditForm({});
  };

  // 🔹 Salvar edição da liga
  const handleSaveEdit = async (ligaId) => {
    if (!user || !userData) return;

    const hoje = new Date();
    const dataSelecionada = new Date(editForm.data);

    if (
      !editForm.nome ||
      !editForm.local ||
      !editForm.data ||
      !editForm.modalidade ||
      !editForm.numeroJogos ||
      !editForm.maxTimes
    ) {
      alert("Preencha todos os campos!");
      return;
    }

    if (dataSelecionada <= hoje) {
      alert("A data do campeonato deve ser posterior à data atual!");
      return;
    }

    // Converter nova imagem para base64 se houver
    let imagemBase64 = editForm.imagemAtual; // Manter imagem atual por padrão
    if (editForm.imagem) {
      try {
        imagemBase64 = await convertImageToBase64(editForm.imagem);
      } catch (error) {
        console.error("Erro ao converter imagem:", error);
        alert("Erro ao processar a imagem. Tente novamente.");
        return;
      }
    }

    const ligaRef = doc(db, "ligas", ligaId);

    await setDoc(ligaRef, {
      nome: editForm.nome,
      local: editForm.local,
      data: editForm.data,
      modalidade: editForm.modalidade,
      numeroJogos: parseInt(editForm.numeroJogos),
      maxTimes: parseInt(editForm.maxTimes),
      atualizadoEm: new Date(),
      imagem: imagemBase64,
    }, { merge: true });

    // Atualizar estado local
    setLigas(prev => prev.map(liga => 
      liga.id === ligaId 
        ? { 
            ...liga, 
            nome: editForm.nome,
            local: editForm.local,
            data: editForm.data,
            modalidade: editForm.modalidade,
            numeroJogos: parseInt(editForm.numeroJogos),
            maxTimes: parseInt(editForm.maxTimes),
            imagem: imagemBase64,
          }
        : liga
    ));

    alert("Liga atualizada com sucesso!");
    setEditingLiga(null);
    setEditForm({});
  };

  // 🔹 Excluir liga
  const handleDeleteLiga = async (ligaId) => {
    if (!user || !userData) return;

    // Confirmação antes de excluir
    const confirmacao = window.confirm("Tem certeza que deseja excluir esta liga? Esta ação não pode ser desfeita.");
    if (!confirmacao) return;

    try {
      const ligaRef = doc(db, "ligas", ligaId);
      await deleteDoc(ligaRef);

      // Atualizar estado local removendo a liga
      setLigas(prev => prev.filter(liga => liga.id !== ligaId));

      alert("Liga excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir liga:", error);
      alert("Erro ao excluir liga. Tente novamente.");
    }
  };

  // 🔹 Bloquear acesso se não for organizador
  if (userData && userData.tipoUsuario !== "organizador") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">🚫 Acesso negado</h1>
        <p>Essa página é exclusiva para usuários do tipo <b>organizador</b>.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🏆 Criar Liga</h1>

      {/* Formulário de criação */}
      <div className="p-4 border rounded shadow mb-6">
        <input
          type="text"
          placeholder="Nome da liga"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <input
          type="text"
          placeholder="Localidade"
          value={form.local}
          onChange={(e) => setForm({ ...form, local: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <input
          type="date"
          placeholder="Data do campeonato"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="w-full border p-2 rounded mb-2"
        />
        <select
          value={form.modalidade}
          onChange={(e) => setForm({ ...form, modalidade: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        >
          <option value="">Selecione a modalidade</option>
          <option value="mata-mata">Mata-mata</option>
          <option value="pontos-corridos">Pontos corridos</option>
          <option value="grupos">Fase de grupos</option>
        </select>
        <input
          type="number"
          placeholder="Número de jogos"
          value={form.numeroJogos}
          onChange={(e) => setForm({ ...form, numeroJogos: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <input
          type="number"
          placeholder="Quantos times podem entrar"
          value={form.maxTimes}
          onChange={(e) => setForm({ ...form, maxTimes: e.target.value })}
          className="w-full border p-2 rounded mb-2"
        />
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto da Liga (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, imagem: e.target.files[0] })}
            className="w-full border p-2 rounded"
          />
          {form.imagem && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Imagem selecionada: {form.imagem.name}
            </p>
          )}
        </div>
        <button
          onClick={handleCriarLiga}
          className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2"
        >
          Criar Liga
        </button>
      </div>

      {/* Mostrar ligas criadas */}
      {ligas.length > 0 && (
        <div className="p-4 border rounded shadow">
          <h3 className="font-bold text-lg mb-2">Ligas Criadas</h3>
          {ligas.map((liga) => (
            <div key={liga.id} className="border-b py-4">
              {editingLiga === liga.id ? (
                // Modo de edição
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Editando: {liga.nome}</h4>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleSaveEdit(liga.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Nome da liga"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Localidade"
                    value={editForm.local}
                    onChange={(e) => setEditForm({ ...editForm, local: e.target.value })}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <input
                    type="date"
                    placeholder="Data do campeonato"
                    value={editForm.data}
                    onChange={(e) => setEditForm({ ...editForm, data: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <select
                    value={editForm.modalidade}
                    onChange={(e) => setEditForm({ ...editForm, modalidade: e.target.value })}
                    className="w-full border p-2 rounded mb-2"
                  >
                    <option value="">Selecione a modalidade</option>
                    <option value="mata-mata">Mata-mata</option>
                    <option value="pontos-corridos">Pontos corridos</option>
                    <option value="grupos">Fase de grupos</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Número de jogos"
                    value={editForm.numeroJogos}
                    onChange={(e) => setEditForm({ ...editForm, numeroJogos: e.target.value })}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <input
                    type="number"
                    placeholder="Quantos times podem entrar"
                    value={editForm.maxTimes}
                    onChange={(e) => setEditForm({ ...editForm, maxTimes: e.target.value })}
                    className="w-full border p-2 rounded mb-2"
                  />
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto da Liga (opcional)
                    </label>
                    {editForm.imagemAtual && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Imagem atual:</p>
                        <img 
                          src={editForm.imagemAtual} 
                          alt="Imagem atual da liga" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditForm({ ...editForm, imagem: e.target.files[0] })}
                      className="w-full border p-2 rounded"
                    />
                    {editForm.imagem && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Nova imagem selecionada: {editForm.imagem.name}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {liga.imagem && (
                          <img 
                            src={liga.imagem} 
                            alt={`Imagem da liga ${liga.nome}`} 
                            className="w-24 h-24 object-cover rounded border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p><b>Nome:</b> {liga.nome}</p>
                          <p><b>Local:</b> {liga.local}</p>
                          <p><b>Data:</b> {liga.data}</p>
                          <p><b>Modalidade:</b> {liga.modalidade}</p>
                          <p><b>Número de jogos:</b> {liga.numeroJogos}</p>
                          <p><b>Máximo de times:</b> {liga.maxTimes}</p>
                          <p><b>Times inscritos:</b> {liga.timesInscritos.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-x-2 ml-4">
                      <button
                        onClick={() => handleEditLiga(liga)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteLiga(liga.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Solicitações dos times */}
              {liga.solicitacoes && liga.solicitacoes.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Solicitações de entrada:</p>
                  {liga.solicitacoes.map((s) => (
                    <div key={s.teamId} className="flex justify-between items-center mt-1">
                      <span>{teamNames[s.teamId] || "Carregando..."} - {s.status}</span>
                      {s.status === "pendente" && (
                        <div>
                          <button
                            onClick={() => handleSolicitacao(liga.id, s.teamId, true)}
                            className="bg-green-600 text-white px-2 py-1 rounded mr-1"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleSolicitacao(liga.id, s.teamId, false)}
                            className="bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Negar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
