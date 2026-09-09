


import React, { useState, useEffect } from "react";
import { getData, postData } from "/src/services/apiService";

export default function CashBookUI() {
  const [creditEntries, setCreditEntries] = useState([]);
  const [debitEntries, setDebitEntries] = useState([]);

  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  const [creditForm, setCreditForm] = useState({
    purpose: "",
    amt: "",
    remark: "",
  });

  const [debitForm, setDebitForm] = useState({
    purpose: "",
    amt: "",
    remark: "",
  });

  useEffect(() => {
    fetchCashbook();
  }, []);

  const fetchCashbook = async () => {
    try {
      const res = await getData("/api/cashbook/cashbook");

      if (res?.success && Array.isArray(res.entries)) {
        const credits = [];
        const debits = [];

        res.entries.forEach((row, index) => {
          const entry = {
            id: row.id,
            sno: index + 1,
            purpose:
              row.purpose ||
              row.reference ||
              row.bookingType ||
              "—",
            amt: row.amount,
            remark: row.remark || row.paymentMode || "",
            billNo: row.billNo || "",
            date: row.transactionDate,
          };

          if (row.entryType === "credit") credits.push(entry);
          if (row.entryType === "debit") debits.push(entry);
        });

        setCreditEntries(credits);
        setDebitEntries(debits);

        setOpeningBalance(res.openingBalance || 0);
        setClosingBalance(res.closingBalance || 0);
      }
    } catch (err) {
      console.error("Cashbook fetch error:", err);
    }
  };

  
  const addCredit = async () => {
    if (!creditForm.purpose || !creditForm.amt) return;

    try {
      const payload = {
        purpose: creditForm.purpose,
        amount: creditForm.amt,
        remark: creditForm.remark,
      };

      const res = await postData("/api/cashbook/credit", payload);

      if (res?.success) {
        fetchCashbook();
        setCreditForm({ purpose: "", amt: "", remark: "" });
      }
    } catch (err) {
      console.error("Add credit error:", err);
    }
  };


  const addDebit = async () => {
    if (!debitForm.purpose || !debitForm.amt) return;

    try {
      const payload = {
        purpose: debitForm.purpose,
        amount: debitForm.amt,
        remark: debitForm.remark,
      };

      const res = await postData("/api/cashbook/debit", payload);

      if (res?.success) {
        fetchCashbook();
        setDebitForm({ purpose: "", amt: "", remark: "" });
      }
    } catch (err) {
      console.error("Add debit error:", err);
    }
  };

  const total = (arr) =>
    arr.reduce((sum, e) => sum + Number(e.amt || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg p-4">

       
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl text-orange-400 font-bold">
            CASH BOOK
          </h1>
          <div className="text-sm text-gray-600">
            Date: {new Date().toLocaleDateString()}
          </div>
        </div>

     
        <div className="flex justify-between bg-gray-50 p-3 rounded mb-4">
          <div>
            <div className="text-xs text-gray-500">Opening Balance</div>
            <div className="font-semibold text-lg">
              {openingBalance}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Balance</div>
            <div className="font-semibold text-lg">
              {closingBalance}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

         
          <div className="border rounded-lg p-3 bg-blue-50">
            <h2 className="font-semibold mb-2 text-blue-800">
              Credit
            </h2>

            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Purpose"
              value={creditForm.purpose}
              onChange={(e) =>
                setCreditForm({
                  ...creditForm,
                  purpose: e.target.value,
                })
              }
            />
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Amount"
              value={creditForm.amt}
              onChange={(e) =>
                setCreditForm({
                  ...creditForm,
                  amt: e.target.value,
                })
              }
            />
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Remark"
              value={creditForm.remark}
              onChange={(e) =>
                setCreditForm({
                  ...creditForm,
                  remark: e.target.value,
                })
              }
            />

            <button
              className="w-full bg-blue-600 text-white py-2 rounded mb-3"
              onClick={addCredit}
            >
              Add Credit
            </button>

            <table className="w-full text-sm border">
              <thead className="bg-blue-200">
                <tr>
                  <th>S.No</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {creditEntries.map((e, i) => (
                  <tr key={i} className="even:bg-blue-100">
                    <td>{e.sno}</td>
                    <td>{e.purpose}</td>
                    <td>{e.amt}</td>
                    <td>{e.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right font-semibold mt-2">
              Total: {total(creditEntries)}
            </div>
          </div>

        
          <div className="border rounded-lg p-3 bg-pink-50">
            <h2 className="font-semibold mb-2 text-pink-800">
              Debit
            </h2>

            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Purpose"
              value={debitForm.purpose}
              onChange={(e) =>
                setDebitForm({
                  ...debitForm,
                  purpose: e.target.value,
                })
              }
            />
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Amount"
              value={debitForm.amt}
              onChange={(e) =>
                setDebitForm({
                  ...debitForm,
                  amt: e.target.value,
                })
              }
            />
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Remark"
              value={debitForm.remark}
              onChange={(e) =>
                setDebitForm({
                  ...debitForm,
                  remark: e.target.value,
                })
              }
            />

            <button
              className="w-full bg-pink-600 text-white py-2 rounded mb-3"
              onClick={addDebit}
            >
              Add Debit
            </button>

            <table className="w-full text-sm border">
              <thead className="bg-pink-200">
                <tr>
                  <th>S.No</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {debitEntries.map((e, i) => (
                  <tr key={i} className="even:bg-pink-100">
                    <td>{e.sno}</td>
                    <td>{e.purpose}</td>
                    <td>{e.amt}</td>
                    <td>{e.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right font-semibold mt-2">
              Total: {total(debitEntries)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
