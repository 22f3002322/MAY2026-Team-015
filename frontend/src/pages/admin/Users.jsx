import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import useAuthStore from "../../store/authStore";

const Users = () => {
  const { backendRole } = useAuthStore();
  const isCommittee = String(backendRole || "").toLowerCase() === "committee";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await useAuthStore.getState().fetchUsers({
      role: roleFilter || undefined,
      is_verified: statusFilter === "verified" ? true : statusFilter === "unverified" ? false : undefined,
      is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      search: search || undefined,
    });
    if (res.success) {
      setUsers(res.data);
    } else {
      toast.error(res.message || "Failed to load users.");
    }
    setLoading(false);
  }, [roleFilter, statusFilter, search]);

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      fetchUsers();
    }
  }, [fetchUsers]);

  const handleDeactivate = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    const res = await useAuthStore.getState().deactivateUser(userId);
    if (res.success) {
      toast.success(res.message || "User deactivated.");
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, is_active: false } : u)));
    } else {
      toast.error(res.message || "Failed to deactivate user.");
    }
    setActionLoading((prev) => ({ ...prev, [userId]: false }));
  };

  const handleReactivate = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    const res = await useAuthStore.getState().reactivateUser(userId);
    if (res.success) {
      toast.success(res.message || "User reactivated.");
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, is_active: true } : u)));
    } else {
      toast.error(res.message || "Failed to reactivate user.");
    }
    setActionLoading((prev) => ({ ...prev, [userId]: false }));
  };

  const roleBadgeVariant = (role) => {
    switch (role) {
      case "Admin":
        return "danger";
      case "Committee":
        return "warning";
      case "Resident":
        return "default";
      case "Security":
        return "info";
      case "Maintenance":
        return "secondary";
      default:
        return "default";
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{row.full_name || "—"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <Badge variant={roleBadgeVariant(row.role)}>{row.role}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.is_active ? "success" : "danger"}>{row.is_active ? "Active" : "Inactive"}</Badge>
          <Badge variant={row.is_verified ? "success" : "warning"}>{row.is_verified ? "Verified" : "Unverified"}</Badge>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => row.phone || "—",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.is_active ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeactivate(row.user_id)}
              loading={actionLoading[row.user_id]}
              disabled={row.role === "Admin"}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReactivate(row.user_id)}
              loading={actionLoading[row.user_id]}
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const verified = users.filter((u) => u.is_verified).length;
    const pending = users.filter((u) => !u.is_verified).length;
    return [
      { title: "Total Users", value: total },
      { title: "Active", value: active },
      { title: "Verified", value: verified },
      { title: "Pending", value: pending },
    ];
  }, [users]);

  return (
    <Layout title="Users" breadcrumb={["Home", "Users"]}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      {isCommittee && (
        <div className="mt-6 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> As a Committee member, you cannot deactivate Admin accounts or manage other Committee members.
        </div>
      )}

      <Card
        title="User Directory"
        subtitle="Search and manage user accounts"
        className="mt-6"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Committee">Committee</option>
              <option value="Resident">Resident</option>
              <option value="Security">Security</option>
              <option value="Maintenance">Maintenance</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </Select>
            <Button onClick={fetchUsers} loading={loading}>
              Search
            </Button>
          </div>
        }
      >
        <Table columns={columns} data={users} loading={loading} />
      </Card>
    </Layout>
  );
};

export default Users;
