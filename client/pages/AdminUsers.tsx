import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersAPI, getToken, checkBackendAvailability } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";

import SiteHeader from "@/components/SiteHeader";

function UserPasswordReset({
  onSave,
  saving,
}: {
  onSave: (pwd: string) => void;
  saving: boolean;
}) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const valid = pwd.length >= 6 && confirm.length >= 6 && pwd === confirm;
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 items-end gap-2">
      <div className="sm:col-span-1">
        <Label>New Password</Label>
        <Input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="min 6 chars"
        />
      </div>
      <div className="sm:col-span-1">
        <Label>Confirm Password</Label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="repeat password"
        />
        {pwd && confirm && pwd !== confirm && (
          <div className="text-xs text-red-600 mt-1">
            Passwords do not match
          </div>
        )}
      </div>
      <div>
        <Button
          onClick={() => valid && onSave(pwd)}
          disabled={!valid || saving}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsersPage({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const { isAuthenticated } = useAdmin();
  const qc = useQueryClient();

  const { data: backendAvailable } = useQuery({
    queryKey: ["backend-available"],
    queryFn: () => checkBackendAvailability(),
    staleTime: 30000,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        return await adminUsersAPI.list();
      } catch (e) {
        return { users: [] } as any;
      }
    },
    enabled: !!backendAvailable && isAuthenticated && !!getToken(),
    retry: 0,
  });

  const createMutation = useMutation({
    mutationFn: (input: {
      username: string;
      password: string;
      role: "owner" | "admin" | "user";
    }) => adminUsersAPI.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      id: string;
      input: {
        password?: string;
        role?: "owner" | "admin" | "user";
        is_active?: boolean;
      };
    }) => adminUsersAPI.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminUsersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "user" as const,
  });
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  if (!isAuthenticated)
    return <div className="p-6">Please login as admin.</div>;
  // Basic client-side guard: only allow admins/owners to see this page
  if ((useAdmin().user?.role || "user") === "user")
    return <div className="p-6">Admin access required.</div>;

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {showHeader && <SiteHeader showQuickLinks />}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-ucla-blue">
          User Management
        </h1>

        <div className="p-4 border rounded-lg space-y-3 bg-white dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-medium dark:text-slate-100">Create User</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="dark:text-slate-200">Username</Label>
              <Input
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                placeholder="alphanumeric 3-32"
              />
            </div>
            <div>
              <Label className="dark:text-slate-200">Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="min 6 chars"
              />
            </div>
            <div className="flex items-end gap-2">
              <select
                className="border rounded px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-50"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value as any })
                }
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="owner">owner</option>
              </select>
              <Button
                onClick={() => createMutation.mutate(newUser)}
                disabled={
                  createMutation.isPending ||
                  !newUser.username ||
                  !newUser.password
                }
                className="bg-ucla-blue"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
          {createMutation.error && (
            <div className="text-sm text-red-600">
              {(createMutation.error as any).message || "Error creating user"}
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-medium mb-3 dark:text-slate-100">
            Existing Users
          </h2>
          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-600">Failed to load users</div>}
          <div className="space-y-2">
            {data?.users?.map((u) => (
              <div
                key={u.id}
                className="border rounded px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="space-x-3">
                    <span className="font-mono dark:text-slate-100">
                      {u.username}
                    </span>
                    <span className="text-xs border rounded px-2 py-0.5 bg-gray-100 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-100">
                      {u.role}
                    </span>
                    <span
                      className={`text-xs ml-2 ${u.is_active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}
                    >
                      {u.is_active ? "active" : "inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {u.role !== "owner" && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateMutation.mutate({
                            id: u.id,
                            input: {
                              role: u.role === "admin" ? "user" : "admin",
                            },
                          })
                        }
                      >
                        {u.role === "admin"
                          ? "Demote to user"
                          : "Promote to admin"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateMutation.mutate({
                          id: u.id,
                          input: { is_active: !u.is_active },
                        })
                      }
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResetFor(resetFor === u.id ? null : u.id);
                        setResetPassword("");
                      }}
                    >
                      Reset Password
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(u.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {resetFor === u.id && (
                  <UserPasswordReset
                    onSave={(pwd) => {
                      updateMutation.mutate({
                        id: u.id,
                        input: { password: pwd },
                      });
                      setResetFor(null);
                      setResetPassword("");
                    }}
                    saving={updateMutation.isPending}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
