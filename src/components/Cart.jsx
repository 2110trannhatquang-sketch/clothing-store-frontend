import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";


const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80";


// ============================================================
// CART
// ============================================================

const Cart = ({
    updateCartCount,
}) => {

    const navigate =
        useNavigate();


    const [
        cartItems,
        setCartItems
    ] = useState([]);


    const [
        message,
        setMessage
    ] = useState("");


    // ========================================================
    // LOAD CART
    // ========================================================

    const loadCart = () => {

        try {

            const savedCart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    ) ||
                    "[]"
                );


            if (
                Array.isArray(
                    savedCart
                )
            ) {

                setCartItems(
                    savedCart
                );

            } else {

                setCartItems([]);
            }

        } catch (error) {

            console.error(
                "Lỗi đọc giỏ hàng:",
                error
            );

            setCartItems([]);
        }
    };


    useEffect(() => {

        loadCart();

    }, []);


    // ========================================================
    // SAVE CART
    // ========================================================

    const saveCart =
        (newCart) => {

            setCartItems(
                newCart
            );


            localStorage.setItem(
                "cart",
                JSON.stringify(
                    newCart
                )
            );


            if (
                typeof updateCartCount ===
                "function"
            ) {

                updateCartCount();
            }
        };


    // ========================================================
    // QUANTITY
    // ========================================================

    const handleQuantityChange =
        (
            index,
            delta
        ) => {

            const updatedCart =
                [...cartItems];


            const item =
                updatedCart[index];


            const currentQty =
                Number(
                    item.quantity
                ) || 1;


            const newQty =
                currentQty +
                delta;


            // Không giảm xuống dưới 1
            if (
                newQty < 1
            ) {

                return;
            }


            // ================================================
            // KIỂM TRA TỒN KHO
            // ================================================

            const stock =
                item.stock_quantity ===
                    null ||
                item.stock_quantity ===
                    undefined

                    ? null

                    : Number(
                        item.stock_quantity
                    );


            if (
                stock !== null &&
                newQty > stock
            ) {

                setMessage(
                    `Sản phẩm "${item.name}" chỉ còn ${stock} sản phẩm trong kho.`
                );


                setTimeout(
                    () =>
                        setMessage(""),
                    3000
                );


                return;
            }


            updatedCart[
                index
            ] = {
                ...item,
                quantity:
                    newQty,
            };


            saveCart(
                updatedCart
            );
        };


    // ========================================================
    // REMOVE ITEM
    // ========================================================

    const handleRemoveItem =
        (index) => {

            const updatedCart =
                cartItems.filter(
                    (_, i) =>
                        i !== index
                );


            saveCart(
                updatedCart
            );
        };


    // ========================================================
    // CLEAR CART
    // ========================================================

    const handleClearCart =
        () => {

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?"
                );


            if (!confirmed) {

                return;
            }


            saveCart([]);
        };


    // ========================================================
    // TOTAL QUANTITY
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


    // ========================================================
    // TOTAL PRICE
    // ========================================================

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
    // EMPTY CART
    // ========================================================

    if (
        cartItems.length ===
        0
    ) {

        return (

            <div className="cart-empty">

                <p className="cart-eyebrow">
                    BOUTIQUE.
                </p>


                <h1>
                    YOUR CART
                    <br />
                    IS EMPTY.
                </h1>


                <p className="cart-empty-text">
                    Giỏ hàng của bạn hiện chưa có sản phẩm.
                    Hãy khám phá bộ sưu tập mới của BOUTIQUE.
                </p>


                <Link
                    to="/"
                    className="continue-button"
                >
                    KHÁM PHÁ SẢN PHẨM
                    <span>→</span>
                </Link>


                <style>
                    {cartStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="cart-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="cart-header">

                <div>

                    <p className="cart-eyebrow">
                        BOUTIQUE.
                    </p>


                    <h1>
                        GIỎ HÀNG
                    </h1>

                </div>


                <div className="cart-header-meta">

                    <span>
                        {String(
                            totalQuantity
                        ).padStart(
                            2,
                            "0"
                        )}
                    </span>

                    <p>
                        SẢN PHẨM
                    </p>

                </div>

            </section>


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (

                <div className="cart-message">

                    {message}

                </div>

            )}


            {/* =================================================
                MAIN
            ================================================= */}

            <section className="cart-layout">


                {/* =================================================
                    ITEMS
                ================================================= */}

                <div className="cart-items">


                    <div className="cart-items-heading">

                        <span>
                            SẢN PHẨM
                        </span>

                        <button
                            type="button"
                            onClick={
                                handleClearCart
                            }
                        >
                            XÓA TẤT CẢ
                        </button>

                    </div>


                    {cartItems.map(
                        (
                            item,
                            index
                        ) => {

                            const itemPrice =
                                Number(
                                    item.price
                                ) || 0;


                            const itemQty =
                                Number(
                                    item.quantity
                                ) || 1;


                            const stock =
                                item.stock_quantity ===
                                    null ||
                                item.stock_quantity ===
                                    undefined

                                    ? null

                                    : Number(
                                        item.stock_quantity
                                    );


                            const maxReached =
                                stock !==
                                    null &&
                                itemQty >=
                                    stock;


                            return (

                                <article
                                    className="cart-item"
                                    key={
                                        `${item.product_id}-${item.variant_id}-${index}`
                                    }
                                >


                                    {/* IMAGE */}

                                    <Link
                                        to={
                                            `/products/${item.product_id}`
                                        }
                                        className="cart-image"
                                    >

                                        <img
                                            src={
                                                item.image_url ||
                                                FALLBACK_IMAGE
                                            }
                                            alt={
                                                item.name ||
                                                "Sản phẩm"
                                            }
                                        />

                                        <span>
                                            {String(
                                                index +
                                                1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                    </Link>


                                    {/* INFO */}

                                    <div className="cart-info">

                                        <p className="item-collection">
                                            BOUTIQUE COLLECTION
                                        </p>


                                        <Link
                                            to={
                                                `/products/${item.product_id}`
                                            }
                                            className="item-name"
                                        >
                                            {
                                                item.name ||
                                                "Sản phẩm"
                                            }
                                        </Link>


                                        <div className="item-variant">

                                            <span>
                                                SIZE
                                                <strong>
                                                    {
                                                        item.size ||
                                                        "Standard"
                                                    }
                                                </strong>
                                            </span>


                                            <span>
                                                MÀU
                                                <strong>
                                                    {
                                                        item.color ||
                                                        "Standard"
                                                    }
                                                </strong>
                                            </span>

                                        </div>


                                        {stock !==
                                            null && (

                                            <p className="stock-text">

                                                Còn{" "}
                                                <strong>
                                                    {stock}
                                                </strong>{" "}
                                                sản phẩm

                                            </p>

                                        )}


                                        <p className="unit-price">

                                            {formatCurrency(
                                                itemPrice
                                            )}

                                        </p>

                                    </div>


                                    {/* QUANTITY */}

                                    <div className="item-quantity">

                                        <p>
                                            SỐ LƯỢNG
                                        </p>


                                        <div className="quantity-control">

                                            <button
                                                type="button"
                                                disabled={
                                                    itemQty <=
                                                    1
                                                }
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        index,
                                                        -1
                                                    )
                                                }
                                            >
                                                −
                                            </button>


                                            <span>
                                                {itemQty}
                                            </span>


                                            <button
                                                type="button"
                                                disabled={
                                                    maxReached
                                                }
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        index,
                                                        1
                                                    )
                                                }
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>


                                    {/* TOTAL */}

                                    <div className="item-total">

                                        <p>
                                            THÀNH TIỀN
                                        </p>


                                        <strong>

                                            {formatCurrency(
                                                itemPrice *
                                                itemQty
                                            )}

                                        </strong>

                                    </div>


                                    {/* REMOVE */}

                                    <button
                                        type="button"
                                        className="remove-item"
                                        onClick={() =>
                                            handleRemoveItem(
                                                index
                                            )
                                        }
                                        title="Xóa sản phẩm"
                                    >
                                        ×
                                    </button>


                                </article>

                            );
                        }
                    )}


                    <Link
                        to="/"
                        className="continue-shopping"
                    >
                        ← TIẾP TỤC MUA SẮM
                    </Link>


                </div>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <aside className="cart-summary">


                    <div className="summary-inner">


                        <p className="summary-number">
                            01
                        </p>


                        <h2>
                            TỔNG ĐƠN HÀNG
                        </h2>


                        <div className="summary-divider">
                        </div>


                        <div className="summary-row">

                            <span>
                                Sản phẩm
                            </span>

                            <strong>
                                {totalQuantity}
                            </strong>

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
                                Phí vận chuyển
                            </span>

                            <strong>
                                MIỄN PHÍ
                            </strong>

                        </div>


                        <div className="summary-divider">
                        </div>


                        <div className="summary-total">

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
                            type="button"
                            className="checkout-button"
                            onClick={() =>
                                navigate(
                                    "/checkout"
                                )
                            }
                        >

                            TIẾN HÀNH THANH TOÁN

                            <span>
                                →
                            </span>

                        </button>


                        <p className="checkout-note">

                            Giá sản phẩm và tồn kho
                            sẽ được xác nhận lại
                            khi đặt hàng.

                        </p>


                        <div className="summary-benefits">

                            <div>
                                <span>
                                    01
                                </span>

                                <p>
                                    MIỄN PHÍ VẬN CHUYỂN
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


            </section>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="cart-bottom">

                <p>
                    BOUTIQUE · 2026
                </p>

                <h2>
                    COMPLETE
                    <br />
                    YOUR LOOK.
                </h2>

            </section>


            <style>
                {cartStyles}
            </style>

        </div>
    );
};


// ============================================================
// CSS
// ============================================================

const cartStyles = `

    * {
        box-sizing: border-box;
    }


    .cart-page {
        width: 100%;

        background: #fff;

        color: #111;

        font-family:
            "Helvetica Neue",
            Arial,
            sans-serif;
    }


    /* =============================================
       HEADER
    ============================================= */

    .cart-header {
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


    .cart-eyebrow {
        margin:
            0 0 15px;

        color: #999;

        font-size: 9px;

        letter-spacing: 4px;
    }


    .cart-header h1 {
        margin: 0;

        font-size:
            clamp(
                42px,
                5vw,
                72px
            );

        font-weight: 300;

        letter-spacing: 3px;
    }


    .cart-header-meta {
        text-align: right;
    }


    .cart-header-meta span {
        font-size: 28px;

        font-weight: 300;
    }


    .cart-header-meta p {
        margin:
            5px 0 0;

        color: #999;

        font-size: 8px;

        letter-spacing: 2px;
    }


    /* =============================================
       MESSAGE
    ============================================= */

    .cart-message {
        margin:
            20px 5% 0;

        padding:
            14px 18px;

        background: #fff4e5;

        color: #8a5910;

        font-size: 11px;
    }


    /* =============================================
       MAIN LAYOUT
    ============================================= */

    .cart-layout {
        display: grid;

        grid-template-columns:
            minmax(0, 1.7fr)
            minmax(360px, .7fr);

        align-items: start;
    }


    /* =============================================
       ITEMS
    ============================================= */

    .cart-items {
        padding:
            50px 5%;
    }


    .cart-items-heading {
        min-height: 45px;

        display: flex;

        align-items: center;

        justify-content:
            space-between;

        border-bottom:
            1px solid #111;
    }


    .cart-items-heading span {
        font-size: 9px;

        letter-spacing: 2px;
    }


    .cart-items-heading button {
        border: none;

        background: transparent;

        color: #999;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1.5px;
    }


    .cart-items-heading button:hover {
        color: #111;
    }


    .cart-item {
        position: relative;

        display: grid;

        grid-template-columns:
            150px
            minmax(180px, 1fr)
            130px
            150px
            35px;

        gap: 24px;

        align-items: center;

        padding:
            28px 0;

        border-bottom:
            1px solid #e5e5e5;
    }


    /* =============================================
       IMAGE
    ============================================= */

    .cart-image {
        position: relative;

        display: block;

        width: 150px;

        aspect-ratio:
            3 / 4;

        overflow: hidden;

        background: #eee;
    }


    .cart-image img {
        width: 100%;
        height: 100%;

        object-fit: cover;

        display: block;

        transition:
            transform .5s ease;
    }


    .cart-image:hover img {
        transform:
            scale(1.035);
    }


    .cart-image > span {
        position: absolute;

        top: 8px;
        left: 8px;

        padding:
            5px 7px;

        background:
            rgba(
                255,
                255,
                255,
                .9
            );

        color: #111;

        font-size: 7px;
    }


    /* =============================================
       PRODUCT INFO
    ============================================= */

    .item-collection {
        margin:
            0 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .item-name {
        color: #111;

        text-decoration: none;

        font-size: 16px;

        font-weight: 500;
    }


    .item-name:hover {
        text-decoration: underline;
    }


    .item-variant {
        display: flex;

        gap: 25px;

        margin-top: 18px;
    }


    .item-variant span {
        display: flex;

        flex-direction: column;

        gap: 5px;

        color: #999;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .item-variant strong {
        color: #333;

        font-size: 10px;

        font-weight: 500;

        letter-spacing: 0;
    }


    .stock-text {
        margin:
            15px 0 0;

        color: #999;

        font-size: 8px;

        letter-spacing: 1px;
    }


    .unit-price {
        margin:
            15px 0 0;

        font-size: 11px;
    }


    /* =============================================
       QUANTITY
    ============================================= */

    .item-quantity > p,
    .item-total > p {
        margin:
            0 0 10px;

        color: #999;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .quantity-control {
        width: 120px;
        height: 39px;

        display: grid;

        grid-template-columns:
            39px 1fr 39px;

        border:
            1px solid #ccc;
    }


    .quantity-control button {
        border: none;

        background: #fff;

        cursor: pointer;

        font-size: 15px;
    }


    .quantity-control button:disabled {
        opacity: .3;

        cursor: not-allowed;
    }


    .quantity-control span {
        display: flex;

        justify-content: center;

        align-items: center;

        border-left:
            1px solid #eee;

        border-right:
            1px solid #eee;

        font-size: 10px;
    }


    /* =============================================
       ITEM TOTAL
    ============================================= */

    .item-total {
        text-align: right;
    }


    .item-total strong {
        font-size: 12px;

        font-weight: 500;
    }


    .remove-item {
        width: 32px;
        height: 32px;

        border: none;

        background: transparent;

        color: #999;

        cursor: pointer;

        font-size: 18px;
    }


    .remove-item:hover {
        color: #111;
    }


    /* =============================================
       CONTINUE
    ============================================= */

    .continue-shopping {
        display: inline-block;

        margin-top: 35px;

        color: #111;

        text-decoration: none;

        font-size: 8px;

        letter-spacing: 2px;

        padding-bottom: 5px;

        border-bottom:
            1px solid #111;
    }


    /* =============================================
       SUMMARY
    ============================================= */

    .cart-summary {
        position: relative;

        min-height: 100%;

        background: #f3f3f0;

        border-left:
            1px solid #ddd;
    }


    .summary-inner {
        position: sticky;

        top: 100px;

        padding:
            55px 45px;
    }


    .summary-number {
        margin:
            0 0 30px;

        color: #bbb;

        font-size: 45px;

        font-weight: 200;
    }


    .summary-inner h2 {
        margin: 0;

        font-size: 16px;

        font-weight: 500;

        letter-spacing: 2px;
    }


    .summary-divider {
        height: 1px;

        margin:
            28px 0;

        background: #d8d8d5;
    }


    .summary-row {
        display: flex;

        justify-content:
            space-between;

        margin-bottom: 17px;

        font-size: 10px;
    }


    .summary-row span {
        color: #777;
    }


    .summary-row strong {
        font-weight: 500;
    }


    .summary-total {
        display: flex;

        justify-content:
            space-between;

        align-items:
            flex-end;
    }


    .summary-total span {
        font-size: 9px;

        letter-spacing: 2px;
    }


    .summary-total strong {
        font-size: 19px;

        font-weight: 400;
    }


    /* =============================================
       CHECKOUT
    ============================================= */

    .checkout-button {
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

        letter-spacing: 1.7px;

        transition:
            all .2s ease;
    }


    .checkout-button:hover {
        background: transparent;

        color: #111;
    }


    .checkout-note {
        margin:
            14px 0 0;

        color: #999;

        font-size: 8px;

        line-height: 1.6;
    }


    /* =============================================
       BENEFITS
    ============================================= */

    .summary-benefits {
        margin-top: 40px;

        padding-top: 25px;

        display: grid;

        gap: 15px;

        border-top:
            1px solid #ddd;
    }


    .summary-benefits > div {
        display: flex;

        align-items: center;

        gap: 12px;
    }


    .summary-benefits span {
        color: #aaa;

        font-size: 7px;
    }


    .summary-benefits p {
        margin: 0;

        font-size: 7px;

        letter-spacing: 1px;
    }


    /* =============================================
       BOTTOM
    ============================================= */

    .cart-bottom {
        padding:
            120px 20px;

        text-align: center;

        background: #111;

        color: #fff;
    }


    .cart-bottom p {
        margin:
            0 0 20px;

        color: #777;

        font-size: 8px;

        letter-spacing: 4px;
    }


    .cart-bottom h2 {
        margin: 0;

        font-size:
            clamp(
                42px,
                6vw,
                78px
            );

        font-weight: 300;

        line-height: .95;
    }


    /* =============================================
       EMPTY
    ============================================= */

    .cart-empty {
        min-height:
            calc(
                100vh -
                78px
            );

        padding:
            80px 20px;

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


    .cart-empty h1 {
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


    .cart-empty-text {
        max-width: 430px;

        margin:
            30px auto;

        color: #777;

        font-size: 11px;

        line-height: 1.8;
    }


    .continue-button {
        min-width: 260px;

        padding:
            17px 20px;

        display: flex;

        justify-content:
            space-between;

        background: #111;

        color: #fff;

        text-decoration: none;

        font-size: 9px;

        letter-spacing: 2px;
    }


    /* =============================================
       TABLET
    ============================================= */

    @media (
        max-width: 1100px
    ) {

        .cart-layout {
            grid-template-columns:
                1fr;
        }


        .cart-summary {
            border-left: none;

            border-top:
                1px solid #ddd;
        }


        .summary-inner {
            position: static;
        }


        .cart-item {
            grid-template-columns:
                120px
                minmax(170px, 1fr)
                120px
                130px
                30px;
        }


        .cart-image {
            width: 120px;
        }

    }


    /* =============================================
       MOBILE
    ============================================= */

    @media (
        max-width: 720px
    ) {

        .cart-header {
            min-height: 190px;

            padding:
                55px 20px
                30px;
        }


        .cart-header h1 {
            font-size: 40px;
        }


        .cart-items {
            padding:
                35px 20px;
        }


        .cart-item {
            grid-template-columns:
                100px 1fr;

            gap: 15px;

            align-items: start;
        }


        .cart-image {
            width: 100px;

            grid-row:
                span 3;
        }


        .item-quantity {
            grid-column: 2;
        }


        .item-total {
            grid-column: 2;

            text-align: left;
        }


        .remove-item {
            position: absolute;

            top: 20px;
            right: 0;
        }


        .summary-inner {
            padding:
                45px 20px;
        }


        .cart-bottom {
            padding:
                90px 20px;
        }

    }

`;


export default Cart;