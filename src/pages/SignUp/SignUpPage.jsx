import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/SignUp/SignUpPage.css';
import careImage from '../../assets/images/dogpaw.png';
import { FaCheck, FaTimes } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function SignUpPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailChecked, setEmailChecked] = useState(false);
    const [nameChecked, setNameChecked] = useState(false);

    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const handleHomeClick = () => {
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        if (name === 'name') {
            setNameChecked(false);
            setNameError('이름 중복 확인을 해주세요.');
        }

        if (name === 'email') {
            setEmailChecked(false);
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            setEmailError(emailValid ? '이메일 중복 확인을 해주세요.' : '이메일 형식을 확인해 주세요.');
        }

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validatePassword = (password) => {
        setPasswordCriteria({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[@$!%*?&]/.test(password)
        });
    };

    useEffect(() => {
        const isValid = 
            nameChecked &&
            emailChecked &&
            Object.values(passwordCriteria).every(Boolean) &&
            /^\d{3}-\d{4}-\d{4}$/.test(formData.phone);
        
        setIsFormValid(isValid);
    }, [nameChecked, emailChecked, passwordCriteria, formData.phone]);

    const checkEmailDuplicate = async () => {
        if (formData.email.trim() === '') {
            setEmailError('이메일을 입력해 주세요.');
            setEmailChecked(false);
            return;
        }

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (!emailValid) {
            setEmailError('이메일 형식을 확인해 주세요.');
            setEmailChecked(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/members/check-email`, {
                params: { email: formData.email }
            });

            if (response.status === 200) {
                setEmailError('사용 가능한 이메일입니다.');
                setEmailChecked(true);
            }
        } catch (error) {
            if (error.response) {
                setEmailError('중복된 이메일입니다.');
            } else if (error.request) {
                setEmailError('서버에 연결할 수 없습니다.');
            } else {
                setEmailError('알 수 없는 오류가 발생했습니다.');
            }
            setEmailChecked(false);
        }
    };

    const checkNameDuplicate = async () => {
        if (formData.name.trim() === '') {
            setNameError('이름을 입력해 주세요.');
            setNameChecked(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/members/check-name`, {
                params: { name: formData.name }
            });

            if (response.status === 200) {
                setNameError('사용 가능한 이름입니다.');
                setNameChecked(true);
            }
        } catch (error) {
            if (error.response) {
                setNameError('중복된 이름입니다.');
            } else if (error.request) {
                setNameError('서버에 연결할 수 없습니다.');
            } else {
                setNameError('알 수 없는 오류가 발생했습니다.');
            }
            setNameChecked(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nameChecked) {
            alert('이름 중복여부를 확인해주세요.');
            return;
        }
        if (!emailChecked) {
            alert('이메일 중복여부를 확인해주세요.');
            return;
        }
        if (!Object.values(passwordCriteria).every(Boolean)) {
            alert('비밀번호 양식을 확인해주세요.');
            return;
        }
        if (!/^\d{3}-\d{4}-\d{4}$/.test(formData.phone)) {
            alert('휴대폰 번호 양식을 확인해주세요.');
            return;
        }

        const data = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/members`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                alert('회원가입 성공');
                navigate('/login');
            }
        } catch (error) {
            alert('회원가입 실패');
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
                        <label htmlFor="name">이름</label>
                        <div className="inputGroup">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                maxLength="10"
                                placeholder="이름"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <button type="button" onClick={checkNameDuplicate} className="checkButton">
                                중복 확인
                            </button>
                        </div>
                        <p className={`name-error ${nameError ? 'visible' : ''}`}>{nameError}</p>
                    </div>
                    <div className="signUpFormGroup">
                        <label htmlFor="email">이메일</label>
                        <div className="inputGroup">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="abc123@naver.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <button type="button" onClick={checkEmailDuplicate} className="checkButton">
                                중복 확인
                            </button>
                        </div>
                        <p className={`email-error ${emailError ? 'visible' : ''}`}>{emailError}</p>
                    </div>
                    <div className="signUpFormGroup">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <div className="passwordCriteria">
                            <p className={passwordCriteria.length ? 'valid' : 'invalid'}>
                                {passwordCriteria.length ? <FaCheck /> : <FaTimes />} 8자 이상
                            </p>
                            <p className={passwordCriteria.uppercase ? 'valid' : 'invalid'}>
                                {passwordCriteria.uppercase ? <FaCheck /> : <FaTimes />} 영문 대문자 포함
                            </p>
                            <p className={passwordCriteria.lowercase ? 'valid' : 'invalid'}>
                                {passwordCriteria.lowercase ? <FaCheck /> : <FaTimes />} 영문 소문자 포함
                            </p>
                            <p className={passwordCriteria.number ? 'valid' : 'invalid'}>
                                {passwordCriteria.number ? <FaCheck /> : <FaTimes />} 숫자 포함
                            </p>
                            <p className={passwordCriteria.specialChar ? 'valid' : 'invalid'}>
                                {passwordCriteria.specialChar ? <FaCheck /> : <FaTimes />} 특수문자 포함
                            </p>
                        </div>
                    </div>
                    <div className="signUpFormGroup">
                        <label htmlFor="phone">휴대폰번호 (-포함)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="010-1234-5678"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="signUpButtonGroup">
                        <button type="button" onClick={handleHomeClick}>
                            홈으로
                        </button>
                        <button type="submit">
                            확인
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
}

export default SignUpPage;