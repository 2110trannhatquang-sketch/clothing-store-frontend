import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import API from "../services/api";


const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80";


// ============================================================
// MY ORDERS
// ============================================================

const MyOrders = () => {

    const navigate =
        useNavigate();


    const [
        orders,
        setOrders
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        cancellingId,
        setCancellingId
    ] = useState(null);


    // ========================================================
    // LOAD ORDERS
    // ========================================================

    useEffect(() => {

        const fetchOrders =
            async () => {

                const token =
                    localStorage.getItem(
                        "token"
                    );


                if (!token) {

                    alert(
                        "Vui lòng đăng nhập để xem đơn hàng."
                    );

                    navigate(
                        "/login"
                    );

                    return;
                }


                try {

                    setLoading(true);


                    const response =
                        await API.get(
                            "/orders/my-orders",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        );


                    if (
                        response.data?.success
                    ) {

                        setOrders(
                            response.data.orders ||
                            []
                        );
                    }


                } catch (error) {

                    console.error(
                        "Lỗi lấy đơn hàng:",
                        error
                    );


                    if (
                        error.response?.status ===
                        401
                    ) {

                        alert(
                            "Phiên đăng nhập đã hết hạn."
                        );

                        navigate(
                            "/login"
                        );
                    }


                } finally {

                    setLoading(false);
                }
            };


        fetchOrders();

    }, [navigate]);


    // ========================================================
    // FORMAT MONEY
    // ========================================================

    const formatCurrency =
        (amount) => {

            return Number(
                amount || 0
            ).toLocaleString(
                "vi-VN"
            ) + " ₫";
        };


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate =
        (date) => {

            if (!date) {
                return "";
            }


            return new Date(
                date
            ).toLocaleString(
                "vi-VN",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        };


    // ========================================================
    // ORDER STATUS
    // ========================================================

    const getStatus =
        (status) => {

            const map = {

                pending: {
                    text:
                        "CHỜ XỬ LÝ",
                    className:
                        "pending",
                },

                confirmed: {
                    text:
                        "ĐÃ XÁC NHẬN",
                    className:
                        "confirmed",
                },

                shipping: {
                    text:
                        "ĐANG GIAO",
                    className:
                        "shipping",
                },

                completed: {
                    text:
                        "HOÀN THÀNH",
                    className:
                        "completed",
                },

                cancelled: {
                    text:
                        "ĐÃ HỦY",
                    className:
                        "cancelled",
                },
            };


            return (
                map[status] || {
                    text:
                        String(
                            status ||
                            "UNKNOWN"
                        ).toUpperCase(),

                    className:
                        "default",
                }
            );
        };


    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    const getPaymentMethod =
        (method) => {

            switch (method) {

                case "COD":
                    return "Thanh toán khi nhận hàng";

                case "BANK_TRANSFER":
                    return "Chuyển khoản ngân hàng";

                case "VNPAY":
                    return "VNPay";

                case "MOMO":
                    return "MoMo";

                default:
                    return method || "Không xác định";
            }
        };


    // ========================================================
    // PAYMENT STATUS
    // ========================================================

    const getPaymentStatus =
        (status) => {

            return status ===
                "paid"
                ? "ĐÃ THANH TOÁN"
                : "CHƯA THANH TOÁN";
        };


    // ========================================================
    // CANCEL ORDER
    // ========================================================

    const handleCancelOrder =
        async (orderId) => {

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn hủy đơn hàng #${orderId}?`
                );


            if (!confirmed) {
                return;
            }


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                navigate(
                    "/login"
                );

                return;
            }


            try {

                setCancellingId(
                    orderId
                );


                const response =
                    await API.put(
                        `/orders/${orderId}/cancel`,
                        {},
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (
                    response.data?.success
                ) {

                    setOrders(
                        (currentOrders) =>
                            currentOrders.map(
                                (order) =>
                                    order.id ===
                                    orderId
                                        ? {
                                            ...order,
                                            status:
                                                "cancelled",
                                        }
                                        : order
                            )
                    );


                    alert(
                        "Đã hủy đơn hàng thành công."
                    );
                }


            } catch (error) {

                console.error(
                    "Lỗi hủy đơn hàng:",
                    error
                );


                alert(
                    error.response?.data
                        ?.message ||
                    "Không thể hủy đơn hàng."
                );


            } finally {

                setCancellingId(
                    null
                );
            }
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="orders-state">

                <div className="orders-loading">
                </div>

                <p>
                    ĐANG TẢI ĐƠN HÀNG
                </p>

                <style>
                    {styles}
                </style>

            </div>
        );
    }


    // ========================================================
    // EMPTY
    // ========================================================

    if (
        orders.length ===
        0
    ) {

        return (

            <div className="orders-empty">

                <p className="eyebrow">
                    BOUTIQUE.
                </p>


                <h1>
                    NO ORDERS
                    <br />
                    YET.
                </h1>


                <p className="empty-description">

                    Bạn chưa có đơn hàng nào.
                    Hãy khám phá bộ sưu tập
                    của BOUTIQUE.

                </p>


                <Link
                    to="/"
                    className="shop-button"
                >

                    KHÁM PHÁ SẢN PHẨM

                    <span>
                        →
                    </span>

                </Link>


                <style>
                    {styles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="orders-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="orders-header">

                <div>

                    <p className="eyebrow">
                        BOUTIQUE · ACCOUNT
                    </p>


                    <h1>
                        ĐƠN HÀNG
                    </h1>

                </div>


                <div className="orders-count">

                    <span>
                        {String(
                            orders.length
                        ).padStart(
                            2,
                            "0"
                        )}
                    </span>

                    <p>
                        ĐƠN HÀNG
                    </p>

                </div>

            </section>


            {/* =================================================
                ORDER LIST
            ================================================= */}

            <section className="orders-list">

                {orders.map(
                    (
                        order,
                        orderIndex
                    ) => {

                        const status =
                            getStatus(
                                order.status
                            );


                        return (

                            <article
                                key={
                                    order.id
                                }
                                className="order-card"
                            >


                                {/* =================================
                                    ORDER HEADER
                                ================================= */}

                                <div className="order-header">


                                    <div className="order-number">

                                        <span>
                                            {String(
                                                orderIndex +
                                                1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>


                                        <div>

                                            <p>
                                                ORDER
                                            </p>

                                            <h2>
                                                #{order.id}
                                            </h2>

                                        </div>

                                    </div>


                                    <div className="order-date">

                                        <p>
                                            NGÀY ĐẶT
                                        </p>

                                        <strong>
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </strong>

                                    </div>


                                    <span
                                        className={
                                            `status-badge ${status.className}`
                                        }
                                    >
                                        {status.text}
                                    </span>

                                </div>


                                {/* =================================
                                    PRODUCTS
                                ================================= */}

                                <div className="order-products">

                                    {order.items?.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                        <div
                                            key={
                                                item.id ||
                                                index
                                            }
                                            className="order-product"
                                        >


                                            <div className="product-image">

                                                <img
                                                    src={
                                                        item.imageUrl ||
                                                        FALLBACK_IMAGE
                                                    }
                                                    alt={
                                                        item.productName ||
                                                        "Sản phẩm"
                                                    }
                                                />

                                            </div>


                                            <div className="product-info">

                                                <p>
                                                    BOUTIQUE COLLECTION
                                                </p>


                                                <h3>
                                                    {
                                                        item.productName
                                                    }
                                                </h3>


                                                <div className="product-meta">

                                                    {item.size && (

                                                        <span>
                                                            SIZE
                                                            <strong>
                                                                {
                                                                    item.size
                                                                }
                                                            </strong>
                                                        </span>

                                                    )}


                                                    {item.color && (

                                                        <span>
                                                            MÀU
                                                            <strong>
                                                                {
                                                                    item.color
                                                                }
                                                            </strong>
                                                        </span>

                                                    )}


                                                    <span>
                                                        SỐ LƯỢNG
                                                        <strong>
                                                            ×{
                                                                item.quantity
                                                            }
                                                        </strong>
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="product-price">

                                                <p>
                                                    ĐƠN GIÁ
                                                </p>

                                                <strong>
                                                    {formatCurrency(
                                                        item.unitPrice
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                    ))}

                                </div>


                                {/* =================================
                                    INFORMATION
                                ================================= */}

                                <div className="order-information">


                                    <div>

                                        <span>
                                            01
                                        </span>

                                        <p>
                                            GIAO HÀNG
                                        </p>

                                        <strong>
                                            {
                                                order.shippingAddress ||
                                                "Chưa có địa chỉ"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            02
                                        </span>

                                        <p>
                                            SỐ ĐIỆN THOẠI
                                        </p>

                                        <strong>
                                            {
                                                order.phoneNumber ||
                                                "—"
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            03
                                        </span>

                                        <p>
                                            THANH TOÁN
                                        </p>

                                        <strong>

                                            {getPaymentMethod(
                                                order.paymentMethod
                                            )}

                                        </strong>


                                        <small>

                                            {getPaymentStatus(
                                                order.paymentStatus
                                            )}

                                        </small>

                                    </div>

                                </div>


                                {order.note && (

                                    <div className="order-note">

                                        <span>
                                            GHI CHÚ
                                        </span>

                                        <p>
                                            {order.note}
                                        </p>

                                    </div>

                                )}


                                {/* =================================
                                    FOOTER
                                ================================= */}

                                <div className="order-footer">


                                    <div>

                                        {order.status ===
                                            "pending" && (

                                            <button
                                                type="button"
                                                className="cancel-button"
                                                disabled={
                                                    cancellingId ===
                                                    order.id
                                                }
                                                onClick={() =>
                                                    handleCancelOrder(
                                                        order.id
                                                    )
                                                }
                                            >

                                                {cancellingId ===
                                                order.id
                                                    ? "ĐANG HỦY..."
                                                    : "HỦY ĐƠN HÀNG"}

                                            </button>

                                        )}

                                    </div>


                                    <div className="order-total">

                                        <span>
                                            TỔNG CỘNG
                                        </span>

                                        <strong>

                                            {formatCurrency(
                                                order.totalAmount
                                            )}

                                        </strong>

                                    </div>

                                </div>


                            </article>

                        );
                    }
                )}

            </section>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="orders-bottom">

                <p>
                    BOUTIQUE · 2026
                </p>

                <h2>
                    YOUR STYLE.
                    <br />
                    YOUR STORY.
                </h2>

                <Link to="/">
                    CONTINUE SHOPPING →
                </Link>

            </section>


            <style>
                {styles}
            </style>

        </div>
    );
};


// ============================================================
// CSS
// ============================================================

const styles = `

    * {
        box-sizing: border-box;
    }


    .orders-page {
        width: 100%;

        background: #fff;

        color: #111;

        font-family:
            "Helvetica Neue",
            Arial,
            sans-serif;
    }


    /* ========================================================
       HEADER
    ======================================================== */

    .orders-header {
        min-height: 230px;

        padding:
            70px 5%
            45px;

        display: flex;

        align-items: flex-end;

        justify-content:
            space-between;

        border-bottom:
            1px solid #ddd;
    }


    .eyebrow {
        margin:
            0 0 15px;

        color: #999;

        font-size: 9px;

        letter-spacing: 4px;
    }


    .orders-header h1 {
        margin: 0;

        font-size:
            clamp(
                42px,
                5vw,
                70px
            );

        font-weight: 300;

        letter-spacing: 3px;
    }


    .orders-count {
        text-align: right;
    }


    .orders-count > span {
        font-size: 28px;

        font-weight: 300;
    }


    .orders-count p {
        margin:
            5px 0 0;

        color: #999;

        font-size: 8px;

        letter-spacing: 2px;
    }


    /* ========================================================
       LIST
    ======================================================== */

    .orders-list {
        padding:
            55px 5%
            100px;

        display: grid;

        gap: 35px;

        background: #f7f7f5;
    }


    .order-card {
        background: #fff;

        border:
            1px solid #ddd;
    }


    /* ========================================================
       ORDER HEADER
    ======================================================== */

    .order-header {
        min-height: 105px;

        padding:
            25px 30px;

        display: grid;

        grid-template-columns:
            1fr auto auto;

        gap: 40px;

        align-items: center;

        border-bottom:
            1px solid #e5e5e5;
    }


    .order-number {
        display: flex;

        align-items: center;

        gap: 20px;
    }


    .order-number > span {
        color: #ccc;

        font-size: 38px;

        font-weight: 200;
    }


    .order-number p,
    .order-date p {
        margin:
            0 0 5px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .order-number h2 {
        margin: 0;

        font-size: 17px;

        font-weight: 500;

        letter-spacing: 1px;
    }


    .order-date strong {
        font-size: 10px;

        font-weight: 400;
    }


    /* ========================================================
       STATUS
    ======================================================== */

    .status-badge {
        min-width: 115px;

        padding:
            10px 12px;

        text-align: center;

        font-size: 7px;

        letter-spacing: 1.5px;

        border:
            1px solid #ddd;
    }


    .status-badge.pending {
        background: #fff8df;

        border-color: #ead98e;
    }


    .status-badge.confirmed {
        background: #eef3ff;

        border-color: #b9caef;
    }


    .status-badge.shipping {
        background: #eaf7f8;

        border-color: #acd9dc;
    }


    .status-badge.completed {
        background: #edf7ef;

        border-color: #b9d9be;
    }


    .status-badge.cancelled {
        background: #f8eded;

        border-color: #e2bbbb;

        color: #9d4545;
    }


    /* ========================================================
       PRODUCTS
    ======================================================== */

    .order-products {
        padding:
            0 30px;
    }


    .order-product {
        display: grid;

        grid-template-columns:
            100px
            minmax(0, 1fr)
            150px;

        gap: 25px;

        align-items: center;

        padding:
            25px 0;

        border-bottom:
            1px solid #eee;
    }


    .product-image {
        width: 100px;

        aspect-ratio:
            3 / 4;

        overflow: hidden;

        background: #eee;
    }


    .product-image img {
        width: 100%;
        height: 100%;

        object-fit: cover;

        display: block;
    }


    .product-info > p {
        margin:
            0 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .product-info h3 {
        margin: 0;

        font-size: 15px;

        font-weight: 500;
    }


    .product-meta {
        display: flex;

        gap: 25px;

        margin-top: 17px;
    }


    .product-meta span {
        display: flex;

        flex-direction: column;

        gap: 4px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .product-meta strong {
        color: #333;

        font-size: 9px;

        font-weight: 500;

        letter-spacing: 0;
    }


    .product-price {
        text-align: right;
    }


    .product-price p {
        margin:
            0 0 7px;

        color: #999;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .product-price strong {
        font-size: 12px;

        font-weight: 500;
    }


    /* ========================================================
       INFO
    ======================================================== */

    .order-information {
        padding:
            28px 30px;

        display: grid;

        grid-template-columns:
            repeat(
                3,
                1fr
            );

        gap: 30px;
    }


    .order-information > div {
        min-width: 0;
    }


    .order-information span {
        color: #bbb;

        font-size: 8px;
    }


    .order-information p {
        margin:
            8px 0 6px;

        color: #999;

        font-size: 7px;

        letter-spacing: 1.5px;
    }


    .order-information strong {
        display: block;

        font-size: 10px;

        font-weight: 400;

        line-height: 1.7;
    }


    .order-information small {
        display: block;

        margin-top: 6px;

        color: #888;

        font-size: 7px;

        letter-spacing: 1px;
    }


    /* ========================================================
       NOTE
    ======================================================== */

    .order-note {
        margin:
            0 30px 28px;

        padding:
            15px;

        background: #f7f7f5;
    }


    .order-note span {
        color: #999;

        font-size: 7px;

        letter-spacing: 1.5px;
    }


    .order-note p {
        margin:
            7px 0 0;

        color: #555;

        font-size: 10px;

        line-height: 1.6;
    }


    /* ========================================================
       FOOTER
    ======================================================== */

    .order-footer {
        min-height: 90px;

        padding:
            20px 30px;

        display: flex;

        justify-content:
            space-between;

        align-items: center;

        border-top:
            1px solid #ddd;

        background: #fafafa;
    }


    .cancel-button {
        padding:
            12px 16px;

        border:
            1px solid #111;

        background: #fff;

        color: #111;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1.5px;

        transition:
            all .2s ease;
    }


    .cancel-button:hover:not(:disabled) {
        background: #111;

        color: #fff;
    }


    .cancel-button:disabled {
        cursor: not-allowed;

        opacity: .4;
    }


    .order-total {
        text-align: right;
    }


    .order-total span {
        display: block;

        margin-bottom: 7px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .order-total strong {
        font-size: 20px;

        font-weight: 400;
    }


    /* ========================================================
       BOTTOM
    ======================================================== */

    .orders-bottom {
        padding:
            120px 20px;

        text-align: center;

        background: #111;

        color: #fff;
    }


    .orders-bottom p {
        margin:
            0 0 20px;

        color: #777;

        font-size: 8px;

        letter-spacing: 4px;
    }


    .orders-bottom h2 {
        margin: 0;

        font-size:
            clamp(
                42px,
                6vw,
                76px
            );

        line-height: .95;

        font-weight: 300;
    }


    .orders-bottom a {
        display: inline-block;

        margin-top: 35px;

        padding-bottom: 7px;

        border-bottom:
            1px solid #fff;

        color: #fff;

        text-decoration: none;

        font-size: 8px;

        letter-spacing: 2px;
    }


    /* ========================================================
       EMPTY + LOADING
    ======================================================== */

    .orders-empty,
    .orders-state {
        min-height:
            calc(
                100vh -
                78px
            );

        padding: 50px 20px;

        display: flex;

        flex-direction: column;

        justify-content: center;

        align-items: center;

        text-align: center;

        font-family:
            "Helvetica Neue",
            Arial,
            sans-serif;
    }


    .orders-empty h1 {
        margin: 0;

        font-size:
            clamp(
                45px,
                7vw,
                90px
            );

        line-height: .95;

        font-weight: 300;
    }


    .empty-description {
        max-width: 430px;

        margin:
            30px auto;

        color: #777;

        font-size: 11px;

        line-height: 1.8;
    }


    .shop-button {
        min-width: 260px;

        padding:
            17px 20px;

        display: flex;

        justify-content:
            space-between;

        background: #111;

        color: #fff;

        text-decoration: none;

        font-size: 8px;

        letter-spacing: 2px;
    }


    .orders-state p {
        color: #777;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .orders-loading {
        width: 80px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            orderLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes orderLoading {

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


    /* ========================================================
       MOBILE
    ======================================================== */

    @media (
        max-width: 750px
    ) {

        .orders-header {
            min-height: 190px;

            padding:
                55px 20px
                30px;
        }


        .orders-list {
            padding:
                30px 15px
                70px;
        }


        .order-header {
            grid-template-columns:
                1fr;

            gap: 15px;

            padding:
                20px;
        }


        .order-date {
            display: none;
        }


        .status-badge {
            width: fit-content;
        }


        .order-products {
            padding:
                0 20px;
        }


        .order-product {
            grid-template-columns:
                85px
                1fr;

            gap: 15px;
        }


        .product-image {
            width: 85px;
        }


        .product-price {
            grid-column: 2;

            text-align: left;
        }


        .product-meta {
            gap: 14px;

            flex-wrap: wrap;
        }


        .order-information {
            padding:
                25px 20px;

            grid-template-columns:
                1fr;

            gap: 22px;
        }


        .order-note {
            margin:
                0 20px
                25px;
        }


        .order-footer {
            padding:
                20px;

            align-items:
                flex-start;

            gap: 20px;

            flex-direction:
                column;
        }


        .order-total {
            text-align: left;
        }

    }

`;


export default MyOrders;