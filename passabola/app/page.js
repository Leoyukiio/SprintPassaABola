export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Seção de boas-vindas */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">
            Bem-vindo ao Passa A Bola
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A plataforma definitiva para organizar campeonatos, ligas e torneios
            de futebol. Conecte-se com outros apaixonados pelo esporte e
            participe de competições incríveis.
          </p>
        </div>

        {/* Seção de recursos */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Campeonatos
            </h3>
            <p className="text-gray-600">
              Participe de campeonatos organizados e competitivos com times de
              todo o país.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Ligas
            </h3>
            <p className="text-gray-600">
              Crie ou participe de ligas personalizadas com seus amigos e
              conhecidos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              Times
            </h3>
            <p className="text-gray-600">
              Monte seu time ideal e participe de competições emocionantes.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-6">
            Cadastre-se agora e faça parte da maior comunidade de futebol do
            Brasil!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/cadastro"
              className="bg-purple-800 text-white px-8 py-3 rounded-lg hover:bg-purple-900 transition font-medium"
            >
              Cadastre-se
            </a>
            <a
              href="/login"
              className="bg-white text-purple-800 border-2 border-purple-800 px-8 py-3 rounded-lg hover:bg-purple-50 transition font-medium"
            >
              Fazer Login
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
