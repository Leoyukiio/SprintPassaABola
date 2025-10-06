"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

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
      // Validar data de nascimento
      if (profile.dataNascimento) {
        const dataNascimento = new Date(profile.dataNascimento);
        const dataAtual = new Date();
        
        if (dataNascimento >= dataAtual) {
          alert("A data de nascimento deve ser anterior ao ano atual!");
          return;
        }
      }

      const userDocRef = doc(db, "users", user.uid);

      if (profile.email && profile.email !== user.email) {
        await updateEmail(user, profile.email);
      }

      if (novaSenha.length > 0) {
        await updatePassword(user, novaSenha);
        setNovaSenha("");
      }

      await setDoc(userDocRef, { ...profile, photoBase64: photoURL }, { merge: true });
      alert("Perfil atualizado com sucesso!");
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Configurações</h1>

        {/* Foto */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            <img 
              src={photoURL} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover"
            />
          </div>
          <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          <label htmlFor="photo-upload" className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors">
            Alterar foto
          </label>
        </div>

        {/* Nome completo */}
        <input 
          type="text" 
          placeholder="Nome completo" 
          value={profile.nomeCompleto || ""} 
          onChange={(e) => setProfile({ ...profile, nomeCompleto: e.target.value })} 
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500" 
        />

        {/* Data de nascimento */}
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
          className="w-full bg-gray-800 border border-gray-600 text-white p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500" 
        />

        {/* CPF */}
        <input 
          type="text" 
          placeholder="CPF" 
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
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
        />

        {/* Telefone */}
        <input 
          type="tel" 
          placeholder="Telefone (opcional)" 
          value={profile.telefone || ""} 
          onChange={(e) => setProfile({ ...profile, telefone: e.target.value })} 
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500" 
        />

        {/* Tipo de usuário */}
        <select 
          value={profile.tipoUsuario || ""} 
          onChange={(e) => setProfile({ ...profile, tipoUsuario: e.target.value })} 
          className="w-full bg-gray-800 border border-gray-600 text-white p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
        >
          <option value="">Selecione seu perfil</option>
          <option value="jogadora">Jogadora</option>
          <option value="organizador">Organizador</option>
          <option value="time">Time</option>
        </select>

        {/* 🔹 Se for jogadora */}
        {profile.tipoUsuario === "jogadora" && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-white">Modalidade de jogo</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              {["Campo", "Salão", "Society"].map((modalidade) => (
                <label key={modalidade} className="flex items-center text-white">
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
                    className="mr-2 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  /> {modalidade}
                </label>
              ))}
            </div>

            <h3 className="font-semibold mb-3 text-white">Posição</h3>
            <div className="flex flex-wrap gap-4">
              {["Goleira", "Zagueira", "Lateral", "Meio-campo", "Atacante"].map((posicao) => (
                <label key={posicao} className="flex items-center text-white">
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
                    className="mr-2 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  /> {posicao}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* CEP */}
        <input 
          type="text" 
          placeholder="CEP" 
          value={profile.cep || ""} 
          onChange={(e) => setProfile({ ...profile, cep: e.target.value.replace(/\D/g, "").slice(0, 8) })} 
          onBlur={handleCepBlur} 
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500" 
        />

        {/* Endereço */}
        <input 
          type="text" 
          placeholder="Endereço" 
          value={profile.endereco || ""} 
          onChange={(e) => setProfile({ ...profile, endereco: e.target.value })} 
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500" 
        />

        {/* Email */}
        <input 
          type="email" 
          placeholder="Novo e-mail" 
          value={profile.email || ""} 
          onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-4 focus:outline-none focus:border-blue-500" 
        />

        {/* Nova senha */}
        <input 
          type="password" 
          placeholder="Nova senha" 
          value={novaSenha} 
          onChange={(e) => setNovaSenha(e.target.value)} 
          className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-4 rounded-lg mb-6 focus:outline-none focus:border-blue-500" 
        />

        {/* Botão salvar */}
        <button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full font-medium transition-colors mb-4"
        >
          Salvar alterações
        </button>

        {/* Apagar conta */}
        <button
          onClick={async () => {
            if (!user) return;
            const confirmar = confirm("Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita.");
            if (!confirmar) return;
            try {
              await deleteDoc(doc(db, "users", user.uid));
              await deleteUser(user);
              alert("Conta apagada com sucesso.");
              window.location.href = "/";
            } catch (error) {
              alert("Não foi possível apagar a conta. Faça login novamente e tente de novo.");
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg w-full font-medium transition-colors"
        >
          Apagar conta
        </button>
      </div>
    </div>
  );
}
