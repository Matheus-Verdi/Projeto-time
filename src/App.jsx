import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Importa a nossa conexão

export default function App() {
  const [camisetas, setCamisetas] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [personalizacao, setPersonalizacao] = useState({ nome: '', numero: '' });
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Busca os produtos direto do Supabase quando a página carrega
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

  const adicionarAoCarrinho = (produto) => {
    const item = {
      ...produto,
      customizacao: produtoSelecionado?.id === produto.id ? { ...personalizacao } : null
    };
    setCarrinho([...carrinho, item]);
    setProdutoSelecionado(null);
    setPersonalizacao({ nome: '', numero: '' });
    alert(`${produto.nome} adicionado ao carrinho!`);
  };

  const finalizarCompraWhats = () => {
    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");
    let mensagem = `Olá! Gostaria de fazer o seguinte pedido:\n\n`;
    carrinho.forEach((item, index) => {
      mensagem += `*${index + 1}. ${item.nome}* - R$ ${Number(item.preco).toFixed(2)}\n`;
      if (item.customizacao?.nome || item.customizacao?.numero) {
        mensagem += `   ↳ Personalização: Nome: ${item.customizacao.nome || 'Sem nome'} | Nº: ${item.customizacao.numero || 'Sem número'}\n`;
      }
    });
    const total = carrinho.reduce((acc, item) => acc + Number(item.preco), 0);
    mensagem += `\n*Total:* R$ ${total.toFixed(2)}`;
    
    const numeroWhats = "5541998566238"; // Mude para o número do cliente!
    window.open(`https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">⚽ FUTSTORE</h1>
          <button onClick={finalizarCompraWhats} className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
            🛒 Carrinho ({carrinho.length})
          </button>
        </div>
      </header>

      <div className="bg-slate-800 text-white py-12 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-2">As Melhores Camisas de Time de 2026</h2>
        <p className="text-gray-300">Banco de dados conectado ao vivo!</p>
      </div>

      <main className="container mx-auto px-4 py-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Catálogo Direto do Banco</h3>
        
        {carregando ? (
          <p className="text-center text-gray-500">Buscando camisetas no Supabase...</p>
        ) : camisetas.length === 0 ? (
          <p className="text-center text-gray-500">Nenhuma camiseta cadastrada no banco ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {camisetas.map((produto) => (
              <div key={produto.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
                <div>
                  <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    {produto.imagem ? (
                      <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-gray-400">Sem foto</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{produto.categoria}</span>
                  <h4 className="text-lg font-bold text-gray-900 mt-1">{produto.nome}</h4>
                  <p className="text-xl font-black text-slate-800 mt-2">R$ {Number(produto.preco).toFixed(2)}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  {produtoSelecionado?.id === produto.id ? (
                    <div className="space-y-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="Nome na camisa" 
                        className="w-full p-2 text-sm border rounded"
                        value={personalizacao.nome}
                        onChange={(e) => setPersonalizacao({...personalizacao, nome: e.target.value.toUpperCase()})}
                      />
                      <input 
                        type="number" 
                        placeholder="Número" 
                        className="w-full p-2 text-sm border rounded"
                        value={personalizacao.numero}
                        onChange={(e) => setPersonalizacao({...personalizacao, numero: e.target.value})}
                      />
                    </div>
                  ) : (
                    <button onClick={() => setProdutoSelecionado(produto)} className="w-full text-xs text-gray-500 hover:text-slate-800 underline mb-2 block text-left">
                      + Adicionar personalização (Nome/Número)
                    </button>
                  )}

                  <button onClick={() => adicionarAoCarrinho(produto)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition text-sm">
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {carrinho.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-lg z-50 flex justify-between items-center md:px-12">
          <div>
            <p className="text-sm text-gray-500">Total do Pedido:</p>
            <p className="text-xl font-black text-slate-900">
              R$ {carrinho.reduce((acc, item) => acc + Number(item.preco), 0).toFixed(2)}
            </p>
          </div>
          <button onClick={finalizarCompraWhats} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl shadow transition">
            Enviar Pedido via WhatsApp 🚀
          </button>
        </div>
      )}
    </div>
  );
}