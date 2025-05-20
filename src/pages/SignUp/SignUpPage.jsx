import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/SignUp/SignUpPage.css";
import careImage from "../../assets/images/dogpaw.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function SignUpPage() {
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
    phoneValid;

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
      if (!emailGuide || emailChecked) {
        setEmailGuide("이메일 중복확인을 해주세요");
      }
    }

    if (name === "name") {
      setNameChecked(false);
      setNameGuide("이름 중복확인을 해주세요");
    }

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
    
      let formatted = numericValue;
    
      if (numericValue.length <= 3) {
        formatted = numericValue;
      } else if (numericValue.length <= 7) {
        formatted = `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`;
      } else if (numericValue.length <= 11) {
        formatted = `${numericValue.slice(0, 3)}-${numericValue.slice(3, 7)}-${numericValue.slice(7, 11)}`;
      } else {
        formatted = `${numericValue.slice(0, 3)}-${numericValue.slice(3, 7)}-${numericValue.slice(7, 11)}`;
      }
    
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      const isValid = phoneRegex.test(formatted);
      setPhoneValid(isValid);
      setPhoneError(isValid ? "사용 가능한 번호입니다" : "양식에 일치하지 않습니다");
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

  const checkEmailDuplicate = async () => {
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
      const response = await axios.get(`${API_BASE_URL}/members/check-email`, {
        params: { email: formData.email },
      });
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

  const checkNameDuplicate = async () => {
    if (!formData.name.trim()) {
      setNameChecked(false);
      setNameGuide("이름을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/members/check-name`, {
        params: { name: formData.name },
      });
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
      const response = await axios.post(`${API_BASE_URL}/members`, payload);
      if (response.status === 200) {
        alert("회원가입 성공");
        navigate("/login");
      }
    } catch (error) {
      alert("회원가입 실패");
    }
  };

  return (
    <div className="signUpPage">
      <div className="signUpPageContainer">
        <div className="signUpLeftSection">
          <img
            src={careImage}
            alt="Signup Illustration"
            className="signupImage"
          />
        </div>
        <div className="signUpRightSection">
          <form onSubmit={handleSubmit}>
            <div className="signUpHeader">
              <h2>
                회원가입을 통해
                <br />
                반려동물과의 일상을 관리해보세요
              </h2>
              <p>일정을 기록하고 친구와 함께 반려동물을 돌볼 수 있어요</p>
            </div>
            <div className="signUpFormGroup">
              <div className="inputWithButton">
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  className={!emailChecked && emailGuide ? "input-error" : ""}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="checkButton"
                  onClick={checkEmailDuplicate}
                >
                  중복 확인
                </button>
              </div>

              <div
                className={`message-area ${!emailGuide ? "hidden" : ""} ${
                  emailChecked ? "input-success-message" : "input-error-message"
                }`}
              >
                {emailChecked ? (
                  <FaCheckCircle className="success-icon" />
                ) : (
                  <FaExclamationCircle className="error-icon" />
                )}
                <span>{emailGuide || " "}</span>
              </div>
            </div>

            <div className="signUpFormGroup">
              <div className="passwordInputWrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="비밀번호"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="passwordCriteriaBox">
              <ul className="criteriaList">
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

            <div className="signUpFormGroup">
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="비밀번호 확인"
                  className={
                    confirmPasswordTouched && passwordMismatch
                      ? "input-error"
                      : ""
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>

              <div
                className={`message-area ${
                  !confirmPasswordTouched ? "hidden" : ""
                } ${
                  !formData.password
                    ? "input-error-message"
                    : !Object.values(passwordCriteria).every(Boolean)
                    ? "input-error-message"
                    : passwordMismatch
                    ? "input-error-message"
                    : "input-success-message"
                }`}
              >
                {!formData.password ? (
                  <>
                    <FaExclamationCircle className="error-icon" />
                    <span>비밀번호를 먼저 입력해주세요</span>
                  </>
                ) : !Object.values(passwordCriteria).every(Boolean) ? (
                  <>
                    <FaExclamationCircle className="error-icon" />
                    <span>비밀번호 양식을 확인해주세요</span>
                  </>
                ) : passwordMismatch ? (
                  <>
                    <FaExclamationCircle className="error-icon" />
                    <span>비밀번호가 일치하지 않습니다</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="success-icon" />
                    <span>비밀번호가 일치합니다</span>
                  </>
                )}
              </div>
            </div>

            <div className="signUpFormGroup">
              <div className="inputWithButton">
                <input
                  type="text"
                  name="name"
                  placeholder="이름"
                  className={!nameChecked && nameGuide ? "input-error" : ""}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="checkButton"
                  onClick={checkNameDuplicate}
                >
                  중복 확인
                </button>
              </div>

              <div
                className={`message-area ${!nameGuide ? "hidden" : ""} ${
                  nameChecked ? "input-success-message" : "input-error-message"
                }`}
              >
                {nameChecked ? (
                  <FaCheckCircle className="success-icon" />
                ) : (
                  <FaExclamationCircle className="error-icon" />
                )}
                <span>{nameGuide || " "}</span>
              </div>
            </div>

            <div className="signUpFormGroup">
              <input
                type="tel"
                name="phone"
                placeholder="휴대폰 번호"
                value={formData.phone}
                onChange={handleChange}
                className={phoneValid || !phoneError ? "" : "input-error"}
                required
              />

              <div
                className={`message-area ${!phoneError ? "hidden" : ""} ${
                  phoneValid ? "input-success-message" : "input-error-message"
                }`}
              >
                {phoneValid ? (
                  <FaCheckCircle className="success-icon" />
                ) : (
                  <FaExclamationCircle className="error-icon" />
                )}
                <span>{phoneError || " "}</span>
              </div>
            </div>

            <div className="signUpButtonGroup">
              <button type="button" onClick={() => navigate("/")}>
                홈으로
              </button>
              <button type="submit" disabled={!isFormValid}>
                회원가입
              </button>
            </div>

            <div className="signInText">
              <div className="signInWrapper">
                <span className="signInPrompt">이미 아이디가 있다면?</span>
                <span className="signInLink" onClick={() => navigate("/login")}>
                  로그인하러가기
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
