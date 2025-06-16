import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Users, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistics: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [kpis, setKpis] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Buscar dados de vendas mensais
      const { data: ordersData } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

      // Processar dados de vendas mensais
      const monthlyData = Array(12).fill(0);
      ordersData?.forEach(order => {
        const month = new Date(order.created_at).getMonth();
        monthlyData[month] += order.total_amount;
      });

      setSalesData({
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
          {
            label: 'Vendas (R$)',
            data: monthlyData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      });

      // Buscar dados de categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          name,
          products (
            order_items (
              quantity
            )
          )
        `);

      const categoryStats = categoriesData?.map(category => ({
        name: category.name,
        count: category.products?.reduce((sum: number, product: any) => 
          sum + (product.order_items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0), 0) || 0
      })) || [];

      setCategoryData({
        labels: categoryStats.map(cat => cat.name),
        datasets: [
          {
            data: categoryStats.map(cat => cat.count),
            backgroundColor: [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#6B7280',
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      });

      // Buscar KPIs
      const [usersResult, ordersResult, productsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('total_amount'),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true)
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setKpis([
        {
          title: 'Receita Total',
          value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: '+12.5%',
          changeType: 'positive',
          icon: TrendingUp,
          color: 'bg-green-500'
        },
        {
          title: 'Total de Usuários',
          value: usersResult.count?.toString() || '0',
          change: '+8.2%',
          changeType: 'positive',
          icon: Users,
          color: 'bg-blue-500'
        },
        {
          title: 'Pedidos Totais',
          value: ordersResult.data?.length.toString() || '0',
          change: '+15.3%',
          changeType: 'positive',
          icon: ShoppingCart,
          color: 'bg-purple-500'
        },
        {
          title: 'Produtos Ativos',
          value: productsResult.count?.toString() || '0',
          change: '+3.1%',
          changeType: 'positive',
          icon: TrendingUp,
          color: 'bg-orange-500'
        }
      ]);

      // Buscar produtos mais vendidos
      const { data: topProductsData } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products (
            name
          )
        `);

      const productSales: { [key: string]: number } = {};
      topProductsData?.forEach(item => {
        const productName = item.products?.name;
        if (productName) {
          productSales[productName] = (productSales[productName] || 0) + item.quantity;
        }
      });

      const sortedProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([name, sales]) => ({ name, sales }));

      setTopProducts(sortedProducts);

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Estatísticas</h1>
        <div className="text-sm text-gray-500">
          Período: Janeiro - Dezembro 2024
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <p className={`text-sm mt-1 ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change} vs mês anterior
                </p>
              </div>
              <div className={`${kpi.color} rounded-lg p-3`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas */}
        {salesData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Vendas Mensais</h2>
              <p className="text-sm text-gray-500">Evolução das vendas ao longo do ano</p>
            </div>
            <div className="h-80">
              <Bar data={salesData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Gráfico de Categorias */}
        {categoryData && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Vendas por Categoria</h2>
              <p className="text-sm text-gray-500">Distribuição por categoria</p>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Pie data={categoryData} options={pieOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produtos</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{product.name}</span>
                <span className="text-sm font-medium text-gray-900">{product.sales} vendas</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crescimento Semanal</h3>
          <div className="space-y-3">
            {[
              { period: 'Esta semana', value: '+23%', color: 'text-green-600' },
              { period: 'Semana passada', value: '+18%', color: 'text-green-600' },
              { period: 'Há 2 semanas', value: '+12%', color: 'text-green-600' },
              { period: 'Há 3 semanas', value: '-5%', color: 'text-red-600' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.period}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Rápidas</h3>
          <div className="space-y-3">
            {[
              { label: 'Ticket Médio', value: 'R$ 156,78' },
              { label: 'Conversão', value: '3.2%' },
              { label: 'Produtos Ativos', value: kpis[3]?.value || '0' },
              { label: 'Usuários Ativos', value: kpis[1]?.value || '0' },
            ].map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{metric.label}</span>
                <span className="text-sm font-medium text-gray-900">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;