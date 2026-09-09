import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import API from "../services/api";


const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80";


const Checkout = ({
    updateCartCount,
}) => {

    const navigate = useNavigate();


    const [
        cartItems,
        setCartItems
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        formData,
        setFormData
    ] = useState({

        fullName: "",
        phone: "",
        address: "",
        note: "",

        paymentMethod:
            "COD",
    });


    // ========================================================
    // LOAD USER + CART
    // ========================================================

    useEffect(() => {

        let user = null;
        let cart = [];


        try {

            user =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) ||
                    "null"
                );


            cart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    ) ||
                    "[]"
                );

        } catch (error) {

            console.error(
                "Lỗi đọc dữ liệu:",
                error
            );
        }


        const token =
            localStorage.getItem(
                "token"
            );


        if (
            !token ||
            !user
        ) {

            alert(
                "Vui lòng đăng nhập để thanh toán."
            );

            navigate(
                "/login"
            );

            return;
        }


        setFormData(
            (prev) => ({

                ...prev,

                fullName:
                    user.full_name ||
                    user.fullName ||
                    "",

                phone:
                    user.phone ||
                    "",

                address:
                    user.address ||
                    "",
            })
        );


        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            alert(
                "Giỏ hàng của bạn đang trống."
            );

            navigate(
                "/cart"
            );

            return;
        }


        setCartItems(
            cart
        );

    }, [navigate]);


    // ========================================================
    // TOTAL
    // ========================================================

    const totalQuantity =
        useMemo(() => {

            return cartItems.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        Number(
                            item.quantity ||
                            0
                        )
                    );
                },
                0
            );

        }, [cartItems]);


    const totalPrice =
        useMemo(() => {

            return cartItems.reduce(
                (
                    total,
                    item
                ) => {

                    const price =
                        Number(
                            item.price
                        ) || 0;


                    const quantity =
                        Number(
                            item.quantity
                        ) || 0;


                    return (
                        total +
                        price *
                        quantity
                    );
                },
                0
            );

        }, [cartItems]);


    // ========================================================
    // FORMAT PRICE
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
    // INPUT
    // ========================================================

    const handleChange =
        (event) => {

            const {
                name,
                value,
            } =
                event.target;


            setFormData(
                (prev) => ({

                    ...prev,

                    [name]:
                        value,
                })
            );


            setMessage("");
        };


    // ========================================================
    // VALIDATE
    // ========================================================

    const validateForm =
        () => {

            if (
                !formData.fullName.trim()
            ) {

                return "Vui lòng nhập họ và tên.";
            }


            const phone =
                formData.phone
                    .replace(
                        /\s+/g,
                        ""
                    );


            if (
                !/^0\d{9}$/.test(
                    phone
                )
            ) {

                return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
            }


            if (
                !formData.address.trim()
            ) {

                return "Vui lòng nhập địa chỉ giao hàng.";
            }


            if (
                cartItems.length === 0
            ) {

                return "Giỏ hàng hiện đang trống.";
            }


            return "";
        };


    // ========================================================
    // SUBMIT ORDER
    // ========================================================

    const handleSubmitOrder =
        async (event) => {

            event.preventDefault();


            if (loading) {
                return;
            }


            const validationMessage =
                validateForm();


            if (
                validationMessage
            ) {

                setMessage(
                    validationMessage
                );

                return;
            }


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                alert(
                    "Phiên đăng nhập đã hết hạn."
                );

                navigate(
                    "/login"
                );

                return;
            }


            setLoading(true);
            setMessage("");


            try {

                const orderPayload = {

                    items:
                        cartItems,

                    totalAmount:
                        totalPrice,

                    shippingAddress: {

                        fullName:
                            formData
                                .fullName
                                .trim(),

                        phone:
                            formData
                                .phone
                                .trim(),

                        address:
                            formData
                                .address
                                .trim(),

                        note:
                            formData
                                .note
                                .trim(),
                    },

                    paymentMethod:
                        formData
                            .paymentMethod,
                };


                const response =
                    await API.post(
                        "/orders",
                        orderPayload,
                        {
                            headers: {

                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                if (
                    response.status ===
                        200 ||
                    response.status ===
                        201
                ) {

                    localStorage.removeItem(
                        "cart"
                    );


                    if (
                        typeof updateCartCount ===
                        "function"
                    ) {

                        updateCartCount();
                    }


                    alert(
                        "Đặt hàng thành công!"
                    );


                    navigate(
                        "/my-orders"
                    );
                }


            } catch (error) {

                console.error(
                    "Lỗi đặt hàng:",
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

                    return;
                }


                setMessage(
                    error.response?.data
                        ?.message ||
                    "Không thể tạo đơn hàng. Vui lòng thử lại."
                );


            } finally {

                setLoading(false);
            }
        };


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="checkout-page">


            {/* ===============================================
                HEADER
            =============================================== */}

            <section className="checkout-header">

                <div>

                    <p>
                        BOUTIQUE · CHECKOUT
                    </p>

                    <h1>
                        THANH TOÁN
                    </h1>

                </div>


                <div className="checkout-step">

                    <span>
                        02
                    </span>

                    <p>
                        CHECKOUT
                    </p>

                </div>

            </section>


            {/* ===============================================
                MAIN
            =============================================== */}

            <form
                onSubmit={
                    handleSubmitOrder
                }
                className="checkout-layout"
            >


                {/* ===========================================
                    FORM
                =========================================== */}

                <div className="checkout-form">


                    <div className="section-heading">

                        <span>
                            01
                        </span>

                        <div>

                            <p>
                                SHIPPING
                            </p>

                            <h2>
                                THÔNG TIN NHẬN HÀNG
                            </h2>

                        </div>

                    </div>


                    <div className="form-grid">


                        <div className="field field-full">

                            <label>
                                HỌ VÀ TÊN *
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={
                                    formData.fullName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Nguyễn Văn A"
                                autoComplete="name"
                            />

                        </div>


                        <div className="field field-full">

                            <label>
                                SỐ ĐIỆN THOẠI *
                            </label>

                            <input
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


                        <div className="field field-full">

                            <label>
                                ĐỊA CHỈ GIAO HÀNG *
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                                autoComplete="street-address"
                            />

                        </div>


                        <div className="field field-full">

                            <label>
                                GHI CHÚ
                            </label>

                            <textarea
                                name="note"
                                rows="4"
                                value={
                                    formData.note
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Ghi chú thêm cho đơn hàng..."
                            />

                        </div>

                    </div>


                    {/* =======================================
                        PAYMENT
                    ======================================= */}

                    <div className="payment-section">


                        <div className="section-heading">

                            <span>
                                02
                            </span>

                            <div>

                                <p>
                                    PAYMENT
                                </p>

                                <h2>
                                    PHƯƠNG THỨC THANH TOÁN
                                </h2>

                            </div>

                        </div>


                        <label
                            className={
                                formData.paymentMethod ===
                                    "COD"
                                    ? "payment-option selected"
                                    : "payment-option"
                            }
                        >

                            <input
                                type="radio"
                                name="paymentMethod"
                                value="COD"
                                checked={
                                    formData.paymentMethod ===
                                    "COD"
                                }
                                onChange={
                                    handleChange
                                }
                            />


                            <div>

                                <strong>
                                    THANH TOÁN KHI NHẬN HÀNG
                                </strong>

                                <span>
                                    COD
                                </span>

                                <p>
                                    Thanh toán trực tiếp khi nhận sản phẩm.
                                </p>

                            </div>


                            <span className="payment-check">
                                ●
                            </span>

                        </label>


                        <label
                            className={
                                formData.paymentMethod ===
                                    "BANK_TRANSFER"
                                    ? "payment-option selected"
                                    : "payment-option"
                            }
                        >

                            <input
                                type="radio"
                                name="paymentMethod"
                                value="BANK_TRANSFER"
                                checked={
                                    formData.paymentMethod ===
                                    "BANK_TRANSFER"
                                }
                                onChange={
                                    handleChange
                                }
                            />


                            <div>

                                <strong>
                                    CHUYỂN KHOẢN NGÂN HÀNG
                                </strong>

                                <span>
                                    BANK TRANSFER
                                </span>

                                <p>
                                    Đơn hàng sẽ chờ xác nhận thanh toán.
                                </p>

                            </div>


                            <span className="payment-check">
                                ●
                            </span>

                        </label>

                    </div>


                    {message && (

                        <div className="checkout-message">

                            {message}

                        </div>

                    )}


                    <div className="checkout-navigation">

                        <Link to="/cart">
                            ← QUAY LẠI GIỎ HÀNG
                        </Link>

                    </div>


                </div>


                {/* ===========================================
                    ORDER SUMMARY
                =========================================== */}

                <aside className="order-summary">


                    <div className="summary-inner">


                        <p className="summary-number">
                            03
                        </p>


                        <h2>
                            ĐƠN HÀNG CỦA BẠN
                        </h2>


                        <p className="summary-count">

                            {totalQuantity}
                            {" "}
                            SẢN PHẨM

                        </p>


                        <div className="summary-divider">
                        </div>


                        <div className="checkout-items">

                            {cartItems.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const price =
                                        Number(
                                            item.price
                                        ) || 0;


                                    const quantity =
                                        Number(
                                            item.quantity
                                        ) || 0;


                                    return (

                                        <div
                                            className="checkout-item"
                                            key={
                                                `${item.product_id}-${item.variant_id}-${index}`
                                            }
                                        >

                                            <div className="checkout-item-image">

                                                <img
                                                    src={
                                                        item.image_url ||
                                                        FALLBACK_IMAGE
                                                    }
                                                    alt={
                                                        item.name
                                                    }
                                                />

                                                <span>
                                                    {
                                                        quantity
                                                    }
                                                </span>

                                            </div>


                                            <div className="checkout-item-info">

                                                <strong>
                                                    {
                                                        item.name
                                                    }
                                                </strong>


                                                <p>

                                                    SIZE{" "}
                                                    {
                                                        item.size ||
                                                        "Standard"
                                                    }

                                                    {" · "}

                                                    {
                                                        item.color ||
                                                        "Mặc định"
                                                    }

                                                </p>

                                            </div>


                                            <div className="checkout-item-price">

                                                {formatCurrency(
                                                    price *
                                                    quantity
                                                )}

                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>


                        <div className="summary-divider">
                        </div>


                        <div className="summary-row">

                            <span>
                                Tạm tính
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalPrice
                                )}
                            </strong>

                        </div>


                        <div className="summary-row">

                            <span>
                                Vận chuyển
                            </span>

                            <strong>
                                MIỄN PHÍ
                            </strong>

                        </div>


                        <div className="summary-divider">
                        </div>


                        <div className="grand-total">

                            <span>
                                TỔNG CỘNG
                            </span>

                            <strong>
                                {formatCurrency(
                                    totalPrice
                                )}
                            </strong>

                        </div>


                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="place-order-button"
                        >

                            <span>

                                {loading
                                    ? "ĐANG XỬ LÝ..."
                                    : "XÁC NHẬN ĐẶT HÀNG"}

                            </span>


                            {!loading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>


                        <p className="security-note">

                            Bằng việc xác nhận đặt hàng,
                            bạn đồng ý với các thông tin
                            giao hàng đã cung cấp.

                        </p>


                        <div className="checkout-benefits">

                            <div>
                                <span>
                                    01
                                </span>

                                <p>
                                    GIAO HÀNG TOÀN QUỐC
                                </p>
                            </div>


                            <div>
                                <span>
                                    02
                                </span>

                                <p>
                                    THANH TOÁN AN TOÀN
                                </p>
                            </div>


                            <div>
                                <span>
                                    03
                                </span>

                                <p>
                                    HỖ TRỢ ĐƠN HÀNG
                                </p>
                            </div>

                        </div>


                    </div>

                </aside>


            </form>


            <style>{`

                * {
                    box-sizing: border-box;
                }


                .checkout-page {
                    width: 100%;

                    background: #fff;

                    color: #111;

                    font-family:
                        "Helvetica Neue",
                        Arial,
                        sans-serif;
                }


                /* =========================================
                   HEADER
                ========================================= */

                .checkout-header {
                    min-height: 230px;

                    padding:
                        70px 5%
                        45px;

                    display: flex;

                    justify-content:
                        space-between;

                    align-items:
                        flex-end;

                    border-bottom:
                        1px solid #ddd;
                }


                .checkout-header > div > p {
                    margin:
                        0 0 15px;

                    color: #999;

                    font-size: 9px;

                    letter-spacing: 4px;
                }


                .checkout-header h1 {
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


                .checkout-step {
                    text-align: right;
                }


                .checkout-step span {
                    font-size: 28px;

                    font-weight: 300;
                }


                .checkout-step p {
                    margin:
                        5px 0 0 !important;

                    font-size:
                        8px !important;

                    letter-spacing:
                        2px !important;
                }


                /* =========================================
                   LAYOUT
                ========================================= */

                .checkout-layout {
                    display: grid;

                    grid-template-columns:
                        minmax(0, 1.45fr)
                        minmax(390px, .75fr);

                    align-items: start;
                }


                .checkout-form {
                    padding:
                        60px 7%;
                }


                /* =========================================
                   SECTION
                ========================================= */

                .section-heading {
                    display: flex;

                    gap: 20px;

                    align-items: flex-start;

                    margin-bottom: 30px;
                }


                .section-heading > span {
                    color: #bbb;

                    font-size: 35px;

                    font-weight: 200;
                }


                .section-heading p {
                    margin:
                        4px 0 7px;

                    color: #999;

                    font-size: 8px;

                    letter-spacing: 3px;
                }


                .section-heading h2 {
                    margin: 0;

                    font-size: 17px;

                    font-weight: 500;

                    letter-spacing: 1.5px;
                }


                /* =========================================
                   FORM
                ========================================= */

                .form-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            1fr
                        );

                    gap:
                        23px 18px;
                }


                .field-full {
                    grid-column:
                        1 / -1;
                }


                .field label {
                    display: block;

                    margin-bottom: 8px;

                    color: #777;

                    font-size: 8px;

                    letter-spacing: 1.5px;
                }


                .field input,
                .field textarea {
                    width: 100%;

                    padding:
                        14px 0;

                    border: none;

                    border-bottom:
                        1px solid #ccc;

                    outline: none;

                    resize: vertical;

                    background: transparent;

                    color: #111;

                    font-family: inherit;

                    font-size: 12px;

                    transition:
                        border-color .2s ease;
                }


                .field input:focus,
                .field textarea:focus {
                    border-color: #111;
                }


                .field input::placeholder,
                .field textarea::placeholder {
                    color: #aaa;
                }


                /* =========================================
                   PAYMENT
                ========================================= */

                .payment-section {
                    margin-top: 70px;
                }


                .payment-option {
                    position: relative;

                    min-height: 100px;

                    padding:
                        22px 50px
                        22px 22px;

                    display: block;

                    margin-bottom: 10px;

                    border:
                        1px solid #ddd;

                    cursor: pointer;

                    transition:
                        all .2s ease;
                }


                .payment-option input {
                    display: none;
                }


                .payment-option.selected {
                    border-color: #111;

                    background: #111;

                    color: #fff;
                }


                .payment-option strong {
                    display: block;

                    font-size: 10px;

                    letter-spacing: 1.5px;
                }


                .payment-option > div > span {
                    display: block;

                    margin-top: 5px;

                    color: #999;

                    font-size: 7px;

                    letter-spacing: 2px;
                }


                .payment-option p {
                    margin:
                        13px 0 0;

                    color: #888;

                    font-size: 10px;
                }


                .payment-option.selected p {
                    color: #aaa;
                }


                .payment-check {
                    position: absolute;

                    right: 20px;
                    top: 50%;

                    transform:
                        translateY(-50%);

                    color: #ddd;
                }


                .payment-option.selected
                .payment-check {
                    color: #fff;
                }


                /* =========================================
                   MESSAGE
                ========================================= */

                .checkout-message {
                    margin-top: 25px;

                    padding:
                        14px 16px;

                    background: #fff4e5;

                    color: #8a5910;

                    font-size: 10px;

                    line-height: 1.6;
                }


                .checkout-navigation {
                    margin-top: 35px;
                }


                .checkout-navigation a {
                    color: #111;

                    text-decoration: none;

                    font-size: 8px;

                    letter-spacing: 2px;

                    padding-bottom: 5px;

                    border-bottom:
                        1px solid #111;
                }


                /* =========================================
                   SUMMARY
                ========================================= */

                .order-summary {
                    min-height: 100%;

                    background: #f3f3f0;

                    border-left:
                        1px solid #ddd;
                }


                .summary-inner {
                    position: sticky;

                    top: 95px;

                    padding:
                        55px 40px;
                }


                .summary-number {
                    margin:
                        0 0 25px;

                    color: #bbb;

                    font-size: 45px;

                    font-weight: 200;
                }


                .summary-inner > h2 {
                    margin: 0;

                    font-size: 17px;

                    font-weight: 500;

                    letter-spacing: 1.5px;
                }


                .summary-count {
                    margin:
                        8px 0 0;

                    color: #999;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                .summary-divider {
                    width: 100%;
                    height: 1px;

                    margin:
                        28px 0;

                    background: #d7d7d4;
                }


                /* =========================================
                   ITEMS
                ========================================= */

                .checkout-items {
                    display: grid;

                    gap: 18px;
                }


                .checkout-item {
                    display: grid;

                    grid-template-columns:
                        65px
                        minmax(0, 1fr)
                        auto;

                    gap: 13px;

                    align-items: center;
                }


                .checkout-item-image {
                    position: relative;

                    width: 65px;

                    aspect-ratio:
                        3 / 4;

                    background: #ddd;

                    overflow: hidden;
                }


                .checkout-item-image img {
                    width: 100%;
                    height: 100%;

                    object-fit: cover;

                    display: block;
                }


                .checkout-item-image span {
                    position: absolute;

                    top: 4px;
                    right: 4px;

                    min-width: 18px;
                    height: 18px;

                    padding:
                        0 4px;

                    display: flex;

                    justify-content: center;

                    align-items: center;

                    background: #111;

                    color: #fff;

                    font-size: 7px;
                }


                .checkout-item-info strong {
                    display: block;

                    font-size: 10px;

                    font-weight: 500;
                }


                .checkout-item-info p {
                    margin:
                        7px 0 0;

                    color: #999;

                    font-size: 7px;

                    letter-spacing: 1px;
                }


                .checkout-item-price {
                    font-size: 10px;

                    white-space: nowrap;
                }


                /* =========================================
                   TOTAL
                ========================================= */

                .summary-row {
                    display: flex;

                    justify-content:
                        space-between;

                    margin-bottom: 16px;

                    font-size: 10px;
                }


                .summary-row span {
                    color: #777;
                }


                .summary-row strong {
                    font-weight: 500;
                }


                .grand-total {
                    display: flex;

                    justify-content:
                        space-between;

                    align-items: flex-end;
                }


                .grand-total span {
                    font-size: 9px;

                    letter-spacing: 2px;
                }


                .grand-total strong {
                    font-size: 20px;

                    font-weight: 400;
                }


                /* =========================================
                   BUTTON
                ========================================= */

                .place-order-button {
                    width: 100%;

                    margin-top: 35px;

                    padding:
                        18px 20px;

                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;

                    border:
                        1px solid #111;

                    background: #111;

                    color: #fff;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 2px;

                    transition:
                        all .2s ease;
                }


                .place-order-button:hover:not(:disabled) {
                    background: transparent;

                    color: #111;
                }


                .place-order-button:disabled {
                    cursor: not-allowed;

                    opacity: .5;
                }


                .security-note {
                    margin:
                        14px 0 0;

                    color: #999;

                    font-size: 8px;

                    line-height: 1.6;
                }


                .checkout-benefits {
                    margin-top: 35px;

                    padding-top: 22px;

                    border-top:
                        1px solid #ddd;

                    display: grid;

                    gap: 13px;
                }


                .checkout-benefits > div {
                    display: flex;

                    gap: 12px;

                    align-items: center;
                }


                .checkout-benefits span {
                    color: #aaa;

                    font-size: 7px;
                }


                .checkout-benefits p {
                    margin: 0;

                    font-size: 7px;

                    letter-spacing: 1px;
                }


                /* =========================================
                   TABLET
                ========================================= */

                @media (
                    max-width: 1000px
                ) {

                    .checkout-layout {
                        grid-template-columns:
                            1fr;
                    }


                    .order-summary {
                        border-left: none;

                        border-top:
                            1px solid #ddd;
                    }


                    .summary-inner {
                        position: static;
                    }

                }


                /* =========================================
                   MOBILE
                ========================================= */

                @media (
                    max-width: 650px
                ) {

                    .checkout-header {
                        min-height: 190px;

                        padding:
                            55px 20px
                            30px;
                    }


                    .checkout-header h1 {
                        font-size: 38px;
                    }


                    .checkout-form {
                        padding:
                            45px 20px;
                    }


                    .form-grid {
                        grid-template-columns:
                            1fr;
                    }


                    .field-full {
                        grid-column:
                            auto;
                    }


                    .payment-section {
                        margin-top:
                            55px;
                    }


                    .summary-inner {
                        padding:
                            45px 20px;
                    }


                    .checkout-item {
                        grid-template-columns:
                            60px
                            minmax(0, 1fr);
                    }


                    .checkout-item-price {
                        grid-column: 2;
                    }

                }

            `}</style>

        </div>
    );
};


export default Checkout;