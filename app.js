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

// ── Login — Team ID + password ────────────────────────────────────────────
function LoginScreen() {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function enter() {
    const id = teamId.trim();
    const pw = password;
    if (!id) {
      setError("Enter your Team ID.");
      return;
    }
    if (!pw) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    setError("");
    const email = id + "@missionlog.app";

    // Try sign in first
    const {
      error: signInErr
    } = await db.auth.signInWithPassword({
      email,
      password: pw
    });
    if (!signInErr) {
      setLoading(false);
      return;
    }

    // Account doesn't exist — create with the password they entered
    if (signInErr.message.toLowerCase().includes("invalid") || signInErr.message.toLowerCase().includes("credentials") || signInErr.message.toLowerCase().includes("not found")) {
      const {
        error: signUpErr
      } = await db.auth.signUp({
        email,
        password: pw
      });
      if (signUpErr) setError(signUpErr.message);
    } else {
      setError(signInErr.message);
    }
    setLoading(false);
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
      maxWidth: 380,
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
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 8
    }
  }, "Mission Log"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#8593A3",
      marginBottom: 22
    }
  }, "Enter your Team ID and password to continue."), /*#__PURE__*/React.createElement(Field, {
    label: "Team ID"
  }, /*#__PURE__*/React.createElement("input", {
    value: teamId,
    onChange: e => setTeamId(e.target.value),
    onKeyDown: e => e.key === "Enter" && enter(),
    placeholder: "e.g. 25-13860-0102",
    style: inputStyle,
    autoComplete: "username",
    autoFocus: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    onKeyDown: e => e.key === "Enter" && enter(),
    placeholder: "Your password",
    style: inputStyle,
    autoComplete: "current-password"
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: enter,
    disabled: loading,
    style: {
      width: "100%",
      background: "#4F8CFF",
      border: "none",
      color: "#08111F",
      borderRadius: 6,
      padding: "11px 0",
      fontSize: 14,
      fontWeight: 600
    }
  }, loading ? "Loading…" : "Sign In"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
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
  }, "SPMT & Faculty Advisors:"), " use the shared team password.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, "All others:"), " your Team ID is your password.")));
}

// ── Profile modal ─────────────────────────────────────────────────────────
function ProfileModal({
  member,
  onClose,
  onSaved
}) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [mobile, setMobile] = useState(member.mobile);
  const [newPass, setNewPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function save() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Update member record
      const {
        error: e1
      } = await db.from("members").update({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim()
      }).eq("auth_user_id", (await db.auth.getUser()).data.user?.id);
      if (e1) throw e1;

      // Change password if provided
      if (newPass.trim()) {
        if (newPass.length < 6) throw new Error("Password must be at least 6 characters.");
        const {
          error: e2
        } = await db.auth.updateUser({
          password: newPass.trim()
        });
        if (e2) throw e2;
      }
      setSuccess("Saved!");
      setNewPass("");
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save.");
    }
    setSaving(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 16
    },
    onClick: onClose
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
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "My Profile"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 6,
      padding: "10px 12px",
      marginBottom: 16,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#5B6675"
    }
  }, "Team ID: "), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "#8593A3"
    }
  }, member.teamId), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 12,
      color: "#5B6675"
    }
  }, "Group: "), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#8593A3"
    }
  }, member.group)), /*#__PURE__*/React.createElement(Field, {
    label: "Name"
  }, /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email (for task notifications)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "your@email.com",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Mobile"
  }, /*#__PURE__*/React.createElement("input", {
    value: mobile,
    onChange: e => setMobile(e.target.value),
    placeholder: "e.g. 01XXXXXXXXX",
    style: inputStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "New Password (leave blank to keep current)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: newPass,
    onChange: e => setNewPass(e.target.value),
    placeholder: "Min. 6 characters",
    style: inputStyle,
    autoComplete: "new-password"
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, error), success && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#3ECF9A",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, success), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose,
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
    onClick: save,
    disabled: saving,
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
  }, saving ? "Saving…" : "Save Changes"))));
}

// ── Main app ──────────────────────────────────────────────────────────────
function App() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [memberChecked, setMemberChecked] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState("Active");
  const [meetingFilter, setMeetingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showDone, setShowDone] = useState(true);
  const [hideDone, setHideDone] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    member: "",
    members: [],
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
  const [taskLog, setTaskLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [profileMember, setProfileMember] = useState(null);

  // Auth listener
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
      setMemberError("");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Auto-link after auth
  useEffect(() => {
    if (!authUser) {
      setCurrentMember(null);
      setMemberChecked(true);
      return;
    }
    setMemberChecked(false);
    db.rpc("link_or_get_member").then(async ({
      data
    }) => {
      if (data) {
        setCurrentMember(rowToMember(data));
        setMemberChecked(true);
      } else {
        // Not linked yet — auto-claim using Team ID from email
        const teamId = authUser.email.replace("@missionlog.app", "");
        const {
          error: claimErr
        } = await db.rpc("claim_membership", {
          p_team_id: teamId
        });
        if (!claimErr) {
          const {
            data: d2
          } = await db.rpc("link_or_get_member");
          setCurrentMember(d2 ? rowToMember(d2) : null);
        } else {
          setMemberError(claimErr.message);
        }
        setMemberChecked(true);
      }
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
  async function loadTaskLog() {
    setLogLoading(true);
    const {
      data,
      error
    } = await db.from("task_log").select("*").order("action_at", {
      ascending: false
    }).limit(1000);
    if (!error) setTaskLog(data || []);
    setLogLoading(false);
  }
  useEffect(() => {
    if (view === "logs") loadTaskLog();
  }, [view]);
  const canEditTasks = !!currentMember && (currentMember.group === "SPMT" || currentMember.group === "Faculty Advisors");
  const canManageMembers = !!currentMember && currentMember.group === "SPMT";
  async function nextTaskCodeNum() {
    const {
      data
    } = await db.from("tasks").select("task_code").order("id", {
      ascending: false
    }).limit(1);
    if (!data || !data.length) return 1;
    const n = parseInt((data[0].task_code || "").replace(/^T/i, ""), 10);
    return isNaN(n) ? 1 : n + 1;
  }
  async function saveTask(form) {
    setTaskSaving(true);
    setTaskFormError("");
    try {
      if (editingTaskId !== null) {
        // Edit: single task update
        const {
          error
        } = await db.from("tasks").update({
          member: form.member.trim(),
          meeting_id: form.meetingId,
          task: form.task.trim(),
          assigned_date: form.assignedDate || null,
          deadline: form.deadline || null,
          status: form.status,
          priority: form.priority,
          remarks: (form.remarks || "").trim()
        }).eq("id", editingTaskId);
        if (error) throw error;
      } else {
        // New: one task per selected member
        let codeNum = await nextTaskCodeNum();
        for (const memberName of form.members) {
          const {
            error
          } = await db.from("tasks").insert({
            task_code: "T" + String(codeNum).padStart(3, "0"),
            member: memberName,
            meeting_id: form.meetingId,
            task: form.task.trim(),
            assigned_date: form.assignedDate || null,
            deadline: form.deadline || null,
            status: form.status,
            priority: form.priority,
            remarks: (form.remarks || "").trim()
          });
          if (error) throw error;
          codeNum++;
        }
      }
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
  const filtered = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return tasks.filter(t => {
      if (memberFilter !== "All" && (t.member || "") !== memberFilter) return false;
      if (meetingFilter !== "All" && (t.meetingId || "") !== meetingFilter) return false;
      if (statusFilter !== "All" && (t.status || "") !== statusFilter) return false;
      if (priorityFilter !== "All" && (t.priority || "") !== priorityFilter) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase();
        const hay = ((t.task || "") + " " + (t.member || "") + " " + (t.remarks || "") + " " + (t.meetingId || "")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, memberFilter, meetingFilter, statusFilter, priorityFilter, search]);
  const visibleTasks = showDone ? filtered : filtered.filter(t => (t.status || "") !== "Done");
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
  const spin = color => /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: color || "#8593A3"
    }
  }, "Loading…");
  if (!authReady) return spin();
  if (!authUser) return /*#__PURE__*/React.createElement(LoginScreen, null);
  if (!memberChecked) return spin();
  if (memberError) return /*#__PURE__*/React.createElement("div", {
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
      maxWidth: 400,
      padding: 24,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      marginBottom: 12,
      fontSize: 14
    }
  }, memberError), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#8593A3",
      fontSize: 12.5,
      marginBottom: 16
    }
  }, "Contact your SPM or ASPM for help."), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => db.auth.signOut(),
    style: {
      background: "transparent",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "8px 20px",
      fontSize: 13
    }
  }, "Sign Out")));
  if (!currentMember) return spin();
  if (dataLoading) return spin();
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
  }, profileOpen && /*#__PURE__*/React.createElement(ProfileModal, {
    member: currentMember,
    onClose: () => setProfileOpen(false),
    onSaved: async () => {
      const {
        data
      } = await db.rpc("link_or_get_member");
      if (data) {
        setCurrentMember(rowToMember(data));
        await reloadMembers();
      }
      setProfileOpen(false);
    }
  }), /*#__PURE__*/React.createElement("div", {
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
  }, canEditTasks ? "Editor" : "Viewer", " · ", currentMember.group)), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setProfileOpen(true),
    style: {
      background: "#1A222D",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "10px 14px",
      fontSize: 12.5
    },
    title: "Edit profile"
  }, "Profile"), canManageMembers && /*#__PURE__*/React.createElement("button", {
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
        members: [],
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
  }, value)))), !currentMember.email && canEditTasks && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1A1500",
      border: "1px solid #E8A33D44",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#E8A33D"
    }
  }, "Add your email in Profile to receive task notifications."), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setProfileOpen(true),
    style: {
      background: "#E8A33D",
      border: "none",
      color: "#0A0E14",
      borderRadius: 5,
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, "Add Email")), /*#__PURE__*/React.createElement("div", {
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
    options: ["Active", "To Do", "In Progress", "Done", "All"]
  }), /*#__PURE__*/React.createElement(FilterSelect, {
    value: priorityFilter,
    onChange: setPriorityFilter,
    options: ["All", ...PRIORITIES]
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setShowDone(p => !p),
    style: {
      background: showDone ? "#121821" : "#1A1500",
      border: "1px solid " + (showDone ? "#1F2733" : "#E8A33D55"),
      color: showDone ? "#8593A3" : "#E8A33D",
      borderRadius: 6,
      padding: "8px 12px",
      fontSize: 12.5,
      whiteSpace: "nowrap"
    }
  }, showDone ? "Hide completed" : "Show completed"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 6,
      overflow: "hidden"
    }
  }, ["table", "board", "members", "logs"].map(v => /*#__PURE__*/React.createElement("button", {
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
  }, v[0].toUpperCase() + v.slice(1)))), (view === "table" || view === "board") && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setHideDone(h => !h),
    style: {
      background: hideDone ? "#121821" : "#1A2D1A",
      border: "1px solid " + (hideDone ? "#1F2733" : "#3ECF9A55"),
      borderRadius: 6,
      padding: "8px 12px",
      color: hideDone ? "#5B6675" : "#3ECF9A",
      fontSize: 12.5,
      whiteSpace: "nowrap"
    }
  }, hideDone ? `Show completed (${tasks.filter(t => t.status === "Done").length})` : "Hide completed")), view === "table" && /*#__PURE__*/React.createElement("div", {
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
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, visibleTasks.map(t => {
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
  }))), visibleTasks.length === 0 && /*#__PURE__*/React.createElement("div", {
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
  }, STATUSES.filter(s => s !== "Done" || statusFilter === "Done" || statusFilter === "All").map(status => /*#__PURE__*/React.createElement("div", {
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
  }, visibleTasks.filter(t => t.status === status).length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, visibleTasks.filter(t => t.status === status).map(t => {
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
  }), visibleTasks.filter(t => t.status === status).length === 0 && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setProfileMember(m),
    style: {
      borderTop: "1px solid #1F2733",
      cursor: "pointer"
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
  }, "No members yet."))), profileMember && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 60,
      padding: 16
    },
    onClick: () => setProfileMember(null)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 12,
      width: "100%",
      maxWidth: 520,
      padding: 24,
      maxHeight: "88vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "#1A2A4A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      fontWeight: 700,
      color: "#4F8CFF"
    }
  }, profileMember.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 18,
      fontWeight: 700
    }
  }, profileMember.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginTop: 2
    }
  }, profileMember.role, " · ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#4F8CFF"
    }
  }, profileMember.group)))), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setProfileMember(null),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 18
    }
  }, "×")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 8,
      marginBottom: 18
    }
  }, [["Assigned", tasks.filter(t => t.member === profileMember.name).length, "#E8EDF2"], ["Done", tasks.filter(t => t.member === profileMember.name && t.status === "Done").length, "#3ECF9A"], ["In Progress", tasks.filter(t => t.member === profileMember.name && t.status === "In Progress").length, "#4F8CFF"], ["Overdue", tasks.filter(t => t.member === profileMember.name && isOverdue(t)).length, "#E85D5D"]].map(([label, value, color]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 8,
      padding: "10px 12px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 22,
      fontWeight: 700,
      color
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "#8593A3",
      marginTop: 2
    }
  }, label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 8,
      padding: "14px 16px",
      marginBottom: 16
    }
  }, [["Team ID", profileMember.teamId, true], ["Email", profileMember.email || "—", canManageMembers || profileMember.id === currentMember?.id], ["Mobile", profileMember.mobile || "—", canManageMembers || profileMember.id === currentMember?.id], ["Joined", fmtDate(profileMember.joinedDate), true]].filter(([,, show]) => show).map(([label, value]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "5px 0",
      borderBottom: "1px solid #1F273322"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#5B6675"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "#E8EDF2"
    }
  }, value)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginBottom: 8,
      fontWeight: 600,
      letterSpacing: .5,
      textTransform: "uppercase"
    }
  }, "Tasks"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      maxHeight: 200,
      overflowY: "auto"
    }
  }, tasks.filter(t => t.member === profileMember.name).length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#3A424D",
      padding: "10px 0"
    }
  }, "No tasks assigned.") : tasks.filter(t => t.member === profileMember.name).map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 10px",
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 11,
      color: "#5B6675",
      minWidth: 36
    }
  }, t.taskCode), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, t.task), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: STATUS_COLOR[t.status],
      whiteSpace: "nowrap"
    }
  }, t.status)))))), view === "logs" && /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "0 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, "Task Audit Log"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginTop: 2
    }
  }, "Permanent record — cannot be deleted or modified")), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: loadTaskLog,
    style: {
      background: "#1A222D",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "8px 14px",
      fontSize: 12.5
    }
  }, "Refresh")), logLoading ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 0",
      color: "#8593A3"
    }
  }, "Loading log…") : /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 10,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      fontSize: 12.5,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#161D26",
      textAlign: "left"
    }
  }, ["Date & Time", "Code", "Member", "Task", "Status", "Priority", "Action", "By"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "9px 12px",
      fontSize: 10.5,
      letterSpacing: .5,
      color: "#8593A3",
      fontWeight: 600,
      whiteSpace: "nowrap"
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, taskLog.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "8",
    style: {
      padding: "60px 0",
      textAlign: "center",
      color: "#5B6675"
    }
  }, "No log entries yet. They appear once tasks are created or changed.")) : taskLog.map(l => {
    const actionColor = l.action === "created" ? "#3ECF9A" : l.action === "deleted" ? "#E85D5D" : "#4F8CFF";
    const rowOpacity = l.action === "deleted" ? 0.6 : 1;
    return /*#__PURE__*/React.createElement("tr", {
      key: l.id,
      className: "rowhover",
      style: {
        borderTop: "1px solid #1F2733",
        opacity: rowOpacity
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "9px 12px",
        color: "#5B6675",
        whiteSpace: "nowrap",
        fontSize: 11
      }
    }, new Date(l.action_at).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })), /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "9px 12px",
        color: "#5B6675"
      }
    }, l.task_code), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px",
        whiteSpace: "nowrap"
      }
    }, l.member), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px",
        maxWidth: 280,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, l.task), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px",
        whiteSpace: "nowrap",
        color: STATUS_COLOR[l.status] || "#8593A3"
      }
    }, l.status), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px",
        whiteSpace: "nowrap",
        color: PRIORITY_COLOR[l.priority] || "#8593A3"
      }
    }, l.priority), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: actionColor + "22",
        color: actionColor,
        borderRadius: 4,
        padding: "2px 7px",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: .5
      }
    }, l.action)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px",
        color: "#8593A3",
        whiteSpace: "nowrap"
      }
    }, l.action_by || "—"));
  }))))), modalOpen && /*#__PURE__*/React.createElement("div", {
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
  }, "×")), editingTaskId !== null ? /*#__PURE__*/React.createElement(Field, {
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
  }, n))) : null)) : /*#__PURE__*/React.createElement(Field, {
    label: "Assign to"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid #1F2733",
      borderRadius: 6,
      maxHeight: 220,
      overflowY: "auto",
      background: "#0A0E14"
    }
  }, GROUPS.map(g => memberOptions.byGroup[g]?.length ? /*#__PURE__*/React.createElement("div", {
    key: g
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "5px 10px",
      fontSize: 10.5,
      color: "#5B6675",
      fontWeight: 700,
      letterSpacing: .8,
      background: "#0D1420",
      textTransform: "uppercase"
    }
  }, g), memberOptions.byGroup[g].map(m => /*#__PURE__*/React.createElement("label", {
    key: m.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 10px",
      cursor: "pointer",
      borderTop: "1px solid #1F273322"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: taskForm.members.includes(m.name),
    onChange: e => setTaskForm(prev => ({
      ...prev,
      members: e.target.checked ? [...prev.members, m.name] : prev.members.filter(n => n !== m.name)
    }))
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, m.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#5B6675",
      marginLeft: "auto"
    }
  }, m.teamId)))) : null), memberOptions.legacy.map(n => /*#__PURE__*/React.createElement("label", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 10px",
      cursor: "pointer",
      borderTop: "1px solid #1F273322"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: taskForm.members.includes(n),
    onChange: e => setTaskForm(prev => ({
      ...prev,
      members: e.target.checked ? [...prev.members, n] : prev.members.filter(x => x !== n)
    }))
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, n)))), taskForm.members.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 11.5,
      color: "#4F8CFF"
    }
  }, taskForm.members.length, " member", taskForm.members.length > 1 ? "s" : "", " selected — ", taskForm.members.length, " task", taskForm.members.length > 1 ? "s" : "", " will be created")), /*#__PURE__*/React.createElement(Field, {
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
      if (editingTaskId !== null) {
        if (!taskForm.member || !taskForm.task.trim()) {
          setTaskFormError("Member and Task are required.");
          return;
        }
      } else {
        if (taskForm.members.length === 0 || !taskForm.task.trim()) {
          setTaskFormError("Select at least one member and enter a task.");
          return;
        }
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
  }, taskSaving ? "Saving…" : editingTaskId !== null ? "Save Changes" : taskForm.members.length > 1 ? `Add ${taskForm.members.length} Tasks` : "Add Task")))), confirmDeleteId !== null && /*#__PURE__*/React.createElement("div", {
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
