import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [camisetas, setCamisetas] = useState([]);
  const [camisetasFiltradas, setCamisetasFiltradas] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados de Controle de Filtros e Busca
  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState({ tipo: 'todos', valor: '' });

  // Estados para Detalhes do Produto
  const [produtoFoco, setProdutoFoco] = useState(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
  const [personalizacao, setPersonalizacao] = useState({ nome: '', numero: '' });
  const [indexFotoAtiva, setIndexFotoAtiva] = useState(0);

  // Estados dos Dropdowns da Barra de Ferramentas
  const [menuAberto, setMenuAberto] = useState(null); // 'times', 'campeonatos', 'publico'

  // Busca as camisetas no Supabase
  useEffect(() => {
    async function buscarProdutos() {
      try {
        const { data, error } = await supabase.from('Produtos').select('*');
        if (error) throw error;
        setCamisetas(data || []);
        setCamisetasFiltradas(data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error.message);
      } finally {
        setCarregando(false);
      }
    }
    buscarProdutos();
  }, []);

  // Executa os filtros sempre que a busca, a categoria clicada ou a lista original mudarem
  useEffect(() => {
    let resultado = [...camisetas];

    // Filtro por texto digitado
    if (busca) {
      resultado = resultado.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.categoria.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Filtros por Categoria da Barra de Ferramentas
    if (filtroAtivo.tipo !== 'todos') {
      resultado = resultado.filter(c =>
        c.categoria.toLowerCase() === filtroAtivo.valor.toLowerCase()
      );
    }

    setCamisetasFiltradas(resultado);
  }, [busca, filtroAtivo, camisetas]);

  const obterListaImagens = (campoImagem) => {
    if (!campoImagem) return [];
    return campoImagem.split(',').map(url => url.trim());
  };

  const abrirDetalhes = (produto) => {
    setProdutoFoco(produto);
    setTamanhoSelecionado('');
    setPersonalizacao({ nome: '', numero: '' });
    setIndexFotoAtiva(0);
  };

  const adicionarAoCarrinho = (produto) => {
    if (!tamanhoSelecionado) {
      alert("Por favor, selecione um tamanho antes de adicionar ao carrinho!");
      return;
    }
    const fotos = obterListaImagens(produto.imagem);
    const itemCarrinho = {
      ...produto,
      imagemPrincipal: fotos[0] || '',
      tamanho: tamanhoSelecionado,
      customizacao: (personalizacao.nome || personalizacao.numero) ? { ...personalizacao } : null
    };
    setCarrinho([...carrinho, itemCarrinho]);
    setProdutoFoco(null);
    alert(`${produto.nome} adicionado ao carrinho!`);
  };

  const finalizarCompraWhats = () => {
    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");
    let mensagem = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
    carrinho.forEach((item, index) => {
      mensagem += `*${index + 1}. ${item.nome}*\n`;
      mensagem += `   • Tamanho: *${item.tamanho}*\n`;
      mensagem += `   • Preço: R$ ${Number(item.preco).toFixed(2)}\n`;
      if (item.customizacao) {
        mensagem += `   ↳ Personalização: Nome: ${item.customizacao.nome || 'Sem nome'} | Nº: ${item.customizacao.numero || 'Sem número'}\n`;
      }
      mensagem += `\n`;
    });
    const total = carrinho.reduce((acc, item) => acc + Number(item.preco), 0);
    mensagem += `*Total:* R$ ${total.toFixed(2)}`;

    const numeroWhats = "5500000000000";
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const aplicarFiltro = (tipo, valor) => {
    setFiltroAtivo({ tipo, valor });
    setMenuAberto(null); // Fecha os menus abertos
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">

      {/* 1. HEADER PRINCIPAL */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => aplicarFiltro('todos', '')}>
            <span className="text-2xl">⚽</span>
            <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              FUTSTORE
            </h1>
          </div>

          {/* Barra de Busca Integrada */}
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Pesquise por time, seleção ou campeonato..."
              className="w-full bg-slate-800 text-white text-sm pl-4 pr-10 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 transition"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>

          {/* Botões do Usuário e Carrinho */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => alert("Área do Usuário (Em desenvolvimento): Aqui o cliente poderá ver seus pedidos antigos!")}
              className="text-gray-300 hover:text-white transition flex items-center gap-1.5 text-sm font-medium"
            >
              👤 <span>Minha Conta</span>
            </button>
            <button onClick={finalizarCompraWhats} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition text-sm text-white shadow-md">
              🛒 Carrinho ({carrinho.length})
            </button>
          </div>
        </div>

        {/* 2. BARRA DE FERRAMENTAS / CATEGORIAS (NAVBAR EXTRA) */}
        <nav className="bg-slate-800 border-t border-slate-700 text-sm text-gray-200">
          <div className="container mx-auto px-4 flex flex-wrap gap-1 relative">

            {/* Botão Ver Todos */}
            <button
              onClick={() => aplicarFiltro('todos', '')}
              className={`px-4 py-3 font-semibold transition hover:bg-slate-700 ${filtroAtivo.tipo === 'todos' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-700/50' : ''}`}
            >
              🏠 Início / Ver Todos
            </button>

            {/* Dropdown: Clubes por País */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(menuAberto === 'times' ? null : 'times')}
                className="px-4 py-3 font-semibold hover:bg-slate-700 flex items-center gap-1 transition"
              >
                🌍 Clubes por País <span>▼</span>
              </button>
              {menuAberto === 'times' && (
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-2xl border text-gray-800 py-2 z-50 grid grid-cols-1">
                  <button onClick={() => aplicarFiltro('pais', 'Brasil')} className="text-left px-4 py-2 hover:bg-blue-50 transition">🇧🇷 Clubes do Brasil</button>
                  <button onClick={() => aplicarFiltro('pais', 'Inglaterra')} className="text-left px-4 py-2 hover:bg-blue-50 transition">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Clubes da Inglaterra</button>
                  <button onClick={() => aplicarFiltro('pais', 'Espanha')} className="text-left px-4 py-2 hover:bg-blue-50 transition">🇪🇸 Clubes da Espanha</button>
                  <button onClick={() => aplicarFiltro('pais', 'Italia')} className="text-left px-4 py-2 hover:bg-blue-50 transition">🇮🇹 Clubes da Itália</button>
                  <button onClick={() => aplicarFiltro('pais', 'Alemanha')} className="text-left px-4 py-2 hover:bg-blue-50 transition">🇩🇪 Clubes da Alemanha</button>
                </div>
              )}
            </div>

            {/* Dropdown: Grandes Campeonatos */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(menuAberto === 'campeonatos' ? null : 'campeonatos')}
                className="px-4 py-3 font-semibold hover:bg-slate-700 flex items-center gap-1 transition"
              >
                🏆 Campeonatos <span>▼</span>
              </button>
              {menuAberto === 'campeonatos' && (
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-2xl border text-gray-800 py-2 z-50">
                  <button onClick={() => aplicarFiltro('campeonato', 'Champions League')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">⭐ Champions League</button>
                  <button onClick={() => aplicarFiltro('campeonato', 'Libertadores')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">🔥 Copa Libertadores</button>
                  <button onClick={() => aplicarFiltro('campeonato', 'Brasileirao')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">🔰 Brasileirão Série A</button>
                  <button onClick={() => aplicarFiltro('campeonato', 'Premier League')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">🦁 Premier League</button>
                </div>
              )}
            </div>

            {/* Botão Direto: Seleções do Mundo */}
            <button
              onClick={() => aplicarFiltro('categoria', 'Selecoes')}
              className="px-4 py-3 font-semibold hover:bg-slate-700 transition"
            >
              🏳️ Seleções
            </button>

            {/* Dropdown: Gênero / Público */}
            <div className="relative">
              <button
                onClick={() => setMenuAberto(menuAberto === 'publico' ? null : 'publico')}
                className="px-4 py-3 font-semibold hover:bg-slate-700 flex items-center gap-1 transition"
              >
                👥 Público <span>▼</span>
              </button>
              {menuAberto === 'publico' && (
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-2xl border text-gray-800 py-2 z-50">
                  <button onClick={() => aplicarFiltro('categoria', 'Masculino')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">👕 Masculino Adulto</button>
                  <button onClick={() => aplicarFiltro('categoria', 'Feminino')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">👚 Modelos Femininos</button>
                  <button onClick={() => aplicarFiltro('categoria', 'Infantil')} className="w-full text-left px-4 py-2 hover:bg-blue-50 transition">🧒 Infantil / Crianças</button>
                </div>
              )}
            </div>

          </div>
        </nav>
      </header>

      {/* Indicador de Filtro Ativo */}
      {filtroAtivo.tipo !== 'todos' && (
        <div className="bg-blue-50 border-b p-3 text-center text-sm font-medium text-blue-800 flex justify-center items-center gap-2">
          <span>Mostrando apenas resultados de: <strong>{filtroAtivo.valor || filtroAtivo.tipo}</strong></span>
          <button onClick={() => aplicarFiltro('todos', '')} className="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full hover:bg-blue-300">Limpar Filtro X</button>
        </div>
      )}

      {/* Conteúdo Principal da Loja */}
      <main className="container mx-auto px-4 py-8">
        {carregando ? (
          <p className="text-center text-gray-500 font-medium">Carregando manto sagrado...</p>
        ) : camisetasFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow border p-6">
            <p className="text-gray-500 font-bold text-lg">Nenhuma camiseta encontrada para este filtro. 💔</p>
            <p className="text-gray-400 text-sm mt-1">Experimente limpar o filtro ou digitar outro termo na busca!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Vitrine de Produtos */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${produtoFoco ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {camisetasFiltradas.map((produto) => {
                const fotos = obterListaImagens(produto.imagem);
                return (
                  <div
                    key={produto.id}
                    onClick={() => abrirDetalhes(produto)}
                    className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition border-2 flex flex-col justify-between hover:border-blue-500 hover:shadow-md ${produtoFoco?.id === produto.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent'}`}
                  >
                    <div>
                      <div className="w-full h-56 bg-white rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-gray-100">
                        <img src={fotos[0]} alt={produto.nome} className="max-w-full max-h-full object-contain p-2" />
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{produto.categoria}</span>
                      <h4 className="text-md font-bold text-gray-900 mt-2.5 leading-snug">{produto.nome}</h4>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-50">
                      <p className="text-lg font-black text-slate-900">R$ {Number(produto.preco).toFixed(2)}</p>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold">Ver Manto →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Painel Lateral: Detalhes + Álbum de Fotos */}
            {produtoFoco && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 h-fit sticky top-24">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{produtoFoco.categoria}</span>
                    <h3 className="text-xl font-black text-gray-900 leading-tight mt-1">{produtoFoco.nome}</h3>
                    <p className="text-2xl font-black text-emerald-600 mt-1.5">R$ {Number(produtoFoco.preco).toFixed(2)}</p>
                  </div>
                  <button onClick={() => setProdutoFoco(null)} className="text-gray-400 hover:text-gray-600 font-bold bg-gray-100 px-2.5 py-1 rounded-lg text-xs">Fechar X</button>
                </div>

                {/* Álbum de Fotos */}
                <div className="mb-4">
                  <div className="w-full h-64 bg-white rounded-xl overflow-hidden mb-2 border border-gray-100 flex items-center justify-center">
                    <img
                      src={obterListaImagens(produtoFoco.imagem)[indexFotoAtiva]}
                      alt="Visualização"
                      className="max-w-full max-h-full object-contain p-2 transition-all duration-300"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {obterListaImagens(produtoFoco.imagem).map((fotoUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setIndexFotoAtiva(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${indexFotoAtiva === idx ? 'border-blue-500 shadow-sm scale-95' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <img src={fotoUrl} alt="Miniatura" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Escolha do Tamanho */}
                <div className="mb-4 pt-3 border-t">
                  <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">1. Selecione o Tamanho: *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['P', 'M', 'G', 'GG'].map((tam) => (
                      <button
                        key={tam}
                        onClick={() => setTamanhoSelecionado(tam)}
                        className={`py-2 font-bold rounded-xl border text-sm transition ${tamanhoSelecionado === tam ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {tam}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personalização */}
                <div className="mb-6 pt-3 border-t">
                  <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">2. Personalizar Manto (Opcional):</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nome (Ex: NEYMAR JR)"
                      maxLength={15}
                      className="w-full p-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-gray-200"
                      value={personalizacao.nome}
                      onChange={(e) => setPersonalizacao({ ...personalizacao, nome: e.target.value.toUpperCase() })}
                    />
                    <input
                      type="number"
                      placeholder="Número (Ex: 10)"
                      className="w-full p-2 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-gray-200"
                      value={personalizacao.numero}
                      onChange={(e) => setPersonalizacao({ ...personalizacao, numero: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  onClick={() => adicionarAoCarrinho(produtoFoco)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Barra de Conclusão Inferior */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-2xl z-50 flex justify-between items-center md:px-12 animate-fade-in">
          <div>
            <p className="text-xs text-gray-500 font-medium">Subtotal do pedido:</p>
            <p className="text-xl font-black text-slate-900">
              R$ {carrinho.reduce((acc, item) => acc + Number(item.preco), 0).toFixed(2)}
            </p>
          </div>
          <button onClick={finalizarCompraWhats} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow transition text-sm flex items-center gap-2">
            Finalizar via WhatsApp 🚀
          </button>
        </div>
      )}
    </div>
  );
}