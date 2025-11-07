"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowRight,
  Upload,
  X,
  Clock,
  Star,
  Zap,
  Crown,
  AlertCircle,
  LogIn
} from "lucide-react";
import Link from "next/link";

// Planos com os links diretos do Stripe
const PLANOS = [
  {
    id: "basico",
    stripeProductId: "prod_TCknowAGGOneRCC",
    stripePriceId: "price_15F8BHK6QT4n2pFM1jkw4M",
    stripeLink: "https://buy.stripe.com/test_28EfZh1ZnbNagzj17l4ko00", // ✅ LINK DO BASIC
    nome: "Plano Básico",
    preco: 29.90,
    descricao: "Ideal para campeonatos locais",
    beneficios: [
      "Até 8 times participantes",
      "Sistema de grupos básico", 
      "Suporte por email",
      "Relatórios simples"
    ],
    popular: false,
    icone: <Star className="w-6 h-6" />
  },
  {
    id: "profissional",
    stripeProductId: "prod_TC069FE42dV103",
    stripePriceId: "price_15F32HNK40T4n2p7niVj6oE",
    stripeLink: "https://buy.stripe.com/test_6oU14nbzX6sQ3Mx5nB4ko01", // ✅ LINK DO PRO
    nome: "Plano Profissional", 
    preco: 79.90,
    descricao: "Perfeito para campeonatos regionais",
    beneficios: [
      "Até 16 times participantes",
      "Sistema completo de mata-mata",
      "Suporte prioritário", 
      "Relatórios detalhados",
      "Certificados digitals"
    ],
    popular: true,
    icone: <Zap className="w-6 h-6" />
  },
  {
    id: "premium",
    stripeProductId: "AGUARDANDO",
    stripePriceId: "AGUARDANDO",
    stripeLink: "https://buy.stripe.com/test_dRm9ATgUhcReaaV9DR4ko02", // ✅ LINK DO PREMIUM
    nome: "Plano Premium",
    preco: 149.90,
    descricao: "Para campeonatos de alto nível",
    beneficios: [
      "Times ilimitados",
      "Todos os sistemas disponíveis",
      "Suporte 24/7",
      "Analytics avançados", 
      "Promoção na plataforma",
      "Área personalizada"
    ],
    popular: false,
    icone: <Crown className="w-6 h-6" />
  }
];

export default function CriarCampeonatoPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [etapa, setEtapa] = useState(1);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagamentoProcessando, setPagamentoProcessando] = useState(false);
  const [acessoPermitido, setAcessoPermitido] = useState(false);

  // Dados do campeonato
  const [dadosCampeonato, setDadosCampeonato] = useState({
    nome: "",
    descricao: "",
    tipo: "pontos-corridos", 
    modalidade: "campo",
    categoria: "amador",
    dataInicio: "",
    dataFim: "", 
    local: "",
    maxTimes: 8,
    premiacao: "",
    regras: "",
    imagem: null
  });

  // Verifica usuário logado e tipo de usuário
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, "users", u.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            
            // Verificar se é Organizador
            if (userData.tipoUsuario === "organizador") {
              setAcessoPermitido(true);
            } else {
              setAcessoPermitido(false);
            }
          } else {
            setAcessoPermitido(false);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setAcessoPermitido(false);
        }
      } else {
        setAcessoPermitido(false);
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosCampeonato(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarEtapa1 = () => {
    const { nome, descricao, dataInicio, dataFim, local } = dadosCampeonato;
    return nome && descricao && dataInicio && dataFim && local;
  };

  const avancarParaPagamento = () => {
    if (validarEtapa1()) {
      setEtapa(2);
    } else {
      alert("Preencha todos os campos obrigatórios!");
    }
  };

  // SALVAR CAMPEONATO NO FIREBASE
  const salvarCampeonatoNoFirebase = async () => {
    if (!user || !planoSelecionado) {
      throw new Error("Usuário não autenticado ou plano não selecionado");
    }

    try {
      const campeonatoData = {
        // Informações do campeonato
        ...dadosCampeonato,
        
        // Informações do criador
        criadorId: user.uid,
        criadorEmail: user.email,
        criadorNome: userData?.nomeCompleto || user.displayName || user.email?.split('@')[0] || 'Organizador',
        
        // Informações do plano
        plano: planoSelecionado.id,
        planoNome: planoSelecionado.nome,
        planoPreco: planoSeleconato.preco,
        stripeProductId: planoSelecionado.stripeProductId,
        stripePriceId: planoSelecionado.stripePriceId,
        
        // Status e metadados
        status: "ativo", // Agora inicia como ativo
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp(),
        
        // Configurações iniciais
        timesInscritos: [],
        partidas: [],
        faseAtual: "inscricoes",
        
        // URLs e identificadores
        codigoAcesso: Math.random().toString(36).substring(2, 8).toUpperCase(), // Código único de 6 caracteres
      };

      console.log("Salvando campeonato no Firebase:", campeonatoData);

      // Salvar no Firestore
      const docRef = await addDoc(collection(db, "campeonatos"), campeonatoData);
      
      console.log("Campeonato salvo com ID:", docRef.id);
      return docRef.id;

    } catch (error) {
      console.error("Erro ao salvar campeonato:", error);
      throw new Error("Erro ao salvar campeonato no banco de dados");
    }
  };

  // PROCESSAR PAGAMENTO COM LINK DIRETO DO STRIPE
  const processarPagamento = async () => {
    if (!planoSelecionado) {
      alert("Selecione um plano para continuar!");
      return;
    }

    // Verificar se tem o link do Stripe configurado
    if (!planoSelecionado.stripeLink || planoSelecionado.stripeLink === "AGUARDANDO") {
      alert("Este plano ainda não está disponível para pagamento. Selecione outro plano.");
      return;
    }

    if (!user) {
      alert("Você precisa estar logado para criar um campeonato!");
      return;
    }

    setPagamentoProcessando(true);

    try {
      console.log("Salvando campeonato no Firebase antes do pagamento...");
      
      // Primeiro salva o campeonato no Firebase
      const campeonatoId = await salvarCampeonatoNoFirebase();
      
      console.log("Campeonato salvo com sucesso! ID:", campeonatoId);
      console.log("Redirecionando para pagamento:", planoSelecionado.stripeLink);
      
      // Abrir o link do Stripe em uma nova aba
      window.open(planoSelecionado.stripeLink, '_blank', 'noopener,noreferrer');
      
      // Avançar para confirmação
      setTimeout(() => {
        setEtapa(3);
        setPagamentoProcessando(false);
      }, 2000);

    } catch (error) {
      console.error("Erro no processo de pagamento:", error);
      alert(error.message || "Erro ao processar pagamento. Tente novamente.");
      setPagamentoProcessando(false);
    }
  };

  // Função para verificar se o plano está disponível
  const isPlanoDisponivel = (plano) => {
    return plano.stripeLink && plano.stripeLink !== "AGUARDANDO";
  };

  // Página de acesso negado
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Verificando acesso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!acessoPermitido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Acesso Restrito
            </h1>
            
            <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
              {!user ? (
                "Você precisa estar logado para acessar esta página."
              ) : userData?.tipoUsuario === "time" ? (
                "Esta funcionalidade é exclusiva para Organizadores. Times e Jogadores não podem criar campeonatos."
              ) : userData?.tipoUsuario === "jogador" ? (
                "Esta funcionalidade é exclusiva para Organizadores. Jogadores não podem criar campeonatos."
              ) : (
                "Você não tem permissão para acessar esta página."
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <LogIn className="w-5 h-5" />
                  Fazer Login
                </Link>
              ) : (
                <Link
                  href="/pages/campeonato"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Ver Campeonatos Disponíveis
                </Link>
              )}
              
              <Link
                href="/"
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Voltar para Home
              </Link>
            </div>

            {user && userData?.tipoUsuario !== "organizador" && (
              <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-200 max-w-2xl mx-auto">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Quer se tornar um Organizador?
                </h3>
                <p className="text-yellow-700 text-sm">
                  Entre em contato com nossa equipe para solicitar acesso à criação de campeonatos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Página normal para Organizadores
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Criar Campeonato
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Organize seu próprio campeonato e faça parte da comunidade
          </p>
          <div className="mt-2 text-sm text-green-600 font-medium">
            ✅ Acesso permitido para Organizador
          </div>
        </div>

        {/* Progresso */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  etapa >= step 
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {etapa > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 transition-all duration-300 ${
                    etapa > step ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-gray-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo das Etapas */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* Etapa 1: Informações do Campeonato */}
          {etapa === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações do Campeonato</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome do Campeonato */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome do Campeonato *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={dadosCampeonato.nome}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: Copa Feminina 2024"
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      name="descricao"
                      value={dadosCampeonato.descricao}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Descreva o objetivo e características do seu campeonato..."
                      required
                    />
                  </div>

                  {/* Tipo e Modalidade */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Competição *
                    </label>
                    <select
                      name="tipo"
                      value={dadosCampeonato.tipo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="pontos-corridos">Pontos Corridos</option>
                      <option value="mata-mata">Mata-Mata</option>
                      <option value="grupos-mata-mata">Grupos + Mata-Mata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Modalidade *
                    </label>
                    <select
                      name="modalidade"
                      value={dadosCampeonato.modalidade}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="campo">Campo</option>
                      <option value="salao">Salão</option>
                      <option value="society">Society</option>
                    </select>
                  </div>

                  {/* Datas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      name="dataInicio"
                      value={dadosCampeonato.dataInicio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data de Término *
                    </label>
                    <input
                      type="date"
                      name="dataFim"
                      value={dadosCampeonato.dataFim}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Local e Categoria */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Local *
                    </label>
                    <input
                      type="text"
                      name="local"
                      value={dadosCampeonato.local}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      placeholder="Cidade, Estado"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      name="categoria"
                      value={dadosCampeonato.categoria}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="amador">Amador</option>
                      <option value="semi-profissional">Semi-Profissional</option>
                      <option value="profissional">Profissional</option>
                    </select>
                  </div>

                  {/* Premiação */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Premiação
                    </label>
                    <input
                      type="text"
                      name="premiacao"
                      value={dadosCampeonato.premiacao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: R$ 5.000,00 + Troféus"
                    />
                  </div>

                  {/* Regras */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Regras e Informações Adicionais
                    </label>
                    <textarea
                      name="regras"
                      value={dadosCampeonato.regras}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Regras específicas, requisitos, etc..."
                    />
                  </div>
                </div>

                {/* Botão Avançar */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={avancarParaPagamento}
                    disabled={!validarEtapa1()}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    Escolher Plano
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Etapa 2: Escolha do Plano e Pagamento */}
          {etapa === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Escolha seu Plano</h2>
              <p className="text-gray-600 mb-8">Selecione o plano ideal para seu campeonato</p>

              {/* Cards de Planos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {PLANOS.map((plano) => (
                  <div
                    key={plano.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      planoSelecionado?.id === plano.id
                        ? "border-pink-500 bg-pink-50 shadow-lg scale-105"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    } ${plano.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''} ${
                      !isPlanoDisponivel(plano) ? 'opacity-60' : ''
                    }`}
                    onClick={() => {
                      if (isPlanoDisponivel(plano)) {
                        setPlanoSelecionado(plano);
                      }
                    }}
                  >
                    {plano.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          MAIS POPULAR
                        </span>
                      </div>
                    )}

                    {/* Indicador de disponibilidade */}
                    {!isPlanoDisponivel(plano) && (
                      <div className="absolute -top-2 -right-2">
                        <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          EM BREVE
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className="flex justify-center mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          !isPlanoDisponivel(plano) 
                            ? "bg-gray-400 text-white" 
                            : "bg-gradient-to-br from-pink-400 to-purple-500 text-white"
                        }`}>
                          {plano.icone}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{plano.nome}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-gray-800">R$</span>
                        <span className="text-4xl font-bold text-gray-800">{plano.preco.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{plano.descricao}</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plano.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {beneficio}
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                        planoSelecionado?.id === plano.id
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                          : !isPlanoDisponivel(plano)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      disabled={!isPlanoDisponivel(plano)}
                    >
                      {!isPlanoDisponivel(plano) ? "Indisponível" : 
                       planoSelecionado?.id === plano.id ? "Selecionado" : "Selecionar"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Resumo do Pedido */}
              {planoSelecionado && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo do Pedido</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{planoSelecionado.nome}</p>
                      <p className="text-sm text-gray-600">{dadosCampeonato.nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">R$ {planoSelecionado.preco.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">à vista</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEtapa(1)}
                  className="text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2 transition-colors duration-200"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                  Voltar
                </button>

                {planoSelecionado && (
                  <button
                    onClick={processarPagamento}
                    disabled={pagamentoProcessando}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {pagamentoProcessando ? (
                      <>
                        <Clock className="w-5 h-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pagar com Stripe
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Segurança */}
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">Pagamento 100% seguro via Stripe</span>
              </div>
            </div>
          )}

          {/* Etapa 3: Confirmação */}
          {etapa === 3 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Campeonato Criado com Sucesso!</h2>
              <p className="text-gray-600 text-lg mb-2">
                Seu campeonato <strong>&quot;{dadosCampeonato.nome}&quot;</strong> está ativo e pronto para receber inscrições.
              </p>
              <p className="text-gray-500 mb-8">
                Você receberá um email com todos os detalhes e instruções para gerenciar seu campeonato.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/pages/campeonato"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Ver Meus Campeonatos
                </a>
                <button
                  onClick={() => {
                    setEtapa(1);
                    setPlanoSelecionado(null);
                    setDadosCampeonato({
                      nome: "",
                      descricao: "",
                      tipo: "pontos-corridos",
                      modalidade: "campo",
                      categoria: "amador",
                      dataInicio: "",
                      dataFim: "",
                      local: "",
                      maxTimes: 8,
                      premiacao: "",
                      regras: "",
                      imagem: null
                    });
                  }}
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Criar Outro Campeonato
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}