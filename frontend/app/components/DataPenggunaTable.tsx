"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Ban, Trash2 } from "lucide-react";

type User = {
  npm: string;
  nama: string;
  plat_nomor: string | null;
  status_akun: number | null; // 1 aktif, 0 blokir, null menunggu
};

type Props = {
  search: string;
  statusFilter: string;
};

export default function DataPenggunaTable({
  search,
  statusFilter,
}: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pengguna", {
        cache: "no-store",
      });

      const json = await res.json();

      if (res.ok && json.status === "success") {
        setUsers(json.data ?? []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (npm: string, status: number) => {
    const confirm = window.confirm(
      status === 1
        ? "Aktifkan hak parkir pengguna ini?"
        : "Blokir hak parkir pengguna ini?"
    );
    if (!confirm) return;

    try {
      setActionLoading(true);

      const res = await fetch("/api/admin/pengguna/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ npm, status_akun: status }),
      });

      if (!res.ok) throw new Error();

      await fetchUsers();
    } catch {
      alert("Gagal memperbarui status pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (npm: string) => {
    const confirm = window.confirm(
      "Hapus pengguna ini? Data tidak bisa dikembalikan."
    );
    if (!confirm) return;

    try {
      setActionLoading(true);

      const res = await fetch(`/api/admin/pengguna/${npm}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      await fetchUsers();
    } catch {
      alert("Gagal menghapus pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      user.nama.toLowerCase().includes(keyword) ||
      user.npm.includes(keyword) ||
      (user.plat_nomor ?? "").toLowerCase().includes(keyword);

    const statusText =
      user.status_akun === 1
        ? "aktif"
        : user.status_akun === 0
          ? "diblokir"
          : "menunggu";

    const matchStatus =
      statusFilter === "" || statusFilter === statusText;

    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <p className="text-xs text-gray-500">
        Memuat data pengguna...
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <Th>NPM</Th>
            <Th>Nama</Th>
            <Th>No Kendaraan</Th>
            <Th>Status</Th>
            <Th>Aksi</Th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 && (
            <tr>
              <Td colSpan={5}>
                <span className="text-gray-500">
                  Tidak ada data yang sesuai
                </span>
              </Td>
            </tr>
          )}

          {filteredUsers.map((user) => {
            const statusLabel =
              user.status_akun === 1
                ? "Aktif"
                : user.status_akun === 0
                  ? "Diblokir"
                  : "Menunggu";

            return (
              <tr
                key={user.npm}
                className="border-t text-center hover:bg-[#F4F6F8]"
              >
                <Td>{user.npm}</Td>

                <Td>
                  <Link
                    href={`/admin/pengguna/${user.npm}`}
                    className="font-semibold text-[#1F3A93] hover:underline"
                  >
                    {user.nama}
                  </Link>
                </Td>

                <Td>{user.plat_nomor ?? "-"}</Td>

                <Td>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold
                      ${statusLabel === "Aktif"
                        ? "bg-green-100 text-green-700"
                        : statusLabel === "Menunggu"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {statusLabel}
                  </span>
                </Td>

                <Td>
                  <div className="flex justify-center gap-2">
                    <button
                      disabled={actionLoading}
                      title="Validasi"
                      onClick={() => updateStatus(user.npm, 1)}
                      className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>

                    <button
                      disabled={actionLoading}
                      title="Blokir"
                      onClick={() => updateStatus(user.npm, 0)}
                      className="rounded-md bg-yellow-500 p-2 text-white hover:bg-yellow-600 disabled:opacity-50"
                    >
                      <Ban size={14} />
                    </button>

                    <button
                      disabled={actionLoading}
                      title="Hapus"
                      onClick={() => deleteUser(user.npm)}
                      className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ===== REUSABLE CELL ===== */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-xs font-semibold text-gray-700">
      {children}
    </th>
  );
}

function Td({
  children,
  colSpan,
}: {
  children: React.ReactNode;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className="px-3 py-2 text-xs">
      {children}
    </td>
  );
}
