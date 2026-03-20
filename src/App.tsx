/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Minus, FileText, Save, MapPin, Calendar, Bike, Trash2, Users, UserCheck, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CIDADES_CAMPINAS, AUTUACOES_CONDUTOR, AUTUACOES_VEICULO } from './constants';
import { Autuacao } from './types';

export default function App() {
  const [motosCount, setMotosCount] = useState(0);
  const [recolhaCount, setRecolhaCount] = useState(0);
  const [cidade, setCidade] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [endereco, setEndereco] = useState('');
  const [parceiros, setParceiros] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [qtdEfetivo, setQtdEfetivo] = useState('');
  const [qtdViaturas, setQtdViaturas] = useState('');
  const [selectedCondutor, setSelectedCondutor] = useState('');
  const [selectedVeiculo, setSelectedVeiculo] = useState('');
  const [autuacoes, setAutuacoes] = useState<Autuacao[]>([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMotos = localStorage.getItem('motosCount');
    const savedRecolha = localStorage.getItem('recolhaCount');
    const savedAutuacoes = localStorage.getItem('autuacoes');
    const savedCidade = localStorage.getItem('cidade');
    const savedEndereco = localStorage.getItem('endereco');
    const savedParceiros = localStorage.getItem('parceiros');
    const savedResponsavel = localStorage.getItem('responsavel');
    const savedQtdEfetivo = localStorage.getItem('qtdEfetivo');
    const savedQtdViaturas = localStorage.getItem('qtdViaturas');

    if (savedMotos) setMotosCount(parseInt(savedMotos));
    if (savedRecolha) setRecolhaCount(parseInt(savedRecolha));
    if (savedAutuacoes) setAutuacoes(JSON.parse(savedAutuacoes));
    if (savedCidade) setCidade(savedCidade);
    if (savedEndereco) setEndereco(savedEndereco);
    if (savedParceiros) setParceiros(savedParceiros);
    if (savedResponsavel) setResponsavel(savedResponsavel);
    if (savedQtdEfetivo) setQtdEfetivo(savedQtdEfetivo);
    if (savedQtdViaturas) setQtdViaturas(savedQtdViaturas);
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    localStorage.setItem('motosCount', motosCount.toString());
    localStorage.setItem('recolhaCount', recolhaCount.toString());
    localStorage.setItem('autuacoes', JSON.stringify(autuacoes));
    localStorage.setItem('cidade', cidade);
    localStorage.setItem('endereco', endereco);
    localStorage.setItem('parceiros', parceiros);
    localStorage.setItem('responsavel', responsavel);
    localStorage.setItem('qtdEfetivo', qtdEfetivo);
    localStorage.setItem('qtdViaturas', qtdViaturas);
  }, [motosCount, recolhaCount, autuacoes, cidade, endereco, parceiros, responsavel, qtdEfetivo, qtdViaturas]);

  const handleAddAutuacao = (tipo: 'CONDUTOR' | 'VEÍCULO') => {
    const descricao = tipo === 'CONDUTOR' ? selectedCondutor : selectedVeiculo;
    if (!descricao) return;

    setAutuacoes(prev => {
      const existingIndex = prev.findIndex(a => a.descricao === descricao);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantidade: updated[existingIndex].quantidade + 1
        };
        return updated;
      } else {
        return [...prev, { tipo, descricao, quantidade: 1 }];
      }
    });

    if (tipo === 'CONDUTOR') setSelectedCondutor('');
    else setSelectedVeiculo('');
  };

  const removeAutuacao = (descricao: string) => {
    setAutuacoes(autuacoes.filter(a => a.descricao !== descricao));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Modern Header Design
    doc.setFillColor(14, 165, 233); // sky-500 (#0ea5e9)
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE FISCALIZAÇÃO', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('REGIONAL CAMPINAS - DETRAN SP', pageWidth / 2, 35, { align: 'center' });

    // Info Section
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFontSize(11);
    
    const startY = 65;
    doc.setFont('helvetica', 'bold');
    doc.text('ENDEREÇO DA OPERAÇÃO', 20, startY);
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, startY + 2, 190, startY + 2);

    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${data.split('-').reverse().join('/')}`, 20, startY + 12);
    doc.text(`Cidade: ${cidade || 'Não informada'}`, 20, startY + 20);
    doc.text(`Endereço: ${endereco || 'Não informado'}`, 20, startY + 28);
    doc.text(`Parceiros: ${parceiros || 'Não informado'}`, 20, startY + 36);
    doc.text(`Responsável: ${responsavel || 'Não informado'}`, 20, startY + 44);
    doc.text(`Efetivo: ${qtdEfetivo || '0'} | Viaturas: ${qtdViaturas || '0'}`, 20, startY + 52);

    // Stats Cards (Visual)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(20, startY + 62, 50, 25, 3, 3, 'F');
    doc.roundedRect(80, startY + 62, 50, 25, 3, 3, 'F');
    doc.roundedRect(140, startY + 62, 50, 25, 3, 3, 'F');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('MOTOS ABORDADAS', 45, startY + 70, { align: 'center' });
    doc.text('RECOLHAS', 105, startY + 70, { align: 'center' });
    doc.text('TOTAL AUTUAÇÕES', 165, startY + 70, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(motosCount.toString(), 45, startY + 80, { align: 'center' });
    doc.text(recolhaCount.toString(), 105, startY + 80, { align: 'center' });
    doc.text(autuacoes.reduce((acc, curr) => acc + curr.quantidade, 0).toString(), 165, startY + 80, { align: 'center' });

    // Table
    const tableData = autuacoes.map(a => [
      a.quantidade.toString() + 'x',
      a.tipo,
      a.descricao
    ]);
    
    autoTable(doc, {
      startY: startY + 95,
      head: [['Qtd', 'Tipo', 'Descrição da Infração']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [14, 165, 233], // sky-500
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { fontSize: 9 }
      },
      margin: { left: 20, right: 20 },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 200;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Documento gerado eletronicamente pelo Sistema de Fiscalização Regional Campinas', pageWidth / 2, 285, { align: 'center' });

    doc.save(`Relatorio_Fiscalizacao_${cidade || 'Operacao'}_${data}.pdf`);
  };

  const resetAll = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    setMotosCount(0);
    setRecolhaCount(0);
    setAutuacoes([]);
    setEndereco('');
    setCidade('');
    setParceiros('');
    setResponsavel('');
    setQtdEfetivo('');
    setQtdViaturas('');
    localStorage.clear();
    setIsResetModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalAutuacoes = autuacoes.reduce((acc, curr) => acc + curr.quantidade, 0);
  const infraCondutor = autuacoes.filter(a => a.tipo === 'CONDUTOR').reduce((acc, curr) => acc + curr.quantidade, 0);
  const infraVeiculo = autuacoes.filter(a => a.tipo === 'VEÍCULO').reduce((acc, curr) => acc + curr.quantidade, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header Section */}
      <header className="bg-sky-500 text-white p-6 shadow-lg sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl shadow-inner backdrop-blur-sm">
              <Bike size={40} className="text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Fiscalização</h1>
              <p className="text-white font-black text-lg mt-1 drop-shadow-md">REGIONAL CAMPINAS - DETRAN SP</p>
            </div>
          </div>

          {/* Motos Counter - HIGHLIGHTED */}
          <div className="flex items-center gap-6 bg-white/10 p-4 rounded-[2.5rem] border-2 border-white/30 shadow-2xl backdrop-blur-md scale-110 md:scale-125 origin-center">
            <button 
              onClick={() => setMotosCount(Math.max(0, motosCount - 1))}
              className="w-14 h-14 flex items-center justify-center bg-white/20 hover:bg-red-500 transition-all rounded-2xl active:scale-90 shadow-lg"
            >
              <Minus size={28} />
            </button>
            <div className="flex flex-col items-center min-w-[100px]">
              <span className="text-6xl font-black font-mono leading-none tracking-tighter text-white">{motosCount}</span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white mt-1">MOTOS</span>
            </div>
            <button 
              onClick={() => setMotosCount(motosCount + 1)}
              className="w-14 h-14 flex items-center justify-center bg-white/30 hover:bg-white/50 transition-all rounded-2xl active:scale-90 shadow-lg"
            >
              <Plus size={28} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Real-time Dashboard (Similar to photo) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white text-center flex flex-col justify-center min-h-[140px]">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Total de Motos</h3>
            <span className="text-5xl font-black">{motosCount}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white text-center flex flex-col justify-center min-h-[140px]">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Total de Autuações</h3>
            <span className="text-5xl font-black">{totalAutuacoes}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white text-center flex flex-col justify-center min-h-[140px]">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Infrações Condutor</h3>
            <span className="text-5xl font-black">{infraCondutor}</span>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white text-center flex flex-col justify-center min-h-[140px]">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Infrações Veículo</h3>
            <span className="text-5xl font-black">{infraVeiculo}</span>
          </div>
        </section>

        {/* Config Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <MapPin size={14} /> Cidade
            </label>
            <input 
              type="text"
              placeholder="Digite o nome da cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Calendar size={14} /> Data
            </label>
            <input 
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <MapPin size={14} /> Endereço da Operação
            </label>
            <input 
              type="text"
              placeholder="Ex: Av. Francisco Glicério, 1234"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Users size={14} /> Parceiros
            </label>
            <input 
              type="text"
              placeholder="Ex: PM, Guarda Municipal, etc."
              value={parceiros}
              onChange={(e) => setParceiros(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <UserCheck size={14} /> Nome Completo Responsável
            </label>
            <input 
              type="text"
              placeholder="Digite o nome do responsável"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Users size={14} /> Qtd Efetivo
            </label>
            <input 
              type="number"
              placeholder="0"
              value={qtdEfetivo}
              onChange={(e) => setQtdEfetivo(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Car size={14} /> Qtd Viaturas
            </label>
            <input 
              type="number"
              placeholder="0"
              value={qtdViaturas}
              onChange={(e) => setQtdViaturas(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>
        </section>

        {/* Autuações Section */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Save className="text-sky-600" /> Registro de Autuações
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condutor */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-700 border-b pb-2">Infrações: CONDUTOR</h3>
              <select 
                value={selectedCondutor}
                onChange={(e) => setSelectedCondutor(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[100px]"
              >
                <option value="">Selecione uma infração...</option>
                {AUTUACOES_CONDUTOR.map((a, i) => <option key={i} value={a}>{a}</option>)}
              </select>
              <button 
                onClick={() => handleAddAutuacao('CONDUTOR')}
                disabled={!selectedCondutor}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Contabilizar e Salvar
              </button>
            </div>

            {/* Veículo */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-700 border-b pb-2">Infrações: VEÍCULO</h3>
              <select 
                value={selectedVeiculo}
                onChange={(e) => setSelectedVeiculo(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[100px]"
              >
                <option value="">Selecione uma infração...</option>
                {AUTUACOES_VEICULO.map((a, i) => <option key={i} value={a}>{a}</option>)}
              </select>
              <button 
                onClick={() => handleAddAutuacao('VEÍCULO')}
                disabled={!selectedVeiculo}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Contabilizar e Salvar
              </button>
            </div>
          </div>
        </section>

        {/* List Section */}
        <section className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Resumo de Autuações ({totalAutuacoes})</h2>
            {autuacoes.length > 0 && (
              <button 
                onClick={resetAll}
                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Limpar Tudo
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {autuacoes.map((a) => (
                <motion.div 
                  key={a.descricao}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-900 shrink-0">
                      {a.quantidade}x
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${a.tipo === 'CONDUTOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {a.tipo}
                      </span>
                      <p className="text-sm text-slate-700 font-medium leading-tight">{a.descricao}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeAutuacao(a.descricao)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {autuacoes.length === 0 && (
              <div className="text-center py-12 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Nenhuma autuação registrada ainda.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recolha Counter Section - BOTTOM (Smaller) */}
        <section className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="text-center">
            <h3 className="text-orange-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Controle de Pátio</h3>
            <p className="text-slate-400 text-xs">Veículos removidos</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setRecolhaCount(Math.max(0, recolhaCount - 1))}
              className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-red-500 transition-all rounded-xl active:scale-90 shadow-xl border border-slate-700"
            >
              <Minus size={24} className="text-white" />
            </button>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-5xl font-black font-mono leading-none text-white">{recolhaCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mt-1">RECOLHAS</span>
            </div>
            <button 
              onClick={() => setRecolhaCount(recolhaCount + 1)}
              className="w-12 h-12 flex items-center justify-center bg-orange-600 hover:bg-orange-500 transition-all rounded-xl active:scale-90 shadow-xl"
            >
              <Plus size={24} className="text-white" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button 
            onClick={resetAll}
            className="flex-1 bg-slate-100 hover:bg-red-50 text-red-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-100"
          >
            <Trash2 size={20} /> Zerar Tudo
          </button>
          <button 
            onClick={generatePDF}
            className="flex-[2] bg-sky-500 hover:bg-sky-400 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-sky-100 transition-all active:scale-95"
          >
            <FileText size={20} /> Gerar Relatório
          </button>
        </div>
      </footer>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Zerar Tudo?</h3>
                <p className="text-slate-500 font-medium">
                  Isso irá apagar todos os contadores e autuações registradas. Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmReset}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
                >
                  Sim, Zerar Agora
                </button>
                <button 
                  onClick={() => setIsResetModalOpen(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
