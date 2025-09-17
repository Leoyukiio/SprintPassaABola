"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MeuCampeonatoPage() {
  const [ligas, setLigas] = useState([]);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLiga, setSelectedLiga] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "pontos-corridos",
    premiacao: "",
    dataInicio: "",
    dataFim: "",
    maxTimes: 20,
    imagem: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Carrega campeonatos do organizador logado
  useEffect(() => {
    if (!user) return;
    const fetchLigas = async () => {
      const querySnapshot = await getDocs(collection(db, "ligas"));
      setLigas(
        querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((liga) => liga.organizadorId === user.uid)
      );
    };
    fetchLigas();
  }, [user]);

  // Aprovar ou negar solicitação
  const handleSolicitacao = async (ligaId, solicitacao, aprovar) => {
    const ligaRef = doc(db, "ligas", ligaId);
    const novasSolicitacoes = ligas
      .find((l) => l.id === ligaId)
      .solicitacoes.map((s) =>
        s.teamId === solicitacao.teamId ? { ...s, status: aprovar ? "aprovado" : "negado" } : s
      );

    const atualizacoes = {
      solicitacoes: novasSolicitacoes,
    };

    if (aprovar) {
      atualizacoes.timesInscritos = arrayUnion({
        teamId: solicitacao.teamId,
        nome: solicitacao.nome,
        escudo: solicitacao.escudo,
      });
    }

    await updateDoc(ligaRef, atualizacoes);

    setLigas((prev) =>
      prev.map((l) =>
        l.id === ligaId ? { ...l, solicitacoes: novasSolicitacoes } : l
      )
    );
  };

  // Abrir modal de edição
  const openEditModal = (liga) => {
    setSelectedLiga(liga);
    setFormData({
      nome: liga.nome || "",
      descricao: liga.descricao || "",
      tipo: liga.tipo || "pontos-corridos",
      premiacao: liga.premiacao || "",
      dataInicio: liga.dataInicio || "",
      dataFim: liga.dataFim || "",
      maxTimes: liga.maxTimes || 20,
      imagem: liga.imagem || "",
    });
    setShowEditModal(true);
  };

  // Abrir modal de exclusão
  const openDeleteModal = (liga) => {
    setSelectedLiga(liga);
    setShowDeleteModal(true);
  };

  // Criar novo campeonato
  const criarCampeonato = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Validação de datas
    const hoje = new Date().toISOString().split('T')[0];
    if (formData.dataInicio < hoje) {
      alert("A data de início deve ser a partir de hoje!");
      return;
    }
    
    if (formData.dataFim && formData.dataFim < formData.dataInicio) {
      alert("A data de término deve ser após a data de início!");
      return;
    }
    
    setLoading(true);
    
    try {
      const novaLeague = {
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo,
        premiacao: formData.premiacao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        maxTimes: parseInt(formData.maxTimes),
        organizadorId: user.uid,
        organizadorNome: user.displayName || user.email,
        timesInscritos: [],
        solicitacoes: [],
        status: "ativo",
        criadoEm: serverTimestamp(),
        imagem: formData.imagem || null,
      };

      const docRef = await addDoc(collection(db, "ligas"), novaLeague);
      
      // Atualiza a lista de ligas
      setLigas([...ligas, { id: docRef.id, ...novaLeague }]);
      
      // Fecha o modal e limpa o formulário
      setShowCreateModal(false);
      setFormData({
        nome: "",
        descricao: "",
        tipo: "pontos-corridos",
        premiacao: "",
        dataInicio: "",
        dataFim: "",
        maxTimes: 20,
        imagem: "",
      });
      
      alert("Campeonato criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar campeonato:", error);
      alert("Erro ao criar campeonato. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Editar campeonato existente
  const editarCampeonato = async (e) => {
    e.preventDefault();
    if (!user || !selectedLiga) return;
    
    // Validação de datas
    const hoje = new Date().toISOString().split('T')[0];
    if (formData.dataInicio < hoje) {
      alert("A data de início deve ser a partir de hoje!");
      return;
    }
    
    if (formData.dataFim && formData.dataFim < formData.dataInicio) {
      alert("A data de término deve ser após a data de início!");
      return;
    }
    
    setLoading(true);
    
    try {
      const ligaAtualizada = {
        nome: formData.nome,
        descricao: formData.descricao,
        tipo: formData.tipo,
        premiacao: formData.premiacao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        maxTimes: parseInt(formData.maxTimes),
        imagem: formData.imagem || null,
        editadoEm: serverTimestamp(),
      };

      const ligaRef = doc(db, "ligas", selectedLiga.id);
      await updateDoc(ligaRef, ligaAtualizada);
      
      // Atualiza a lista de ligas
      setLigas(ligas.map(liga => 
        liga.id === selectedLiga.id 
          ? { ...liga, ...ligaAtualizada } 
          : liga
      ));
      
      // Fecha o modal e limpa o formulário
      setShowEditModal(false);
      setSelectedLiga(null);
      setFormData({
        nome: "",
        descricao: "",
        tipo: "pontos-corridos",
        premiacao: "",
        dataInicio: "",
        dataFim: "",
        maxTimes: 20,
        imagem: "",
      });
      
      alert("Campeonato atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar campeonato:", error);
      alert("Erro ao editar campeonato. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Excluir campeonato
  const excluirCampeonato = async () => {
    if (!user || !selectedLiga) return;
    
    setLoading(true);
    
    try {
      // Excluir documento do Firestore
      const ligaRef = doc(db, "ligas", selectedLiga.id);
      await deleteDoc(ligaRef);
      
      // Atualiza a lista de ligas
      setLigas(ligas.filter(liga => liga.id !== selectedLiga.id));
      
      // Fecha o modal
      setShowDeleteModal(false);
      setSelectedLiga(null);
      
      alert("Campeonato excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir campeonato:", error);
      alert("Erro ao excluir campeonato. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Calcula a data mínima (hoje) para o campo de data de início
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Calcula a data mínima para o campo de data de término (dataInicio + 1 dia)
  const getMinEndDate = () => {
    if (!formData.dataInicio) return getTodayDate();
    
    const nextDay = new Date(formData.dataInicio);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Campeonatos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <span className="mr-2">+</span> Criar Campeonato
        </button>
      </div>

      {ligas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow border">
          <p className="text-gray-600 mb-4">Você ainda não criou nenhum campeonato.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Criar Primeiro Campeonato
          </button>
        </div>
      ) : (
        ligas.map((liga) => (
          <div
            key={liga.id}
            className="border p-4 rounded-xl shadow mb-4 bg-white relative"
          >
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => openEditModal(liga)}
                className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200"
                title="Editar campeonato"
              >
                Editar
              </button>
              <button
                onClick={() => openDeleteModal(liga)}
                className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200"
                title="Excluir campeonato"
              >
                Excluir
              </button>
            </div>
            
            <div className="flex items-start">
              {liga.imagem && (
                <img
                  src={liga.imagem}
                  alt={liga.nome}
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                />
              )}
              <div className="flex-1 text-gray-800">
                <h2 className="text-lg font-semibold tex">{liga.nome}</h2>
                <p className="text-sm text-gray-600">{liga.descricao}</p>
                
                <div className="flex flex-wrap mt-2 text-sm text-gray-500">
                  <span className="mr-4 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {liga.tipo === "pontos-corridos" ? "Pontos Corridos" : "Mata-Mata"}
                  </span>
                  <span className="mr-4 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {liga.timesInscritos?.length || 0}/{liga.maxTimes} times
                  </span>
                  {liga.premiacao && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {liga.premiacao}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {liga.dataInicio && (
                    <span>Início: {new Date(liga.dataInicio).toLocaleDateString('pt-BR')}</span>
                  )}
                  {liga.dataFim && (
                    <span className="ml-3">Término: {new Date(liga.dataFim).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
            </div>

            <h3 className="mt-3 font-semibold text-gray-800">Solicitações de Participação</h3>
            {liga.solicitacoes?.length > 0 ? (
              liga.solicitacoes.map((s) => (
                <div
                  key={s.teamId}
                  className="flex justify-between items-center mt-2 p-2 bg-gray-50 rounded border"
                >
                  <div className="flex items-center space-x-3">
                    {s.escudo && (
                      <img
                        src={s.escudo}
                        alt={s.nome}
                        className="w-10 h-10 object-cover rounded-full border"
                      />
                    )}
                    <span>
                      <b>{s.nome}</b> — <span className={`${s.status === 'pendente' ? 'text-yellow-600' : s.status === 'aprovado' ? 'text-green-600' : 'text-red-600'}`}>{s.status}</span>
                    </span>
                  </div>

                  {s.status === "pendente" && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleSolicitacao(liga.id, s, true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                      Aprovar
                      </button>
                      <button
                        onClick={() => handleSolicitacao(liga.id, s, false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                       Negar
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm mt-1">
                Nenhuma solicitação no momento.
              </p>
            )}
          </div>
        ))
      )}

      {/* Modal de Criação de Campeonato */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Criar Novo Campeonato</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={criarCampeonato}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Nome do Campeonato *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    URL da Imagem do Campeonato
                  </label>
                  <input
                    type="url"
                    name="imagem"
                    value={formData.imagem}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cole a URL de uma imagem para o campeonato (opcional)</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Tipo de Campeonato *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="pontos-corridos">Pontos Corridos</option>
                    <option value="mata-mata">Mata-Mata</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Premiação
                  </label>
                  <input
                    type="text"
                    name="premiacao"
                    value={formData.premiacao}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Troféu + R$ 1000,00"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleInputChange}
                      min={getMinEndDate()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Número Máximo de Times *
                  </label>
                  <input
                    type="number"
                    name="maxTimes"
                    value={formData.maxTimes}
                    onChange={handleInputChange}
                    min="2"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">⏳</span> Criando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✅</span> Criar Campeonato
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Campeonato */}
      {showEditModal && selectedLiga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Editar Campeonato</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLiga(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={editarCampeonato}>
                <div className="mb-4">
                  <label className="block text-gray-800 text-sm font-medium mb-1">
                    Nome do Campeonato *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    URL da Imagem do Campeonato
                  </label>
                  <input
                    type="url"
                    name="imagem"
                    value={formData.imagem}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cole a URL de uma imagem para o campeonato (opcional)</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Tipo de Campeonato *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="pontos-corridos">Pontos Corridos</option>
                    <option value="mata-mata">Mata-Mata</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Premiação
                  </label>
                  <input
                    type="text"
                    name="premiacao"
                    value={formData.premiacao}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Troféu + R$ 1000,00"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                      min={getTodayDate()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleInputChange}
                      min={getMinEndDate()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Número Máximo de Times *
                  </label>
                  <input
                    type="number"
                    name="maxTimes"
                    value={formData.maxTimes}
                    onChange={handleInputChange}
                    min="2"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedLiga(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">⏳</span> Atualizando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span> Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && selectedLiga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-red-600">Excluir Campeonato</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLiga(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Tem certeza que deseja excluir o campeonato <strong>"{selectedLiga.nome}"</strong>?
                </p>
                <p className="text-sm text-red-600">
                  Esta ação não pode ser desfeita. Todos os dados do campeonato serão perdidos.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLiga(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={excluirCampeonato}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <span className="mr-2">⏳</span> Excluindo...
                    </>
                  ) : (
                    <>
                     Excluir Campeonato
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}