"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function MeuPerfil() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    nome: "",
    idade: "",
    cep: "",
    endereco: "",
    posicao: "Atacante",
  });
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("/images/perfil/user.jpg"); // imagem padrão

  // Carregar dados do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile(data);
          setPhotoURL(data.photoBase64 || "/images/perfil/user.jpg");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Salvar perfil no Firestore
  const handleSave = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), profile, { merge: true });
    alert("Perfil atualizado!");
  };

  // Atualizar email
  const handleUpdateEmail = async () => {
    if (!user) return;
    try {
      await updateEmail(user, newEmail);
      alert("Email atualizado!");
    } catch (err) {
      alert("Erro ao atualizar email: " + err.message);
    }
  };

  // Atualizar senha
  const handleUpdatePassword = async () => {
    if (!user) return;
    try {
      await updatePassword(user, newPassword);
      alert("Senha atualizada!");
    } catch (err) {
      alert("Erro ao atualizar senha: " + err.message);
    }
  };

  // Upload de foto como Base64
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result; // "data:image/png;base64,..."

      // Salvar no Firestore
      await setDoc(doc(db, "users", user.uid), { photoBase64: base64String }, { merge: true });

      setPhotoURL(base64String);
      alert("Foto de perfil atualizada!");
    };
    reader.readAsDataURL(file);
  };

  // Buscar endereço pelo CEP
  const handleCep = async () => {
    if (profile.cep.length !== 8) return;
    const res = await fetch(`https://viacep.com.br/ws/${profile.cep}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setProfile((prev) => ({
        ...prev,
        endereco: `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`,
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl text-center font-bold mb-4">Meu Perfil</h1>

      {/* Foto de perfil */}
      <div className="mb-6 flex flex-col items-center">
        <img
          src={photoURL}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover mb-2 border"
        />
        <label className="bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-800 transition">
          Escolher Foto
          <input
            type="file"
            onChange={handlePhotoUpload}
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>

      {/* Dados pessoais */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={profile.nome}
          onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Idade"
          value={profile.idade}
          onChange={(e) => setProfile({ ...profile, idade: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="CEP"
            value={profile.cep}
            onChange={(e) => setProfile({ ...profile, cep: e.target.value })}
            className="border p-2 rounded w-1/2"
          />
          <button
            onClick={handleCep}
            className="bg-purple-700 text-white px-4 py-2 rounded"
          >
            Buscar
          </button>
        </div>
        <input
          type="text"
          placeholder="Endereço"
          value={profile.endereco}
          onChange={(e) => setProfile({ ...profile, endereco: e.target.value })}
          className="w-full border p-2 rounded"
        />

        {/* Seletor de posição */}
        <select
          value={profile.posicao}
          onChange={(e) => setProfile({ ...profile, posicao: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="Atacante">Atacante</option>
          <option value="Meio-campo">Meio-campo</option>
          <option value="Defensora">Defensora</option>
          <option value="Goleira">Goleira</option>
        </select>

        <button
          onClick={handleSave}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Salvar Perfil
        </button>
      </div>

      {/* Configurações de conta */}
      <h2 className="text-xl font-bold mt-8 mb-4">Configurações da Conta</h2>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Novo Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleUpdateEmail}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Atualizar Email
        </button>

        <input
          type="password"
          placeholder="Nova Senha"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleUpdatePassword}
          className="w-full bg-red-600 text-white py-2 rounded"
        >
          Atualizar Senha
        </button>
      </div>
    </div>
  );
}
