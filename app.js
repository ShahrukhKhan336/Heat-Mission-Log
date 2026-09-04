const {
  useState,
  useEffect,
  useMemo
} = React;
const STATUSES = ["To Do", "In Progress", "Done"];
const PRIORITIES = ["High", "Medium", "Low"];
const GROUPS = ["SPMT", "Faculty Advisors", "RA", "Other Officer", "Staff", "Student"];
const S_COLOR = {
  "To Do": "#8593A3",
  "In Progress": "#4F8CFF",
  "Done": "#3ECF9A"
};
const P_COLOR = {
  High: "#E8A33D",
  Medium: "#4F8CFF",
  Low: "#5B6675"
};
function rowToMember(r) {
  return {
    id: r.id,
    teamId: r.team_id,
    name: r.name,
    role: r.role || "",
    group: r.group_name,
    email: r.email || "",
    mobile: r.mobile || "",
    joinedDate: r.joined_date || "",
    isFinanceOfficer: r.is_finance_officer || false,
    photoUrl: r.photo_url || "",
    dob: r.date_of_birth || "",
    addrPresent: r.address_present || "",
    addrPermanent: r.address_permanent || ""
  };
}
function rowToTask(r) {
  return {
    id: r.id,
    taskCode: r.task_code || "",
    member: r.member,
    meetingId: r.meeting_id || "",
    task: r.task,
    assignedDate: r.assigned_date || "",
    deadline: r.deadline || "",
    status: r.status,
    priority: r.priority,
    remarks: r.remarks || ""
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
function fmtDateTime(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
const iStyle = {
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
function Sel({
  value,
  onChange,
  options,
  prefix = ""
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
  }, o === "All" ? "All" : prefix + o)));
}

// ── Login ─────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [teamId, setTeamId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function go() {
    const id = teamId.trim();
    if (!id || !pw) {
      setErr("Enter your Team ID and password.");
      return;
    }
    setBusy(true);
    setErr("");
    const email = id + "@missionlog.app";
    const {
      error: e1
    } = await db.auth.signInWithPassword({
      email,
      password: pw
    });
    if (!e1) {
      setBusy(false);
      return;
    }
    if (e1.message.toLowerCase().includes("invalid") || e1.message.toLowerCase().includes("credentials")) {
      const {
        error: e2
      } = await db.auth.signUp({
        email,
        password: pw
      });
      if (e2) setErr(e2.message);
    } else {
      setErr(e1.message);
    }
    setBusy(false);
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
  }, "Enter your Team ID and password."), /*#__PURE__*/React.createElement(Field, {
    label: "Team ID"
  }, /*#__PURE__*/React.createElement("input", {
    value: teamId,
    onChange: e => setTeamId(e.target.value),
    onKeyDown: e => e.key === "Enter" && go(),
    placeholder: "e.g. 25-13860-0102",
    style: iStyle,
    autoFocus: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: pw,
    onChange: e => setPw(e.target.value),
    onKeyDown: e => e.key === "Enter" && go(),
    placeholder: "Your password",
    style: iStyle
  })), err && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, err), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: go,
    disabled: busy,
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
  }, busy ? "Loading…" : "Sign In"), /*#__PURE__*/React.createElement("div", {
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

// ── Profile modal (edit own profile) ─────────────────────────────────────
function ProfileModal({
  member,
  onClose,
  onSaved
}) {
  const [name, setName] = useState(member.name);
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl || "");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [email, setEmail] = useState(member.email);
  const [mobile, setMobile] = useState(member.mobile);
  const [dob, setDob] = useState(member.dob || "");
  const [addrP, setAddrP] = useState(member.addrPresent || "");
  const [addrPerm, setAddrPerm] = useState(member.addrPermanent || "");
  const [sameAddr, setSameAddr] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  async function uploadPhoto(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErr("Photo must be under 2 MB.");
      return;
    }
    setPhotoBusy(true);
    setErr("");
    setOk("");
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const path = `${member.teamId}.${ext}`;
      const {
        error: upErr
      } = await db.storage.from("member-photos").upload(path, file, {
        upsert: true,
        cacheControl: "3600"
      });
      if (upErr) throw upErr;
      const {
        data: {
          publicUrl
        }
      } = db.storage.from("member-photos").getPublicUrl(path);
      const bust = publicUrl + "?t=" + Date.now();
      const {
        data: {
          user
        }
      } = await db.auth.getUser();
      const {
        error: dbErr
      } = await db.from("members").update({
        photo_url: bust
      }).eq("auth_user_id", user.id);
      if (dbErr) throw dbErr;
      setPhotoUrl(bust);
      setOk("Photo uploaded!");
    } catch (e) {
      setErr(e.message || "Photo upload failed.");
    }
    setPhotoBusy(false);
  }
  async function removePhoto() {
    setPhotoBusy(true);
    setErr("");
    setOk("");
    try {
      const {
        data: {
          user
        }
      } = await db.auth.getUser();
      await db.from("members").update({
        photo_url: ""
      }).eq("auth_user_id", user.id);
      setPhotoUrl("");
      setOk("Photo removed.");
    } catch (e) {
      setErr(e.message || "Failed.");
    }
    setPhotoBusy(false);
  }
  async function save() {
    setBusy(true);
    setErr("");
    setOk("");
    try {
      const {
        data: {
          user
        }
      } = await db.auth.getUser();
      const {
        error: e1
      } = await db.from("members").update({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        date_of_birth: dob || null,
        address_present: addrP.trim(),
        address_permanent: (sameAddr ? addrP : addrPerm).trim()
      }).eq("auth_user_id", user.id);
      if (e1) throw e1;
      if (newPw.trim()) {
        if (newPw.length < 6) throw new Error("Password must be at least 6 characters.");
        const {
          error: e2
        } = await db.auth.updateUser({
          password: newPw.trim()
        });
        if (e2) throw e2;
      }
      setOk("Saved!");
      setNewPw("");
      onSaved();
    } catch (e) {
      setErr(e.message || "Failed.");
    }
    setBusy(false);
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
  }, member.group)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
      padding: "12px",
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 78,
      borderRadius: 6,
      background: "#161D26",
      border: "1px solid #1F2733",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: photoUrl,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      color: "#3A424D"
    }
  }, "?")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 500,
      marginBottom: 3
    }
  }, "ID Card Photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#5B6675",
      marginBottom: 8
    }
  }, "Passport style · Max 2 MB · JPG or PNG"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "btn",
    style: {
      background: "#1A2233",
      border: "1px solid #2A3A55",
      color: "#4F8CFF",
      borderRadius: 5,
      padding: "5px 12px",
      fontSize: 11.5,
      fontWeight: 600,
      cursor: "pointer",
      display: "inline-block"
    }
  }, photoBusy ? "Uploading…" : photoUrl ? "Change" : "Upload", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    disabled: photoBusy,
    onChange: e => {
      uploadPhoto(e.target.files[0]);
      e.target.value = "";
    },
    style: {
      display: "none"
    }
  })), photoUrl && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: removePhoto,
    disabled: photoBusy,
    style: {
      background: "none",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 5,
      padding: "5px 12px",
      fontSize: 11.5
    }
  }, "Remove")))), /*#__PURE__*/React.createElement(Field, {
    label: "Name"
  }, /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email (for notifications)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "your@email.com",
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Mobile"
  }, /*#__PURE__*/React.createElement("input", {
    value: mobile,
    onChange: e => setMobile(e.target.value),
    placeholder: "01XXXXXXXXX",
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Date of Birth"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: dob,
    onChange: e => setDob(e.target.value),
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Present Address"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: addrP,
    onChange: e => setAddrP(e.target.value),
    rows: "2",
    placeholder: "House, Road, Area, City",
    style: {
      ...iStyle,
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
      cursor: "pointer",
      fontSize: 12.5,
      color: "#8593A3"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: sameAddr,
    onChange: e => {
      setSameAddr(e.target.checked);
      if (e.target.checked) setAddrPerm(addrP);
    }
  }), "Permanent address is the same as present"), /*#__PURE__*/React.createElement(Field, {
    label: "Permanent Address"
  }, /*#__PURE__*/React.createElement("textarea", {
    value: sameAddr ? addrP : addrPerm,
    onChange: e => setAddrPerm(e.target.value),
    rows: "2",
    disabled: sameAddr,
    placeholder: "Village, Upazila, District",
    style: {
      ...iStyle,
      resize: "vertical",
      opacity: sameAddr ? 0.5 : 1
    }
  })), /*#__PURE__*/React.createElement(Field, {
    label: "New Password (leave blank to keep current)"
  }, /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: newPw,
    onChange: e => setNewPw(e.target.value),
    placeholder: "Min. 6 characters",
    style: iStyle
  })), err && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, err), ok && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#3ECF9A",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, ok), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      const q = new URLSearchParams({
        name: name.trim(),
        position: member.role || "",
        idno: member.teamId,
        teamname: member.group || "",
        team: "13860",
        contact: mobile.trim(),
        email: email.trim(),
        joined: member.joinedDate || "",
        photo: photoUrl || "",
        dob: dob || "",
        addrPresent: addrP || "",
        addrPermanent: (sameAddr ? addrP : addrPerm) || ""
      });
      window.open("id-card.html?" + q.toString(), "_blank");
    },
    style: {
      width: "100%",
      background: "#1A2233",
      border: "1px solid #2A3A55",
      color: "#4F8CFF",
      borderRadius: 6,
      padding: "10px 0",
      fontSize: 13.5,
      fontWeight: 600,
      marginBottom: 12
    }
  }, "Print ID Card"), /*#__PURE__*/React.createElement("div", {
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
    disabled: busy,
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
  }, busy ? "Saving…" : "Save Changes"))));
}

// ── Member profile view modal ─────────────────────────────────────────────
function MemberProfileModal({
  member,
  tasks,
  canManageMembers,
  onClose
}) {
  const myTasks = tasks.filter(t => t.member === member.name);
  return /*#__PURE__*/React.createElement("div", {
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
    onClick: onClose
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
  }, member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 18,
      fontWeight: 700
    }
  }, member.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8593A3",
      marginTop: 2
    }
  }, member.role, " · ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#4F8CFF"
    }
  }, member.group)))), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 18
    }
  }, "×")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 8,
      marginBottom: 18
    }
  }, [["Assigned", myTasks.length, "#E8EDF2"], ["Done", myTasks.filter(t => t.status === "Done").length, "#3ECF9A"], ["In Progress", myTasks.filter(t => t.status === "In Progress").length, "#4F8CFF"], ["Overdue", myTasks.filter(isOverdue).length, "#E85D5D"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
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
      color: c
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "#8593A3",
      marginTop: 2
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#0A0E14",
      border: "1px solid #1F2733",
      borderRadius: 8,
      padding: "14px 16px",
      marginBottom: 16
    }
  }, [["Team ID", member.teamId], ["Email", member.email || "—"], ["Mobile", member.mobile || "—"], ["Joined", fmtDate(member.joinedDate)]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
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
  }, l), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "#E8EDF2"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
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
  }, myTasks.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#3A424D",
      padding: "10px 0"
    }
  }, "No tasks assigned.") : myTasks.map(t => /*#__PURE__*/React.createElement("div", {
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
      color: S_COLOR[t.status],
      whiteSpace: "nowrap"
    }
  }, t.status))))));
}

// ── Main App ──────────────────────────────────────────────────────────────
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
  const [taskLog, setTaskLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [view, setView] = useState("tasks");
  const [search, setSearch] = useState("");
  const [mf, setMf] = useState("All");
  const [mtf, setMtf] = useState("All");
  const [sf, setSf] = useState("All");
  const [pf, setPf] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
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
  const [formErr, setFormErr] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [delId, setDelId] = useState(null);
  const [mModalOpen, setMModalOpen] = useState(false);
  const [mEditId, setMEditId] = useState(null);
  const [mForm, setMForm] = useState({
    name: "",
    email: "",
    mobile: "",
    teamId: "",
    role: "Member",
    group: "SPMT",
    joinedDate: ""
  });
  const [mFormErr, setMFormErr] = useState("");
  const [mFormBusy, setMFormBusy] = useState(false);
  const [mDelId, setMDelId] = useState(null);

  // Auth
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
      data: l
    } = db.auth.onAuthStateChange((_, session) => {
      setAuthUser(session?.user ?? null);
      setMemberChecked(false);
      setMemberError("");
    });
    return () => l.subscription.unsubscribe();
  }, []);

  // Auto-link member
  useEffect(() => {
    if (!authUser) {
      setCurrentMember(null);
      setMemberChecked(true);
      return;
    }
    setMemberChecked(false);
    db.rpc("link_or_get_member").then(async ({
      data,
      error
    }) => {
      if (data) {
        setCurrentMember(rowToMember(data));
        setMemberChecked(true);
        return;
      }
      const teamId = authUser.email.replace("@missionlog.app", "");
      const {
        error: ce
      } = await db.rpc("claim_membership", {
        p_team_id: teamId
      });
      if (!ce) {
        const {
          data: d2
        } = await db.rpc("link_or_get_member");
        setCurrentMember(d2 ? rowToMember(d2) : null);
      } else {
        setMemberError(ce.message);
      }
      setMemberChecked(true);
    });
  }, [authUser]);
  useEffect(() => {
    if (currentMember) loadAll();
  }, [currentMember]);
  useEffect(() => {
    if (view === "logs" && taskLog.length === 0) loadLog();
  }, [view]);
  async function loadAll() {
    setDataLoading(true);
    setDataError("");
    const [tr, mr] = await Promise.all([db.from("tasks").select("*").order("id"), db.from("members").select("*").order("group_name").order("name")]);
    if (tr.error || mr.error) {
      setDataError("Failed to load. Please refresh.");
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
  async function loadLog() {
    setLogLoading(true);
    const {
      data,
      error
    } = await db.from("task_log").select("*").order("action_at", {
      ascending: false
    }).limit(500);
    if (!error) setTaskLog(data || []);
    setLogLoading(false);
  }
  const canEdit = !!currentMember && (currentMember.group === "SPMT" || currentMember.group === "Faculty Advisors");
  const canManage = !!currentMember && currentMember.group === "SPMT";
  const canFinance = !!currentMember && (currentMember.group === "SPMT" || currentMember.isFinanceOfficer === true);

  // Filtering — no useMemo to avoid stale closure issues
  const filtered = tasks.filter(t => {
    if (t.status === "Done" && sf !== "Done") return false;
    if (mf !== "All" && t.member !== mf) return false;
    if (mtf !== "All" && t.meetingId !== mtf) return false;
    if (sf !== "All" && t.status !== sf) return false;
    if (pf !== "All" && t.priority !== pf) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!((t.task || "") + " " + (t.member || "") + " " + (t.remarks || "") + " " + (t.meetingId || "")).toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "To Do").length,
    ip: tasks.filter(t => t.status === "In Progress").length,
    done: tasks.filter(t => t.status === "Done").length,
    overdue: tasks.filter(isOverdue).length
  };
  const memberNames = [...new Set(tasks.map(t => t.member).filter(Boolean))].sort();
  const meetings = [...new Set(tasks.map(t => t.meetingId).filter(Boolean))].sort();
  const byGroup = {};
  members.forEach(m => {
    (byGroup[m.group] = byGroup[m.group] || []).push(m);
  });
  const known = new Set(members.map(m => m.name));
  const legacy = [...new Set(tasks.map(t => t.member))].filter(n => n && !known.has(n));
  async function nextCode() {
    const {
      data
    } = await db.from("tasks").select("task_code").order("id", {
      ascending: false
    }).limit(1);
    if (!data || !data.length) return 1;
    const n = parseInt((data[0].task_code || "").replace(/^T/i, ""), 10);
    return isNaN(n) ? 1 : n + 1;
  }
  async function saveTask(f) {
    setFormBusy(true);
    setFormErr("");
    try {
      if (editId !== null) {
        const {
          error
        } = await db.from("tasks").update({
          member: f.member.trim(),
          meeting_id: f.meetingId,
          task: f.task.trim(),
          assigned_date: f.assignedDate || null,
          deadline: f.deadline || null,
          status: f.status,
          priority: f.priority,
          remarks: (f.remarks || "").trim()
        }).eq("id", editId);
        if (error) throw error;
      } else {
        let num = await nextCode();
        for (const name of f.members) {
          const {
            error
          } = await db.from("tasks").insert({
            task_code: "T" + String(num).padStart(3, "0"),
            member: name,
            meeting_id: f.meetingId,
            task: f.task.trim(),
            assigned_date: f.assignedDate || null,
            deadline: f.deadline || null,
            status: f.status,
            priority: f.priority,
            remarks: (f.remarks || "").trim()
          });
          if (error) throw error;
          num++;
        }
      }
      setModalOpen(false);
      await reloadTasks();
    } catch (e) {
      setFormErr(e.message || "Failed.");
    }
    setFormBusy(false);
  }
  async function deleteTask(id) {
    await db.from("tasks").delete().eq("id", id);
    setDelId(null);
    await reloadTasks();
  }
  async function updateStatus(id, status) {
    await db.from("tasks").update({
      status
    }).eq("id", id);
    setTasks(p => p.map(t => t.id === id ? {
      ...t,
      status
    } : t));
  }
  async function updatePriority(id, priority) {
    if (!canEdit) return;
    await db.from("tasks").update({
      priority
    }).eq("id", id);
    setTasks(p => p.map(t => t.id === id ? {
      ...t,
      priority
    } : t));
  }
  async function saveMember(f) {
    setMFormBusy(true);
    setMFormErr("");
    try {
      const payload = {
        name: f.name.trim(),
        email: (f.email || "").trim(),
        mobile: (f.mobile || "").trim(),
        team_id: f.teamId.trim(),
        role: (f.role || "").trim(),
        group_name: f.group,
        joined_date: f.joinedDate || null
      };
      let error;
      if (mEditId !== null) {
        ({
          error
        } = await db.from("members").update(payload).eq("id", mEditId));
      } else {
        ({
          error
        } = await db.from("members").insert(payload));
      }
      if (error) throw error;
      setMModalOpen(false);
      await reloadMembers();
    } catch (e) {
      setMFormErr(e.message || "Failed.");
    }
    setMFormBusy(false);
  }
  async function deleteMember(id) {
    await db.from("members").delete().eq("id", id);
    setMDelId(null);
    await reloadMembers();
  }

  // ── Guards ──
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
  if (!authUser) return /*#__PURE__*/React.createElement(LoginScreen, null);
  if (!memberChecked) return spinner;
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
  }, memberError), /*#__PURE__*/React.createElement("button", {
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
  if (!currentMember) return spinner;
  if (dataLoading) return spinner;
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
    onClick: loadAll,
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
  }), financeOpen && canFinance && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "#0A0E14",
      zIndex: 90,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "24px 24px 60px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 11,
      letterSpacing: 2,
      color: "#3ECF9A",
      marginBottom: 6
    }
  }, "FINANCE MODULE"), /*#__PURE__*/React.createElement("div", {
    className: "disp",
    style: {
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: -0.5
    }
  }, "Finance"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "#8593A3",
      marginTop: 4
    }
  }, "Salary · TA-DA · Committee · Deputation · Other Payments")), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setFinanceOpen(false),
    style: {
      background: "#1A222D",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "9px 16px",
      fontSize: 13
    }
  }, "← Back to Tasks")), /*#__PURE__*/React.createElement(FinanceView, {
    currentMember: currentMember,
    members: members,
    canManage: canManage
  }))), viewMember && /*#__PURE__*/React.createElement(MemberProfileModal, {
    member: viewMember,
    tasks: tasks,
    canManageMembers: canManage,
    onClose: () => setViewMember(null)
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
      color: canEdit ? "#3ECF9A" : "#8593A3"
    }
  }, canEdit ? "Editor" : "Viewer", " · ", currentMember.group)), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setProfileOpen(true),
    style: {
      background: "#1A222D",
      border: "1px solid #1F2733",
      color: "#8593A3",
      borderRadius: 6,
      padding: "10px 14px",
      fontSize: 12.5
    }
  }, "Profile"), canFinance && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setFinanceOpen(true),
    style: {
      background: "#0D2A1A",
      border: "1px solid #3ECF9A44",
      color: "#3ECF9A",
      borderRadius: 6,
      padding: "10px 14px",
      fontSize: 12.5,
      fontWeight: 600
    }
  }, "Finance"), canManage && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setMForm({
        name: "",
        email: "",
        mobile: "",
        teamId: "",
        role: "Member",
        group: "SPMT",
        joinedDate: ""
      });
      setMEditId(null);
      setMFormErr("");
      setMModalOpen(true);
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
  }, "+ Add Member"), canEdit && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setForm({
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
      setEditId(null);
      setFormErr("");
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
      gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
      gap: 10,
      marginBottom: 20
    }
  }, [["Total", stats.total, "#E8EDF2"], ["To Do", stats.todo, S_COLOR["To Do"]], ["In Progress", stats.ip, S_COLOR["In Progress"]], ["Done", stats.done, S_COLOR["Done"]], ["Overdue", stats.overdue, "#E85D5D"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
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
      fontSize: 22,
      fontWeight: 700,
      color: c
    }
  }, v)))), !currentMember.email && canEdit && /*#__PURE__*/React.createElement("div", {
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
  }), /*#__PURE__*/React.createElement(Sel, {
    value: mf,
    onChange: setMf,
    options: ["All", ...memberNames]
  }), /*#__PURE__*/React.createElement(Sel, {
    value: mtf,
    onChange: setMtf,
    options: ["All", ...meetings],
    prefix: "Meeting "
  }), /*#__PURE__*/React.createElement(Sel, {
    value: sf,
    onChange: setSf,
    options: ["All", ...STATUSES]
  }), /*#__PURE__*/React.createElement(Sel, {
    value: pf,
    onChange: setPf,
    options: ["All", ...PRIORITIES]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: "#121821",
      border: "1px solid #1F2733",
      borderRadius: 6,
      overflow: "hidden"
    }
  }, ["tasks", "board", "members", ...(canManage ? ["logs"] : [])].map(v => /*#__PURE__*/React.createElement("button", {
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
  }, v[0].toUpperCase() + v.slice(1))))), view === "tasks" && /*#__PURE__*/React.createElement("div", {
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
    const ov = isOverdue(t);
    const canSt = canEdit || currentMember && t.member === currentMember.name;
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
        color: ov ? "#E85D5D" : "#8593A3"
      }
    }, fmtDate(t.deadline), ov ? " ⚠" : ""), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "8px 12px"
      }
    }, canSt ? /*#__PURE__*/React.createElement("select", {
      value: t.status,
      onChange: e => updateStatus(t.id, e.target.value),
      style: {
        background: "#0A0E14",
        border: "1px solid " + S_COLOR[t.status] + "55",
        color: S_COLOR[t.status],
        borderRadius: 5,
        padding: "4px 6px",
        fontSize: 12
      }
    }, STATUSES.map(s => /*#__PURE__*/React.createElement("option", {
      key: s
    }, s))) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: S_COLOR[t.status],
        fontSize: 12.5
      }
    }, t.status)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "8px 12px"
      }
    }, canEdit ? /*#__PURE__*/React.createElement("select", {
      value: t.priority,
      onChange: e => updatePriority(t.id, e.target.value),
      style: {
        background: "#0A0E14",
        border: "1px solid " + P_COLOR[t.priority] + "55",
        color: P_COLOR[t.priority],
        borderRadius: 5,
        padding: "4px 6px",
        fontSize: 12
      }
    }, PRIORITIES.map(p => /*#__PURE__*/React.createElement("option", {
      key: p
    }, p))) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: P_COLOR[t.priority],
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
    }, canEdit && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: () => {
        setForm({
          member: t.member,
          members: [],
          meetingId: t.meetingId,
          task: t.task,
          assignedDate: t.assignedDate || "",
          deadline: t.deadline || "",
          status: t.status,
          priority: t.priority,
          remarks: t.remarks || ""
        });
        setEditId(t.id);
        setFormErr("");
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
      onClick: () => setDelId(t.id),
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
  }, tasks.length === 0 ? "No tasks yet. Click + New Task to add one." : "No tasks match these filters."), sf !== "Done" && tasks.filter(t => t.status === "Done").length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "10px 0 14px",
      fontSize: 12,
      color: "#5B6675"
    }
  }, tasks.filter(t => t.status === "Done").length, " completed task", tasks.filter(t => t.status === "Done").length > 1 ? "s" : "", " hidden —", " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#4F8CFF",
      cursor: "pointer"
    },
    onClick: () => setSf("Done")
  }, "show completed"))), view === "board" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
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
      background: S_COLOR[status]
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
    const ov = isOverdue(t);
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: canEdit ? "btn" : "",
      onClick: canEdit ? () => {
        setForm({
          member: t.member,
          members: [],
          meetingId: t.meetingId,
          task: t.task,
          assignedDate: t.assignedDate || "",
          deadline: t.deadline || "",
          status: t.status,
          priority: t.priority,
          remarks: t.remarks || ""
        });
        setEditId(t.id);
        setFormErr("");
        setModalOpen(true);
      } : undefined,
      style: {
        background: "#121821",
        border: "1px solid #1F2733",
        borderLeft: "3px solid " + P_COLOR[t.priority],
        padding: "10px 12px",
        cursor: canEdit ? "pointer" : "default"
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
        color: ov ? "#E85D5D" : "#5B6675"
      }
    }, "Due ", fmtDate(t.deadline), ov ? " · overdue" : ""));
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
  }, ["Team ID", "Name", "Group", "Email", "Phone", "Joined", "To Do", "In Progress", "Overdue", "Done", ""].map(h => /*#__PURE__*/React.createElement("th", {
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
    onClick: () => setViewMember(m),
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
      color: "#8593A3",
      maxWidth: 160,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
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
      color: S_COLOR["To Do"]
    }
  }, tasks.filter(t => t.member === m.name && t.status === "To Do").length), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: S_COLOR["In Progress"]
    }
  }, tasks.filter(t => t.member === m.name && t.status === "In Progress").length), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: "#E85D5D"
    }
  }, tasks.filter(t => t.member === m.name && isOverdue(t)).length), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: S_COLOR["Done"]
    }
  }, tasks.filter(t => t.member === m.name && t.status === "Done").length), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      whiteSpace: "nowrap"
    },
    onClick: e => e.stopPropagation()
  }, canManage && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => {
      setMForm({
        name: m.name,
        email: m.email || "",
        mobile: m.mobile || "",
        teamId: m.teamId,
        role: m.role || "Member",
        group: m.group,
        joinedDate: m.joinedDate || "",
        isFinanceOfficer: m.isFinanceOfficer || false
      });
      setMEditId(m.id);
      setMFormErr("");
      setMModalOpen(true);
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
    onClick: () => setMDelId(m.id),
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
  }, "No members yet.")), view === "logs" && canManage && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
    onClick: loadLog,
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
  }, "Loading…") : /*#__PURE__*/React.createElement("div", {
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
  }, ["Date & Time", "Code", "Member", "Task", "Status", "Action", "By"].map(h => /*#__PURE__*/React.createElement("th", {
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
    colSpan: "7",
    style: {
      padding: "60px 0",
      textAlign: "center",
      color: "#5B6675"
    }
  }, "No log entries yet. They appear once tasks are created or changed.")) : taskLog.map(l => {
    const ac = l.action === "created" ? "#3ECF9A" : l.action === "deleted" ? "#E85D5D" : "#4F8CFF";
    return /*#__PURE__*/React.createElement("tr", {
      key: l.id,
      className: "rowhover",
      style: {
        borderTop: "1px solid #1F2733",
        opacity: l.action === "deleted" ? 0.6 : 1
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "mono",
      style: {
        padding: "9px 12px",
        color: "#5B6675",
        whiteSpace: "nowrap",
        fontSize: 11
      }
    }, fmtDateTime(l.action_at)), /*#__PURE__*/React.createElement("td", {
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
        color: S_COLOR[l.status] || "#8593A3"
      }
    }, l.status), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "9px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        background: ac + "22",
        color: ac,
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
  })))))), modalOpen && /*#__PURE__*/React.createElement("div", {
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
  }, editId !== null ? "Edit Task" : "New Task"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setModalOpen(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), editId !== null ? /*#__PURE__*/React.createElement(Field, {
    label: "Member"
  }, /*#__PURE__*/React.createElement("select", {
    value: form.member,
    onChange: e => setForm({
      ...form,
      member: e.target.value
    }),
    style: iStyle
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "— Select member —"), GROUPS.map(g => byGroup[g]?.length ? /*#__PURE__*/React.createElement("optgroup", {
    key: g,
    label: g
  }, byGroup[g].map(m => /*#__PURE__*/React.createElement("option", {
    key: m.id,
    value: m.name
  }, m.name, " (", m.teamId, ")"))) : null), legacy.length ? /*#__PURE__*/React.createElement("optgroup", {
    label: "Other"
  }, legacy.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n))) : null)) : /*#__PURE__*/React.createElement(Field, {
    label: "Assign to"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid #1F2733",
      borderRadius: 6,
      maxHeight: 200,
      overflowY: "auto",
      background: "#0A0E14"
    }
  }, GROUPS.map(g => byGroup[g]?.length ? /*#__PURE__*/React.createElement("div", {
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
  }, g), byGroup[g].map(m => /*#__PURE__*/React.createElement("label", {
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
    checked: form.members.includes(m.name),
    onChange: e => setForm(p => ({
      ...p,
      members: e.target.checked ? [...p.members, m.name] : p.members.filter(n => n !== m.name)
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
  }, m.teamId)))) : null)), form.members.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 11.5,
      color: "#4F8CFF"
    }
  }, form.members.length, " member", form.members.length > 1 ? "s" : "", " selected — ", form.members.length, " task", form.members.length > 1 ? "s" : "", " will be created")), /*#__PURE__*/React.createElement(Field, {
    label: "Meeting ID"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.meetingId,
    onChange: e => setForm({
      ...form,
      meetingId: e.target.value
    }),
    placeholder: "e.g. 010",
    style: iStyle
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
      ...iStyle,
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
    style: iStyle
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
    style: iStyle
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
    style: iStyle
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
    style: iStyle
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
      ...iStyle,
      resize: "vertical"
    }
  })), formErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, formErr), /*#__PURE__*/React.createElement("div", {
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
    disabled: formBusy,
    onClick: () => {
      if (editId !== null) {
        if (!form.member || !form.task.trim()) {
          setFormErr("Member and Task required.");
          return;
        }
      } else {
        if (form.members.length === 0 || !form.task.trim()) {
          setFormErr("Select at least one member and enter a task.");
          return;
        }
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
  }, formBusy ? "Saving…" : editId !== null ? "Save Changes" : form.members.length > 1 ? `Add ${form.members.length} Tasks` : "Add Task")))), delId !== null && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setDelId(null)
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
    onClick: () => setDelId(null),
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
    onClick: () => deleteTask(delId),
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
  }, "Delete")))), mModalOpen && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setMModalOpen(false)
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
  }, mEditId !== null ? "Edit Member" : "Add Member"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setMModalOpen(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(Field, {
    label: "Name"
  }, /*#__PURE__*/React.createElement("input", {
    value: mForm.name,
    onChange: e => setMForm({
      ...mForm,
      name: e.target.value
    }),
    placeholder: "e.g. Shahrukh Khan",
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: mForm.email,
    onChange: e => setMForm({
      ...mForm,
      email: e.target.value
    }),
    placeholder: "name@example.com",
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Mobile"
  }, /*#__PURE__*/React.createElement("input", {
    value: mForm.mobile,
    onChange: e => setMForm({
      ...mForm,
      mobile: e.target.value
    }),
    placeholder: "01XXXXXXXXX",
    style: iStyle
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
    value: mForm.teamId,
    onChange: e => setMForm({
      ...mForm,
      teamId: e.target.value
    }),
    placeholder: "26-13860-0605",
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Group",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: mForm.group,
    onChange: e => setMForm({
      ...mForm,
      group: e.target.value
    }),
    style: iStyle
  }, GROUPS.map(g => /*#__PURE__*/React.createElement("option", {
    key: g
  }, g))))), /*#__PURE__*/React.createElement(Field, {
    label: "Role"
  }, /*#__PURE__*/React.createElement("input", {
    value: mForm.role,
    onChange: e => setMForm({
      ...mForm,
      role: e.target.value
    }),
    placeholder: "e.g. RA, SPM, ASPM",
    style: iStyle
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Joined Date"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: mForm.joinedDate,
    onChange: e => setMForm({
      ...mForm,
      joinedDate: e.target.value
    }),
    style: iStyle
  })), canManage && /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
      cursor: "pointer",
      borderTop: "1px solid #1F2733",
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: mForm.isFinanceOfficer || false,
    onChange: e => setMForm({
      ...mForm,
      isFinanceOfficer: e.target.checked
    })
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, "Finance Officer"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "#5B6675"
    }
  }, "Can access Finance tab, add payments and mark as paid"))), mFormErr && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#E85D5D",
      fontSize: 12.5,
      marginBottom: 10
    }
  }, mFormErr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setMModalOpen(false),
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
    disabled: mFormBusy,
    onClick: () => {
      if (!mForm.name.trim() || !mForm.teamId.trim()) {
        setMFormErr("Name and Team ID required.");
        return;
      }
      saveMember(mForm);
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
  }, mFormBusy ? "Saving…" : mEditId !== null ? "Save Changes" : "Add Member")))), mDelId !== null && /*#__PURE__*/React.createElement("div", {
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
    onClick: () => setMDelId(null)
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
  }, "Remove this member?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setMDelId(null),
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
    onClick: () => deleteMember(mDelId),
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