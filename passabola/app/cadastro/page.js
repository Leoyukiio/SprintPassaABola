"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; //TODO: Esta dando erro para linkar o firebase com a pagina de cadastro
import { auth, db } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const [etapa, setEtapa] = useState(1);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [tipo, setTipo] = useState("Jogador");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cep, setCep] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleEtapa1 = (e) => {
    e.preventDefault();
    if (!nome || !idade || !tipo) {
      setError("Preencha todos os campos!");
      return;
    }
    setError("");
    setEtapa(2);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Cria usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;

      // Cria perfil no Firestore
      await setDoc(doc(db, "users", user.uid), {
        nome,
        idade,
        tipo,
        email,
        cep,
        cpf,
        telefone,
        criadoEm: new Date(),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar usuário. Verifique os dados.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-purple-800 p-8 rounded-2xl shadow-lg">
        {etapa === 1 && (
          <form onSubmit={handleEtapa1} className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-white mb-6">
              Cadastro - Etapa 1
            </h1>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Idade"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
            >
              <option>Jogador</option>
              <option>Time</option>
              <option>Organizador</option>
            </select>
            {error && <p className="text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Próxima Etapa
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={handleCadastro} className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-white mb-6">
              Cadastro - Etapa 2
            </h1>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="CEP"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg focus:outline-none"
              required
            />
            {error && <p className="text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Finalizar Cadastro
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
