import React, { useEffect, useState } from "react";

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
    useLocation,
} from "react-router-dom";

// ================= USER =================
import Auth from "./components/Auth";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";
import Wishlist from "./components/Wishlist";
import Account from "./components/Account";

// ================= ADMIN =================
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import AdminOrderManagement from "./components/AdminOrderManagement";
import AdminProductManagement from "./components/AdminProductManagement";
import AdminCategoryManagement from "./components/AdminCategoryManagement";
import AdminUserManagement from "./components/AdminUserManagement";


// ==================================================
// BẢO VỆ TRANG ADMIN
// ==================================================

const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    let user = {};

    try {
        const savedUser = localStorage.getItem("user");

        if (
            savedUser &&
            savedUser !== "undefined" &&
            savedUser !== "null"
        ) {
            user = JSON.parse(savedUser);
        }
    } catch (error) {
        console.error("Lỗi đọc thông tin user:", error);
        user = {};
    }

    if (!token) {
        alert("Vui lòng đăng nhập!");
        return <Navigate to="/auth" replace />;
    }

    if (user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang quản trị!");
        return <Navigate to="/" replace />;
    }

    return children;
};

// ==================================================
// BẢO VỆ TRANG NGƯỜI DÙNG
// ==================================================

const ProtectedUserRoute = ({ children }) => {

    const token =
        localStorage.getItem("token");


    if (!token) {

        return (
            <Navigate
                to="/auth"
                replace
            />
        );
    }


    return children;
};
// ==================================================
// APP
// ==================================================

function AppContent() {

    const location = useLocation();

    const isAdminPage =
        location.pathname.startsWith("/admin");
    const [user, setUser] = useState(null);

const [cartCount, setCartCount] =
    useState(0);

const [wishlistCount, setWishlistCount] =
    useState(0);

const [menuOpen, setMenuOpen] =
    useState(false);

const [search, setSearch] =
    useState("");


    // ==================================================
    // LOAD USER + CART
    // ==================================================

   useEffect(() => {

    loadUser();

    updateCartCount();

    updateWishlistCount();


    const handleWishlistUpdate =
        () => {

            updateWishlistCount();
        };


    window.addEventListener(
        "wishlistUpdated",
        handleWishlistUpdate
    );


    return () => {

        window.removeEventListener(
            "wishlistUpdated",
            handleWishlistUpdate
        );
    };

}, []);

    // ==================================================
    // LOAD USER
    // ==================================================

    const loadUser = () => {
        try {
            const savedUser = localStorage.getItem("user");

            if (
                savedUser &&
                savedUser !== "undefined" &&
                savedUser !== "null"
            ) {
                setUser(JSON.parse(savedUser));
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Lỗi đọc user:", error);

            localStorage.removeItem("user");
            setUser(null);
        }
    };


    // ==================================================
    // CART COUNT
    // ==================================================

    const updateCartCount = () => {
        try {
            const cart = JSON.parse(
                localStorage.getItem("cart") || "[]"
            );

            const total = cart.reduce(
                (sum, item) =>
                    sum + Number(item.quantity || 0),
                0
            );

            setCartCount(total);
        } catch (error) {
            console.error("Lỗi đọc giỏ hàng:", error);
            setCartCount(0);
        }
    };
// ==================================================
// WISHLIST COUNT
// ==================================================

const updateWishlistCount = () => {

    try {

        const wishlist =
            JSON.parse(
                localStorage.getItem(
                    "wishlist"
                ) || "[]"
            );


        if (
            Array.isArray(
                wishlist
            )
        ) {

            setWishlistCount(
                wishlist.length
            );

        } else {

            setWishlistCount(0);
        }


    } catch (error) {

        console.error(
            "Lỗi đọc wishlist:",
            error
        );

        setWishlistCount(0);
    }
};

    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setMenuOpen(false);

        window.location.href = "/";
    };


    // ==================================================
    // CLOSE MENU
    // ==================================================

    const closeMenu = () => {
        setMenuOpen(false);
    };


    // ==================================================
    // RETURN
    // ==================================================

    return (
        <>

            <div className="app">

                {/* ==================================================
    HEADER
================================================== */}

{!isAdminPage && (

    <header className="luxury-header">

                    {/* MENU */}

                    <button
                        className="menu-button"
                        onClick={() => setMenuOpen(true)}
                    >
                        <span className="menu-icon">
                            <span></span>
                            <span></span>
                        </span>

                        <span>MENU</span>
                    </button>


                    {/* LOGO */}

                    <Link
                        to="/"
                        className="luxury-logo"
                        onClick={closeMenu}
                    >
                        BOUTIQUE.
                    </Link>


                    {/* SEARCH */}

                    <div className="header-search">

                        <span className="search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    {/* HEADER ACTIONS */}

                    <div className="header-actions">

                     {/* WISHLIST */}

<Link
    to="/wishlist"
    className="header-icon"
    title="Yêu thích"
>
    <svg
        className="header-svg-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path
            d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
        />
    </svg>

    {wishlistCount > 0 && (
        <span className="wishlist-badge">
            {wishlistCount}
        </span>
    )}
</Link>


{/* CART */}

<Link
    to="/cart"
    className="header-icon"
    title="Giỏ hàng"
>
    <svg
        className="header-svg-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
    >
        <path d="M6 7h12l1 14H5L6 7Z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>

    {cartCount > 0 && (
        <span className="cart-badge">
            {cartCount}
        </span>
    )}
</Link>


{/* ACCOUNT */}

<Link
    to={user ? "/account" : "/auth"}
    className={
        user
            ? "header-account logged-in"
            : "header-account"
    }
    title={
        user
            ? "Tài khoản của tôi"
            : "Đăng nhập"
    }
>
    <span className="account-icon">

        <svg
            className="header-svg-icon"
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

    </span>


    {user && (
        <div className="account-header-info">

            <strong>
                {
                    user.full_name ||
                    "TÀI KHOẢN"
                }
            </strong>

            <span>
                ACCOUNT
            </span>

        </div>
    )}

</Link>

                    </div>

             </header>

)}


                {/* ==================================================
                    SIDE MENU
                ================================================== */}

                {!isAdminPage && menuOpen && (
                    <>

                        {/* NỀN TỐI */}

                        <div
                            className="menu-background"
                            onClick={closeMenu}
                        ></div>


                        {/* SIDE MENU */}

                        <aside className="side-menu">

                            {/* CLOSE */}

                            <button
                                className="close-menu"
                                onClick={closeMenu}
                            >
                                ×
                                <span>ĐÓNG</span>
                            </button>


                            {/* TITLE */}

                            <div className="menu-title">

                                <span>
                                    BOUTIQUE.
                                </span>

                                <h2>
                                    BỘ SƯU TẬP
                                </h2>

                            </div>


                            {/* MENU LIST */}

                            <nav className="side-menu-list">

                                <Link
                                    to="/"
                                    onClick={closeMenu}
                                >
                                    Tất cả sản phẩm
                                </Link>

                                <Link
                                    to="/?category=new"
                                    onClick={closeMenu}
                                >
                                    Bộ sưu tập mới
                                </Link>

                                <Link
                                    to="/?category=women"
                                    onClick={closeMenu}
                                >
                                    Đồ nữ
                                </Link>

                                <Link
                                    to="/?category=men"
                                    onClick={closeMenu}
                                >
                                    Đồ nam
                                </Link>

                                <Link
                                    to="/?category=accessories"
                                    onClick={closeMenu}
                                >
                                    Phụ kiện
                                </Link>

                                <Link
                                    to="/?category=bags"
                                    onClick={closeMenu}
                                >
                                    Túi xách
                                </Link>

                                <Link
                                    to="/?category=shoes"
                                    onClick={closeMenu}
                                >
                                    Giày
                                </Link>

                            </nav>


                            {/* ==================================================
                                MENU BOTTOM
                            ================================================== */}

                            <div className="menu-bottom">

                                {/* TÀI KHOẢN */}

                               {user ? (
    <Link
        to="/account"
        onClick={closeMenu}
    >
        TÀI KHOẢN
    </Link>
) : (
                                    <Link
                                        to="/auth"
                                        onClick={closeMenu}
                                    >
                                        ĐĂNG NHẬP
                                    </Link>
                                )}


                                {/* GIỎ HÀNG */}

                                <Link
                                    to="/cart"
                                    onClick={closeMenu}
                                >
                                    GIỎ HÀNG
                                </Link>


                                {/* ĐĂNG XUẤT */}

                                {user && (
                                    <button
                                        className="logout-button"
                                        onClick={handleLogout}
                                    >
                                        ĐĂNG XUẤT
                                    </button>
                                )}

                            </div>

                        </aside>

                    </>
                )}


                {/* ==================================================
                    ROUTES
                ================================================== */}

                <main>

                    <Routes>

                        {/* ================= USER ================= */}

                        <Route
                            path="/"
                            element={
                                <ProductList
                                    search={search}
                                />
                            }
                        />


                        {/* PRODUCT DETAIL */}

                        <Route
                            path="/products/:id"
                            element={
                                <ProductDetail
                                    updateCartCount={updateCartCount}
                                />
                            }
                        />

                        <Route
                            path="/product/:id"
                            element={
                                <ProductDetail
                                    updateCartCount={updateCartCount}
                                />
                            }
                        />


                        {/* CART */}

                        <Route
                            path="/cart"
                            element={
                                <Cart
                                    updateCartCount={updateCartCount}
                                />
                            }
                        />


                        {/* CHECKOUT */}

                        <Route
    path="/checkout"
    element={
        <ProtectedUserRoute>
            <Checkout
                updateCartCount={updateCartCount}
            />
        </ProtectedUserRoute>
    }
/>

                        {/* ================= MY ORDERS ================= */}

<Route
    path="/my-orders"
    element={
        <ProtectedUserRoute>
            <MyOrders />
        </ProtectedUserRoute>
    }
/>


{/* ================= ACCOUNT ================= */}

<Route
    path="/account"
    element={
        <ProtectedUserRoute>
            <Account />
        </ProtectedUserRoute>
    }
/>

                        {/* AUTH */}

                        <Route
                            path="/auth"
                            element={<Auth />}
                        />


                       {/* ================= WISHLIST ================= */}

<Route
    path="/wishlist"
    element={
        <Wishlist />
    }
/>


                     {/* ==================================================
    ADMIN
================================================== */}

<Route
    path="/admin"
    element={
        <ProtectedAdminRoute>
            <AdminLayout />
        </ProtectedAdminRoute>
    }
>

    {/* ================= DASHBOARD ================= */}

    <Route
        index
        element={
            <AdminDashboard />
        }
    />


    {/* ================= ĐƠN HÀNG ================= */}

    <Route
        path="orders"
        element={
            <AdminOrderManagement />
        }
    />


    {/* ================= SẢN PHẨM ================= */}

    <Route
        path="products"
        element={
            <AdminProductManagement />
        }
    />


    {/* ================= DANH MỤC ================= */}

    <Route
        path="categories"
        element={
            <AdminCategoryManagement />
        }
    />


    {/* ================= NGƯỜI DÙNG ================= */}

    <Route
        path="users"
        element={
            <AdminUserManagement />
        }
    />

</Route>


{/* ==================================================
    404
================================================== */}

<Route
    path="*"
    element={
        <div className="not-found">

            <h1>404</h1>

            <p>
                Trang bạn tìm kiếm
                không tồn tại.
            </p>

            <Link to="/">
                QUAY VỀ TRANG CHỦ
            </Link>

        </div>
    }
/>

</Routes>

</main>

</div>


            {/* ==================================================
                CSS
            ================================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;

                    font-family:
                        "Helvetica Neue",
                        Arial,
                        sans-serif;

                    color: #111;
                    background: #fff;
                }

                button,
                input {
                    font-family: inherit;
                }

                a {
                    color: inherit;
                }


                /* ================= HEADER ================= */

                .luxury-header {
                    width: 100%;
                    height: 78px;

                    display: flex;
                    align-items: center;

                    position: sticky;
                    top: 0;

                    z-index: 1000;

                    background: #fff;

                    border-bottom:
                        1px solid #e5e5e5;

                    padding: 0 38px;
                }


                /* ================= MENU BUTTON ================= */

                .menu-button {
                    display: flex;
                    align-items: center;

                    gap: 12px;

                    background: none;
                    border: none;

                    cursor: pointer;

                    font-size: 11px;
                    letter-spacing: 2px;

                    color: #111;

                    padding: 10px 0;
                }


                .menu-icon {
                    width: 27px;

                    display: flex;
                    flex-direction: column;

                    gap: 6px;
                }


                .menu-icon span {
                    display: block;

                    width: 27px;
                    height: 1px;

                    background: #111;
                }


                /* ================= LOGO ================= */

                .luxury-logo {
                    position: absolute;

                    left: 50%;

                    transform:
                        translateX(-50%);

                    text-decoration: none;

                    font-size: 25px;
                    font-weight: 700;

                    letter-spacing: 7px;

                    color: #111;

                    white-space: nowrap;
                }


                /* ================= SEARCH ================= */

                .header-search {
                    display: flex;
                    align-items: center;

                    gap: 8px;

                    margin-left: 170px;

                    width: 240px;
                    height: 35px;

                    border-bottom:
                        1px solid #222;
                }


                .search-icon {
                    font-size: 21px;
                    line-height: 1;
                }


                .header-search input {
                    width: 100%;

                    border: none;
                    outline: none;

                    background: transparent;

                    font-size: 12px;

                    letter-spacing: 1px;
                }


                .header-search input::placeholder {
                    color: #888;
                }


                /* ================= ACTIONS ================= */

                .header-actions {
                    margin-left: auto;

                    display: flex;
                    align-items: center;

                    gap: 22px;
                }


                .header-icon {
                    position: relative;

                    width: 28px;
                    height: 30px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    text-decoration: none;

                    color: #111;

                    font-size: 23px;

                    transition: opacity .2s;
                }
.header-svg-icon {
    width: 21px;
    height: 21px;

    display: block;

    stroke-linecap: round;
    stroke-linejoin: round;
}

                /* ================= ACCOUNT HEADER ================= */
.header-icon:hover {
    opacity: .5;
}
.header-account {
    display: flex;

    align-items: center;

    gap: 9px;

    color: #111;

    text-decoration: none;

    transition:
        opacity .2s ease;
}


.header-account:hover {
    opacity: .55;
}


.account-icon {
    width: 28px;
    height: 30px;

    display: flex;

    align-items: center;

    justify-content: center;
}


.account-header-info {
    max-width: 120px;

    display: flex;

    flex-direction: column;

    gap: 2px;
}


.account-header-info strong {
    overflow: hidden;

    color: #111;

    font-size: 9px;

    font-weight: 500;

    letter-spacing: 1px;

    text-overflow: ellipsis;

    white-space: nowrap;

    text-transform: uppercase;
}


.account-header-info span {
    color: #999;

    font-size: 6px;

    letter-spacing: 2px;
}

/* ================= WISHLIST BADGE ================= */

.wishlist-badge {
    position: absolute;

    top: -5px;
    right: -8px;

    min-width: 17px;
    height: 17px;

    padding: 0 4px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    background: #111;

    color: #fff;

    font-size: 9px;

    line-height: 1;
}
                /* ================= CART BADGE ================= */

                .cart-badge {
                    position: absolute;

                    top: -5px;
                    right: -8px;

                    width: 17px;
                    height: 17px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    background: #111;
                    color: #fff;

                    border-radius: 50%;

                    font-size: 9px;
                }


                /* ================= MENU BACKGROUND ================= */

                .menu-background {
                    position: fixed;

                    inset: 0;

                    background:
                        rgba(0,0,0,.35);

                    z-index: 1998;
                }


                /* ================= SIDE MENU ================= */

                .side-menu {
                    position: fixed;

                    left: 0;
                    top: 0;

                    width: 440px;
                    height: 100vh;

                    background: #fff;

                    z-index: 1999;

                    padding: 35px 55px;

                    overflow-y: auto;

                    animation:
                        slideMenu .3s ease;
                }


                @keyframes slideMenu {

                    from {
                        transform:
                            translateX(-100%);
                    }

                    to {
                        transform:
                            translateX(0);
                    }

                }


                /* ================= CLOSE ================= */

                .close-menu {
                    display: flex;
                    align-items: center;

                    gap: 10px;

                    background: none;
                    border: none;

                    cursor: pointer;

                    font-size: 24px;

                    padding: 0;

                    color: #111;
                }


                .close-menu span {
                    font-size: 10px;
                    letter-spacing: 2px;
                }


                /* ================= MENU TITLE ================= */

                .menu-title {
                    margin-top: 70px;

                    padding-bottom: 25px;

                    border-bottom:
                        1px solid #ddd;
                }


                .menu-title span {
                    font-size: 9px;

                    letter-spacing: 4px;

                    color: #888;
                }


                .menu-title h2 {
                    margin: 12px 0 0;

                    font-size: 25px;

                    font-weight: 400;

                    letter-spacing: 3px;
                }


                /* ================= MENU LIST ================= */

                .side-menu-list {
                    display: flex;
                    flex-direction: column;
                }


                .side-menu-list a {
                    padding: 20px 0;

                    border-bottom:
                        1px solid #eee;

                    text-decoration: none;

                    font-size: 17px;

                    letter-spacing: .5px;

                    transition:
                        all .2s ease;
                }


                .side-menu-list a:hover {
                    padding-left: 8px;

                    opacity: .5;
                }


                /* ================= MENU BOTTOM ================= */

                .menu-bottom {
                    display: flex;

                    align-items: center;

                    gap: 25px;

                    margin-top: 45px;

                    padding-top: 25px;

                    border-top:
                        1px solid #ddd;

                    flex-wrap: wrap;
                }


                .menu-bottom a {
                    font-size: 11px;

                    letter-spacing: 1.5px;

                    text-decoration: none;
                }


                /* ================= LOGOUT ================= */

                .logout-button {
                    background: none;

                    border: none;

                    padding: 0;

                    cursor: pointer;

                    font-size: 11px;

                    letter-spacing: 1.5px;

                    color: #111;
                }


                .logout-button:hover {
                    opacity: .5;
                }


                /* ================= SIMPLE PAGE ================= */

                .simple-page {
                    min-height: 70vh;

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    text-align: center;
                }


                .simple-page h1 {
                    font-size: 30px;

                    font-weight: 400;

                    letter-spacing: 5px;
                }


                .simple-page p {
                    color: #777;

                    font-size: 13px;
                }


                /* ================= 404 ================= */

                .not-found {
                    min-height: 70vh;

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    text-align: center;
                }


                .not-found h1 {
                    font-size: 80px;

                    font-weight: 300;

                    margin: 0;
                }


                .not-found p {
                    color: #777;

                    margin: 15px 0 30px;
                }


                .not-found a {
                    font-size: 11px;

                    letter-spacing: 2px;
                }


                /* ================= MOBILE ================= */

                @media (max-width: 900px) {
.account-header-info {
    display: none;
}
                    .luxury-header {
                        padding: 0 20px;
                    }

                    .header-search {
                        display: none;
                    }

                    .luxury-logo {
                        font-size: 20px;
                        letter-spacing: 4px;
                    }

                    .header-actions {
                        gap: 10px;
                    }

                    .side-menu {
                        width: 85%;
                        padding: 30px;
                    }

                }


                @media (max-width: 500px) {

                    .luxury-header {
                        height: 68px;
                    }

                    .menu-button span:last-child {
                        display: none;
                    }

                    .luxury-logo {
                        position: static;

                        transform: none;

                        margin-left: 20px;
                    }

                    .header-actions {
                        margin-left: auto;
                    }

                    .header-icon {
                        font-size: 20px;
                    }

                }

            `}</style>

       </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;