import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import "../../styles/Main/DateTimeSelect.css";

export default function DateTimeSelect({
  value = "",
  onChange,
  disabled = false,
}) {
  const initialDate = value ? new Date(value) : new Date();

  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [hour, setHour] = useState(initialDate.getHours());
  const [minute, setMinute] = useState(initialDate.getMinutes());
  const [popoverStyle, setPopoverStyle] = useState({});
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);

  const getStartOfMonth = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
  };
  const getEndOfMonth = (date) => {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const day = end.getDay();
    end.setDate(end.getDate() + (6 - day));
    return end;
  };
  const groupDatesByWeek = (start, end) => {
    const weeks = [];
    let current = new Date(start);
    while (current <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const weeks = useMemo(
    () =>
      groupDatesByWeek(
        getStartOfMonth(currentDate),
        getEndOfMonth(currentDate)
      ),
    [currentDate]
  );

  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy. MM. dd. a hh:mm", { locale: ko })
    : "날짜를 선택하세요";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    setPopoverStyle({
      position: "fixed",
      top: 40,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
    });
  }, [open]);

  const handleDateClick = (date) => {
    const newDate = new Date(date);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    setSelectedDate(newDate);
    onChange?.(newDate.toISOString().replace("Z", ""));
  };

  const handleTimeChange = (newHour, newMinute) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(newHour);
    newDate.setMinutes(newMinute);
    setHour(newHour);
    setMinute(newMinute);
    setSelectedDate(newDate);
    onChange?.(newDate.toISOString().replace("Z", ""));
  };

  const currentMonthStr = format(currentDate, "yyyy년 M월", { locale: ko });

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesArr = Array.from({ length: 12 }, (_, i) => i * 5);
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12;

  return (
    <div className="dts-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="dts-field"
        onClick={() => setOpen((p) => !p)}
        disabled={disabled}
      >
        {formattedDate}
        <span className="dts-caret">▾</span>
      </button>

      {open &&
        ReactDOM.createPortal(
          <div className="dts-popover" ref={popoverRef} style={popoverStyle}>
            {/*  캘린더 헤더 */}
            <div
              className="dts-calendar-header"
              style={{
                gridColumn: "1 / span 3",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              <button
                type="button"
                className="dts-nav-btn"
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <ChevronLeftRoundedIcon sx={{ fontSize: 24 }} />
              </button>

              <span className="dts-month-label">{currentMonthStr}</span>

              <button
                type="button"
                className="dts-nav-btn"
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <ChevronRightRoundedIcon sx={{ fontSize: 24 }} />
              </button>
            </div>

            {/* 날짜 영역 */}
            <div className="dts-calendar-grid">
              {weeks.map((week, i) => (
                <div key={i} className="dts-week-row">
                  {week.map((date, j) => {
                    const formatted = format(date, "yyyy-MM-dd");
                    const isSelected =
                      format(selectedDate, "yyyy-MM-dd") === formatted;
                    const isToday =
                      format(date, "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd");

                    return (
                      <div
                        key={j}
                        className={`dts-day 
                          ${isSelected ? "selected" : ""} 
                          ${isToday ? "today" : ""} 
                          ${isSelected && isToday ? "today-selected" : ""}`}
                        onClick={() => handleDateClick(date)}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 시간 선택 */}
            <div className="dts-column" aria-label="오전/오후">
              {["오전", "오후"].map((label) => {
                const nextIsPM = label === "오후";
                const selected = nextIsPM === isPM;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`dts-option ${selected ? "selected" : ""}`}
                    onClick={() =>
                      handleTimeChange(
                        nextIsPM
                          ? hour < 12
                            ? hour + 12
                            : hour
                          : hour >= 12
                          ? hour - 12
                          : hour,
                        minute
                      )
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="dts-column" aria-label="시간">
              {hours12.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`dts-option ${hour12 === h ? "selected" : ""}`}
                  onClick={() =>
                    handleTimeChange(isPM ? (h % 12) + 12 : h % 12, minute)
                  }
                >
                  {String(h).padStart(2, "0")}
                </button>
              ))}
            </div>

            <div className="dts-column" aria-label="분">
              {minutesArr.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`dts-option ${minute === m ? "selected" : ""}`}
                  onClick={() => handleTimeChange(hour, m)}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
