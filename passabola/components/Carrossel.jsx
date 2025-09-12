"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules"; 

const news = [
  { 
    title: "Em fase de renovação, Seleção Brasileira de futebol feminino se despede da Copa do Mundo de 2023", 
    description: "Seleção Brasileira de futebol feminino se despede da Copa do Mundo de 2023",
    image: "/images/noticias/renovacao.jpeg" 
  },
  { 
    title: "Globo prepara série especial sobre Marta para aquecer cobertura da Copa feminina.", 
    description: "Globo já começou a produzir uma série especial sobre a vida a carreira de Marta da Silva, a maior jogadora de futebol do Brasil e seis vezes vencedora do prêmio de melhor do mundo da Fifa. O produto servirá como um aquecimento para a transmissão dos jogos da Copa do Mundo feminina, a ser realizada na Austrália e na Nova Zelândia em julho.",
    image: "/images/noticias/marta.jpg" 
  },
  { 
    title: "Notícia 3", 
    description: "Descrição da notícia 3",
    image: "/caminho/da/imagem1.jpg" 
  },

];

export default function NewsCarousel() {
  return (
    <div className="max-w-5xl mx-auto my-10">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]} 
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        spaceBetween={30}
      >
        {news.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {item.image && (
                <div className="w-full max-h-128 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{item.title}</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
