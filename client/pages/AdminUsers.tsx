import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUsersAPI, getToken, checkBackendAvailability } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";

import SiteHeader from "@/components/SiteHeader";

export default function AdminUsersPage() {
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
    mutationFn: (input: { username: string; password: string; role: "owner" | "admin" | "user" }) =>
      adminUsersAPI.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; input: { role?: "owner" | "admin" | "user"; is_active?: boolean } }) =>
      adminUsersAPI.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminUsersAPI.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" as const });

  if (!isAuthenticated) return <div className="p-6">Please login as admin.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader showQuickLinks />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-ucla-blue">User Management</h1>

      <div className="p-4 border rounded-lg space-y-3">
        <h2 className="font-medium">Create User</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Username</Label>
            <Input
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              placeholder="alphanumeric 3-32"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="min 6 chars"
            />
          </div>
          <div className="flex items-end gap-2">
            <select
              className="border rounded px-3 py-2"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <Button
              onClick={() => createMutation.mutate(newUser)}
              disabled={createMutation.isPending || !newUser.username || !newUser.password}
              className="bg-ucla-blue"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
        {createMutation.error && (
          <div className="text-sm text-red-600">{(createMutation.error as any).message || "Error creating user"}</div>
        )}
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="font-medium mb-3">Existing Users</h2>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-600">Failed to load users</div>}
        <div className="space-y-2">
          {data?.users?.map((u) => (
            <div key={u.id} className="flex items-center justify-between border rounded px-3 py-2">
              <div className="space-x-3">
                <span className="font-mono">{u.username}</span>
                <span className="text-xs border rounded px-2 py-0.5 bg-gray-50">{u.role}</span>
                <span className={`text-xs ml-2 ${u.is_active ? "text-green-600" : "text-gray-500"}`}>
                  {u.is_active ? "active" : "inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateMutation.mutate({ id: u.id, input: { role: u.role === "admin" ? "user" : "admin" } })}
                >
                  {u.role === "admin" ? "Demote to user" : "Promote to admin"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateMutation.mutate({ id: u.id, input: { is_active: !u.is_active } })}
                >
                  {u.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="destructive" onClick={() => deleteMutation.mutate(u.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
