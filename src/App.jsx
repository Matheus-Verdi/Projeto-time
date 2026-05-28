import React, { useState } from 'react';

// Lista inicial de produtos para testar o visual hoje mesmo!
const CAMISETAS_MOCK = [
  {
    id: 1,
    nome: "Camisa Real Madrid Home 26/27",
    preco: 299.90,
    imagem: "https://images.unsplash.com/photo-1622115634563-7184ff5f9e8f?w=500&q=80", // Imagem temporária
    categoria: "Internacional"
  },
  {
    id: 2,
    nome: "Camisa Flamengo Home 2026",
    preco: 349.90,
    imagem: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&q=80", // Imagem temporária
    categoria: "Nacional"
  },
  {
    id: 3,
    nome: "Camisa Brasil Tradicional",
    preco: 319.90,
    imagem: "https://images.unsplash.com/photo-1551958219-acbc608c6d77?w=500&q=80", // Imagem temporária
    categoria: "Seleções"
  }
];

export default function App() {
  const [carrinho, setCarrinho] = useState([]);
  const [personalizacao, setPersonalizacao] = useState({ nome: '', numero: '' });
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const adicionarAoCarrinho = (produto) => {
    const item = {
      ...produto,
      customizacao: produtoSelecionado?.id === produto.id ? { ...personalizacao } : null
    };
    setCarrinho([...carrinho, item]);
    // Limpa a seleção após adicionar
    setProdutoSelecionado(null);
    setPersonalizacao({ nome: '', numero: '' });
    alert(`${produto.nome} adicionado ao carrinho!`);
  };

  const finalizarCompraWhats = () => {
    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");

    let mensagem = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
    carrinho.forEach((item, index) => {
      mensagem += `*${index + 1}. ${item.nome}* - R$ ${item.preco.toFixed(2)}\n`;
      if (item.customizacao?.nome || item.customizacao?.numero) {
        mensagem += `   ↳ Personalização: Nome: ${item.customizacao.nome || 'Sem nome'} | Nº: ${item.customizacao.numero || 'Sem número'}\n`;
      }
    });

    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    mensagem += `\n*Total:* R$ ${total.toFixed(2)}`;

    // Substitua pelo número de WhatsApp do seu cliente (ex: 5541999999999)
    const numeroWhats = "5545998566238"; 
    const url = `https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(mensagem)}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Cabeçalho */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">⚽ FUTSTORE</h1>
          <button 
            onClick={finalizarCompraWhats}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
          >
            🛒 Carrinho ({carrinho.length})
          </button>
        </div>
      </header>

      {/* Banner Principal */}
      <div className="bg-slate-800 text-white py-12 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2">As Melhores Camisas de Time de 2026</h2>
        <p className="text-gray-300">Personalize com seu nome e número com frete rápido!</p>
      </div>

      {/* Grid de Produtos */}
      <main className="container mx-auto px-4 py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Lançamentos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAMISETAS_MOCK.map((produto) => (
            <div key={produto.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
              <div>
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center text-gray-400">
                  {/* Espaço para a foto do cliente */}
                  <span className="text-sm">Foto da Camisa</span>
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{produto.categoria}</span>
                <h4 className="text-lg font-bold text-gray-900 mt-1">{produto.nome}</h4>
                <p className="text-xl font-black text-slate-800 mt-2">R$ {produto.preco.toFixed(2)}</p>
              </div>

              {/* Bloco de Personalização */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {produtoSelecionado?.id === produto.id ? (
                  <div className="space-y-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="Nome na camisa (Ex: NEYMAR JR)" 
                      maxLength={15}
                      className="w-full p-2 text-sm border rounded"
                      value={personalizacao.nome}
                      onChange={(e) => setPersonalizacao({...personalizacao, nome: e.target.value.toUpperCase()})}
                    />
                    <input 
                      type="number" 
                      placeholder="Número (Ex: 10)" 
                      max={99}
                      className="w-full p-2 text-sm border rounded"
                      value={personalizacao.numero}
                      onChange={(e) => setPersonalizacao({...personalizacao, numero: e.target.value})}
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => setProdutoSelecionado(produto)}
                    className="w-full text-xs text-gray-500 hover:text-slate-800 underline mb-2 block text-left"
                  >
                    + Adicionar personalização (Nome/Número)
                  </button>
                )}

                <button 
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition text-sm"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Rodapé fixo para fechar pedido */}
      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-lg z-50 flex justify-between items-center md:px-12">
          <div>
            <p className="text-sm text-gray-500">Total do Pedido:</p>
            <p className="text-xl font-black text-slate-900">
              R$ {carrinho.reduce((acc, item) => acc + item.preco, 0).toFixed(2)}
            </p>
          </div>
          <button 
            onClick={finalizarCompraWhats}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl shadow transition"
          >
            Enviar Pedido via WhatsApp 🚀
          </button>
        </div>
      )}
    </div>
  );
}