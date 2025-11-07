"use client";

import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award,
  Activity,
  Target,
  BarChart3
} from "lucide-react";

export default function Dashboard({ data = {} }) {
  const stats = [
    {
      icon: Trophy,
      label: "Campeonatos Ativos",
      value: data.campeonatosAtivos || 0,
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      icon: Users,
      label: "Total de Times",
      value: data.totalTimes || 0,
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: Calendar,
      label: "Partidas Agendadas",
      value: data.partidasAgendadas || 0,
      color: "from-green-400 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: TrendingUp,
      label: "Crescimento",
      value: `${data.crescimento || 0}%`,
      color: "from-purple-400 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  // Dados de exemplo para gráficos
  const chartData = data.chartData || [
    { label: "Jan", value: 12 },
    { label: "Fev", value: 19 },
    { label: "Mar", value: 15 },
    { label: "Abr", value: 25 },
    { label: "Mai", value: 22 },
    { label: "Jun", value: 30 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${stat.bgColor} ${stat.textColor}`}>
                  {stat.label}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">
                Últimos 30 dias
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de Barras */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Estatísticas Mensais</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="h-4 w-4" />
            <span>Atualizado agora</span>
          </div>
        </div>
        
        {/* Grid para o gráfico */}
        <div className="grid grid-cols-6 gap-4 items-end h-64">
          {chartData.map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center justify-end h-full"
            >
              <div 
                className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-t-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 cursor-pointer group relative"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.value}
                </div>
              </div>
              <div className="mt-2 text-xs font-medium text-gray-600 text-center">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de Atividades Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Metas do Mês</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Novos Campeonatos", progress: 75, target: 20 },
              { label: "Times Cadastrados", progress: 60, target: 50 },
              { label: "Partidas Realizadas", progress: 90, target: 100 }
            ].map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{goal.label}</span>
                  <span className="text-sm text-gray-500">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Destaques</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: "Campeonato Mais Popular", value: "Copa Feminina 2024", count: "150 times" },
              { title: "Time em Alta", value: "Flamengo Feminino", count: "+25% crescimento" },
              { title: "Partida do Mês", value: "Corinthians vs Palmeiras", count: "2.5K visualizações" }
            ].map((highlight, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="text-sm font-semibold text-gray-600 mb-1">{highlight.title}</div>
                <div className="text-lg font-bold text-gray-800 mb-1">{highlight.value}</div>
                <div className="text-xs text-pink-600 font-medium">{highlight.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

