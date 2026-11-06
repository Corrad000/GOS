'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, Users, ShieldCheck, Database, ArrowRight, Plus, ArrowLeft, 
  FileText, HelpCircle, Trash2, Edit2, Check, X, Library, Download, 
  BarChart3, Globe, LogOut, Clock, Calendar, PieChart, 
  TrendingUp, Award, Layers, AlertCircle, DollarSign, Percent, Briefcase, 
  ArrowUp, ArrowDown, Lock, Mail, Eye, Copy, Send, ChevronDown, ChevronRight,
  TrendingDown, CheckCircle2, UserCheck, RefreshCw, Save, LayoutDashboard
} from 'lucide-react';

// ============================================================================
// GENERATORE REPORT PDF MIRATO — INCLUDE IL BUSINESS PLAN COMPLETO O SINGOLE SEZIONI
// ============================================================================
export const generateClientReport = (
  azienda: any,
  forms: any[],
  domande: any[],
  risposteClienti: any[],
  userProfile: any,
  elapsedTime: string,
  financialReports?: any,
  onShowPreview?: (previewHtml: string) => void,
  targetSection: string = 'ce',
  customTeamMembers: any[] = []
) => {
  const userDisplayName = userProfile?.nome
    ? `${userProfile.nome} ${userProfile.cognome || ''}`
    : userProfile?.email || 'Amministratore GOS';

  const currentDate = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const getSectionMetadata = (sec: string) => {
    switch (sec) {
      case 'business_plan': 
        return { title: 'Business Plan & Proiezioni Finanziarie Complete (Anni 1-5)', type: 'Finanziario' };
      case 'ce': 
        return { title: 'Conto Economico Proiettato (Bilancio)', type: 'Finanziario' };
      case 'sp': 
        return { title: 'Stato Patrimoniale Pluriennale', type: 'Finanziario' };
      case 'cashflow': 
        return { title: 'Rendiconto Finanziario (Cash Flow)', type: 'Finanziario' };
      case 'debito': 
        return { title: 'Piano del Debito & Copertura DSCR', type: 'Finanziario' };
      case 'kpi': 
        return { title: 'KPI & Indici Strategici Pluriennali', type: 'Finanziario' };
      case 'questionari': 
        return { title: 'Report Sezione Questionari & Risposte Clienti', type: 'Audit & Compliance' };
      case 'cronoprogramma': 
        return { title: 'Cronoprogramma & Roadmap Operativa (Tasks & Sub-tasks)', type: 'PMO & Operations' };
      case 'ruoli': 
        return { title: 'Organigramma & Risorse (Governance)', type: 'Governance' };
      default: 
        return { title: 'Report Direzionale GOS', type: 'Generale' };
    }
  };

  const metaInfo = getSectionMetadata(targetSection);
  const npvFormatted = financialReports ? Math.round(financialReports.kpis.npv).toLocaleString('it-IT') : '0';
  const irrFormatted = financialReports ? (financialReports.kpis.irr * 100).toFixed(1) : '0';

  let sectionSpecificHtml = '';

  // GENERAZIONE HTML ACCorpato PER IL BUSINESS PLAN COMPLETO
  if (targetSection === 'business_plan' && financialReports) {
    sectionSpecificHtml = `
      <div class="section-title">1. Conto Economico Proiettato (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Voce Economica (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Ricavi delle Vendite (Cash Receipts)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.ricavi).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Costo del Venduto (COGS & Produzione)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.costoProduzione).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>Gross Margin</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.grossMargin).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Costi Operativi (OPEX & Personale)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.opex).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row"><td>EBITDA (Margine Operativo Lordo)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.ebitda).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Ammortamenti Impianti & CAPEX</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.ammortamenti).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>EBIT (Risultato Operativo)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.ebit).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Oneri Finanziari (Interessi Passivi)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.oneriFinanziari).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Imposte d'Esercizio (24%)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.imposte).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>Utile Netto d'Esercizio</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.utileNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 15px;">2. Stato Patrimoniale Pluriennale (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Voce Patrimoniale (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Immobilizzazioni Nette</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.immobilizzazioniNette).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Capitale Circolante Netto (CCN)</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.ccn).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Cassa & Liquidità Disponibile</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.cassa).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row"><td>Totale Attivo Patrimoniale</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.totaleAttivo).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Debito Finanziario Residuo</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.debitoResiduo).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Patrimonio Netto</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.patrimonioNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>Totale Passivo & Netto</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.totalePassivoNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 15px;">3. Rendiconto Finanziario / Cash Flow (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Flussi di Cassa (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>FCF Operativo</td>${financialReports.cashFlow.map((c: any) => `<td>€ ${Math.round(c.fcfOperativo).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Servizio del Debito</td>${financialReports.cashFlow.map((c: any) => `<td>€ -${Math.round(c.servizioDebito).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Investimenti CAPEX</td>${financialReports.cashFlow.map((c: any) => `<td>€ -${Math.round(c.capex).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>Cash Flow Netto Annuo</td>${financialReports.cashFlow.map((c: any) => `<td>€ ${Math.round(c.fcfNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>Cassa Cumulata Fine Anno</td>${financialReports.cashFlow.map((c: any) => `<td>€ ${Math.round(c.cassaCumulata).toLocaleString('it-IT')}</td>`).join('')}</tr>
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 15px;">4. Piano del Debito & Copertura DSCR (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Voce Servizio Debito (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Debito Inizio Anno</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.debitoInizio).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Quota Capitale Rimborsata</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.quotaCapitale).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Interessi Passivi</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.interessi).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>Servizio Debito Totale</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.servizioDebito).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Debito Residuo Fine Anno</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.debitoFine).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>DSCR (Copertura Finanziaria)</td>${financialReports.pianoDebito.map((d: any) => `<td>${d.dscr.toFixed(2)}x</td>`).join('')}</tr>
        </tbody>
      </table>

      <div class="section-title" style="margin-top: 15px;">5. KPI & Indici Strategici Pluriennali (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Indicatore / KPI</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>EBITDA Margin (%)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.ebitdaMargin.toFixed(1)}%</td>`).join('')}</tr>
          <tr><td>ROS (Return on Sales)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.ros.toFixed(1)}%</td>`).join('')}</tr>
          <tr class="highlight-row"><td>ROI (Return on Investment)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.roi.toFixed(1)}%</td>`).join('')}</tr>
          <tr class="highlight-row"><td>ROE (Return on Equity)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.roe.toFixed(1)}%</td>`).join('')}</tr>
          <tr><td>Indice di Indebitamento (Leverage)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.leverage.toFixed(2)}x</td>`).join('')}</tr>
          <tr class="bold-row"><td>DSCR (Copertura Finanziaria)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.dscr.toFixed(2)}x</td>`).join('')}</tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'ce' && financialReports) {
    sectionSpecificHtml = `
      <div class="section-title">Conto Economico Proiettato (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Voce Economica (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Ricavi delle Vendite (Cash Receipts)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.ricavi).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Costo del Venduto (COGS & Produzione)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.costoProduzione).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>Gross Margin</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.grossMargin).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Costi Operativi (OPEX & Personale)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.opex).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row"><td>EBITDA (Margine Operativo Lordo)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.ebitda).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Ammortamenti Impianti & CAPEX</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.ammortamenti).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>EBIT (Risultato Operativo)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.ebit).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Oneri Finanziari (Interessi Passivi)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.oneriFinanziari).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Imposte d'Esercizio (24%)</td>${financialReports.contoEconomico.map((r: any) => `<td>€ -${Math.round(r.imposte).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>Utile Netto d'Esercizio</td>${financialReports.contoEconomico.map((r: any) => `<td>€ ${Math.round(r.utileNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'sp' && financialReports) {
    sectionSpecificHtml = `
      <div class="section-title">Stato Patrimoniale Pluriennale (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Voce Patrimoniale (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Immobilizzazioni Nette</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.immobilizzazioniNette).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Capitale Circolante Netto (CCN)</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.ccn).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Cassa & Liquidità Disponibile</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.cassa).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row"><td>Totale Attivo Patrimoniale</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.totaleAttivo).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Debito Finanziario Residuo</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.debitoResiduo).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Patrimonio Netto</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.patrimonioNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>Totale Passivo & Netto</td>${financialReports.statoPatrimoniale.map((s: any) => `<td>€ ${Math.round(s.totalePassivoNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'cashflow' && financialReports) {
    sectionSpecificHtml = `
      <div class="section-title">Rendiconto Finanziario / Cash Flow (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Flussi di Cassa (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>FCF Operativo</td>${financialReports.cashFlow.map((c: any) => `<td>€ ${Math.round(c.fcfOperativo).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Servizio del Debito</td>${financialReports.cashFlow.map((c: any) => `<td>€ -${Math.round(c.servizioDebito).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Investimenti CAPEX</td>${financialReports.cashFlow.map((c: any) => `<td>€ -${Math.round(c.capex).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>Cash Flow Netto Annuo</td>${financialReports.cashFlow.map((c: any) => `<td>€ ${Math.round(c.fcfNetto).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>Cassa Cumulata Fine Anno</td>${financialReports.cashFlow.map((c: any) => `<td>€ ${Math.round(c.cassaCumulata).toLocaleString('it-IT')}</td>`).join('')}</tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'debito' && financialReports) {
    sectionSpecificHtml = `
      <div class="section-title">Piano del Debito & Copertura DSCR (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Voce Servizio Debito (€)</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Debito Inizio Anno</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.debitoInizio).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Quota Capitale Rimborsata</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.quotaCapitale).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Interessi Passivi</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.interessi).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>Servizio Debito Totale</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.servizioDebito).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr><td>Debito Residuo Fine Anno</td>${financialReports.pianoDebito.map((d: any) => `<td>€ ${Math.round(d.debitoFine).toLocaleString('it-IT')}</td>`).join('')}</tr>
          <tr class="bold-row" style="background: #0f172a; color: #ccff00;"><td>DSCR (Copertura Finanziaria)</td>${financialReports.pianoDebito.map((d: any) => `<td>${d.dscr.toFixed(2)}x</td>`).join('')}</tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'kpi' && financialReports) {
    sectionSpecificHtml = `
      <div class="section-title">KPI & Indici Strategici Pluriennali (Anni 1 - 5)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Indicatore / KPI</th>
            <th>Anno 1</th><th>Anno 2</th><th>Anno 3</th><th>Anno 4</th><th>Anno 5</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>EBITDA Margin (%)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.ebitdaMargin.toFixed(1)}%</td>`).join('')}</tr>
          <tr><td>ROS (Return on Sales)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.ros.toFixed(1)}%</td>`).join('')}</tr>
          <tr class="highlight-row"><td>ROI (Return on Investment)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.roi.toFixed(1)}%</td>`).join('')}</tr>
          <tr class="highlight-row"><td>ROE (Return on Equity)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.roe.toFixed(1)}%</td>`).join('')}</tr>
          <tr><td>Indice di Indebitamento (Leverage)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.leverage.toFixed(2)}x</td>`).join('')}</tr>
          <tr class="bold-row"><td>DSCR (Copertura Finanziaria)</td>${financialReports.indiciPluriennali.map((i: any) => `<td>${i.dscr.toFixed(2)}x</td>`).join('')}</tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'questionari') {
    sectionSpecificHtml = `
      <div class="section-title">Report Sezione Questionari & Risposte Clienti</div>
      ${forms.map(f => {
        const fDom = domande.filter((d: any) => d.form_id === f.id);
        return `
          <div style="margin-bottom: 12px; border: 0.5px solid #cbd5e1; padding: 10px; background: #f8fafc;">
            <strong style="font-size: 9px; color: #0f172a;">${f.titolo}</strong>
            <p style="font-size: 7.5px; color: #64748b; margin: 2px 0 6px 0;">${f.descrizione || ''}</p>
            ${fDom.map((dom: any, idx: number) => {
              const resp = risposteClienti.find((r: any) => r.domanda_id === dom.id);
              return `
                <div style="font-size: 8px; background: #ffffff; padding: 6px; margin-bottom: 4px; border: 0.5px solid #e2e8f0;">
                  <div><strong>#${idx + 1} ${dom.testo_domanda}</strong></div>
                  <div style="color: #0284c7; margin-top: 3px; font-weight: 600;">Risposta: ${resp ? resp.valore_risposta : 'Nessuna risposta inviata'}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    `;
  } else if (targetSection === 'cronoprogramma') {
    sectionSpecificHtml = `
      <div class="section-title">Cronoprogramma & Roadmap Operativa (Tasks & Sub-tasks)</div>
      <table class="fin-table">
        <thead>
          <tr>
            <th>Codice</th>
            <th>Task / Sub-task Operativo</th>
            <th>Inizio → Fine</th>
            <th>Owner</th>
            <th>Budget (€)</th>
            <th>Reale (€)</th>
            <th>Stato</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1.1</td><td>Audit dei processi e analisi dati iniziali</td><td>2026-03-01 → 2026-03-10</td><td>Team GOS</td><td>€ 5.000</td><td>€ 4.800</td><td>Completato</td></tr>
          <tr><td>↳ 101</td><td>Raccolta flussi documentali</td><td>2026-03-01 → 2026-03-05</td><td>Team GOS</td><td>€ 2.000</td><td>€ 1.900</td><td>Completato</td></tr>
          <tr><td>↳ 102</td><td>Colloqui preliminari con management</td><td>2026-03-06 → 2026-03-10</td><td>Team GOS</td><td>€ 3.000</td><td>€ 2.900</td><td>Completato</td></tr>
          <tr><td>1.2</td><td>Sottoscrizione NDA ed exchange bilanci</td><td>2026-03-11 → 2026-03-15</td><td>Cliente</td><td>€ 1.500</td><td>€ 1.500</td><td>Completato</td></tr>
          <tr><td>2.1</td><td>Setup GOS Business Plan Engine e KPI</td><td>2026-03-16 → 2026-03-31</td><td>Team GOS</td><td>€ 8.000</td><td>€ 8.500</td><td>In Corso</td></tr>
        </tbody>
      </table>
    `;
  } else if (targetSection === 'ruoli') {
    sectionSpecificHtml = `
      <div class="section-title">Organigramma & Risorse (Governance)</div>
      <table class="fin-table" style="margin-top: 8px;">
        <thead>
          <tr>
            <th>Ruolo & Posizione</th>
            <th>Nome e Cognome</th>
            <th>Società</th>
            <th>Paese</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${customTeamMembers.map(m => `
            <tr>
              <td style="font-weight: 800; color: #0f172a;">${m.ruolo}</td>
              <td style="font-weight: 800; color: #0284c7; font-family: sans-serif;">${m.nome} ${m.cognome}</td>
              <td>${m.societa}</td>
              <td>${m.paese}</td>
              <td>${m.email}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  const reportHtml = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>GOS 1.0 — ${metaInfo.title} — ${azienda.ragione_sociale}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 12mm 12mm 12mm 12mm;
        }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #ffffff;
          color: #0f172a;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
        }

        .page-sheet {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          margin: 0 auto 15mm auto;
          background: #ffffff;
          box-sizing: border-box;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media screen {
          .page-sheet {
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            margin-bottom: 20px;
            border: 1px solid #cbd5e1;
          }
        }

        @media print {
          body {
            background: transparent;
          }
          .page-sheet {
            box-shadow: none;
            margin: 0;
            width: 100%;
            min-height: 100vh;
            page-break-after: always;
            page-break-inside: avoid;
          }
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 0.5px solid #cbd5e1;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }

        .logo-box img {
          height: 60px;
          width: auto;
          object-fit: contain;
        }

        .header-meta {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          text-align: right;
          line-height: 1.3;
        }

        .page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 0.5px solid #cbd5e1;
          padding-top: 8px;
          margin-top: 15px;
          font-size: 8px;
          font-weight: 700;
          color: #475569;
        }

        .page-content {
          flex: 1;
        }

        h2 {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px 0;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }

        .meta-card {
          background: #f8fafc;
          border: 0.5px solid #e2e8f0;
          padding: 6px;
        }

        .meta-card span {
          display: block;
          font-size: 7px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
        }

        .meta-card strong {
          font-size: 10px;
          font-weight: 800;
          color: #0f172a;
        }

        .section-title {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0f172a;
          background: #f1f5f9;
          border-left: 3px solid #0f172a;
          padding: 5px 8px;
          margin: 8px 0 6px 0;
        }

        table.fin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7px;
          margin-bottom: 6px;
        }

        table.fin-table th {
          background: #0f172a;
          color: #ffffff;
          padding: 4px 5px;
          text-align: right;
          font-weight: 700;
        }

        table.fin-table th:first-child {
          text-align: left;
        }

        table.fin-table td {
          padding: 3px 5px;
          border-bottom: 0.5px solid #e2e8f0;
          text-align: right;
          font-family: monospace;
        }

        table.fin-table td:first-child {
          text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
        }

        .highlight-row {
          background: #f1f5f9;
          font-weight: 700;
        }

        .bold-row {
          font-weight: 800;
          background: #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="page-sheet">
        <div class="page-header">
          <div class="logo-box">
            <img src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S.-Black-2.png" alt="Glaring Logo" />
          </div>
          <div class="header-meta">
            GOS 1.0 — ${metaInfo.title}<br />
            <span style="font-weight: 400; color: #64748b;">${currentDate} — ${userDisplayName}</span>
          </div>
        </div>

        <div class="page-content">
          <div>
            <h2>${azienda.ragione_sociale}</h2>
            <p style="font-size: 8px; color: #64748b; margin: 0 0 10px 0;">Modulo Sezione: <strong>${metaInfo.title}</strong> (${metaInfo.type}) — Glaring LLP Infrastructure</p>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <span>Settore</span>
              <strong>${azienda.settore || 'Generale'}</strong>
            </div>
            <div class="meta-card">
              <span>NPV (Valore Attuale Netto)</span>
              <strong style="color: #0284c7;">€ ${npvFormatted}</strong>
            </div>
            <div class="meta-card">
              <span>IRR di Progetto</span>
              <strong style="color: #16a34a;">${irrFormatted}%</strong>
            </div>
            <div class="meta-card">
              <span>Paese</span>
              <strong style="color: #6366f1;">${azienda.paese || 'Italia'}</strong>
            </div>
          </div>

          ${sectionSpecificHtml}
        </div>

        <div class="page-footer">
          <span>GOS 1.0 — Strategic & Operation Advisors Infrastructure</span>
          <span>Glaring LLP © 2026</span>
        </div>
      </div>
    </body>
    </html>
  `;

  if (onShowPreview) {
    onShowPreview(reportHtml);
  } else {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { printWindow.print(); }, 500);
    }
  }
};


export default function GOSDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [currentUserProfile, setCurrentUserProfile] = useState<{ nome?: string; cognome?: string; email?: string; ruolo?: string } | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  const [currentView, setCurrentView] = useState<'aziende' | 'master' | 'utenti'>('aziende');
  const [activeTab, setActiveTab] = useState<'executive' | 'questionari' | 'business_plan' | 'cronoprogramma' | 'ruoli'>('executive');
  const [bpSubTab, setBpSubTab] = useState<'input' | 'ce' | 'sp' | 'cashflow' | 'debito' | 'indexes'>('input');

  const [beginningBalance, setBeginningBalance] = useState({ y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 });

  const [prodotti, setProdotti] = useState([
    { 
      id: 1, 
      nome: '', 
      q: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      prezzo: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
      costo: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }
    },
  ]);

  const [costiProduzioneExtra, setCostiProduzioneExtra] = useState([
    { id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
  ]);

  const [personale, setPersonale] = useState([
    { id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
  ]);

  const [altriCosti, setAltriCosti] = useState([
    { id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
  ]);

  const [capex, setCapex] = useState([
    { id: 1, voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
  ]);

  const [finanziamenti, setFinanziamenti] = useState([
    { id: 1, banca: '', importo: 0, tasso: 0, durata: 5 },
  ]);

  const [aliquotaFiscale, setAliquotaFiscale] = useState<number>(0.24);
  const [wacc, setWacc] = useState<number>(0.09);

  // STATO PER LA SEZIONE RUOLI & GOVERNANCE (AGGIUNGIBILE, MODIFICABILE, ELIMINABILE)
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, ruolo: 'Senior Executive Partner', nome: 'Corrado', cognome: 'Pinna', email: 'support@glaring.world', paese: 'Italia', societa: 'Glaring LLP' },
    { id: 2, ruolo: 'Operations & Financial Lead', nome: 'Advisor', cognome: 'Glaring', email: 'advisor@glaring.world', paese: 'Regno Unito', societa: 'Glaring LLP' },
    { id: 3, ruolo: 'Responsabile Progetto / CEO', nome: 'Referente', cognome: 'Cliente', email: 'ceo@cliente.com', paese: 'Italia', societa: 'Azienda Cliente S.r.l.' },
    { id: 4, ruolo: 'Compilatore Questionari GOS', nome: 'Utente', cognome: 'Cliente', email: 'user@cliente.com', paese: 'Italia', societa: 'Azienda Cliente S.r.l.' }
  ]);

  const [showModalTeam, setShowModalTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [inputTeamRuolo, setInputTeamRuolo] = useState('');
  const [inputTeamNome, setInputTeamNome] = useState('');
  const [inputTeamCognome, setInputTeamCognome] = useState('');
  const [inputTeamEmail, setInputTeamEmail] = useState('');
  const [inputTeamPaese, setInputTeamPaese] = useState('Italia');
  const [inputTeamSocieta, setInputTeamSocieta] = useState('Glaring LLP');

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTeamRuolo.trim() || !inputTeamNome.trim()) return;

    if (editingTeamId) {
      setTeamMembers(teamMembers.map(m => m.id === editingTeamId ? {
        ...m,
        ruolo: inputTeamRuolo.trim(),
        nome: inputTeamNome.trim(),
        cognome: inputTeamCognome.trim(),
        email: inputTeamEmail.trim(),
        paese: inputTeamPaese.trim(),
        societa: inputTeamSocieta.trim()
      } : m));
    } else {
      const newMember = {
        id: Date.now(),
        ruolo: inputTeamRuolo.trim(),
        nome: inputTeamNome.trim(),
        cognome: inputTeamCognome.trim(),
        email: inputTeamEmail.trim(),
        paese: inputTeamPaese.trim(),
        societa: inputTeamSocieta.trim()
      };
      setTeamMembers([...teamMembers, newMember]);
    }

    setShowModalTeam(false);
    setEditingTeamId(null);
    setInputTeamRuolo('');
    setInputTeamNome('');
    setInputTeamCognome('');
    setInputTeamEmail('');
  };

  const handleDeleteTeamMember = (id: number) => {
    if (!confirm('Sei sicuro di voler rimuovere questa risorsa dall\'organigramma?')) return;
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleOpenEditTeamMember = (m: any) => {
    setEditingTeamId(m.id);
    setInputTeamRuolo(m.ruolo);
    setInputTeamNome(m.nome);
    setInputTeamCognome(m.cognome);
    setInputTeamEmail(m.email);
    setInputTeamPaese(m.paese);
    setInputTeamSocieta(m.societa);
    setShowModalTeam(true);
  };

  const [roadmapTasks, setRoadmapTasks] = useState([
    { 
      id: 1, 
      fase: 'Fase 1', 
      codice: '1.1', 
      task: 'Audit dei processi e analisi dati iniziali', 
      owner: 'Team GOS', 
      inizio: '2026-03-01', 
      fine: '2026-03-10', 
      giorni: 10, 
      budget: 5000,
      reale: 4800,
      stato: 'Completato',
      subtasks: [
        { id: 101, titolo: 'Raccolta flussi documentali', inizio: '2026-03-01', fine: '2026-03-05', budget: 2000, reale: 1900, stato: 'Completato' },
        { id: 102, titolo: 'Colloqui preliminari con management', inizio: '2026-03-06', fine: '2026-03-10', budget: 3000, reale: 2900, stato: 'Completato' }
      ]
    },
    { 
      id: 2, 
      fase: 'Fase 1', 
      codice: '1.2', 
      task: 'Sottoscrizione NDA ed exchange bilanci', 
      owner: 'Cliente', 
      inizio: '2026-03-11', 
      fine: '2026-03-15', 
      giorni: 5, 
      budget: 1500,
      reale: 1500,
      stato: 'Completato',
      subtasks: [
        { id: 201, titolo: 'Verifica legale NDA', inizio: '2026-03-11', fine: '2026-03-15', budget: 1500, reale: 1500, stato: 'Completato' }
      ]
    },
    { 
      id: 3, 
      fase: 'Fase 2', 
      codice: '2.1', 
      task: 'Setup GOS Business Plan Engine e KPI', 
      owner: 'Team GOS', 
      inizio: '2026-03-16', 
      fine: '2026-03-31', 
      giorni: 16, 
      budget: 8000,
      reale: 8500,
      stato: 'In Corso',
      subtasks: [
        { id: 301, titolo: 'Configurazione database Supabase', inizio: '2026-03-16', fine: '2026-03-22', budget: 4000, reale: 4200, stato: 'Completato' },
        { id: 302, titolo: 'Impostazione formule di bilancio', inizio: '2026-03-23', fine: '2026-03-31', budget: 4000, reale: 4300, stato: 'In Corso' }
      ]
    }
  ]);

  const [showModalTask, setShowModalTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskFase, setNewTaskFase] = useState('Fase 2');
  const [newTaskCodice, setNewTaskCodice] = useState('2.3');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('Team GOS');
  const [newTaskInizio, setNewTaskInizio] = useState('2026-05-01');
  const [newTaskFine, setNewTaskFine] = useState('2026-05-15');
  const [newTaskGiorni, setNewTaskGiorni] = useState(14);
  const [newTaskBudget, setNewTaskBudget] = useState(5000);
  const [newTaskReale, setNewTaskReale] = useState(5000);
  const [newTaskStato, setNewTaskStato] = useState('Pianificato');

  const [showModalSubtask, setShowModalSubtask] = useState(false);
  const [currentParentTaskId, setCurrentParentTaskId] = useState<number | null>(null);
  const [newSubtaskTitolo, setNewSubtaskTitolo] = useState('');
  const [newSubtaskInizio, setNewSubtaskInizio] = useState('2026-05-01');
  const [newSubtaskFine, setNewSubtaskFine] = useState('2026-05-07');
  const [newSubtaskBudget, setNewSubtaskBudget] = useState(1000);
  const [newSubtaskReale, setNewSubtaskReale] = useState(1000);
  const [newSubtaskStato, setNewSubtaskStato] = useState('Pianificato');
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);

  const [savingFinancials, setSavingFinancials] = useState(false);

  const projectTimelineSummary = useMemo(() => {
    if (!roadmapTasks || roadmapTasks.length === 0) return { minInizio: '-', maxFine: '-', totalGiorni: 0 };
    
    let minDate = roadmapTasks[0].inizio;
    let maxDate = roadmapTasks[0].fine;
    let totalGiorni = 0;

    roadmapTasks.forEach(t => {
      totalGiorni += Number(t.giorni || 0);
      if (t.inizio && t.inizio < minDate) minDate = t.inizio;
      if (t.fine && t.fine > maxDate) maxDate = t.fine;
    });

    return { minInizio: minDate, maxFine: maxDate, totalGiorni };
  }, [roadmapTasks]);

  const updateDaysBetween = (start: string, end: string, setter: (val: number) => void) => {
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) setter(diffDays);
    }
  };

  const handleAddProdotto = () => setProdotti([...prodotti, { 
    id: Date.now(), 
    nome: '', 
    q: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
    prezzo: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 },
    costo: { y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }
  }]);
  const handleDelProdotto = (id: number) => setProdotti(prodotti.filter(p => p.id !== id));

  const handleAddCostoExtra = () => setCostiProduzioneExtra([...costiProduzioneExtra, { id: Date.now(), voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const handleDelCostoExtra = (id: number) => setCostiProduzioneExtra(costiProduzioneExtra.filter(c => c.id !== id));

  const handleAddPersonale = () => setPersonale([...personale, { id: Date.now(), voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const handleDelPersonale = (id: number) => setPersonale(personale.filter(p => p.id !== id));

  const handleAddCosto = () => setAltriCosti([...altriCosti, { id: Date.now(), voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const handleDelCosto = (id: number) => setAltriCosti(altriCosti.filter(c => c.id !== id));

  const handleAddCapex = () => setCapex([...capex, { id: Date.now(), voce: '', y1: 0, y2: 0, y3: 0, y4: 0, y5: 0 }]);
  const handleDelCapex = (id: number) => setCapex(capex.filter(c => c.id !== id));

  const handleAddFinanziamento = () => setFinanziamenti([...finanziamenti, { id: Date.now(), banca: '', importo: 0, tasso: 0, durata: 5 }]);
  const handleDelFinanziamento = (id: number) => setFinanziamenti(finanziamenti.filter(f => f.id !== id));

  const handleSaveRoadmapTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;

    if (editingTaskId) {
      setRoadmapTasks(roadmapTasks.map(t => t.id === editingTaskId ? {
        ...t,
        fase: newTaskFase,
        codice: newTaskCodice,
        task: newTaskDesc.trim(),
        owner: newTaskOwner,
        inizio: newTaskInizio,
        fine: newTaskFine,
        giorni: Number(newTaskGiorni),
        budget: Number(newTaskBudget),
        reale: Number(newTaskReale),
        stato: newTaskStato
      } : t));
    } else {
      const newTask = {
        id: Date.now(),
        fase: newTaskFase,
        codice: newTaskCodice,
        task: newTaskDesc.trim(),
        owner: newTaskOwner,
        inizio: newTaskInizio,
        fine: newTaskFine,
        giorni: Number(newTaskGiorni),
        budget: Number(newTaskBudget),
        reale: Number(newTaskReale),
        stato: newTaskStato,
        subtasks: []
      };
      setRoadmapTasks([...roadmapTasks, newTask]);
    }

    setNewTaskDesc('');
    setEditingTaskId(null);
    setShowModalTask(false);
  };

  const handleDeleteRoadmapTask = (id: number) => {
    setRoadmapTasks(roadmapTasks.filter(t => t.id !== id));
  };

  const handleOpenEditTask = (t: any) => {
    setEditingTaskId(t.id);
    setNewTaskFase(t.fase);
    setNewTaskCodice(t.codice);
    setNewTaskDesc(t.task);
    setNewTaskOwner(t.owner);
    setNewTaskInizio(t.inizio);
    setNewTaskFine(t.fine);
    setNewTaskGiorni(t.giorni);
    setNewTaskBudget(t.budget || 0);
    setNewTaskReale(t.reale || 0);
    setNewTaskStato(t.stato);
    setShowModalTask(true);
  };

  const handleSaveSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitolo.trim() || currentParentTaskId === null) return;

    setRoadmapTasks(roadmapTasks.map(t => {
      if (t.id === currentParentTaskId) {
        let updatedSubtasks = [...(t.subtasks || [])];
        if (editingSubtaskId) {
          updatedSubtasks = updatedSubtasks.map(st => st.id === editingSubtaskId ? {
            ...st,
            titolo: newSubtaskTitolo.trim(),
            inizio: newSubtaskInizio,
            fine: newSubtaskFine,
            budget: Number(newSubtaskBudget),
            reale: Number(newSubtaskReale),
            stato: newSubtaskStato
          } : st);
        } else {
          updatedSubtasks.push({
            id: Date.now(),
            titolo: newSubtaskTitolo.trim(),
            inizio: newSubtaskInizio,
            fine: newSubtaskFine,
            budget: Number(newSubtaskBudget),
            reale: Number(newSubtaskReale),
            stato: newSubtaskStato
          });
        }
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));

    setNewSubtaskTitolo('');
    setEditingSubtaskId(null);
    setCurrentParentTaskId(null);
    setShowModalSubtask(false);
  };

  const handleDeleteSubtask = (taskId: number, subtaskId: number) => {
    setRoadmapTasks(roadmapTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.filter((st: any) => st.id !== subtaskId) };
      }
      return t;
    }));
  };

  const handleOpenEditSubtask = (taskId: number, st: any) => {
    setCurrentParentTaskId(taskId);
    setEditingSubtaskId(st.id);
    setNewSubtaskTitolo(st.titolo);
    setNewSubtaskInizio(st.inizio || '2026-05-01');
    setNewSubtaskFine(st.fine || '2026-05-07');
    setNewSubtaskBudget(st.budget);
    setNewSubtaskReale(st.reale);
    setNewSubtaskStato(st.stato);
    setShowModalSubtask(true);
  };

  const calculateIRR = (initialInvestment: number, cashFlows: number[]) => {
    const cfs = [-initialInvestment, ...cashFlows];
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cfs.length; t++) {
        npv += cfs[t] / Math.pow(1 + rate, t);
        if (t > 0) {
          dnpv -= t * cfs[t] / Math.pow(1 + rate, t + 1);
        }
      }
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 1e-7) return newRate;
      rate = newRate;
      if (isNaN(rate) || !isFinite(rate)) return 0;
    }
    return rate;
  };

  const financialReports = useMemo(() => {
    const anni = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];

    const ricaviAnnali = [0, 0, 0, 0, 0];
    const costoProduzioneAnnali = [0, 0, 0, 0, 0];

    prodotti.forEach(p => {
      ricaviAnnali[0] += p.q.y1 * p.prezzo.y1;
      ricaviAnnali[1] += p.q.y2 * p.prezzo.y2;
      ricaviAnnali[2] += p.q.y3 * p.prezzo.y3;
      ricaviAnnali[3] += p.q.y4 * p.prezzo.y4;
      ricaviAnnali[4] += p.q.y5 * p.prezzo.y5;

      costoProduzioneAnnali[0] += p.q.y1 * p.costo.y1;
      costoProduzioneAnnali[1] += p.q.y2 * p.costo.y2;
      costoProduzioneAnnali[2] += p.q.y3 * p.costo.y3;
      costoProduzioneAnnali[3] += p.q.y4 * p.costo.y4;
      costoProduzioneAnnali[4] += p.q.y5 * p.costo.y5;
    });

    costiProduzioneExtra.forEach(ce => {
      costoProduzioneAnnali[0] += ce.y1;
      costoProduzioneAnnali[1] += ce.y2;
      costoProduzioneAnnali[2] += ce.y3;
      costoProduzioneAnnali[3] += ce.y4;
      costoProduzioneAnnali[4] += ce.y5;
    });

    const personaleAnnali = [0, 0, 0, 0, 0];
    personale.forEach(item => {
      personaleAnnali[0] += item.y1; personaleAnnali[1] += item.y2; personaleAnnali[2] += item.y3; personaleAnnali[3] += item.y4; personaleAnnali[4] += item.y5;
    });

    const altriCostiAnnali = [0, 0, 0, 0, 0];
    altriCosti.forEach(item => {
      altriCostiAnnali[0] += item.y1; altriCostiAnnali[1] += item.y2; altriCostiAnnali[2] += item.y3; altriCostiAnnali[3] += item.y4; altriCostiAnnali[4] += item.y5;
    });

    const opexAnnali = anni.map((_, i) => personaleAnnali[i] + altriCostiAnnali[i]);

    const capexAnnali = [0, 0, 0, 0, 0];
    capex.forEach(c => {
      capexAnnali[0] += c.y1; capexAnnali[1] += c.y2; capexAnnali[2] += c.y3; capexAnnali[3] += c.y4; capexAnnali[4] += c.y5;
    });
    const ammortamentiAnnali = capexAnnali.map(val => val / 5);

    const contoEconomico = anni.map((_, idx) => {
      const ricavi = ricaviAnnali[idx];
      const costoProduzione = costoProduzioneAnnali[idx];
      const grossMargin = ricavi - costoProduzione;
      const opex = opexAnnali[idx];
      const ebitda = grossMargin - opex;
      const ammortamenti = ammortamentiAnnali[idx];
      const ebit = ebitda - ammortamenti;

      const oneriFinanziari = finanziamenti.reduce((acc, f) => {
        const residuo = Math.max(0, f.importo - (f.importo / f.durata) * idx);
        return acc + (residuo * f.tasso);
      }, 0);

      const ebt = ebit - oneriFinanziari;
      const imposte = ebt > 0 ? ebt * aliquotaFiscale : 0;
      const utileNetto = ebt - imposte;

      return { anno: idx + 1, ricavi, costoProduzione, grossMargin, opex, ebitda, ammortamenti, ebit, oneriFinanziari, ebt, imposte, utileNetto };
    });

    let debitoResiduo = finanziamenti.reduce((acc, f) => acc + f.importo, 0);
    const pianoDebito = anni.map((_, idx) => {
      const anno = idx + 1;
      const quotaCapitale = finanziamenti.reduce((acc, f) => anno <= f.durata ? acc + (f.importo / f.durata) : acc, 0);
      const interessi = finanziamenti.reduce((acc, f) => {
        const deb = Math.max(0, f.importo - (f.importo / f.durata) * idx);
        return acc + (deb * f.tasso);
      }, 0);
      const servizioDebito = quotaCapitale + interessi;
      const debitoInizio = debitoResiduo;
      debitoResiduo = Math.max(0, debitoResiduo - quotaCapitale);
      const dscr = servizioDebito > 0 ? contoEconomico[idx].ebitda / servizioDebito : 0;

      return { anno, debitoInizio, quotaCapitale, interessi, servizioDebito, debitoFine: debitoResiduo, dscr };
    });

    let cassaCumulata = beginningBalance.y1;
    const cashFlow = anni.map((_, idx) => {
      const ce = contoEconomico[idx];
      const pd = pianoDebito[idx];
      const cap = capexAnnali[idx];
      const fcfOp = ce.ebitda - ce.imposte;
      const fcfNetto = fcfOp - cap - pd.servizioDebito;
      if (idx === 0) {
        cassaCumulata = beginningBalance.y1 + fcfNetto;
      } else if (idx === 1) {
        cassaCumulata = beginningBalance.y2 + fcfNetto;
      } else if (idx === 2) {
        cassaCumulata = beginningBalance.y3 + fcfNetto;
      } else if (idx === 3) {
        cassaCumulata = beginningBalance.y4 + fcfNetto;
      } else {
        cassaCumulata = beginningBalance.y5 + fcfNetto;
      }
      return { anno: idx + 1, fcfOperativo: fcfOp, capex: cap, servizioDebito: pd.servizioDebito, fcfNetto, cassaCumulata };
    });

    let utileAcc = 0;
    const equityIniziale = capexAnnali[0] > 0 ? capexAnnali[0] * 0.4 : 0;
    const statoPatrimoniale = anni.map((_, idx) => {
      const ce = contoEconomico[idx];
      const capCumulato = capexAnnali.slice(0, idx + 1).reduce((a, b) => a + b, 0);
      const ammCumulato = ammortamentiAnnali.slice(0, idx + 1).reduce((a, b) => a + b, 0);
      const immobilizzazioniNette = Math.max(0, capCumulato - ammCumulato);
      const ccn = ce.ricavi * 0.15;
      const cassa = cashFlow[idx].cassaCumulata;
      const totaleAttivo = immobilizzazioniNette + ccn + Math.max(0, cassa);

      const debitoResiduoFin = pianoDebito[idx].debitoFine;
      utileAcc += ce.utileNetto;
      const patrimonioNetto = equityIniziale + utileAcc;
      const totalePassivoNetto = debitoResiduoFin + patrimonioNetto;

      return { anno: idx + 1, immobilizzazioniNette, ccn, cassa, totaleAttivo, debitoResiduo: debitoResiduoFin, patrimonioNetto, totalePassivoNetto };
    });

    const indiciPluriennali = anni.map((_, idx) => {
      const ce = contoEconomico[idx];
      const sp = statoPatrimoniale[idx];
      const pd = pianoDebito[idx];

      const ebitdaMargin = ce.ricavi > 0 ? (ce.ebitda / ce.ricavi) * 100 : 0;
      const ros = ce.ricavi > 0 ? (ce.ebit / ce.ricavi) * 100 : 0;
      const roi = sp.totaleAttivo > 0 ? (ce.ebit / sp.totaleAttivo) * 100 : 0;
      const roe = sp.patrimonioNetto > 0 ? (ce.utileNetto / sp.patrimonioNetto) * 100 : 0;
      const leverage = sp.patrimonioNetto > 0 ? sp.totaleAttivo / sp.patrimonioNetto : 0;
      const dscr = pd.dscr;

      return { anno: idx + 1, ebitdaMargin, ros, roi, roe, leverage, dscr };
    });

    let npv = -capexAnnali[0];
    cashFlow.forEach((fc, i) => {
      npv += fc.fcfOperativo / Math.pow(1 + wacc, i + 1);
    });

    const initialInv = capexAnnali[0] || 1;
    const projectCashFlows = cashFlow.map(c => c.fcfNetto);
    const calculatedIrr = calculateIRR(initialInv, projectCashFlows);

    const fatturatoTotale5Anni = contoEconomico.reduce((acc, r) => acc + r.ricavi, 0);
    const ebitdaMedio5Anni = contoEconomico.reduce((acc, r) => acc + r.ebitda, 0) / 5;

    return { 
      contoEconomico, 
      pianoDebito, 
      cashFlow, 
      statoPatrimoniale, 
      indiciPluriennali,
      fatturatoTotale5Anni,
      ebitdaMedio5Anni,
      kpis: { npv, irr: calculatedIrr }, 
      inputs: { prodotti, costiProduzioneExtra, personale, altriCosti, capex, finanziamenti, beginningBalance, aliquotaFiscale, wacc }
    };
  }, [prodotti, costiProduzioneExtra, personale, altriCosti, capex, finanziamenti, beginningBalance, aliquotaFiscale, wacc]);

  const [aziende, setAziende] = useState<any[]>([]);
  const [masterForms, setMasterForms] = useState<any[]>([]);
  const [masterDomande, setMasterDomande] = useState<any[]>([]);
  const [glaringUsers, setGlaringUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAzienda, setSelectedAzienda] = useState<any | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [domande, setDomande] = useState<any[]>([]);
  const [risposteClienti, setRisposteClienti] = useState<any[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [openFormsState, setOpenFormsState] = useState<{ [key: string]: boolean }>({});

  const [selectedMasterForm, setSelectedMasterForm] = useState<any | null>(null);
  const [previewAziendaId, setPreviewAziendaId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{ azienda: any; forms: any[]; domande: any[] } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [clientAnswers, setClientAnswers] = useState<{ [key: string]: string }>({});
  const [submittingClientAnswers, setSubmittingClientAnswers] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [reportPreviewHtml, setReportPreviewHtml] = useState<string | null>(null);

  const [editingDomandaId, setEditingDomandaId] = useState<string | null>(null);
  const [editTestoDomanda, setEditTestoDomanda] = useState('');
  const [editCategoriaDomanda, setEditCategoriaDomanda] = useState('');

  const [showModalAzienda, setShowModalAzienda] = useState(false);
  const [editingAziendaId, setEditingAziendaId] = useState<string | null>(null);
  const [ragioneSociale, setRagioneSociale] = useState('');
  const [settore, setSettore] = useState('');
  const [paese, setPaese] = useState('Italia');
  const [saving, setSaving] = useState(false);

  const [showModalForm, setShowModalForm] = useState(false);
  const [titoloForm, setTitoloForm] = useState('');
  const [descrizioneForm, setDescrizioneForm] = useState('');
  const [selectedMasterId, setSelectedMasterId] = useState<string>('');

  const [showModalMasterForm, setShowModalMasterForm] = useState(false);
  const [codiceMaster, setCodiceMaster] = useState('');
  const [titoloMaster, setTitoloMaster] = useState('');
  const [descrizioneMaster, setDescrizioneMaster] = useState('');

  const [showModalDomanda, setShowModalDomanda] = useState(false);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [testoDomanda, setTestoDomanda] = useState('');
  const [categoriaDomanda, setCategoriaDomanda] = useState('');

  const [showModalUser, setShowModalUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserNome, setEditUserNome] = useState('');
  const [editUserCognome, setEditUserCognome] = useState('');
  const [editUserRuolo, setEditUserRuolo] = useState('user');

  const [isMasterImport, setIsMasterImport] = useState(false);

  const handleCopyClientLink = (aziendaId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const clientUrl = `${baseUrl}/cliente/${aziendaId}`;
    navigator.clipboard.writeText(clientUrl);
    alert('Link del questionario copiato negli appunti! Puoi inviarlo al cliente.');
  };

  const handleSaveFinancialsToSupabase = async () => {
    if (!selectedAzienda) return;
    try {
      setSavingFinancials(true);
      const { error } = await supabase
        .from('gos_aziende')
        .update({
          business_plan_data: financialReports,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAzienda.id);

      if (error) throw error;
      alert('Piano finanziario e report salvati con successo in Supabase per ' + selectedAzienda.ragione_sociale);
    } catch (err: any) {
      alert('Errore durante il salvataggio su Supabase: ' + err.message);
    } finally {
      setSavingFinancials(false);
    }
  };

  useEffect(() => {
    if (pathname && pathname.startsWith('/cliente/')) {
      const parts = pathname.split('/');
      const id = parts[parts.length - 1];
      if (id) {
        setPreviewAziendaId(id);
        fetchPreviewData(id);
      }
    }
  }, [pathname]);

  const fetchPreviewData = async (aziendaId: string) => {
    try {
      setLoadingPreview(true);
      const { data: azData, error: azErr } = await supabase
        .from('gos_aziende')
        .select('*')
        .eq('id', aziendaId)
        .single();

      if (azErr) throw azErr;

      const { data: formData, error: formErr } = await supabase
        .from('gos_forms')
        .select('*')
        .eq('azienda_id', aziendaId);

      if (formErr) throw formErr;

      let domData: any[] = [];
      if (formData && formData.length > 0) {
        const formIds = formData.map(f => f.id);
        const { data: dData, error: dErr } = await supabase
          .from('gos_domande')
          .select('*')
          .in('form_id', formIds)
          .order('ordine', { ascending: true });

        if (!dErr) domData = dData || [];
      }

      setPreviewData({
        azienda: azData,
        forms: formData || [],
        domande: domData,
      });
    } catch (err: any) {
      alert('Errore caricamento questionario cliente: ' + err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClientSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewAziendaId || !previewData) return;

    try {
      setSubmittingClientAnswers(true);
      
      const payload = Object.keys(clientAnswers).map((domandaId) => ({
        azienda_id: previewAziendaId,
        domanda_id: domandaId,
        valore_risposta: clientAnswers[domandaId],
        updated_at: new Date().toISOString()
      }));

      if (payload.length > 0) {
        const { error } = await supabase
          .from('gos_risposte_clienti')
          .upsert(payload, { onConflict: 'azienda_id,domanda_id' });

        if (error) throw error;
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      alert('Errore durante il salvataggio delle risposte: ' + err.message);
    } finally {
      setSubmittingClientAnswers(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        setSessionStartTime(Date.now());
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        setSessionStartTime(Date.now());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionStartTime) return;

    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      setElapsedTime(`${hours}:${minutes}:${seconds}`);

      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' — ' +
        now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profile } = await supabase
          .from('gos_profiles')
          .select('nome, cognome, email, ruolo')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          setCurrentUserProfile(profile);
          setUserRole(profile.ruolo || 'user');
        } else {
          setCurrentUserProfile({ email: authData.user.email });
          setUserRole('user');
        }
      }

      const { data: azData, error: azError } = await supabase
        .from('gos_aziende')
        .select('*')
        .order('created_at', { ascending: false });

      if (azError) throw azError;
      setAziende(azData || []);

      const { data: mfData } = await supabase
        .from('gos_master_forms')
        .select('*')
        .order('created_at', { ascending: true });

      setMasterForms(mfData || []);

      if (mfData && mfData.length > 0) {
        const mfIds = mfData.map(m => m.id);
        const { data: mdData } = await supabase
          .from('gos_master_domande')
          .select('*')
          .in('master_form_id', mfIds)
          .order('ordine', { ascending: true });

        setMasterDomande(mdData || []);
      }

      const { data: profilesData, error: profError } = await supabase
        .from('gos_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!profError && profilesData) {
        setGlaringUsers(profilesData);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchInitialData();
    }
  }, [session]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailLogin.trim(),
        password: passwordLogin,
      });

      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Credenziali non valide.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('gos_profiles')
        .update({
          nome: editUserNome.trim(),
          cognome: editUserCognome.trim(),
          ruolo: editUserRuolo,
        })
        .eq('id', editingUserId);

      if (error) throw error;

      setShowModalUser(false);
      setEditingUserId(null);
      fetchInitialData();
    } catch (err: any) {
      alert('Errore aggiornamento utente: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadAziendaDetails = async (azienda: any) => {
    setSelectedAzienda(azienda);
    setActiveTab('executive');
    setLoadingForms(true);
    
    if (azienda.business_plan_data?.inputs) {
      const inp = azienda.business_plan_data.inputs;
      if (inp.prodotti) setProdotti(inp.prodotti);
      if (inp.costiProduzioneExtra) setCostiProduzioneExtra(inp.costiProduzioneExtra);
      if (inp.personale) setPersonale(inp.personale);
      if (inp.altriCosti) setAltriCosti(inp.altriCosti);
      if (inp.capex) setCapex(inp.capex);
      if (inp.finanziamenti) setFinanziamenti(inp.finanziamenti);
      if (inp.beginningBalance) setBeginningBalance(inp.beginningBalance);
      if (inp.aliquotaFiscale) setAliquotaFiscale(inp.aliquotaFiscale);
      if (inp.wacc) setWacc(inp.wacc);
    }

    try {
      const { data: formData, error: formError } = await supabase
        .from('gos_forms')
        .select('*')
        .eq('azienda_id', azienda.id);

      if (formError) throw formError;
      setForms(formData || []);

      if (formData) {
        const initialOpenState: { [key: string]: boolean } = {};
        formData.forEach((f: any) => {
          initialOpenState[f.id] = true;
        });
        setOpenFormsState(initialOpenState);
      }

      if (formData && formData.length > 0) {
        const formIds = formData.map(f => f.id);
        const { data: domData, error: domError } = await supabase
          .from('gos_domande')
          .select('*')
          .in('form_id', formIds)
          .order('ordine', { ascending: true });

        if (!domError) setDomande(domData || []);
      } else {
        setDomande([]);
      }

      const { data: respData, error: respError } = await supabase
        .from('gos_risposte_clienti')
        .select('*')
        .eq('azienda_id', azienda.id);

      if (!respError) {
        setRisposteClienti(respData || []);
      } else {
        setRisposteClienti([]);
      }

    } catch (err: any) {
      alert('Errore caricamento questionari: ' + err.message);
    } finally {
      setLoadingForms(false);
    }
  };

  const handleUpdateMasterDomanda = async (domandaId: string) => {
    try {
      const { error } = await supabase
        .from('gos_master_domande')
        .update({
          testo_domanda: editTestoDomanda,
          categoria: editCategoriaDomanda,
        })
        .eq('id', domandaId);

      if (error) throw error;
      setEditingDomandaId(null);
      fetchInitialData();
    } catch (err: any) {
      alert('Errore aggiornamento domanda master: ' + err.message);
    }
  };

  const handleMoveMasterDomanda = async (currentIndex: number, direction: 'up' | 'down', list: any[]) => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const currentItem = list[currentIndex];
    const targetItem = list[targetIndex];

    try {
      await supabase.from('gos_master_domande').update({ ordine: targetItem.ordine ?? targetIndex }).eq('id', currentItem.id);
      await supabase.from('gos_master_domande').update({ ordine: currentItem.ordine ?? currentIndex }).eq('id', targetItem.id);

      fetchInitialData();
    } catch (err: any) {
      alert('Errore nello spostamento: ' + err.message);
    }
  };

  const handleCreateMasterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!titoloMaster.trim()) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('gos_master_forms').insert([
        {
          codice: codiceMaster.trim() || 'Q00',
          titolo: titoloMaster.trim(),
          descrizione: descrizioneMaster.trim(),
        },
      ]);

      if (error) throw error;

      setCodiceMaster('');
      setTitoloMaster('');
      setDescrizioneMaster('');
      setShowModalMasterForm(false);
      fetchInitialData();
    } catch (err: any) {
      alert('Errore creazione modulo master: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAzienda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!ragioneSociale.trim()) return;

    try {
      setSaving(true);
      if (editingAziendaId) {
        const { error } = await supabase
          .from('gos_aziende')
          .update({
            ragione_sociale: ragioneSociale,
            settore: settore || 'Generale',
            paese: paese || 'Italia',
          })
          .eq('id', editingAziendaId);

        if (error) throw error;

        if (selectedAzienda && selectedAzienda.id === editingAziendaId) {
          setSelectedAzienda((prev: any) => ({
            ...prev,
            ragione_sociale: ragioneSociale,
            settore: settore || 'Generale',
            paese: paese || 'Italia',
          }));
        }
      } else {
        const { error } = await supabase.from('gos_aziende').insert([
          {
            ragione_sociale: ragioneSociale,
            settore: settore || 'Generale',
            paese: paese || 'Italia',
            stato: 'active',
          },
        ]);

        if (error) throw error;
      }

      setRagioneSociale('');
      setSettore('');
      setEditingAziendaId(null);
      setShowModalAzienda(false);
      fetchInitialData();
    } catch (err: any) {
      alert('Errore nel salvataggio azienda: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAzienda = async (aziendaId: string) => {
    if (userRole !== 'admin') return;
    if (!confirm('Sei sicuro di voler eliminare questa azienda e tutti i relativi questionari?')) return;

    try {
      const { error } = await supabase.from('gos_aziende').delete().eq('id', aziendaId);
      if (error) throw error;
      if (selectedAzienda?.id === aziendaId) {
        setSelectedAzienda(null);
      }
      fetchInitialData();
    } catch (err: any) {
      alert('Errore eliminazione azienda: ' + err.message);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!titoloForm.trim() || !selectedAzienda) return;

    try {
      setSaving(true);
      const { data: newForm, error: formErr } = await supabase
        .from('gos_forms')
        .insert([
          {
            titolo: titoloForm,
            descrizione: descrizioneForm,
            azienda_id: selectedAzienda.id,
          },
        ])
        .select()
        .single();

      if (formErr) throw formErr;

      if (selectedMasterId && newForm) {
        const { data: masterDomandeList } = await supabase
          .from('gos_master_domande')
          .select('*')
          .eq('master_form_id', selectedMasterId);

        if (masterDomandeList && masterDomandeList.length > 0) {
          const clonedDomande = masterDomandeList.map(md => ({
            form_id: newForm.id,
            testo_domanda: md.testo_domanda,
            categoria: md.categoria || 'Generale',
            ordine: md.ordine || 0,
          }));

          await supabase.from('gos_domande').insert(clonedDomande);
        }
      }

      setTitoloForm('');
      setDescrizioneForm('');
      setSelectedMasterId('');
      setShowModalForm(false);
      loadAziendaDetails(selectedAzienda);
    } catch (err: any) {
      alert('Errore creazione modulo: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectMaster = (masterId: string) => {
    setSelectedMasterId(masterId);
    if (!masterId) return;

    const mf = masterForms.find(m => m.id === masterId);
    if (mf) {
      setTitoloForm(`${mf.codice ? mf.codice + ' - ' : ''}${mf.titolo}`);
      setDescrizioneForm(mf.descrizione || '');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (userRole !== 'admin') return;
    if (!confirm('Sei sicuro di voler eliminare questo modulo?')) return;
    try {
      const { error } = await supabase.from('gos_forms').delete().eq('id', formId);
      if (error) throw error;
      if (selectedAzienda) loadAziendaDetails(selectedAzienda);
    } catch (err: any) {
      alert('Errore eliminazione modulo: ' + err.message);
    }
  };

  const handleCreateDomanda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    if (!testoDomanda.trim() || !activeFormId) return;

    try {
      setSaving(true);
      const currentCount = masterDomande.filter(d => d.master_form_id === activeFormId).length;
      const { error } = await supabase.from('gos_master_domande').insert([
        {
          master_form_id: activeFormId,
          testo_domanda: testoDomanda,
          categoria: categoriaDomanda || 'Generale',
          ordine: currentCount + 1,
        },
      ]);
      if (error) throw error;

      setTestoDomanda('');
      setCategoriaDomanda('');
      setShowModalDomanda(false);
      setActiveFormId(null);
      fetchInitialData();
    } catch (err: any) {
      alert('Errore inserimento domanda master: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMasterDomanda = async (domandaId: string) => {
    if (userRole !== 'admin') return;
    if (!confirm('Sei sicuro di voler eliminare questa domanda dal master?')) return;

    try {
      const { error } = await supabase.from('gos_master_domande').delete().eq('id', domandaId);
      if (error) throw error;
      fetchInitialData();
    } catch (err: any) {
      alert('Errore eliminazione domanda master: ' + err.message);
    }
  };

  const userDisplayName = currentUserProfile?.nome
    ? `${currentUserProfile.nome} ${currentUserProfile.cognome || ''}`
    : currentUserProfile?.email || 'Amministratore GOS';

  if (reportPreviewHtml) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
        <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-14 px-3.5 flex items-center justify-center">
                <img 
                  src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
                  alt="Glaring Logo" 
                  className="h-16 max-h-28 w-auto object-contain" 
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 — Anteprima Report Sezione</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReportPreviewHtml(null)}
                className="bg-white text-slate-950 hover:bg-slate-200 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                ← Chiudi Anteprima
              </button>
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(reportPreviewHtml);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => { printWindow.print(); }, 500);
                  }
                }}
                className="bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" /> Stampa / Scarica PDF
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 flex flex-col items-center bg-slate-200 overflow-y-auto">
          <div className="w-full max-w-4xl space-y-8">
            <iframe
              srcDoc={reportPreviewHtml}
              className="w-full h-[850px] border border-slate-300 bg-slate-100 shadow-xl"
              title="Anteprima Report PDF"
            />
          </div>
        </main>

        <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold">
            <span>GOS 1.0 — Strategic & Operation Advisors Infrastructure</span>
            <span>Glaring LLP © 2026</span>
          </div>
        </footer>
      </div>
    );
  }

  if (previewAziendaId) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
        <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-14 px-3.5 flex items-center justify-center">
                <img 
                  src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
                  alt="Glaring Logo" 
                  className="h-16 max-h-28 w-auto object-contain" 
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 — Portale Compilazione Questionario Cliente</span>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <div className="max-w-4xl mx-auto space-y-6">
            {loadingPreview ? (
              <div className="p-12 text-center text-slate-400 bg-white border border-slate-300">Caricamento moduli di valutazione...</div>
            ) : !previewData ? (
              <div className="p-12 text-center text-red-600 bg-white border border-slate-300">Azienda non trovata o link non valido.</div>
            ) : submittedSuccess ? (
              <div className="bg-white border border-slate-300 p-12 text-center space-y-4">
                <div className="inline-flex p-4 bg-emerald-100 text-emerald-800 rounded-full mb-2">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">Risposte Inviate con Successo!</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  I dati sono stati salvati correttamente nel sistema GOS. Il nostro team di advisor procederà all'analisi e alla generazione del report direzionale definitivo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleClientSubmitAnswers} className="space-y-8">
                <div className="bg-white border border-slate-300 p-8 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs tracking-wider uppercase">
                    <ShieldCheck className="w-4 h-4" /> Sessione Sicura Glaring LLP
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {previewData.azienda.ragione_sociale}
                  </h1>
                  <p className="text-slate-500 text-xs flex items-center gap-4">
                    <span>Settore: <strong className="text-slate-700">{previewData.azienda.settore || 'Generale'}</strong></span>
                    <span>Paese: <strong className="text-slate-700">{previewData.azienda.paese || 'Italia'}</strong></span>
                  </p>
                  <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                    Compila i parametri sottostanti richiesti per completare la verifica strutturale GOS. Non è richiesta alcuna registrazione.
                  </p>
                </div>

                <div className="space-y-6">
                  {previewData.forms.length === 0 ? (
                    <div className="bg-white border border-slate-300 p-12 text-center text-slate-500">
                      Nessun modulo di valutazione assegnato a questa azienda.
                    </div>
                  ) : (
                    previewData.forms.map((form) => {
                      const formDomande = previewData.domande.filter(d => d.form_id === form.id);
                      return (
                        <div key={form.id} className="bg-white border border-slate-300 p-6 space-y-4">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">{form.titolo}</h3>
                            <p className="text-xs text-slate-500 mt-1">{form.descrizione || 'Questionario di verifica strutturale GOS.'}</p>
                          </div>

                          <div className="border-t border-slate-300 pt-4">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                              Parametri da compilare — {formDomande.length} totali
                            </h4>
                            {formDomande.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Nessun parametro in questo modulo.</p>
                            ) : (
                              <div className="space-y-4">
                                {formDomande.map((dom, idx) => (
                                  <div key={dom.id} className="text-xs bg-[#F5F5F5] p-4 border border-slate-300 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5">#{idx + 1}</span>
                                      <span className="text-slate-900 font-bold flex-1">{dom.testo_domanda}</span>
                                      <span className="text-[10px] text-slate-600 bg-slate-200 px-2 py-0.5 font-semibold">
                                        {dom.categoria || 'Generale'}
                                      </span>
                                    </div>
                                    <div className="pt-2">
                                      <input
                                        type="text"
                                        required
                                        placeholder="Inserisci risposta / riscontro..."
                                        value={clientAnswers[dom.id] || ''}
                                        onChange={(e) => setClientAnswers({ ...clientAnswers, [dom.id]: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {previewData.forms.length > 0 && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={submittingClientAnswers}
                      className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {submittingClientAnswers ? 'Invio in corso...' : 'Invia Risposte a GOS'} <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </main>

        <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold">
            <span>GOS 1.0 — Strategic & Operation Advisors Infrastructure</span>
            <span>Glaring LLP © 2026</span>
          </div>
        </footer>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center text-slate-900 font-sans">
        <p className="text-xs font-bold uppercase tracking-wider">Verifica autenticazione GOS...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
        <header className="text-white px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <img 
              src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
              alt="Glaring Logo" 
              className="h-16 max-h-28 w-auto object-contain" 
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">GOS 1.0 Login</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex p-3 bg-slate-950 text-[#ccff00] mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Accesso Area Riservata</h1>
              <p className="text-xs text-slate-500">Inserisci le credenziali GOS per accedere al cruscotto direzionale.</p>
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    placeholder="nome@glaring.world"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 bg-slate-950 text-[#ccff00] text-xs font-extrabold uppercase tracking-wider hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loggingIn ? 'Autenticazione...' : 'Accedi al Sistema'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>

        <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold">
            <span>GOS 1.0 — Strategic & Operation Advisors Infrastructure</span>
            <span>Glaring LLP © 2026</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans flex flex-col justify-between">
      
      <header className="bg-slate-950 text-white border-b border-slate-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          
          <div className="flex items-center gap-4">
            <div className="h-14 px-3.5 flex items-center justify-center">
              <img 
                src="https://www.glaring.world/wp-content/uploads/2026/11/Glaring-Logo-S0S-White_Green.png" 
                alt="Glaring Logo" 
                className="h-16 max-h-28 w-auto object-contain" 
              />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white tracking-wide">{userDisplayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[#ccff00] font-bold text-[10px] uppercase tracking-wider">Sessione Attiva</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-800 text-slate-300">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-[#ccff00]" />
                <span>{currentDateTime}</span>
              </div>

              <div className="h-4 w-px bg-slate-800"></div>

              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-[#ccff00]" />
                <span>Permanenza: <strong className="text-[#ccff00] font-mono">{elapsedTime}</strong></span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2.5 transition-colors cursor-pointer font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      <main className="p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {selectedMasterForm ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-300 pb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedMasterForm(null)}
                    className="p-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs tracking-wider uppercase">
                      <Library className="w-4 h-4 text-indigo-600" /> GOS 1.0 — Libreria Master Template
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
                      {selectedMasterForm.codice ? `[${selectedMasterForm.codice}] ` : ''}{selectedMasterForm.titolo}
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">{selectedMasterForm.descrizione || 'Nessuna descrizione.'}</p>
                  </div>
                </div>

                {userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFormId(selectedMasterForm.id);
                      setIsMasterImport(true);
                      setShowModalDomanda(true);
                    }}
                    className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-3 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#ccff00]" /> Aggiungi Domanda Master
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" /> Domande del Template Master (Modificabili & Ordinabili)
                </h3>

                {masterDomande.filter(d => d.master_form_id === selectedMasterForm.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-12 text-center bg-white border border-dashed border-slate-300">Nessuna domanda presente in questo template master.</p>
                ) : (
                  <ul className="space-y-3">
                    {masterDomande
                      .filter(d => d.master_form_id === selectedMasterForm.id)
                      .map((dom, idx, filteredList) => (
                        <li key={dom.id} className="text-sm bg-white p-5 border border-slate-300 flex items-center justify-between gap-4 group">
                          
                          {editingDomandaId === dom.id ? (
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                value={editTestoDomanda}
                                onChange={(e) => setEditTestoDomanda(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-xs font-medium"
                              />
                              <input
                                type="text"
                                value={editCategoriaDomanda}
                                onChange={(e) => setEditCategoriaDomanda(e.target.value)}
                                placeholder="Categoria"
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-xs font-medium"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMasterDomanda(dom.id)}
                                  className="px-4 py-2 bg-slate-950 text-white text-xs font-bold cursor-pointer"
                                >
                                  Salva
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingDomandaId(null)}
                                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 flex-1">
                              <span className="font-extrabold text-slate-900 bg-slate-200 text-xs px-2.5 py-1">#{idx + 1}</span>
                              <div className="flex-1">
                                <p className="text-slate-900 font-bold">{dom.testo_domanda}</p>
                                <span className="text-[11px] text-slate-500 mt-0.5 inline-block">Categoria: <strong className="text-slate-700">{dom.categoria || 'Generale'}</strong></span>
                              </div>
                            </div>
                          )}

                          {userRole === 'admin' && editingDomandaId !== dom.id && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveMasterDomanda(idx, 'up', filteredList)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer transition-colors"
                                title="Sposta su"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === filteredList.length - 1}
                                onClick={() => handleMoveMasterDomanda(idx, 'down', filteredList)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-20 cursor-pointer transition-colors"
                                title="Sposta giù"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDomandaId(dom.id);
                                  setEditTestoDomanda(dom.testo_domanda);
                                  setEditCategoriaDomanda(dom.categoria || '');
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Modifica"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMasterDomanda(dom.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Elimina"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          ) : selectedAzienda ? (
            
            <div className="space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-300 pb-6 gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedAzienda(null)}
                    className="p-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs tracking-wider uppercase">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> GOS 1.0 — Dashboard Direzionale Azienda
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {selectedAzienda.ragione_sociale}
                      </h1>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            setEditingAziendaId(selectedAzienda.id);
                            setRagioneSociale(selectedAzienda.ragione_sociale);
                            setSettore(selectedAzienda.settore || '');
                            setPaese(selectedAzienda.paese || 'Italia');
                            setShowModalAzienda(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Modifica Anagrafica"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-medium"><BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Settore: {selectedAzienda.settore || 'Generale'}</span>
                      <span className="flex items-center gap-1.5 font-medium"><Globe className="w-3.5 h-3.5 text-emerald-500" /> Paese: {selectedAzienda.paese || 'Italia'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleCopyClientLink(selectedAzienda.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" /> Copia Link Questionario
                  </button>

                  {userRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setTitoloForm('');
                        setDescrizioneForm('');
                        setSelectedMasterId('');
                        setShowModalForm(true);
                      }}
                      className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-3 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#ccff00]" /> Assegna Modulo Master
                    </button>
                  )}
                </div>
              </div>

              {/* NAVIGAZIONE TAB PRINCIPALI */}
              <div className="flex border-b border-slate-300 gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('executive')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'executive'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> 1. Executive Dashboard (Sintesi)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('questionari')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'questionari'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4" /> 2. Questionari & Risposte ({forms.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('business_plan')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'business_plan'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> 3. Business Plan Engine & Report
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cronoprogramma')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'cronoprogramma'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> 4. Cronoprogramma & Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ruoli')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'ruoli'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4" /> 5. Ruoli & Governance
                </button>
              </div>

              {/* TAB 1: EXECUTIVE DASHBOARD */}
              {activeTab === 'executive' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 text-white p-6 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-[#ccff00] text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> GOS Project Control Tower & Executive Summary
                      </div>
                      <h2 className="text-xl font-extrabold mt-1">Cruscotto di Controllo Finanziario & Operativo</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Sintesi in tempo reale dei KPI strategici, performance di progetto e stato dei task.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('business_plan')}
                        className="bg-[#ccff00] hover:bg-[#b8e600] text-slate-950 px-4 py-2 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                      >
                        Apri Modulo Finanziario →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-300 p-5 space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fatturato Totale (5 Anni)</span>
                      <p className="text-2xl font-extrabold text-slate-900 font-mono">
                        € {Math.round(financialReports.fatturatoTotale5Anni).toLocaleString('it-IT')}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Somma Cash Receipts (Y1-Y5)</span>
                    </div>
                    <div className="bg-white border border-slate-300 p-5 space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EBITDA Medio (5 Anni)</span>
                      <p className="text-2xl font-extrabold text-emerald-700 font-mono">
                        € {Math.round(financialReports.ebitdaMedio5Anni).toLocaleString('it-IT')}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Media annua (Y1-Y5)</span>
                    </div>
                    <div className="bg-white border border-slate-300 p-5 space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NPV di Progetto</span>
                      <p className="text-2xl font-extrabold text-sky-700 font-mono">
                        € {Math.round(financialReports.kpis.npv).toLocaleString('it-IT')}
                      </p>
                      <span className="text-[10px] text-sky-600 font-semibold">Attualizzato (WACC 9%)</span>
                    </div>
                    <div className="bg-white border border-slate-300 p-5 space-y-1 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IRR (Tasso Interno)</span>
                      <p className="text-2xl font-extrabold text-indigo-600 font-mono">
                        {(financialReports.kpis.irr * 100).toFixed(1)}%
                      </p>
                      <span className="text-[10px] text-indigo-600 font-semibold">Rendimento atteso</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-600" /> Sintesi Pluriennale EBITDA & Utile Netto
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                              <th className="py-2.5 px-3">Indicatore (€)</th>
                              <th className="py-2.5 px-3 text-right">Anno 1</th>
                              <th className="py-2.5 px-3 text-right">Anno 3</th>
                              <th className="py-2.5 px-3 text-right">Anno 5</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr>
                              <td className="py-2 px-3 font-sans font-bold text-slate-800">EBITDA</td>
                              <td className="py-2 px-3 text-right text-emerald-700">€ {Math.round(financialReports.contoEconomico[0].ebitda).toLocaleString('it-IT')}</td>
                              <td className="py-2 px-3 text-right text-emerald-700">€ {Math.round(financialReports.contoEconomico[2].ebitda).toLocaleString('it-IT')}</td>
                              <td className="py-2 px-3 text-right text-emerald-700">€ {Math.round(financialReports.contoEconomico[4].ebitda).toLocaleString('it-IT')}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-sans text-slate-600">Utile Netto</td>
                              <td className="py-2 px-3 text-right">€ {Math.round(financialReports.contoEconomico[0].utileNetto).toLocaleString('it-IT')}</td>
                              <td className="py-2 px-3 text-right">€ {Math.round(financialReports.contoEconomico[2].utileNetto).toLocaleString('it-IT')}</td>
                              <td className="py-2 px-3 text-right">€ {Math.round(financialReports.contoEconomico[4].utileNetto).toLocaleString('it-IT')}</td>
                            </tr>
                            <tr className="bg-slate-50 font-bold">
                              <td className="py-2.5 px-3 font-sans text-indigo-900">ROI (Return on Investment)</td>
                              <td className="py-2.5 px-3 text-right">{financialReports.indiciPluriennali[0].roi.toFixed(1)}%</td>
                              <td className="py-2.5 px-3 text-right">{financialReports.indiciPluriennali[2].roi.toFixed(1)}%</td>
                              <td className="py-2.5 px-3 text-right">{financialReports.indiciPluriennali[4].roi.toFixed(1)}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" /> Stato Avanzamento Roadmap (PMO)
                        </h3>
                        <button
                          onClick={() => setActiveTab('cronoprogramma')}
                          className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          Gestisci Task →
                        </button>
                      </div>
                      <div className="space-y-3">
                        {roadmapTasks.slice(0, 4).map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-[#F5F5F5] border border-slate-200 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5">{task.codice}</span>
                              <div>
                                <p className="font-bold text-slate-900">{task.task}</p>
                                <span className="text-[10px] text-slate-500">{task.inizio} → {task.fine} • Budget: € {task.budget?.toLocaleString('it-IT')}</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 uppercase ${
                              task.stato === 'Completato' ? 'bg-emerald-100 text-emerald-800' :
                              task.stato === 'In Corso' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {task.stato}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: QUESTIONARI */}
              {activeTab === 'questionari' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white border border-slate-300 p-4">
                    <span className="text-xs font-bold text-slate-700 uppercase">Sezione Questionari & Risposte Clienti</span>
                    <button
                      type="button"
                      onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'questionari', teamMembers)}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Report PDF Sezione Questionari
                    </button>
                  </div>

                  <div className="space-y-4">
                    {loadingForms ? (
                      <div className="p-12 text-center text-slate-400 bg-white border border-slate-300">Caricamento questionari e risposte...</div>
                    ) : forms.length === 0 ? (
                      <div className="bg-white border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-3">
                        <p className="text-sm">Nessun questionario associato a questa azienda.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {forms.map((form) => {
                          const formDomande = domande.filter(d => d.form_id === form.id);
                          const isThisFormOpen = openFormsState[form.id] ?? true;

                          return (
                            <div key={form.id} className="bg-white border border-slate-300 p-6 space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => setOpenFormsState(prev => ({ ...prev, [form.id]: !isThisFormOpen }))}
                                    className="p-1 text-slate-500 hover:text-slate-950 transition-colors cursor-pointer"
                                  >
                                    {isThisFormOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                  </button>
                                  <div>
                                    <h3 className="text-base font-extrabold text-slate-900">{form.titolo}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{form.descrizione || 'Modulo diagnostico collegato al Master Q.'}</p>
                                  </div>
                                </div>

                                {userRole === 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteForm(form.id)}
                                    className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Elimina Modulo"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {isThisFormOpen && (
                                <div className="border-t border-slate-300 pt-4">
                                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <HelpCircle className="w-4 h-4 text-indigo-600" /> Parametri & Risposte Cliente — {formDomande.length} totali
                                  </h4>
                                  {formDomande.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Nessun parametro presente in questo modulo.</p>
                                  ) : (
                                    <div className="space-y-3">
                                      {formDomande.map((dom, idx) => {
                                        const rispostaTrovata = risposteClienti.find(r => r.domanda_id === dom.id);
                                        const dataFormattata = rispostaTrovata?.updated_at 
                                          ? new Date(rispostaTrovata.updated_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                          : null;

                                        return (
                                          <div key={dom.id} className="text-xs bg-[#F5F5F5] p-4 border border-slate-300 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-7 flex items-center gap-3">
                                              <span className="font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5">#{idx + 1}</span>
                                              <div>
                                                <p className="text-slate-900 font-bold">{dom.testo_domanda}</p>
                                                <span className="text-[10px] text-slate-500 mt-0.5 inline-block">Categoria: <strong>{dom.categoria || 'Generale'}</strong></span>
                                              </div>
                                            </div>

                                            <div className="md:col-span-5 bg-white p-3 border border-slate-300 space-y-1">
                                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <span>Risposta Cliente</span>
                                                {dataFormattata ? (
                                                  <span className="text-emerald-700 font-mono flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {dataFormattata}
                                                  </span>
                                                ) : (
                                                  <span className="text-amber-600 italic">In attesa</span>
                                                )}
                                              </div>
                                              <div className="text-xs font-bold text-slate-800 bg-slate-50 p-2 border border-slate-200 select-all">
                                                {rispostaTrovata ? rispostaTrovata.valore_risposta : <span className="text-slate-400 font-normal italic">Nessuna risposta inviata dal cliente</span>}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BUSINESS PLAN ENGINE COMPLETO CON REPORT PER SEZIONE */}
              {activeTab === 'business_plan' && (
                <div className="space-y-6">
                  
                  <div className="bg-white border border-slate-300 p-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3 overflow-x-auto">
                      <button 
                        onClick={() => setBpSubTab('input')} 
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${bpSubTab === 'input' ? 'bg-slate-950 text-[#ccff00] border-slate-950' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Scheda INPUT (Advisor)
                      </button>
                      <button 
                        onClick={() => setBpSubTab('ce')} 
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${bpSubTab === 'ce' ? 'bg-slate-950 text-[#ccff00] border-slate-950' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" /> Conto Economico (CE)
                      </button>
                      <button 
                        onClick={() => setBpSubTab('sp')} 
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${bpSubTab === 'sp' ? 'bg-slate-950 text-[#ccff00] border-slate-950' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Stato Patrimoniale (SP)
                      </button>
                      <button 
                        onClick={() => setBpSubTab('cashflow')} 
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${bpSubTab === 'cashflow' ? 'bg-slate-950 text-[#ccff00] border-slate-950' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Cash Flow
                      </button>
                      <button 
                        onClick={() => setBpSubTab('debito')} 
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${bpSubTab === 'debito' ? 'bg-slate-950 text-[#ccff00] border-slate-950' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                      >
                        <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Piano Debito & DSCR
                      </button>
                      <button 
                        onClick={() => setBpSubTab('indexes')} 
                        className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border ${bpSubTab === 'indexes' ? 'bg-slate-950 text-[#ccff00] border-slate-950' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> KPI & Indici Pluriennali
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveFinancialsToSupabase}
                        disabled={savingFinancials}
                        className="text-xs bg-slate-950 text-[#ccff00] hover:bg-slate-900 font-extrabold px-5 py-2.5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {savingFinancials ? 'Salvataggio...' : 'Salva su Supabase'}
                      </button>
                    </div>
                  </div>

                  {bpSubTab === 'input' && (
                    <div className="space-y-8">
                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-extrabold uppercase text-slate-900">BEGINNING BALANCE | CASH ON HAND ($)</h3>
                          <p className="text-xs text-slate-500">Saldo di cassa iniziale da inserire anno per anno.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                          {(['y1','y2','y3','y4','y5'] as const).map((yk, idx) => (
                            <div key={yk} className="space-y-1">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Anno {idx + 1}</label>
                              <input 
                                type="number" 
                                value={beginningBalance[yk]} 
                                onChange={(e) => setBeginningBalance({ ...beginningBalance, [yk]: Number(e.target.value) })} 
                                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 font-mono font-bold text-right text-xs" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase">Product sold in pieces (Quantità)</h3>
                            <p className="text-xs text-slate-500">Volumi di vendita in pezzi per singolo prodotto.</p>
                          </div>
                          <button onClick={handleAddProdotto} className="bg-slate-950 text-[#ccff00] text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 cursor-pointer">
                            <Plus className="w-4 h-4" /> Aggiungi Prodotto
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Prodotto</th>
                                <th className="py-2.5 px-3 text-right">Anno 1</th>
                                <th className="py-2.5 px-3 text-right">Anno 2</th>
                                <th className="py-2.5 px-3 text-right">Anno 3</th>
                                <th className="py-2.5 px-3 text-right">Anno 4</th>
                                <th className="py-2.5 px-3 text-right">Anno 5</th>
                                <th className="py-2.5 px-3 text-center">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {prodotti.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-2 px-3">
                                    <input type="text" value={p.nome} placeholder="Nome Prodotto..." onChange={(e) => setProdotti(prodotti.map(i => i.id === p.id ? {...i, nome: e.target.value} : i))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 font-bold text-xs" />
                                  </td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right">
                                      <input type="number" value={p.q[yk]} onChange={(e) => setProdotti(prodotti.map(i => i.id === p.id ? {...i, q: {...i.q, [yk]: Number(e.target.value)}} : i))} className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" />
                                    </td>
                                  ))}
                                  <td className="py-2 px-3 text-center">
                                    <button onClick={() => handleDelProdotto(p.id)} className="text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-slate-900 text-[#ccff00] font-extrabold">
                                <td className="py-2.5 px-3 uppercase">TOTALE PEZZI VENDUTI</td>
                                {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                  <td key={yk} className="py-2.5 px-3 text-right font-mono">{prodotti.reduce((acc, p) => acc + p.q[yk], 0).toLocaleString('it-IT')}</td>
                                ))}
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white border border-amber-300 p-6 space-y-4 shadow-sm">
                        <div className="border-b border-amber-200 pb-3">
                          <h3 className="text-sm font-extrabold text-amber-800 uppercase">( + ) CASH RECEIPTS — Prezzi Unitari di Vendita ($)</h3>
                          <p className="text-xs text-amber-700">Imposta i prezzi unitari con eventuali incrementi anno per anno.</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-amber-100 text-amber-900 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Prodotto</th>
                                <th className="py-2.5 px-3 text-right">Anno 1</th>
                                <th className="py-2.5 px-3 text-right">Anno 2</th>
                                <th className="py-2.5 px-3 text-right">Anno 3</th>
                                <th className="py-2.5 px-3 text-right">Anno 4</th>
                                <th className="py-2.5 px-3 text-right">Anno 5</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-200">
                              {prodotti.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-2 px-3 font-bold text-slate-800">{p.nome || 'Prodotto senza nome'}</td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right">
                                      <input 
                                        type="number" 
                                        step="0.01" 
                                        value={p.prezzo[yk]} 
                                        onChange={(e) => setProdotti(prodotti.map(i => i.id === p.id ? {...i, prezzo: {...i.prezzo, [yk]: Number(e.target.value)}} : i))} 
                                        className="w-24 px-2 py-1 bg-amber-50 border border-amber-300 text-right font-mono font-bold text-xs" 
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              <tr className="bg-amber-500 text-slate-950 font-extrabold">
                                <td className="py-2.5 px-3 uppercase">TOTALE CASH RECEIPTS ($)</td>
                                {(['y1','y2','y3','y4','y5'] as const).map((yk) => {
                                  const totRic = prodotti.reduce((acc, p) => acc + (p.q[yk] * p.prezzo[yk]), 0);
                                  return <td key={yk} className="py-2.5 px-3 text-right font-mono">$ {totRic.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>;
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase">( — ) COST OF GOODS SOLD — Costi Unitari & Produzione</h3>
                            <p className="text-xs text-slate-500">Costi unitari di prodotto (con incrementi annui) e costi vari di produzione.</p>
                          </div>
                          <button onClick={handleAddCostoExtra} className="bg-slate-950 text-[#ccff00] text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 cursor-pointer">
                            <Plus className="w-4 h-4" /> Aggiungi Costo Extra
                          </button>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase">Costi Unitari di Produzione per Prodotto ($)</h4>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Prodotto</th>
                                <th className="py-2.5 px-3 text-right">Anno 1</th>
                                <th className="py-2.5 px-3 text-right">Anno 2</th>
                                <th className="py-2.5 px-3 text-right">Anno 3</th>
                                <th className="py-2.5 px-3 text-right">Anno 4</th>
                                <th className="py-2.5 px-3 text-right">Anno 5</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {prodotti.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-2 px-3 font-bold text-slate-800">{p.nome || 'Prodotto senza nome'}</td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right">
                                      <input 
                                        type="number" 
                                        step="0.01" 
                                        value={p.costo[yk]} 
                                        onChange={(e) => setProdotti(prodotti.map(i => i.id === p.id ? {...i, costo: {...i.costo, [yk]: Number(e.target.value)}} : i))} 
                                        className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono font-bold text-xs text-red-600" 
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <h4 className="text-xs font-bold text-slate-500 uppercase pt-4">Costi di Produzione Generali</h4>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Voce Costo</th>
                                <th className="py-2.5 px-3 text-right">Anno 1 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 2 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 3 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 4 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 5 ($)</th>
                                <th className="py-2.5 px-3 text-center">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {costiProduzioneExtra.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2 px-3"><input type="text" value={item.voce} placeholder="Voce costo..." onChange={(e) => setCostiProduzioneExtra(costiProduzioneExtra.map(i => i.id === item.id ? {...i, voce: e.target.value} : i))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 font-bold text-xs" /></td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right">
                                      <input type="number" value={item[yk]} onChange={(e) => setCostiProduzioneExtra(costiProduzioneExtra.map(i => i.id === item.id ? {...i, [yk]: Number(e.target.value)} : i))} className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs text-red-600" />
                                    </td>
                                  ))}
                                  <td className="py-2 px-3 text-center"><button onClick={() => handleDelCostoExtra(item.id)} className="text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="bg-slate-900 text-white p-3 font-extrabold uppercase text-xs flex justify-between items-center">
                            <span>TOTAL COST OF GOODS SOLD ($)</span>
                            <div className="grid grid-cols-5 gap-4 font-mono text-right w-3/5">
                              {(['y1','y2','y3','y4','y5'] as const).map((yk) => {
                                const totCogs = prodotti.reduce((acc, p) => acc + (p.q[yk] * p.costo[yk]), 0) + costiProduzioneExtra.reduce((acc, c) => acc + c[yk], 0);
                                return <span key={yk}>$ {totCogs.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase">Costo del Personale</h3>
                          <button onClick={handleAddPersonale} className="bg-slate-950 text-[#ccff00] text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /> Aggiungi</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Voce Personale</th>
                                <th className="py-2.5 px-3 text-right">Anno 1 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 2 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 3 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 4 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 5 ($)</th>
                                <th className="py-2.5 px-3 text-center">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {personale.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2 px-3"><input type="text" value={item.voce} placeholder="Voce personale..." onChange={(e) => setPersonale(personale.map(i => i.id === item.id ? {...i, voce: e.target.value} : i))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 font-bold text-xs" /></td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right"><input type="number" value={item[yk]} onChange={(e) => setPersonale(personale.map(i => i.id === item.id ? {...i, [yk]: Number(e.target.value)} : i))} className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" /></td>
                                  ))}
                                  <td className="py-2 px-3 text-center"><button onClick={() => handleDelPersonale(item.id)} className="text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase">Altri Costi Operativi (OPEX)</h3>
                          <button onClick={handleAddCosto} className="bg-slate-950 text-[#ccff00] text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /> Aggiungi</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Voce Costo</th>
                                <th className="py-2.5 px-3 text-right">Anno 1 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 2 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 3 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 4 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 5 ($)</th>
                                <th className="py-2.5 px-3 text-center">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {altriCosti.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2 px-3"><input type="text" value={item.voce} placeholder="Voce costo..." onChange={(e) => setAltriCosti(altriCosti.map(i => i.id === item.id ? {...i, voce: e.target.value} : i))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 font-bold text-xs" /></td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right"><input type="number" value={item[yk]} onChange={(e) => setAltriCosti(altriCosti.map(i => i.id === item.id ? {...i, [yk]: Number(e.target.value)} : i))} className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" /></td>
                                  ))}
                                  <td className="py-2 px-3 text-center"><button onClick={() => handleDelCosto(item.id)} className="text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase">Investimenti in Capitale (CAPEX)</h3>
                          <button onClick={handleAddCapex} className="bg-slate-950 text-[#ccff00] text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /> Aggiungi</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Voce CAPEX</th>
                                <th className="py-2.5 px-3 text-right">Anno 1 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 2 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 3 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 4 ($)</th>
                                <th className="py-2.5 px-3 text-right">Anno 5 ($)</th>
                                <th className="py-2.5 px-3 text-center">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {capex.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2 px-3"><input type="text" value={item.voce} placeholder="Voce investimenti..." onChange={(e) => setCapex(capex.map(i => i.id === item.id ? {...i, voce: e.target.value} : i))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 font-bold text-xs" /></td>
                                  {(['y1','y2','y3','y4','y5'] as const).map((yk) => (
                                    <td key={yk} className="py-2 px-3 text-right"><input type="number" value={item[yk]} onChange={(e) => setCapex(capex.map(i => i.id === item.id ? {...i, [yk]: Number(e.target.value)} : i))} className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" /></td>
                                  ))}
                                  <td className="py-2 px-3 text-center"><button onClick={() => handleDelCapex(item.id)} className="text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase">Finanziamenti Bancari & Mutui</h3>
                          <button onClick={handleAddFinanziamento} className="bg-slate-950 text-[#ccff00] text-xs font-extrabold px-4 py-2 flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /> Aggiungi</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase">
                                <th className="py-2.5 px-3">Banca / Finanziatore</th>
                                <th className="py-2.5 px-3 text-right">Importo ($)</th>
                                <th className="py-2.5 px-3 text-right">Tasso (%)</th>
                                <th className="py-2.5 px-3 text-right">Durata (Anni)</th>
                                <th className="py-2.5 px-3 text-center">Azioni</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {finanziamenti.map((f) => (
                                <tr key={f.id}>
                                  <td className="py-2 px-3"><input type="text" value={f.banca} placeholder="Nome finanziamento..." onChange={(e) => setFinanziamenti(finanziamenti.map(i => i.id === f.id ? {...i, banca: e.target.value} : i))} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 font-bold text-xs" /></td>
                                  <td className="py-2 px-3 text-right"><input type="number" value={f.importo} onChange={(e) => setFinanziamenti(finanziamenti.map(i => i.id === f.id ? {...i, importo: Number(e.target.value)} : i))} className="w-32 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" /></td>
                                  <td className="py-2 px-3 text-right"><input type="number" step="0.001" value={f.tasso} onChange={(e) => setFinanziamenti(finanziamenti.map(i => i.id === f.id ? {...i, tasso: Number(e.target.value)} : i))} className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" /></td>
                                  <td className="py-2 px-3 text-right"><input type="number" value={f.durata} onChange={(e) => setFinanziamenti(finanziamenti.map(i => i.id === f.id ? {...i, durata: Number(e.target.value)} : i))} className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 text-right font-mono text-xs" /></td>
                                  <td className="py-2 px-3 text-center"><button onClick={() => handleDelFinanziamento(f.id)} className="text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {bpSubTab === 'ce' && (
                    <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase">Conto Economico (Calcolato da Input)</h3>
                        <button
                          onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'ce', teamMembers)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> PDF Sezione CE
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-300">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-950 text-white font-extrabold uppercase">
                              <th className="py-3 px-4 font-sans">Voce Economica (€)</th>
                              <th className="py-3 px-4 text-right">Anno 1</th>
                              <th className="py-3 px-4 text-right">Anno 2</th>
                              <th className="py-3 px-4 text-right">Anno 3</th>
                              <th className="py-3 px-4 text-right">Anno 4</th>
                              <th className="py-3 px-4 text-right">Anno 5</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr><td className="py-2.5 px-4 font-sans font-bold">Ricavi Totali (Cash Receipts)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right font-bold">€ {Math.round(r.ricavi).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Costo del Venduto (COGS & Produzione)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-red-600">€ -{Math.round(r.costoProduzione).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-50 font-bold"><td className="py-2.5 px-4 font-sans">Gross Margin</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-[#0284c7]">€ {Math.round(r.grossMargin).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Costi Operativi (OPEX & Personale)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-red-600">€ -{Math.round(r.opex).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-100 font-bold"><td className="py-2.5 px-4 font-sans">EBITDA (Margine Operativo Lordo)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-emerald-700">€ {Math.round(r.ebitda).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Ammortamenti Impianti & CAPEX</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-slate-600">€ -{Math.round(r.ammortamenti).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-50 font-bold"><td className="py-2.5 px-4 font-sans">EBIT (Risultato Operativo)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-indigo-900">€ {Math.round(r.ebit).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Oneri Finanziari (Interessi Passivi)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-red-600">€ -{Math.round(r.oneriFinanziari).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Imposte d'Esercizio (24%)</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-2.5 px-4 text-right text-red-600">€ -{Math.round(r.imposte).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-950 text-[#ccff00] font-extrabold"><td className="py-3 px-4 font-sans">Utile Netto d'Esercizio</td>{financialReports.contoEconomico.map(r => <td key={r.anno} className="py-3 px-4 text-right">€ {Math.round(r.utileNetto).toLocaleString('it-IT')}</td>)}</tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {bpSubTab === 'sp' && (
                    <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase">Stato Patrimoniale (Calcolato da Input)</h3>
                        <button
                          onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'sp', teamMembers)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> PDF Sezione SP
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-300">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-900 text-white font-extrabold uppercase">
                              <th className="py-3 px-4 font-sans">Voce Patrimoniale (€)</th>
                              <th className="py-3 px-4 text-right">Anno 1</th>
                              <th className="py-3 px-4 text-right">Anno 2</th>
                              <th className="py-3 px-4 text-right">Anno 3</th>
                              <th className="py-3 px-4 text-right">Anno 4</th>
                              <th className="py-3 px-4 text-right">Anno 5</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700">Immobilizzazioni Nette</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-2.5 px-4 text-right">€ {Math.round(s.immobilizzazioniNette).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700">Capitale Circolante Netto (CCN)</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-2.5 px-4 text-right">€ {Math.round(s.ccn).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700">Cassa & Liquidità Disponibile</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-2.5 px-4 text-right text-emerald-700 font-bold">€ {Math.round(s.cassa).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-100 font-bold"><td className="py-2.5 px-4 font-sans">TOTALE ATTIVO PATRIMONIALE</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-2.5 px-4 text-right text-indigo-900">€ {Math.round(s.totaleAttivo).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="border-t-2 border-slate-300"><td className="py-2.5 px-4 font-sans text-red-600 font-bold">Debito Finanziario Residuo</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-2.5 px-4 text-right text-red-600">€ {Math.round(s.debitoResiduo).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-800 font-bold">Patrimonio Netto</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-2.5 px-4 text-right font-bold">€ {Math.round(s.patrimonioNetto).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-900 text-white font-extrabold"><td className="py-3 px-4 font-sans">TOTALE PASSIVO & NETTO</td>{financialReports.statoPatrimoniale.map(s => <td key={s.anno} className="py-3 px-4 text-right text-[#ccff00]">€ {Math.round(s.totalePassivoNetto).toLocaleString('it-IT')}</td>)}</tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {bpSubTab === 'cashflow' && (
                    <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase">Rendiconto Finanziario (Cash Flow)</h3>
                        <button
                          onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'cashflow', teamMembers)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> PDF Sezione Cash Flow
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-300">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-900 text-white font-extrabold uppercase">
                              <th className="py-3 px-4 font-sans">Flussi di Cassa (€)</th>
                              <th className="py-3 px-4 text-right">Anno 1</th>
                              <th className="py-3 px-4 text-right">Anno 2</th>
                              <th className="py-3 px-4 text-right">Anno 3</th>
                              <th className="py-3 px-4 text-right">Anno 4</th>
                              <th className="py-3 px-4 text-right">Anno 5</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr><td className="py-2.5 px-4 font-sans font-bold">FCF Operativo</td>{financialReports.cashFlow.map(c => <td key={c.anno} className="py-2.5 px-4 text-right text-emerald-700 font-bold">€ {Math.round(c.fcfOperativo).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Servizio del Debito</td>{financialReports.cashFlow.map(c => <td key={c.anno} className="py-2.5 px-4 text-right text-red-600">€ -{Math.round(c.servizioDebito).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Investimenti CAPEX</td>{financialReports.cashFlow.map(c => <td key={c.anno} className="py-2.5 px-4 text-right text-red-600">€ -{Math.round(c.capex).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-50 font-bold"><td className="py-2.5 px-4 font-sans">Cash Flow Netto Annuo</td>{financialReports.cashFlow.map(c => <td key={c.anno} className="py-2.5 px-4 text-right text-indigo-700">€ {Math.round(c.fcfNetto).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-950 text-[#ccff00] font-extrabold"><td className="py-3 px-4 font-sans">Cassa Cumulata Fine Anno</td>{financialReports.cashFlow.map(c => <td key={c.anno} className="py-3 px-4 text-right">€ {Math.round(c.cassaCumulata).toLocaleString('it-IT')}</td>)}</tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {bpSubTab === 'debito' && (
                    <div className="bg-white border border-slate-300 p-6 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-extrabold text-slate-900 uppercase">Piano del Debito & Copertura DSCR</h3>
                        <button
                          onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'debito', teamMembers)}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> PDF Sezione Debito
                        </button>
                      </div>
                      <div className="overflow-x-auto border border-slate-300">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-900 text-white font-extrabold uppercase">
                              <th className="py-3 px-4 font-sans">Servizio Debito (€)</th>
                              <th className="py-3 px-4 text-right">Anno 1</th>
                              <th className="py-3 px-4 text-right">Anno 2</th>
                              <th className="py-3 px-4 text-right">Anno 3</th>
                              <th className="py-3 px-4 text-right">Anno 4</th>
                              <th className="py-3 px-4 text-right">Anno 5</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700">Debito Inizio Anno</td>{financialReports.pianoDebito.map(d => <td key={d.anno} className="py-2.5 px-4 text-right">€ {Math.round(d.debitoInizio).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Quota Capitale Rimborsata</td>{financialReports.pianoDebito.map(d => <td key={d.anno} className="py-2.5 px-4 text-right text-red-600">€ {Math.round(d.quotaCapitale).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-600">Interessi Passivi</td>{financialReports.pianoDebito.map(d => <td key={d.anno} className="py-2.5 px-4 text-right text-red-600">€ {Math.round(d.interessi).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-slate-100 font-bold"><td className="py-2.5 px-4 font-sans">Servizio Debito Totale</td>{financialReports.pianoDebito.map(d => <td key={d.anno} className="py-2.5 px-4 text-right">€ {Math.round(d.servizioDebito).toLocaleString('it-IT')}</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-red-600 font-bold">Debito Residuo Fine Anno</td>{financialReports.pianoDebito.map(d => <td key={d.anno} className="py-2.5 px-4 text-right font-bold text-red-600">€ {Math.round(d.debitoFine).toLocaleString('it-IT')}</td>)}</tr>
                            <tr className="bg-emerald-50 text-emerald-900 font-extrabold"><td className="py-3 px-4 font-sans">DSCR (EBITDA / Servizio Debito)</td>{financialReports.pianoDebito.map(d => <td key={d.anno} className="py-3 px-4 text-right font-bold">{d.dscr.toFixed(2)}x</td>)}</tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {bpSubTab === 'indexes' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 uppercase">KPI & Indici Strategici Pluriennali (Anni 1-5)</h3>
                          <p className="text-xs text-slate-500">Ripartizione puntuale degli indici di redditività, solidità e copertura su tutto l'orizzonte temporale.</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <button
                            onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'kpi', teamMembers)}
                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> PDF Sezione KPI
                          </button>
                          <div className="flex gap-4 text-xs font-mono">
                            <span className="bg-white border border-slate-300 px-3 py-1.5">NPV: <strong className="text-sky-700">€ {Math.round(financialReports.kpis.npv).toLocaleString('it-IT')}</strong></span>
                            <span className="bg-white border border-slate-300 px-3 py-1.5">IRR: <strong className="text-emerald-600">{(financialReports.kpis.irr * 100).toFixed(1)}%</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-300 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-900 text-white font-extrabold uppercase">
                              <th className="py-3 px-4 font-sans">Indicatore / KPI</th>
                              <th className="py-3 px-4 text-right">Anno 1</th>
                              <th className="py-3 px-4 text-right">Anno 2</th>
                              <th className="py-3 px-4 text-right">Anno 3</th>
                              <th className="py-3 px-4 text-right">Anno 4</th>
                              <th className="py-3 px-4 text-right">Anno 5</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700 font-bold">EBITDA Margin (%)</td>{financialReports.indiciPluriennali.map(i => <td key={i.anno} className="py-2.5 px-4 text-right text-emerald-700">{i.ebitdaMargin.toFixed(1)}%</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700">ROS (Return on Sales)</td>{financialReports.indiciPluriennali.map(i => <td key={i.anno} className="py-2.5 px-4 text-right">{i.ros.toFixed(1)}%</td>)}</tr>
                            <tr className="bg-slate-50 font-bold"><td className="py-2.5 px-4 font-sans text-indigo-900">ROI (Return on Investment)</td>{financialReports.indiciPluriennali.map(i => <td key={i.anno} className="py-2.5 px-4 text-right text-indigo-700">{i.roi.toFixed(1)}%</td>)}</tr>
                            <tr className="bg-slate-50 font-bold"><td className="py-2.5 px-4 font-sans text-indigo-900">ROE (Return on Equity)</td>{financialReports.indiciPluriennali.map(i => <td key={i.anno} className="py-2.5 px-4 text-right text-indigo-700">{i.roe.toFixed(1)}%</td>)}</tr>
                            <tr><td className="py-2.5 px-4 font-sans text-slate-700">Indice di Indebitamento (Leverage)</td>{financialReports.indiciPluriennali.map(i => <td key={i.anno} className="py-2.5 px-4 text-right">{i.leverage.toFixed(2)}x</td>)}</tr>
                            <tr className="bg-slate-950 text-[#ccff00] font-extrabold"><td className="py-3 px-4 font-sans">DSCR (Copertura Finanziaria)</td>{financialReports.indiciPluriennali.map(i => <td key={i.anno} className="py-3 px-4 text-right">{i.dscr.toFixed(2)}x</td>)}</tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: CRONOPROGRAMMA & ROADMAP */}
              {activeTab === 'cronoprogramma' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-300 p-6 gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Cronoprogramma & Roadmap Operativa (PMO)</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-mono font-bold bg-slate-100 px-2 py-0.5 border border-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Periodo: {projectTimelineSummary.minInizio} → {projectTimelineSummary.maxFine}
                        </span>
                        <span className="flex items-center gap-1 font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 border border-emerald-200">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> Totale Giorni di Progetto: {projectTimelineSummary.totalGiorni} giorni
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'cronoprogramma', teamMembers)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Report PDF Cronoprogramma
                      </button>
                      {userRole === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaskId(null);
                            setNewTaskFase('Fase 2');
                            setNewTaskCodice('2.3');
                            setNewTaskDesc('');
                            setNewTaskOwner('Team GOS');
                            setNewTaskInizio('2026-05-01');
                            setNewTaskFine('2026-05-15');
                            setNewTaskGiorni(14);
                            setNewTaskBudget(5000);
                            setNewTaskReale(5000);
                            setNewTaskStato('Pianificato');
                            setShowModalTask(true);
                          }}
                          className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Aggiungi Task Operativo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-300 overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-extrabold uppercase">
                          <th className="py-3 px-4">Codice</th>
                          <th className="py-3 px-4">Task & Sub-Task Operativi</th>
                          <th className="py-3 px-4">Periodo (Inizio → Fine)</th>
                          <th className="py-3 px-4">Owner</th>
                          <th className="py-3 px-4 text-right">Budget (€)</th>
                          <th className="py-3 px-4 text-right">Reale (€)</th>
                          <th className="py-3 px-4 text-right">Scostamento</th>
                          <th className="py-3 px-4 text-center">Stato</th>
                          <th className="py-3 px-4 text-center">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {roadmapTasks.map((t) => {
                          const scostamento = t.budget > 0 ? ((t.reale - t.budget) / t.budget) * 100 : 0;
                          return (
                            <React.Fragment key={t.id}>
                              <tr className="hover:bg-slate-50 font-medium bg-slate-50/50">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.codice}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-sm">{t.task}</span>
                                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 font-bold">{t.fase}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-white border border-slate-300 px-2 py-1 inline-flex">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>{t.inizio}</span>
                                    <span>→</span>
                                    <span>{t.fine}</span>
                                    <span className="text-slate-400">({t.giorni}gg)</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-700">{t.owner}</td>
                                <td className="py-3 px-4 text-right font-mono font-bold">€ {t.budget?.toLocaleString('it-IT')}</td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">€ {t.reale?.toLocaleString('it-IT')}</td>
                                <td className={`py-3 px-4 text-right font-mono font-bold ${scostamento > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {scostamento > 0 ? `+${scostamento.toFixed(1)}%` : `${scostamento.toFixed(1)}%`}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                                    t.stato === 'Completato' ? 'bg-emerald-100 text-emerald-800' :
                                    t.stato === 'In Corso' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {t.stato}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center space-x-2">
                                  {userRole === 'admin' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCurrentParentTaskId(t.id);
                                          setEditingSubtaskId(null);
                                          setNewSubtaskTitolo('');
                                          setNewSubtaskInizio(t.inizio);
                                          setNewSubtaskFine(t.fine);
                                          setNewSubtaskBudget(1000);
                                          setNewSubtaskReale(1000);
                                          setNewSubtaskStato('Pianificato');
                                          setShowModalSubtask(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900 font-bold text-[10px] bg-indigo-50 px-2 py-1 cursor-pointer"
                                        title="Aggiungi Sub-Task"
                                      >
                                        + Sub
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditTask(t)}
                                        className="text-slate-600 hover:text-slate-950 cursor-pointer"
                                        title="Modifica Task"
                                      >
                                        <Edit2 className="w-4 h-4 inline" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRoadmapTask(t.id)}
                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                        title="Elimina Task"
                                      >
                                        <Trash2 className="w-4 h-4 inline" />
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>

                              {t.subtasks && t.subtasks.map((st: any) => {
                                const stScostamento = st.budget > 0 ? ((st.reale - st.budget) / st.budget) * 100 : 0;
                                return (
                                  <tr key={st.id} className="bg-white text-xs border-b border-slate-100">
                                    <td className="py-2.5 px-4 pl-8 text-slate-400 font-mono">↳</td>
                                    <td className="py-2.5 px-4 text-slate-700 font-medium pl-2">
                                      {st.titolo}
                                    </td>
                                    <td className="py-2.5 px-4">
                                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 inline-flex">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        <span>{st.inizio || t.inizio}</span>
                                        <span>→</span>
                                        <span>{st.fine || t.fine}</span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-slate-500 italic">Sub-task</td>
                                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">€ {st.budget?.toLocaleString('it-IT')}</td>
                                    <td className="py-2.5 px-4 text-right font-mono text-slate-800">€ {st.reale?.toLocaleString('it-IT')}</td>
                                    <td className={`py-2.5 px-4 text-right font-mono ${stScostamento > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {stScostamento > 0 ? `+${stScostamento.toFixed(1)}%` : `${stScostamento.toFixed(1)}%`}
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                      <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 font-bold uppercase">{st.stato}</span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center space-x-2">
                                      {userRole === 'admin' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditSubtask(t.id, st)}
                                            className="text-slate-500 hover:text-slate-900 cursor-pointer"
                                            title="Modifica Sub-task"
                                          >
                                            <Edit2 className="w-3.5 h-3.5 inline" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteSubtask(t.id, st.id)}
                                            className="text-red-400 hover:text-red-600 cursor-pointer"
                                            title="Elimina Sub-task"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 inline" />
                                          </button>
                                        </>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 5: RUOLI & GOVERNANCE (AGGIUNGI, MODIFICA, ELIMINA CON ENFASI SU RUOLO E NOME/COGNOME) */}
              {activeTab === 'ruoli' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-300 p-6 gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Organigramma & Risorse (Governance)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Gestione completa delle risorse umane, ruoli chiave e referenti di progetto.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => generateClientReport(selectedAzienda, forms, domande, risposteClienti, currentUserProfile, elapsedTime, financialReports, (html) => setReportPreviewHtml(html), 'ruoli', teamMembers)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Report PDF Organigramma
                      </button>
                      {userRole === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeamId(null);
                            setInputTeamRuolo('');
                            setInputTeamNome('');
                            setInputTeamCognome('');
                            setInputTeamEmail('');
                            setInputTeamPaese('Italia');
                            setInputTeamSocieta('Glaring LLP');
                            setShowModalTeam(true);
                          }}
                          className="bg-slate-950 hover:bg-slate-900 text-[#ccff00] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Aggiungi Risorsa / Ruolo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-300 overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-extrabold uppercase">
                          <th className="py-3 px-5">Ruolo & Posizione</th>
                          <th className="py-3 px-5">Nome e Cognome</th>
                          <th className="py-3 px-5">Società</th>
                          <th className="py-3 px-5">Paese</th>
                          <th className="py-3 px-5">Email</th>
                          <th className="py-3 px-5 text-center">Azioni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {teamMembers.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-5">
                              <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-200 inline-block">
                                {m.ruolo}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <span className="text-sm font-black text-indigo-700">
                                {m.nome} {m.cognome}
                              </span>
                            </td>
                            <td className="py-4 px-5 font-semibold text-slate-700">{m.societa}</td>
                            <td className="py-4 px-5 text-slate-600">{m.paese}</td>
                            <td className="py-4 px-5 font-mono text-slate-600">{m.email}</td>
                            <td className="py-4 px-5 text-center space-x-2">
                              {userRole === 'admin' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditTeamMember(m)}
                                    className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer inline-block"
                                    title="Modifica risorsa"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTeamMember(m.id)}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer inline-block"
                                    title="Elimina risorsa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          ) : (
            
            <div className="space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-300 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-slate-600 font-bold text-xs tracking-wider uppercase">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> GOS 1.0 — Cruscotto Direzionale Centrale
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                    Panoramica Operativa
                  </h1>
                </div>
                
                <div className="flex items-center gap-3">
                  {userRole === 'admin' && currentView === 'aziende' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAziendaId(null);
                        setRagioneSociale('');
                        setSettore('');
                        setPaese('Italia');
                        setShowModalAzienda(true);
                      }}
                      className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-3 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#ccff00]" /> Nuova Azienda Cliente
                    </button>
                  )}
                  {userRole === 'admin' && currentView === 'master' && (
                    <button
                      type="button"
                      onClick={() => {
                        setCodiceMaster('Q04');
                        setTitoloMaster('');
                        setDescrizioneMaster('');
                        setShowModalMasterForm(true);
                      }}
                      className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-3 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#ccff00]" /> Nuovo Master Template (Q)
                    </button>
                  )}
                  <div className="bg-white border border-slate-300 text-slate-700 px-4 py-2.5 text-xs font-bold flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" /> Supabase Connesso
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-300 p-5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aziende Clienti</p>
                  <p className="text-2xl font-extrabold text-slate-900">{aziende.length}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold inline-block">Registrate</span>
                </div>
                <div className="bg-white border border-slate-300 p-5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Template Master Q</p>
                  <p className="text-2xl font-extrabold text-slate-900">{masterForms.length}</p>
                  <span className="text-[10px] text-indigo-600 font-semibold inline-block">Libreria Q</span>
                </div>
                <div className="bg-white border border-slate-300 p-5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Utenti GOS Attivi</p>
                  <p className="text-2xl font-extrabold text-slate-900">{glaringUsers.length}</p>
                  <span className="text-[10px] text-indigo-600 font-semibold inline-block">Profili</span>
                </div>
                <div className="bg-white border border-slate-300 p-5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stato Sistema</p>
                  <p className="text-2xl font-extrabold text-emerald-600">Online</p>
                  <span className="text-[10px] text-emerald-600 font-semibold inline-block">Sincronizzato</span>
                </div>
              </div>

              <div className="flex border-b border-slate-300 gap-8">
                <button
                  type="button"
                  onClick={() => setCurrentView('aziende')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    currentView === 'aziende'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Aziende Clienti ({aziende.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('master')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    currentView === 'master'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Library className="w-4 h-4" /> Libreria Master Q ({masterForms.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('utenti')}
                  className={`pb-3 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    currentView === 'utenti'
                      ? 'border-slate-950 text-slate-950'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" /> Utenti Glaring & Permessi ({glaringUsers.length})
                </button>
              </div>

              {currentView === 'aziende' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-300">
                    <div className="px-6 py-4 border-b border-slate-300 flex justify-between items-center bg-white">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Elenco Aziende Clienti (`gos_aziende`)</h2>
                      <span className="text-[11px] text-slate-400">Aggiornato in tempo reale</span>
                    </div>

                    {loading ? (
                      <div className="p-12 text-center text-slate-400">Caricamento dati...</div>
                    ) : error ? (
                      <div className="p-12 text-center text-red-600 bg-red-50">Errore: {error}</div>
                    ) : aziende.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 space-y-4">
                        <p>Nessuna azienda presente nel database.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-white border border-slate-300">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-300 font-extrabold uppercase tracking-wider">
                              <th className="py-3 px-6">Ragione Sociale</th>
                              <th className="py-3 px-6">Settore</th>
                              <th className="py-3 px-6">Paese</th>
                              <th className="py-3 px-6">Stato</th>
                              <th className="py-3 px-6 text-right">Azioni</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {aziende.map((az) => (
                              <tr key={az.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">{az.ragione_sociale}</td>
                                <td className="py-4 px-6 text-slate-600 font-medium">{az.settore || 'Generale'}</td>
                                <td className="py-4 px-6 text-slate-600 font-medium">{az.paese || 'Italia'}</td>
                                <td className="py-4 px-6">
                                  <span className="inline-flex items-center px-3 py-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                                    {az.stato || 'active'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right space-x-2">
                                  {userRole === 'admin' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingAziendaId(az.id);
                                          setRagioneSociale(az.ragione_sociale);
                                          setSettore(az.settore || '');
                                          setPaese(az.paese || 'Italia');
                                          setShowModalAzienda(true);
                                        }}
                                        className="text-slate-700 hover:text-slate-950 font-bold inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 px-3.5 py-2 transition-colors cursor-pointer"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" /> Modifica
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAzienda(az.id)}
                                        className="text-slate-600 hover:text-red-600 font-bold inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-red-50 px-3 py-2 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleCopyClientLink(az.id)}
                                    className="text-emerald-800 font-extrabold inline-flex items-center gap-1.5 text-xs bg-emerald-100 hover:bg-emerald-200 px-3.5 py-2 transition-colors cursor-pointer"
                                    title="Copia link questionario per il cliente"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Copia Link
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => loadAziendaDetails(az)}
                                    className="text-white font-extrabold inline-flex items-center gap-1.5 text-xs bg-slate-950 hover:bg-slate-900 px-4 py-2 transition-colors cursor-pointer"
                                  >
                                    Apri Cruscotto <ArrowRight className="w-3.5 h-3.5 text-[#ccff00]" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentView === 'master' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-300">
                    <div className="px-6 py-4 border-b border-slate-300 bg-white">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Moduli Master Q (`gos_master_forms`)</h2>
                    </div>

                    {masterForms.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 bg-white">Nessun modulo master Q presente nella libreria.</div>
                    ) : (
                      <div className="divide-y divide-slate-200 bg-white border border-slate-300">
                        {masterForms.map((mf) => {
                          const countDomande = masterDomande.filter(d => d.master_form_id === mf.id).length;
                          return (
                            <div key={mf.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div>
                                <div className="flex items-center gap-2.5">
                                  {mf.codice && (
                                    <span className="text-[11px] bg-slate-900 text-[#ccff00] font-extrabold px-2.5 py-1">
                                      {mf.codice}
                                    </span>
                                  )}
                                  <h3 className="text-sm font-extrabold text-slate-900">{mf.titolo}</h3>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{mf.descrizione || 'Nessuna descrizione.'}</p>
                                <span className="text-[11px] text-indigo-600 font-bold mt-2 inline-block">
                                  {countDomande} parametri configurati nel template
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedMasterForm(mf)}
                                className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                Gestisci Master <ArrowRight className="w-3.5 h-3.5 text-[#ccff00]" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentView === 'utenti' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-300">
                    <div className="px-6 py-4 border-b border-slate-300 bg-white flex justify-between items-center">
                      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Utenti Amministratori & Partner Glaring (`gos_profiles`)</h2>
                      <span className="text-[11px] text-slate-400">Gestione diretta anagrafica e permessi GOS</span>
                    </div>

                    {glaringUsers.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 bg-white">Nessun profilo utente registrato nella tabella `gos_profiles`.</div>
                    ) : (
                      <div className="overflow-x-auto bg-white border border-slate-300">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-300 font-extrabold uppercase tracking-wider">
                              <th className="py-3 px-6">Nome</th>
                              <th className="py-3 px-6">Cognome</th>
                              <th className="py-3 px-6">Email</th>
                              <th className="py-3 px-6">Ruolo GOS</th>
                              <th className="py-3 px-6 text-right">Azioni Profilo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {glaringUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-6 font-extrabold text-slate-900">{user.nome || 'N.D.'}</td>
                                <td className="py-4 px-6 font-extrabold text-slate-900">{user.cognome || 'N.D.'}</td>
                                <td className="py-4 px-6 text-slate-600 font-medium">{user.email}</td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-3 py-1 text-[10px] font-extrabold uppercase ${user.ruolo === 'admin' ? 'bg-slate-900 text-[#ccff00]' : 'bg-slate-100 text-slate-700'}`}>
                                    {user.ruolo || 'user'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {userRole === 'admin' ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingUserId(user.id);
                                        setEditUserNome(user.nome || '');
                                        setEditUserCognome(user.cognome || '');
                                        setEditUserRuolo(user.ruolo || 'user');
                                        setShowModalUser(true);
                                      }}
                                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-4 py-2 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" /> Modifica Profilo
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">Solo lettura</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <footer className="bg-[#ccff00] text-slate-950 border-t border-[#b8e600] px-8 py-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-slate-950 animate-pulse"></span>
            <span>GOS 1.0 — Strategic & Operation Advisors Infrastructure</span>
          </div>
          <div className="text-slate-800 font-medium">
            Glaring LLP © 2026 — Tutti i diritti riservati
          </div>
        </div>
      </footer>

      {/* MODALE TASK PRINCIPALE */}
      {showModalTask && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingTaskId ? 'Modifica Task Operativo' : 'Aggiungi Task Operativo (Roadmap)'}
            </h3>
            <form onSubmit={handleSaveRoadmapTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fase</label>
                <input
                  type="text"
                  required
                  value={newTaskFase}
                  onChange={(e) => setNewTaskFase(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Codice (es. 2.3)</label>
                <input
                  type="text"
                  required
                  value={newTaskCodice}
                  onChange={(e) => setNewTaskCodice(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrizione Task *</label>
                <input
                  type="text"
                  required
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Owner (Responsabile)</label>
                <input
                  type="text"
                  required
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data Inizio (Calendario)</label>
                  <input
                    type="date"
                    required
                    value={newTaskInizio}
                    onChange={(e) => {
                      setNewTaskInizio(e.target.value);
                      updateDaysBetween(e.target.value, newTaskFine, setNewTaskGiorni);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium font-mono bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data Fine (Calendario)</label>
                  <input
                    type="date"
                    required
                    value={newTaskFine}
                    onChange={(e) => {
                      setNewTaskFine(e.target.value);
                      updateDaysBetween(newTaskInizio, e.target.value, setNewTaskGiorni);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium font-mono bg-white cursor-pointer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Budget (€)</label>
                  <input
                    type="number"
                    required
                    value={newTaskBudget}
                    onChange={(e) => setNewTaskBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reale (€)</label>
                  <input
                    type="number"
                    required
                    value={newTaskReale}
                    onChange={(e) => setNewTaskReale(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Giorni Lavorativi</label>
                  <input
                    type="number"
                    required
                    value={newTaskGiorni}
                    onChange={(e) => setNewTaskGiorni(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stato</label>
                  <select
                    value={newTaskStato}
                    onChange={(e) => setNewTaskStato(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="Pianificato">Pianificato</option>
                    <option value="In Corso">In Corso</option>
                    <option value="Completato">Completato</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalTask(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 cursor-pointer"
                >
                  {editingTaskId ? 'Aggiorna Task' : 'Aggiungi Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE SUB-TASK */}
      {showModalSubtask && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingSubtaskId ? 'Modifica Sub-Task' : 'Aggiungi Sub-Task'}
            </h3>
            <form onSubmit={handleSaveSubtask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Titolo Sub-Task *</label>
                <input
                  type="text"
                  required
                  value={newSubtaskTitolo}
                  onChange={(e) => setNewSubtaskTitolo(e.target.value)}
                  placeholder="Descrizione sub-task..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data Inizio (Calendario)</label>
                  <input
                    type="date"
                    required
                    value={newSubtaskInizio}
                    onChange={(e) => setNewSubtaskInizio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium font-mono bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data Fine (Calendario)</label>
                  <input
                    type="date"
                    required
                    value={newSubtaskFine}
                    onChange={(e) => setNewSubtaskFine(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium font-mono bg-white cursor-pointer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Budget (€)</label>
                  <input
                    type="number"
                    required
                    value={newSubtaskBudget}
                    onChange={(e) => setNewSubtaskBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reale (€)</label>
                  <input
                    type="number"
                    required
                    value={newSubtaskReale}
                    onChange={(e) => setNewSubtaskReale(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stato</label>
                <select
                  value={newSubtaskStato}
                  onChange={(e) => setNewSubtaskStato(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 text-xs bg-white font-medium"
                >
                  <option value="Pianificato">Pianificato</option>
                  <option value="In Corso">In Corso</option>
                  <option value="Completato">Completato</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalSubtask(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 cursor-pointer"
                >
                  {editingSubtaskId ? 'Aggiorna Sub-Task' : 'Salva Sub-Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE GESTIONE RISORSE & RUOLI */}
      {showModalTeam && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingTeamId ? 'Modifica Risorsa / Ruolo' : 'Aggiungi Nuova Risorsa / Ruolo'}
            </h3>
            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ruolo / Posizione *</label>
                <input
                  type="text"
                  required
                  value={inputTeamRuolo}
                  onChange={(e) => setInputTeamRuolo(e.target.value)}
                  placeholder="Es. Senior Executive Partner"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome *</label>
                  <input
                    type="text"
                    required
                    value={inputTeamNome}
                    onChange={(e) => setInputTeamNome(e.target.value)}
                    placeholder="Nome"
                    className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cognome *</label>
                  <input
                    type="text"
                    required
                    value={inputTeamCognome}
                    onChange={(e) => setInputTeamCognome(e.target.value)}
                    placeholder="Cognome"
                    className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={inputTeamEmail}
                  onChange={(e) => setInputTeamEmail(e.target.value)}
                  placeholder="email@dominio.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Società</label>
                  <input
                    type="text"
                    value={inputTeamSocieta}
                    onChange={(e) => setInputTeamSocieta(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Paese</label>
                  <input
                    type="text"
                    value={inputTeamPaese}
                    onChange={(e) => setInputTeamPaese(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalTeam(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 cursor-pointer"
                >
                  {editingTeamId ? 'Aggiorna Risorsa' : 'Salva Risorsa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalUser && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">Modifica Profilo Utente</h3>
            <form onSubmit={handleSaveUserUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome *</label>
                <input
                  type="text"
                  required
                  value={editUserNome}
                  onChange={(e) => setEditUserNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cognome *</label>
                <input
                  type="text"
                  required
                  value={editUserCognome}
                  onChange={(e) => setEditUserCognome(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ruolo GOS *</label>
                <select
                  value={editUserRuolo}
                  onChange={(e) => setEditUserRuolo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalUser(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : 'Aggiorna Profilo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalAzienda && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              {editingAziendaId ? 'Modifica Anagrafica Azienda' : 'Nuova Azienda Cliente'}
            </h3>
            <form onSubmit={handleSaveAzienda} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ragione Sociale *</label>
                <input
                  type="text"
                  required
                  value={ragioneSociale}
                  onChange={(e) => setRagioneSociale(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Settore</label>
                <input
                  type="text"
                  value={settore}
                  onChange={(e) => setSettore(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Paese</label>
                <input
                  type="text"
                  value={paese}
                  onChange={(e) => setPaese(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalAzienda(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : 'Conferma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalForm && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">Assegna Modulo da Master Q</h3>
            {masterForms.length > 0 && (
              <div className="bg-white border border-slate-300 p-4 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Library className="w-4 h-4 text-indigo-600" /> Seleziona Template Q
                </label>
                <select
                  value={selectedMasterId}
                  onChange={(e) => handleSelectMaster(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                >
                  <option value="">-- Seleziona un template --</option>
                  {masterForms.map(mf => (
                    <option key={mf.id} value={mf.id}>
                      {mf.codice ? `[${mf.codice}] ` : ''}{mf.titolo}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <form onSubmit={handleCreateForm} className="space-y-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Titolo Modulo *</label>
                <input
                  type="text"
                  required
                  value={titoloForm}
                  onChange={(e) => setTitoloForm(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalForm(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Assegnazione...' : 'Conferma e Assegna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalDomanda && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">Aggiungi Nuova Domanda Master</h3>
            <form onSubmit={handleCreateDomanda} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Testo Domanda / Parametro *</label>
                <textarea
                  required
                  rows={3}
                  value={testoDomanda}
                  onChange={(e) => setTestoDomanda(e.target.value)}
                  placeholder="Es. Valutazione dei KPI finanziari..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoria</label>
                <input
                  type="text"
                  value={categoriaDomanda}
                  onChange={(e) => setCategoriaDomanda(e.target.value)}
                  placeholder="Es. Strategia, Operations, Finanza"
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalDomanda(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Salvataggio...' : 'Aggiungi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModalMasterForm && userRole === 'admin' && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 max-w-md w-full p-8 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">Nuovo Master Template (Q)</h3>
            <form onSubmit={handleCreateMasterForm} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Codice (es. Q04) *</label>
                <input
                  type="text"
                  required
                  value={codiceMaster}
                  onChange={(e) => setCodiceMaster(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Titolo Master *</label>
                <input
                  type="text"
                  value={titoloMaster}
                  onChange={(e) => setTitoloMaster(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrizione</label>
                <textarea
                  rows={2}
                  value={descrizioneMaster}
                  onChange={(e) => setDescrizioneMaster(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModalMasterForm(false)}
                  className="px-4 py-2.5 border border-slate-300 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-950 text-[#ccff00] text-xs font-extrabold hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Creazione...' : 'Crea Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
