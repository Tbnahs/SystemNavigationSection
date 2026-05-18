import { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, ChevronDown, Image as ImageIcon, Table2, X,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const FONT_SIZES = [
  { label: "12px", cmd: "1" },
  { label: "14px", cmd: "2" },
  { label: "16px", cmd: "3" },
  { label: "18px", cmd: "4" },
  { label: "24px", cmd: "5" },
  { label: "32px", cmd: "6" },
];

const COLOR_ROW1 = [
  "#111827", "#374151", "#6B7280", "#9CA3AF",
  "#EF4444", "#F97316", "#FAAD14", "#52C41A",
  "#3B82F6", "#8B5CF6", "#EC4899",
];
const COLOR_ROW2 = [
  "#06B6D4", "#FFFFFF", "#FEE2E2", "#FEF3C7",
  "#DCFCE7", "#DBEAFE", "#EDE9FE",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung…",
  minHeight = 120,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const lastHtml = useRef(value);

  const [showFontSize, setShowFontSize] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [currentFontLabel, setCurrentFontLabel] = useState("14px");
  const [activeColor, setActiveColor] = useState("#111827");
  const [customHex, setCustomHex] = useState("#111827");

  // hover state for table picker
  const [tableHover, setTableHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 });

  useEffect(() => {
    if (editorRef.current && value !== lastHtml.current) {
      editorRef.current.innerHTML = value || "";
      lastHtml.current = value;
    }
  }, [value]);

  const emit = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const empty = html === "" || html === "<br>";
    lastHtml.current = empty ? "" : html;
    onChange(empty ? "" : html);
  }, [onChange]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    emit();
  };

  const applyFontSize = (item: { label: string; cmd: string }) => {
    setCurrentFontLabel(item.label);
    setShowFontSize(false);
    exec("fontSize", item.cmd);
  };

  const applyColor = (color: string) => {
    setActiveColor(color);
    setCustomHex(color);
    setShowColor(false);
    exec("foreColor", color);
  };

  const applyCustomHex = (hex: string) => {
    const clean = hex.startsWith("#") ? hex : "#" + hex;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      applyColor(clean);
    }
  };

  const insertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      editorRef.current?.focus();
      document.execCommand("insertImage", false, dataUrl);
      emit();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const insertTable = (rows: number, cols: number) => {
    setShowTable(false);
    const th = Array.from({ length: cols }, (_, i) =>
      `<th style="border:1px solid #DCDFE4;padding:6px 10px;background:#F3F4F7;font-weight:600;text-align:left;min-width:80px;">Cột ${i + 1}</th>`
    ).join("");
    const td = Array.from({ length: cols }, () =>
      `<td style="border:1px solid #DCDFE4;padding:6px 10px;"></td>`
    ).join("");
    const bodyRows = Array.from({ length: rows - 1 }, () => `<tr>${td}</tr>`).join("");
    const html = `<br/><table style="border-collapse:collapse;width:100%;margin:8px 0;"><thead><tr>${th}</tr></thead><tbody>${bodyRows}</tbody></table><br/>`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    emit();
  };

  const charCount = value.replace(/<[^>]*>/g, "").length;

  const closeAll = () => { setShowFontSize(false); setShowColor(false); setShowTable(false); };

  const ToolBtn = ({ onClick, title, active, children }: {
    onClick: () => void; title: string; active?: boolean; children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-[27px] h-[30px] flex items-center justify-center rounded-md transition-colors ${active ? "bg-[#F3F4F7] text-[#1D2025]" : "text-[#374151] hover:bg-[#F3F4F7]"}`}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-[0.9px] h-5 bg-[#E5E7EB] mx-0.5 shrink-0" />;

  return (
    <div className="rounded-lg border border-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-visible focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all relative">

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#E5E7EB] bg-white flex-wrap rounded-t-lg">

        {/* B I U S */}
        <ToolBtn onClick={() => exec("bold")} title="Đậm (Ctrl+B)"><Bold className="w-[10.8px] h-[13px]" /></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Nghiêng (Ctrl+I)"><Italic className="w-[9px] h-[13px]" /></ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Gạch chân"><Underline className="w-[10.8px] h-[14px]" /></ToolBtn>
        <ToolBtn onClick={() => exec("strikeThrough")} title="Gạch ngang"><Strikethrough className="w-[10.8px] h-[12px]" /></ToolBtn>

        <Sep />

        {/* Font size */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowFontSize(v => !v); setShowColor(false); setShowTable(false); }}
            className="h-[30px] flex items-center gap-1 px-2 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#374151] hover:bg-[#F3F4F7] transition-colors min-w-[67px]"
          >
            <span className="flex-1 text-center">{currentFontLabel}</span>
            <ChevronDown className="w-[9px] h-[10px] text-[#9CA3AF]" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 min-w-[80px]">
              {FONT_SIZES.map(f => (
                <button key={f.cmd} type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFontSize(f); }}
                  className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#F3F4F7] transition-colors ${currentFontLabel === f.label ? "text-primary font-semibold" : "text-[#374151]"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Sep />

        {/* Màu chữ — dark pill button matching Figma */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowColor(v => !v); setShowFontSize(false); setShowTable(false); }}
            title="Màu chữ"
            className="h-[30px] flex items-center gap-1.5 px-2.5 rounded-md bg-[#111827] border border-[#111827] text-white hover:bg-[#1f2937] transition-colors min-w-[90px]"
          >
            <div className="flex flex-col items-center gap-[2px] shrink-0">
              <span className="text-[11px] font-bold leading-none" style={{ color: activeColor === "#111827" ? "#fff" : activeColor }}>A</span>
              <span className="w-[10.8px] h-[3px] rounded-sm bg-white" style={{ backgroundColor: activeColor }} />
            </div>
            <span className="text-[12px] font-semibold flex-1 text-center">Màu chữ</span>
            <ChevronDown className="w-[9px] h-[10px] text-white/70" />
          </button>

          {/* Color picker popup - matches Figma design (360x315px) */}
          {showColor && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-4"
              style={{ width: 320 }}>

              {/* Header: Màu sắc chữ + current swatch */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#374151]">Màu sắc chữ</span>
                <div className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] rounded border border-[#E5E7EB]"
                    style={{ backgroundColor: activeColor }} />
                  <span className="text-[11px] font-medium uppercase text-[#9CA3AF]">
                    {activeColor.replace("#", "")}
                  </span>
                </div>
              </div>

              {/* BẢNG MÀU label */}
              <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#9CA3AF] mb-2">Bảng màu</div>

              {/* Row 1 — 11 swatches */}
              <div className="flex gap-1.5 mb-1.5 flex-wrap">
                {COLOR_ROW1.map(c => (
                  <button key={c} type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c); }}
                    className="w-6 h-6 rounded-[5px] border-2 transition-transform hover:scale-110 shrink-0"
                    style={{
                      backgroundColor: c,
                      borderColor: activeColor === c ? "#3B82F6" : c === "#FFFFFF" ? "#E5E7EB" : c,
                    }}
                  >
                    {activeColor === c && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 m-auto">
                        <path d="M2 6l3 3 5-5" stroke={c === "#FFFFFF" || c === "#FEE2E2" || c === "#FEF3C7" || c === "#DCFCE7" || c === "#DBEAFE" || c === "#EDE9FE" || c === "#9CA3AF" ? "#374151" : "#fff"} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Row 2 — 7 swatches */}
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {COLOR_ROW2.map(c => (
                  <button key={c} type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c); }}
                    className="w-6 h-6 rounded-[5px] border-2 transition-transform hover:scale-110 shrink-0"
                    style={{
                      backgroundColor: c,
                      borderColor: activeColor === c ? "#3B82F6" : "#E5E7EB",
                    }}
                  >
                    {activeColor === c && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 m-auto">
                        <path d="M2 6l3 3 5-5" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#F0F0F0] mb-3" />

              {/* MÀU TÙY CHỈNH */}
              <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#9CA3AF] mb-2">Màu tùy chỉnh</div>
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-lg border border-[#E5E7EB] overflow-hidden shrink-0">
                  <div className="absolute inset-0.5 rounded-md" style={{ backgroundColor: customHex }} />
                  <input type="color" value={customHex}
                    onChange={e => setCustomHex(e.target.value)}
                    onBlur={e => applyColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <div className="flex-1 flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden h-9">
                  <div className="px-2 text-[12px] font-medium text-[#9CA3AF] bg-[#FAFAFA] border-r border-[#E5E7EB] h-full flex items-center">#</div>
                  <input
                    value={customHex.replace("#", "").toUpperCase()}
                    onChange={e => {
                      const v = "#" + e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
                      setCustomHex(v);
                      if (v.length === 7) applyColor(v);
                    }}
                    className="flex-1 px-2 text-[12px] font-medium text-[#374151] outline-none bg-white h-full"
                    placeholder="111827"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => exec("justifyLeft")} title="Căn trái"><AlignLeft className="w-[11.7px] h-[11px]" /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Căn giữa"><AlignCenter className="w-[11.7px] h-[11px]" /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Căn phải"><AlignRight className="w-[12.6px] h-[14px]" /></ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Danh sách chấm"><List className="w-[12.6px] h-[14px]" /></ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Danh sách số"><ListOrdered className="w-[12.6px] h-[14px]" /></ToolBtn>

        <Sep />

        {/* Image upload */}
        <ToolBtn onClick={() => imgInputRef.current?.click()} title="Chèn hình ảnh">
          <ImageIcon className="w-[11.7px] h-[11px]" />
        </ToolBtn>
        <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={insertImage} />

        {/* Table picker */}
        <div className="relative">
          <ToolBtn onClick={() => { setShowTable(v => !v); setShowFontSize(false); setShowColor(false); }} title="Chèn bảng">
            <Table2 className="w-[12.6px] h-[14px]" />
          </ToolBtn>
          {showTable && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3">
              <div className="text-[11px] font-semibold text-[#9CA3AF] mb-2 uppercase tracking-[0.5px]">
                {tableHover.r > 0 && tableHover.c > 0
                  ? `${tableHover.r} × ${tableHover.c}`
                  : "Chọn kích thước bảng"}
              </div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(6, 20px)" }}>
                {Array.from({ length: 6 }, (_, r) =>
                  Array.from({ length: 6 }, (_, c) => (
                    <div
                      key={`${r}-${c}`}
                      onMouseEnter={() => setTableHover({ r: r + 1, c: c + 1 })}
                      onMouseLeave={() => setTableHover({ r: 0, c: 0 })}
                      onMouseDown={(e) => { e.preventDefault(); insertTable(r + 1, c + 1); }}
                      className={`w-5 h-5 rounded-sm border cursor-pointer transition-colors ${
                        r < tableHover.r && c < tableHover.c
                          ? "bg-primary/20 border-primary/60"
                          : "bg-[#F3F4F7] border-[#E5E7EB] hover:bg-primary/10"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showFontSize || showColor || showTable) && (
        <div className="fixed inset-0 z-20" onClick={closeAll} />
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="px-3 py-2.5 text-sm text-foreground leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:max-w-full [&_img]:rounded [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[#DCDFE4] [&_td]:p-1.5 [&_th]:border [&_th]:border-[#DCDFE4] [&_th]:p-1.5 [&_th]:bg-[#F3F4F7] [&_th]:text-left"
      />

      {/* Footer */}
      <div className="px-3 py-1 border-t border-[#E5E7EB] text-[11px] text-muted-foreground/60 text-right select-none rounded-b-lg">
        {charCount} ký tự
      </div>
    </div>
  );
}
