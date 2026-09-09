import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import API from "../services/api";


// ============================================================
// ACCOUNT
// ============================================================

const Account = () => {

    const navigate =
        useNavigate();


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        formData,
        setFormData
    ] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "",
    });


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        editing,
        setEditing
    ] = useState(false);


    const [
        errorMsg,
        setErrorMsg
    ] = useState("");


    const [
        successMsg,
        setSuccessMsg
    ] = useState("");


    // ========================================================
    // TOKEN
    // ========================================================

    const getToken =
        () => {

            return localStorage.getItem(
                "token"
            );
        };


    // ========================================================
    // LOAD PROFILE
    // ========================================================

    const loadProfile =
        async () => {

            try {

                setLoading(true);
                setErrorMsg("");


                const token =
                    getToken();


                if (!token) {

                    navigate(
                        "/auth"
                    );

                    return;
                }


                const response =
                    await API.get(
                        "/auth/profile",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const data =
                    response.data?.data;


                if (!data) {

                    throw new Error(
                        "Không thể tải thông tin tài khoản."
                    );
                }


                setProfile(
                    data
                );


                setFormData({
                    full_name:
                        data.full_name ||
                        "",

                    email:
                        data.email ||
                        "",

                    phone:
                        data.phone ||
                        "",

                    role:
                        data.role ||
                        "",
                });


            } catch (error) {

                console.error(
                    "Lỗi tải profile:",
                    error
                );


                if (
                    error.response?.status ===
                        401 ||
                    error.response?.status ===
                        403
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );


                    navigate(
                        "/auth"
                    );

                    return;
                }


                setErrorMsg(
                    error.response
                        ?.data
                        ?.message ||
                    error.message ||
                    "Không thể tải hồ sơ."
                );


            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        loadProfile();

    }, []);


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
    // START EDIT
    // ========================================================

    const handleStartEdit =
        () => {

            setEditing(true);

            setErrorMsg("");
            setSuccessMsg("");
        };


    // ========================================================
    // CANCEL EDIT
    // ========================================================

    const handleCancelEdit =
        () => {

            if (!profile) {
                return;
            }


            setFormData({
                full_name:
                    profile.full_name ||
                    "",

                email:
                    profile.email ||
                    "",

                phone:
                    profile.phone ||
                    "",

                role:
                    profile.role ||
                    "",
            });


            setEditing(false);

            setErrorMsg("");
            setSuccessMsg("");
        };


    // ========================================================
    // UPDATE PROFILE
    // ========================================================

    const handleSave =
        async (event) => {

            event.preventDefault();


            if (saving) {
                return;
            }


            const fullName =
                formData.full_name.trim();


            const phone =
                formData.phone.trim();


            if (!fullName) {

                setErrorMsg(
                    "Họ và tên không được để trống."
                );

                return;
            }


            if (
                phone &&
                !/^0\d{9}$/.test(
                    phone
                )
            ) {

                setErrorMsg(
                    "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0."
                );

                return;
            }


            try {

                setSaving(true);

                setErrorMsg("");
                setSuccessMsg("");


                const token =
                    getToken();


                if (!token) {

                    navigate(
                        "/auth"
                    );

                    return;
                }


                const response =
                    await API.put(
                        "/auth/profile",
                        {
                            full_name:
                                fullName,

                            phone:
                                phone,
                        },
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                const updatedProfile =
                    response.data?.data;


                if (!updatedProfile) {

                    throw new Error(
                        "Không nhận được dữ liệu hồ sơ mới."
                    );
                }


                setProfile(
                    updatedProfile
                );


                setFormData({
                    full_name:
                        updatedProfile.full_name ||
                        "",

                    email:
                        updatedProfile.email ||
                        "",

                    phone:
                        updatedProfile.phone ||
                        "",

                    role:
                        updatedProfile.role ||
                        "",
                });


                // =============================================
                // UPDATE LOCAL STORAGE USER
                // =============================================

                let savedUser = {};


                try {

                    savedUser =
                        JSON.parse(
                            localStorage.getItem(
                                "user"
                            ) ||
                            "{}"
                        );

                } catch {

                    savedUser = {};
                }


                const newLocalUser = {

                    ...savedUser,

                    id:
                        updatedProfile.id,

                    full_name:
                        updatedProfile.full_name,

                    email:
                        updatedProfile.email,

                    phone:
                        updatedProfile.phone,

                    role:
                        updatedProfile.role,
                };


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        newLocalUser
                    )
                );


                setEditing(false);


                setSuccessMsg(
                    response.data?.message ||
                    "Cập nhật thông tin thành công!"
                );


                setTimeout(
                    () => {

                        setSuccessMsg("");

                    },
                    3000
                );


            } catch (error) {

                console.error(
                    "Lỗi cập nhật profile:",
                    error
                );


                setErrorMsg(
                    error.response
                        ?.data
                        ?.message ||
                    error.message ||
                    "Không thể cập nhật hồ sơ."
                );


            } finally {

                setSaving(false);
            }
        };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout =
        () => {

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn đăng xuất?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            navigate(
                "/"
            );


            window.location.reload();
        };


    // ========================================================
    // ROLE NAME
    // ========================================================

    const getRoleName =
        (role) => {

            if (
                String(
                    role
                ).toLowerCase() ===
                "admin"
            ) {

                return "QUẢN TRỊ VIÊN";
            }


            return "KHÁCH HÀNG";
        };


    // ========================================================
    // INITIAL
    // ========================================================

    const getInitial =
        () => {

            const name =
                profile?.full_name ||
                "B";


            return String(name)
                .trim()
                .charAt(0)
                .toUpperCase();
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="account-state">

                <div className="account-loading-line">
                </div>

                <p>
                    ĐANG TẢI TÀI KHOẢN
                </p>

                <style>
                    {stateStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // NO PROFILE
    // ========================================================

    if (!profile) {

        return (

            <div className="account-state">

                <p className="state-label">
                    BOUTIQUE.
                </p>


                <h2>
                    Không thể tải tài khoản
                </h2>


                <p>
                    {errorMsg}
                </p>


                <button
                    type="button"
                    onClick={
                        loadProfile
                    }
                >
                    THỬ LẠI
                </button>


                <style>
                    {stateStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RETURN
    // ========================================================

    return (

        <div className="account-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="account-hero">


                <div className="account-hero-top">

                    <span>
                        BOUTIQUE.
                    </span>


                    <span>
                        MEMBER / {String(profile.id).padStart(4, "0")}
                    </span>

                </div>


                <div className="account-hero-content">


                    <p>
                        MEMBER PROFILE
                    </p>


                    <h1>
                        MY
                        <br />
                        ACCOUNT.
                    </h1>


                    <div className="account-person">


                        <div className="account-avatar">

                            {getInitial()}

                        </div>


                        <div>

                            <strong>
                                {profile.full_name}
                            </strong>


                            <span>
                                {getRoleName(
                                    profile.role
                                )}
                            </span>

                        </div>


                    </div>

                </div>


                <div className="account-hero-number">
                    01
                </div>


            </section>


            {/* =================================================
                MAIN
            ================================================= */}

            <section className="account-main">


                {/* =============================================
                    SIDEBAR
                ============================================= */}

                <aside className="account-sidebar">


                    <p className="account-menu-label">
                        TÀI KHOẢN
                    </p>


                    <div className="account-menu">


                        <button
                            type="button"
                            className="active"
                        >
                            <span>
                                01
                            </span>

                            THÔNG TIN CÁ NHÂN
                        </button>


                        <Link
                            to="/my-orders"
                        >
                            <span>
                                02
                            </span>

                            ĐƠN HÀNG CỦA TÔI
                        </Link>


                        <Link
                            to="/wishlist"
                        >
                            <span>
                                03
                            </span>

                            SẢN PHẨM YÊU THÍCH
                        </Link>


                        <Link
                            to="/cart"
                        >
                            <span>
                                04
                            </span>

                            GIỎ HÀNG
                        </Link>


                    </div>


                    <button
                        type="button"
                        className="account-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        ĐĂNG XUẤT
                        <span>
                            →
                        </span>
                    </button>


                </aside>


                {/* =============================================
                    CONTENT
                ============================================= */}

                <div className="account-content">


                    <div className="account-content-header">


                        <div>

                            <p>
                                PROFILE
                            </p>


                            <h2>
                                THÔNG TIN
                                <br />
                                CÁ NHÂN
                            </h2>

                        </div>


                        {!editing && (

                            <button
                                type="button"
                                className="edit-profile-button"
                                onClick={
                                    handleStartEdit
                                }
                            >
                                CHỈNH SỬA
                            </button>

                        )}


                    </div>


                    {/* =========================================
                        MESSAGE
                    ========================================= */}

                    {errorMsg && (

                        <div className="account-message error">

                            <span>
                                !
                            </span>

                            {errorMsg}

                        </div>

                    )}


                    {successMsg && (

                        <div className="account-message success">

                            <span>
                                ✓
                            </span>

                            {successMsg}

                        </div>

                    )}


                    {/* =========================================
                        FORM
                    ========================================= */}

                    <form
                        className="profile-form"
                        onSubmit={
                            handleSave
                        }
                    >


                        {/* NAME */}

                        <div className="profile-field">


                            <div className="profile-field-number">
                                01
                            </div>


                            <div className="profile-field-content">


                                <label
                                    htmlFor="full_name"
                                >
                                    HỌ VÀ TÊN
                                </label>


                                {editing
                                    ? (

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
                                            required
                                        />

                                    )
                                    : (

                                        <p>
                                            {
                                                profile.full_name ||
                                                "Chưa cập nhật"
                                            }
                                        </p>

                                    )}


                            </div>


                        </div>


                        {/* EMAIL */}

                        <div className="profile-field">


                            <div className="profile-field-number">
                                02
                            </div>


                            <div className="profile-field-content">


                                <label>
                                    EMAIL
                                </label>


                                <p>
                                    {
                                        profile.email ||
                                        "Chưa cập nhật"
                                    }
                                </p>


                                <small>
                                    Email đăng nhập không thể thay đổi tại đây.
                                </small>


                            </div>


                        </div>


                        {/* PHONE */}

                        <div className="profile-field">


                            <div className="profile-field-number">
                                03
                            </div>


                            <div className="profile-field-content">


                                <label
                                    htmlFor="phone"
                                >
                                    SỐ ĐIỆN THOẠI
                                </label>


                                {editing
                                    ? (

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
                                        />

                                    )
                                    : (

                                        <p>
                                            {
                                                profile.phone ||
                                                "Chưa cập nhật"
                                            }
                                        </p>

                                    )}


                            </div>


                        </div>


                        {/* ROLE */}

                        <div className="profile-field">


                            <div className="profile-field-number">
                                04
                            </div>


                            <div className="profile-field-content">


                                <label>
                                    LOẠI TÀI KHOẢN
                                </label>


                                <p>
                                    {getRoleName(
                                        profile.role
                                    )}
                                </p>


                            </div>


                        </div>


                        {/* =====================================
                            ACTIONS
                        ===================================== */}

                        {editing && (

                            <div className="profile-actions">


                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    HỦY
                                </button>


                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    <span>

                                        {saving
                                            ? "ĐANG LƯU..."
                                            : "LƯU THAY ĐỔI"}

                                    </span>


                                    {!saving && (

                                        <span>
                                            →
                                        </span>

                                    )}

                                </button>


                            </div>

                        )}


                    </form>


                    {/* =========================================
                        QUICK LINKS
                    ========================================= */}

                    <div className="account-quick-links">


                        <Link
                            to="/my-orders"
                            className="quick-card"
                        >

                            <span className="quick-number">
                                01
                            </span>


                            <div>

                                <p>
                                    ORDERS
                                </p>

                                <h3>
                                    ĐƠN HÀNG
                                    <br />
                                    CỦA TÔI
                                </h3>

                            </div>


                            <span className="quick-arrow">
                                →
                            </span>

                        </Link>


                        <Link
                            to="/wishlist"
                            className="quick-card"
                        >

                            <span className="quick-number">
                                02
                            </span>


                            <div>

                                <p>
                                    SAVED
                                </p>

                                <h3>
                                    SẢN PHẨM
                                    <br />
                                    YÊU THÍCH
                                </h3>

                            </div>


                            <span className="quick-arrow">
                                →
                            </span>

                        </Link>


                    </div>


                </div>


            </section>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="account-bottom">


                <p>
                    BOUTIQUE MEMBERS
                </p>


                <h2>
                    YOUR STYLE.
                    <br />
                    YOUR ACCOUNT.
                </h2>


                <Link to="/">
                    TIẾP TỤC MUA SẮM →
                </Link>


            </section>


            {/* =================================================
                CSS
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                .account-page {
                    width: 100%;

                    background: #fff;

                    color: #111;

                    font-family:
                        "Helvetica Neue",
                        Arial,
                        sans-serif;
                }


                /* =============================================
                   HERO
                ============================================= */

                .account-hero {
                    position: relative;

                    min-height: 480px;

                    padding:
                        40px 5%
                        60px;

                    overflow: hidden;

                    background: #111;

                    color: #fff;
                }


                .account-hero-top {
                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;
                }


                .account-hero-top span:first-child {
                    font-size: 15px;

                    font-weight: 700;

                    letter-spacing: 6px;
                }


                .account-hero-top span:last-child {
                    color: #777;

                    font-size: 8px;

                    letter-spacing: 3px;
                }


                .account-hero-content {
                    position: absolute;

                    left: 5%;
                    bottom: 55px;
                }


                .account-hero-content > p {
                    margin:
                        0 0 18px;

                    color: #777;

                    font-size: 8px;

                    letter-spacing: 4px;
                }


               .account-hero-content h1 {
    margin: 0;

    color: #ffffff !important;

    font-size:
        clamp(
            65px,
            8vw,
            115px
        );

    line-height: .85;

    font-weight: 300;

    letter-spacing:
        -3px;
}


                .account-person {
                    margin-top: 35px;

                    display: flex;

                    align-items: center;

                    gap: 15px;
                }


                .account-avatar {
                    width: 48px;
                    height: 48px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid #555;

                    border-radius: 50%;

                    font-size: 16px;

                    font-weight: 500;
                }


                .account-person > div:last-child {
                    display: flex;

                    flex-direction: column;

                    gap: 5px;
                }


                .account-person strong {
                    font-size: 11px;

                    font-weight: 500;
                }


                .account-person span {
                    color: #777;

                    font-size: 7px;

                    letter-spacing: 2px;
                }


                .account-hero-number {
                    position: absolute;

                    right: 4%;
                    bottom: -35px;

                    color: #191919;

                    font-size:
                        clamp(
                            160px,
                            20vw,
                            300px
                        );

                    font-weight: 200;

                    line-height: .8;

                    user-select: none;
                }


                /* =============================================
                   MAIN
                ============================================= */

                .account-main {
                    display: grid;

                    grid-template-columns:
                        280px
                        minmax(
                            0,
                            1fr
                        );

                    max-width: 1450px;

                    margin: 0 auto;

                    padding:
                        90px 5%
                        130px;

                    gap: 80px;
                }


                /* =============================================
                   SIDEBAR
                ============================================= */

                .account-sidebar {
                    align-self: start;

                    position: sticky;

                    top: 110px;
                }


                .account-menu-label {
                    margin:
                        0 0 20px;

                    color: #aaa;

                    font-size: 8px;

                    letter-spacing: 3px;
                }


                .account-menu {
                    display: flex;

                    flex-direction: column;

                    border-top:
                        1px solid #ddd;
                }


                .account-menu a,
                .account-menu button {
                    width: 100%;

                    min-height: 58px;

                    padding: 0;

                    display: flex;

                    align-items: center;

                    gap: 15px;

                    border: none;

                    border-bottom:
                        1px solid #ddd;

                    background: transparent;

                    color: #777;

                    text-align: left;

                    text-decoration: none;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 1px;

                    transition:
                        all .2s ease;
                }


                .account-menu span {
                    width: 25px;

                    color: #bbb;

                    font-size: 7px;
                }


                .account-menu a:hover,
                .account-menu button:hover,
                .account-menu button.active {
                    padding-left: 8px;

                    color: #111;
                }


                .account-menu button.active {
                    font-weight: 600;
                }


                .account-logout {
                    width: 100%;

                    margin-top: 35px;

                    padding:
                        15px 0;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border: none;

                    border-bottom:
                        1px solid #111;

                    background: transparent;

                    color: #111;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   CONTENT
                ============================================= */

                .account-content {
                    min-width: 0;
                }


                .account-content-header {
                    padding-bottom: 30px;

                    display: flex;

                    align-items: flex-end;

                    justify-content:
                        space-between;

                    gap: 30px;

                    border-bottom:
                        1px solid #111;
                }


                .account-content-header p {
                    margin:
                        0 0 12px;

                    color: #999;

                    font-size: 8px;

                    letter-spacing: 4px;
                }


                .account-content-header h2 {
                    margin: 0;

                    font-size:
                        clamp(
                            38px,
                            5vw,
                            65px
                        );

                    line-height: .9;

                    font-weight: 300;
                }


                .edit-profile-button {
                    padding:
                        10px 0;

                    border: none;

                    border-bottom:
                        1px solid #111;

                    background: transparent;

                    color: #111;

                    cursor: pointer;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   MESSAGE
                ============================================= */

                .account-message {
                    margin-top: 25px;

                    padding:
                        13px 15px;

                    display: flex;

                    align-items: center;

                    gap: 12px;

                    font-size: 10px;
                }


                .account-message.error {
                    border:
                        1px solid #e0c5c1;

                    background: #fff7f6;

                    color: #8b3025;
                }


                .account-message.success {
                    border:
                        1px solid #c7ddca;

                    background: #f6faf6;

                    color: #286332;
                }


                /* =============================================
                   PROFILE FORM
                ============================================= */

                .profile-form {
                    margin-top: 10px;
                }


                .profile-field {
                    min-height: 115px;

                    display: grid;

                    grid-template-columns:
                        60px 1fr;

                    align-items: center;

                    border-bottom:
                        1px solid #ddd;
                }


                .profile-field-number {
                    color: #bbb;

                    font-size: 8px;
                }


                .profile-field-content label {
                    display: block;

                    margin-bottom: 10px;

                    color: #999;

                    font-size: 7px;

                    letter-spacing: 2px;
                }


                .profile-field-content p {
                    margin: 0;

                    color: #111;

                    font-size: 14px;
                }


                .profile-field-content small {
                    display: block;

                    margin-top: 7px;

                    color: #aaa;

                    font-size: 8px;
                }


                .profile-field-content input {
                    width: 100%;

                    max-width: 500px;

                    padding:
                        10px 0;

                    border: none;

                    border-bottom:
                        1px solid #111;

                    outline: none;

                    background: transparent;

                    color: #111;

                    font-size: 14px;
                }


                /* =============================================
                   ACTIONS
                ============================================= */

                .profile-actions {
                    margin-top: 35px;

                    display: flex;

                    justify-content:
                        flex-end;

                    gap: 10px;
                }


                .cancel-button,
                .save-button {
                    min-height: 50px;

                    padding:
                        0 24px;

                    cursor: pointer;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                .cancel-button {
                    border:
                        1px solid #ccc;

                    background: #fff;

                    color: #111;
                }


                .save-button {
                    min-width: 200px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border:
                        1px solid #111;

                    background: #111;

                    color: #fff;
                }


                .save-button:hover:not(:disabled) {
                    background: #fff;

                    color: #111;
                }


                .cancel-button:disabled,
                .save-button:disabled {
                    opacity: .5;

                    cursor: not-allowed;
                }


                /* =============================================
                   QUICK LINKS
                ============================================= */

                .account-quick-links {
                    margin-top: 80px;

                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            1fr
                        );

                    gap: 12px;
                }


                .quick-card {
                    position: relative;

                    min-height: 260px;

                    padding: 25px;

                    display: flex;

                    flex-direction: column;

                    justify-content:
                        space-between;

                    border:
                        1px solid #ddd;

                    color: #111;

                    text-decoration: none;

                    transition:
                        all .25s ease;
                }


                .quick-card:hover {
                    background: #111;

                    color: #fff;
                }


                .quick-number {
                    color: #aaa;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                .quick-card p {
                    margin:
                        0 0 10px;

                    color: #999;

                    font-size: 7px;

                    letter-spacing: 3px;
                }


                .quick-card h3 {
                    margin: 0;

                    font-size: 27px;

                    line-height: .95;

                    font-weight: 300;
                }


                .quick-arrow {
                    position: absolute;

                    right: 25px;
                    bottom: 25px;

                    font-size: 20px;
                }


                /* =============================================
                   BOTTOM
                ============================================= */

                .account-bottom {
                    padding:
                        130px 20px;

                    text-align: center;

                    background: #f3f3f0;

                    color: #111;
                }


                .account-bottom p {
                    margin:
                        0 0 20px;

                    color: #999;

                    font-size: 8px;

                    letter-spacing: 4px;
                }


                .account-bottom h2 {
                    margin: 0;

                    font-size:
                        clamp(
                            42px,
                            6vw,
                            80px
                        );

                    line-height: .95;

                    font-weight: 300;
                }


                .account-bottom a {
                    display: inline-block;

                    margin-top: 35px;

                    padding-bottom: 7px;

                    border-bottom:
                        1px solid #111;

                    color: #111;

                    text-decoration: none;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   TABLET
                ============================================= */

                @media (
                    max-width: 950px
                ) {

                    .account-main {
                        grid-template-columns:
                            220px 1fr;

                        gap: 45px;
                    }

                }


                /* =============================================
                   MOBILE
                ============================================= */

                @media (
                    max-width: 720px
                ) {

                    .account-hero {
                        min-height: 420px;

                        padding:
                            30px 22px
                            45px;
                    }


                    .account-hero-content {
    left: 22px;
    right: 22px;

    bottom: 45px;

    z-index: 2;
}


.account-hero-content h1 {
    color: #ffffff !important;

    font-size: 54px;

    line-height: .88;

    letter-spacing: -2px;
}

                    .account-hero-number {
                        display: none;
                    }


                    .account-main {
                        display: block;

                        padding:
                            60px 22px
                            90px;
                    }


                    .account-sidebar {
                        position: static;

                        margin-bottom: 70px;
                    }


                    .account-content-header {
                        align-items:
                            flex-start;

                        flex-direction:
                            column;
                    }


                    .profile-field {
                        grid-template-columns:
                            35px 1fr;

                        min-height: 105px;
                    }


                    .profile-actions {
                        flex-direction:
                            column-reverse;
                    }


                    .cancel-button,
                    .save-button {
                        width: 100%;
                    }


                    .account-quick-links {
                        grid-template-columns:
                            1fr;
                    }


                    .quick-card {
                        min-height: 220px;
                    }


                    .account-bottom {
                        padding:
                            100px 20px;
                    }

                }

            `}</style>


        </div>
    );
};


// ============================================================
// STATE CSS
// ============================================================

const stateStyles = `

    .account-state {
        min-height:
            calc(
                100vh -
                78px
            );

        padding: 30px;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        text-align: center;

        font-family:
            "Helvetica Neue",
            Arial,
            sans-serif;
    }


    .account-state p {
        color: #777;

        font-size: 9px;

        letter-spacing: 2px;
    }


    .account-state h2 {
        margin:
            5px 0 10px;

        font-size: 30px;

        font-weight: 400;
    }


    .account-state button {
        margin-top: 20px;

        padding:
            12px 18px;

        border:
            1px solid #111;

        background: #111;

        color: #fff;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 2px;
    }


    .state-label {
        letter-spacing:
            4px !important;
    }


    .account-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            accountLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes accountLoading {

        0%,
        100% {

            transform:
                scaleX(.3);

            opacity: .3;
        }


        50% {

            transform:
                scaleX(1);

            opacity: 1;
        }
    }

`;


export default Account;