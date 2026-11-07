'use client';

import React, { useMemo } from 'react';

export const useFinancialEngine = (
  prodotti: any[],
  costiProduzioneExtra: any[],
  personale: any[],
  altriCosti: any[],
  capex: any[],
  finanziamenti: any[],
  beginningBalance: { y1: number; y2: number; y3: number; y4: number; y5: number },
  aliquotaFiscale: number,
  wacc: number
) => {
  const calculateIRR = (initialInvestment: number, cashFlows: number[]) => {
    const cfs = [-initialInvestment, ...cashFlows];
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0;
      let dnpv = 0;
      for (let t = 0; t < cfs.length; t++) {
        npv += cfs[t] / Math.pow(1 + rate, t);
        if (t > 0) dnpv -= t * cfs[t] / Math.pow(1 + rate, t + 1);
      }
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 1e-7) return newRate;
      rate = newRate;
      if (isNaN(rate) || !isFinite(rate)) return 0;
    }
    return rate;
  };

  return useMemo(() => {
    const anni = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
    const ricaviAnnali = [0, 0, 0, 0, 0];
    const costoProduzioneAnnali = [0, 0, 0, 0, 0];

    prodotti.forEach(p => {
      for (let i = 0; i < 5; i++) {
        const yKey = `y${i + 1}` as keyof typeof p.q;
        ricaviAnnali[i] += (p.q[yKey] || 0) * (p.prezzo[yKey] || 0);
        costoProduzioneAnnali[i] += (p.q[yKey] || 0) * (p.costo[yKey] || 0);
      }
    });

    costiProduzioneExtra.forEach(ce => {
      for (let i = 0; i < 5; i++) {
        const yKey = `y${i + 1}` as keyof typeof ce;
        costoProduzioneAnnali[i] += Number(ce[yKey] || 0);
      }
    });

    const personaleAnnali = [0, 0, 0, 0, 0];
    personale.forEach(item => {
      for (let i = 0; i < 5; i++) {
        const yKey = `y${i + 1}` as keyof typeof item;
        personaleAnnali[i] += Number(item[yKey] || 0);
      }
    });

    const altriCostiAnnali = [0, 0, 0, 0, 0];
    altriCosti.forEach(item => {
      for (let i = 0; i < 5; i++) {
        const yKey = `y${i + 1}` as keyof typeof item;
        altriCostiAnnali[i] += Number(item[yKey] || 0);
      }
    });

    const opexAnnali = anni.map((_, i) => personaleAnnali[i] + altriCostiAnnali[i]);

    const capexAnnali = [0, 0, 0, 0, 0];
    capex.forEach(c => {
      for (let i = 0; i < 5; i++) {
        const yKey = `y${i + 1}` as keyof typeof c;
        capexAnnali[i] += Number(c[yKey] || 0);
      }
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
      
      const bbMap = [beginningBalance.y1, beginningBalance.y2, beginningBalance.y3, beginningBalance.y4, beginningBalance.y5];
      if (idx === 0) cassaCumulata = bbMap[0] + fcfNetto;
      else cassaCumulata = bbMap[idx] + fcfNetto;

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
      kpis: { npv, irr: calculatedIrr }
    };
  }, [prodotti, costiProduzioneExtra, personale, altriCosti, capex, finanziamenti, beginningBalance, aliquotaFiscale, wacc]);
};
