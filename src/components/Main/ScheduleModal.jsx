import { useEffect, useRef, useState } from "react";
import "../../styles/Main/ScheduleModal.css";
import { FiInfo } from "react-icons/fi";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import {
  createSchedule,
  fetchScheduleCategories,
} from "../../services/ScheduleService";
import { ko } from "date-fns/locale";
import { format } from "date-fns";
import TimeSelect from "../../components/Main/TimeSelect";
import DateTimeSelect from "../../components/Main/DateTimeSelect";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AlertModal from "../../components/commons/AlertModal.jsx";
import PetImage from "../../components/commons/PetImage.jsx";

const ScheduleModal = ({ onClose, pets, onScheduleCreated }) => {
  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    content: "",
    repeatYn: false,
    noticeYn: false,
    noticeAt: 0,
    priority: "LOW",
    petId: [],
    selectedDates: [],
    isAllDay: false,
    repeatPattern: {
      frequency: "DAY",
      interval: 1,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: "",
      daysOfWeek: [],
      daysOfMonth: [],
    },
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonthStr = format(currentDate, "yyyy년 M월", { locale: ko });
  const [step, setStep] = useState(1);

  const calendarRef = useRef(null);
  const [syncedHeight, setSyncedHeight] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertAction, setAlertAction] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);

const noticeOptions = [
  { value: 0, label: "시작 시 알림" },
  { value: 5, label: "5분 전" },
  { value: 10, label: "10분 전" },
  { value: 30, label: "30분 전" },
  { value: 60, label: "1시간 전" },
];

  useEffect(() => {
    if (calendarRef.current) {
      setSyncedHeight(calendarRef.current.offsetHeight);
    }
  }, [formData.selectedDates, currentDate]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (calendarRef.current) {
        const height = calendarRef.current.offsetHeight;
        if (height > 0) {
          setSyncedHeight(height);
        }
      }
    });
  }, []);

  const goToNext = () => setStep((prev) => Math.min(prev + 1, 5));

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const list = await fetchScheduleCategories();
        setCategories(list);
      } catch (error) {
        console.error("카테고리 로딩 중 오류 발생:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const now = new Date();
    const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const localDateTime = koreanTime.toISOString().slice(0, 16);
    setFormData((prevData) => ({
      ...prevData,
      repeatPattern: {
        ...prevData.repeatPattern,
        startDate: localDateTime,
      },
    }));
  }, []);

  useEffect(() => {
  const onDown = (e) => {
    if (!e.target.closest(".schedule-create-alert-select-wrapper")) setAlertOpen(false);
  };
  document.addEventListener("mousedown", onDown);
  return () => document.removeEventListener("mousedown", onDown);
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "repeatPattern.frequency") {
      setFormData((prevData) => ({
        ...prevData,
        repeatPattern: {
          ...prevData.repeatPattern,
          frequency: value,
          daysOfWeek: [],
          daysOfMonth: [],
        },
      }));
    } else if (name === "repeatYn") {
      setFormData((prevData) => ({
        ...prevData,
        repeatYn: checked,
        repeatPattern: checked
          ? {
              frequency: "DAY",
              interval: 1,
              startDate: new Date().toISOString().slice(0, 16),
              endDate: "",
              daysOfWeek: [],
              daysOfMonth: [],
            }
          : {
              ...prevData.repeatPattern,
              frequency: "",
              interval: 1,
              startDate: "",
              endDate: "",
              daysOfWeek: [],
              daysOfMonth: [],
            },
        selectedDates: !checked ? [] : prevData.selectedDates,
      }));
    } else if (name.startsWith("repeatPattern.")) {
      const [, subKey] = name.split(".");
      setFormData((prevData) => ({
        ...prevData,
        repeatPattern: {
          ...prevData.repeatPattern,
          [subKey]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name === "categoryId") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: Number(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]:
          type === "checkbox"
            ? checked
            : name === "noticeAt"
            ? Number(value)
            : value,
      }));
    }
  };

  const convertToKST = (date) => {
    const utcDate = new Date(date);
    const koreanTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    return koreanTime.toISOString().replace("Z", "");
  };

  const dayMapping = {
    일: "SUNDAY",
    월: "MONDAY",
    화: "TUESDAY",
    수: "WEDNESDAY",
    목: "THURSDAY",
    금: "FRIDAY",
    토: "SATURDAY",
  };

  const handleDayClick = (day) => {
    const updatedDays = formData.repeatPattern.daysOfWeek.includes(
      dayMapping[day]
    )
      ? formData.repeatPattern.daysOfWeek.filter((d) => d !== dayMapping[day])
      : [...formData.repeatPattern.daysOfWeek, dayMapping[day]];

    setFormData((prevData) => ({
      ...prevData,
      repeatPattern: {
        ...prevData.repeatPattern,
        daysOfWeek: updatedDays,
      },
    }));
  };

  const handleDayOfMonthClick = (day) => {
    const updatedDays = formData.repeatPattern.daysOfMonth.includes(day)
      ? formData.repeatPattern.daysOfMonth.filter((d) => d !== day)
      : [...formData.repeatPattern.daysOfMonth, day];

    setFormData((prevData) => ({
      ...prevData,
      repeatPattern: {
        ...prevData.repeatPattern,
        daysOfMonth: updatedDays,
      },
    }));
  };

  const handlePetSelectionChange = (petId) => {
    setFormData((prevData) => ({
      ...prevData,
      petId: prevData.petId.includes(petId)
        ? prevData.petId.filter((id) => id !== petId)
        : [...prevData.petId, petId],
    }));
  };

  const handleDateChange = (date) => {
    // KST 보정
    const localDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const formattedDate = localDate.toISOString().slice(0, 10);

    setFormData((prevData) => {
      const existingDate = prevData.selectedDates.find(
        (d) => d.date === formattedDate
      );
      if (existingDate) {
        return {
          ...prevData,
          selectedDates: prevData.selectedDates.filter(
            (d) => d.date !== formattedDate
          ),
        };
      } else {
        return {
          ...prevData,
          selectedDates: [
            ...prevData.selectedDates,
            { date: formattedDate, time: "00:00" },
          ],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateTime = new Date(formData.repeatPattern.startDate);
    const endDateTime = new Date(formData.repeatPattern.endDate);
    const generatedDates = [];

    // 반복 유무에 따라 날짜 생성
    if (formData.repeatYn) {
      if (formData.repeatPattern.frequency === "DAY") {
        // 일일 반복
        for (
          let date = new Date(startDateTime);
          date <= endDateTime;
          date.setDate(date.getDate() + formData.repeatPattern.interval)
        ) {
          generatedDates.push(convertToKST(date));
        }
      } else if (formData.repeatPattern.frequency === "WEEK") {
        const selectedDays = formData.repeatPattern.daysOfWeek;

        for (
          let date = new Date(startDateTime);
          date <= endDateTime;
          date.setDate(date.getDate() + 1)
        ) {
          if (
            selectedDays.includes(
              new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)
            )
          ) {
            generatedDates.push(convertToKST(date));
            date.setDate(
              date.getDate() + (formData.repeatPattern.interval - 1) * 7
            );
          }
        }
      } else if (formData.repeatPattern.frequency === "MONTH") {
        const dayOfMonth = formData.repeatPattern.daysOfMonth;
        for (
          let date = new Date(
            startDateTime.getFullYear(),
            startDateTime.getMonth(),
            1
          );
          date <= endDateTime;
          date.setMonth(date.getMonth() + 1)
        ) {
          dayOfMonth.forEach((day) => {
            const monthlyDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              day
            );
            if (monthlyDate >= startDateTime && monthlyDate <= endDateTime) {
              generatedDates.push(convertToKST(monthlyDate));
            }
          });
        }
      }
    } else {
      // 반복이 없을 때 선택한 날짜 추가
      if (formData.selectedDates && formData.selectedDates.length > 0) {
        formData.selectedDates.forEach((dateObj) => {
          const date = new Date(dateObj.date); // 날짜 객체 생성
          const time = dateObj.time; // 시간 가져오기
          const [hours, minutes] = time.split(":"); // 시간 분리
          date.setHours(hours); // 시간 설정
          date.setMinutes(minutes); // 분 설정

          // 유효한 날짜인지 확인 후 KST 형식으로 변환
          if (!isNaN(date.getTime())) {
            generatedDates.push(convertToKST(date)); // KST 변환
          }
        });
      }
    }

    const requestData = {
      categoryId: formData.categoryId,
      title: formData.title,
      content: formData.content,
      repeatYn: formData.repeatYn,
      noticeYn: formData.noticeYn,
      priority: formData.priority,
      petId: formData.petId,
      isAllDay: formData.isAllDay,
    };

    // scheduleTime 설정
    if (formData.isAllDay) {
      requestData.scheduleTime = null; // 하루종일인 경우 null 전송
    } else {
      // '하루종일'이 아닐 때 사용자가 설정한 시간 포함
      requestData.scheduleTime = formData.scheduleTime || "00:00:00"; // 시간 설정, 없으면 기본값
    }

    if (formData.repeatYn) {
      requestData.repeatPattern = {
        frequency: formData.repeatPattern.frequency,
        interval: formData.repeatPattern.interval,
        startDate: formData.repeatPattern.startDate,
        endDate: formData.repeatPattern.endDate,
        ...(formData.repeatPattern.frequency === "WEEK" && {
          daysOfWeek: formData.repeatPattern.daysOfWeek,
        }),
        ...(formData.repeatPattern.frequency === "MONTH" && {
          daysOfMonth: formData.repeatPattern.daysOfMonth,
        }),
      };
    } else {
      requestData.selectedDates = formData.selectedDates.map((d) => d.date);
    }

    if (formData.noticeYn) {
      requestData.noticeAt = formData.noticeAt;
    }

    try {
      const response = await createSchedule(requestData);

      if (response.status === 200) {
        setAlertMessage("일정이 생성되었습니다.");
        setAlertAction(() => () => {
          onScheduleCreated();
          onClose();
        });
        setShowAlert(true);
      }
    } catch (error) {
      const { data } = error.response || {};
      setAlertMessage(
        data?.errorMessage || "일정 생성 중 오류가 발생했습니다."
      );
      setAlertAction(null);
      setShowAlert(true);
    }
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertAction) alertAction();
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.categoryId && formData.title.trim();
    }
    if (step === 2) {
      return formData.petId.length > 0;
    }
    if (step === 3) {
      if (formData.repeatYn) {
        return (
          formData.repeatPattern.startDate &&
          formData.repeatPattern.endDate &&
          formData.repeatPattern.interval >= 1
        );
      } else {
        return formData.selectedDates.length > 0;
      }
    }
    if (step === 5) {
      return !formData.noticeYn || formData.noticeAt !== "";
    }
    return true;
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return "카테고리, 제목, 내용을 입력해주세요";
      case 2:
        return "반려동물을 선택해주세요";
      case 3:
        return "일정 날짜와 반복 여부를 설정해주세요";
      case 4:
        return "우선순위를 선택해주세요";
      case 5:
        return "알림 여부를 설정해주세요";
      default:
        return "";
    }
  };

  // 미니캘린더 월 시작일 ~ 종료일 가져오기
  const getStartOfMonth = () => {
    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const day = start.getDay();
    start.setDate(start.getDate() - day); // 해당 월의 첫 주 일요일
    return start;
  };

  const getEndOfMonth = () => {
    const end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const day = end.getDay();
    end.setDate(end.getDate() + (6 - day)); // 해당 월의 마지막 주 토요일
    return end;
  };

  // 주 단위로 나누기
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

  return (
    <div className="schedule-create-modal-overlay">
      <div
        className={`schedule-create-modal-content schedule-create-step-${step}`}
      >
        <div className="schedule-create-modal-scrollable">
          {step > 1 && (
            <button
              className="schedule-create-back-button"
              onClick={() => setStep(step - 1)}
            >
              ‹
            </button>
          )}
          <button className="schedule-create-close-button" onClick={onClose}>
            &times;
          </button>
          <div className="schedule-create-header">
            <p className="schedule-create-step-indicator">{step} / 5</p>
            <h2 className="schedule-create-title">{getStepTitle(step)}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <SwitchTransition>
              <CSSTransition key={step} timeout={300} classNames="fade">
                <div>
                  {step === 1 && (
                    <div className="schedule-create-section-card">
                      <div className="schedule-create-form-inline">
                        <label
                          htmlFor="categoryId"
                          className="schedule-create-inline-label"
                        >
                          카테고리
                        </label>

                        <div className="schedule-create-inline-select-wrapper">
                          {categories.length === 0 ? (
                            // 🔸 카테고리가 없을 때
                            <div className="schedule-create-inline-empty">
                              생성된 카테고리가 없습니다.
                            </div>
                          ) : (
                            <>
                              <div
                                className="schedule-create-inline-select"
                                onClick={() => setShowDropdown((prev) => !prev)}
                              >
                                {formData.categoryId
                                  ? categories.find(
                                      (c) =>
                                        c.categoryId === formData.categoryId
                                    )?.name || "선택"
                                  : "선택"}
                                <span className="schedule-create-inline-arrow">
                                  ▼
                                </span>
                              </div>

                              {showDropdown && (
                                <ul className="schedule-create-inline-dropdown">
                                  {categories.map((c) => (
                                    <li
                                      key={c.categoryId}
                                      className="schedule-create-inline-option"
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          categoryId: c.categoryId,
                                        }));
                                        setShowDropdown(false);
                                      }}
                                    >
                                      {c.name}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="schedule-create-form-inline">
                        <label
                          htmlFor="title"
                          className="schedule-create-inline-label"
                        >
                          제목
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          className="schedule-create-input"
                          value={formData.title || ""}
                          onChange={handleChange}
                          placeholder="제목을 입력하세요"
                        />
                      </div>

                      <div className="schedule-create-form-inline">
                        <textarea
                          id="content"
                          name="content"
                          className="schedule-create-textarea"
                          value={formData.content || ""}
                          onChange={handleChange}
                          placeholder="일정에 대한 내용을 작성하세요"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="schedule-create-section-card">
                      {pets.length === 0 ? (
                        <div className="schedule-create-empty-pets">
                          <div className="schedule-create-empty-pets-title">
                            등록된 반려동물이 없습니다
                          </div>
                          <div className="schedule-create-empty-pets-sub">
                            반려동물을 먼저 등록해주세요
                          </div>
                        </div>
                      ) : (
                        <ul className="schedule-create-pet-select-container">
                          {pets.map((pet) => (
                            <li
                              key={pet.petId}
                              className={`schedule-create-pet-select-card ${
                                formData.petId.includes(pet.petId)
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handlePetSelectionChange(pet.petId)
                              }
                            >
                              <PetImage
                                src={pet.image}
                                alt={pet.name}
                                title={pet.name}
                                className="schedule-create-pet-image"
                              />
                              <div className="schedule-create-info">
                                <div className="schedule-create-name">
                                  {pet.name}
                                </div>
                                <div className="schedule-create-species">
                                  {pet.breed}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="schedule-create-step3">
                    {step === 3 && (
                      <>
                        <div
                          className={`schedule-create-tab-wrapper ${
                            formData.repeatYn ? "repeat-mode" : "direct-mode"
                          }`}
                        >
                          <div className="schedule-create-tab-buttons">
                            <button
                              type="button"
                              className={`schedule-create-tab-button ${
                                formData.repeatYn ? "active" : ""
                              }`}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  repeatYn: true,
                                }))
                              }
                            >
                              <div className="schedule-create-tab-label-with-tooltip">
                                반복 선택
                                <div className="schedule-create-tooltip-container">
                                  <FiInfo className="schedule-create-info-icon" />
                                  <span className="schedule-create-tooltip-text">
                                    <span style={{ color: "#ff5a3c" }}>
                                      반복 선택
                                    </span>
                                    은 시작/종료 날짜와
                                    <br />
                                    주기/간격을 통해 일정이 자동 생성됩니다.
                                    <br />
                                    <span style={{ color: "#ff5a3c" }}>
                                      날짜 직접 선택
                                    </span>
                                    은 수동으로 지정합니다.
                                  </span>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              className={`schedule-create-tab-button ${
                                !formData.repeatYn ? "active" : ""
                              }`}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  repeatYn: false,
                                }))
                              }
                            >
                              날짜 직접 선택
                            </button>
                          </div>
                        </div>

                        {formData.repeatYn && (
                          <div className="schedule-create-section-card-step3">
                            <div className="schedule-create-form-row">
                              <div className="schedule-create-input-group">
                                <label className="schedule-create-label-with-count">
                                  반복 주기
                                </label>

                                <div className="schedule-create-step3-select-wrapper">
                                  <div
                                    className={`schedule-create-step3-select-box ${
                                      showFrequencyDropdown ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      setShowFrequencyDropdown((prev) => !prev)
                                    }
                                  >
                                    {formData.repeatPattern.frequency === "DAY"
                                      ? "일일"
                                      : formData.repeatPattern.frequency ===
                                        "WEEK"
                                      ? "주간"
                                      : formData.repeatPattern.frequency ===
                                        "MONTH"
                                      ? "월간"
                                      : "선택"}
                                    <span className="schedule-create-step3-select-arrow">
                                      ▼
                                    </span>
                                  </div>

                                  {showFrequencyDropdown && (
                                    <ul className="schedule-create-step3-select-dropdown">
                                      {[
                                        { value: "DAY", label: "일일" },
                                        { value: "WEEK", label: "주간" },
                                        { value: "MONTH", label: "월간" },
                                      ].map((option) => (
                                        <li
                                          key={option.value}
                                          className={`schedule-create-step3-select-option ${
                                            formData.repeatPattern.frequency ===
                                            option.value
                                              ? "selected"
                                              : ""
                                          }`}
                                          onClick={() => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              repeatPattern: {
                                                ...prev.repeatPattern,
                                                frequency: option.value,
                                              },
                                            }));
                                            setShowFrequencyDropdown(false);
                                          }}
                                        >
                                          {option.label}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>

                              <div className="schedule-create-input-group">
                                <label className="schedule-create-label-with-info">
                                  반복 간격
                                  <div className="schedule-create-tooltip-container">
                                    <FiInfo className="schedule-create-info-icon" />
                                    <span className="schedule-create-tooltip-text">
                                      반복 주기마다 건너뛰는 간격을 의미하며
                                      <br />
                                      <strong style={{ color: "#ff5a3c" }}>
                                        주간(월간)
                                      </strong>
                                      으로 선택 시
                                      <br />
                                      선택한 요일(날짜)마다 선택한 간격으로
                                      반복합니다.
                                    </span>
                                  </div>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  name="repeatPattern.interval"
                                  value={formData.repeatPattern.interval}
                                  onChange={handleChange}
                                  className="schedule-create-input-step3"
                                />
                              </div>
                            </div>

                            {formData.repeatPattern.frequency === "WEEK" && (
                              <div className="schedule-create-repeat-buttons-week">
                                {["일", "월", "화", "수", "목", "금", "토"].map(
                                  (day) => (
                                    <button
                                      key={day}
                                      type="button"
                                      className={`schedule-create-week-button ${
                                        formData.repeatPattern.daysOfWeek.includes(
                                          dayMapping[day]
                                        )
                                          ? "selected"
                                          : ""
                                      }`}
                                      onClick={() => handleDayClick(day)}
                                    >
                                      {day}
                                    </button>
                                  )
                                )}
                              </div>
                            )}

                            {formData.repeatPattern.frequency === "MONTH" && (
                              <div className="schedule-create-repeat-buttons-month">
                                {Array.from(
                                  { length: 31 },
                                  (_, i) => i + 1
                                ).map((day) => (
                                  <button
                                    key={day}
                                    type="button"
                                    className={`schedule-create-month-button ${
                                      formData.repeatPattern.daysOfMonth.includes(
                                        day
                                      )
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() => handleDayOfMonthClick(day)}
                                  >
                                    {day}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="schedule-create-form-row">
                              <div className="schedule-create-input-group wide">
                                <label className="schedule-create-form-label">
                                  일정 반복 시작
                                </label>
                                <DateTimeSelect
                                  value={formData.repeatPattern.startDate}
                                  onChange={(newValue) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      repeatPattern: {
                                        ...prev.repeatPattern,
                                        startDate: newValue,
                                      },
                                    }))
                                  }
                                />
                              </div>

                              <div className="schedule-create-input-group wide">
                                <label className="schedule-create-form-label">
                                  일정 반복 종료
                                </label>
                                <DateTimeSelect
                                  value={formData.repeatPattern.endDate}
                                  onChange={(newValue) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      repeatPattern: {
                                        ...prev.repeatPattern,
                                        endDate: newValue,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {!formData.repeatYn && (
                          <div className="schedule-create-step3-calendar-wrapper">
                            <div
                              className="schedule-create-step3-mini-calendar"
                              ref={calendarRef}
                            >
                              <div className="schedule-create-step3-mini-calendar-header">
                                <button
                                  type="button"
                                  className="schedule-create-step3-nav-btn"
                                  onClick={() =>
                                    setCurrentDate(
                                      (prev) =>
                                        new Date(
                                          prev.getFullYear(),
                                          prev.getMonth() - 1,
                                          1
                                        )
                                    )
                                  }
                                >
                                  <ChevronLeftRoundedIcon
                                    sx={{ fontSize: 32 }}
                                  />
                                </button>

                                <span className="schedule-create-step3-month-label">
                                  {currentMonthStr}
                                </span>

                                <button
                                  type="button"
                                  className="schedule-create-step3-nav-btn"
                                  onClick={() =>
                                    setCurrentDate(
                                      (prev) =>
                                        new Date(
                                          prev.getFullYear(),
                                          prev.getMonth() + 1,
                                          1
                                        )
                                    )
                                  }
                                >
                                  <ChevronRightRoundedIcon
                                    sx={{ fontSize: 32 }}
                                  />
                                </button>
                              </div>

                              {groupDatesByWeek(
                                getStartOfMonth(),
                                getEndOfMonth()
                              ).map((week, i) => (
                                <div
                                  key={i}
                                  className="schedule-create-step3-week-row"
                                >
                                  {week.map((date, j) => {
                                    const formatted = new Date(
                                      date.getTime() + 9 * 60 * 60 * 1000
                                    )
                                      .toISOString()
                                      .slice(0, 10);

                                    const isSelected =
                                      formData.selectedDates.some(
                                        (d) => d.date === formatted
                                      );
                                    const isToday =
                                      date.toLocaleDateString("sv-SE", {
                                        timeZone: "Asia/Seoul",
                                      }) ===
                                      new Date().toLocaleDateString("sv-SE", {
                                        timeZone: "Asia/Seoul",
                                      });

                                    return (
                                      <div
                                        key={j}
                                        className={`schedule-create-step3-day
                ${isToday ? "today" : ""}
                ${isSelected ? "selected" : ""}
                ${isToday && isSelected ? "today-selected" : ""}
              `}
                                        onClick={() => handleDateChange(date)}
                                      >
                                        {date.getDate()}
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>

                            {/* ➡ 우측 선택된 날짜 */}
                            <div
                              className="schedule-create-step3-selected-dates-box"
                              style={{
                                height: syncedHeight
                                  ? `${syncedHeight}px`
                                  : "auto",
                              }}
                            >
                              <div className="schedule-create-step3-selected-dates-title-row">
                                <div className="schedule-create-step3-selected-dates-title">
                                  선택된 날짜
                                </div>
                                <button
                                  className="schedule-create-step3-clear-btn"
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      selectedDates: [],
                                    }))
                                  }
                                >
                                  전체해제
                                </button>
                              </div>

                              <div
                                className={`schedule-create-step3-date-list ${
                                  formData.selectedDates.length % 2 === 1
                                    ? "align-left"
                                    : ""
                                }`}
                                style={{
                                  overflowY: "auto",
                                  maxHeight: `${syncedHeight - 48 - 24}px`,
                                }}
                              >
                                {formData.selectedDates.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="schedule-create-step3-date-pill"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        selectedDates:
                                          prev.selectedDates.filter(
                                            (d) => d.date !== item.date
                                          ),
                                      }))
                                    }
                                  >
                                    {item.date}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="schedule-create-step3-allday">
                          {/* 하루종일 스위치 박스 */}
                          <div className="schedule-create-allday-box">
                            <span className="schedule-create-allday-label">
                              하루종일 설정
                              <div className="schedule-create-tooltip-container">
                                <FiInfo className="schedule-create-info-icon" />
                                <span className="schedule-create-tooltip-text">
                                  시간 설정 없이 일정을{" "}
                                  <span
                                    style={{
                                      fontWeight: "600",
                                      color: "#ff5a3c",
                                    }}
                                  >
                                    하루 전체
                                  </span>
                                  로 간주됩니다
                                  <br />
                                  알림 설정 시 해당 날짜 자정 기준으로
                                  설정됩니다
                                </span>
                              </div>
                            </span>
                            <label className="schedule-create-switch">
                              <input
                                type="checkbox"
                                name="isAllDay"
                                checked={formData.isAllDay}
                                onChange={handleChange}
                              />
                              <span className="schedule-create-slider round"></span>
                            </label>
                          </div>

                          {/* 시간 설정 or 하루종일 텍스트 */}
                          <div
                            className={`schedule-create-time-box ${
                              !formData.isAllDay ? "active-time-box" : ""
                            }`}
                          >
                            {formData.isAllDay ? (
                              <div className="schedule-create-time-allday-text">
                                선택한 일정 시간을 <br />
                                자정으로 설정합니다
                              </div>
                            ) : (
                              <div
                                className="schedule-create-time-setting"
                                style={{ width: "100%" }}
                              >
                                {formData.isAllDay ? (
                                  <div className="schedule-create-time-allday-text">
                                    선택한 일정 시간을
                                    <br /> 자정으로 설정합니다
                                  </div>
                                ) : (
                                  <TimeSelect
                                    value={formData.scheduleTime || "00:00"}
                                    onChange={(v) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        scheduleTime: v,
                                      }))
                                    }
                                    step={5}
                                    disabled={false}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {step === 4 && (
                    <div className="schedule-create-section-card">
                      <div className="schedule-create-priority">
                        <div className="schedule-create-priority-select">
                          {[
                            {
                              label: "낮음",
                              value: "LOW",
                              className: "priority-low",
                            },
                            {
                              label: "보통",
                              value: "MEDIUM",
                              className: "priority-medium",
                            },
                            {
                              label: "높음",
                              value: "HIGH",
                              className: "priority-high",
                            },
                          ].map((option) => (
                            <div
                              key={option.value}
                              className={`schedule-create-priority-option ${
                                formData.priority === option.value
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  priority: option.value,
                                })
                              }
                            >
                              <span
                                className={`schedule-create-priority-dot ${option.className}`}
                              />
                              {option.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="schedule-create-alert-section-card">
                      <div className="schedule-create-alert-group">
                        <div className="schedule-create-alert-row">
                          <label className="schedule-create-alert-label">
                            알림 설정
                            <div className="schedule-create-tooltip-container">
                              <FiInfo className="schedule-create-info-icon" />
                              <span className="schedule-create-tooltip-text">
                                <span
                                  style={{
                                    fontWeight: "600",
                                    color: "#ff5a3c",
                                  }}
                                >
                                  설정한 시간 전
                                </span>
                                에 일정 시작 알림을 받을 수 있습니다
                              </span>
                            </div>
                          </label>
                          <label className="schedule-create-switch">
                            <input
                              type="checkbox"
                              name="noticeYn"
                              checked={formData.noticeYn}
                              onChange={handleChange}
                            />
                            <span className="schedule-create-slider round"></span>
                          </label>
                        </div>

                        {formData.noticeYn && (
<div className="schedule-create-alert-row">
  <div className="schedule-create-alert-select-wrapper">
    <button
      type="button"
      className={`schedule-create-alert-select ${alertOpen ? "active" : ""}`}
      onClick={() => setAlertOpen((p) => !p)}
    >
      {noticeOptions.find(o => Number(o.value) === Number(formData.noticeAt))?.label}
      <span className="schedule-create-alert-arrow">▼</span>
    </button>

    {alertOpen && (
      <ul className="schedule-create-alert-dropdown">
        {noticeOptions.map((opt) => (
          <li
            key={opt.value}
            className={`schedule-create-alert-option ${
              Number(formData.noticeAt) === Number(opt.value) ? "selected" : ""
            }`}
            onClick={() => {
              handleChange({ target: { name: "noticeAt", value: opt.value } });
              setAlertOpen(false);
            }}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CSSTransition>
            </SwitchTransition>
          </form>
        </div>
        <div className="schedule-create-bottom-btn">
          {step < 5 ? (
            <button
              type="button"
              className="schedule-create-next-btn"
              onClick={goToNext}
              disabled={!isStepValid()}
            >
              다음으로
            </button>
          ) : (
            <button
              type="button"
              className="schedule-create-next-btn"
              onClick={handleSubmit}
              disabled={!isStepValid()}
            >
              일정 생성
            </button>
          )}
        </div>
      </div>
      {showAlert && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
};

export default ScheduleModal;
