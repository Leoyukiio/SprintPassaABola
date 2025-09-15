"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    title: "KIN SAITO",
    subtitle: "FALA, BEBE - 2ª",
    description: "O melhor conteúdo sobre futebol feminino brasileiro",
    image: "/images/noticias/marta.jpg",
    gradient: "from-pink-500 to-purple-600"
  },
  {
    id: 2,
    title: "CORINTHIANS",
    subtitle: "CAMPEÃO 2024",
    description: "Corinthians Feminino conquista mais um título histórico",
    image: "/images/noticias/renovacao.jpeg",
    gradient: "from-purple-500 to-blue-600"
  },
  {
    id: 3,
    title: "SELEÇÃO BRASILEIRA",
    subtitle: "RUMO À COPA",
    description: "Preparação intensiva para os próximos desafios",
    image: "/images/noticias/marta.jpg",
    gradient: "from-green-500 to-yellow-500"
  }
];

export default function NewsCarousel() {
  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className={`relative w-full h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center`}>
              {/* Overlay escuro */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              {/* Imagem de fundo */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              
              {/* Conteúdo do slide */}
              <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                <div className="mb-4">
                  <span className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    {slide.subtitle}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                  {slide.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botões de navegação customizados */}
      <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20 group">
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      
      <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20 group">
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Indicadores de slide */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 bg-white bg-opacity-50 rounded-full transition-all duration-300 hover:bg-opacity-80"
          ></div>
        ))}
      </div>
    </div>
  );
}
