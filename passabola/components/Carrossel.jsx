"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectFade } from "swiper/modules";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useState } from "react";

const slides = [
  {
    id: 1,
    title: "FUTEBOL FEMININO",
    subtitle: "Tudo Sobre o Futebol Feminino",
    description: "O melhor conteúdo sobre futebol feminino brasileiro e mundial",
    image: "/images/noticias/marta.jpg",
    gradient: "from-pink-500/90 to-purple-600/90",
    badge: "Destaque",
    cta: "Saiba Mais"
  },
  {
    id: 2,
    title: "CORINTHIANS",
    subtitle: "CAMPEÃO 2024",
    description: "Corinthians Feminino conquista mais um título histórico com campanha invicta",
    image: "/images/noticias/renovacao.jpeg",
    gradient: "from-purple-500/90 to-blue-600/90",
    badge: "Campeão",
    cta: "Ver Detalhes"
  },
  {
    id: 3,
    title: "SELEÇÃO BRASILEIRA",
    subtitle: "RUMO À COPA",
    description: "Preparação intensiva para os próximos desafios internacionais",
    image: "/images/noticias/marta.jpg",
    gradient: "from-orange-500/90 to-red-600/90",
    badge: "Seleção",
    cta: "Acompanhar"
  },
  {
    id: 4,
    title: "NOVOS TALENTOS",
    subtitle: "REVELAÇÕES 2024",
    description: "Conheça as jovens promessas que estão brilhando no cenário nacional",
    image: "/images/noticias/renovacao.jpeg",
    gradient: "from-green-500/90 to-teal-600/90",
    badge: "Revelação",
    cta: "Descobrir"
  }
];

export default function NewsCarousel() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const toggleAutoplay = () => {
    if (swiperInstance) {
      if (isPlaying) {
        swiperInstance.autoplay.stop();
      } else {
        swiperInstance.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden rounded-3xl shadow-2xl group">
      <Swiper
        modules={[Navigation, Autoplay, Pagination, EffectFade]}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination-custom',
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        speed={1000}
        loop={true}
        className="h-full"
        onSwiper={setSwiperInstance}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Imagem de fundo com overlay gradiente */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 swiper-image"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              />
              
              {/* Overlay gradiente */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}></div>
              
              {/* Conteúdo do slide */}
              <div className="relative z-10 text-center text-white px-6 max-w-6xl mx-auto">
                <div className="mb-6">
                  <span className="inline-block bg-white/20 backdrop-blur-lg border border-white/30 px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg">
                    {slide.subtitle}
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-none">
                  <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
                    {slide.title}
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl lg:text-3xl font-light max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-lg">
                  {slide.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <span className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg">
                    ⭐ {slide.badge}
                  </span>
                  
                  <button className="group/btn bg-white/20 backdrop-blur-lg border-2 border-white/40 hover:bg-white/30 hover:border-white/60 text-white px-8 py-3 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <span className="flex items-center gap-2">
                      {slide.cta}
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Decoração - Partículas */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-10 right-10 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botões de navegação customizados */}
      <button className="swiper-button-prev-custom absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-white/40 rounded-2xl p-4 transition-all duration-300 z-20 group/btn opacity-0 group-hover:opacity-100">
        <ChevronLeft className="w-7 h-7 text-white group-hover/btn:scale-110 transition-transform" />
      </button>
      
      <button className="swiper-button-next-custom absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-white/40 rounded-2xl p-4 transition-all duration-300 z-20 group/btn opacity-0 group-hover:opacity-100">
        <ChevronRight className="w-7 h-7 text-white group-hover/btn:scale-110 transition-transform" />
      </button>

      {/* Controles inferiores */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20 bg-black/30 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/10">
        {/* Paginação customizada */}
        <div className="swiper-pagination-custom flex items-center gap-2"></div>
        
        {/* Separador */}
        <div className="w-px h-6 bg-white/30"></div>
        
        {/* Botão play/pause */}
        <button 
          onClick={toggleAutoplay}
          className="p-2 text-white hover:text-white/80 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* Indicador de slide atual */}
      <div className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/10">
        <span className="text-white text-sm font-medium">
          <span className="text-yellow-400">●</span> Destaques
        </span>
      </div>

      {/* Efeito de brilho nas bordas */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-white/10 shadow-[inset_0_0_50px_rgba(255,255,255,0.1)]"></div>
    </div>
  );
}

// Estilos CSS customizados para a paginação
<style jsx global>{`
  .swiper-pagination-bullet-custom {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    transition: all 0.3s ease;
    opacity: 0.7;
    margin: 0 4px !important;
  }

  .swiper-pagination-bullet-active-custom {
    background: #ffffff;
    width: 24px;
    opacity: 1;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .swiper-image {
    transform: scale(1.1);
    transition: transform 8s ease-out;
  }

  .swiper-slide-active .swiper-image {
    transform: scale(1);
  }

  .swiper-button-disabled {
    opacity: 0.3 !important;
    cursor: not-allowed;
  }
`}</style>