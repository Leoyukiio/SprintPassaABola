import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Passa A Bola",
  description: "Plataforma de campeonatos",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        {/* Espaço para evitar que o carrossel fique "comido" pela navbar fixa */}
        <div style={{ height: "64px" }} />{" "}
        {/* Ajuste a altura conforme a altura real da sua Navbar */}
        <main className="flex-1">{children}</main>
        {/* resto do conteúdo do site */}
        <Footer />
      </body>
    </html>
  );
}
