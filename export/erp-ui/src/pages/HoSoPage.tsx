import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import {
  User, Mail, Building2, Briefcase, Shield, Clock,
  KeyRound, Lock,
} from "lucide-react";
import { useState } from "react";
import { changePassword } from "@/lib/api";

export default function HoSoPage() {
  const { user } = useAuth();
  const isSuperAdmin = !user?.enterpriseId;

  const [showChangePw, setShowChangePw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePw() {
    setPwMsg(null);
    if (!oldPw || !newPw || !confirmPw) { setPwMsg({ ok: false, text: "Vui lòng điền đầy đủ." }); return; }
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: "Mật khẩu mới không khớp." }); return; }
    if (newPw.length < 6) { setPwMsg({ ok: false, text: "Mật khẩu mới cần ít nhất 6 ký tự." }); return; }
    setPwLoading(true);
    try {
      await changePassword(oldPw, newPw);
      setPwMsg({ ok: true, text: "Đổi mật khẩu thành công!" });
      setOldPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setShowChangePw(false); setPwMsg(null); }, 1500);
    } catch (e: unknown) {
      setPwMsg({ ok: false, text: e instanceof Error ? e.message : "Đổi mật khẩu thất bại." });
    } finally {
      setPwLoading(false);
    }
  }

  const initials = user?.name?.trim().split(/\s+/).slice(-2).map(s => s[0]?.toUpperCase() ?? "").join("") || "??";

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="text-[12px] text-muted-foreground">Tài khoản / Hồ sơ</div>
          <h1 className="text-xl lg:text-2xl font-bold mt-0.5 flex items-center gap-2">
            <User className="w-6 h-6 text-violet-600" />
            Hồ sơ cá nhân
          </h1>
        </div>

        {/* Avatar + tên */}
        <div className="bg-white border border-border rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0 ${user?.avatarColor ?? "bg-emerald-600"}`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-foreground">{user?.name}</p>
            <p className="text-[13px] text-muted-foreground">{user?.role}</p>
            {isSuperAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700">
                <Shield className="w-3 h-3" /> Super Admin
              </span>
            )}
          </div>
        </div>

        {/* Thông tin tài khoản */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[13.5px] font-semibold text-foreground">Thông tin tài khoản</p>
          </div>
          <div className="divide-y divide-border">
            <InfoRow icon={Mail} label="Email" value={user?.email ?? "—"} />
            <InfoRow icon={Briefcase} label="Chức vụ" value={user?.role ?? "—"} />
            <InfoRow
              icon={Shield}
              label="Phân quyền"
              value={isSuperAdmin ? "Super Admin (Toàn hệ thống)" : "Admin Doanh nghiệp"}
            />
          </div>
        </div>

        {/* Thông tin doanh nghiệp — chỉ hiện nếu gắn DN */}
        {!isSuperAdmin && user?.enterpriseName && (
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <p className="text-[13.5px] font-semibold text-foreground">Doanh nghiệp</p>
            </div>
            <div className="divide-y divide-border">
              <InfoRow icon={Building2} label="Tên doanh nghiệp" value={user.enterpriseName} />
            </div>
          </div>
        )}

        {/* Đổi mật khẩu */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => { setShowChangePw(v => !v); setPwMsg(null); }}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <p className="text-[13.5px] font-semibold text-foreground">Đổi mật khẩu</p>
            </div>
            <Lock className={`w-4 h-4 transition-transform duration-200 text-muted-foreground ${showChangePw ? "rotate-0" : ""}`} />
          </button>
          {showChangePw && (
            <div className="px-5 pb-5 space-y-3 border-t border-border">
              <div className="mt-4">
                <label className="block text-[12.5px] font-medium mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPw}
                  onChange={e => setOldPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-medium mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-medium mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm outline-none focus:border-primary"
                />
              </div>
              {pwMsg && (
                <div className={`px-3 py-2 rounded-lg text-[12.5px] ${pwMsg.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
                  {pwMsg.text}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowChangePw(false); setOldPw(""); setNewPw(""); setConfirmPw(""); setPwMsg(null); }}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePw}
                  disabled={pwLoading}
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 disabled:opacity-60"
                >
                  {pwLoading ? "Đang lưu…" : "Lưu mật khẩu"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-[12.5px] text-muted-foreground w-32 shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}
