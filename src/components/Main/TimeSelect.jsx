import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/Main/TimeSelect.css";

export default function TimeSelect({
  value = "00:00",
  onChange,
  step = 5,
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [popStyle, setPopStyle] = useState({});
  const wrapperRef = useRef(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  const hh = Math.max(0, Math.min(23, parseInt(value.slice(0, 2) || "0", 10)));
  const mm = Math.max(0, Math.min(59, parseInt(value.slice(3, 5) || "0", 10)));
  const isPM = hh >= 12;
  const hour12 = (hh % 12) || 12;

  const hours12 = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const formatLabel = () => {
    const ampm = isPM ? "오후" : "오전";
    const h12 = String(hour12).padStart(2, "0");
    const m2 = String(mm).padStart(2, "0");
    return `${ampm} ${h12}:${m2}`;
  };

  const to24h = (nextIsPM, h12, m) => {
    let h = h12 % 12;
    if (nextIsPM) h += 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  /** 팝오버 좌표 계산: 트리거의 좌측에 맞추고, 트리거 '위'로 띄우기 */
  const positionPopover = () => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;

    const gap = 6;
    const rect = btn.getBoundingClientRect();
    const popH = pop.offsetHeight;
    const popW = pop.offsetWidth;

    // 화면 좌우 넘치지 않게 보정
    let left = rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - popW - 8));

    // 기본은 위로 띄우기. 공간이 부족하면 아래로.
    let top = rect.top - popH - gap;
    if (top < 8) {
      top = rect.bottom + gap;
    }

    setPopStyle({
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 9999,
    });
  };

  const openPopover = () => {
    if (disabled) return;
    setOpen(true);
  };

  // open 직후 한 프레임 뒤에 치수 측정
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => positionPopover());
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 스크롤/리사이즈 시 위치 재계산
  useEffect(() => {
    if (!open) return;
    const handler = () => positionPopover();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 외부 클릭 닫기
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target) && popRef.current && !popRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // 키보드 접근
  const onKeyDown = (e) => {
    if (disabled) return;
    if ((e.key === "Enter" || e.key === " ") && !open) {
      e.preventDefault();
      openPopover();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className={`cts-wrapper ${className}`} ref={wrapperRef}>
      <button
        ref={btnRef}
        type="button"
        className={`cts-field ${disabled ? "cts-disabled" : ""}`}
        onClick={() => (open ? setOpen(false) : openPopover())}
        onKeyDown={onKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
      >
        {formatLabel()}
        <span className="cts-caret">▾</span>
      </button>

      {open && !disabled && (
        <div ref={popRef} className="cts-popover" style={popStyle} role="dialog">
          {/* AM/PM */}
          <div className="cts-column" aria-label="오전/오후">
            {["오전", "오후"].map((label) => {
              const nextIsPM = label === "오후";
              const selected = nextIsPM === isPM;
              return (
                <button
                  key={label}
                  type="button"
                  className={`cts-option ${selected ? "selected" : ""}`}
                  onClick={() => onChange?.(to24h(nextIsPM, hour12, mm))}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 시간(12h) */}
          <div className="cts-column" aria-label="시간">
            {hours12.map((h) => {
              const selected = h === hour12;
              return (
                <button
                  key={h}
                  type="button"
                  className={`cts-option ${selected ? "selected" : ""}`}
                  onClick={() => onChange?.(to24h(isPM, h, mm))}
                >
                  {String(h).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          {/* 분(step 분 단위) */}
          <div className="cts-column" aria-label="분">
            {minutes.map((m) => {
              const selected = m === mm;
              return (
                <button
                  key={m}
                  type="button"
                  className={`cts-option ${selected ? "selected" : ""}`}
                  onClick={() => onChange?.(to24h(isPM, hour12, m))}
                >
                  {String(m).padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}