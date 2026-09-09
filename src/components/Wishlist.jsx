import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";


const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80";


// ============================================================
// WISHLIST
// ============================================================

const Wishlist = () => {

    const [
        wishlist,
        setWishlist
    ] = useState([]);


    // ========================================================
    // LOAD WISHLIST
    // ========================================================

    useEffect(() => {

        try {

            const savedWishlist =
                JSON.parse(
                    localStorage.getItem(
                        "wishlist"
                    ) ||
                    "[]"
                );


            if (
                Array.isArray(
                    savedWishlist
                )
            ) {

                setWishlist(
                    savedWishlist
                );

            } else {

                setWishlist([]);
            }

        } catch (error) {

            console.error(
                "Lỗi đọc wishlist:",
                error
            );

            setWishlist([]);
        }

    }, []);


    // ========================================================
    // SAVE
    // ========================================================

    const saveWishlist =
        (newWishlist) => {

            setWishlist(
                newWishlist
            );


            localStorage.setItem(
                "wishlist",
                JSON.stringify(
                    newWishlist
                )
            );


            // Báo cho Header nếu sau này cần cập nhật badge
            window.dispatchEvent(
                new Event(
                    "wishlistUpdated"
                )
            );
        };


    // ========================================================
    // REMOVE ITEM
    // ========================================================

    const handleRemove =
        (productId) => {

            const newWishlist =
                wishlist.filter(
                    (item) =>
                        Number(
                            item.product_id ||
                            item.id
                        ) !==
                        Number(
                            productId
                        )
                );


            saveWishlist(
                newWishlist
            );
        };


    // ========================================================
    // CLEAR ALL
    // ========================================================

    const handleClearAll =
        () => {

            const confirmed =
                window.confirm(
                    "Bạn có chắc muốn xóa toàn bộ sản phẩm yêu thích?"
                );


            if (!confirmed) {
                return;
            }


            saveWishlist([]);
        };


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
    // EMPTY
    // ========================================================

    if (
        wishlist.length === 0
    ) {

        return (

            <div className="wishlist-empty">


                <p className="wishlist-eyebrow">
                    BOUTIQUE.
                </p>


                <h1>
                    YOUR
                    <br />
                    WISHLIST.
                </h1>


                <p className="wishlist-empty-text">

                    Bạn chưa lưu sản phẩm nào.
                    Hãy khám phá bộ sưu tập
                    và chọn những thiết kế bạn yêu thích.

                </p>


                <Link
                    to="/"
                    className="wishlist-shop-button"
                >

                    KHÁM PHÁ SẢN PHẨM

                    <span>
                        →
                    </span>

                </Link>


                <style>
                    {wishlistStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="wishlist-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="wishlist-header">


                <div>

                    <p className="wishlist-eyebrow">
                        BOUTIQUE · SAVED
                    </p>


                    <h1>
                        YÊU THÍCH
                    </h1>

                </div>


                <div className="wishlist-count">

                    <span>

                        {String(
                            wishlist.length
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
                TOOLBAR
            ================================================= */}

            <section className="wishlist-toolbar">


                <p>
                    SẢN PHẨM ĐÃ LƯU
                </p>


                <button
                    type="button"
                    onClick={
                        handleClearAll
                    }
                >
                    XÓA TẤT CẢ
                </button>


            </section>


            {/* =================================================
                GRID
            ================================================= */}

            <section className="wishlist-grid">


                {wishlist.map(
                    (
                        item,
                        index
                    ) => {

                        const productId =
                            item.product_id ||
                            item.id;


                        return (

                            <article
                                className="wishlist-card"
                                key={
                                    productId
                                }
                            >


                                {/* IMAGE */}

                                <div className="wishlist-image">


                                    <Link
                                        to={
                                            `/products/${productId}`
                                        }
                                    >

                                        <img
                                            src={
                                                item.image_url ||
                                                item.image ||
                                                FALLBACK_IMAGE
                                            }
                                            alt={
                                                item.name ||
                                                "Sản phẩm"
                                            }
                                        />

                                    </Link>


                                    <span className="wishlist-number">

                                        {String(
                                            index +
                                            1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}

                                    </span>


                                    <button
                                        type="button"
                                        className="wishlist-remove"
                                        onClick={() =>
                                            handleRemove(
                                                productId
                                            )
                                        }
                                        title="Xóa khỏi yêu thích"
                                    >
                                        ×
                                    </button>


                                    <Link
                                        to={
                                            `/products/${productId}`
                                        }
                                        className="wishlist-view"
                                    >
                                        XEM CHI TIẾT
                                    </Link>


                                </div>


                                {/* INFO */}

                                <div className="wishlist-info">


                                    <p>

                                        {
                                            item.category_name ||
                                            item.category ||
                                            "BOUTIQUE COLLECTION"
                                        }

                                    </p>


                                    <Link
                                        to={
                                            `/products/${productId}`
                                        }
                                    >

                                        {
                                            item.name ||
                                            item.product_name ||
                                            "Sản phẩm"
                                        }

                                    </Link>


                                    <strong>

                                        {formatCurrency(
                                            item.price ||
                                            item.base_price ||
                                            item.sale_price
                                        )}

                                    </strong>


                                </div>


                            </article>

                        );
                    }
                )}


            </section>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <section className="wishlist-bottom">


                <p>
                    BOUTIQUE · 2026
                </p>


                <h2>
                    SAVE WHAT
                    <br />
                    YOU LOVE.
                </h2>


                <Link to="/">
                    CONTINUE SHOPPING →
                </Link>


            </section>


            <style>
                {wishlistStyles}
            </style>


        </div>
    );
};


// ============================================================
// CSS
// ============================================================

const wishlistStyles = `

    * {
        box-sizing: border-box;
    }


    .wishlist-page {
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

    .wishlist-header {
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


    .wishlist-eyebrow {
        margin:
            0 0 15px;

        color: #999;

        font-size: 9px;

        letter-spacing: 4px;
    }


    .wishlist-header h1 {
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


    .wishlist-count {
        text-align: right;
    }


    .wishlist-count span {
        font-size: 28px;

        font-weight: 300;
    }


    .wishlist-count p {
        margin:
            5px 0 0;

        color: #999;

        font-size: 8px;

        letter-spacing: 2px;
    }


    /* ========================================================
       TOOLBAR
    ======================================================== */

    .wishlist-toolbar {
        min-height: 70px;

        padding:
            0 5%;

        display: flex;

        align-items: center;

        justify-content:
            space-between;

        border-bottom:
            1px solid #ddd;
    }


    .wishlist-toolbar p {
        margin: 0;

        font-size: 8px;

        letter-spacing: 2px;
    }


    .wishlist-toolbar button {
        border: none;

        background: transparent;

        color: #999;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1.5px;
    }


    .wishlist-toolbar button:hover {
        color: #111;
    }


    /* ========================================================
       GRID
    ======================================================== */

    .wishlist-grid {
        padding:
            55px 5%
            100px;

        display: grid;

        grid-template-columns:
            repeat(
                4,
                minmax(
                    0,
                    1fr
                )
            );

        gap:
            50px 18px;
    }


    /* ========================================================
       CARD
    ======================================================== */

    .wishlist-card {
        min-width: 0;
    }


    .wishlist-image {
        position: relative;

        width: 100%;

        aspect-ratio:
            3 / 4;

        overflow: hidden;

        background: #eee;
    }


    .wishlist-image > a:first-of-type {
        display: block;

        width: 100%;
        height: 100%;
    }


    .wishlist-image img {
        width: 100%;
        height: 100%;

        object-fit: cover;

        display: block;

        transition:
            transform .6s ease;
    }


    .wishlist-card:hover
    .wishlist-image img {
        transform:
            scale(1.035);
    }


    /* ========================================================
       NUMBER
    ======================================================== */

    .wishlist-number {
        position: absolute;

        top: 12px;
        left: 12px;

        padding:
            6px 8px;

        background:
            rgba(
                255,
                255,
                255,
                .92
            );

        font-size: 7px;

        letter-spacing: 1px;
    }


    /* ========================================================
       REMOVE
    ======================================================== */

    .wishlist-remove {
        position: absolute;

        top: 12px;
        right: 12px;

        width: 32px;
        height: 32px;

        border: none;

        background:
            rgba(
                255,
                255,
                255,
                .92
            );

        color: #111;

        cursor: pointer;

        font-size: 18px;

        display: flex;

        align-items: center;

        justify-content: center;
    }


    /* ========================================================
       VIEW BUTTON
    ======================================================== */

    .wishlist-view {
        position: absolute;

        left: 12px;
        right: 12px;
        bottom: 12px;

        padding:
            14px;

        text-align: center;

        background:
            rgba(
                255,
                255,
                255,
                .95
            );

        color: #111;

        text-decoration: none;

        font-size: 8px;

        letter-spacing: 2px;

        opacity: 0;

        transform:
            translateY(8px);

        transition:
            all .25s ease;
    }


    .wishlist-card:hover
    .wishlist-view {
        opacity: 1;

        transform:
            translateY(0);
    }


    /* ========================================================
       INFO
    ======================================================== */

    .wishlist-info {
        padding-top:
            15px;
    }


    .wishlist-info p {
        margin:
            0 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;

        text-transform:
            uppercase;
    }


    .wishlist-info > a {
        display: block;

        color: #111;

        text-decoration: none;

        font-size: 13px;

        font-weight: 500;
    }


    .wishlist-info > a:hover {
        text-decoration: underline;
    }


    .wishlist-info strong {
        display: block;

        margin-top: 9px;

        font-size: 11px;

        font-weight: 400;

        letter-spacing: .5px;
    }


    /* ========================================================
       BOTTOM
    ======================================================== */

    .wishlist-bottom {
        padding:
            120px 20px;

        text-align: center;

        background: #111;

        color: #fff;
    }


    .wishlist-bottom p {
        margin:
            0 0 20px;

        color: #777;

        font-size: 8px;

        letter-spacing: 4px;
    }


    .wishlist-bottom h2 {
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


    .wishlist-bottom a {
        display: inline-block;

        margin-top: 35px;

        padding-bottom: 7px;

        color: #fff;

        border-bottom:
            1px solid #fff;

        text-decoration: none;

        font-size: 8px;

        letter-spacing: 2px;
    }


    /* ========================================================
       EMPTY
    ======================================================== */

    .wishlist-empty {
        min-height:
            calc(
                100vh -
                78px
            );

        padding:
            60px 20px;

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


    .wishlist-empty h1 {
        margin: 0;

        font-size:
            clamp(
                48px,
                7vw,
                90px
            );

        line-height: .95;

        font-weight: 300;
    }


    .wishlist-empty-text {
        max-width: 430px;

        margin:
            30px auto;

        color: #777;

        font-size: 11px;

        line-height: 1.8;
    }


    .wishlist-shop-button {
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


    /* ========================================================
       TABLET
    ======================================================== */

    @media (
        max-width: 1000px
    ) {

        .wishlist-grid {
            grid-template-columns:
                repeat(
                    3,
                    1fr
                );
        }

    }


    /* ========================================================
       MOBILE
    ======================================================== */

    @media (
        max-width: 650px
    ) {

        .wishlist-header {
            min-height: 190px;

            padding:
                55px 20px
                30px;
        }


        .wishlist-header h1 {
            font-size: 38px;
        }


        .wishlist-toolbar {
            padding:
                0 20px;
        }


        .wishlist-grid {
            padding:
                35px 15px
                70px;

            grid-template-columns:
                repeat(
                    2,
                    1fr
                );

            gap:
                35px 10px;
        }


        .wishlist-view {
            opacity: 1;

            transform: none;
        }


        .wishlist-bottom {
            padding:
                90px 20px;
        }

    }

`;


export default Wishlist;