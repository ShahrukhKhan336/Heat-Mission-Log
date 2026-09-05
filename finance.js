// finance.js — Finance module for Mission Log
// Loaded before app.js. Defines global FinanceView component.

// ── Module-scope constants & components (must be outside FinanceView
//    so React does not remount inputs on every keystroke) ──────────
const FIN_FREQUENCIES = ["Monthly", "Quarterly", "Triannual", "Half-yearly", "Yearly", "Custom"];
const FIN_PAYMENT_TYPES = ["Salary", "Honorarium", "TA-DA", "Committee", "Deputation", "Procurement", "Other"];

// ── Project timeline ──────────────────────────────────────────────
const PROJECT_START = new Date(2025, 7, 27); // 27 August 2025
const PROJECT_END = new Date(2028, 7, 27); // 27 August 2028

// Default honorarium cadence per role (ATFOM Annex 11 split into installments)
const HONORARIUM_CADENCE = {
  "SPM": {
    months: 3,
    label: "Every 3 months (4 × 1 month basic / year)"
  },
  "ASPM": {
    months: 6,
    label: "Half-yearly (2 × 1 month basic / year)"
  },
  "Member": {
    months: 12,
    label: "Yearly (1 × 1 month basic / year)"
  },
  "UATFS": {
    months: 12,
    label: "Yearly block allocation"
  }
};

// Build the full honorarium schedule from project start to end
function buildHonorariumSchedule(intervalMonths) {
  const out = [];
  let d = new Date(PROJECT_START);
  while (d <= PROJECT_END) {
    out.push(new Date(d));
    d = new Date(d.getFullYear(), d.getMonth() + intervalMonths, d.getDate());
  }
  return out;
}
function honPeriodLabel(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
const FIN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const finIStyle = {
  width: "100%",
  background: "#0A0E14",
  border: "1px solid #1F2733",
  borderRadius: 6,
  padding: "8px 10px",
  color: "#E8EDF2",
  fontSize: 13
};
function FinField({
  label,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "#8593A3",
      marginBottom: 5
    }
  }, label), children);
}
function finFmtBDT(n) {
  return n === null || n === undefined ? "—" : "৳ " + Number(n).toLocaleString();
}
function finFmtDate(s) {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  if (isNaN(d)) return s;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
const FinanceView = ({
  currentMember,
  members,
  canManage
}) => {
  const {
    useState,
    useEffect,
    useMemo
  } = React;
  const [tab, setTab] = useState("payroll");
  const [configs, setConfigs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Salary config modal
  const [cfgModal, setCfgModal] = useState(false);
  const [cfgEdit, setCfgEdit] = useState(null);
  const [cfgForm, setCfgForm] = useState({
    memberId: "",
    memberName: "",
    groupName: "",
    frequency: "Monthly",
    amount: "",
    notes: ""
  });
  const [cfgBusy, setCfgBusy] = useState(false);
  const [cfgErr, setCfgErr] = useState("");

  // Add payment modal
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({
    memberId: "",
    memberName: "",
    paymentType: "Salary",
    periodLabel: "",
    amount: "",
    description: ""
  });
  const [payBusy, setPayBusy] = useState(false);
  const [payErr, setPayErr] = useState("");

  // Generate period modal
  const [genModal, setGenModal] = useState(false);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genMonth, setGenMonth] = useState(new Date().getMonth());
  const [genBusy, setGenBusy] = useState(false);
  const [genMsg, setGenMsg] = useState("");

  // Payment filters
  const [fType, setFType] = useState("All");
  const [fStatus, setFStatus] = useState("All");
  const [fMember, setFMember] = useState("All");

  // Delete confirms
  const [delCfgId, setDelCfgId] = useState(null);
  const [delPayId, setDelPayId] = useState(null);

  // Honorarium
  const [honModal, setHonModal] = useState(false);
  const [honEdit, setHonEdit] = useState(null);
  const [honForm, setHonForm] = useState({
    memberId: "",
    memberName: "",
    groupName: "",
    cadence: "Member",
    amount: "",
    paidCount: "0",
    notes: ""
  });
  const [honBusy, setHonBusy] = useState(false);
  const [honErr, setHonErr] = useState("");
  const [genHonBusy, setGenHonBusy] = useState(false);
  const [genHonMsg, setGenHonMsg] = useState("");
  useEffect(() => {
    loadAll();
  }, []);
  async function loadAll() {
    setLoading(true);
    const [cr, pr] = await Promise.all([db.from("salary_config").select("*").order("group_name").order("member_name"), db.from("payments").select("*").order("created_at", {
      ascending: false
    })]);
    if (!cr.error) setConfigs(cr.data || []);
    if (!pr.error) setPayments(pr.data || []);
    setLoading(false);
  }
  async function reloadConfigs() {
    const {
      data,
      error
    } = await db.from("salary_config").select("*").order("group_name").order("member_name");
    if (!error) setConfigs(data || []);
  }
  async function reloadPayments() {
    const {
      data,
      error
    } = await db.from("payments").select("*").order("created_at", {
      ascending: false
    });
    if (!error) setPayments(data || []);
  }

  // ── Salary config operations ──────────────────────────────────
  async function saveCfg() {
    if (!cfgForm.memberId || !cfgForm.amount) {
      setCfgErr("Member and amount are required.");
      return;
    }
    setCfgBusy(true);
    setCfgErr("");
    try {
      const payload = {
        member_id: Number(cfgForm.memberId),
        member_name: cfgForm.memberName,
        group_name: cfgForm.groupName,
        frequency: cfgForm.frequency,
        amount: Number(cfgForm.amount),
        notes: cfgForm.notes.trim(),
        config_type: "Salary"
      };
      let error;
      if (cfgEdit) {
        ({
          error
        } = await db.from("salary_config").update(payload).eq("id", cfgEdit.id));
      } else {
        ({
          error
        } = await db.from("salary_config").insert(payload));
      }
      if (error) throw error;
      setCfgModal(false);
      await reloadConfigs();
    } catch (e) {
      setCfgErr(e.message || "Failed.");
    }
    setCfgBusy(false);
  }
  async function deleteCfg(id) {
    await db.from("salary_config").delete().eq("id", id);
    setDelCfgId(null);
    await reloadConfigs();
  }

  // ── Payment operations ────────────────────────────────────────
  async function savePay() {
    if (!payForm.memberName || !payForm.periodLabel || !payForm.amount) {
      setPayErr("Member, period and amount are required.");
      return;
    }
    setPayBusy(true);
    setPayErr("");
    try {
      const {
        error
      } = await db.from("payments").insert({
        payment_type: payForm.paymentType,
        member_id: payForm.memberId ? Number(payForm.memberId) : null,
        member_name: payForm.memberName,
        period_label: payForm.periodLabel.trim(),
        amount: Number(payForm.amount),
        description: payForm.description.trim(),
        status: "Unpaid"
      });
      if (error) throw error;
      setPayModal(false);
      await reloadPayments();
    } catch (e) {
      setPayErr(e.message || "Failed.");
    }
    setPayBusy(false);
  }
  async function markPaid(id) {
    await db.from("payments").update({
      status: "Paid",
      paid_date: new Date().toISOString().slice(0, 10),
      paid_by: currentMember?.name || ""
    }).eq("id", id);
    setPayments(p => p.map(x => x.id === id ? {
      ...x,
      status: "Paid",
      paid_date: new Date().toISOString().slice(0, 10)
    } : x));
  }
  async function markUnpaid(id) {
    await db.from("payments").update({
      status: "Unpaid",
      paid_date: null,
      paid_by: ""
    }).eq("id", id);
    setPayments(p => p.map(x => x.id === id ? {
      ...x,
      status: "Unpaid",
      paid_date: null
    } : x));
  }
  async function deletePay(id) {
    await db.from("payments").delete().eq("id", id);
    setDelPayId(null);
    await reloadPayments();
  }

  // ── Generate period salary payments ──────────────────────────
  function getPeriodLabel(freq, month, year) {
    const mn = FIN_MONTHS[month].slice(0, 3);
    if (freq === "Monthly") return `${mn} ${year}`;
    if (freq === "Quarterly") return `Q${Math.floor(month / 3) + 1} ${year}`;
    if (freq === "Triannual") return `T${Math.floor(month / 4) + 1} ${year}`;
    if (freq === "Half-yearly") return `H${month < 6 ? 1 : 2} ${year}`;
    if (freq === "Yearly") return `${year}`;
    return `${mn} ${year}`;
  }
  function periodMatches(freq, month) {
    if (freq === "Monthly") return true;
    if (freq === "Quarterly") return month % 3 === 0; // Jan,Apr,Jul,Oct
    if (freq === "Triannual") return month % 4 === 0; // Jan,May,Sep
    if (freq === "Half-yearly") return month % 6 === 0; // Jan,Jul
    if (freq === "Yearly") return month === 0; // Jan
    return false;
  }
  async function generatePeriod() {
    setGenBusy(true);
    setGenMsg("");
    const matching = salConfigs.filter(c => c.active && periodMatches(c.frequency, genMonth));
    if (matching.length === 0) {
      setGenMsg("No members have a salary frequency matching this period.");
      setGenBusy(false);
      return;
    }
    let created = 0;
    for (const c of matching) {
      const label = getPeriodLabel(c.frequency, genMonth, genYear);
      // Check if already exists
      const {
        data: existing
      } = await db.from("payments").select("id").eq("member_id", c.member_id).eq("period_label", label).eq("payment_type", "Salary");
      if (existing && existing.length > 0) continue;
      await db.from("payments").insert({
        payment_type: "Salary",
        member_id: c.member_id,
        member_name: c.member_name,
        period_label: label,
        amount: c.amount,
        description: `Salary — ${c.frequency}`,
        status: "Unpaid"
      });
      created++;
    }
    setGenMsg(`${created} payment record${created !== 1 ? "s" : ""} created. ${matching.length - created} already existed.`);
    await reloadPayments();
    setGenBusy(false);
  }

  // ── Honorarium operations ─────────────────────────────────────
  const honConfigs = configs.filter(c => c.config_type === "Honorarium");
  const salConfigs = configs.filter(c => c.config_type !== "Honorarium");
  async function saveHon() {
    if (!honForm.memberId || !honForm.amount) {
      setHonErr("Member and amount are required.");
      return;
    }
    setHonBusy(true);
    setHonErr("");
    try {
      const cad = HONORARIUM_CADENCE[honForm.cadence];
      const freq = cad.months === 3 ? "Quarterly" : cad.months === 6 ? "Half-yearly" : "Yearly";
      const payload = {
        member_id: Number(honForm.memberId),
        member_name: honForm.memberName,
        group_name: honForm.groupName,
        frequency: freq,
        amount: Number(honForm.amount),
        config_type: "Honorarium",
        notes: honForm.cadence + " | already paid: " + (honForm.paidCount || "0") + (honForm.notes ? " | " + honForm.notes.trim() : "")
      };
      let error;
      if (honEdit) {
        ({
          error
        } = await db.from("salary_config").update(payload).eq("id", honEdit.id));
      } else {
        ({
          error
        } = await db.from("salary_config").insert(payload));
      }
      if (error) throw error;
      setHonModal(false);
      await reloadConfigs();
    } catch (e) {
      setHonErr(e.message || "Failed.");
    }
    setHonBusy(false);
  }
  function cadenceOf(cfg) {
    const m = (cfg.notes || "").match(/^(SPM|ASPM|Member|UATFS)/);
    return m ? m[1] : "Member";
  }
  function paidCountOf(cfg) {
    const m = (cfg.notes || "").match(/already paid:\s*(\d+)/);
    return m ? Number(m[1]) : 0;
  }
  async function generateHonorarium() {
    setGenHonBusy(true);
    setGenHonMsg("");
    if (honConfigs.length === 0) {
      setGenHonMsg("No honorarium configs set up yet.");
      setGenHonBusy(false);
      return;
    }
    let created = 0,
      marked = 0;
    for (const c of honConfigs) {
      const cad = HONORARIUM_CADENCE[cadenceOf(c)] || HONORARIUM_CADENCE["Member"];
      const schedule = buildHonorariumSchedule(cad.months);
      const alreadyPaid = paidCountOf(c);
      for (let i = 0; i < schedule.length; i++) {
        const label = honPeriodLabel(schedule[i]);
        const {
          data: existing
        } = await db.from("payments").select("id").eq("member_id", c.member_id).eq("period_label", label).eq("payment_type", "Honorarium");
        if (existing && existing.length > 0) continue;
        const isPaid = i < alreadyPaid;
        await db.from("payments").insert({
          payment_type: "Honorarium",
          member_id: c.member_id,
          member_name: c.member_name,
          period_label: label,
          amount: c.amount,
          description: "Honorarium — " + cadenceOf(c) + " (installment " + (i + 1) + " of " + schedule.length + ")",
          status: isPaid ? "Paid" : "Unpaid",
          paid_date: isPaid ? schedule[i].toISOString().slice(0, 10) : null,
          paid_by: isPaid ? "Recorded from history" : ""
        });
        created++;
        if (isPaid) marked++;
      }
    }
    setGenHonMsg(created + " honorarium record" + (created !== 1 ? "s" : "") + " created (" + marked + " marked as already paid).");
    await reloadPayments();
    setGenHonBusy(false);
  }

  // ── Excel export ──────────────────────────────────────────────
  function exportExcel() {
    if (typeof XLSX === "undefined") {
      alert("Excel library not loaded. Refresh the page.");
      return;
    }
    const wb = XLSX.utils.book_new();
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    // Sheet 1 — Summary
    const byType = {};
    payments.forEach(p => {
      const k = p.payment_type;
      if (!byType[k]) byType[k] = {
        type: k,
        count: 0,
        paid: 0,
        unpaid: 0,
        total: 0
      };
      byType[k].count++;
      byType[k].total += Number(p.amount);
      if (p.status === "Paid") byType[k].paid += Number(p.amount);else byType[k].unpaid += Number(p.amount);
    });
    const summary = [["HEAT Sub-Project — Finance Summary"], ["Project PIN 13860 · Generated " + today], [], ["Payment Type", "Records", "Paid (BDT)", "Unpaid (BDT)", "Total (BDT)"], ...Object.values(byType).map(r => [r.type, r.count, r.paid, r.unpaid, r.total]), [], ["GRAND TOTAL", payments.length, totalPaid, totalUnpaid, totalPaid + totalUnpaid]];
    const ws1 = XLSX.utils.aoa_to_sheet(summary);
    ws1["!cols"] = [{
      wch: 22
    }, {
      wch: 10
    }, {
      wch: 16
    }, {
      wch: 16
    }, {
      wch: 16
    }];
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    // Sheet 2 — All payments
    const ws2 = XLSX.utils.json_to_sheet(payments.map(p => ({
      "Date Created": new Date(p.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      "Member": p.member_name,
      "Type": p.payment_type,
      "Period": p.period_label,
      "Amount (BDT)": Number(p.amount),
      "Description": p.description || "",
      "Status": p.status,
      "Paid On": p.paid_date ? new Date(p.paid_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) : "",
      "Paid By": p.paid_by || ""
    })));
    ws2["!cols"] = [{
      wch: 14
    }, {
      wch: 26
    }, {
      wch: 14
    }, {
      wch: 14
    }, {
      wch: 14
    }, {
      wch: 32
    }, {
      wch: 10
    }, {
      wch: 14
    }, {
      wch: 20
    }];
    XLSX.utils.book_append_sheet(wb, ws2, "All Payments");

    // Sheet 3 — Salary config
    const ws3 = XLSX.utils.json_to_sheet(configs.map(c => ({
      "Member": c.member_name,
      "Group": c.group_name,
      "Frequency": c.frequency,
      "Amount (BDT)": Number(c.amount),
      "Notes": c.notes || "",
      "Active": c.active ? "Yes" : "No"
    })));
    ws3["!cols"] = [{
      wch: 26
    }, {
      wch: 18
    }, {
      wch: 14
    }, {
      wch: 14
    }, {
      wch: 32
    }, {
      wch: 8
    }];
    XLSX.utils.book_append_sheet(wb, ws3, "Salary Config");

    // Sheet 4 — Per member breakdown
    const byMember = {};
    payments.forEach(p => {
      const k = p.member_name;
      if (!byMember[k]) byMember[k] = {
        name: k,
        records: 0,
        paid: 0,
        unpaid: 0
      };
      byMember[k].records++;
      if (p.status === "Paid") byMember[k].paid += Number(p.amount);else byMember[k].unpaid += Number(p.amount);
    });
    const ws4 = XLSX.utils.json_to_sheet(Object.values(byMember).map(m => ({
      "Member": m.name,
      "Records": m.records,
      "Paid (BDT)": m.paid,
      "Unpaid (BDT)": m.unpaid,
      "Total (BDT)": m.paid + m.unpaid
    })));
    ws4["!cols"] = [{
      wch: 26
    }, {
      wch: 10
    }, {
      wch: 16
    }, {
      wch: 16
    }, {
      wch: 16
    }];
    XLSX.utils.book_append_sheet(wb, ws4, "By Member");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `HEAT_Finance_${stamp}.xlsx`);
  }

  // ── Derived ───────────────────────────────────────────────────
  const filteredPayments = payments.filter(p => {
    if (fType !== "All" && p.payment_type !== fType) return false;
    if (fStatus !== "All" && p.status !== fStatus) return false;
    if (fMember !== "All" && p.member_name !== fMember) return false;
    return true;
  });
  const totalUnpaid = payments.filter(p => p.status === "Unpaid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPaid = payments.filter(p => p.status === "Paid").reduce((s, p) => s + Number(p.amount), 0);
  const paymentMembers = [...new Set(payments.map(p => p.member_name))].sort();
  const memberOptions = members.filter(m => m.group !== "Student");
  const selStyle = {
    background: "#121821",
    border: "1px solid #1F2733",
    borderRadius: 6,
    padding: "7px 10px",
    color: "#E8EDF2",
    fontSize: 12.5
  };
  if (loading) return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 0",
      color: "#8593A3"
    }
  }, "Loading finance data…");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
      gap: 10,
      marginBottom: 20
    }
  }, [["Total Unpaid", finFmtBDT(totalUnpaid), "#E85D5D"], ["Total Paid", finFmtBDT(totalPaid), "#3ECF9A"], ["Salary Configs", configs.length + " members", "#4F8CFF"], ["Payment Records", payments.length + " entries", "#E8EDF2"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 8,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "#8593A3",
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: c
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0,
      marginBottom: 18,
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 6,
      overflow: "hidden",
      width: "fit-content"
    }
  }, ["payroll", "honorarium", "payments"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    className: "btn",
    onClick: () => setTab(t),
    style: {
      padding: "8px 18px",
      background: tab === t ? "#1A222D" : "transparent",
      border: "none",
      color: tab === t ? "#E8EDF2" : "#8593A3",
      fontSize: 13,
      fontWeight: tab === t ? 600 : 400
    }
  }, t[0].toUpperCase() + t.slice(1)))), tab === "payroll" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Salary Configuration"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginTop: 2
    }
  }, "Set salary amounts and payment frequency per member")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setGenModal(true);
      setGenMsg("");
    },
    style: {
      background: "#1A222D",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "9px 14px",
      fontSize: 12.5
    }
  }, "Generate Period"), canManage && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setCfgForm({
        memberId: "",
        memberName: "",
        groupName: "",
        frequency: "Monthly",
        amount: "",
        notes: ""
      });
      setCfgEdit(null);
      setCfgErr("");
      setCfgModal(true);
    },
    style: {
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "9px 14px",
      fontSize: 13,
      fontWeight: 600
    }
  }, "+ Add Salary"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      fontSize: 13,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#161D26",
      textAlign: "left"
    }
  }, ["Member", "Group", "Frequency", "Amount (BDT)", "Notes", ""].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "10px 12px",
      fontSize: 11,
      letterSpacing: .5,
      color: "#8593A3",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, salConfigs.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id,
    className: "rowhover",
    style: {
      borderTop: "1px solid #1F2733"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      fontWeight: 500
    }
  }, c.member_name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      color: "#8593A3"
    }
  }, c.group_name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "#1A2233",
      color: "#4F8CFF",
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11.5,
      fontWeight: 600
    }
  }, c.frequency)), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: "#3ECF9A",
      fontWeight: 600
    }
  }, finFmtBDT(c.amount)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      color: "#5B6675",
      maxWidth: 200
    }
  }, c.notes || "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setCfgEdit(c);
      setCfgForm({
        memberId: c.member_id,
        memberName: c.member_name,
        groupName: c.group_name,
        frequency: c.frequency,
        amount: c.amount,
        notes: c.notes || ""
      });
      setCfgErr("");
      setCfgModal(true);
    },
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      padding: 4,
      marginRight: 4,
      fontSize: 12
    }
  }, "Edit"), canManage && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setDelCfgId(c.id),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      padding: 4,
      fontSize: 12
    }
  }, "Delete")))))), salConfigs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "50px 0",
      color: "#5B6675",
      fontSize: 13.5
    }
  }, "No salary configs yet. Click \"+ Add Salary\" to start."))), tab === "honorarium" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Honorarium"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginTop: 2
    }
  }, "ATFOM Annex 11 · Project period 27 Aug 2025 – 27 Aug 2028")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setGenHonMsg("");
      generateHonorarium();
    },
    disabled: genHonBusy,
    style: {
      background: "#1A222D",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "9px 14px",
      fontSize: 12.5
    }
  }, genHonBusy ? "Generating…" : "Generate Schedule"), canManage && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setHonForm({
        memberId: "",
        memberName: "",
        groupName: "",
        cadence: "Member",
        amount: "",
        paidCount: "0",
        notes: ""
      });
      setHonEdit(null);
      setHonErr("");
      setHonModal(true);
    },
    style: {
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "9px 14px",
      fontSize: 13,
      fontWeight: 600
    }
  }, "+ Add Honorarium"))), genHonMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0D2A1A",
      border: "1px solid #3ECF9A44",
      color: "#3ECF9A",
      borderRadius: 6,
      padding: "10px 14px",
      marginBottom: 14,
      fontSize: 12.5
    }
  }, genHonMsg), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 8,
      padding: "12px 16px",
      marginBottom: 16,
      fontSize: 12,
      color: "#5B6675",
      lineHeight: 1.8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3",
      fontWeight: 600
    }
  }, "Entitlement per ATFOM Annex 11 —"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "SPM"), " 4 months' basic salary/year → 1 month every 3 months \xA0·\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "ASPM"), " 2 months'/year → 1 month half-yearly", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "SPMT Member"), " 1 month's/year → 1 month yearly \xA0·\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "UATFS"), " yearly block allocation", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5B6675",
      fontStyle: "italic"
    }
  }, "Paid upon submission of annual progress report. Total ceiling BDT 2.5M or 10% of sub-project cost, whichever is lower.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      fontSize: 13,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#161D26",
      textAlign: "left"
    }
  }, ["Member", "Group", "Cadence", "Per Installment", "Total Installments", "Paid", "Remaining", ""].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "10px 12px",
      fontSize: 11,
      letterSpacing: .5,
      color: "#8593A3",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, honConfigs.map(c => {
    const cadKey = cadenceOf(c);
    const cad = HONORARIUM_CADENCE[cadKey] || HONORARIUM_CADENCE["Member"];
    const total = buildHonorariumSchedule(cad.months).length;
    const paid = payments.filter(p => p.payment_type === "Honorarium" && p.member_id === c.member_id && p.status === "Paid").length || paidCountOf(c);
    return /*#__PURE__*/React.createElement("tr", {
      key: c.id,
      className: "rowhover",
      style: {
        borderTop: "1px solid #1F2733"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        fontWeight: 500
      }
    }, c.member_name), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        color: "#8593A3"
      }
    }, c.group_name), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: "#2A1A33",
        color: "#B07FE8",
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11.5,
        fontWeight: 600
      }
    }, cadKey), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#5B6675",
        fontSize: 11,
        marginLeft: 6
      }
    }, "every ", cad.months, " mo")), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#3ECF9A",
        fontWeight: 600
      }
    }, finFmtBDT(c.amount)), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#E8EDF2"
      }
    }, total), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#3ECF9A"
      }
    }, paid), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#E8A33D"
      }
    }, total - paid), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap"
      }
    }, canManage && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => {
        setHonEdit(c);
        setHonForm({
          memberId: c.member_id,
          memberName: c.member_name,
          groupName: c.group_name,
          cadence: cadKey,
          amount: c.amount,
          paidCount: String(paidCountOf(c)),
          notes: ""
        });
        setHonErr("");
        setHonModal(true);
      },
      style: {
        background: "none",
        border: "none",
        color: "#8593A3",
        padding: 4,
        marginRight: 4,
        fontSize: 12
      }
    }, "Edit"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setDelCfgId(c.id),
      style: {
        background: "none",
        border: "none",
        color: "#8593A3",
        padding: 4,
        fontSize: 12
      }
    }, "Delete"))));
  }))), honConfigs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "50px 0",
      color: "#5B6675",
      fontSize: 13.5
    }
  }, "No honorarium configs yet. Click \"+ Add Honorarium\" to set up SPM, ASPM, Members and UATFS."))), tab === "payments" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Payments & Bills"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginTop: 2
    }
  }, "Salary, TA-DA, Committee, Deputation, Other · Aug 2025 – Aug 2028")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: exportExcel,
    style: {
      background: "#0D2A1A",
      border: "1px solid #3ECF9A44",
      color: "#3ECF9A",
      borderRadius: 6,
      padding: "9px 14px",
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "Export Excel"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setPayForm({
        memberId: "",
        memberName: "",
        paymentType: "Salary",
        periodLabel: "",
        amount: "",
        description: ""
      });
      setPayErr("");
      setPayModal(true);
    },
    style: {
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "9px 14px",
      fontSize: 13,
      fontWeight: 600
    }
  }, "+ Add Payment"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: fType,
    onChange: e => setFType(e.target.value),
    style: selStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All Types"), FIN_PAYMENT_TYPES.map(t => /*#__PURE__*/React.createElement("option", {
    key: t
  }, t))), /*#__PURE__*/React.createElement("select", {
    value: fStatus,
    onChange: e => setFStatus(e.target.value),
    style: selStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All Status"), ["Unpaid", "Paid"].map(s => /*#__PURE__*/React.createElement("option", {
    key: s
  }, s))), /*#__PURE__*/React.createElement("select", {
    value: fMember,
    onChange: e => setFMember(e.target.value),
    style: selStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: "All"
  }, "All Members"), paymentMembers.map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      fontSize: 13,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#161D26",
      textAlign: "left"
    }
  }, ["Date", "Member", "Type", "Period", "Amount (BDT)", "Description", "Status", "Paid On", ""].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "10px 12px",
      fontSize: 11,
      letterSpacing: .5,
      color: "#8593A3",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filteredPayments.map(p => {
    const paid = p.status === "Paid";
    return /*#__PURE__*/React.createElement("tr", {
      key: p.id,
      className: "rowhover",
      style: {
        borderTop: "1px solid #1F2733",
        opacity: paid ? .85 : 1
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#5B6675",
        whiteSpace: "nowrap",
        fontSize: 11
      }
    }, new Date(p.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap",
        fontWeight: 500
      }
    }, p.member_name), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: p.payment_type === "Salary" ? "#1A2233" : p.payment_type === "Honorarium" ? "#2A1A33" : p.payment_type === "Procurement" ? "#1A2A2A" : "#1A1500",
        color: p.payment_type === "Salary" ? "#4F8CFF" : p.payment_type === "Honorarium" ? "#B07FE8" : p.payment_type === "Procurement" ? "#5FD4C4" : "#E8A33D",
        borderRadius: 4,
        padding: "2px 7px",
        fontSize: 11.5,
        fontWeight: 600
      }
    }, p.payment_type)), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#8593A3"
      }
    }, p.period_label), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#3ECF9A",
        fontWeight: 600
      }
    }, finFmtBDT(p.amount)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        color: "#5B6675",
        maxWidth: 180,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, p.description || "—"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: paid ? "#0D2A1A" : "#2A0A0A",
        color: paid ? "#3ECF9A" : "#E85D5D",
        borderRadius: 4,
        padding: "3px 8px",
        fontSize: 11.5,
        fontWeight: 600
      }
    }, paid ? "Paid" : "Unpaid")), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#8593A3",
        fontSize: 11,
        whiteSpace: "nowrap"
      }
    }, finFmtDate(p.paid_date)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap"
      }
    }, !paid ? /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => markPaid(p.id),
      style: {
        background: "#3ECF9A22",
        border: "1px solid #3ECF9A44",
        color: "#3ECF9A",
        borderRadius: 5,
        padding: "3px 10px",
        fontSize: 11.5,
        fontWeight: 600
      }
    }, "Mark Paid") : /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => markUnpaid(p.id),
      style: {
        background: "none",
        border: "none",
        color: "#5B6675",
        fontSize: 11,
        padding: "3px 6px"
      }
    }, "Undo"), canManage && /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setDelPayId(p.id),
      style: {
        background: "none",
        border: "none",
        color: "#5B6675",
        padding: "3px 6px",
        fontSize: 11,
        marginLeft: 4
      }
    }, "×")));
  }))), filteredPayments.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "50px 0",
      color: "#5B6675",
      fontSize: 13.5
    }
  }, payments.length === 0 ? "No payment records yet. Use Generate Period or + Add Payment." : "No payments match these filters."))), cfgModal && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16
    },
    onClick: () => setCfgModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 460,
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, cfgEdit ? "Edit Salary Config" : "Add Salary Config"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setCfgModal(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(FinField, {
    label: "Member"
  }, /*#__PURE__*/React.createElement("select", {
    value: cfgForm.memberId,
    onChange: e => {
      const m = memberOptions.find(x => x.id === Number(e.target.value));
      setCfgForm(f => ({
        ...f,
        memberId: e.target.value,
        memberName: m?.name || "",
        groupName: m?.group || ""
      }));
    },
    style: finIStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Select member —"), memberOptions.map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.name, " (", m.group, ")")))), /*#__PURE__*/React.createElement(FinField, {
    label: "Payment Frequency"
  }, /*#__PURE__*/React.createElement("select", {
    value: cfgForm.frequency,
    onChange: e => setCfgForm(f => ({
      ...f,
      frequency: e.target.value
    })),
    style: finIStyle
  }, FIN_FREQUENCIES.map(f => /*#__PURE__*/React.createElement("option", {
    key: f
  }, f)))), /*#__PURE__*/React.createElement(FinField, {
    label: "Amount (BDT)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: cfgForm.amount,
    onChange: e => setCfgForm(f => ({
      ...f,
      amount: e.target.value
    })),
    placeholder: "e.g. 15000",
    style: finIStyle
  })), /*#__PURE__*/React.createElement(FinField, {
    label: "Notes (optional)"
  }, /*#__PURE__*/React.createElement("input", {
    value: cfgForm.notes,
    onChange: e => setCfgForm(f => ({
      ...f,
      notes: e.target.value
    })),
    placeholder: "e.g. Basic pay per university grade",
    style: finIStyle
  })), cfgErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, cfgErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setCfgModal(false),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: saveCfg,
    disabled: cfgBusy,
    style: {
      flex: 1,
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, cfgBusy ? "Saving…" : "Save")))), payModal && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16
    },
    onClick: () => setPayModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 460,
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Add Payment / Bill"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setPayModal(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(FinField, {
    label: "Payment Type"
  }, /*#__PURE__*/React.createElement("select", {
    value: payForm.paymentType,
    onChange: e => setPayForm(f => ({
      ...f,
      paymentType: e.target.value
    })),
    style: finIStyle
  }, FIN_PAYMENT_TYPES.map(t => /*#__PURE__*/React.createElement("option", {
    key: t
  }, t)))), /*#__PURE__*/React.createElement(FinField, {
    label: "Member"
  }, /*#__PURE__*/React.createElement("select", {
    value: payForm.memberId,
    onChange: e => {
      const m = memberOptions.find(x => x.id === Number(e.target.value));
      setPayForm(f => ({
        ...f,
        memberId: e.target.value,
        memberName: m?.name || ""
      }));
    },
    style: finIStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Select member —"), memberOptions.map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.name, " (", m.group, ")")))), /*#__PURE__*/React.createElement(FinField, {
    label: "Period"
  }, /*#__PURE__*/React.createElement("input", {
    value: payForm.periodLabel,
    onChange: e => setPayForm(f => ({
      ...f,
      periodLabel: e.target.value
    })),
    placeholder: "e.g. Sep 2025, Q3 2025, T2 2025",
    style: finIStyle
  })), /*#__PURE__*/React.createElement(FinField, {
    label: "Amount (BDT)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: payForm.amount,
    onChange: e => setPayForm(f => ({
      ...f,
      amount: e.target.value
    })),
    placeholder: "e.g. 15000",
    style: finIStyle
  })), /*#__PURE__*/React.createElement(FinField, {
    label: "Description (optional)"
  }, /*#__PURE__*/React.createElement("input", {
    value: payForm.description,
    onChange: e => setPayForm(f => ({
      ...f,
      description: e.target.value
    })),
    placeholder: "e.g. TA-DA for field visit Sep 2025",
    style: finIStyle
  })), payErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, payErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setPayModal(false),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: savePay,
    disabled: payBusy,
    style: {
      flex: 1,
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, payBusy ? "Adding…" : "Add Payment")))), honModal && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16
    },
    onClick: () => setHonModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 460,
      padding: 22,
      maxHeight: "88vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, honEdit ? "Edit Honorarium" : "Add Honorarium"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setHonModal(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(FinField, {
    label: "Member"
  }, /*#__PURE__*/React.createElement("select", {
    value: honForm.memberId,
    onChange: e => {
      const m = memberOptions.find(x => x.id === Number(e.target.value));
      let auto = "Member";
      if (m) {
        const r = (m.role || "").toUpperCase();
        if (r.includes("ASPM")) auto = "ASPM";else if (r.includes("SPM")) auto = "SPM";else if (m.group === "UATFS") auto = "UATFS";
      }
      setHonForm(f => ({
        ...f,
        memberId: e.target.value,
        memberName: m?.name || "",
        groupName: m?.group || "",
        cadence: auto
      }));
    },
    style: finIStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Select member —"), memberOptions.map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.id
  }, m.name, " (", m.role || m.group, ")")))), /*#__PURE__*/React.createElement(FinField, {
    label: "Cadence"
  }, /*#__PURE__*/React.createElement("select", {
    value: honForm.cadence,
    onChange: e => setHonForm(f => ({
      ...f,
      cadence: e.target.value
    })),
    style: finIStyle
  }, Object.keys(HONORARIUM_CADENCE).map(k => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, k, " — ", HONORARIUM_CADENCE[k].label)))), /*#__PURE__*/React.createElement(FinField, {
    label: "Amount per installment (BDT) — one month's basic salary"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: honForm.amount,
    onChange: e => setHonForm(f => ({
      ...f,
      amount: e.target.value
    })),
    placeholder: "e.g. 45000",
    style: finIStyle
  })), /*#__PURE__*/React.createElement(FinField, {
    label: "Installments already paid (before this system)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: honForm.paidCount,
    onChange: e => setHonForm(f => ({
      ...f,
      paidCount: e.target.value
    })),
    placeholder: "0",
    style: finIStyle
  })), /*#__PURE__*/React.createElement(FinField, {
    label: "Notes (optional)"
  }, /*#__PURE__*/React.createElement("input", {
    value: honForm.notes,
    onChange: e => setHonForm(f => ({
      ...f,
      notes: e.target.value
    })),
    placeholder: "e.g. former SPM, annual report submitted",
    style: finIStyle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "10px 12px",
      marginBottom: 12,
      fontSize: 11.5,
      color: "#5B6675",
      lineHeight: 1.6
    }
  }, "Schedule runs from 27 Aug 2025 to 27 Aug 2028. Installments marked \"already paid\" will be created with Paid status when you click Generate Schedule."), honErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, honErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setHonModal(false),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: saveHon,
    disabled: honBusy,
    style: {
      flex: 1,
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, honBusy ? "Saving…" : "Save")))), genModal && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16
    },
    onClick: () => setGenModal(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 420,
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "Generate Salary Payments"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setGenModal(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#8593A3",
      marginBottom: 16,
      lineHeight: 1.6
    }
  }, "Creates Unpaid salary records for all members whose frequency matches the selected period. Skips if already generated."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(FinField, {
    label: "Month",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: genMonth,
    onChange: e => setGenMonth(Number(e.target.value)),
    style: finIStyle
  }, FIN_MONTHS.map((m, i) => /*#__PURE__*/React.createElement("option", {
    key: m,
    value: i
  }, m)))), /*#__PURE__*/React.createElement(FinField, {
    label: "Year",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: genYear,
    onChange: e => setGenYear(Number(e.target.value)),
    style: finIStyle
  }, [2025, 2026, 2027, 2028].map(y => /*#__PURE__*/React.createElement("option", {
    key: y
  }, y))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "10px 12px",
      marginBottom: 14,
      fontSize: 12,
      color: "#5B6675",
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "Monthly"), " → every month \xA0·\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "Quarterly"), " → Jan, Apr, Jul, Oct", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "Triannual"), " → Jan, May, Sep \xA0·\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "Half-yearly"), " → Jan, Jul \xA0·\xA0", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "Yearly"), " → Jan only"), genMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#3ECF9A",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, genMsg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setGenModal(false),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5
    }
  }, "Close"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: generatePeriod,
    disabled: genBusy,
    style: {
      flex: 1,
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, genBusy ? "Generating…" : "Generate")))), delCfgId && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16
    },
    onClick: () => setDelCfgId(null)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 360,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      marginBottom: 16
    }
  }, "Delete this salary config? Payment records are not affected."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setDelCfgId(null),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "9px 0",
      fontSize: 13
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => deleteCfg(delCfgId),
    style: {
      flex: 1,
      background: "#E85D5D",
      border: "none",
      color: "#2A0808",
      borderRadius: 6,
      padding: "9px 0",
      fontSize: 13,
      fontWeight: 600
    }
  }, "Delete")))), delPayId && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 80,
      padding: 16
    },
    onClick: () => setDelPayId(null)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 360,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      marginBottom: 16
    }
  }, "Delete this payment record?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setDelPayId(null),
    style: {
      flex: 1,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "9px 0",
      fontSize: 13
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => deletePay(delPayId),
    style: {
      flex: 1,
      background: "#E85D5D",
      border: "none",
      color: "#2A0808",
      borderRadius: 6,
      padding: "9px 0",
      fontSize: 13,
      fontWeight: 600
    }
  }, "Delete")))));
};
window.FinanceView = FinanceView;