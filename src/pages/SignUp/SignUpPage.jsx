import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SignUp/SignUpPage.css";
import { FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  checkEmailDuplicate,
  checkNameDuplicate,
  registerMember,
} from "../../services/MemberService";
import AlertModal from "../../components/commons/AlertModal.jsx";

function SignUpPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    function setAppHeight() {
      const vh = window.innerHeight; 
      document.documentElement.style.setProperty("--app-height", `${vh}px`);
    }

    window.addEventListener("resize", setAppHeight);
    setAppHeight();

    return () => {
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    age: false,
    marketing: false,
  });

  const [agreementsOpen, setAgreementsOpen] = useState(false);

  const toggleAgreements = () => setAgreementsOpen(!agreementsOpen);

  const allRequiredAgreed =
    agreements.terms && agreements.privacy && agreements.age;

  const [emailChecked, setEmailChecked] = useState(false);
  const [nameChecked, setNameChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailGuide, setEmailGuide] = useState("");
  const [nameGuide, setNameGuide] = useState("");
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  const showAlert = (message, onConfirm = null) => {
    setAlert({ show: true, message, onConfirm });
  };

  const closeAlert = () => {
    setAlert({ show: false, message: "", onConfirm: null });
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.name &&
    formData.phone &&
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.lowercase &&
    passwordCriteria.number &&
    passwordCriteria.specialChar &&
    formData.password === formData.confirmPassword &&
    emailChecked &&
    nameChecked &&
    phoneValid &&
    allRequiredAgreed;
  // ----------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePassword(value);
      setPasswordMismatch(value !== formData.confirmPassword);
    }

    if (name === "confirmPassword") {
      if (!confirmPasswordTouched) {
        setConfirmPasswordTouched(true);
      }
      setPasswordMismatch(value !== formData.password);
    }

    if (name === "email") {
      setEmailChecked(false);
      setEmailGuide(value ? "이메일 중복확인을 해주세요" : "");
    }
    if (name === "name") {
      setNameChecked(false);
      setNameGuide(value ? "이름 중복확인을 해주세요" : "");
    }

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");

      let formatted = numericValue;

      if (numericValue.length <= 3) {
        formatted = numericValue;
      } else if (numericValue.length <= 7) {
        formatted = `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`;
      } else if (numericValue.length <= 11) {
        formatted = `${numericValue.slice(0, 3)}-${numericValue.slice(
          3,
          7
        )}-${numericValue.slice(7, 11)}`;
      } else {
        formatted = `${numericValue.slice(0, 3)}-${numericValue.slice(
          3,
          7
        )}-${numericValue.slice(7, 11)}`;
      }

      setFormData((prev) => ({ ...prev, [name]: formatted }));

      const phoneRegex = /^010-\d{4}-\d{4}$/;
      const isValid = phoneRegex.test(formatted);
      setPhoneValid(isValid);
      setPhoneError(
        isValid ? "사용 가능한 번호입니다" : "양식에 일치하지 않습니다"
      );
      return;
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    setAgreements((prev) => ({ ...prev, [name]: checked }));
  };

  const allChecked =
    agreements.terms &&
    agreements.privacy &&
    agreements.age &&
    agreements.marketing;

  const handleCheckEmail = async () => {
    if (!formData.email) {
      setEmailChecked(false);
      setEmailGuide("이메일을 입력해주세요.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setEmailChecked(false);
      setEmailGuide("이메일 형식을 확인해주세요");
      return;
    }

    try {
      const response = await checkEmailDuplicate(formData.email);
      if (response.status === 200) {
        setEmailChecked(true);
        setEmailGuide("사용 가능한 이메일입니다.");
      }
    } catch (error) {
      setEmailChecked(false);
      const errorMessage =
        error.response?.data?.errorMessage || "중복된 이메일입니다.";
      setEmailGuide(errorMessage);
    }
  };

  const handleCheckName = async () => {
    if (!formData.name.trim()) {
      setNameChecked(false);
      setNameGuide("이름을 입력해주세요.");
      return;
    }

    try {
      const response = await checkNameDuplicate(formData.name);
      if (response.status === 200) {
        setNameChecked(true);
        setNameGuide("사용 가능한 이름입니다.");
      }
    } catch (error) {
      setNameChecked(false);
      const errorMessage =
        error.response?.data?.errorMessage || "중복된 이름입니다.";
      setNameGuide(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
    };

    try {
      const response = await registerMember(payload);
      if (response.status === 200) {
        showAlert("회원가입 성공", () => navigate("/login"));
      }
    } catch (error) {
      showAlert("회원가입 실패");
    }
  };

  const handleAlertConfirm = () => {
    const { onConfirm } = alert;
    closeAlert();
    if (onConfirm) onConfirm();
  };

  return (
    <div className="signuppage">
      <div className="signuppage-container" ref={containerRef}>
        <div className="signuppage-section">
          <form onSubmit={handleSubmit}>
            <div className="signuppage-textarea">
              <h2>
                회원가입을 통해
                <br />
                반려동물과의 일상을 관리해보세요
              </h2>
              <p>일정을 기록하고 친구와 함께 반려동물을 돌볼 수 있어요</p>
            </div>

            <div className="signuppage-formgroup">
              <div className="signuppage-email">
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className={
                    !emailChecked && emailGuide ? "signuppage-error" : ""
                  }
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="signuppage-checkbutton"
                  onClick={handleCheckEmail}
                >
                  중복 확인
                </button>
              </div>

              <div
                className={`signuppage-message ${!emailGuide ? "hidden" : ""} ${
                  emailChecked
                    ? "signuppage-success-message"
                    : "signuppage-error-message"
                }`}
              >
                {emailChecked ? (
                  <FaCheckCircle className="signuppage-success-icon" />
                ) : (
                  <FaExclamationCircle className="signuppage-error-icon" />
                )}
                <span>{emailGuide || " "}</span>
              </div>
            </div>

            <div className="signuppage-formgroup">
              <div className="signuppage-password">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="signuppage-password-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="signuppage-password-criteria">
              <ul className="signuppage-password-criterialist">
                <li className={passwordCriteria.length ? "valid" : "invalid"}>
                  {passwordCriteria.length ? <FaCheck /> : <FaTimes />} 8자 이상
                </li>
                <li
                  className={passwordCriteria.lowercase ? "valid" : "invalid"}
                >
                  {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />}{" "}
                  소문자 포함
                </li>
                <li
                  className={passwordCriteria.uppercase ? "valid" : "invalid"}
                >
                  {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />}{" "}
                  대문자 포함
                </li>
                <li className={passwordCriteria.number ? "valid" : "invalid"}>
                  {passwordCriteria.number ? <FaCheck /> : <FaTimes />} 숫자
                  포함
                </li>
                <li
                  className={passwordCriteria.specialChar ? "valid" : "invalid"}
                >
                  {passwordCriteria.specialChar ? <FaCheck /> : <FaTimes />}{" "}
                  특수문자 포함
                </li>
              </ul>
            </div>

            <div className="signuppage-formgroup">
              <div className="signuppage-password">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="비밀번호 확인"
                  className={
                    confirmPasswordTouched && passwordMismatch
                      ? "signuppage-error"
                      : ""
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span
                  className="signuppage-password-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>

              <div
                className={`signuppage-message ${
                  !confirmPasswordTouched ? "hidden" : ""
                } ${
                  !formData.password
                    ? "signuppage-error-message"
                    : !Object.values(passwordCriteria).every(Boolean)
                    ? "signuppage-error-message"
                    : passwordMismatch
                    ? "signuppage-error-message"
                    : "signuppage-success-message"
                }`}
              >
                {!formData.password ? (
                  <>
                    <FaExclamationCircle className="signuppage-error-icon" />
                    <span>비밀번호를 먼저 입력해주세요</span>
                  </>
                ) : !Object.values(passwordCriteria).every(Boolean) ? (
                  <>
                    <FaExclamationCircle className="signuppage-error-icon" />
                    <span>비밀번호 양식을 확인해주세요</span>
                  </>
                ) : passwordMismatch ? (
                  <>
                    <FaExclamationCircle className="signuppage-error-icon" />
                    <span>비밀번호가 일치하지 않습니다</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="signuppage-success-icon" />
                    <span>비밀번호가 일치합니다</span>
                  </>
                )}
              </div>
            </div>

            <div className="signuppage-formgroup">
              <div className="signuppage-name">
                <input
                  type="text"
                  name="name"
                  placeholder="이름"
                  className={
                    !nameChecked && nameGuide ? "signuppage-error" : ""
                  }
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="signuppage-checkbutton"
                  onClick={handleCheckName}
                >
                  중복 확인
                </button>
              </div>

              <div
                className={`signuppage-message ${!nameGuide ? "hidden" : ""} ${
                  nameChecked
                    ? "signuppage-success-message"
                    : "signuppage-error-message"
                }`}
              >
                {nameChecked ? (
                  <FaCheckCircle className="signuppage-success-icon" />
                ) : (
                  <FaExclamationCircle className="signuppage-error-icon" />
                )}
                <span>{nameGuide || " "}</span>
              </div>
            </div>

            <div className="signuppage-formgroup">
              <input
                type="tel"
                name="phone"
                placeholder="휴대폰 번호"
                value={formData.phone}
                onChange={handleChange}
                className={phoneValid || !phoneError ? "" : "signuppage-error"}
                required
              />

              <div
                className={`signuppage-message ${!phoneError ? "hidden" : ""} ${
                  phoneValid
                    ? "signuppage-success-message"
                    : "signuppage-error-message"
                }`}
              >
                {phoneValid ? (
                  <FaCheckCircle className="signuppage-success-icon" />
                ) : (
                  <FaExclamationCircle className="signuppage-error-icon" />
                )}
                <span>{phoneError || " "}</span>
              </div>
            </div>

            <div className="signuppage-agreements-wrapper">
              <div
                className="signuppage-agreements-header"
                onClick={toggleAgreements}
              >
                <span className="agreements-title">약관동의</span>
                <div className="agreements-right">
                  <span
                    className={`check-all-text ${allChecked ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newChecked = !allChecked;
                      setAgreements({
                        terms: newChecked,
                        privacy: newChecked,
                        age: newChecked,
                        marketing: newChecked,
                      });
                    }}
                  >
                    전체선택
                  </span>
                  {agreementsOpen ? (
                    <FiChevronUp className="arrow-icon" />
                  ) : (
                    <FiChevronDown className="arrow-icon" />
                  )}
                </div>
              </div>

              {agreementsOpen && (
                <div className="signuppage-agreements">
                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={agreements.terms}
                      onChange={handleAgreementChange}
                    />
                    (필수) 이용약관 동의
                  </label>
                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      name="privacy"
                      checked={agreements.privacy}
                      onChange={handleAgreementChange}
                    />
                    (필수) 개인정보 수집 및 이용 동의
                  </label>
                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      name="age"
                      checked={agreements.age}
                      onChange={handleAgreementChange}
                    />
                    (필수) 만 14세 이상 확인
                  </label>
                  <label className="agreement-item">
                    <input
                      type="checkbox"
                      name="marketing"
                      checked={agreements.marketing}
                      onChange={handleAgreementChange}
                    />
                    (선택) 마케팅 정보 수신 동의
                  </label>
                </div>
              )}
            </div>

            <div className="signuppage-buttongroup">
              <button
                className="signuppage-homebutton"
                type="button"
                onClick={() => navigate("/")}
              >
                홈으로
              </button>
              <button type="submit" disabled={!isFormValid}>
                회원가입
              </button>
            </div>

            <div className="signuppage-bottomtext">
              <div className="signuppage-bottomtext-wrapper">
                <span className="signuppage-bottomtext-prompt">
                  이미 계정이 있나요?
                </span>
                <span
                  className="signuppage-bottomtext-link"
                  onClick={() => navigate("/login")}
                >
                  로그인하러가기
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {alert.show && (
        <AlertModal message={alert.message} onConfirm={handleAlertConfirm} />
      )}
    </div>
  );
}

export default SignUpPage;