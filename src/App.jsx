import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [camisetas, setCamisetas] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o produto que está sendo visualizado/editado no momento
  const [produtoFoco, setProdutoFoco] = useState(null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
  const [personalizacao, setPersonalizacao] = useState({ nome: '', numero: '' });

  // Busca as camisetas no Supabase
  useEffect(() => {
    async function buscarProdutos() {
      try {
        const { data, error } = await supabase.from('Produtos').select('*');
        if (error) throw error;
        setCamisetas(data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error.message);
      } finally {
        setCarregando(false);
      }
    }
    buscarProdutos();
  }, []);

  // Abre a área de detalhes do produto
  const abrirDetalhes = (produto) => {
    setProdutoFoco(produto);
    setTamanhoSelecionado(''); // Reseta o tamanho
    setPersonalizacao({ nome: '', numero: '' }); // Reseta personalização
  };

  // Adiciona o item configurado ao carrinho
  const adicionarAoCarrinho = (produto) => {
    if (!tamanhoSelecionado) {
      alert("Por favor, selecione um tamanho antes de adicionar ao carrinho!");
      return;
    }

    const itemCarrinho = {
      ...produto,
      tamanho: tamanhoSelecionado,
      customizacao: (personalizacao.nome || personalizacao.numero) ? { ...personalizacao } : null
    };

    setCarrinho([...carrinho, itemCarrinho]);
    setProdutoFoco(null); // Fecha a tela de detalhes
    alert(`${produto.nome} (Tam: ${tamanhoSelecionado}) adicionado ao carrinho!`);
  };

  // Gera o texto final formatado e envia para o WhatsApp
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

    // Coloque aqui o número do WhatsApp do seu cliente (DDI + DDD + Número)
    const numeroWhats = "5500000000000"; 
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-24">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">⚽ FUTSTORE</h1>
          <button onClick={finalizarCompraWhats} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition text-sm">
            🛒 Carrinho ({carrinho.length})
          </button>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-slate-800 text-white py-10 text-center px-4">
        <h2 className="text-3xl font-extrabold mb-1">Loja Oficial de Camisas</h2>
        <p className="text-gray-300 text-sm">Escolha seu tamanho e personalize com seu nome!</p>
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {carregando ? (
          <p className="text-center text-gray-500">Buscando catálogo...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Grid de Vitrine (Ocupa 2 colunas se houver um produto selecionado) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${produtoFoco ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {camisetas.map((produto) => (
                <div 
                  key={produto.id} 
                  onClick={() => abrirDetalhes(produto)}
                  className={`bg-white rounded-xl shadow p-4 cursor-pointer transition border-2 flex flex-col justify-between hover:border-blue-500 ${produtoFoco?.id === produto.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}
                >
                  <div>
                    <div className="w-full h-56 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-blue-600 uppercase">{produto.categoria}</span>
                    <h4 className="text-md font-bold text-gray-900 mt-1">{produto.nome}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-lg font-black text-slate-800">R$ {Number(produto.preco).toFixed(2)}</p>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">Ver detalhes →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Painel Lateral de Detalhes e Configuração do Produto */}
            {produtoFoco && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 h-fit sticky top-24 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">{produtoFoco.categoria}</span>
                    <h3 className="text-xl font-bold text-gray-900">{produtoFoco.nome}</h3>
                    <p className="text-2xl font-black text-slate-900 mt-1">R$ {Number(produtoFoco.preco).toFixed(2)}</p>
                  </div>
                  <button onClick={() => setProdutoFoco(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold bg-gray-100 px-2 py-1 rounded">Fechar X</button>
                </div>

                <p className="text-xs text-gray-500 mb-4">Camiseta oficial modelo torcedor com tecido tecnológico de alta absorção e durabilidade.</p>

                {/* Seleção de Tamanho */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">1. Escolha o Tamanho: <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-4 gap-2">
                    {['P', 'M', 'G', 'GG'].map((tam) => (
                      <button
                        key={tam}
                        type="button"
                        onClick={() => setTamanhoSelecionado(tam)}
                        className={`py-2 font-bold rounded-lg border text-sm transition ${tamanhoSelecionado === tam ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {tam}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos de Personalização */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">2. Personalização (Opcional):</label>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Nome na camisa (Ex: SILVA)" 
                      maxLength={15}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={personalizacao.nome}
                      onChange={(e) => setPersonalizacao({...personalizacao, nome: e.target.value.toUpperCase()})}
                    />
                    <input 
                      type="number" 
                      placeholder="Número (Ex: 10)" 
                      max={99}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={personalizacao.numero}
                      onChange={(e) => setPersonalizacao({...personalizacao, numero: e.target.value})}
                    />
                  </div>
                </div>

                {/* Botão de confirmação */}
                <button 
                  onClick={() => adicionarAoCarrinho(produtoFoco)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-sm shadow-md"
                >
                  Confirmar e Adicionar ao Carrinho
                </button>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Barra de Finalização Inferior */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-2xl z-50 flex justify-between items-center md:px-12">
          <div>
            <p className="text-xs text-gray-500">Seu pedido atual:</p>
            <p className="text-xl font-black text-slate-950">
              R$ {carrinho.reduce((acc, item) => acc + Number(item.preco), 0).toFixed(2)}
            </p>
          </div>
          <button onClick={finalizarCompraWhats} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl shadow transition text-sm flex items-center gap-2">
            Enviar Pedido para o WhatsApp 🚀
          </button>
        </div>
      )}
    </div>
  );
}