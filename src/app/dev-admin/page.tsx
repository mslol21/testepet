'use client';

import React, { useState, useEffect } from 'react';
import { api, seedMockData } from '../../lib/db';
import { brandConfig } from '../../config/brand';
import { ShieldCheck, RefreshCw, Trash2, Cpu, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DevAdminPortal() {
  const [logs, setLogs] = useState<any[]>([]);
  const [clearing, setClearing] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadLogs = async () => {
    try {
      const fetchedLogs = await api.getActivityLogs();
      setLogs(fetchedLogs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearCache = () => {
    setClearing(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('petflow_current_user');
      }
      setClearing(false);
      setSuccessMsg('Cache e sessões limpos com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  const handleReseedDb = () => {
    setReseeding(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      seedMockData();
      loadLogs();
      setReseeding(false);
      setSuccessMsg('Banco de dados local re-semeado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              ⚙️
            </div>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-1.5">
                Área Técnica - Console do Desenvolvedor
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </h1>
              <p className="text-[10px] text-slate-500">Painel oculto de infraestrutura e suporte para a plataforma KonnexyPet.</p>
            </div>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-indigo-400 font-bold">
            Ir para Admin do Cliente ➔
          </Link>
        </div>

        {/* Success alert message banner */}
        {successMsg && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-2xl p-4 flex items-center gap-2 text-xs">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* Action triggers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* DB Actions */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" /> Ferramentas de Suporte
            </h3>
            <p className="text-[10px] text-slate-500">Manutenção de banco de dados e testes locais.</p>
            
            <div className="space-y-3 pt-2">
              <button
                disabled={clearing}
                onClick={handleClearCache}
                className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-slate-400" /> 
                {clearing ? 'Limpando...' : 'Limpar Sessões e Cookies de Login'}
              </button>

              <button
                disabled={reseeding}
                onClick={handleReseedDb}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-white" /> 
                {reseeding ? 'Re-semeando...' : 'Zerar e Semear Mocks Iniciais'}
              </button>
            </div>
          </div>

          {/* System details */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-white text-sm">Informações do Host</h3>
            <div className="space-y-3 text-[10px] text-slate-400">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Versão do Template</span>
                <span className="font-bold text-white">v1.4.2-Premium</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Instalação Padrão</span>
                <span className="font-bold text-white">calixto</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Stack Next.js</span>
                <span className="font-bold text-white">v15.0-AppRouter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs list */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-400" /> Registro Geral de Atividades (Audit Trail)
          </h3>
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhum log operacional registrado.</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span className="font-bold text-indigo-400">{log.action}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                  <p className="text-[9px] text-slate-500 font-semibold">Executor: {log.userName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
