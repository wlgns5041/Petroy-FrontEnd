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

  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
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
      setEmailGuide("이메일 중복확인을 해주세요");
    }

    if (name === "name") {
      setNameChecked(false);
      setNameGuide("이름 중복확인을 해주세요");
    }

    if (name === "phone") {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      const isValid = phoneRegex.test(value);
      setPhoneValid(isValid);
      setPhoneError(
        isValid ? "사용 가능한 번호입니다" : "양식에 일치하지 않습니다"
      );
    }
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
    try {
      const response = await axios.get(`${API_BASE_URL}/members/check-email`, {
        params: { email: formData.email },
      });
      if (response.status === 200) {
        setEmailChecked(true);
        setEmailError("사용 가능한 이메일입니다.");
      }
    } catch (error) {
      setEmailChecked(false);
      setEmailError("이미 사용 중인 이메일입니다.");
    }
  };

  const checkNameDuplicate = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/members/check-name`, {
        params: { name: formData.name },
      });
      if (response.status === 200) {
        setNameChecked(true);
        setNameError("사용 가능한 이름입니다.");
      }
    } catch (error) {
      setNameChecked(false);
      setNameError("이미 사용 중인 이름입니다.");
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

              {emailChecked ? (
                <div className="input-success-message">
                  <FaCheckCircle className="success-icon" />
                  <span>{emailError}</span>{" "}
                </div>
              ) : (
                emailGuide && (
                  <div className="input-error-message">
                    <FaExclamationCircle className="error-icon" />
                    <span>{emailGuide}</span>
                  </div>
                )
              )}
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
                  className={passwordCriteria.uppercase ? "valid" : "invalid"}
                >
                  {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />}{" "}
                  대문자 포함
                </li>
                <li
                  className={passwordCriteria.lowercase ? "valid" : "invalid"}
                >
                  {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />}{" "}
                  소문자 포함
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
              <div className="passwordInputWrapper">
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

              {/* 비밀번호 확인 에러/성공 메시지 */}
              {confirmPasswordTouched &&
                (passwordMismatch ? (
                  <div className="input-error-message">
                    <FaExclamationCircle className="error-icon" />
                    <span>비밀번호가 일치하지 않습니다</span>
                  </div>
                ) : (
                  <div className="input-success-message">
                    <FaCheckCircle className="success-icon" />
                    <span>비밀번호가 일치합니다</span>
                  </div>
                ))}
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

              {nameChecked ? (
                <div className="input-success-message">
                  <FaCheckCircle className="success-icon" />
                  <span>{nameError}</span>
                </div>
              ) : (
                nameGuide && (
                  <div className="input-error-message">
                    <FaExclamationCircle className="error-icon" />
                    <span>{nameGuide}</span>
                  </div>
                )
              )}
            </div>

            <div className="signUpFormGroup">
              <input
                type="tel"
                name="phone"
                placeholder="휴대폰 번호 ( - 포함 )"
                value={formData.phone}
                onChange={handleChange}
                className={phoneValid || !phoneError ? "" : "input-error"}
                required
              />

              {phoneError &&
                (phoneValid ? (
                  <div className="input-success-message">
                    <FaCheckCircle className="success-icon" />
                    <span>{phoneError}</span>
                  </div>
                ) : (
                  <div className="input-error-message">
                    <FaExclamationCircle className="error-icon" />
                    <span>{phoneError}</span>
                  </div>
                ))}
            </div>

            <div className="signUpButtonGroup">
              <button type="button" onClick={() => navigate("/")}>
                홈으로
              </button>
              <button type="submit" disabled={!isFormValid}>
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
