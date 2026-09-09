import React, {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import API from "../services/api";


// ============================================================
// AUTH
// ============================================================

const Auth = () => {

    const navigate =
        useNavigate();


    const [
        isLogin,
        setIsLogin
    ] = useState(true);


    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        errorMsg,
        setErrorMsg
    ] = useState("");


    const [
        successMsg,
        setSuccessMsg
    ] = useState("");


    const [
        formData,
        setFormData
    ] = useState({
        full_name: "",
        email: "",
        password: "",
        phone: "",
    });


    // ========================================================
    // CHANGE INPUT
    // ========================================================

    const handleChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setFormData(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );


            setErrorMsg("");
            setSuccessMsg("");
        };


    // ========================================================
    // CHANGE MODE
    // ========================================================

    const changeMode =
        (loginMode) => {

            setIsLogin(
                loginMode
            );


            setErrorMsg("");
            setSuccessMsg("");
            setShowPassword(false);
        };


    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            if (loading) {
                return;
            }


            setLoading(true);
            setErrorMsg("");
            setSuccessMsg("");


            try {

                // =================================================
                // LOGIN
                // =================================================

                if (isLogin) {

                    const response =
                        await API.post(
                            "/auth/login",
                            {
                                email:
                                    formData.email.trim(),

                                password:
                                    formData.password,
                            }
                        );


                    const {
                        token,
                        user,
                    } = response.data;


                    if (
                        !token ||
                        !user
                    ) {

                        throw new Error(
                            "Dữ liệu đăng nhập không hợp lệ."
                        );
                    }


                    localStorage.setItem(
                        "token",
                        token
                    );


                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            user
                        )
                    );


                    setSuccessMsg(
                        "Đăng nhập thành công. Đang chuyển hướng..."
                    );


                    setTimeout(
                        () => {

                            if (
                                user?.role?.toLowerCase() ===
                                "admin"
                            ) {

                                navigate(
                                    "/admin"
                                );

                            } else {

                                navigate(
                                    "/"
                                );
                            }


                            window.location.reload();

                        },
                        700
                    );


                    return;
                }


                // =================================================
                // REGISTER
                // =================================================

                await API.post(
                    "/auth/register",
                    {
                        full_name:
                            formData.full_name.trim(),

                        email:
                            formData.email.trim(),

                        password:
                            formData.password,

                        phone:
                            formData.phone.trim(),
                    }
                );


                setSuccessMsg(
                    "Tạo tài khoản thành công. Bạn có thể đăng nhập ngay."
                );


                setFormData({
                    full_name: "",
                    email: "",
                    password: "",
                    phone: "",
                });


                setTimeout(
                    () => {

                        setIsLogin(true);
                        setSuccessMsg("");
                        setShowPassword(false);

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Lỗi xác thực:",
                    error
                );


                setErrorMsg(
                    error.response
                        ?.data
                        ?.message ||

                    error.message ||

                    "Có lỗi xảy ra, vui lòng thử lại."
                );


            } finally {

                setLoading(false);
            }
        };


    // ========================================================
    // FORGOT PASSWORD
    // ========================================================

    const handleForgotPassword =
        () => {

            setSuccessMsg("");

            setErrorMsg(
                "Chức năng quên mật khẩu sẽ được bổ sung sau."
            );
        };


    // ========================================================
    // RETURN
    // ========================================================

    return (

        <div className="boutique-auth-v2">


            {/* =================================================
                VISUAL
            ================================================= */}

            <section className="auth-editorial">


                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=92"
                    alt="BOUTIQUE Fashion"
                />


                <div className="editorial-overlay">
                </div>


                <div className="editorial-header">


                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        BOUTIQUE.
                    </button>


                    <span>
                        EST. 2026
                    </span>


                </div>


                <div className="editorial-center">


                    <div className="editorial-index">

                        <span>
                            01
                        </span>

                        <div>
                        </div>

                        <span>
                            ACCOUNT
                        </span>

                    </div>


                    <p className="editorial-kicker">
                        PRIVATE MEMBERS
                    </p>


                    <h1>

                        YOUR

                        <br />

                        STYLE,

                        <br />

                        YOUR

                        <span>
                            STORY.
                        </span>

                    </h1>


                    <div className="editorial-copy">

                        <p>
                            BOUTIQUE mang đến những lựa chọn
                            thời trang được tuyển chọn dành
                            cho phong cách hiện đại.
                        </p>


                        <span>
                            VIETNAM / 2026
                        </span>

                    </div>


                </div>


                <div className="editorial-bottom">

                    <span>
                        BOUTIQUE / PRIVATE COLLECTION
                    </span>


                    <span>
                        SCROLL — 01
                    </span>

                </div>


            </section>


            {/* =================================================
                FORM SIDE
            ================================================= */}

            <section className="auth-panel">


                <div className="auth-panel-inner">


                    {/* =============================================
                        TOP
                    ============================================= */}

                    <div className="panel-top">


                        <button
                            type="button"
                            className="home-link"
                            onClick={() =>
                                navigate("/")
                            }
                        >

                            <span>
                                ←
                            </span>

                            TRANG CHỦ

                        </button>


                        <span>
                            MEMBER / ACCESS
                        </span>


                    </div>


                    {/* =============================================
                        BRAND
                    ============================================= */}

                    <div className="panel-brand">


                        <span>
                            BOUTIQUE.
                        </span>


                        <small>
                            MEMBERS ONLY
                        </small>


                    </div>


                    {/* =============================================
                        MODE SELECTOR
                    ============================================= */}

                    <div className="mode-selector">


                        <div
                            className={
                                isLogin
                                    ? "mode-slider login"
                                    : "mode-slider register"
                            }
                        >
                        </div>


                        <button
                            type="button"
                            className={
                                isLogin
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                changeMode(true)
                            }
                        >
                            ĐĂNG NHẬP
                        </button>


                        <button
                            type="button"
                            className={
                                !isLogin
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                changeMode(false)
                            }
                        >
                            TẠO TÀI KHOẢN
                        </button>


                    </div>


                    {/* =============================================
                        HEADING
                    ============================================= */}

                    <div
                        className="panel-heading"
                        key={
                            isLogin
                                ? "login"
                                : "register"
                        }
                    >


                        <div className="heading-number">
                            {isLogin
                                ? "01"
                                : "02"}
                        </div>


                        <div>


                            <p>
                                {isLogin
                                    ? "WELCOME BACK"
                                    : "NEW MEMBER"}
                            </p>


                            <h2>

                                {isLogin
                                    ? (
                                        <>
                                            CHÀO MỪNG
                                            <br />
                                            TRỞ LẠI.
                                        </>
                                    )
                                    : (
                                        <>
                                            GIA NHẬP
                                            <br />
                                            BOUTIQUE.
                                        </>
                                    )}

                            </h2>


                            <span>

                                {isLogin
                                    ? "Đăng nhập để tiếp tục trải nghiệm mua sắm của bạn."
                                    : "Tạo tài khoản và bắt đầu hành trình phong cách riêng."}

                            </span>


                        </div>


                    </div>


                    {/* =============================================
                        MESSAGE
                    ============================================= */}

                    {errorMsg && (

                        <div className="auth-alert error">


                            <span>
                                !
                            </span>


                            <p>
                                {errorMsg}
                            </p>


                        </div>

                    )}


                    {successMsg && (

                        <div className="auth-alert success">


                            <span>
                                ✓
                            </span>


                            <p>
                                {successMsg}
                            </p>


                        </div>

                    )}


                    {/* =============================================
                        FORM
                    ============================================= */}

                    <form
                        className="luxury-form"
                        onSubmit={
                            handleSubmit
                        }
                    >


                        {!isLogin && (

                            <div className="luxury-field">


                                <div className="field-top">


                                    <label
                                        htmlFor="full_name"
                                    >
                                        HỌ VÀ TÊN
                                    </label>


                                    <span>
                                        01
                                    </span>


                                </div>


                                <input
                                    id="full_name"
                                    type="text"
                                    name="full_name"
                                    value={
                                        formData.full_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Nguyễn Văn A"
                                    autoComplete="name"
                                    required
                                />


                            </div>

                        )}


                        {!isLogin && (

                            <div className="luxury-field">


                                <div className="field-top">


                                    <label
                                        htmlFor="phone"
                                    >
                                        SỐ ĐIỆN THOẠI
                                    </label>


                                    <span>
                                        02
                                    </span>


                                </div>


                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="0901234567"
                                    autoComplete="tel"
                                />


                            </div>

                        )}


                        <div className="luxury-field">


                            <div className="field-top">


                                <label
                                    htmlFor="email"
                                >
                                    EMAIL
                                </label>


                                <span>

                                    {isLogin
                                        ? "01"
                                        : "03"}

                                </span>


                            </div>


                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="name@email.com"
                                autoComplete="email"
                                required
                            />


                        </div>


                        <div className="luxury-field">


                            <div className="field-top">


                                <label
                                    htmlFor="password"
                                >
                                    MẬT KHẨU
                                </label>


                                <span>

                                    {isLogin
                                        ? "02"
                                        : "04"}

                                </span>


                            </div>


                            <div className="password-control">


                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="••••••••"
                                    autoComplete={
                                        isLogin
                                            ? "current-password"
                                            : "new-password"
                                    }
                                    required
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) =>
                                                !current
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "ẨN"
                                        : "HIỆN"}
                                </button>


                            </div>


                        </div>


                        {/* =========================================
                            OPTIONS
                        ========================================= */}

                        {isLogin && (

                            <div className="form-options">


                                <label>


                                    <input
                                        type="checkbox"
                                    />


                                    <span className="custom-check">
                                    </span>


                                    <span>
                                        GHI NHỚ ĐĂNG NHẬP
                                    </span>


                                </label>


                                <button
                                    type="button"
                                    onClick={
                                        handleForgotPassword
                                    }
                                >
                                    QUÊN MẬT KHẨU?
                                </button>


                            </div>

                        )}


                        {/* =========================================
                            SUBMIT
                        ========================================= */}

                        <button
                            type="submit"
                            className="luxury-submit"
                            disabled={
                                loading
                            }
                        >


                            <div>

                                <small>
                                    {isLogin
                                        ? "MEMBER ACCESS"
                                        : "CREATE ACCOUNT"}
                                </small>


                                <strong>

                                    {loading
                                        ? "ĐANG XỬ LÝ..."
                                        : isLogin
                                            ? "ĐĂNG NHẬP"
                                            : "TẠO TÀI KHOẢN"}

                                </strong>


                            </div>


                            {!loading && (

                                <span className="submit-circle">
                                    →
                                </span>

                            )}


                        </button>


                    </form>


                    {/* =============================================
                        SWITCH
                    ============================================= */}

                    <div className="account-switch">


                        <span>

                            {isLogin
                                ? "CHƯA CÓ TÀI KHOẢN?"
                                : "ĐÃ LÀ THÀNH VIÊN?"}

                        </span>


                        <button
                            type="button"
                            onClick={() =>
                                changeMode(
                                    !isLogin
                                )
                            }
                        >

                            {isLogin
                                ? "TẠO TÀI KHOẢN"
                                : "ĐĂNG NHẬP"}

                            <span>
                                →
                            </span>

                        </button>


                    </div>


                    {/* =============================================
                        FOOTER
                    ============================================= */}

                    <div className="panel-footer">


                        <span>
                            © 2026 BOUTIQUE.
                        </span>


                        <div>

                            <span>
                                PRIVACY
                            </span>

                            <span>
                                VIETNAM
                            </span>

                        </div>


                    </div>


                </div>


            </section>


            {/* =================================================
                CSS
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                .boutique-auth-v2 {
                    width: 100%;
                    min-height: calc(100vh - 78px);

                    display: grid;

                    grid-template-columns:
                        minmax(0, 1.08fr)
                        minmax(480px, .92fr);

                    background: #f4f3f0;
                    color: #111;

                    font-family:
                        "Helvetica Neue",
                        Arial,
                        sans-serif;
                }


                /* =============================================
                   EDITORIAL
                ============================================= */

                .auth-editorial {
                    position: relative;

                    min-height:
                        calc(
                            100vh -
                            78px
                        );

                    overflow: hidden;

                    background: #111;
                }


                .auth-editorial > img {
                    position: absolute;

                    inset: 0;

                    width: 100%;
                    height: 100%;

                    display: block;

                    object-fit: cover;

                    object-position:
                        center center;

                    transform:
                        scale(1.01);

                    transition:
                        transform
                        1.2s
                        ease;
                }


                .auth-editorial:hover > img {
                    transform:
                        scale(1.035);
                }


                .editorial-overlay {
                    position: absolute;

                    inset: 0;

                    background:
                        linear-gradient(
                            180deg,
                            rgba(0, 0, 0, .32),
                            rgba(0, 0, 0, .05) 38%,
                            rgba(0, 0, 0, .66)
                        );
                }


                .editorial-header {
                    position: absolute;

                    z-index: 2;

                    top: 0;
                    left: 0;
                    right: 0;

                    min-height: 84px;

                    padding:
                        0 44px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border-bottom:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            .22
                        );
                }


                .editorial-header button {
                    padding: 0;

                    border: none;

                    background: none;

                    color: #fff;

                    cursor: pointer;

                    font-size: 18px;

                    font-weight: 700;

                    letter-spacing: 6px;
                }


                .editorial-header > span {
                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .7
                        );

                    font-size: 7px;

                    letter-spacing: 3px;
                }


                .editorial-center {
                    position: absolute;

                    z-index: 2;

                    left: 7%;
                    right: 7%;
                    bottom: 84px;

                    color: #fff;
                }


                .editorial-index {
                    width: 220px;

                    margin-bottom: 27px;

                    display: grid;

                    grid-template-columns:
                        auto
                        1fr
                        auto;

                    align-items: center;

                    gap: 12px;

                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .72
                        );

                    font-size: 7px;

                    letter-spacing: 2px;
                }


                .editorial-index div {
                    height: 1px;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .45
                        );
                }


                .editorial-kicker {
                    margin:
                        0 0 16px;

                    font-size: 7px;

                    letter-spacing: 5px;
                }


                .editorial-center h1 {
                    margin: 0;

                    font-family:
                        Georgia,
                        "Times New Roman",
                        serif;

                    font-size:
                        clamp(
                            64px,
                            7.2vw,
                            112px
                        );

                    font-weight: 400;

                    line-height: .8;

                    letter-spacing: -5px;
                }


                .editorial-center h1 > span {
                    display: inline-block;

                    margin-left: 11px;

                    font-style: italic;

                    font-weight: 400;
                }


                .editorial-copy {
                    max-width: 500px;

                    margin-top: 37px;

                    padding-top: 20px;

                    display: grid;

                    grid-template-columns:
                        1fr
                        auto;

                    align-items: flex-end;

                    gap: 30px;

                    border-top:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            .38
                        );
                }


                .editorial-copy p {
                    margin: 0;

                    max-width: 320px;

                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .82
                        );

                    font-size: 10px;

                    line-height: 1.9;
                }


                .editorial-copy span {
                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .62
                        );

                    font-size: 6px;

                    letter-spacing: 2px;
                }


                .editorial-bottom {
                    position: absolute;

                    z-index: 2;

                    left: 44px;
                    right: 44px;
                    bottom: 28px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .58
                        );

                    font-size: 6px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   PANEL
                ============================================= */

                .auth-panel {
                    min-height:
                        calc(
                            100vh -
                            78px
                        );

                    display: flex;

                    justify-content: center;

                    background: #f4f3f0;
                }


                .auth-panel-inner {
                    width: 100%;

                    max-width: 600px;

                    padding:
                        0 8%;

                    display: flex;

                    flex-direction: column;
                }


                /* =============================================
                   PANEL TOP
                ============================================= */

                .panel-top {
                    min-height: 84px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border-bottom:
                        1px solid #d9d7d2;
                }


                .home-link {
                    padding: 0;

                    display: flex;

                    align-items: center;

                    gap: 9px;

                    border: none;

                    background: none;

                    color: #111;

                    cursor: pointer;

                    font-size: 7px;

                    letter-spacing: 2px;
                }


                .home-link > span {
                    font-size: 14px;

                    transition:
                        transform
                        .2s ease;
                }


                .home-link:hover > span {
                    transform:
                        translateX(-4px);
                }


                .panel-top > span {
                    color: #aaa;

                    font-size: 6px;

                    letter-spacing: 3px;
                }


                /* =============================================
                   BRAND
                ============================================= */

                .panel-brand {
                    padding-top: 40px;

                    display: flex;

                    align-items: baseline;

                    justify-content:
                        space-between;
                }


                .panel-brand > span {
                    font-size: 16px;

                    font-weight: 700;

                    letter-spacing: 6px;
                }


                .panel-brand small {
                    color: #aaa;

                    font-size: 6px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   MODE
                ============================================= */

                .mode-selector {
                    position: relative;

                    margin-top: 34px;

                    padding: 4px;

                    display: grid;

                    grid-template-columns:
                        1fr 1fr;

                    border:
                        1px solid #d9d7d2;

                    background: #ebe9e5;
                }


                .mode-slider {
                    position: absolute;

                    z-index: 0;

                    top: 4px;
                    bottom: 4px;

                    width:
                        calc(
                            50% -
                            4px
                        );

                    background: #111;

                    transition:
                        transform
                        .32s
                        cubic-bezier(
                            .2,
                            .8,
                            .2,
                            1
                        );
                }


                .mode-slider.login {
                    transform:
                        translateX(0);
                }


                .mode-slider.register {
                    transform:
                        translateX(100%);
                }


                .mode-selector button {
                    position: relative;

                    z-index: 1;

                    min-height: 38px;

                    border: none;

                    background: transparent;

                    color: #777;

                    cursor: pointer;

                    font-size: 7px;

                    letter-spacing: 2px;

                    transition:
                        color
                        .2s ease;
                }


                .mode-selector button.active {
                    color: #fff;
                }


                /* =============================================
                   HEADING
                ============================================= */

                .panel-heading {
                    padding:
                        38px 0 30px;

                    display: grid;

                    grid-template-columns:
                        32px 1fr;

                    gap: 18px;

                    animation:
                        panelFade
                        .35s ease;
                }


                @keyframes panelFade {

                    from {
                        opacity: 0;

                        transform:
                            translateY(7px);
                    }

                    to {
                        opacity: 1;

                        transform:
                            translateY(0);
                    }
                }


                .heading-number {
                    padding-top: 3px;

                    color: #aaa;

                    font-size: 7px;

                    letter-spacing: 2px;
                }


                .panel-heading p {
                    margin:
                        0 0 12px;

                    color: #999;

                    font-size: 7px;

                    letter-spacing: 4px;
                }


                .panel-heading h2 {
                    margin: 0;

                    font-family:
                        Georgia,
                        "Times New Roman",
                        serif;

                    font-size:
                        clamp(
                            34px,
                            3.5vw,
                            50px
                        );

                    font-weight: 400;

                    line-height: .93;

                    letter-spacing: -2px;
                }


                .panel-heading > div:last-child > span {
                    display: block;

                    max-width: 390px;

                    margin-top: 18px;

                    color: #777;

                    font-size: 10px;

                    line-height: 1.8;
                }


                /* =============================================
                   ALERT
                ============================================= */

                .auth-alert {
                    margin-bottom: 22px;

                    padding:
                        12px 14px;

                    display: flex;

                    align-items:
                        flex-start;

                    gap: 11px;

                    border:
                        1px solid #ddd;

                    font-size: 9px;

                    line-height: 1.6;
                }


                .auth-alert > span {
                    width: 22px;
                    height: 22px;

                    flex-shrink: 0;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        currentColor;

                    border-radius: 50%;

                    font-size: 8px;
                }


                .auth-alert p {
                    margin: 2px 0 0;
                }


                .auth-alert.error {
                    border-color: #dcc0bb;

                    background: #fff8f7;

                    color: #8b3025;
                }


                .auth-alert.success {
                    border-color: #bfd4c2;

                    background: #f5faf5;

                    color: #286332;
                }


                /* =============================================
                   FORM
                ============================================= */

                .luxury-form {
                    display: flex;

                    flex-direction: column;

                    gap: 21px;
                }


                .luxury-field {
                    position: relative;

                    padding-bottom: 3px;
                }


                .field-top {
                    margin-bottom: 4px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;
                }


                .field-top label {
                    color: #666;

                    font-size: 6px;

                    font-weight: 600;

                    letter-spacing: 2px;
                }


                .field-top span {
                    color: #bbb;

                    font-size: 6px;

                    letter-spacing: 1px;
                }


                .luxury-field > input,
                .password-control input {
                    width: 100%;

                    padding:
                        10px 0 12px;

                    border: none;

                    border-bottom:
                        1px solid #aaa;

                    outline: none;

                    background:
                        transparent;

                    color: #111;

                    font-size: 13px;

                    transition:
                        border-color
                        .2s ease;
                }


                .luxury-field > input:focus,
                .password-control input:focus {
                    border-bottom-color: #111;
                }


                .luxury-field input::placeholder {
                    color: #b9b7b2;
                }


                /* =============================================
                   PASSWORD
                ============================================= */

                .password-control {
                    position: relative;
                }


                .password-control input {
                    padding-right: 60px;
                }


                .password-control button {
                    position: absolute;

                    right: 0;
                    bottom: 13px;

                    padding: 0;

                    border: none;

                    background: transparent;

                    color: #777;

                    cursor: pointer;

                    font-size: 6px;

                    font-weight: 600;

                    letter-spacing: 1px;
                }


                /* =============================================
                   OPTIONS
                ============================================= */

                .form-options {
                    margin-top: 2px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    gap: 20px;
                }


                .form-options label {
                    position: relative;

                    display: flex;

                    align-items: center;

                    gap: 8px;

                    color: #777;

                    cursor: pointer;

                    font-size: 6px;

                    letter-spacing: 1px;
                }


                .form-options label input {
                    position: absolute;

                    opacity: 0;

                    pointer-events: none;
                }


                .custom-check {
                    width: 13px;
                    height: 13px;

                    display: block;

                    border:
                        1px solid #999;
                }


                .form-options
                label
                input:checked +
                .custom-check {
                    background: #111;

                    box-shadow:
                        inset
                        0 0 0 3px
                        #f4f3f0;
                }


                .form-options > button {
                    padding: 0;

                    border: none;

                    background: transparent;

                    color: #777;

                    cursor: pointer;

                    font-size: 6px;

                    letter-spacing: 1px;
                }


                .form-options > button:hover {
                    color: #111;
                }


                /* =============================================
                   SUBMIT
                ============================================= */

                .luxury-submit {
                    width: 100%;

                    min-height: 65px;

                    margin-top: 7px;

                    padding:
                        0 18px
                        0 20px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border:
                        1px solid #111;

                    background: #111;

                    color: #fff;

                    cursor: pointer;

                    transition:
                        all
                        .25s ease;
                }


                .luxury-submit > div {
                    display: flex;

                    align-items: center;

                    gap: 15px;
                }


                .luxury-submit small {
                    color:
                        rgba(
                            255,
                            255,
                            255,
                            .5
                        );

                    font-size: 5px;

                    letter-spacing: 2px;
                }


                .luxury-submit strong {
                    font-size: 8px;

                    font-weight: 500;

                    letter-spacing: 2px;
                }


                .submit-circle {
                    width: 34px;
                    height: 34px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            .35
                        );

                    border-radius: 50%;

                    font-size: 15px;

                    transition:
                        transform
                        .25s ease;
                }


                .luxury-submit:hover:not(:disabled) {
                    background: #222;
                }


                .luxury-submit:hover:not(:disabled)
                .submit-circle {
                    transform:
                        translateX(4px);
                }


                .luxury-submit:disabled {
                    opacity: .5;

                    cursor:
                        not-allowed;
                }


                /* =============================================
                   SWITCH
                ============================================= */

                .account-switch {
                    margin-top: 26px;

                    padding:
                        21px 0;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border-top:
                        1px solid #d9d7d2;

                    border-bottom:
                        1px solid #d9d7d2;
                }


                .account-switch > span {
                    color: #999;

                    font-size: 6px;

                    letter-spacing: 1.5px;
                }


                .account-switch button {
                    padding: 0;

                    display: flex;

                    align-items: center;

                    gap: 10px;

                    border: none;

                    background: transparent;

                    color: #111;

                    cursor: pointer;

                    font-size: 7px;

                    font-weight: 600;

                    letter-spacing: 1.5px;
                }


                .account-switch button span {
                    font-size: 13px;

                    transition:
                        transform
                        .2s ease;
                }


                .account-switch button:hover span {
                    transform:
                        translateX(4px);
                }


                /* =============================================
                   FOOTER
                ============================================= */

                .panel-footer {
                    margin-top: auto;

                    min-height: 65px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    color: #aaa;

                    font-size: 5px;

                    letter-spacing: 2px;
                }


                .panel-footer > div {
                    display: flex;

                    gap: 20px;
                }


                /* =============================================
                   TABLET
                ============================================= */

                @media (
                    max-width: 1100px
                ) {

                    .boutique-auth-v2 {
                        grid-template-columns:
                            1fr
                            minmax(
                                430px,
                                .9fr
                            );
                    }


                    .editorial-center h1 {
                        font-size: 65px;
                    }


                    .editorial-copy {
                        max-width: 370px;
                    }

                }


                /* =============================================
                   MOBILE
                ============================================= */

                @media (
                    max-width: 780px
                ) {

                    .boutique-auth-v2 {
                        display: block;
                    }


                    .auth-editorial {
                        min-height: 440px;
                    }


                    .editorial-header {
                        min-height: 68px;

                        padding:
                            0 22px;
                    }


                    .editorial-center {
                        left: 22px;
                        right: 22px;
                        bottom: 45px;
                    }


                    .editorial-center h1 {
                        font-size: 54px;

                        letter-spacing:
                            -3px;
                    }


                    .editorial-copy {
                        max-width: 420px;
                    }


                    .editorial-bottom {
                        display: none;
                    }


                    .auth-panel {
                        min-height: auto;
                    }


                    .auth-panel-inner {
                        max-width: none;

                        padding:
                            0 22px;
                    }


                    .panel-top {
                        min-height: 66px;
                    }


                    .panel-brand {
                        padding-top: 35px;
                    }


                    .mode-selector {
                        margin-top: 28px;
                    }


                    .panel-heading {
                        padding:
                            32px 0
                            28px;
                    }


                    .panel-heading h2 {
                        font-size: 42px;
                    }


                    .panel-footer {
                        margin-top: 35px;
                    }

                }


                /* =============================================
                   SMALL MOBILE
                ============================================= */

                @media (
                    max-width: 460px
                ) {

                    .auth-editorial {
                        min-height: 360px;
                    }


                    .editorial-header
                    > span {
                        display: none;
                    }


                 .editorial-center {
    left: 22px;
    right: 22px;
    bottom: 28px;
}

.editorial-kicker {
    margin-bottom: 8px;
    color: #ffffff;
    font-size: 5px;
    letter-spacing: 3px;
}

.editorial-center h1 {
    max-width: 190px;
    color: #ffffff;
    font-size: 27px;
    line-height: .88;
    letter-spacing: -1px;
}

.editorial-center h1 > span {
    display: block;
    margin-left: 0;
    margin-top: 3px;
}


                    .editorial-index {
                        width: 180px;

                        margin-bottom: 18px;
                    }


                    .editorial-copy {
                        display: block;

                        margin-top: 25px;
                    }


                    .editorial-copy p {
                        max-width: 290px;
                    }


                    .editorial-copy span {
                        display: none;
                    }


                    .panel-brand small {
                        display: none;
                    }


                    .panel-heading {
                        grid-template-columns:
                            24px 1fr;

                        gap: 12px;
                    }


                    .panel-heading h2 {
                        font-size: 35px;
                    }


                    .form-options {
                        align-items:
                            flex-start;

                        flex-direction:
                            column;
                    }


                    .luxury-submit > div {
                        flex-direction:
                            column;

                        align-items:
                            flex-start;

                        gap: 4px;
                    }


                    .account-switch {
                        align-items:
                            flex-start;

                        flex-direction:
                            column;

                        gap: 12px;
                    }

                }

            `}</style>


        </div>
    );
};


export default Auth;