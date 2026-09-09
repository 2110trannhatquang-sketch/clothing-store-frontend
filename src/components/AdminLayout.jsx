import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";


// ============================================================
// ADMIN LAYOUT
// ============================================================

const AdminLayout = () => {

    const location =
        useLocation();

    const navigate =
        useNavigate();


    const [
        adminUser,
        setAdminUser
    ] = useState(null);


    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);


    // ========================================================
    // LOAD ADMIN USER
    // ========================================================

    useEffect(() => {

        try {

            const savedUser =
                localStorage.getItem(
                    "user"
                );


            if (
                savedUser &&
                savedUser !== "undefined" &&
                savedUser !== "null"
            ) {

                setAdminUser(
                    JSON.parse(
                        savedUser
                    )
                );

            } else {

                setAdminUser(null);
            }

        } catch (error) {

            console.error(
                "Lỗi đọc admin user:",
                error
            );

            setAdminUser(null);
        }

    }, []);


    // ========================================================
    // CLOSE MOBILE MENU ON ROUTE CHANGE
    // ========================================================

    useEffect(() => {

        setMobileMenuOpen(false);

    }, [location.pathname]);


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout =
        () => {

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn đăng xuất khỏi trang quản trị?"
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
                "/auth"
            );


            window.location.reload();
        };


    // ========================================================
    // CHECK ACTIVE MENU
    // ========================================================

    const isActive =
        (path) => {

            if (
                path === "/admin"
            ) {

                return (
                    location.pathname ===
                    "/admin"
                );
            }


            return (
                location.pathname === path ||
                location.pathname.startsWith(
                    `${path}/`
                )
            );
        };


    // ========================================================
    // ADMIN INITIAL
    // ========================================================

    const getInitial =
        () => {

            const name =
                adminUser?.full_name ||
                "Admin";


            return String(name)
                .trim()
                .charAt(0)
                .toUpperCase();
        };


    // ========================================================
    // MENU ITEMS
    // ========================================================

    const menuItems = [

        {
            path:
                "/admin",

            label:
                "DASHBOARD",

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                    />

                    <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                    />

                    <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                    />

                    <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                    />
                </svg>
            ),
        },

        {
            path:
                "/admin/orders",

            label:
                "ĐƠN HÀNG",

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path
                        d="M6 3h12v18H6z"
                    />

                    <path
                        d="M9 8h6"
                    />

                    <path
                        d="M9 12h6"
                    />

                    <path
                        d="M9 16h4"
                    />
                </svg>
            ),
        },

        {
            path:
                "/admin/products",

            label:
                "SẢN PHẨM",

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path
                        d="M4 7h16v14H4z"
                    />

                    <path
                        d="M8 7V5a4 4 0 0 1 8 0v2"
                    />
                </svg>
            ),
        },

        {
            path:
                "/admin/categories",

            label:
                "DANH MỤC",

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <path
                        d="M4 5h16"
                    />

                    <path
                        d="M4 12h16"
                    />

                    <path
                        d="M4 19h16"
                    />

                    <circle
                        cx="7"
                        cy="5"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                    />

                    <circle
                        cx="7"
                        cy="12"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                    />

                    <circle
                        cx="7"
                        cy="19"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                    />
                </svg>
            ),
        },

        {
            path:
                "/admin/users",

            label:
                "NGƯỜI DÙNG",

            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                >
                    <circle
                        cx="12"
                        cy="8"
                        r="4"
                    />

                    <path
                        d="M4.5 21a7.5 7.5 0 0 1 15 0"
                    />
                </svg>
            ),
        },
    ];


    // ========================================================
    // RETURN
    // ========================================================

    return (

        <div className="admin-layout">


            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {mobileMenuOpen && (

                <div
                    className="admin-overlay"
                    onClick={() =>
                        setMobileMenuOpen(false)
                    }
                />

            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={
                    mobileMenuOpen
                        ? "admin-sidebar open"
                        : "admin-sidebar"
                }
            >


                {/* LOGO */}

                <div className="admin-brand">

                    <Link
                        to="/admin"
                        className="admin-logo"
                    >
                        BOUTIQUE.
                    </Link>


                    <span>
                        ADMINISTRATION
                    </span>

                </div>


                {/* MENU */}

                <nav className="admin-menu">

                    <p className="admin-menu-title">
                        QUẢN LÝ
                    </p>


                    {menuItems.map(
                        (item) => (

                            <Link
                                key={
                                    item.path
                                }
                                to={
                                    item.path
                                }
                                className={
                                    isActive(
                                        item.path
                                    )
                                        ? "admin-menu-item active"
                                        : "admin-menu-item"
                                }
                            >

                                <span className="admin-menu-icon">
                                    {item.icon}
                                </span>


                                <span>
                                    {item.label}
                                </span>


                                <span className="admin-menu-arrow">
                                    →
                                </span>

                            </Link>

                        )
                    )}

                </nav>


                {/* BOTTOM */}

                <div className="admin-sidebar-bottom">


                    <Link
                        to="/"
                        className="admin-shop-link"
                    >
                        <span>
                            ←
                        </span>

                        VỀ CỬA HÀNG
                    </Link>


                    <button
                        type="button"
                        className="admin-logout"
                        onClick={
                            handleLogout
                        }
                    >
                        <span>
                            ĐĂNG XUẤT
                        </span>

                        <span>
                            →
                        </span>
                    </button>


                    <div className="admin-version">
                        BOUTIQUE / ADMIN 2026
                    </div>

                </div>


            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="admin-main">


                {/* HEADER */}

                <header className="admin-header">


                    <div className="admin-header-left">


                        <button
                            type="button"
                            className="admin-mobile-menu"
                            onClick={() =>
                                setMobileMenuOpen(
                                    true
                                )
                            }
                        >
                            <span></span>
                            <span></span>
                        </button>


                        <div>

                            <p className="admin-header-label">
                                BOUTIQUE. ADMINISTRATION
                            </p>


                            <h1>
                                QUẢN TRỊ CỬA HÀNG
                            </h1>

                        </div>


                    </div>


                    {/* ADMIN ACCOUNT */}

                    <div className="admin-account">


                        <div className="admin-account-info">

                            <strong>
                                {
                                    adminUser?.full_name ||
                                    "ADMIN"
                                }
                            </strong>


                            <span>
                                QUẢN TRỊ VIÊN
                            </span>

                        </div>


                        <div className="admin-avatar">
                            {getInitial()}
                        </div>


                    </div>


                </header>


                {/* CONTENT */}

                <section className="admin-content">

                    <Outlet />

                </section>


            </main>


            {/* =================================================
                CSS
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                .admin-layout {
                    min-height: 100vh;

                    background: #f5f5f2;

                    color: #111;

                    font-family:
                        "Helvetica Neue",
                        Arial,
                        sans-serif;
                }


                /* =============================================
                   SIDEBAR
                ============================================= */

                .admin-sidebar {
                    position: fixed;

                    top: 0;
                    left: 0;

                    z-index: 3000;

                    width: 245px;
                    height: 100vh;

                    padding: 34px 22px 25px;

                    display: flex;

                    flex-direction: column;

                    background: #111;

                    color: #fff;

                    transition:
                        transform .25s ease;
                }


                /* =============================================
                   BRAND
                ============================================= */

                .admin-brand {
                    padding-bottom: 30px;

                    border-bottom:
                        1px solid #303030;
                }


                .admin-logo {
                    display: block;

                    color: #fff;

                    text-decoration: none;

                    font-size: 21px;

                    font-weight: 700;

                    letter-spacing: 5px;
                }


                .admin-brand span {
                    display: block;

                    margin-top: 12px;

                    color: #777;

                    font-size: 8px;

                    letter-spacing: 3px;
                }


                /* =============================================
                   MENU
                ============================================= */

                .admin-menu {
                    margin-top: 32px;
                }


                .admin-menu-title {
                    margin:
                        0 0 13px
                        12px;

                    color: #555;

                    font-size: 7px;

                    letter-spacing: 3px;
                }


                .admin-menu-item {
                    position: relative;

                    min-height: 55px;

                    padding:
                        0 13px;

                    display: grid;

                    grid-template-columns:
                        22px
                        1fr
                        14px;

                    align-items: center;

                    gap: 10px;

                    border-left:
                        1px solid
                        transparent;

                    color: #999;

                    text-decoration: none;

                    font-size: 10px;

                    letter-spacing: 1.5px;

                    transition:
                        all .2s ease;
                }


                .admin-menu-item:hover {
                    padding-left: 17px;

                    background: #191919;

                    color: #fff;
                }


                .admin-menu-item.active {
                    background: #222;

                    border-left-color:
                        #fff;

                    color: #fff;
                }


                .admin-menu-icon {
                    width: 17px;
                    height: 17px;

                    display: flex;

                    align-items: center;

                    justify-content: center;
                }


                .admin-menu-icon svg {
                    width: 15px;
                    height: 15px;

                    stroke-linecap: round;

                    stroke-linejoin: round;
                }


                .admin-menu-arrow {
                    opacity: 0;

                    transform:
                        translateX(-4px);

                    color: #666;

                    transition:
                        all .2s ease;
                }


                .admin-menu-item:hover
                .admin-menu-arrow,
                .admin-menu-item.active
                .admin-menu-arrow {
                    opacity: 1;

                    transform:
                        translateX(0);
                }


                /* =============================================
                   SIDEBAR BOTTOM
                ============================================= */

                .admin-sidebar-bottom {
                    margin-top: auto;
                }


                .admin-shop-link {
                    padding:
                        13px 0;

                    display: flex;

                    align-items: center;

                    gap: 10px;

                    color: #888;

                    text-decoration: none;

                    font-size: 9px;

                    letter-spacing: 1.5px;

                    transition:
                        color .2s ease;
                }


                .admin-shop-link:hover {
                    color: #fff;
                }


                .admin-logout {
                    width: 100%;

                    min-height: 46px;

                    margin-top: 12px;

                    padding:
                        0 14px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    border:
                        1px solid #3d3d3d;

                    background:
                        transparent;

                    color: #aaa;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 1.5px;

                    transition:
                        all .2s ease;
                }


                .admin-logout:hover {
                    border-color:
                        #fff;

                    background: #fff;

                    color: #111;
                }


                .admin-version {
                    margin-top: 18px;

                    color: #444;

                    font-size: 6px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   MAIN
                ============================================= */

                .admin-main {
                    min-height: 100vh;

                    margin-left: 245px;
                }


                /* =============================================
                   HEADER
                ============================================= */

                .admin-header {
                    position: sticky;

                    top: 0;

                    z-index: 1000;

                    min-height: 88px;

                    padding:
                        0 42px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    gap: 30px;

                    border-bottom:
                        1px solid #e5e5e5;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .96
                        );

                    backdrop-filter:
                        blur(10px);
                }


                .admin-header-left {
                    display: flex;

                    align-items: center;

                    gap: 20px;
                }


                .admin-header-label {
                    margin:
                        0 0 7px;

                    color: #999;

                    font-size: 7px;

                    letter-spacing: 2.5px;
                }


                .admin-header h1 {
                    margin: 0;

                    font-size: 14px;

                    font-weight: 600;

                    letter-spacing: 2px;
                }


                /* =============================================
                   ADMIN ACCOUNT
                ============================================= */

                .admin-account {
                    display: flex;

                    align-items: center;

                    gap: 13px;
                }


                .admin-account-info {
                    max-width: 160px;

                    display: flex;

                    flex-direction: column;

                    align-items: flex-end;

                    gap: 4px;
                }


                .admin-account-info strong {
                    max-width: 160px;

                    overflow: hidden;

                    color: #111;

                    font-size: 9px;

                    font-weight: 500;

                    letter-spacing: 1px;

                    text-overflow:
                        ellipsis;

                    white-space: nowrap;

                    text-transform:
                        uppercase;
                }


                .admin-account-info span {
                    color: #999;

                    font-size: 6px;

                    letter-spacing: 2px;
                }


                .admin-avatar {
                    width: 40px;
                    height: 40px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        center;

                    border-radius: 50%;

                    background: #111;

                    color: #fff;

                    font-size: 10px;

                    font-weight: 500;

                    letter-spacing: 1px;
                }


                /* =============================================
                   MOBILE MENU BUTTON
                ============================================= */

                .admin-mobile-menu {
                    width: 30px;
                    height: 30px;

                    display: none;

                    padding: 0;

                    border: none;

                    background:
                        transparent;

                    cursor: pointer;
                }


                .admin-mobile-menu span {
                    display: block;

                    width: 23px;
                    height: 1px;

                    margin: 5px 0;

                    background: #111;
                }


                /* =============================================
                   CONTENT
                ============================================= */

                .admin-content {
                    width: 100%;

                    padding:
                        42px;

                    overflow-x: hidden;
                }


                /* =============================================
                   OVERLAY
                ============================================= */

                .admin-overlay {
                    display: none;
                }


                /* =============================================
                   TABLET
                ============================================= */

                @media (
                    max-width: 1000px
                ) {

                    .admin-sidebar {
                        width: 215px;
                    }


                    .admin-main {
                        margin-left: 215px;
                    }


                    .admin-header {
                        padding:
                            0 28px;
                    }


                    .admin-content {
                        padding:
                            30px;
                    }

                }


                /* =============================================
                   MOBILE
                ============================================= */

                @media (
                    max-width: 760px
                ) {

                    .admin-sidebar {
                        width: 255px;

                        transform:
                            translateX(
                                -100%
                            );
                    }


                    .admin-sidebar.open {
                        transform:
                            translateX(0);
                    }


                    .admin-main {
                        margin-left: 0;
                    }


                    .admin-mobile-menu {
                        display: block;
                    }


                    .admin-header {
                        min-height: 76px;

                        padding:
                            0 18px;
                    }


                    .admin-header-label {
                        display: none;
                    }


                    .admin-header h1 {
                        font-size: 12px;
                    }


                    .admin-account-info {
                        display: none;
                    }


                    .admin-avatar {
                        width: 34px;
                        height: 34px;
                    }


                    .admin-content {
                        padding:
                            22px 16px
                            50px;
                    }


                    .admin-overlay {
                        position: fixed;

                        inset: 0;

                        z-index: 2999;

                        display: block;

                        background:
                            rgba(
                                0,
                                0,
                                0,
                                .45
                            );
                    }

                }

            `}</style>


        </div>
    );
};


export default AdminLayout;