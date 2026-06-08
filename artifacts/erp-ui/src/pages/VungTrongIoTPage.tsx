import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Cpu, Activity, Wifi, Server, AlertTriangle, CheckCircle2,
  Battery, Thermometer, Droplets, Wind, Sun, Signal,
  RefreshCw, Settings, X, MapPin, Clock,
} from "lucide-react";

type DeviceStatus = "online" | "offline" | "warning" | "maintenance";
const DEV_CFG: Record<DeviceStatus, { label: string; color: string; dot: string }> = {
  online:      { label: "Online",       color: "text-emerald-700 bg-emerald-50",  dot: "bg-emerald-500" },
  offline:     { label: "Offline",      color: "text-gray-600 bg-gray-100",       dot: "bg-gray-400" },
  warning:     { label: "Cảnh báo",     color: "text-amber-700 bg-amber-50",      dot: "bg-amber-500" },
  maintenance: { label: "Bảo trì",      color: "text-blue-700 bg-blue-50",        dot: "bg-blue-500" },
};

interface IoTDevice {
  id: string;
  tenThietBi: string;
  loai: string;
  viTri: string;
  vung: string;
  trangThai: DeviceStatus;
  pin: number;
  tinhHieu: number;
  capNhatCuoi: string;
  readings: { label: string; value: string; icon: React.ElementType; unit: string; alert?: boolean }[];
}

const DEVICES: IoTDevice[] = [
  { id:"IOT-001", tenThietBi:"Cảm biến đa năng #01", loai:"Đa thông số", viTri:"Thôn Nà Hồng, cạnh vườn hộ NH004", vung:"Nà Hồng", trangThai:"online", pin:87, tinhHieu:94,
    capNhatCuoi:"08/06/2026 06:45",
    readings:[{label:"Nhiệt độ",value:"22.4",unit:"°C",icon:Thermometer},{label:"Độ ẩm KK",value:"68",unit:"%",icon:Droplets},{label:"Độ ẩm đất",value:"72",unit:"%",icon:Droplets},{label:"Bức xạ MT",value:"12.4",unit:"kWh/m²",icon:Sun}] },
  { id:"IOT-002", tenThietBi:"Cảm biến đa năng #02", loai:"Đa thông số", viTri:"Trung tâm vùng Nà Bay, gần suối", vung:"Nà Bay", trangThai:"online", pin:62, tinhHieu:88,
    capNhatCuoi:"08/06/2026 06:45",
    readings:[{label:"Nhiệt độ",value:"23.1",unit:"°C",icon:Thermometer},{label:"Độ ẩm KK",value:"71",unit:"%",icon:Droplets},{label:"Độ ẩm đất",value:"68",unit:"%",icon:Droplets},{label:"Lượng mưa",value:"0",unit:"mm",icon:Wind}] },
  { id:"IOT-003", tenThietBi:"Cảm biến độ ẩm #03", loai:"Độ ẩm đất", viTri:"Bản Chang – khu B", vung:"Bản Chang", trangThai:"warning", pin:18, tinhHieu:72,
    capNhatCuoi:"08/06/2026 05:10",
    readings:[{label:"Độ ẩm đất",value:"45",unit:"%",alert:true,icon:Droplets},{label:"Nhiệt độ đất",value:"19.8",unit:"°C",icon:Thermometer}] },
  { id:"IOT-004", tenThietBi:"Trạm thời tiết #01", loai:"Thời tiết", viTri:"Điểm cao nhất vùng Nà Hồng", vung:"Nà Hồng", trangThai:"online", pin:95, tinhHieu:98,
    capNhatCuoi:"08/06/2026 07:00",
    readings:[{label:"Nhiệt độ",value:"21.8",unit:"°C",icon:Thermometer},{label:"Độ ẩm",value:"65",unit:"%",icon:Droplets},{label:"Tốc độ gió",value:"12",unit:"km/h",icon:Wind},{label:"Áp suất",value:"1013",unit:"hPa",icon:Activity}] },
  { id:"IOT-005", tenThietBi:"Camera giám sát #01", loai:"Camera", viTri:"Điểm thu mua Nà Bay", vung:"Nà Bay", trangThai:"offline", pin:0, tinhHieu:0,
    capNhatCuoi:"06/06/2026 18:22",
    readings:[] },
  { id:"IOT-006", tenThietBi:"Cảm biến phân bón #01", loai:"Đất & dinh dưỡng", viTri:"Nà Bay – khu A, đất hộ NB001", vung:"Nà Bay", trangThai:"maintenance", pin:45, tinhHieu:60,
    capNhatCuoi:"07/06/2026 14:00",
    readings:[{label:"N (Nitơ)",value:"32",unit:"mg/kg",icon:Activity},{label:"P (Lân)",value:"18",unit:"mg/kg",icon:Activity},{label:"K (Kali)",value:"156",unit:"mg/kg",icon:Activity},{label:"pH đất",value:"5.8",unit:"",icon:Activity}] },
];

const ALERTS = [
  { level:"high",   device:"IOT-003", text:"Pin cảm biến #03 sắp hết (18%) – cần thay pin ngay",        time:"2 giờ trước" },
  { level:"high",   device:"IOT-003", text:"Độ ẩm đất Bản Chang xuống thấp (45%) – cần tưới thêm",       time:"2 giờ trước" },
  { level:"medium", device:"IOT-005", text:"Camera #01 mất kết nối từ 06/06 – kiểm tra nguồn điện",      time:"2 ngày trước" },
  { level:"low",    device:"IOT-002", text:"Cảm biến #02 pin 62% – sạc trong 5-7 ngày tới",             time:"1 giờ trước" },
];

const VUNG_COLOR: Record<string, string> = { "Nà Hồng":"bg-emerald-100 text-emerald-700","Nà Bay":"bg-blue-100 text-blue-700","Bản Chang":"bg-amber-100 text-amber-700" };

export default function VungTrongIoTPage() {
  const [activeTab, setActiveTab] = useState<"devices"|"monitor"|"alerts">("devices");
  const [selected, setSelected] = useState<IoTDevice | null>(null);
  const [vungFilter, setVungFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus|"">("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [ticking, setTicking] = useState(false);

  // Simulate live updates
  useEffect(() => {
    const t = setInterval(() => setLastRefresh(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  function refresh() { setTicking(true); setTimeout(() => { setLastRefresh(new Date()); setTicking(false); }, 1000); }

  const filtered = DEVICES.filter(d => {
    if (vungFilter && d.vung !== vungFilter) return false;
    if (statusFilter && d.trangThai !== statusFilter) return false;
    return true;
  });

  const stats = {
    online: DEVICES.filter(d => d.trangThai === "online").length,
    offline: DEVICES.filter(d => d.trangThai === "offline").length,
    warning: DEVICES.filter(d => d.trangThai === "warning").length,
    total: DEVICES.length,
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <div className="text-[12px] text-muted-foreground">Vùng trồng / IoT</div>
          <div className="flex items-center justify-between mt-0.5">
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Cpu className="w-6 h-6 text-teal-600" />
              Thiết bị IoT & Giám sát
            </h1>
            <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 text-muted-foreground">
              <RefreshCw className={`w-3.5 h-3.5 ${ticking ? "animate-spin" : ""}`} />
              Làm mới · {lastRefresh.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit" })}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon:Server,        label:"Tổng thiết bị",  value:`${stats.total}`, sub:"đã lắp đặt",    color:"text-teal-600 bg-teal-50" },
            { icon:CheckCircle2,  label:"Đang online",    value:`${stats.online}`, sub:"hoạt động bình thường", color:"text-emerald-600 bg-emerald-50" },
            { icon:AlertTriangle, label:"Cảnh báo",       value:`${stats.warning}`, sub:"cần kiểm tra", color:"text-amber-600 bg-amber-50" },
            { icon:Wifi,          label:"Mất kết nối",    value:`${stats.offline}`, sub:"offline",     color:"text-gray-600 bg-gray-100" },
          ].map((s,i) => (
            <div key={i} className="bg-white border border-border rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}><s.icon className="w-4 h-4" strokeWidth={1.5}/></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-base font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {[{key:"devices",label:"Thiết bị",count:DEVICES.length},{key:"monitor",label:"Giám sát",count:DEVICES.filter(d=>d.trangThai==="online").length},{key:"alerts",label:"Cảnh báo",count:ALERTS.filter(a=>a.level==="high").length}].map(tab=>(
            <button key={tab.key} onClick={()=>setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab===tab.key?"border-primary text-primary":"border-transparent text-muted-foreground hover:text-foreground"}`}>
              {tab.label}
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${activeTab===tab.key?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Devices tab */}
        {activeTab === "devices" && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <select value={vungFilter} onChange={e=>setVungFilter(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
                <option value="">Tất cả vùng</option>
                {["Nà Hồng","Nà Bay","Bản Chang"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as DeviceStatus|"")} className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none">
                <option value="">Tất cả TT</option>
                {(Object.keys(DEV_CFG) as DeviceStatus[]).map(k=><option key={k} value={k}>{DEV_CFG[k].label}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(dev=>{
                const sc = DEV_CFG[dev.trangThai];
                const vc = VUNG_COLOR[dev.vung] ?? "bg-gray-100 text-gray-600";
                return (
                  <button key={dev.id} onClick={()=>setSelected(dev)}
                    className="bg-white border border-border rounded-xl p-4 text-left hover:border-teal-300 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-2 h-2 rounded-full ${sc.dot} ${dev.trangThai==="online"?"animate-pulse":""}`}/>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{dev.tenThietBi}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{dev.loai}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${vc}`}>{dev.vung}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{dev.viTri.length > 30 ? dev.viTri.slice(0,30)+"..." : dev.viTri}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${dev.pin <= 20 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                        <Battery className="w-3 h-3"/>{dev.pin}%
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground"><Signal className="w-3 h-3"/>{dev.tinhHieu}%</span>
                      <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3"/>{dev.capNhatCuoi.split(" ")[1]}</span>
                    </div>
                    {dev.readings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-1.5">
                        {dev.readings.slice(0,2).map((r,i)=>(
                          <div key={i} className={`rounded-lg px-2 py-1.5 ${r.alert?"bg-red-50 border border-red-200":"bg-muted/30"}`}>
                            <p className="text-[10px] text-muted-foreground">{r.label}</p>
                            <p className={`text-sm font-bold ${r.alert?"text-red-600":""}`}>{r.value}{r.unit}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Monitor tab */}
        {activeTab === "monitor" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1 flex items-center gap-2"><Activity className="w-4 h-4"/>Dữ liệu real-time · Cập nhật mỗi 30 giây</p>
              <p className="text-blue-700">Hiển thị đọc mới nhất từ {stats.online} thiết bị đang online.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {DEVICES.filter(d=>d.trangThai==="online"&&d.readings.length>0).map(dev=>(
                <div key={dev.id} className="bg-white border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold">{dev.tenThietBi}</p>
                      <p className="text-xs text-muted-foreground">{dev.vung} · cập nhật {dev.capNhatCuoi.split(" ")[1]}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {dev.readings.map((r,i)=>{
                      const Icon = r.icon;
                      return (
                        <div key={i} className={`rounded-xl p-3 ${r.alert?"bg-red-50 border border-red-200":"bg-muted/20"}`}>
                          <div className="flex items-center gap-1 mb-1"><Icon className={`w-3.5 h-3.5 ${r.alert?"text-red-500":"text-muted-foreground"}`} strokeWidth={1.5}/><p className="text-[11px] text-muted-foreground">{r.label}</p></div>
                          <p className={`text-lg font-bold ${r.alert?"text-red-600":""}`}>{r.value}<span className="text-xs font-normal ml-0.5">{r.unit}</span></p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts tab */}
        {activeTab === "alerts" && (
          <div className="space-y-3">
            {ALERTS.map((a,i)=>{
              const cfgMap: Record<string, { bg: string; icon: string; label: string }> = { high:{ bg:"bg-red-50 border-red-200", icon:"text-red-600", label:"Khẩn" }, medium:{ bg:"bg-amber-50 border-amber-200", icon:"text-amber-600", label:"Trung bình" }, low:{ bg:"bg-blue-50 border-blue-200", icon:"text-blue-600", label:"Thấp" } };
              const cfg = cfgMap[a.level] ?? cfgMap["low"];
              return (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${cfg.bg}`}>
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.icon}`}/>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.icon}`}>{cfg.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{a.device}</span>
                    </div>
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                  <button className="text-xs px-2.5 py-1 bg-white border border-border rounded-lg hover:bg-muted/50 font-medium shrink-0">Xử lý</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Device detail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)}/>
          <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${DEV_CFG[selected.trangThai].dot}`}/><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DEV_CFG[selected.trangThai].color}`}>{DEV_CFG[selected.trangThai].label}</span></div>
                <p className="text-sm font-bold mt-1">{selected.tenThietBi}</p>
                <p className="text-xs text-muted-foreground">{selected.id}</p>
              </div>
              <button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex-1 px-5 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className={`rounded-xl p-3 text-center ${selected.pin<=20?"bg-red-50 border border-red-200":"bg-muted/20"}`}><p className="text-[10px] text-muted-foreground">Pin</p><p className={`text-lg font-bold ${selected.pin<=20?"text-red-600":""}`}>{selected.pin}%</p></div>
                <div className="bg-muted/20 rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Tín hiệu</p><p className="text-lg font-bold">{selected.tinhHieu}%</p></div>
                <div className="bg-muted/20 rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Loại</p><p className="text-[11px] font-semibold leading-tight">{selected.loai}</p></div>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 space-y-2">
                <div className="flex gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/><div><p className="text-xs text-muted-foreground">Vị trí</p><p className="font-medium">{selected.viTri}</p></div></div>
                <div className="flex gap-2 text-sm"><Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/><div><p className="text-xs text-muted-foreground">Cập nhật cuối</p><p className="font-medium">{selected.capNhatCuoi}</p></div></div>
              </div>
              {selected.readings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Chỉ số đo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.readings.map((r,i)=>{
                      const Icon = r.icon;
                      return (
                        <div key={i} className={`rounded-xl p-3 ${r.alert?"bg-red-50 border border-red-200":"bg-muted/20"}`}>
                          <div className="flex items-center gap-1 mb-1"><Icon className={`w-3.5 h-3.5 ${r.alert?"text-red-500":"text-muted-foreground"}`} strokeWidth={1.5}/><p className="text-[11px] text-muted-foreground">{r.label}</p></div>
                          <p className={`text-xl font-bold ${r.alert?"text-red-600":""}`}>{r.value}<span className="text-xs font-normal ml-0.5">{r.unit}</span></p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selected.trangThai === "offline" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                  <p className="font-semibold mb-1">Thiết bị offline</p>
                  <p className="text-xs">Không nhận được tín hiệu từ {selected.capNhatCuoi}. Kiểm tra nguồn điện và kết nối mạng tại {selected.viTri}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
