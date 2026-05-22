'use client';

import { useState } from 'react';

export default function Home() {
  const [type, setType] = useState('urls');
  const [targets, setTargets] = useState('');
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const targetList = targets.split('\n').filter(t => t.trim() !== '');

    try {
      const response = await fetch('/api/purge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          type,
          targets: type === 'everything' ? [] : targetList,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ message: data.message, isError: false });
        setTargets('');
      } else {
        setStatus({ message: data.error || 'Erro ao processar solicitação', isError: true });
      }
    } catch (error) {
      setStatus({ message: 'Erro de conexão', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Cloudflare Purge <span className="text-orange-500">Hub</span></h1>
            </div>
            <p className="text-zinc-400 max-w-md">Gerencie a limpeza de cache da sua CDN de forma rápida, segura e profissional.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 backdrop-blur-sm transition-all hover:border-zinc-700">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status da API</p>
              <p className="text-sm font-medium text-green-400">Operacional</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl transition-all hover:border-zinc-700/50">
              <div className="space-y-8">
                {/* Auth Section */}
                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Autenticação Interna
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-inner"
                    placeholder="Cole sua APP_API_KEY aqui"
                    required
                  />
                </section>

                {/* Type Selection */}
                <section>
                  <label className="text-sm font-semibold text-zinc-300 mb-4 block">Tipo de Invalidação</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'urls', label: 'URLs', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
                      { id: 'tags', label: 'Cache Tags', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
                      { id: 'everything', label: 'Tudo', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                          type === opt.id 
                            ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-lg shadow-orange-500/5' 
                            : 'bg-zinc-800/30 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
                        </svg>
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Targets Input */}
                {type !== 'everything' && (
                  <section className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-semibold text-zinc-300 mb-3 block">
                      {type === 'urls' ? 'URLs para Limpar' : 'Cache-Tags Identificadas'}
                    </label>
                    <textarea
                      value={targets}
                      onChange={(e) => setTargets(e.target.value)}
                      rows={6}
                      className="w-full bg-zinc-950/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-mono text-sm resize-none shadow-inner"
                      placeholder={type === 'urls' ? 'https://meu-site.com/artigo-1\nhttps://meu-site.com/landing-page' : 'categoria-blog\nproduto-id-456'}
                      required
                    />
                    <p className="mt-2 text-[11px] text-zinc-500 italic flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Insira um item por linha para processamento em lote.
                    </p>
                  </section>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`relative group w-full py-4 px-6 rounded-xl font-bold text-white overflow-hidden transition-all
                    ${loading ? 'bg-zinc-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 shadow-xl shadow-orange-600/20 active:scale-[0.98]'}`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sincronizando com Cloudflare...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span>Executar Comando Purge</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {status && (
              <div className={`animate-in zoom-in-95 duration-300 p-5 rounded-2xl border flex gap-4 ${
                status.isError 
                  ? 'bg-red-500/5 border-red-500/20 text-red-200' 
                  : 'bg-green-500/5 border-green-500/20 text-green-200'
              }`}>
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${status.isError ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  {status.isError ? (
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-bold mb-1">{status.isError ? 'Erro na Operação' : 'Sucesso!'}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{status.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Como funciona
              </h2>
              <ul className="space-y-4">
                {[
                  { title: 'Purge por URL', desc: 'Invalida arquivos específicos como imagens ou páginas HTML.' },
                  { title: 'Purge por Tag', desc: 'Ideal para sites Headless onde múltiplos recursos compartilham a mesma tag.' },
                  { title: 'Purge Total', desc: 'Limpa o cache de toda a zona de uma única vez. Use com cautela.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-orange-500 border border-zinc-700">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">{item.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-6 text-white shadow-xl shadow-orange-900/20">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-lg">
                <span className="animate-bounce">⚡</span> Dica Pro
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Você pode integrar este sistema diretamente no seu backoffice enviando um POST para <code className="bg-black/20 px-1.5 py-0.5 rounded text-[11px] font-mono">/api/purge</code>.
              </p>
            </div>

            <p className="text-center text-xs text-zinc-600">
              Conectado ao SDK Cloudflare v4 • v1.0.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


