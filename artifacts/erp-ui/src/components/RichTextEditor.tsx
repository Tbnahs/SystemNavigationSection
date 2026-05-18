import { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, ChevronDown,
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

const TEXT_COLORS = [
  "#111827", "#374151", "#6B7280",
  "#DC2626", "#D97706", "#059669",
  "#2563EB", "#7C3AED", "#DB2777",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung…",
  minHeight = 120,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(value);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [currentFontLabel, setCurrentFontLabel] = useState("14px");
  const [activeColor, setActiveColor] = useState("#111827");

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
    setShowColor(false);
    exec("foreColor", color);
  };

  const charCount = value.replace(/<[^>]*>/g, "").length;

  const ToolBtn = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;

  return (
    <div className="rounded-lg border border-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-white flex-wrap">
        {/* B I U S */}
        <ToolBtn onClick={() => exec("bold")} title="Đậm (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Nghiêng (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Gạch chân (Ctrl+U)">
          <Underline className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("strikeThrough")} title="Gạch ngang">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Font size */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowFontSize(v => !v); setShowColor(false); }}
            className="h-7 flex items-center gap-1 px-2 rounded-md border border-gray-200 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {currentFontLabel}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showFontSize && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[80px]">
              {FONT_SIZES.map(f => (
                <button
                  key={f.cmd}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); applyFontSize(f); }}
                  className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted/60 transition-colors ${currentFontLabel === f.label ? "text-primary font-semibold" : "text-foreground"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Sep />

        {/* Text color */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setShowColor(v => !v); setShowFontSize(false); }}
            title="Màu chữ"
            className="w-7 h-7 flex flex-col items-center justify-center gap-0.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span className="text-[11px] font-bold leading-none" style={{ color: activeColor }}>A</span>
            <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: activeColor }} />
          </button>
          {showColor && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-border rounded-lg shadow-lg p-2">
              <div className="grid grid-cols-3 gap-1.5">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyColor(c); }}
                    className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${activeColor === c ? "border-primary" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Sep />

        {/* Alignment */}
        <ToolBtn onClick={() => exec("justifyLeft")} title="Căn trái">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Căn giữa">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Căn phải">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Danh sách chấm">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Danh sách số">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={() => { setShowFontSize(false); setShowColor(false); emit(); }}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="px-3 py-2.5 text-sm text-foreground leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />

      {/* Footer */}
      <div className="px-3 py-1 border-t border-gray-100 text-[11px] text-muted-foreground/60 text-right select-none">
        {charCount} ký tự
      </div>
    </div>
  );
}
