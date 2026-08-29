const {
  useState,
  useEffect,
  useMemo
} = React;
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
function rowToMember(r) {
  return {
    id: r.id,
    teamId: r.team_id,
    name: r.name,
    role: r.role || '',
    group: r.group_name,
    email: r.email || '',
    mobile: r.mobile || '',
    joinedDate: r.joined_date || ''
  };
}
function rowToTask(r) {
  return {
    id: r.id,
    taskCode: r.task_code || '',
    member: r.member,
    meetingId: r.meeting_id || '',
    task: r.task,
    assignedDate: r.assigned_date || '',
    deadline: r.deadline || '',
    status: r.status,
    priority: r.priority,
    remarks: r.remarks || ''
  };
}
function isOverdue(t) {
  if (!t.deadline || t.status === "Done") return false;
  const d = new Date(t.deadline + "T00:00:00");
  return !isNaN(d) && d < new Date();
}
function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  if (isNaN(d)) return s;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
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

// ── Auth screen — sign in OR sign up ──────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  function switchMode(m) {
    setMode(m);
    setError("");
    setCheckEmail(false);
  }
  async function attempt() {
    const e = email.trim();
    if (!e || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    if (mode === "signup") {
      const {
        error: err
      } = await db.auth.signUp({
        email: e,
        password
      });
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setCheckEmail(true);
    } else {
      const {
        error: err
      } = await db.auth.signInWithPassword({
        email: e,
        password
      });
      setLoading(false);
      if (err) setError("Incorrect email or password.");
    }
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
      marginBottom: 20
    }
  }, "Mission Log"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 6,
      marginBottom: 20,
      overflow: "hidden"
    }
  }, ["signin", "signup"].map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    className: "btn",
    onClick: () => switchMode(m),
    style: {
      flex: 1,
      padding: "9px 0",
      border: "none",
      fontSize: 13,
      fontWeight: 600,
      background: mode === m ? "#4F8CFF" : "transparent",
      color: mode === m ? "#08111F" : "#8593A3"
    }
  }, m === "signin" ? "Sign In" : "Sign Up"))), checkEmail ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "20px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 12
    }
  }, "✉️"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      marginBottom: 8
    }
  }, "Check your email"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#8593A3",
      lineHeight: 1.6
    }
  }, "We sent a confirmation link to ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#E8EDF2"
    }
  }, email), ". Click it to activate your account, then come back and sign in."), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setCheckEmail(false);
      setMode("signin");
    },
    style: {
      marginTop: 16,
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "8px 20px",
      fontSize: 13
    }
  }, "Back to sign in")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Email"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    onKeyDown: e => e.key === "Enter" && attempt(),
    placeholder: "your@email.com",
    style: inputStyle,
    autoComplete: "email"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    onKeyDown: e => e.key === "Enter" && attempt(),
    placeholder: mode === "signup" ? "Min. 6 characters" : "Your password",
    style: inputStyle,
    autoComplete: mode === "signup" ? "new-password" : "current-password"
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: attempt,
    disabled: loading,
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
  }, loading ? mode === "signup" ? "Creating account…" : "Signing in…" : mode === "signup" ? "Create Account" : "Sign In"), mode === "signin" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 11.5,
      color: "#5B6675"
    }
  }, "No account yet? Switch to Sign Up above."))));
}

// ── Claim screen — enter Team ID after first login ────────────────────────
function ClaimScreen({
  authEmail,
  onClaimed
}) {
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [isSpmt, setIsSpmt] = useState(false);
  async function claim() {
    const id = teamId.trim();
    if (!id) {
      setError("Enter your Team ID.");
      return;
    }
    setLoading(true);
    setError("");
    setIsSpmt(false);
    const {
      error: e
    } = await db.rpc("claim_membership", {
      p_team_id: id
    });
    setLoading(false);
    if (e) {
      if (e.message.toLowerCase().includes("spmt")) {
        setIsSpmt(true);
      } else {
        setError(e.message);
      }
      return;
    }
    setDone(true);
    setTimeout(onClaimed, 800);
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
  }, "Link your account"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#8593A3",
      marginBottom: 20,
      lineHeight: 1.6
    }
  }, "Signed in as ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#E8EDF2"
    }
  }, authEmail), ".", /*#__PURE__*/React.createElement("br", null), "Enter your Team ID to connect to your member profile."), isSpmt ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1A2233",
      border: "1px solid #2A3A55",
      borderRadius: 8,
      padding: "14px 16px",
      fontSize: 13,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#4F8CFF",
      fontWeight: 600,
      marginBottom: 6
    }
  }, "SPMT account detected"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#8593A3"
    }
  }, "SPMT accounts must be linked by the administrator. Share your email with your SPM — they will link you manually and let you know when it's done.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: "Team ID"
  }, /*#__PURE__*/React.createElement("input", {
    value: teamId,
    onChange: e => setTeamId(e.target.value),
    onKeyDown: e => e.key === "Enter" && claim(),
    placeholder: "e.g. 26-13860-0301",
    style: inputStyle
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, error), done && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#3ECF9A",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, "Linked! Loading your profile…"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: claim,
    disabled: loading || done,
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
  }, loading ? "Linking…" : "Link Account")), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => db.auth.signOut(),
    style: {
      marginTop: 14,
      background: "none",
      border: "none",
      color: "#5B6675",
      fontSize: 12,
      padding: 0
    }
  }, "Sign out")));
}

// ── Main app ──────────────────────────────────────────────────────────────
function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberChecked, setMemberChecked] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("All");
  const [meetingFilter, setMeetingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    member: "",
    meetingId: "",
    task: "",
    assignedDate: "",
    deadline: "",
    status: "To Do",
    priority: "Medium",
    remarks: ""
  });
  const [taskFormError, setTaskFormError] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
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
  const [memberSaving, setMemberSaving] = useState(false);
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState(null);
  useEffect(() => {
    db.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });
    const {
      data: listener
    } = db.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setMemberChecked(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!authUser) {
      setCurrentMember(null);
      setMemberChecked(true);
      return;
    }
    setMemberChecked(false);
    db.rpc("link_or_get_member").then(({
      data
    }) => {
      setCurrentMember(data ? rowToMember(data) : null);
      setMemberChecked(true);
    });
  }, [authUser]);
  useEffect(() => {
    if (currentMember) loadAllData();
  }, [currentMember]);
  async function loadAllData() {
    setDataLoading(true);
    setDataError("");
    const [tr, mr] = await Promise.all([db.from("tasks").select("*").order("id"), db.from("members").select("*").order("group_name").order("name")]);
    if (tr.error || mr.error) {
      setDataError("Failed to load data. Please refresh.");
    } else {
      setTasks(tr.data.map(rowToTask));
      setMembers(mr.data.map(rowToMember));
    }
    setDataLoading(false);
  }
  async function reloadTasks() {
    const {
      data,
      error
    } = await db.from("tasks").select("*").order("id");
    if (!error) setTasks(data.map(rowToTask));
  }
  async function reloadMembers() {
    const {
      data,
      error
    } = await db.from("members").select("*").order("group_name").order("name");
    if (!error) setMembers(data.map(rowToMember));
  }
  const canEditTasks = !!currentMember && (currentMember.group === "SPMT" || currentMember.group === "Faculty Advisors");
  const canManageMembers = !!currentMember && currentMember.group === "SPMT";
  async function nextTaskCode() {
    const {
      data
    } = await db.from("tasks").select("task_code").order("id", {
      ascending: false
    }).limit(1);
    if (!data || !data.length) return "T001";
    const n = parseInt((data[0].task_code || "").replace(/^T/i, ""), 10);
    return "T" + String((isNaN(n) ? 0 : n) + 1).padStart(3, "0");
  }
  async function saveTask(form) {
    setTaskSaving(true);
    setTaskFormError("");
    try {
      const payload = {
        member: form.member.trim(),
        meeting_id: form.meetingId,
        task: form.task.trim(),
        assigned_date: form.assignedDate || null,
        deadline: form.deadline || null,
        status: form.status,
        priority: form.priority,
        remarks: (form.remarks || "").trim()
      };
      let error;
      if (editingTaskId !== null) {
        ({
          error
        } = await db.from("tasks").update(payload).eq("id", editingTaskId));
      } else {
        payload.task_code = await nextTaskCode();
        ({
          error
        } = await db.from("tasks").insert(payload));
      }
      if (error) throw error;
      setModalOpen(false);
      await reloadTasks();
    } catch (err) {
      setTaskFormError(err.message || "Failed to save.");
    }
    setTaskSaving(false);
  }
  async function deleteTask(id) {
    const {
      error
    } = await db.from("tasks").delete().eq("id", id);
    if (!error) {
      setConfirmDeleteId(null);
      await reloadTasks();
    }
  }
  async function updateTaskStatus(id, status) {
    const {
      error
    } = await db.from("tasks").update({
      status
    }).eq("id", id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      status
    } : t));
  }
  async function updateTaskPriority(id, priority) {
    if (!canEditTasks) return;
    const {
      error
    } = await db.from("tasks").update({
      priority
    }).eq("id", id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? {
      ...t,
      priority
    } : t));
  }
  async function saveMember(form) {
    setMemberSaving(true);
    setMemberFormError("");
    try {
      const payload = {
        name: form.name.trim(),
        email: (form.email || "").trim(),
        mobile: (form.mobile || "").trim(),
        team_id: form.teamId.trim(),
        role: (form.role || "").trim(),
        group_name: form.group,
        joined_date: form.joinedDate || null
      };
      let error;
      if (editingMemberId !== null) {
        ({
          error
        } = await db.from("members").update(payload).eq("id", editingMemberId));
      } else {
        ({
          error
        } = await db.from("members").insert(payload));
      }
      if (error) throw error;
      setMemberModalOpen(false);
      await reloadMembers();
    } catch (err) {
      setMemberFormError(err.message || "Failed to save.");
    }
    setMemberSaving(false);
  }
  async function deleteMember(id) {
    const {
      error
    } = await db.from("members").delete().eq("id", id);
    if (!error) {
      setConfirmDeleteMemberId(null);
      await reloadMembers();
    }
  }
  const memberNames = useMemo(() => Array.from(new Set(tasks.map(t => t.member).filter(Boolean))).sort(), [tasks]);
  const meetings = useMemo(() => Array.from(new Set(tasks.map(t => t.meetingId).filter(Boolean))).sort(), [tasks]);
  const filtered = useMemo(() => tasks.filter(t => {
    if (memberFilter !== "All" && t.member !== memberFilter) return false;
    if (meetingFilter !== "All" && t.meetingId !== meetingFilter) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!(t.task + " " + t.member + " " + t.remarks + " " + t.meetingId).toLowerCase().includes(q)) return false;
    }
    return true;
  }), [tasks, memberFilter, meetingFilter, statusFilter, priorityFilter, search]);
  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === "To Do").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    done: tasks.filter(t => t.status === "Done").length,
    overdue: tasks.filter(isOverdue).length
  }), [tasks]);
  const memberOptions = useMemo(() => {
    const byGroup = {};
    members.forEach(m => {
      (byGroup[m.group] = byGroup[m.group] || []).push(m);
    });
    const known = new Set(members.map(m => m.name));
    const legacy = Array.from(new Set(tasks.map(t => t.member))).filter(n => n && !known.has(n));
    return {
      byGroup,
      legacy
    };
  }, [members, tasks]);

  // Guards
  const spinner = /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#8593A3"
    }
  }, "Loading…");
  if (!authReady) return spinner;
  if (!authUser) return /*#__PURE__*/React.createElement(AuthScreen, null);
  if (!memberChecked) return spinner;
  if (!currentMember) return /*#__PURE__*/React.createElement(ClaimScreen, {
    authEmail: authUser.email,
    onClaimed: () => {
      db.rpc("link_or_get_member").then(({
        data
      }) => setCurrentMember(data ? rowToMember(data) : null));
    }
  });
  if (dataLoading) return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#8593A3"
    }
  }, "Loading tasks…");
  if (dataError) return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D"
    }
  }, dataError), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: loadAllData,
    style: {
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "8px 16px"
    }
  }, "Retry"));
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
  }, currentMember.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: canEditTasks ? "#3ECF9A" : "#8593A3"
    }
  }, canEditTasks ? "Editor" : "Viewer", " · ", currentMember.group)), canManageMembers && /*#__PURE__*/React.createElement("button", {
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
      setTaskForm({
        member: "",
        meetingId: "",
        task: "",
        assignedDate: "",
        deadline: "",
        status: "To Do",
        priority: "Medium",
        remarks: ""
      });
      setEditingTaskId(null);
      setTaskFormError("");
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
    onClick: () => db.auth.signOut(),
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
    const canChangeStatus = canEditTasks || currentMember && t.member === currentMember.name;
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
    }, t.taskCode), /*#__PURE__*/React.createElement("td", {
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
    }, canEditTasks && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => {
        setTaskForm({
          member: t.member,
          meetingId: t.meetingId,
          task: t.task,
          assignedDate: t.assignedDate || "",
          deadline: t.deadline || "",
          status: t.status,
          priority: t.priority,
          remarks: t.remarks || ""
        });
        setEditingTaskId(t.id);
        setTaskFormError("");
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
    }, "Edit"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => setConfirmDeleteId(t.id),
      style: {
        background: "none",
        border: "none",
        color: "#8593A3",
        padding: 4,
        fontSize: 12
      }
    }, "Delete"))));
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
        setTaskForm({
          member: t.member,
          meetingId: t.meetingId,
          task: t.task,
          assignedDate: t.assignedDate || "",
          deadline: t.deadline || "",
          status: t.status,
          priority: t.priority,
          remarks: t.remarks || ""
        });
        setEditingTaskId(t.id);
        setTaskFormError("");
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
    }, t.taskCode)), t.deadline && /*#__PURE__*/React.createElement("div", {
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
  }, canManageMembers && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
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
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setConfirmDeleteMemberId(m.id),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      padding: 4,
      fontSize: 12
    }
  }, "Delete"))))))), members.length === 0 && /*#__PURE__*/React.createElement("div", {
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
  }, editingTaskId !== null ? "Edit Task" : "New Task"), /*#__PURE__*/React.createElement("button", {
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
    value: taskForm.member,
    onChange: e => setTaskForm({
      ...taskForm,
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
    value: taskForm.meetingId,
    onChange: e => setTaskForm({
      ...taskForm,
      meetingId: e.target.value
    }),
    placeholder: "e.g. 010",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Task"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: taskForm.task,
    onChange: e => setTaskForm({
      ...taskForm,
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
    value: taskForm.assignedDate,
    onChange: e => setTaskForm({
      ...taskForm,
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
    value: taskForm.deadline,
    onChange: e => setTaskForm({
      ...taskForm,
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
    value: taskForm.status,
    onChange: e => setTaskForm({
      ...taskForm,
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
    value: taskForm.priority,
    onChange: e => setTaskForm({
      ...taskForm,
      priority: e.target.value
    }),
    style: inputStyle
  }, PRIORITIES.map(p => /*#__PURE__*/React.createElement("option", {
    key: p
  }, p))))), /*#__PURE__*/React.createElement(Field, {
    label: "Remarks"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: taskForm.remarks,
    onChange: e => setTaskForm({
      ...taskForm,
      remarks: e.target.value
    }),
    placeholder: "Optional notes",
    rows: "2",
    style: {
      ...inputStyle,
      resize: "vertical"
    }
  })), taskFormError && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, taskFormError), /*#__PURE__*/React.createElement("div", {
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
    disabled: taskSaving,
    onClick: () => {
      if (!taskForm.member.trim() || !taskForm.task.trim()) {
        setTaskFormError("Member and Task are required.");
        return;
      }
      saveTask(taskForm);
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
  }, taskSaving ? "Saving…" : editingTaskId !== null ? "Save Changes" : "Add Task")))), confirmDeleteId !== null && /*#__PURE__*/React.createElement("div", {
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
    disabled: memberSaving,
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
  }, memberSaving ? "Saving…" : editingMemberId !== null ? "Save Changes" : "Add Member")))), confirmDeleteMemberId !== null && /*#__PURE__*/React.createElement("div", {
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
  }, "Remove this member? Tasks assigned to them will keep their name as text."), /*#__PURE__*/React.createElement("div", {
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
