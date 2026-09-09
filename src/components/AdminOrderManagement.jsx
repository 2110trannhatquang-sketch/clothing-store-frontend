import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import API from "../services/api";


// ============================================================
// ADMIN ORDER MANAGEMENT
// ============================================================

const AdminOrderManagement = () => {

    const [
        orders,
        setOrders
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        expandedOrderId,
        setExpandedOrderId
    ] = useState(null);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState("all");


    const [
        paymentFilter,
        setPaymentFilter
    ] = useState("all");


    const [
        message,
        setMessage
    ] = useState({
        type: "",
        text: "",
    });


    const [
        updatingOrderId,
        setUpdatingOrderId
    ] = useState(null);


    // ========================================================
    // LOAD ORDERS
    // ========================================================

    const fetchOrders =
        async (
            manual = false
        ) => {

            try {

                if (manual) {

                    setRefreshing(true);

                } else {

                    setLoading(true);
                }


                setMessage({
                    type: "",
                    text: "",
                });


                const response =
                    await API.get(
                        "/admin/orders"
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Không thể tải danh sách đơn hàng."
                    );
                }


                setOrders(
                    response.data?.orders ||
                    []
                );


            } catch (error) {

                console.error(
                    "Lỗi lấy đơn hàng:",
                    error
                );


                setMessage({
                    type: "error",

                    text:
                        error.response
                            ?.data
                            ?.message ||
                        error.message ||
                        "Không thể tải dữ liệu đơn hàng.",
                });


            } finally {

                setLoading(false);
                setRefreshing(false);
            }
        };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        fetchOrders();

    }, []);


    // ========================================================
    // CLEAR MESSAGE
    // ========================================================

    const showMessage =
        (
            type,
            text
        ) => {

            setMessage({
                type,
                text,
            });


            window.setTimeout(
                () => {

                    setMessage({
                        type: "",
                        text: "",
                    });

                },
                3500
            );
        };


    // ========================================================
    // UPDATE ORDER STATUS
    // ========================================================

    const handleStatusChange =
        async (
            orderId,
            newStatus
        ) => {

            const currentOrder =
                orders.find(
                    (order) =>
                        order.id ===
                        orderId
                );


            if (
                currentOrder?.status ===
                newStatus
            ) {

                return;
            }


            try {

                setUpdatingOrderId(
                    orderId
                );


                const response =
                    await API.put(
                        `/admin/orders/${orderId}/status`,
                        {
                            status:
                                newStatus,
                        }
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Không thể cập nhật trạng thái đơn hàng."
                    );
                }


                setOrders(
                    (currentOrders) =>
                        currentOrders.map(
                            (order) =>
                                order.id ===
                                    orderId
                                    ? {
                                        ...order,

                                        status:
                                            newStatus,
                                    }
                                    : order
                        )
                );


                showMessage(
                    "success",
                    response.data?.message ||
                    `Đã cập nhật trạng thái đơn #${orderId}.`
                );


            } catch (error) {

                console.error(
                    "Lỗi cập nhật trạng thái:",
                    error
                );


                showMessage(
                    "error",

                    error.response
                        ?.data
                        ?.message ||
                    error.message ||
                    "Không thể cập nhật trạng thái đơn hàng."
                );


            } finally {

                setUpdatingOrderId(
                    null
                );
            }
        };


    // ========================================================
    // UPDATE PAYMENT STATUS
    // ========================================================

    const handlePaymentChange =
        async (
            orderId,
            newPaymentStatus
        ) => {

            const currentOrder =
                orders.find(
                    (order) =>
                        order.id ===
                        orderId
                );


            if (
                currentOrder
                    ?.paymentStatus ===
                newPaymentStatus
            ) {

                return;
            }


            try {

                setUpdatingOrderId(
                    orderId
                );


                const response =
                    await API.put(
                        `/admin/orders/${orderId}/payment`,
                        {
                            payment_status:
                                newPaymentStatus,
                        }
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Không thể cập nhật trạng thái thanh toán."
                    );
                }


                setOrders(
                    (currentOrders) =>
                        currentOrders.map(
                            (order) =>
                                order.id ===
                                    orderId
                                    ? {
                                        ...order,

                                        paymentStatus:
                                            newPaymentStatus,
                                    }
                                    : order
                        )
                );


                showMessage(
                    "success",
                    response.data?.message ||
                    `Đã cập nhật thanh toán đơn #${orderId}.`
                );


            } catch (error) {

                console.error(
                    "Lỗi cập nhật thanh toán:",
                    error
                );


                showMessage(
                    "error",

                    error.response
                        ?.data
                        ?.message ||
                    error.message ||
                    "Không thể cập nhật trạng thái thanh toán."
                );


            } finally {

                setUpdatingOrderId(
                    null
                );
            }
        };


    // ========================================================
    // EXPAND ORDER
    // ========================================================

    const toggleRowExpansion =
        (orderId) => {

            setExpandedOrderId(
                (current) =>
                    current ===
                        orderId
                        ? null
                        : orderId
            );
        };


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
    // FORMAT DATE
    // ========================================================

    const formatDate =
        (value) => {

            if (!value) {

                return "Không xác định";
            }


            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return String(
                    value
                );
            }


            return date.toLocaleString(
                "vi-VN"
            );
        };


    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    const formatPaymentMethod =
        (method) => {

            const normalized =
                String(
                    method || ""
                )
                    .trim()
                    .toLowerCase();


            if (
                normalized === "cod"
            ) {

                return "Thanh toán khi nhận hàng";
            }


            if (
                normalized ===
                    "bank_transfer" ||
                normalized ===
                    "bank-transfer"
            ) {

                return "Chuyển khoản ngân hàng";
            }


            if (!normalized) {

                return "Chưa xác định";
            }


            return String(
                method
            );
        };


    // ========================================================
    // ORDER STATUS
    // ========================================================

    const getStatusInfo =
        (status) => {

            const map = {

                pending: {
                    label:
                        "CHỜ XỬ LÝ",

                    className:
                        "pending",
                },

                confirmed: {
                    label:
                        "ĐÃ XÁC NHẬN",

                    className:
                        "confirmed",
                },

                shipping: {
                    label:
                        "ĐANG GIAO",

                    className:
                        "shipping",
                },

                completed: {
                    label:
                        "HOÀN THÀNH",

                    className:
                        "completed",
                },

                cancelled: {
                    label:
                        "ĐÃ HỦY",

                    className:
                        "cancelled",
                },
            };


            return (
                map[status] ||
                {
                    label:
                        status ||
                        "KHÔNG XÁC ĐỊNH",

                    className:
                        "unknown",
                }
            );
        };


    // ========================================================
    // PAYMENT STATUS
    // ========================================================

    const getPaymentInfo =
        (status) => {

            const map = {

                pending: {
                    label:
                        "CHƯA THANH TOÁN",

                    className:
                        "pending",
                },

                paid: {
                    label:
                        "ĐÃ THANH TOÁN",

                    className:
                        "paid",
                },

                failed: {
                    label:
                        "THẤT BẠI",

                    className:
                        "failed",
                },

                cancelled: {
                    label:
                        "ĐÃ HỦY",

                    className:
                        "cancelled",
                },
            };


            return (
                map[status] ||
                {
                    label:
                        "CHƯA XÁC ĐỊNH",

                    className:
                        "unknown",
                }
            );
        };


    // ========================================================
    // FILTER ORDERS
    // ========================================================

    const filteredOrders =
        useMemo(
            () => {

                const keyword =
                    search
                        .trim()
                        .toLowerCase();


                return orders.filter(
                    (order) => {

                        const matchesStatus =
                            statusFilter ===
                                "all" ||
                            order.status ===
                                statusFilter;


                        const matchesPayment =
                            paymentFilter ===
                                "all" ||
                            (
                                order.paymentStatus ||
                                "pending"
                            ) ===
                                paymentFilter;


                        const searchableText =
                            [
                                order.id,
                                order.customerName,
                                order.customerEmail,
                                order.phoneNumber,
                                order.shippingAddress,
                                order.paymentMethod,
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        const matchesSearch =
                            !keyword ||
                            searchableText.includes(
                                keyword
                            );


                        return (
                            matchesStatus &&
                            matchesPayment &&
                            matchesSearch
                        );
                    }
                );
            },
            [
                orders,
                search,
                statusFilter,
                paymentFilter,
            ]
        );


    // ========================================================
    // SUMMARY
    // ========================================================

    const summary =
        useMemo(
            () => {

                return {

                    total:
                        orders.length,

                    pending:
                        orders.filter(
                            (order) =>
                                order.status ===
                                "pending"
                        ).length,

                    shipping:
                        orders.filter(
                            (order) =>
                                order.status ===
                                "shipping"
                        ).length,

                    completed:
                        orders.filter(
                            (order) =>
                                order.status ===
                                "completed"
                        ).length,
                };
            },
            [orders]
        );


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="admin-orders-loading">

                <div className="orders-loading-line">
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
    // RETURN
    // ========================================================

    return (

        <div className="admin-orders-page">


            {/* =================================================
                TOP
            ================================================= */}

            <section className="orders-top">


                <div>

                    <p className="orders-eyebrow">
                        ORDERS / MANAGEMENT
                    </p>


                    <h1>
                        ĐƠN HÀNG
                    </h1>


                    <p className="orders-description">
                        Theo dõi đơn hàng, xử lý trạng thái và
                        quản lý thanh toán của khách hàng.
                    </p>

                </div>


                <button
                    type="button"
                    className="orders-refresh"
                    disabled={
                        refreshing
                    }
                    onClick={() =>
                        fetchOrders(true)
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
                MESSAGE
            ================================================= */}

            {message.text && (

                <div
                    className={
                        `orders-message ${message.type}`
                    }
                >

                    <span>
                        {message.type ===
                            "success"
                            ? "✓"
                            : "!"}
                    </span>


                    <p>
                        {message.text}
                    </p>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="orders-summary">


                <div className="summary-box">

                    <span>
                        01
                    </span>

                    <p>
                        TỔNG ĐƠN
                    </p>

                    <strong>
                        {summary.total}
                    </strong>

                </div>


                <div className="summary-box">

                    <span>
                        02
                    </span>

                    <p>
                        CHỜ XỬ LÝ
                    </p>

                    <strong>
                        {summary.pending}
                    </strong>

                </div>


                <div className="summary-box">

                    <span>
                        03
                    </span>

                    <p>
                        ĐANG GIAO
                    </p>

                    <strong>
                        {summary.shipping}
                    </strong>

                </div>


                <div className="summary-box">

                    <span>
                        04
                    </span>

                    <p>
                        HOÀN THÀNH
                    </p>

                    <strong>
                        {summary.completed}
                    </strong>

                </div>


            </section>


            {/* =================================================
                FILTERS
            ================================================= */}

            <section className="orders-toolbar">


                <div className="orders-search">

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="7"
                        />

                        <path
                            d="m20 20-4-4"
                        />
                    </svg>


                    <input
                        type="text"
                        value={
                            search
                        }
                        onChange={
                            (event) =>
                                setSearch(
                                    event.target.value
                                )
                        }
                        placeholder="Tìm mã đơn, khách hàng, email, số điện thoại..."
                    />

                </div>


                <select
                    value={
                        statusFilter
                    }
                    onChange={
                        (event) =>
                            setStatusFilter(
                                event.target.value
                            )
                    }
                >

                    <option value="all">
                        TẤT CẢ TRẠNG THÁI
                    </option>

                    <option value="pending">
                        CHỜ XỬ LÝ
                    </option>

                    <option value="confirmed">
                        ĐÃ XÁC NHẬN
                    </option>

                    <option value="shipping">
                        ĐANG GIAO
                    </option>

                    <option value="completed">
                        HOÀN THÀNH
                    </option>

                    <option value="cancelled">
                        ĐÃ HỦY
                    </option>

                </select>


                <select
                    value={
                        paymentFilter
                    }
                    onChange={
                        (event) =>
                            setPaymentFilter(
                                event.target.value
                            )
                    }
                >

                    <option value="all">
                        TẤT CẢ THANH TOÁN
                    </option>

                    <option value="pending">
                        CHƯA THANH TOÁN
                    </option>

                    <option value="paid">
                        ĐÃ THANH TOÁN
                    </option>

                    <option value="failed">
                        THẤT BẠI
                    </option>

                    <option value="cancelled">
                        ĐÃ HỦY
                    </option>

                </select>


            </section>


            {/* =================================================
                RESULT COUNT
            ================================================= */}

            <div className="orders-result-count">

                <span>
                    KẾT QUẢ
                </span>


                <strong>
                    {filteredOrders.length}
                </strong>


                <span>
                    / {orders.length} ĐƠN
                </span>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredOrders.length === 0 ? (

                <section className="orders-empty">

                    <span>
                        BOUTIQUE.
                    </span>


                    <h2>
                        KHÔNG CÓ
                        <br />
                        ĐƠN HÀNG.
                    </h2>


                    <p>
                        Không tìm thấy đơn hàng phù hợp với
                        điều kiện hiện tại.
                    </p>

                </section>

            ) : (

                // =================================================
                // ORDERS
                // =================================================

                <section className="orders-list">


                    {filteredOrders.map(
                        (order) => {

                            const isExpanded =
                                expandedOrderId ===
                                order.id;


                            const statusInfo =
                                getStatusInfo(
                                    order.status
                                );


                            const paymentInfo =
                                getPaymentInfo(
                                    order.paymentStatus ||
                                    "pending"
                                );


                            const updating =
                                updatingOrderId ===
                                order.id;


                            return (

                                <article
                                    key={
                                        order.id
                                    }
                                    className={
                                        isExpanded
                                            ? "order-card expanded"
                                            : "order-card"
                                    }
                                >


                                    {/* =================================
                                        ORDER HEADER
                                    ================================= */}

                                    <div className="order-card-header">


                                        <div className="order-number">

                                            <span>
                                                ORDER
                                            </span>


                                            <strong>
                                                #
                                                {
                                                    String(
                                                        order.id
                                                    )
                                                        .padStart(
                                                            4,
                                                            "0"
                                                        )
                                                }
                                            </strong>

                                        </div>


                                        <div className="order-date">

                                            <span>
                                                NGÀY ĐẶT
                                            </span>


                                            <p>
                                                {
                                                    formatDate(
                                                        order.createdAt
                                                    )
                                                }
                                            </p>

                                        </div>


                                        <div className="order-badges">

                                            <span
                                                className={
                                                    `status-badge ${statusInfo.className}`
                                                }
                                            >
                                                {
                                                    statusInfo.label
                                                }
                                            </span>


                                            <span
                                                className={
                                                    `payment-badge ${paymentInfo.className}`
                                                }
                                            >
                                                {
                                                    paymentInfo.label
                                                }
                                            </span>

                                        </div>


                                    </div>


                                    {/* =================================
                                        BODY
                                    ================================= */}

                                    <div className="order-card-body">


                                        {/* CUSTOMER */}

                                        <div className="order-section">

                                            <p className="section-label">
                                                KHÁCH HÀNG
                                            </p>


                                            <strong>
                                                {
                                                    order.customerName ||
                                                    "Khách lẻ"
                                                }
                                            </strong>


                                            <span>
                                                {
                                                    order.customerEmail ||
                                                    "Không có email"
                                                }
                                            </span>


                                            <span>
                                                {
                                                    order.phoneNumber ||
                                                    "Không có số điện thoại"
                                                }
                                            </span>

                                        </div>


                                        {/* SHIPPING */}

                                        <div className="order-section">

                                            <p className="section-label">
                                                GIAO HÀNG
                                            </p>


                                            <strong>
                                                ĐỊA CHỈ
                                            </strong>


                                            <span>
                                                {
                                                    order.shippingAddress ||
                                                    "Không có địa chỉ giao hàng"
                                                }
                                            </span>

                                        </div>


                                        {/* PAYMENT */}

                                        <div className="order-section">

                                            <p className="section-label">
                                                THANH TOÁN
                                            </p>


                                            <strong>
                                                {
                                                    formatPaymentMethod(
                                                        order.paymentMethod
                                                    )
                                                }
                                            </strong>


                                            <span>
                                                {
                                                    paymentInfo.label
                                                }
                                            </span>

                                        </div>


                                        {/* TOTAL */}

                                        <div className="order-total">

                                            <p>
                                                TỔNG TIỀN
                                            </p>


                                            <strong>
                                                {
                                                    formatMoney(
                                                        order.totalAmount
                                                    )
                                                }
                                            </strong>


                                            <span>
                                                VNĐ
                                            </span>

                                        </div>


                                    </div>


                                    {/* =================================
                                        CONTROLS
                                    ================================= */}

                                    <div className="order-controls">


                                        <div className="control-group">

                                            <label>
                                                TRẠNG THÁI ĐƠN
                                            </label>


                                            <select
                                                value={
                                                    order.status ||
                                                    "pending"
                                                }
                                                disabled={
                                                    updating
                                                }
                                                onChange={
                                                    (event) =>
                                                        handleStatusChange(
                                                            order.id,
                                                            event.target.value
                                                        )
                                                }
                                            >

                                                <option value="pending">
                                                    Chờ xử lý
                                                </option>

                                                <option value="confirmed">
                                                    Đã xác nhận
                                                </option>

                                                <option value="shipping">
                                                    Đang giao hàng
                                                </option>

                                                <option value="completed">
                                                    Hoàn thành
                                                </option>

                                                <option value="cancelled">
                                                    Hủy đơn
                                                </option>

                                            </select>

                                        </div>


                                        <div className="control-group">

                                            <label>
                                                THANH TOÁN
                                            </label>


                                            <select
                                                value={
                                                    order.paymentStatus ||
                                                    "pending"
                                                }
                                                disabled={
                                                    updating
                                                }
                                                onChange={
                                                    (event) =>
                                                        handlePaymentChange(
                                                            order.id,
                                                            event.target.value
                                                        )
                                                }
                                            >

                                                <option value="pending">
                                                    Chưa thanh toán
                                                </option>

                                                <option value="paid">
                                                    Đã thanh toán
                                                </option>

                                                <option value="failed">
                                                    Thanh toán thất bại
                                                </option>

                                                <option value="cancelled">
                                                    Hủy thanh toán
                                                </option>

                                            </select>

                                        </div>


                                        <button
                                            type="button"
                                            className="order-detail-button"
                                            onClick={() =>
                                                toggleRowExpansion(
                                                    order.id
                                                )
                                            }
                                        >

                                            <span>

                                                {isExpanded
                                                    ? "ẨN CHI TIẾT"
                                                    : `XEM SẢN PHẨM (${order.items?.length || 0})`}

                                            </span>


                                            <span>
                                                {isExpanded
                                                    ? "↑"
                                                    : "↓"}
                                            </span>

                                        </button>


                                    </div>


                                    {/* =================================
                                        ITEMS
                                    ================================= */}

                                    {isExpanded && (

                                        <div className="order-items">


                                            <div className="order-items-title">

                                                <div>

                                                    <p>
                                                        ORDER ITEMS
                                                    </p>


                                                    <h3>
                                                        SẢN PHẨM TRONG ĐƠN
                                                    </h3>

                                                </div>


                                                <span>
                                                    {
                                                        order.items
                                                            ?.length ||
                                                        0
                                                    }{" "}
                                                    SẢN PHẨM
                                                </span>

                                            </div>


                                            {order.items &&
                                            order.items.length >
                                                0 ? (

                                                <div className="items-table-wrapper">

                                                    <table className="items-table">

                                                        <thead>

                                                            <tr>

                                                                <th>
                                                                    SẢN PHẨM
                                                                </th>

                                                                <th>
                                                                    PHÂN LOẠI
                                                                </th>

                                                                <th>
                                                                    SL
                                                                </th>

                                                                <th>
                                                                    ĐƠN GIÁ
                                                                </th>

                                                                <th>
                                                                    THÀNH TIỀN
                                                                </th>

                                                            </tr>

                                                        </thead>


                                                        <tbody>

                                                            {
                                                                order.items.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (

                                                                        <tr
                                                                            key={
                                                                                `${order.id}-${index}`
                                                                            }
                                                                        >

                                                                            <td>

                                                                                <strong>
                                                                                    {
                                                                                        item.productName ||
                                                                                        "Sản phẩm"
                                                                                    }
                                                                                </strong>

                                                                            </td>


                                                                            <td>

                                                                                <span>
                                                                                    {
                                                                                        item.size ||
                                                                                        "Freesize"
                                                                                    }
                                                                                    {" / "}
                                                                                    {
                                                                                        item.color ||
                                                                                        "Mặc định"
                                                                                    }
                                                                                </span>

                                                                            </td>


                                                                            <td>
                                                                                {
                                                                                    item.quantity
                                                                                }
                                                                            </td>


                                                                            <td>
                                                                                {
                                                                                    formatMoney(
                                                                                        item.unitPrice
                                                                                    )
                                                                                }{" "}
                                                                                VNĐ
                                                                            </td>


                                                                            <td className="item-total">
                                                                                {
                                                                                    formatMoney(
                                                                                        Number(
                                                                                            item.unitPrice ||
                                                                                            0
                                                                                        ) *
                                                                                            Number(
                                                                                                item.quantity ||
                                                                                                0
                                                                                            )
                                                                                    )
                                                                                }{" "}
                                                                                VNĐ
                                                                            </td>

                                                                        </tr>

                                                                    )
                                                                )
                                                            }

                                                        </tbody>

                                                    </table>

                                                </div>

                                            ) : (

                                                <div className="items-empty">
                                                    Không có dữ liệu sản phẩm.
                                                </div>

                                            )}


                                        </div>

                                    )}


                                </article>

                            );
                        }
                    )}


                </section>

            )}


            <style>
                {styles}
            </style>


        </div>
    );
};


// ============================================================
// STYLES
// ============================================================

const styles = `

    .admin-orders-page {
        width: 100%;

        max-width: 1450px;

        margin: 0 auto;

        color: #111;
    }


    /* ========================================================
       TOP
    ======================================================== */

    .orders-top {
        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 30px;

        margin-bottom: 35px;
    }


    .orders-eyebrow {
        margin:
            0 0 12px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .orders-top h1 {
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


    .orders-description {
        margin:
            14px 0 0;

        color: #888;

        font-size: 11px;

        line-height: 1.7;
    }


    .orders-refresh {
        min-width: 125px;
        height: 43px;

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
    }


    .orders-refresh:hover:not(:disabled) {
        background: #fff;

        color: #111;
    }


    .orders-refresh:disabled {
        opacity: .5;
    }


    .orders-refresh svg {
        width: 14px;
        height: 14px;

        stroke-linecap: round;
        stroke-linejoin: round;
    }


    /* ========================================================
       MESSAGE
    ======================================================== */

    .orders-message {
        margin-bottom: 25px;

        padding:
            15px 18px;

        display: flex;

        align-items: center;

        gap: 12px;

        border:
            1px solid #ddd;

        font-size: 10px;
    }


    .orders-message span {
        width: 26px;
        height: 26px;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        border:
            1px solid currentColor;

        border-radius: 50%;
    }


    .orders-message p {
        margin: 0;
    }


    .orders-message.success {
        border-color: #bdd6c2;

        background: #f5faf6;

        color: #24632f;
    }


    .orders-message.error {
        border-color: #e0c5c1;

        background: #fff7f6;

        color: #8b3025;
    }


    /* ========================================================
       SUMMARY
    ======================================================== */

    .orders-summary {
        display: grid;

        grid-template-columns:
            repeat(
                4,
                minmax(
                    0,
                    1fr
                )
            );

        border-top:
            1px solid #111;

        border-bottom:
            1px solid #ddd;
    }


    .summary-box {
        min-height: 130px;

        padding:
            20px;

        border-right:
            1px solid #ddd;
    }


    .summary-box:last-child {
        border-right: none;
    }


    .summary-box > span {
        color: #bbb;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .summary-box p {
        margin:
            15px 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .summary-box strong {
        font-size: 28px;

        font-weight: 300;
    }


    /* ========================================================
       TOOLBAR
    ======================================================== */

    .orders-toolbar {
        margin-top: 30px;

        display: grid;

        grid-template-columns:
            minmax(
                280px,
                1fr
            )
            190px
            190px;

        gap: 10px;
    }


    .orders-search {
        height: 45px;

        padding:
            0 15px;

        display: flex;

        align-items: center;

        gap: 10px;

        border:
            1px solid #ddd;

        background: #fff;
    }


    .orders-search svg {
        width: 17px;
        height: 17px;

        flex-shrink: 0;

        stroke-linecap: round;
        stroke-linejoin: round;
    }


    .orders-search input {
        width: 100%;

        border: none;

        outline: none;

        background: transparent;

        font-size: 10px;

        letter-spacing: .5px;
    }


    .orders-toolbar select {
        height: 45px;

        padding:
            0 12px;

        border:
            1px solid #ddd;

        outline: none;

        background: #fff;

        color: #111;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1px;
    }


    /* ========================================================
       RESULT COUNT
    ======================================================== */

    .orders-result-count {
        margin:
            18px 0;

        display: flex;

        align-items: center;

        gap: 6px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .orders-result-count strong {
        color: #111;

        font-size: 10px;

        font-weight: 500;
    }


    /* ========================================================
       ORDER LIST
    ======================================================== */

    .orders-list {
        display: flex;

        flex-direction: column;

        gap: 12px;
    }


    .order-card {
        border:
            1px solid #ddd;

        background: #fff;

        transition:
            border-color .2s ease;
    }


    .order-card:hover,
    .order-card.expanded {
        border-color: #111;
    }


    /* ========================================================
       ORDER HEADER
    ======================================================== */

    .order-card-header {
        min-height: 78px;

        padding:
            0 22px;

        display: grid;

        grid-template-columns:
            170px
            1fr
            auto;

        align-items: center;

        gap: 20px;

        border-bottom:
            1px solid #eee;
    }


    .order-number span,
    .order-date span {
        display: block;

        margin-bottom: 6px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .order-number strong {
        font-size: 15px;

        font-weight: 500;

        letter-spacing: 1px;
    }


    .order-date p {
        margin: 0;

        color: #777;

        font-size: 9px;
    }


    .order-badges {
        display: flex;

        align-items: center;

        justify-content: flex-end;

        gap: 7px;

        flex-wrap: wrap;
    }


    .status-badge,
    .payment-badge {
        padding:
            7px 9px;

        border:
            1px solid #ddd;

        font-size: 6px;

        letter-spacing: 1px;
    }


    .status-badge.pending,
    .payment-badge.pending {
        background: #fff9e8;

        border-color: #eadca9;

        color: #82661d;
    }


    .status-badge.confirmed,
    .status-badge.shipping {
        background: #f3f7fa;

        border-color: #cfdde6;

        color: #345d73;
    }


    .status-badge.completed,
    .payment-badge.paid {
        background: #f4faf5;

        border-color: #c7ddca;

        color: #286332;
    }


    .status-badge.cancelled,
    .payment-badge.failed {
        background: #fff7f6;

        border-color: #e2c5c1;

        color: #8b3025;
    }


    .payment-badge.cancelled,
    .status-badge.unknown,
    .payment-badge.unknown {
        background: #f5f5f5;

        color: #777;
    }


    /* ========================================================
       BODY
    ======================================================== */

    .order-card-body {
        padding:
            25px 22px;

        display: grid;

        grid-template-columns:
            1fr
            1.3fr
            1fr
            minmax(
                150px,
                .7fr
            );

        gap: 30px;
    }


    .order-section {
        min-width: 0;
    }


    .section-label,
    .order-total p {
        margin:
            0 0 12px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .order-section strong {
        display: block;

        margin-bottom: 7px;

        font-size: 10px;

        font-weight: 500;
    }


    .order-section span {
        display: block;

        margin-top: 5px;

        overflow-wrap: anywhere;

        color: #888;

        font-size: 9px;

        line-height: 1.5;
    }


    .order-total {
        text-align: right;
    }


    .order-total strong {
        display: block;

        font-size:
            clamp(
                22px,
                2.5vw,
                34px
            );

        font-weight: 300;

        line-height: 1;
    }


    .order-total span {
        display: block;

        margin-top: 7px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    /* ========================================================
       CONTROLS
    ======================================================== */

    .order-controls {
        min-height: 70px;

        padding:
            12px 22px;

        display: grid;

        grid-template-columns:
            220px
            220px
            minmax(
                180px,
                1fr
            );

        align-items: end;

        gap: 12px;

        border-top:
            1px solid #eee;

        background: #fafafa;
    }


    .control-group label {
        display: block;

        margin-bottom: 6px;

        color: #999;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .control-group select {
        width: 100%;
        height: 39px;

        padding:
            0 10px;

        border:
            1px solid #ddd;

        outline: none;

        background: #fff;

        color: #111;

        cursor: pointer;

        font-size: 9px;
    }


    .control-group select:disabled {
        opacity: .5;

        cursor: not-allowed;
    }


    .order-detail-button {
        height: 39px;

        padding:
            0 14px;

        display: flex;

        align-items: center;

        justify-content: space-between;

        border:
            1px solid #111;

        background: #111;

        color: #fff;

        cursor: pointer;

        font-size: 7px;

        letter-spacing: 1.5px;
    }


    .order-detail-button:hover {
        background: #fff;

        color: #111;
    }


    /* ========================================================
       ITEMS
    ======================================================== */

    .order-items {
        padding:
            30px 22px;

        border-top:
            1px solid #111;

        background: #f7f7f5;
    }


    .order-items-title {
        margin-bottom: 20px;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 20px;
    }


    .order-items-title p {
        margin:
            0 0 8px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 3px;
    }


    .order-items-title h3 {
        margin: 0;

        font-size: 17px;

        font-weight: 400;

        letter-spacing: 1px;
    }


    .order-items-title > span {
        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .items-table-wrapper {
        overflow-x: auto;

        background: #fff;
    }


    .items-table {
        width: 100%;

        min-width: 700px;

        border-collapse: collapse;
    }


    .items-table th {
        padding:
            13px 15px;

        border-bottom:
            1px solid #ddd;

        color: #999;

        text-align: left;

        font-size: 7px;

        font-weight: 500;

        letter-spacing: 1.5px;
    }


    .items-table th:nth-child(
        n + 3
    ),
    .items-table td:nth-child(
        n + 3
    ) {
        text-align: right;
    }


    .items-table td {
        padding:
            15px;

        border-bottom:
            1px solid #eee;

        color: #555;

        font-size: 9px;
    }


    .items-table td strong {
        color: #111;

        font-weight: 500;
    }


    .items-table td span {
        color: #888;
    }


    .item-total {
        color: #111 !important;

        font-weight: 600;
    }


    .items-empty {
        padding: 30px;

        background: #fff;

        color: #999;

        text-align: center;

        font-size: 9px;
    }


    /* ========================================================
       EMPTY
    ======================================================== */

    .orders-empty {
        min-height: 360px;

        padding: 50px;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        border:
            1px solid #ddd;

        background: #fff;

        text-align: center;
    }


    .orders-empty > span {
        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .orders-empty h2 {
        margin:
            20px 0 15px;

        font-size: 38px;

        font-weight: 300;

        line-height: .95;
    }


    .orders-empty p {
        margin: 0;

        color: #999;

        font-size: 10px;
    }


    /* ========================================================
       LOADING
    ======================================================== */

    .admin-orders-loading {
        min-height: 55vh;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;
    }


    .admin-orders-loading p {
        color: #999;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .orders-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            ordersLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes ordersLoading {

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
       RESPONSIVE
    ======================================================== */

    @media (
        max-width: 1150px
    ) {

        .order-card-body {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .order-total {
            text-align: left;
        }


        .order-controls {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .order-detail-button {
            grid-column:
                1 / -1;
        }

    }


    @media (
        max-width: 850px
    ) {

        .orders-summary {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .summary-box:nth-child(
            2
        ) {
            border-right: none;
        }


        .summary-box:nth-child(
            -n + 2
        ) {
            border-bottom:
                1px solid #ddd;
        }


        .orders-toolbar {
            grid-template-columns:
                1fr;
        }


        .order-card-header {
            grid-template-columns:
                1fr 1fr;
        }


        .order-badges {
            grid-column:
                1 / -1;

            justify-content:
                flex-start;

            padding-bottom:
                15px;
        }

    }


    @media (
        max-width: 600px
    ) {

        .orders-top {
            align-items:
                flex-start;

            flex-direction:
                column;
        }


        .orders-refresh {
            width: 100%;
        }


        .order-card-body {
            grid-template-columns:
                1fr;
        }


        .order-controls {
            grid-template-columns:
                1fr;
        }


        .order-detail-button {
            grid-column: auto;
        }


        .order-card-header {
            grid-template-columns:
                1fr;
        }


        .order-badges {
            grid-column: auto;
        }


        .orders-summary {
            grid-template-columns:
                1fr 1fr;
        }

    }

`;


export default AdminOrderManagement;