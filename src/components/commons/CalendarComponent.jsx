import React, { useState } from "react";
import "../../styles/CalendarComponent.css";
import "font-awesome/css/font-awesome.min.css";

const CalendarComponent = ({ filteredSchedules }) => {
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const getStartOfMonth = () => {
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return start;
  };

  const getEndOfMonth = () => {
    const lastDay = new Date(year, month + 1, 0);
    const end = new Date(lastDay);
    end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    return end;
  };

  const groupDatesByWeek = (start, end) => {
    const weeks = [];
    let current = new Date(start);
    let week = [];
    while (current <= end) {
      week.push(new Date(current));
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      current.setDate(current.getDate() + 1);
    }
    if (week.length > 0) weeks.push(week);
    return weeks;
  };

  const getCurrentWeekDates = () => {
    const baseDate = new Date(currentDate);
    const week = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      week.push(date);
    }
    return [week];
  };

  const weeks =
    viewMode === "month"
      ? groupDatesByWeek(getStartOfMonth(), getEndOfMonth())
      : getCurrentWeekDates();

  const currentMonthStr = new Date(currentDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
  });

  return (
    <div className="calendar">
      {/* 상단 네비게이션 바 */}
      <div className="calendar-top-bar">
        {viewMode === "month" ? (
          <div className="calendar-nav-left styled-nav calendar-week-nav-custom">
            <div className="nav-button-left">
              <button
                className="nav-rounded-button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              >
                <i className="fa fa-arrow-left" />
              </button>
            </div>

            <span className="styled-title">
              {year}년 {month + 1}월
            </span>

            <div className="nav-button-right">
              <button
                className="nav-rounded-button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              >
                <i className="fa fa-arrow-right" />
              </button>
            </div>
          </div>
        ) : (
          <div className="calendar-week-nav styled-nav calendar-week-nav-custom">
            <div className="nav-button-left">
              <button
                className="nav-rounded-button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
              >
                <i className="fa fa-arrow-left" />
              </button>
            </div>

            <span className="styled-title">
              {weeks[0][0].getMonth() + 1}월 {weeks[0][0].getDate()}일 ~{" "}
              {weeks[0][6].getMonth() + 1}월 {weeks[0][6].getDate()}일
            </span>

            <div className="nav-button-right">
              <button
                className="nav-rounded-button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
              >
                <i className="fa fa-arrow-right" />
              </button>
            </div>
          </div>
        )}

        <div className="calendar-view-tabs">
          <button
            className={`view-tab ${viewMode === "week" ? "active" : ""}`}
            onClick={() => {
              setCurrentDate(new Date());
              setViewMode("week");
            }}
          >
            주간 보기
          </button>
          <button
            className={`view-tab ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            월간 보기
          </button>
        </div>
      </div>

      {/* 주간 보기 섹션 (가로 배치: 미니 + 캘린더) */}
      {viewMode === "week" && (
        <div className="calendar-top-section">
          <div className="mini-month-calendar">
            <div className="mini-month-header">{currentMonthStr}</div>
            {groupDatesByWeek(getStartOfMonth(), getEndOfMonth()).map(
              (week, i) => (
                <div key={i} className="mini-week-row">
                  {week.map((date, j) => {
                    const isInSelectedWeek = weeks[0].some(
                      (w) => w.toDateString() === date.toDateString()
                    );
                    return (
                      <div
                        key={j}
                        className={`mini-day ${
                          isInSelectedWeek ? "highlight-week" : ""
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* 주간 달력 본체 */}
          <div className="calendar-content">
            <div className="weekdays">
              {weeks[0].map((date, idx) => (
                <div key={idx}>
                  {date.toLocaleDateString("ko-KR", { weekday: "short" })}
                </div>
              ))}
            </div>

            <div className="days view-week">
              {weeks.map((week, i) => (
                <div key={i} className="week">
                  {week.map((date, j) => {
                    const localDateStr = new Date(date).toLocaleDateString(
                      "sv-SE",
                      {
                        timeZone: "Asia/Seoul",
                      }
                    );
                    const isToday = localDateStr === todayStr;

                    const schedulesForDate = filteredSchedules.filter(
                      (s) =>
                        new Date(s.date).toISOString().split("T")[0] ===
                        localDateStr
                    );

                    return (
                      <div key={j} className={`day ${isToday ? "today" : ""}`}>
                        <div className="day-number">{date.getDate()}</div>
                        <div className="schedule-details">
                          {schedulesForDate.map((s, index) => (
                            <div
                              key={index}
                              className={`schedule-box priority-${
                                s.priority?.toLowerCase() || "normal"
                              }`}
                            >
                              {s.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 월간 보기 본체 */}
      {viewMode === "month" && (
        <>
          <div className="weekdays">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>
          <div className="days view-month">
            {weeks.map((week, i) => (
              <div key={i} className="week">
                {week.map((date, j) => {
                  const localDateStr = new Date(date).toLocaleDateString(
                    "sv-SE",
                    {
                      timeZone: "Asia/Seoul",
                    }
                  );
                  const isToday = localDateStr === todayStr;
                  const isOtherMonth =
                    date.getMonth() !== currentDate.getMonth();

                  const schedulesForDate = filteredSchedules.filter(
                    (s) =>
                      new Date(s.date).toISOString().split("T")[0] ===
                      localDateStr
                  );

                  return (
                    <div key={j} className={`day ${isToday ? "today" : ""}`}>
                      <div
                        className={`day-number ${
                          isOtherMonth ? "other-month" : ""
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="schedule-details">
                        {schedulesForDate.map((s, index) => (
                          <div
                            key={index}
                            className={`schedule-box priority-${
                              s.priority?.toLowerCase() || "normal"
                            }`}
                          >
                            {s.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 주간 일정 요약 */}
      {viewMode === "week" && (
        <div className="weekly-detail-rows">
          {weeks[0].map((date, idx) => {
            const localDateStr = new Date(date).toLocaleDateString("sv-SE", {
              timeZone: "Asia/Seoul",
            });

            const schedules = filteredSchedules.filter(
              (s) =>
                new Date(s.date).toISOString().split("T")[0] === localDateStr
            );

            return (
              <div key={idx} className="weekly-row">
                <div className="weekly-date">
                  {date.getMonth() + 1}월 {date.getDate()}일 (
                  {date.toLocaleDateString("ko-KR", { weekday: "short" })})
                </div>
                <div className="weekly-schedule-list">
                  {schedules.length > 0 ? (
                    schedules.map((s, i) => (
                      <div
                        key={i}
                        className={`weekly-schedule-item priority-${
                          s.priority || "normal"
                        }`}
                      >
                        {s.title}
                      </div>
                    ))
                  ) : (
                    <div className="no-schedule">일정 없음</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
