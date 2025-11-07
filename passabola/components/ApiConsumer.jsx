"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy, Users, Calendar, TrendingUp, Loader, RefreshCw } from "lucide-react";

/**
 * Componente que consome API local (JSON)
 * Demonstra consumo de API, manipulação de DOM e eventos interativos
 */
export default function ApiConsumer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("campeonatos");
  
  // Refs para manipulação de DOM
  const containerRef = useRef(null);
  const statsRef = useRef(null);
  const titleRef = useRef(null);

  // Consumir API local (JSON)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch('/api/dados.json');
        if (!response.ok) {
          throw new Error('Erro ao carregar dados');
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        
        // Manipulação de DOM após carregar dados
        if (containerRef.current) {
          containerRef.current.classList.add('fade-in');
        }
        
        if (titleRef.current) {
          titleRef.current.style.opacity = '0';
          setTimeout(() => {
            if (titleRef.current) {
              titleRef.current.style.transition = 'opacity 0.5s ease-in';
              titleRef.current.style.opacity = '1';
            }
          }, 100);
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manipulação de DOM - Animar estatísticas quando visíveis
  useEffect(() => {
    if (data && statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-count');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      const statElements = statsRef.current.querySelectorAll('.stat-number');
      statElements.forEach((el) => observer.observe(el));

      return () => {
        statElements.forEach((el) => observer.unobserve(el));
      };
    }
  }, [data]);

  // Evento: Mudança de categoria
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    // Manipulação de DOM - Efeito visual
    if (containerRef.current) {
      containerRef.current.style.opacity = '0.5';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 0.3s ease-in';
          containerRef.current.style.opacity = '1';
        }
      }, 150);
    }
  };

  // Evento: Recarregar dados
  const handleRefresh = async () => {
    if (containerRef.current) {
      containerRef.current.style.transform = 'rotate(5deg)';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.3s ease-out';
          containerRef.current.style.transform = 'rotate(0deg)';
        }
      }, 200);
    }

    try {
      setLoading(true);
      const response = await fetch('/api/dados.json');
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
        <Loader className="h-12 w-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-600">Carregando dados da API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold">Erro: {error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  const categories = [
    { id: "campeonatos", label: "Campeonatos", icon: Trophy },
    { id: "times", label: "Times", icon: Users },
    { id: "noticias", label: "Notícias", icon: Calendar }
  ];

  return (
    <article className="w-full" ref={containerRef} itemScope itemType="https://schema.org/WebPage">
      {/* Header com manipulação de DOM */}
      <header className="mb-6" role="banner">
        <div className="flex items-center justify-between mb-4">
          <h2 
            ref={titleRef}
            className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent"
            itemProp="headline"
          >
            Dados da API Local
          </h2>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Recarregar dados"
            title="Recarregar dados"
            type="button"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </button>
        </div>

        {/* Botões de categoria - Eventos interativos */}
        <nav className="flex gap-2 flex-wrap" role="tablist">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                role="tab"
                aria-selected={selectedCategory === category.id}
                aria-controls={`tabpanel-${category.id}`}
                id={`tab-${category.id}`}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {category.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Estatísticas - Manipulação de DOM com Intersection Observer */}
      <section ref={statsRef} className="mb-8" role="region" aria-label="Estatísticas">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {data.estatisticas && Object.entries(data.estatisticas).map(([key, value]) => (
            <div
              key={key}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center"
            >
              <div className="stat-number text-2xl font-bold text-pink-600">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </div>
              <div className="text-xs text-gray-600 mt-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conteúdo dinâmico baseado na categoria selecionada */}
      <section 
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        role="region"
        aria-labelledby={`tab-${selectedCategory}`}
        id={`tabpanel-${selectedCategory}`}
      >
        {selectedCategory === "campeonatos" && data.campeonatos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.campeonatos.map((campeonato) => (
              <article
                key={campeonato.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => {
                  // Evento: Click no card
                  alert(`Campeonato: ${campeonato.nome}\nStatus: ${campeonato.status}`);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alert(`Campeonato: ${campeonato.nome}\nStatus: ${campeonato.status}`);
                  }
                }}
                aria-label={`Ver detalhes do campeonato ${campeonato.nome}`}
              >
                <h3 className="font-bold text-gray-800 mb-2">{campeonato.nome}</h3>
                <p className="text-sm text-gray-600 mb-3">{campeonato.descricao}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <time dateTime={campeonato.dataInicio}>{campeonato.dataInicio}</time>
                  <span aria-hidden="true"> - </span>
                  <time dateTime={campeonato.dataFim}>{campeonato.dataFim}</time>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedCategory === "times" && data.times && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.times.map((time) => (
              <article
                key={time.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => {
                  // Evento: Click no card
                  alert(`Time: ${time.nome}\nMembros: ${time.membros}`);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alert(`Time: ${time.nome}\nMembros: ${time.membros}`);
                  }
                }}
                aria-label={`Ver detalhes do time ${time.nome}`}
              >
                <h3 className="font-bold text-gray-800 mb-2">{time.nome}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {time.cidade}, {time.estado} • {time.categoria}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  <span>{time.membros} membros</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {selectedCategory === "noticias" && data.noticias && (
          <div className="space-y-4">
            {data.noticias.map((noticia) => (
              <article
                key={noticia.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => {
                  // Evento: Click na notícia
                  alert(`Notícia: ${noticia.titulo}\nCategoria: ${noticia.categoria}`);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    alert(`Notícia: ${noticia.titulo}\nCategoria: ${noticia.categoria}`);
                  }
                }}
                aria-label={`Ver detalhes da notícia ${noticia.titulo}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{noticia.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2">{noticia.resumo}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full" role="status">
                        {noticia.categoria}
                      </span>
                      <time dateTime={noticia.data}>{noticia.data}</time>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-count {
          animation: countUp 1s ease-out;
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </article>
  );
}

