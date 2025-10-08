"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { 
  User, 
  Camera, 
  Save, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Users,
  Trophy,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    nomeCompleto: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    tipoUsuario: "", // jogadora, organizador ou time
    cep: "",
    endereco: "",
    modalidades: [], // apenas se jogadora
    posicoes: [],    // apenas se jogadora
  });
  const [photoURL, setPhotoURL] = useState("/images/perfil/user.jpg");
  const [novaSenha, setNovaSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function validarCPF(cpf) {
    if (typeof cpf !== "string") return false;
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile((prev) => ({ ...prev, ...data }));
          setPhotoURL(data?.photoBase64 && data.photoBase64.length > 0 ? data.photoBase64 : "/images/perfil/user.jpg");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoURL(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCepBlur = async () => {
    const cepSomenteNumeros = (profile.cep || "").replace(/\D/g, "");
    if (cepSomenteNumeros.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepSomenteNumeros}/json/`);
      if (!response.ok) return;
      const data = await response.json();
      if (data?.erro) return;
      const logradouroBairro = [data.logradouro, data.bairro].filter(Boolean).join(" - ");
      const cidadeUf = [data.localidade, data.uf].filter(Boolean).join(" - ");
      const enderecoCompleto = [logradouroBairro, cidadeUf].filter(Boolean).join(", ");
      setProfile((prev) => ({ ...prev, endereco: enderecoCompleto }));
    } catch (error) {
      // Silencia erros de rede
    }
  };

  const handleSave = async () => {
    if (user) {
      setLoading(true);
      
      // Validar data de nascimento
      if (profile.dataNascimento) {
        const dataNascimento = new Date(profile.dataNascimento);
        const dataAtual = new Date();
        
        if (dataNascimento >= dataAtual) {
          alert("A data de nascimento deve ser anterior ao ano atual!");
          setLoading(false);
          return;
        }
      }

      try {
        const userDocRef = doc(db, "users", user.uid);

        if (profile.email && profile.email !== user.email) {
          await updateEmail(user, profile.email);
        }

        if (novaSenha.length > 0) {
          await updatePassword(user, novaSenha);
          setNovaSenha("");
        }

        await setDoc(userDocRef, { ...profile, photoBase64: photoURL }, { merge: true });
        alert("✅ Perfil atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("❌ Erro ao atualizar perfil. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      alert("✅ Conta apagada com sucesso.");
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao apagar conta:", error);
      alert("❌ Não foi possível apagar a conta. Faça login novamente e tente de novo.");
    }
  };

  const modalidadesOptions = ["Campo", "Salão", "Society"];
  const posicoesOptions = ["Goleira", "Zagueira", "Lateral", "Meio-campo", "Atacante"];

  const tipoUsuarioOptions = [
    { value: "jogadora", label: "Jogadora", icon: User },
    { value: "organizador", label: "Organizador", icon: Trophy },
    { value: "time", label: "Time", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <User className="h-10 w-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Abas de Navegação */}
        <div className="flex bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-6">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "perfil" 
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("seguranca")}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === "seguranca" 
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Segurança
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Foto e Informações Básicas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              {/* Foto de Perfil */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={photoURL} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label htmlFor="photo-upload" className="absolute bottom-2 right-2 bg-white text-pink-600 p-2 rounded-full cursor-pointer hover:bg-pink-50 transition-colors shadow-lg">
                    <Camera className="h-4 w-4" />
                  </label>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    className="hidden" 
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{profile.nomeCompleto || "Usuário"}</h2>
                <p className="text-gray-600 text-sm capitalize">
                  {profile.tipoUsuario || "Não definido"}
                </p>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm truncate">{profile.email}</span>
                  </div>
                )}
                {profile.telefone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{profile.telefone}</span>
                  </div>
                )}
                {profile.endereco && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm truncate">{profile.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Aba Perfil */}
            {activeTab === "perfil" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações Pessoais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome completo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input 
                      type="text" 
                      placeholder="Seu nome completo" 
                      value={profile.nomeCompleto || ""} 
                      onChange={(e) => setProfile({ ...profile, nomeCompleto: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                    />
                  </div>

                  {/* Data de nascimento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Data de Nascimento
                    </label>
                    <input 
                      type="date" 
                      value={profile.dataNascimento || ""} 
                      onChange={(e) => {
                        const dataSelecionada = e.target.value;
                        if (dataSelecionada) {
                          const dataNascimento = new Date(dataSelecionada);
                          const dataAtual = new Date();
                          
                          if (dataNascimento >= dataAtual) {
                            alert("A data de nascimento deve ser anterior ao ano atual!");
                            return;
                          }
                        }
                        setProfile({ ...profile, dataNascimento: dataSelecionada });
                      }} 
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                    />
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CPF
                    </label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00" 
                      value={profile.cpf || ""} 
                      maxLength={14}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        value = value.replace(/^(\d{3})(\d)/, "$1.$2");
                        value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
                        value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
                        setProfile({ ...profile, cpf: value });
                      }}
                      onBlur={(e) => {
                        const cpf = e.target.value.replace(/\D/g, "");
                        if (cpf.length === 11 && !validarCPF(cpf)) {
                          alert("CPF inválido. Por favor, verifique.");
                          setProfile({ ...profile, cpf: "" });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Telefone
                    </label>
                    <input 
                      type="tel" 
                      placeholder="(00) 00000-0000" 
                      value={profile.telefone || ""} 
                      onChange={(e) => setProfile({ ...profile, telefone: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                    />
                  </div>

                  {/* Tipo de usuário */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Usuário *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tipoUsuarioOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <label 
                            key={option.value}
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              profile.tipoUsuario === option.value
                                ? "border-pink-500 bg-pink-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="tipoUsuario"
                              value={option.value}
                              checked={profile.tipoUsuario === option.value}
                              onChange={(e) => setProfile({ ...profile, tipoUsuario: e.target.value })}
                              className="hidden"
                            />
                            <Icon className="h-5 w-5 text-pink-500" />
                            <span className="font-medium text-gray-800">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* CEP e Endereço */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      CEP
                    </label>
                    <input 
                      type="text" 
                      placeholder="00000-000" 
                      value={profile.cep || ""} 
                      onChange={(e) => setProfile({ ...profile, cep: e.target.value.replace(/\D/g, "").slice(0, 8) })} 
                      onBlur={handleCepBlur} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input 
                      type="text" 
                      placeholder="Seu endereço completo" 
                      value={profile.endereco || ""} 
                      onChange={(e) => setProfile({ ...profile, endereco: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                    />
                  </div>
                </div>

                {/* 🔹 Se for jogadora */}
                {profile.tipoUsuario === "jogadora" && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferências Esportivas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Modalidades */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Modalidades de Jogo
                        </label>
                        <div className="space-y-2">
                          {modalidadesOptions.map((modalidade) => (
                            <label key={modalidade} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <input
                                type="checkbox"
                                checked={profile.modalidades?.includes(modalidade) || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  let novasModalidades = profile.modalidades || [];
                                  if (checked) novasModalidades = [...novasModalidades, modalidade];
                                  else novasModalidades = novasModalidades.filter((m) => m !== modalidade);
                                  setProfile({ ...profile, modalidades: novasModalidades });
                                }}
                                className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                              />
                              <span className="text-gray-800 font-medium">{modalidade}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Posições */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Posições
                        </label>
                        <div className="space-y-2">
                          {posicoesOptions.map((posicao) => (
                            <label key={posicao} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <input
                                type="checkbox"
                                checked={profile.posicoes?.includes(posicao) || false}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  let novasPosicoes = profile.posicoes || [];
                                  if (checked) novasPosicoes = [...novasPosicoes, posicao];
                                  else novasPosicoes = novasPosicoes.filter((p) => p !== posicao);
                                  setProfile({ ...profile, posicoes: novasPosicoes });
                                }}
                                className="w-4 h-4 text-pink-600 bg-white border-gray-300 rounded focus:ring-pink-500"
                              />
                              <span className="text-gray-800 font-medium">{posicao}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Aba Segurança */}
            {activeTab === "seguranca" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações de Segurança</h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Alterar E-mail
                    </label>
                    <input 
                      type="email" 
                      placeholder="novo@email.com" 
                      value={profile.email || ""} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent" 
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Um e-mail de confirmação será enviado para o novo endereço
                    </p>
                  </div>

                  {/* Nova senha */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Shield className="h-4 w-4 inline mr-1" />
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Digite sua nova senha" 
                        value={novaSenha} 
                        onChange={(e) => setNovaSenha(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Deixe em branco para manter a senha atual
                    </p>
                  </div>

                  {/* Botão Salvar Segurança */}
                  <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Atualizar Segurança
                      </>
                    )}
                  </button>

                  {/* Apagar Conta */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">Zona de Perigo</h3>
                    <p className="text-gray-600 mb-4">
                      Ao apagar sua conta, todos os seus dados serão permanentemente removidos. 
                      Esta ação não pode ser desfeita.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                      <Trash2 className="h-5 w-5" />
                      Apagar Minha Conta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-600">Apagar Conta</h2>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Tem certeza absoluta que deseja apagar sua conta?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700 font-semibold">
                    ⚠️ Todos os seus dados serão perdidos permanentemente:
                  </p>
                  <ul className="text-sm text-red-600 mt-2 space-y-1">
                    <li>• Perfil e informações pessoais</li>
                    <li>• Times e campeonatos associados</li>
                    <li>• Histórico de participações</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Apagar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}