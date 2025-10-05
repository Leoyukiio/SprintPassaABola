"use client";

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-6 w-full mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col items-start space-y-4">
          <div className="flex flex-col space-y-3">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/passaabola"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/icons/instagram.png" // caminho corrigido da imagem do Instagram
                alt="Instagram"
                className="w-6 h-6 hover:opacity-80 transition"
              />
            </a>
            {/* Youtube */}
            <a
              href="https://www.youtube.com/@passabola"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/icons/youtube.png" // caminho corrigido da imagem do YouTube
                alt="YouTube"
                className="w-6 h-6 hover:opacity-80 transition"
              />
            </a>
         
            <a
              href="https://open.spotify.com/show/18H1ysI9zyDIRahuCnZGQr?si=ae34d53115774b7b"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/icons/spotify.png"
                alt="Spotify"
                className="w-6 h-6 hover:opacity-80 transition"
              />
            </a>
          </div>
        </div>

        {/* Contatos */}
        <div>
          <h3 className="font-semibold mb-4">Contatos</h3>
          <ul className="space-y-2 text-gray-400">
            <li>Email: contato@passaabola.com</li>
            <li>Telefone: (11) 99999-9999</li>
          </ul>
        </div>

        {/* Atalhos */}
        <div>
          <h3 className="font-semibold mb-4">Atalhos</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="/login" className="hover:text-white transition-colors">
                Login
              </a>
            </li>
            <li>
              <a href="/termos/Termos_de_Uso_Passa_a_Bola.pdf" className="hover:text-white transition-colors">
                Termos de Uso
              </a>
            </li>
            <li>
              <a href="/termos/Politica_de_Privacidade_Passa_a_Bola.pdf" className="hover:text-white transition-colors">
                Política de Privacidade
              </a>
            </li>
          </ul>
        </div>

        {/* Sugestões */}
        <div>
          <h3 className="font-semibold mb-4">Sugestões</h3>
          <form className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Escreva sua sugestão"
              className="px-3 py-2 rounded text-black focus:outline-none"
            />
            <button
              type="submit"
              className="border border-pink-500 text-pink-500 px-4 py-2 rounded hover:bg-pink-500 hover:text-white transition"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
