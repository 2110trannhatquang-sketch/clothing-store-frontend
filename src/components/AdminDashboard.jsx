import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import API from "../services/api";


// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {

    const [
        dashboard,
        setDashboard
    ] = useState({
        orders: 0,
        products: 0,
        customers: 0,
        revenue: 0,
    });


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    // ========================================================
    // FETCH DASHBOARD
    // ========================================================

    const fetchDashboard =
        async (
            isManualRefresh = false
        ) => {

            try {

                if (
                    isManualRefresh
                ) {

                    setRefreshing(true);

                } else {

                    setLoading(true);
                }


                setError("");


                const response =
                    await API.get(
                        "/admin/dashboard"
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Không thể lấy dữ liệu dashboard"
                    );
                }


                setDashboard({

                    orders:
                        Number(
                            response.data
                                ?.data
                                ?.orders || 0
                        ),

                    products:
                        Number(
                            response.data
                                ?.data
                                ?.products || 0
                        ),

                    customers:
                        Number(
                            response.data
                                ?.data
                                ?.customers || 0
                        ),

                    revenue:
                        Number(
                            response.data
                                ?.data
                                ?.revenue || 0
                        ),
                });


            } catch (err) {

                console.error(
                    "Lỗi dashboard:",
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể lấy dữ liệu dashboard"
                );


            } finally {

                setLoading(false);
                setRefreshing(false);
            }
        };


    // ========================================================
    // LOAD
    // ========================================================

    useEffect(() => {

        fetchDashboard();

    }, []);


    // ========================================================
    // FORMAT MONEY
    // ========================================================

    const formatMoney =
        (value) => {

            return Number(
                value || 0
            ).toLocaleString(
                "vi-VN"
            );
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="dashboard-loading-line">
                </div>

                <p>
                    ĐANG TẢI DASHBOARD
                </p>


                <style>
                    {dashboardStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RETURN
    // ========================================================

    return (

        <div className="admin-dashboard">


            {/* =================================================
                TOP
            ================================================= */}

            <section className="dashboard-top">


                <div>

                    <p className="dashboard-eyebrow">
                        OVERVIEW / 2026
                    </p>


                    <h1>
                        DASHBOARD
                    </h1>


                    <p className="dashboard-description">
                        Tổng quan hoạt động và dữ liệu hiện tại
                        của cửa hàng BOUTIQUE.
                    </p>

                </div>


                <button
                    type="button"
                    className="dashboard-refresh"
                    onClick={() =>
                        fetchDashboard(true)
                    }
                    disabled={
                        refreshing
                    }
                >

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            d="M20 6v5h-5"
                        />

                        <path
                            d="M4 18v-5h5"
                        />

                        <path
                            d="M6.1 9a7 7 0 0 1 11.7-2.6L20 11"
                        />

                        <path
                            d="M17.9 15a7 7 0 0 1-11.7 2.6L4 13"
                        />
                    </svg>


                    <span>

                        {refreshing
                            ? "ĐANG TẢI..."
                            : "LÀM MỚI"}

                    </span>

                </button>


            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="dashboard-error">

                    <span>
                        !
                    </span>


                    <div>

                        <strong>
                            KHÔNG THỂ TẢI DỮ LIỆU
                        </strong>


                        <p>
                            {error}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            fetchDashboard(true)
                        }
                    >
                        THỬ LẠI
                    </button>

                </div>

            )}


            {/* =================================================
                STATS
            ================================================= */}

            {!error && (

                <section className="dashboard-stats">


                    {/* ORDERS */}

                    <Link
                        to="/admin/orders"
                        className="dashboard-card"
                    >

                        <div className="card-top">

                            <span className="card-index">
                                01
                            </span>


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

                        </div>


                        <div className="card-content">

                            <p>
                                ĐƠN HÀNG
                            </p>


                            <strong>
                                {dashboard.orders}
                            </strong>


                            <span>
                                Tổng số đơn hàng
                            </span>

                        </div>


                        <div className="card-bottom">

                            <span>
                                XEM ĐƠN HÀNG
                            </span>

                            <span>
                                →
                            </span>

                        </div>

                    </Link>


                    {/* PRODUCTS */}

                    <Link
                        to="/admin/products"
                        className="dashboard-card"
                    >

                        <div className="card-top">

                            <span className="card-index">
                                02
                            </span>


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

                        </div>


                        <div className="card-content">

                            <p>
                                SẢN PHẨM
                            </p>


                            <strong>
                                {dashboard.products}
                            </strong>


                            <span>
                                Tổng số sản phẩm
                            </span>

                        </div>


                        <div className="card-bottom">

                            <span>
                                QUẢN LÝ SẢN PHẨM
                            </span>

                            <span>
                                →
                            </span>

                        </div>

                    </Link>


                    {/* CUSTOMERS */}

                    <Link
                        to="/admin/users"
                        className="dashboard-card"
                    >

                        <div className="card-top">

                            <span className="card-index">
                                03
                            </span>


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

                        </div>


                        <div className="card-content">

                            <p>
                                KHÁCH HÀNG
                            </p>


                            <strong>
                                {dashboard.customers}
                            </strong>


                            <span>
                                Tổng số khách hàng
                            </span>

                        </div>


                        <div className="card-bottom">

                            <span>
                                QUẢN LÝ NGƯỜI DÙNG
                            </span>

                            <span>
                                →
                            </span>

                        </div>

                    </Link>


                    {/* REVENUE */}

                    <div className="dashboard-card revenue-card">

                        <div className="card-top">

                            <span className="card-index">
                                04
                            </span>


                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    d="M4 19V9"
                                />

                                <path
                                    d="M10 19V5"
                                />

                                <path
                                    d="M16 19v-7"
                                />

                                <path
                                    d="M22 19V3"
                                />
                            </svg>

                        </div>


                        <div className="card-content">

                            <p>
                                DOANH THU
                            </p>


                            <strong className="revenue-number">
                                {formatMoney(
                                    dashboard.revenue
                                )}
                            </strong>


                            <span>
                                Việt Nam Đồng
                            </span>

                        </div>


                        <div className="card-bottom">

                            <span>
                                DOANH THU GHI NHẬN
                            </span>

                            <span>
                                ₫
                            </span>

                        </div>

                    </div>


                </section>

            )}


            {/* =================================================
                MANAGEMENT
            ================================================= */}

            <section className="dashboard-management">


                <div className="management-heading">

                    <div>

                        <p>
                            STORE MANAGEMENT
                        </p>


                        <h2>
                            QUẢN LÝ
                            <br />
                            CỬA HÀNG.
                        </h2>

                    </div>


                    <span>
                        05
                    </span>

                </div>


                <div className="management-links">


                    <Link
                        to="/admin/orders"
                    >

                        <span>
                            01
                        </span>


                        <div>

                            <strong>
                                ĐƠN HÀNG
                            </strong>

                            <small>
                                Theo dõi và cập nhật trạng thái đơn hàng
                            </small>

                        </div>


                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/admin/products"
                    >

                        <span>
                            02
                        </span>


                        <div>

                            <strong>
                                SẢN PHẨM
                            </strong>

                            <small>
                                Quản lý sản phẩm, biến thể và tồn kho
                            </small>

                        </div>


                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/admin/categories"
                    >

                        <span>
                            03
                        </span>


                        <div>

                            <strong>
                                DANH MỤC
                            </strong>

                            <small>
                                Quản lý nhóm và phân loại sản phẩm
                            </small>

                        </div>


                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/admin/users"
                    >

                        <span>
                            04
                        </span>


                        <div>

                            <strong>
                                NGƯỜI DÙNG
                            </strong>

                            <small>
                                Quản lý khách hàng và quyền tài khoản
                            </small>

                        </div>


                        <b>
                            →
                        </b>

                    </Link>


                </div>


            </section>


            {/* =================================================
                FOOTER INFO
            ================================================= */}

            <section className="dashboard-footer-info">


                <div>

                    <span>
                        BOUTIQUE.
                    </span>


                    <p>
                        ADMINISTRATION SYSTEM
                    </p>

                </div>


                <p>
                    Dữ liệu được lấy trực tiếp từ hệ thống quản lý cửa hàng.
                </p>


            </section>


            <style>
                {dashboardStyles}
            </style>


        </div>
    );
};


// ============================================================
// STYLES
// ============================================================

const dashboardStyles = `

    .admin-dashboard {
        width: 100%;

        max-width: 1450px;

        margin: 0 auto;

        color: #111;
    }


    /* ========================================================
       TOP
    ======================================================== */

    .dashboard-top {
        margin-bottom: 35px;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 30px;
    }


    .dashboard-eyebrow {
        margin:
            0 0 12px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .dashboard-top h1 {
        margin: 0;

        font-size:
            clamp(
                32px,
                4vw,
                52px
            );

        font-weight: 300;

        line-height: 1;

        letter-spacing: 2px;
    }


    .dashboard-description {
        margin:
            15px 0 0;

        color: #888;

        font-size: 11px;

        line-height: 1.7;
    }


    /* ========================================================
       REFRESH
    ======================================================== */

    .dashboard-refresh {
        min-width: 125px;
        height: 43px;

        padding:
            0 16px;

        display: flex;

        align-items: center;

        justify-content: center;

        gap: 9px;

        border:
            1px solid #111;

        background: #111;

        color: #fff;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1.5px;

        transition:
            all .2s ease;
    }


    .dashboard-refresh:hover:not(:disabled) {
        background: #fff;

        color: #111;
    }


    .dashboard-refresh:disabled {
        opacity: .5;

        cursor: not-allowed;
    }


    .dashboard-refresh svg {
        width: 14px;
        height: 14px;

        stroke-linecap: round;
        stroke-linejoin: round;
    }


    /* ========================================================
       ERROR
    ======================================================== */

    .dashboard-error {
        margin-bottom: 30px;

        padding: 18px;

        display: flex;

        align-items: center;

        gap: 15px;

        border:
            1px solid #e4c5c1;

        background: #fff8f7;

        color: #8b3025;
    }


    .dashboard-error > span {
        width: 28px;
        height: 28px;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        border:
            1px solid
            currentColor;

        border-radius: 50%;

        font-size: 11px;
    }


    .dashboard-error div {
        flex: 1;
    }


    .dashboard-error strong {
        display: block;

        margin-bottom: 4px;

        font-size: 9px;

        letter-spacing: 1px;
    }


    .dashboard-error p {
        margin: 0;

        font-size: 10px;
    }


    .dashboard-error button {
        border: none;

        background: transparent;

        color: inherit;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1px;

        text-decoration: underline;
    }


    /* ========================================================
       STATS
    ======================================================== */

    .dashboard-stats {
        display: grid;

        grid-template-columns:
            repeat(
                4,
                minmax(
                    0,
                    1fr
                )
            );

        gap: 12px;
    }


    .dashboard-card {
        position: relative;

        min-width: 0;
        min-height: 265px;

        padding: 22px;

        display: flex;

        flex-direction: column;

        justify-content: space-between;

        overflow: hidden;

        border:
            1px solid #dedede;

        background: #fff;

        color: #111;

        text-decoration: none;

        transition:
            all .25s ease;
    }


    a.dashboard-card:hover {
        transform:
            translateY(-3px);

        border-color: #111;
    }


    .card-top {
        display: flex;

        align-items: center;

        justify-content: space-between;
    }


    .card-index {
        color: #aaa;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .card-top svg {
        width: 19px;
        height: 19px;

        color: #555;

        stroke-linecap: round;

        stroke-linejoin: round;
    }


    .card-content p {
        margin:
            0 0 14px;

        color: #999;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .card-content strong {
        display: block;

        overflow: hidden;

        font-size:
            clamp(
                34px,
                3vw,
                48px
            );

        font-weight: 300;

        line-height: 1;

        text-overflow: ellipsis;
    }


    .card-content span {
        display: block;

        margin-top: 12px;

        color: #999;

        font-size: 9px;
    }


    .card-bottom {
        padding-top: 15px;

        display: flex;

        align-items: center;

        justify-content: space-between;

        border-top:
            1px solid #eee;

        color: #888;

        font-size: 7px;

        letter-spacing: 1.5px;
    }


    /* ========================================================
       REVENUE
    ======================================================== */

    .revenue-card {
        border-color: #111;

        background: #111;

        color: #fff;
    }


    .revenue-card
    .card-index,
    .revenue-card
    .card-top svg,
    .revenue-card
    .card-content p,
    .revenue-card
    .card-content span,
    .revenue-card
    .card-bottom {
        color: #888;
    }


    .revenue-card
    .card-bottom {
        border-top-color:
            #333;
    }


    .revenue-number {
    width: 100%;

    display: block;

    overflow: visible !important;

    text-overflow: clip !important;

    white-space: nowrap;

    font-size:
        clamp(
            22px,
            2vw,
            34px
        ) !important;

    letter-spacing: -1px;
}


    /* ========================================================
       MANAGEMENT
    ======================================================== */

    .dashboard-management {
        margin-top: 65px;

        display: grid;

        grid-template-columns:
            minmax(
                260px,
                .8fr
            )
            minmax(
                0,
                1.2fr
            );

        border-top:
            1px solid #111;
    }


    .management-heading {
        position: relative;

        min-height: 380px;

        padding:
            35px 30px
            35px 0;

        display: flex;

        justify-content:
            space-between;

        border-right:
            1px solid #ddd;
    }


    .management-heading p {
        margin:
            0 0 20px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .management-heading h2 {
        margin: 0;

        font-size:
            clamp(
                36px,
                4vw,
                58px
            );

        font-weight: 300;

        line-height: .95;
    }


    .management-heading > span {
        color: #ccc;

        font-size: 8px;
    }


    /* ========================================================
       LINKS
    ======================================================== */

    .management-links {
        display: flex;

        flex-direction: column;
    }


    .management-links a {
        min-height: 95px;

        padding:
            0 25px;

        display: grid;

        grid-template-columns:
            38px 1fr 25px;

        align-items: center;

        gap: 15px;

        border-bottom:
            1px solid #ddd;

        color: #111;

        text-decoration: none;

        transition:
            all .2s ease;
    }


    .management-links a:hover {
        padding-left: 32px;

        background: #111;

        color: #fff;
    }


    .management-links > a > span {
        color: #aaa;

        font-size: 7px;
    }


    .management-links div {
        display: flex;

        flex-direction: column;

        gap: 6px;
    }


    .management-links strong {
        font-size: 10px;

        font-weight: 500;

        letter-spacing: 2px;
    }


    .management-links small {
        color: #999;

        font-size: 9px;

        line-height: 1.5;
    }


    .management-links b {
        font-size: 17px;

        font-weight: 300;
    }


    /* ========================================================
       FOOTER INFO
    ======================================================== */

    .dashboard-footer-info {
        margin-top: 70px;

        padding:
            25px 0;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 30px;

        border-top:
            1px solid #ddd;

        color: #999;
    }


    .dashboard-footer-info div span {
        color: #111;

        font-size: 11px;

        font-weight: 600;

        letter-spacing: 3px;
    }


    .dashboard-footer-info div p {
        margin:
            6px 0 0;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .dashboard-footer-info > p {
        margin: 0;

        font-size: 8px;
    }


    /* ========================================================
       LOADING
    ======================================================== */

    .dashboard-loading {
        min-height: 55vh;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;
    }


    .dashboard-loading p {
        color: #999;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .dashboard-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            dashboardLoad
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes dashboardLoad {

        0%,
        100% {
            opacity: .3;

            transform:
                scaleX(.3);
        }


        50% {
            opacity: 1;

            transform:
                scaleX(1);
        }
    }


    /* ========================================================
       RESPONSIVE
    ======================================================== */

    @media (
        max-width: 1150px
    ) {

        .dashboard-stats {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .dashboard-card {
            min-height: 230px;
        }

    }


    @media (
        max-width: 800px
    ) {

        .dashboard-management {
            grid-template-columns:
                1fr;
        }


        .management-heading {
            min-height: 260px;

            border-right: none;

            border-bottom:
                1px solid #ddd;
        }

    }


    @media (
        max-width: 600px
    ) {

        .dashboard-top {
            align-items:
                flex-start;

            flex-direction:
                column;
        }


        .dashboard-refresh {
            width: 100%;
        }


        .dashboard-stats {
            grid-template-columns:
                1fr;
        }


        .dashboard-card {
            min-height: 215px;
        }


        .dashboard-footer-info {
            align-items:
                flex-start;

            flex-direction:
                column;
        }

    }

`;


export default AdminDashboard;