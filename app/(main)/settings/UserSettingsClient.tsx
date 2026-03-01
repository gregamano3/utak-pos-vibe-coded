"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const ROLES = ["ADMIN", "MANAGER", "STAFF", "CASHIER", "KITCHEN"] as const;

type UserRow = {
  id: string;
  username: string;
  role: string;
  pin: string | null;
  createdAt: Date;
};

type Props = {
  users: UserRow[];
  createUser: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  updateUser: (userId: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  deleteUser: (userId: string) => Promise<{ error?: string; success?: boolean }>;
};

export function UserSettingsClient({ users, createUser, updateUser, deleteUser }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function handleCreate(formData: FormData) {
    setError("");
    setSuccess("");
    const res = await createUser(formData);
    if (res.error) setError(res.error);
    else {
      setSuccess("User created");
      setShowAdd(false);
      router.refresh();
    }
  }

  async function handleUpdate(userId: string, formData: FormData) {
    setError("");
    setSuccess("");
    const res = await updateUser(userId, formData);
    if (res.error) setError(res.error);
    else {
      setSuccess("User updated");
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setError("");
    setSuccess("");
    const res = await deleteUser(userId);
    if (res.error) setError(res.error);
    else {
      setSuccess("User deleted");
      router.refresh();
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Users</h3>
          <button
            onClick={() => { setShowAdd(!showAdd); setError(""); setSuccess(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
            {success}
          </div>
        )}

        {showAdd && (
          <form action={handleCreate} className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">New User</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                name="username"
                placeholder="Username"
                required
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
              />
              <input
                name="password"
                type="password"
                placeholder="Password (min 6)"
                required
                minLength={6}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
              />
              <select
                name="role"
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input
                name="pin"
                placeholder="PIN (optional)"
                maxLength={4}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium">
                  Create
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-zinc-800">
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">PIN</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                  {editingId === user.id ? (
                    <td colSpan={5} className="p-4 bg-slate-50 dark:bg-zinc-900/50">
                      <form
                        action={(fd) => handleUpdate(user.id, fd)}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
                      >
                        <input
                          name="username"
                          defaultValue={user.username}
                          required
                          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                        />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <input
                          name="pin"
                          placeholder="PIN"
                          defaultValue={user.pin ?? ""}
                          maxLength={4}
                          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                        />
                        <input
                          name="newPassword"
                          type="password"
                          placeholder="New password (leave blank)"
                          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                          <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm">
                            Save
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700">
                            <X size={18} />
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.username}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">{user.pin ?? "—"}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingId(user.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
