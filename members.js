// members.js — Members module for Mission Log
// Loaded before app.js. Defines global MembersView + MemberProfileModal.
// Module-scope helpers (outside components) so inputs keep focus while typing.

const MEM_GROUPS = ["SPMT", "Faculty Advisors", "RA", "Other Officer", "Staff", "Student", "UATFS"];
const MEM_S_COLOR = {
  "To Do": "#8593A3",
  "In Progress": "#4F8CFF",
  "Done": "#3ECF9A"
};
const memIStyle = {
  width: "100%",
  background: "#0A0E14",
  border: "1px solid #1F2733",
  borderRadius: 6,
  padding: "8px 10px",
  color: "#E8EDF2",
  fontSize: 13
};
function MemField({
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
function memFmtDate(s) {
  if (!s) return "—";
  const d = new Date(s + "T00:00:00");
  if (isNaN(d)) return s;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function memIsOverdue(t) {
  if (!t.deadline || t.status === "Done") return false;
  const d = new Date(t.deadline + "T00:00:00");
  return !isNaN(d) && d < new Date();
}

// ── Member profile view modal ─────────────────────────────────────────────
function MemberProfileModal({
  member,
  tasks,
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
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      fontWeight: 700,
      color: "#4F8CFF",
      flexShrink: 0
    }
  }, member.photoUrl ? /*#__PURE__*/React.createElement("img", {
    src: member.photoUrl,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
  }, [["Assigned", myTasks.length, "#E8EDF2"], ["Done", myTasks.filter(t => t.status === "Done").length, "#3ECF9A"], ["In Progress", myTasks.filter(t => t.status === "In Progress").length, "#4F8CFF"], ["Overdue", myTasks.filter(memIsOverdue).length, "#E85D5D"]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
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
  }, [["Team ID", member.teamId], ["Email", member.email || "—"], ["Mobile", member.mobile || "—"], ["Date of Birth", memFmtDate(member.dob)], ["Joined", memFmtDate(member.joinedDate)]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
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
  }, v))), member.addrPresent && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5B6675",
      marginBottom: 3
    }
  }, "Present Address"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#E8EDF2",
      lineHeight: 1.5
    }
  }, member.addrPresent)), member.addrPermanent && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#5B6675",
      marginBottom: 3
    }
  }, "Permanent Address"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#E8EDF2",
      lineHeight: 1.5
    }
  }, member.addrPermanent))), /*#__PURE__*/React.createElement("div", {
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
      color: MEM_S_COLOR[t.status],
      whiteSpace: "nowrap"
    }
  }, t.status))))));
}

// ── Members table + add/edit/delete ───────────────────────────────────────
const MembersView = ({
  members,
  tasks,
  canManage,
  onReload
}) => {
  const {
    useState
  } = React;
  const [viewMember, setViewMember] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    teamId: "",
    role: "Member",
    group: "SPMT",
    joinedDate: "",
    isFinanceOfficer: false
  });
  const [formErr, setFormErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [delId, setDelId] = useState(null);
  function openAdd() {
    setForm({
      name: "",
      email: "",
      mobile: "",
      teamId: "",
      role: "Member",
      group: "SPMT",
      joinedDate: "",
      isFinanceOfficer: false
    });
    setEditId(null);
    setFormErr("");
    setModalOpen(true);
  }
  function openEdit(m) {
    setForm({
      name: m.name,
      email: m.email || "",
      mobile: m.mobile || "",
      teamId: m.teamId,
      role: m.role || "Member",
      group: m.group,
      joinedDate: m.joinedDate || "",
      isFinanceOfficer: m.isFinanceOfficer || false
    });
    setEditId(m.id);
    setFormErr("");
    setModalOpen(true);
  }
  async function save() {
    if (!form.name.trim() || !form.teamId.trim()) {
      setFormErr("Name and Team ID required.");
      return;
    }
    setBusy(true);
    setFormErr("");
    try {
      const payload = {
        name: form.name.trim(),
        email: (form.email || "").trim(),
        mobile: (form.mobile || "").trim(),
        team_id: form.teamId.trim(),
        role: (form.role || "").trim(),
        group_name: form.group,
        joined_date: form.joinedDate || null,
        is_finance_officer: form.isFinanceOfficer || false
      };
      let error;
      if (editId !== null) {
        ({
          error
        } = await db.from("members").update(payload).eq("id", editId));
      } else {
        ({
          error
        } = await db.from("members").insert(payload));
      }
      if (error) throw error;
      setModalOpen(false);
      await onReload();
    } catch (e) {
      setFormErr(e.message || "Failed.");
    }
    setBusy(false);
  }
  async function remove(id) {
    await db.from("members").delete().eq("id", id);
    setDelId(null);
    await onReload();
  }
  const count = (name, status) => status ? tasks.filter(t => t.member === name && t.status === status).length : tasks.filter(t => t.member === name && memIsOverdue(t)).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, viewMember && /*#__PURE__*/React.createElement(MemberProfileModal, {
    member: viewMember,
    tasks: tasks,
    onClose: () => setViewMember(null)
  }), canManage && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: openAdd,
    style: {
      background: "transparent",
      color: "#4F8CFF",
      border: "1px solid #2A3A55",
      borderRadius: 6,
      padding: "8px 16px",
      fontSize: 13,
      fontWeight: 600
    }
  }, "+ Add Member")), /*#__PURE__*/React.createElement("div", {
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
  }, " (", m.role, ")") : null, m.isFinanceOfficer && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      background: "#0D2A1A",
      color: "#3ECF9A",
      borderRadius: 3,
      padding: "1px 6px",
      fontSize: 10,
      fontWeight: 600
    }
  }, "FIN")), /*#__PURE__*/React.createElement("td", {
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
  }, memFmtDate(m.joinedDate)), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: MEM_S_COLOR["To Do"]
    }
  }, count(m.name, "To Do")), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: MEM_S_COLOR["In Progress"]
    }
  }, count(m.name, "In Progress")), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: "#E85D5D"
    }
  }, count(m.name, null)), /*#__PURE__*/React.createElement("td", {
    className: "mono",
    style: {
      padding: "10px 12px",
      color: MEM_S_COLOR["Done"]
    }
  }, count(m.name, "Done")), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 12px",
      whiteSpace: "nowrap"
    },
    onClick: e => e.stopPropagation()
  }, canManage && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => openEdit(m),
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
    onClick: () => setDelId(m.id),
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
  }, "No members yet.")), modalOpen && /*#__PURE__*/React.createElement("div", {
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
  }, editId !== null ? "Edit Member" : "Add Member"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: () => setModalOpen(false),
    style: {
      background: "none",
      border: "none",
      color: "#8593A3",
      fontSize: 16
    }
  }, "×")), /*#__PURE__*/React.createElement(MemField, {
    label: "Name"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.name,
    onChange: e => setForm({
      ...form,
      name: e.target.value
    }),
    placeholder: "e.g. Shahrukh Khan",
    style: memIStyle
  })), /*#__PURE__*/React.createElement(MemField, {
    label: "Email"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: form.email,
    onChange: e => setForm({
      ...form,
      email: e.target.value
    }),
    placeholder: "name@example.com",
    style: memIStyle
  })), /*#__PURE__*/React.createElement(MemField, {
    label: "Mobile"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.mobile,
    onChange: e => setForm({
      ...form,
      mobile: e.target.value
    }),
    placeholder: "01XXXXXXXXX",
    style: memIStyle
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MemField, {
    label: "Team ID",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: form.teamId,
    onChange: e => setForm({
      ...form,
      teamId: e.target.value
    }),
    placeholder: "26-13860-0605",
    style: memIStyle
  })), /*#__PURE__*/React.createElement(MemField, {
    label: "Group",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: form.group,
    onChange: e => setForm({
      ...form,
      group: e.target.value
    }),
    style: memIStyle
  }, MEM_GROUPS.map(g => /*#__PURE__*/React.createElement("option", {
    key: g
  }, g))))), /*#__PURE__*/React.createElement(MemField, {
    label: "Role"
  }, /*#__PURE__*/React.createElement("input", {
    value: form.role,
    onChange: e => setForm({
      ...form,
      role: e.target.value
    }),
    placeholder: "e.g. RA, SPM, Head of UATFS",
    style: memIStyle
  })), /*#__PURE__*/React.createElement(MemField, {
    label: "Joined Date"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: form.joinedDate,
    onChange: e => setForm({
      ...form,
      joinedDate: e.target.value
    }),
    style: memIStyle
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
    checked: form.isFinanceOfficer || false,
    onChange: e => setForm({
      ...form,
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
  }, "Can access Finance, add payments and mark as paid"))), formErr && /*#__PURE__*/React.createElement("div", {
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
    disabled: busy,
    onClick: save,
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
  }, busy ? "Saving…" : editId !== null ? "Save Changes" : "Add Member")))), delId !== null && /*#__PURE__*/React.createElement("div", {
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
  }, "Remove this member? Tasks assigned to them keep their name as text."), /*#__PURE__*/React.createElement("div", {
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
    onClick: () => remove(delId),
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
window.MembersView = MembersView;