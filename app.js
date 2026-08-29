const {
  useState,
  useEffect,
  useMemo
} = React;

// ── Constants ─────────────────────────────────────────────────────────────
const STATUSES = ["To Do", "In Progress", "Done"];
const PRIORITIES = ["High", "Medium", "Low"];
const GROUPS = ["SPMT", "Faculty Advisors", "RA", "Other Officer", "Staff", "Student"];
const STATUS_COLOR = {
  "To Do": "#8593A3",
  "In Progress": "#4F8CFF",
  "Done": "#3ECF9A"
};
const PRIORITY_COLOR = {
  High: "#E8A33D",
  Medium: "#4F8CFF",
  Low: "#5B6675"
};

// ── Seed members ──────────────────────────────────────────────────────────
const SEED_MEMBERS = [{
  teamId: "25-13860-0101",
  name: "Dr. Saifur Rahman Bakaul",
  role: "SPM",
  group: "SPMT"
}, {
  teamId: "25-13860-0102",
  name: "Dr. Saiaf Bin Rayhan",
  role: "ASPM",
  group: "SPMT"
}, {
  teamId: "25-13860-0103",
  name: "Shahrukh Khan",
  role: "Member",
  group: "SPMT"
}, {
  teamId: "25-13860-0104",
  name: "Dr. Tawfique",
  role: "Member",
  group: "SPMT"
}, {
  teamId: "26-13860-0201",
  name: "Md. Toufiq Islam Noor",
  role: "Faculty Advisor",
  group: "Faculty Advisors"
}, {
  teamId: "26-13860-0202",
  name: "Mushfiq Al Arafah",
  role: "Faculty Advisor",
  group: "Faculty Advisors"
}, {
  teamId: "26-13860-0301",
  name: "Md. Samiullah Prodhan",
  role: "RA",
  group: "RA"
}, {
  teamId: "26-13860-0302",
  name: "Mohtasim al Jamee",
  role: "RA",
  group: "RA"
}, {
  teamId: "26-13860-0303",
  name: "Kawser Miah",
  role: "RA",
  group: "RA"
}, {
  teamId: "26-13860-0304",
  name: "Abdul Aziz Efty",
  role: "RA",
  group: "RA"
}, {
  teamId: "26-13860-0401",
  name: "Finance Officer",
  role: "Other Officer",
  group: "Other Officer"
}, {
  teamId: "26-13860-0402",
  name: "Procurement Officer",
  role: "Other Officer",
  group: "Other Officer"
}, {
  teamId: "26-13860-0403",
  name: "Project Officer",
  role: "Other Officer",
  group: "Other Officer"
}, {
  teamId: "26-13860-0501",
  name: "Cleaner/MLSS/Peon",
  role: "Staff",
  group: "Staff"
}, {
  teamId: "26-13860-0601",
  name: "Mahruf Ahmed",
  role: "Student",
  group: "Student"
}, {
  teamId: "26-13860-0602",
  name: "Ishtiak Risat",
  role: "Student",
  group: "Student"
}, {
  teamId: "26-13860-0603",
  name: "Tasdid Ahmed",
  role: "Student",
  group: "Student"
}, {
  teamId: "26-13860-0604",
  name: "Borhan Uddin",
  role: "Student",
  group: "Student"
}].map((m, i) => ({
  id: "M" + String(i + 1).padStart(3, "0"),
  email: "",
  mobile: "",
  joinedDate: "",
  ...m
}));

// ── Seed tasks ────────────────────────────────────────────────────────────
const SEED_TASKS = [["Dr. Saiaf Bin Rayhan", "007", "Prepare notes for inclusion of Toufiq Noor Islam and Mushfique Al Arafa as Faculty Advisors", "To Do", ""], ["Dr. Saiaf Bin Rayhan", "007", "Modify the Project Officer recruitment notice", "To Do", ""], ["Dr. Saiaf Bin Rayhan", "007", "Arrange Project Officer interview once the SPM issue is resolved", "To Do", ""], ["Dr. Saiaf Bin Rayhan", "007", "Follow up on the SPM issue together with Registrar's Office", "In Progress", "Meeting with PD on 27 Aug 2026"], ["Dr. Saiaf Bin Rayhan", "007", "Take control of the SPM email for recruitment purposes", "In Progress", "Not required, received all CVs"], ["Dr. Saiaf Bin Rayhan", "007", "Send notes regarding SEM relocation from Dhaka to Lalmonirhat", "To Do", ""], ["Dr. Saiaf Bin Rayhan", "007", "Prepare notes for A/O Somrat, R/A, and recruitments", "In Progress", "R/A recruitment is done"], ["Shahrukh Khan", "007", "Work on documentation system, including NAS and remote access system", "To Do", ""], ["Mushfiq Al Arafah", "007", "Work on documentation system, including NAS and remote access system", "To Do", ""], ["SPM – Dr. Saifur Rahman Bakaul", "008", "Participate in/oversee RA recruitment and selection", "Done", ""], ["ASPM – Dr. Saiaf Bin Rayhan", "008", "Participate in/oversee RA recruitment and selection", "Done", ""], ["Toufiq Noor Islam", "006", "Audit Report on Design", "Done", "Yet to brief"], ["Mushfiq Al Arafah", "006", "Audit Report on Design", "Done", "Yet to brief"], ["Shahrukh Khan", "009", "Brief RAs regarding the 3-monthly performance evaluation report", "Done", ""], ["Toufiq Noor Islam", "009", "Brief RAs on design team workflow", "Done", ""], ["Mushfiq Al Arafah", "009", "Brief RAs on design team workflow", "Done", ""], ["Faculty Advisors", "006", "Brief the design doubts to RAs", "To Do", ""], ["ASPM – Dr. Saiaf Bin Rayhan", "009", "Assign RAs the task of preparing the inventory list", "Done", ""], ["Md. Samiullah Prodhan", "009", "Modification of the existing design based on audit report", "To Do", ""], ["Md. Samiullah Prodhan", "009", "Provide 2D view of all components within 2 weeks", "To Do", ""], ["Mohtasim al Jamee", "009", "Observe the design and plan, provide the Avionics Architecture", "To Do", ""], ["Mohtasim al Jamee", "009", "Provide the list of Avionics equipment required for the proposed design within 2 weeks", "To Do", ""], ["Kawser Miah", "009", "Assist the team to list inventory and procurement for Manufacturing equipment", "To Do", ""], ["Abdul Aziz Efty", "009", "Provide the plan for small drone production for control integration", "To Do", ""], ["Abdul Aziz Efty", "009", "Assist the team with listing inventory and procurement", "To Do", ""], ["All members", "009", "Set a plan for designing the assembly platform and place requirements", "To Do", ""], ["All members", "009", "Update procurement plan with estimated budget within 2 weeks for APP", "To Do", ""]].map((r, i) => ({
  id: "T" + String(i + 1).padStart(3, "0"),
  taskCode: "T" + String(i + 1).padStart(3, "0"),
  member: r[0],
  meetingId: r[1],
  task: r[2],
  assignedDate: "",
  deadline: "",
  status: r[3],
  priority: "Medium",
  remarks: r[4]
}));

// ── localStorage helpers ──────────────────────────────────────────────────
const LS_TASKS = "mission_log_tasks_v2";
const LS_MEMBERS = "mission_log_members_v2";
const LS_SESSION = "mission_log_session_v2";
function loadLS(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}
function saveLS(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// ── Utility functions ─────────────────────────────────────────────────────
function isOverdue(t) {
  if (!t.deadline || t.status === "Done") return false;
  const d = new Date(t.deadline);
  return !isNaN(d) && d < new Date();
}
function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ── Shared UI primitives ──────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  background: "#0A0E14",
  border: "1px solid #1F2733",
  borderRadius: 6,
  padding: "8px 10px",
  color: "#E8EDF2",
  fontSize: 13
};
function Field({
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
function FilterSelect({
  value,
  onChange,
  options,
  labelPrefix = ""
}) {
  return /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "8px 10px",
      color: "#E8EDF2",
      fontSize: 12.5
    }
  }, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o === "All" ? "All" : labelPrefix + o)));
}

// ── Login screen ──────────────────────────────────────────────────────────
function LoginScreen({
  members,
  onLogin
}) {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function attempt() {
    const id = teamId.trim();
    if (!id || !password) {
      setError("Please enter your Team ID and password.");
      return;
    }
    const m = members.find(mm => mm.teamId === id);
    if (!m) {
      setError("Team ID not found. Ask your SPM/ASPM to add you first.");
      return;
    }
    const expected = m.group === "SPMT" ? "13860spmt." : id;
    if (password !== expected) {
      setError("Incorrect password.");
      return;
    }
    onLogin(m);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 400,
      padding: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: 2,
      color: "#4F8CFF",
      marginBottom: 6
    }
  }, "TEAM OPS · TASK TRACKER"), /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Mission Log"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#8593A3",
      marginBottom: 20
    }
  }, "Sign in with your Team ID to continue."), /*#__PURE__*/React.createElement(Field, {
    label: "Team ID"
  }, /*#__PURE__*/React.createElement("input", {
    value: teamId,
    onChange: e => setTeamId(e.target.value),
    onKeyDown: e => e.key === "Enter" && attempt(),
    placeholder: "e.g. 25-13860-0101",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    onKeyDown: e => e.key === "Enter" && attempt(),
    placeholder: "Your password",
    style: inputStyle
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: attempt,
    style: {
      width: "100%",
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "Sign In"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "10px 12px",
      fontSize: 11.5,
      color: "#5B6675",
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "SPMT password:"), " ", /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "#E8EDF2"
    }
  }, "13860spmt."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "All others:"), " your Team ID is your password.")));
}

// ── Main app ──────────────────────────────────────────────────────────────
function App() {
  const [tasks, setTasksRaw] = useState(null);
  const [members, setMembersRaw] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Filters & views
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("All");
  const [meetingFilter, setMeetingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Task modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    member: "",
    meetingId: "",
    task: "",
    assignedDate: "",
    deadline: "",
    status: "To Do",
    priority: "Medium",
    remarks: ""
  });
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Member modal
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    mobile: "",
    teamId: "",
    role: "Member",
    group: "SPMT",
    joinedDate: ""
  });
  const [memberFormError, setMemberFormError] = useState("");
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState(null);

  // ── Load from localStorage on mount ──
  useEffect(() => {
    const loadedMembers = loadLS(LS_MEMBERS, SEED_MEMBERS);
    const loadedTasks = loadLS(LS_TASKS, SEED_TASKS);
    setMembersRaw(loadedMembers);
    setTasksRaw(loadedTasks);
    try {
      const savedId = sessionStorage.getItem(LS_SESSION);
      if (savedId) {
        const m = loadedMembers.find(mm => mm.teamId === savedId);
        if (m) setCurrentUser(m);
      }
    } catch {}
    setReady(true);
  }, []);

  // ── Persisting wrappers ──
  function setTasks(fn) {
    setTasksRaw(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      saveLS(LS_TASKS, next);
      return next;
    });
  }
  function setMembers(fn) {
    setMembersRaw(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      saveLS(LS_MEMBERS, next);
      return next;
    });
  }

  // ── Auth ──
  function handleLogin(member) {
    setCurrentUser(member);
    try {
      sessionStorage.setItem(LS_SESSION, member.teamId);
    } catch {}
  }
  function handleLogout() {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(LS_SESSION);
    } catch {}
  }

  // ── Permissions ──
  const canEditTasks = !!currentUser && (currentUser.group === "SPMT" || currentUser.group === "Faculty Advisors");
  const canManageMembers = !!currentUser && currentUser.group === "SPMT";

  // ── Task operations ──
  function nextTaskCode() {
    const nums = (tasks || []).map(t => parseInt(String(t.taskCode || t.id || "").replace(/^T/i, ""), 10)).filter(Number.isFinite);
    const n = nums.length ? Math.max(...nums) + 1 : 1;
    return "T" + String(n).padStart(3, "0");
  }
  function saveTask(formValue) {
    const cleaned = {
      ...formValue,
      member: formValue.member.trim(),
      task: formValue.task.trim(),
      remarks: (formValue.remarks || "").trim()
    };
    if (editingId !== null) {
      setTasks(prev => prev.map(t => t.id === editingId ? {
        ...t,
        ...cleaned
      } : t));
    } else {
      const code = nextTaskCode();
      setTasks(prev => [...prev, {
        id: code,
        taskCode: code,
        ...cleaned
      }]);
    }
    setModalOpen(false);
  }
  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    setConfirmDeleteId(null);
  }
  function updateTaskStatus(id, status) {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      status
    } : t));
  }
  function updateTaskPriority(id, priority) {
    if (!canEditTasks) return;
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      priority
    } : t));
  }

  // ── Member operations ──
  function saveMember(formValue) {
    const cleaned = {
      ...formValue,
      name: formValue.name.trim(),
      teamId: formValue.teamId.trim(),
      role: (formValue.role || "").trim(),
      email: (formValue.email || "").trim(),
      mobile: (formValue.mobile || "").trim()
    };
    if (editingMemberId !== null) {
      setMembers(prev => prev.map(m => m.id === editingMemberId ? {
        ...m,
        ...cleaned
      } : m));
    } else {
      const id = "M" + String(Date.now()).slice(-6);
      setMembers(prev => [...prev, {
        id,
        ...cleaned
      }]);
    }
    setMemberModalOpen(false);
  }
  function deleteMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id));
    setConfirmDeleteMemberId(null);
  }

  // ── Derived data ──
  const memberNames = useMemo(() => Array.from(new Set((tasks || []).map(t => t.member).filter(Boolean))).sort(), [tasks]);
  const meetings = useMemo(() => Array.from(new Set((tasks || []).map(t => t.meetingId).filter(Boolean))).sort(), [tasks]);
  const filtered = useMemo(() => (tasks || []).filter(t => {
    if (memberFilter !== "All" && t.member !== memberFilter) return false;
    if (meetingFilter !== "All" && t.meetingId !== meetingFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!(t.task + " " + t.member + " " + (t.remarks || "") + " " + t.meetingId).toLowerCase().includes(q)) return false;
    }
    return true;
  }), [tasks, memberFilter, meetingFilter, statusFilter, priorityFilter, search]);
  const stats = useMemo(() => ({
    total: (tasks || []).length,
    todo: (tasks || []).filter(t => t.status === "To Do").length,
    inProgress: (tasks || []).filter(t => t.status === "In Progress").length,
    done: (tasks || []).filter(t => t.status === "Done").length,
    overdue: (tasks || []).filter(isOverdue).length
  }), [tasks]);
  const memberOptions = useMemo(() => {
    const byGroup = {};
    (members || []).forEach(m => {
      (byGroup[m.group] = byGroup[m.group] || []).push(m);
    });
    const known = new Set((members || []).map(m => m.name));
    const legacy = Array.from(new Set((tasks || []).map(t => t.member))).filter(n => n && !known.has(n));
    return {
      byGroup,
      legacy
    };
  }, [members, tasks]);

  // ── Guards ──
  if (!ready || tasks === null || members === null) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8593A3"
      }
    }, "Loading Mission Log…");
  }
  if (!currentUser) return /*#__PURE__*/React.createElement(LoginScreen, {
    members: members,
    onLogin: handleLogin
  });

  // ── Main UI ──
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "28px 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 22,
      flexWrap: "wrap",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: 2,
      color: "#4F8CFF",
      marginBottom: 6
    }
  }, "TEAM OPS · TASK TRACKER"), /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: -0.5
    }
  }, "Mission Log")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      marginRight: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5
    }
  }, currentUser.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: canEditTasks ? "#3ECF9A" : "#8593A3"
    }
  }, canEditTasks ? "Editor · " + currentUser.group : "Viewer · " + currentUser.group)), canManageMembers && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setMemberForm({
        name: "",
        email: "",
        mobile: "",
        teamId: "",
        role: "Member",
        group: "SPMT",
        joinedDate: ""
      });
      setEditingMemberId(null);
      setMemberFormError("");
      setMemberModalOpen(true);
    },
    style: {
      background: "transparent",
      color: "#4F8CFF",
      border: "1px solid #2A3A55",
      borderRadius: 6,
      padding: "10px 16px",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "+ Add Member"), canEditTasks && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setForm({
        member: "",
        meetingId: "",
        task: "",
        assignedDate: "",
        deadline: "",
        status: "To Do",
        priority: "Medium",
        remarks: ""
      });
      setEditingId(null);
      setFormError("");
      setModalOpen(true);
    },
    style: {
      background: "#4F8CFF",
      color: "#08111F",
      border: "none",
      borderRadius: 6,
      padding: "10px 16px",
      fontSize: 13.5,
      fontWeight: 600
    }
  }, "+ New Task"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: handleLogout,
    style: {
      background: "transparent",
      color: "#8593A3",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "10px 14px",
      fontSize: 12.5
    }
  }, "Log Out"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: 10,
      marginBottom: 20
    }
  }, [["Total", stats.total, "#E8EDF2"], ["To Do", stats.todo, STATUS_COLOR["To Do"]], ["In Progress", stats.inProgress, STATUS_COLOR["In Progress"]], ["Done", stats.done, STATUS_COLOR["Done"]], ["Overdue", stats.overdue, "#E85D5D"]].map(([label, value, color]) => /*#__PURE__*/React.createElement("div", {
    key: label,
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
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 22,
      fontWeight: 700,
      color
    }
  }, value)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 18,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: e => setSearch(e.target.value),
    placeholder: "Search tasks, members, remarks…",
    style: {
      flex: "1 1 200px",
      minWidth: 180,
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "8px 10px",
      color: "#E8EDF2",
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement(FilterSelect, {
    value: memberFilter,
    onChange: setMemberFilter,
    options: ["All", ...memberNames]
  }), /*#__PURE__*/React.createElement(FilterSelect, {
    value: meetingFilter,
    onChange: setMeetingFilter,
    options: ["All", ...meetings],
    labelPrefix: "Meeting "
  }), /*#__PURE__*/React.createElement(FilterSelect, {
    value: statusFilter,
    onChange: setStatusFilter,
    options: ["All", ...STATUSES]
  }), /*#__PURE__*/React.createElement(FilterSelect, {
    value: priorityFilter,
    onChange: setPriorityFilter,
    options: ["All", ...PRIORITIES]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 6,
      overflow: "hidden"
    }
  }, ["table", "board", "members"].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: "btn",
    onClick: () => setView(v),
    style: {
      padding: "8px 12px",
      background: view === v ? "#1A222D" : "transparent",
      border: "none",
      color: view === v ? "#E8EDF2" : "#8593A3",
      fontSize: 12.5
    }
  }, v[0].toUpperCase() + v.slice(1))))), view === "table" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#161D26",
      textAlign: "left"
    }
  }, ["ID", "Member", "Meeting", "Task", "Assigned", "Deadline", "Status", "Priority", "Remarks", ""].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "10px 12px",
      fontSize: 11,
      letterSpacing: .5,
      color: "#8593A3",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(t => {
    const overdue = isOverdue(t);
    const canChangeStatus = canEditTasks || currentUser && t.member === currentUser.name;
    return /*#__PURE__*/React.createElement("tr", {
      key: t.id,
      className: "rowhover",
      style: {
        borderTop: "1px solid #1F2733"
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#5B6675",
        whiteSpace: "nowrap"
      }
    }, t.taskCode || t.id), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap"
      }
    }, t.member), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "10px 12px",
        color: "#8593A3"
      }
    }, t.meetingId), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        minWidth: 220,
        maxWidth: 340
      }
    }, t.task), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap",
        color: "#8593A3"
      }
    }, fmtDate(t.assignedDate)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap",
        color: overdue ? "#E85D5D" : "#8593A3"
      }
    }, fmtDate(t.deadline), overdue ? " ⚠" : ""), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "8px 12px"
      }
    }, canChangeStatus ? /*#__PURE__*/React.createElement("select", {
      value: t.status,
      onChange: e => updateTaskStatus(t.id, e.target.value),
      style: {
        background: "#0A0E14",
        border: "1px solid " + STATUS_COLOR[t.status] + "55",
        color: STATUS_COLOR[t.status],
        borderRadius: 5,
        padding: "4px 6px",
        fontSize: 12
      }
    }, STATUSES.map(s => /*#__PURE__*/React.createElement("option", {
      key: s
    }, s))) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: STATUS_COLOR[t.status],
        fontSize: 12.5
      }
    }, t.status)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "8px 12px"
      }
    }, canEditTasks ? /*#__PURE__*/React.createElement("select", {
      value: t.priority,
      onChange: e => updateTaskPriority(t.id, e.target.value),
      style: {
        background: "#0A0E14",
        border: "1px solid " + PRIORITY_COLOR[t.priority] + "55",
        color: PRIORITY_COLOR[t.priority],
        borderRadius: 5,
        padding: "4px 6px",
        fontSize: 12
      }
    }, PRIORITIES.map(p => /*#__PURE__*/React.createElement("option", {
      key: p
    }, p))) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: PRIORITY_COLOR[t.priority],
        fontSize: 12.5
      }
    }, t.priority)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        color: "#8593A3",
        minWidth: 140,
        maxWidth: 220
      }
    }, t.remarks || "—"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px",
        whiteSpace: "nowrap"
      }
    }, canEditTasks && /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => {
        setForm({
          member: t.member,
          meetingId: t.meetingId,
          task: t.task,
          assignedDate: t.assignedDate || "",
          deadline: t.deadline || "",
          status: t.status,
          priority: t.priority,
          remarks: t.remarks || ""
        });
        setEditingId(t.id);
        setFormError("");
        setModalOpen(true);
      },
      style: {
        background: "none",
        border: "none",
        color: "#8593A3",
        padding: 4,
        marginRight: 4,
        fontSize: 12
      }
    }, "Edit"), canEditTasks && /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setConfirmDeleteId(t.id),
      style: {
        background: "none",
        border: "none",
        color: "#8593A3",
        padding: 4,
        fontSize: 12
      }
    }, "Delete")));
  }))), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 0",
      color: "#5B6675",
      fontSize: 13.5
    }
  }, "No tasks match these filters.")), view === "board" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 14
    }
  }, STATUSES.map(status => /*#__PURE__*/React.createElement("div", {
    key: status
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: STATUS_COLOR[status]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, status), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "#5B6675"
    }
  }, filtered.filter(t => t.status === status).length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, filtered.filter(t => t.status === status).map(t => {
    const overdue = isOverdue(t);
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: canEditTasks ? "btn" : "",
      onClick: canEditTasks ? () => {
        setForm({
          member: t.member,
          meetingId: t.meetingId,
          task: t.task,
          assignedDate: t.assignedDate || "",
          deadline: t.deadline || "",
          status: t.status,
          priority: t.priority,
          remarks: t.remarks || ""
        });
        setEditingId(t.id);
        setFormError("");
        setModalOpen(true);
      } : undefined,
      style: {
        background: "#121821",
        border: "1px solid #1F2733",
        borderLeft: "3px solid " + PRIORITY_COLOR[t.priority],
        padding: "10px 12px",
        cursor: canEditTasks ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        marginBottom: 6,
        lineHeight: 1.4
      }
    }, t.task), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: "#8593A3"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "60%"
      }
    }, t.member), /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, t.taskCode || t.id)), t.deadline && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        marginTop: 6,
        color: overdue ? "#E85D5D" : "#5B6675"
      }
    }, "Due ", fmtDate(t.deadline), overdue ? " · overdue" : ""));
  }), filtered.filter(t => t.status === status).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#3A424D",
      padding: "8px 0"
    }
  }, "No tasks"))))), view === "members" && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#161D26",
      textAlign: "left"
    }
  }, ["Team ID", "Name", "Group", "Email", "Mobile", "Joined", "Assigned", "Completed", ""].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "10px 12px",
      fontSize: 11,
      letterSpacing: .5,
      color: "#8593A3",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, members.map(m => /*#__PURE__*/React.createElement("tr", {
    key: m.id,
    className: "rowhover",
    style: {
      borderTop: "1px solid #1F2733"
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: "#8593A3",
      whiteSpace: "nowrap"
    }
  }, m.teamId), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      whiteSpace: "nowrap"
    }
  }, m.name, m.role ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5B6675",
      fontSize: 11.5
    }
  }, " (", m.role, ")") : null), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      whiteSpace: "nowrap",
      color: "#8593A3"
    }
  }, m.group), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      color: "#8593A3"
    }
  }, m.email || "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      color: "#8593A3",
      whiteSpace: "nowrap"
    }
  }, m.mobile || "—"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      color: "#8593A3",
      whiteSpace: "nowrap"
    }
  }, fmtDate(m.joinedDate)), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: "#4F8CFF"
    }
  }, tasks.filter(t => t.member === m.name).length), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: "#3ECF9A"
    }
  }, tasks.filter(t => t.member === m.name && t.status === "Done").length), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      whiteSpace: "nowrap"
    }
  }, canManageMembers && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setMemberForm({
        name: m.name,
        email: m.email || "",
        mobile: m.mobile || "",
        teamId: m.teamId,
        role: m.role || "Member",
        group: m.group,
        joinedDate: m.joinedDate || ""
      });
      setEditingMemberId(m.id);
      setMemberFormError("");
      setMemberModalOpen(true);
    },
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      padding: 4,
      marginRight: 4,
      fontSize: 12
    }
  }, "Edit"), canManageMembers && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setConfirmDeleteMemberId(m.id),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      padding: 4,
      fontSize: 12
    }
  }, "Delete")))))), members.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 0",
      color: "#5B6675",
      fontSize: 13.5
    }
  }, "No members yet."))), modalOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: 16
    },
    onClick: () => setModalOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 480,
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
  }, editingId !== null ? "Edit Task" : "New Task"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setModalOpen(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(Field, {
    label: "Member"
  }, /*#__PURE__*/React.createElement("select", {
    value: form.member,
    onChange: e => setForm({
      ...form,
      member: e.target.value
    }),
    style: inputStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Select member —"), GROUPS.map(g => memberOptions.byGroup[g]?.length ? /*#__PURE__*/React.createElement("optgroup", {
    key: g,
    label: g
  }, memberOptions.byGroup[g].map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.name
  }, m.name, " (", m.teamId, ")"))) : null), memberOptions.legacy.length ? /*#__PURE__*/React.createElement("optgroup", {
    label: "Other"
  }, memberOptions.legacy.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n))) : null)), /*#__PURE__*/React.createElement(Field, {
    label: "Meeting ID"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.meetingId,
    onChange: e => setForm({
      ...form,
      meetingId: e.target.value
    }),
    placeholder: "e.g. 010",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Task"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: form.task,
    onChange: e => setForm({
      ...form,
      task: e.target.value
    }),
    placeholder: "Describe the task",
    rows: "2",
    style: {
      ...inputStyle,
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Assigned Date",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.assignedDate,
    onChange: e => setForm({
      ...form,
      assignedDate: e.target.value
    }),
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Deadline",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.deadline,
    onChange: e => setForm({
      ...form,
      deadline: e.target.value
    }),
    style: inputStyle
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Status",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.status,
    onChange: e => setForm({
      ...form,
      status: e.target.value
    }),
    style: inputStyle
  }, STATUSES.map(s => /*#__PURE__*/React.createElement("option", {
    key: s
  }, s)))), /*#__PURE__*/React.createElement(Field, {
    label: "Priority",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.priority,
    onChange: e => setForm({
      ...form,
      priority: e.target.value
    }),
    style: inputStyle
  }, PRIORITIES.map(p => /*#__PURE__*/React.createElement("option", {
    key: p
  }, p))))), /*#__PURE__*/React.createElement(Field, {
    label: "Remarks"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: form.remarks,
    onChange: e => setForm({
      ...form,
      remarks: e.target.value
    }),
    placeholder: "Optional notes",
    rows: "2",
    style: {
      ...inputStyle,
      resize: "vertical"
    }
  })), formError && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, formError), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setModalOpen(false),
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
    onClick: () => {
      if (!form.member.trim() || !form.task.trim()) {
        setFormError("Member and Task are required.");
        return;
      }
      saveTask(form);
    },
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
  }, editingId !== null ? "Save Changes" : "Add Task")))), confirmDeleteId !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: 16
    },
    onClick: () => setConfirmDeleteId(null)
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
  }, "Delete this task? This can't be undone."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setConfirmDeleteId(null),
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
    onClick: () => deleteTask(confirmDeleteId),
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
  }, "Delete")))), memberModalOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: 16
    },
    onClick: () => setMemberModalOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      width: "100%",
      maxWidth: 480,
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
  }, editingMemberId !== null ? "Edit Member" : "Add Member"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setMemberModalOpen(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(Field, {
    label: "Name"
  }, /*#__PURE__*/React.createElement("input", {
    value: memberForm.name,
    onChange: e => setMemberForm({
      ...memberForm,
      name: e.target.value
    }),
    placeholder: "e.g. Shahrukh Khan",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: memberForm.email,
    onChange: e => setMemberForm({
      ...memberForm,
      email: e.target.value
    }),
    placeholder: "name@example.com",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Mobile"
  }, /*#__PURE__*/React.createElement("input", {
    value: memberForm.mobile,
    onChange: e => setMemberForm({
      ...memberForm,
      mobile: e.target.value
    }),
    placeholder: "e.g. 01XXXXXXXXX",
    style: inputStyle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Team ID",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: memberForm.teamId,
    onChange: e => setMemberForm({
      ...memberForm,
      teamId: e.target.value
    }),
    placeholder: "e.g. 26-13860-0605",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Group",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: memberForm.group,
    onChange: e => setMemberForm({
      ...memberForm,
      group: e.target.value
    }),
    style: inputStyle
  }, GROUPS.map(g => /*#__PURE__*/React.createElement("option", {
    key: g
  }, g))))), /*#__PURE__*/React.createElement(Field, {
    label: "Role"
  }, /*#__PURE__*/React.createElement("input", {
    value: memberForm.role,
    onChange: e => setMemberForm({
      ...memberForm,
      role: e.target.value
    }),
    placeholder: "e.g. RA, SPM, ASPM",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Joined Date"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: memberForm.joinedDate,
    onChange: e => setMemberForm({
      ...memberForm,
      joinedDate: e.target.value
    }),
    style: inputStyle
  })), memberFormError && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, memberFormError), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setMemberModalOpen(false),
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
    onClick: () => {
      if (!memberForm.name.trim() || !memberForm.teamId.trim()) {
        setMemberFormError("Name and Team ID are required.");
        return;
      }
      saveMember(memberForm);
    },
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
  }, editingMemberId !== null ? "Save Changes" : "Add Member")))), confirmDeleteMemberId !== null && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      padding: 16
    },
    onClick: () => setConfirmDeleteMemberId(null)
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
  }, "Remove this member? Existing tasks assigned to them will keep their name as text."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setConfirmDeleteMemberId(null),
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
    onClick: () => deleteMember(confirmDeleteMemberId),
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
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));