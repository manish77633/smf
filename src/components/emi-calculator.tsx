"use client";

import { useState } from "react";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function EmiCalculator() {
  const [amount, setAmount] = useState("500000");
  const [rate, setRate] = useState("12");
  const [tenure, setTenure] = useState("36");
  const principal = Number(amount);
  const monthlyRate = Number(rate) / 1200;
  const months = Number(tenure);
  const valid = amount && rate && tenure && principal > 0 && principal <= 1000000000 && monthlyRate >= 0 && Number(rate) <= 100 && Number.isInteger(months) && months >= 1 && months <= 600;
  const emi = valid ? monthlyRate === 0 ? principal / months : principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate)) : null;

  return (
    <section aria-label="EMI calculator" className="band bg-[#fff9f4]">
      <div className="wrap max-w-3xl">
        <div className="panel mt-6 grid gap-5 p-6 sm:grid-cols-3">
          <label>Loan amount (₹)<input className="field mt-2" type="number" min="1" max="1000000000" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
          <label>Annual interest (%)<input className="field mt-2" type="number" min="0" max="100" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
          <label>Tenure (months)<input className="field mt-2" type="number" min="1" max="600" step="1" value={tenure} onChange={(e) => setTenure(e.target.value)} /></label>
        </div>
        <div aria-live="polite" className="panel mt-5 bg-softred p-6">
          {emi === null ? <p>Enter a valid amount, rate and tenure.</p> : <>
            <p>Estimated monthly EMI</p>
            <strong className="text-3xl text-brand">{currency.format(emi)}</strong>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><dt>Total interest</dt><dd>{currency.format(Math.max(0, emi * months - principal))}</dd></div>
              <div><dt>Total repayment</dt><dd>{currency.format(emi * months)}</dd></div>
            </dl>
          </>}
        </div>
      </div>
    </section>
  );
}
