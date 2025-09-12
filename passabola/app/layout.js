import "./globals.css";
import Navbar from "../components/Navbar";
import Carrossel from "../components/Carrossel";

export const metadata = {
  title: "Passa A Bola",
  description: "Plataforma de campeonatos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        {/* Espaço para evitar que o carrossel fique "comido" pela navbar fixa */}
        <div style={{ height: "64px" }} />{" "}
        {/* Ajuste a altura conforme a altura real da sua Navbar */}
        <Carrossel />
        <main>{children}</main>
        {/* resto do conteúdo do site */}
      </body>
    </html>
  );
}
