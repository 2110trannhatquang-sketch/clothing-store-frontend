import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import API from "../services/api";


const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85";


// ============================================================
// PRODUCT DETAIL
// ============================================================

const ProductDetail = ({
    updateCartCount,
}) => {

    const { id } = useParams();
    const navigate = useNavigate();


    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        selectedVariant,
        setSelectedVariant
    ] = useState(null);

    const [quantity, setQuantity] =
        useState(1);

    const [activeImage, setActiveImage] =
        useState(FALLBACK_IMAGE);

    const [message, setMessage] =
        useState("");

    const [wishlist, setWishlist] =
        useState([]);


    // ========================================================
    // LOAD PRODUCT
    // ========================================================

    useEffect(() => {

        const fetchProduct =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const response =
                        await API.get(
                            `/products/${id}`
                        );


                    const data =
                        response.data?.data ||
                        response.data;


                    if (!data) {

                        throw new Error(
                            "Không tìm thấy sản phẩm"
                        );
                    }


                    setProduct(data);


                    // IMAGE

                    const firstImage =
                        data.images?.[0]?.image_url ||
                        data.image_url ||
                        FALLBACK_IMAGE;


                    setActiveImage(
                        firstImage
                    );


                    // VARIANT

                    if (
                        Array.isArray(
                            data.variants
                        ) &&
                        data.variants.length > 0
                    ) {

                        const availableVariant =
                            data.variants.find(
                                (variant) =>
                                    Number(
                                        variant.stock_quantity ??
                                        0
                                    ) > 0
                            );


                        setSelectedVariant(
                            availableVariant ||
                            data.variants[0]
                        );

                    } else {

                        setSelectedVariant(
                            null
                        );
                    }


                    setQuantity(1);


                } catch (err) {

                    console.error(
                        "Lỗi tải sản phẩm:",
                        err
                    );


                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Không thể tải sản phẩm"
                    );


                } finally {

                    setLoading(false);
                }
            };


        fetchProduct();

    }, [id]);


    // ========================================================
    // LOAD WISHLIST
    // ========================================================

    useEffect(() => {

        const loadWishlist =
            () => {

                try {

                    const saved =
                        JSON.parse(
                            localStorage.getItem(
                                "wishlist"
                            ) || "[]"
                        );


                    setWishlist(
                        Array.isArray(saved)
                            ? saved
                            : []
                    );

                } catch (error) {

                    console.error(
                        "Lỗi đọc wishlist:",
                        error
                    );

                    setWishlist([]);
                }
            };


        loadWishlist();


        window.addEventListener(
            "wishlistUpdated",
            loadWishlist
        );


        return () => {

            window.removeEventListener(
                "wishlistUpdated",
                loadWishlist
            );
        };

    }, []);


    // ========================================================
    // IMAGES
    // ========================================================

    const images =
        useMemo(() => {

            if (
                Array.isArray(
                    product?.images
                ) &&
                product.images.length > 0
            ) {

                return product.images;
            }


            if (
                product?.image_url
            ) {

                return [
                    {
                        image_url:
                            product.image_url,
                    },
                ];
            }


            return [
                {
                    image_url:
                        FALLBACK_IMAGE,
                },
            ];

        }, [product]);


    // ========================================================
    // PRICE
    // ========================================================

    const currentPrice =
        selectedVariant?.price_override ??
        product?.price ??
        product?.base_price ??
        0;


    // ========================================================
    // STOCK
    // ========================================================

    const currentStock =
        selectedVariant
            ? Number(
                selectedVariant.stock_quantity ??
                0
            )
            : null;


    const isOutOfStock =
        selectedVariant
            ? currentStock <= 0
            : false;


    // ========================================================
    // FORMAT PRICE
    // ========================================================

    const formatPrice =
        (price) => {

            return (
                Number(price || 0)
                    .toLocaleString(
                        "vi-VN"
                    ) +
                " ₫"
            );
        };


    // ========================================================
    // SELECT VARIANT
    // ========================================================

    const handleSelectVariant =
        (variant) => {

            setSelectedVariant(
                variant
            );

            setQuantity(1);
            setMessage("");
        };


    // ========================================================
    // QUANTITY
    // ========================================================

    const decreaseQuantity =
        () => {

            setQuantity(
                (current) =>
                    Math.max(
                        1,
                        current - 1
                    )
            );
        };


    const increaseQuantity =
        () => {

            if (
                selectedVariant &&
                quantity >= currentStock
            ) {

                setMessage(
                    `Chỉ còn ${currentStock} sản phẩm trong kho.`
                );

                return;
            }


            setQuantity(
                (current) =>
                    current + 1
            );
        };


    // ========================================================
    // ADD TO CART
    // ========================================================

    const handleAddToCart =
        () => {

            if (!product) {
                return;
            }


            if (
                product.variants?.length > 0 &&
                !selectedVariant
            ) {

                setMessage(
                    "Vui lòng chọn Size / Màu."
                );

                return;
            }


            if (
                selectedVariant &&
                currentStock <= 0
            ) {

                setMessage(
                    "Biến thể này hiện đã hết hàng."
                );

                return;
            }


            let cart = [];


            try {

                cart =
                    JSON.parse(
                        localStorage.getItem(
                            "cart"
                        ) || "[]"
                    );

            } catch {

                cart = [];
            }


            const cartItem = {

                product_id:
                    product.id,

                variant_id:
                    selectedVariant?.id ??
                    null,

                name:
                    product.name,

                price:
                    Number(
                        currentPrice
                    ),

                size:
                    selectedVariant?.size ||
                    "Standard",

                color:
                    selectedVariant?.color ||
                    "Standard",

                image_url:
                    activeImage ||
                    FALLBACK_IMAGE,

                quantity:
                    quantity,

                stock_quantity:
                    selectedVariant
                        ? currentStock
                        : null,
            };


            const existingIndex =
                cart.findIndex(
                    (item) =>
                        Number(
                            item.product_id
                        ) ===
                        Number(
                            cartItem.product_id
                        ) &&
                        Number(
                            item.variant_id
                        ) ===
                        Number(
                            cartItem.variant_id
                        )
                );


            // Đã có trong cart

            if (
                existingIndex > -1
            ) {

                const newQuantity =
                    Number(
                        cart[
                            existingIndex
                        ].quantity || 0
                    ) +
                    quantity;


                if (
                    selectedVariant &&
                    newQuantity >
                    currentStock
                ) {

                    setMessage(
                        `Tổng số lượng trong giỏ không thể vượt quá ${currentStock}.`
                    );

                    return;
                }


                cart[
                    existingIndex
                ].quantity =
                    newQuantity;

            }

            // Chưa có trong cart

            else {

                if (
                    selectedVariant &&
                    quantity >
                    currentStock
                ) {

                    setMessage(
                        `Số lượng vượt quá tồn kho (${currentStock}).`
                    );

                    return;
                }


                cart.push(
                    cartItem
                );
            }


            localStorage.setItem(
                "cart",
                JSON.stringify(
                    cart
                )
            );


            if (
                typeof updateCartCount ===
                "function"
            ) {

                updateCartCount();
            }


            setMessage(
                "✓ Đã thêm sản phẩm vào giỏ hàng."
            );


            setTimeout(
                () => {
                    setMessage("");
                },
                3000
            );
        };


    // ========================================================
    // WISHLIST CHECK
    // ========================================================

    const isWishlisted =
        product
            ? wishlist.some(
                (item) =>
                    Number(
                        item.product_id ||
                        item.id
                    ) ===
                    Number(
                        product.id
                    )
            )
            : false;


    // ========================================================
    // TOGGLE WISHLIST
    // ========================================================

    const handleToggleWishlist =
        () => {

            if (!product) {
                return;
            }


            let newWishlist;


            // REMOVE

            if (isWishlisted) {

                newWishlist =
                    wishlist.filter(
                        (item) =>
                            Number(
                                item.product_id ||
                                item.id
                            ) !==
                            Number(
                                product.id
                            )
                    );

            }

            // ADD

            else {

                newWishlist = [
                    ...wishlist,
                    {
                        product_id:
                            product.id,

                        name:
                            product.name ||
                            "Sản phẩm",

                        price:
                            Number(
                                currentPrice
                            ),

                        image_url:
                            activeImage ||
                            product.image_url ||
                            images?.[0]
                                ?.image_url ||
                            FALLBACK_IMAGE,

                        category_name:
                            product.category_name ||
                            product.category ||
                            "BOUTIQUE",
                    },
                ];
            }


            setWishlist(
                newWishlist
            );


            localStorage.setItem(
                "wishlist",
                JSON.stringify(
                    newWishlist
                )
            );


            window.dispatchEvent(
                new Event(
                    "wishlistUpdated"
                )
            );


            setMessage(
                isWishlisted
                    ? "Đã bỏ sản phẩm khỏi danh sách yêu thích."
                    : "✓ Đã thêm sản phẩm vào danh sách yêu thích."
            );


            setTimeout(
                () => {
                    setMessage("");
                },
                2500
            );
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="detail-state">

                <div className="detail-loading-line">
                </div>

                <p>
                    ĐANG TẢI SẢN PHẨM
                </p>

                <style>
                    {stateStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (
        error ||
        !product
    ) {

        return (

            <div className="detail-state">

                <p className="state-label">
                    BOUTIQUE.
                </p>

                <h2>
                    Không tìm thấy sản phẩm
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    ← QUAY LẠI
                </button>

                <style>
                    {stateStyles}
                </style>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="product-detail-page">


            {/* TOP BAR */}

            <div className="detail-topbar">

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    ← QUAY LẠI
                </button>


                <span>
                    BOUTIQUE / PRODUCT #{product.id}
                </span>

            </div>


            {/* MAIN */}

            <section className="detail-layout">


                {/* LEFT */}

                <div className="gallery">


                    <div className="main-image">

                        <img
                            src={
                                activeImage ||
                                FALLBACK_IMAGE
                            }
                            alt={
                                product.name
                            }
                        />


                        <span className="image-index">
                            01
                        </span>

                    </div>


                    {images.length > 1 && (

                        <div className="thumbnail-grid">

                            {images.map(
                                (
                                    image,
                                    index
                                ) => (

                                    <button
                                        key={
                                            `${image.image_url}-${index}`
                                        }
                                        type="button"
                                        className={
                                            activeImage ===
                                            image.image_url
                                                ? "thumbnail active"
                                                : "thumbnail"
                                        }
                                        onClick={() =>
                                            setActiveImage(
                                                image.image_url
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                image.image_url
                                            }
                                            alt={
                                                `${product.name} ${index + 1}`
                                            }
                                        />

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* RIGHT */}

                <div className="product-panel">

                    <div className="panel-inner">


                        <p className="detail-category">

                            {
                                product.category_name ||
                                "BOUTIQUE COLLECTION"
                            }

                        </p>


                        <h1>
                            {product.name}
                        </h1>


                        <p className="detail-price">

                            {formatPrice(
                                currentPrice
                            )}

                        </p>


                        <div className="divider">
                        </div>


                        {/* DESCRIPTION */}

                        <div className="description">

                            <p className="section-label">
                                MÔ TẢ
                            </p>


                            <p className="description-text">

                                {
                                    product.description ||
                                    "Thiết kế thuộc bộ sưu tập BOUTIQUE, mang phong cách hiện đại và tối giản."
                                }

                            </p>

                        </div>


                        {/* VARIANTS */}

                        {product.variants &&
                            product.variants.length > 0 && (

                                <div className="variant-section">


                                    <div className="variant-heading">

                                        <p className="section-label">
                                            SIZE / MÀU
                                        </p>


                                        {selectedVariant && (

                                            <span>

                                                {
                                                    selectedVariant.size ||
                                                    "Standard"
                                                }

                                                {" · "}

                                                {
                                                    selectedVariant.color ||
                                                    "Mặc định"
                                                }

                                            </span>

                                        )}

                                    </div>


                                    <div className="variant-list">

                                        {product.variants.map(
                                            (variant) => {

                                                const stock =
                                                    Number(
                                                        variant.stock_quantity ??
                                                        0
                                                    );


                                                const selected =
                                                    selectedVariant?.id ===
                                                    variant.id;


                                                return (

                                                    <button
                                                        key={
                                                            variant.id
                                                        }
                                                        type="button"
                                                        disabled={
                                                            stock <= 0
                                                        }
                                                        className={`
                                                            variant-option
                                                            ${selected
                                                                ? "selected"
                                                                : ""}
                                                            ${stock <= 0
                                                                ? "sold-out"
                                                                : ""}
                                                        `}
                                                        onClick={() =>
                                                            handleSelectVariant(
                                                                variant
                                                            )
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                variant.size ||
                                                                "Standard"
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                variant.color ||
                                                                "Mặc định"
                                                            }
                                                        </span>


                                                        {stock <= 0 && (

                                                            <small>
                                                                HẾT HÀNG
                                                            </small>

                                                        )}

                                                    </button>

                                                );
                                            }
                                        )}

                                    </div>


                                    {selectedVariant && (

                                        <div className="stock-info">

                                            {currentStock > 0
                                                ? (
                                                    <>
                                                        CÒN{" "}
                                                        <strong>
                                                            {currentStock}
                                                        </strong>{" "}
                                                        SẢN PHẨM
                                                    </>
                                                )
                                                : (
                                                    <strong>
                                                        HẾT HÀNG
                                                    </strong>
                                                )}

                                        </div>

                                    )}

                                </div>

                            )}


                        {/* QUANTITY */}

                        <div className="quantity-section">

                            <p className="section-label">
                                SỐ LƯỢNG
                            </p>


                            <div className="quantity-control">

                                <button
                                    type="button"
                                    onClick={
                                        decreaseQuantity
                                    }
                                >
                                    −
                                </button>


                                <span>
                                    {quantity}
                                </span>


                                <button
                                    type="button"
                                    onClick={
                                        increaseQuantity
                                    }
                                    disabled={
                                        isOutOfStock
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        {/* MESSAGE */}

                        {message && (

                            <div
                                className={
                                    message.startsWith(
                                        "✓"
                                    )
                                        ? "cart-message success"
                                        : "cart-message warning"
                                }
                            >
                                {message}
                            </div>

                        )}


                        {/* ADD CART */}

                        <button
                            type="button"
                            className="add-cart-button"
                            onClick={
                                handleAddToCart
                            }
                            disabled={
                                isOutOfStock
                            }
                        >

                            <span>

                                {isOutOfStock
                                    ? "HẾT HÀNG"
                                    : "THÊM VÀO GIỎ HÀNG"}

                            </span>


                            {!isOutOfStock && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>


                        {/* WISHLIST */}

                        <button
                            type="button"
                            className={
                                isWishlisted
                                    ? "wishlist-detail-button active"
                                    : "wishlist-detail-button"
                            }
                            onClick={
                                handleToggleWishlist
                            }
                        >

                            <span className="wishlist-heart">

                                {isWishlisted
                                    ? "♥"
                                    : "♡"}

                            </span>


                            <span>

                                {isWishlisted
                                    ? "ĐÃ YÊU THÍCH"
                                    : "THÊM VÀO YÊU THÍCH"}

                            </span>

                        </button>


                        {/* BENEFITS */}

                        <div className="product-benefits">

                            <div>

                                <span>
                                    01
                                </span>

                                <p>
                                    GIAO HÀNG
                                </p>

                                <small>
                                    Giao hàng toàn quốc
                                </small>

                            </div>


                            <div>

                                <span>
                                    02
                                </span>

                                <p>
                                    THANH TOÁN
                                </p>

                                <small>
                                    Thanh toán an toàn
                                </small>

                            </div>


                            <div>

                                <span>
                                    03
                                </span>

                                <p>
                                    HỖ TRỢ
                                </p>

                                <small>
                                    Hỗ trợ đơn hàng
                                </small>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* BRAND */}

            <section className="detail-brand">

                <p>
                    BOUTIQUE COLLECTION
                </p>


                <h2>
                    WEAR YOUR
                    <br />
                    OWN STORY.
                </h2>

            </section>


            <style>{`

                * {
                    box-sizing: border-box;
                }


                .product-detail-page {
                    width: 100%;

                    background: #fff;
                    color: #111;

                    font-family:
                        "Helvetica Neue",
                        Arial,
                        sans-serif;
                }


                /* ================= TOPBAR ================= */

                .detail-topbar {
                    min-height: 70px;

                    padding: 0 5%;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    border-bottom:
                        1px solid #e5e5e5;
                }


                .detail-topbar button {
                    padding: 0;

                    border: none;

                    background: transparent;

                    color: #111;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 2px;
                }


                .detail-topbar span {
                    color: #999;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                /* ================= LAYOUT ================= */

                .detail-layout {
                    display: grid;

                    grid-template-columns:
                        minmax(0, 1.15fr)
                        minmax(400px, .85fr);

                    min-height:
                        calc(
                            100vh -
                            148px
                        );
                }


                /* ================= GALLERY ================= */

                .gallery {
                    padding: 40px;

                    background: #f2f2f0;
                }


                .main-image {
                    position: relative;

                    width: 100%;

                    min-height: 680px;

                    height:
                        calc(
                            100vh -
                            190px
                        );

                    overflow: hidden;

                    background: #e8e8e5;
                }


                .main-image img {
                    width: 100%;
                    height: 100%;

                    object-fit: cover;

                    display: block;

                    transition:
                        transform .7s ease;
                }


                .main-image:hover img {
                    transform:
                        scale(1.015);
                }


                .image-index {
                    position: absolute;

                    top: 16px;
                    left: 16px;

                    padding: 6px 8px;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .9
                        );

                    font-size: 8px;
                }


                /* ================= THUMBNAILS ================= */

                .thumbnail-grid {
                    display: grid;

                    grid-template-columns:
                        repeat(
                            5,
                            1fr
                        );

                    gap: 8px;

                    margin-top: 10px;
                }


                .thumbnail {
                    padding: 0;

                    aspect-ratio: 3 / 4;

                    overflow: hidden;

                    border:
                        1px solid transparent;

                    background: #eee;

                    opacity: .55;

                    cursor: pointer;
                }


                .thumbnail.active {
                    opacity: 1;

                    border-color: #111;
                }


                .thumbnail:hover {
                    opacity: 1;
                }


                .thumbnail img {
                    width: 100%;
                    height: 100%;

                    display: block;

                    object-fit: cover;
                }


                /* ================= PANEL ================= */

                .product-panel {
                    position: relative;

                    background: #fff;
                }


                .panel-inner {
                    position: sticky;

                    top: 110px;

                    max-width: 650px;

                    margin: 0 auto;

                    padding: 70px 8%;
                }


                .detail-category {
                    margin: 0 0 18px;

                    color: #999;

                    font-size: 9px;

                    letter-spacing: 3px;

                    text-transform:
                        uppercase;
                }


                .product-panel h1 {
                    margin: 0;

                    font-size:
                        clamp(
                            38px,
                            4vw,
                            60px
                        );

                    line-height: 1;

                    font-weight: 300;
                }


                .detail-price {
                    margin: 25px 0 0;

                    font-size: 17px;

                    letter-spacing: 1px;
                }


                .divider {
                    width: 100%;
                    height: 1px;

                    margin: 35px 0;

                    background: #e5e5e5;
                }


                /* ================= TEXT ================= */

                .section-label {
                    margin: 0 0 12px;

                    color: #777;

                    font-size: 8px;

                    font-weight: 600;

                    letter-spacing: 2px;
                }


                .description-text {
                    margin: 0;

                    color: #555;

                    font-size: 12px;

                    line-height: 1.9;
                }


                /* ================= VARIANT ================= */

                .variant-section {
                    margin-top: 35px;
                }


                .variant-heading {
                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

                    margin-bottom: 12px;
                }


                .variant-heading
                .section-label {
                    margin: 0;
                }


                .variant-heading span {
                    color: #888;

                    font-size: 9px;
                }


                .variant-list {
                    display: grid;

                    grid-template-columns:
                        repeat(
                            2,
                            minmax(
                                0,
                                1fr
                            )
                        );

                    gap: 8px;
                }


                .variant-option {
                    position: relative;

                    min-height: 58px;

                    padding: 10px 12px;

                    display: flex;

                    flex-direction: column;

                    justify-content: center;

                    align-items: flex-start;

                    gap: 4px;

                    border:
                        1px solid #d0d0d0;

                    background: #fff;

                    color: #111;

                    cursor: pointer;
                }


                .variant-option strong {
                    font-size: 10px;

                    letter-spacing: 1px;
                }


                .variant-option span {
                    color: #777;

                    font-size: 9px;
                }


                .variant-option.selected {
                    background: #111;

                    border-color: #111;

                    color: #fff;
                }


                .variant-option.selected span {
                    color: #bbb;
                }


                .variant-option.sold-out {
                    opacity: .35;

                    cursor: not-allowed;
                }


                .variant-option small {
                    position: absolute;

                    top: 5px;
                    right: 5px;

                    font-size: 6px;

                    letter-spacing: 1px;
                }


                .stock-info {
                    margin-top: 10px;

                    color: #777;

                    font-size: 8px;

                    letter-spacing: 1px;
                }


                /* ================= QUANTITY ================= */

                .quantity-section {
                    margin-top: 35px;
                }


                .quantity-control {
                    width: 135px;
                    height: 44px;

                    display: grid;

                    grid-template-columns:
                        44px 1fr 44px;

                    border:
                        1px solid #ccc;
                }


                .quantity-control button {
                    border: none;

                    background: #fff;

                    cursor: pointer;

                    font-size: 17px;
                }


                .quantity-control button:disabled {
                    opacity: .3;

                    cursor: not-allowed;
                }


                .quantity-control span {
                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border-left:
                        1px solid #eee;

                    border-right:
                        1px solid #eee;

                    font-size: 11px;
                }


                /* ================= MESSAGE ================= */

                .cart-message {
                    margin-top: 20px;

                    padding: 12px 15px;

                    font-size: 10px;

                    line-height: 1.6;
                }


                .cart-message.success {
                    background: #edf7ef;

                    color: #21743b;
                }


                .cart-message.warning {
                    background: #fff4e5;

                    color: #8a5910;
                }


                /* ================= CART BUTTON ================= */

                .add-cart-button {
                    width: 100%;

                    margin-top: 25px;

                    padding: 18px 20px;

                    display: flex;

                    align-items: center;

                    justify-content:
                        space-between;

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


                .add-cart-button:hover:not(:disabled) {
                    background: #fff;

                    color: #111;
                }


                .add-cart-button:disabled {
                    background: #aaa;

                    border-color: #aaa;

                    cursor: not-allowed;
                }


                /* ================= WISHLIST ================= */

                .wishlist-detail-button {
                    width: 100%;

                    margin-top: 10px;

                    padding: 16px 20px;

                    display: flex;

                    justify-content: center;

                    align-items: center;

                    gap: 12px;

                    border:
                        1px solid #111;

                    background: #fff;

                    color: #111;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 2px;

                    transition:
                        all .2s ease;
                }


                .wishlist-detail-button:hover {
                    background: #f2f2f2;
                }


                .wishlist-detail-button.active {
                    background: #111;

                    color: #fff;
                }


                .wishlist-detail-button.active:hover {
                    background: #222;
                }


                .wishlist-heart {
                    font-size: 18px;

                    line-height: 1;
                }


                /* ================= BENEFITS ================= */

                .product-benefits {
                    margin-top: 35px;

                    padding-top: 25px;

                    display: grid;

                    grid-template-columns:
                        repeat(
                            3,
                            1fr
                        );

                    gap: 10px;

                    border-top:
                        1px solid #eee;
                }


                .product-benefits span {
                    color: #aaa;

                    font-size: 8px;
                }


                .product-benefits p {
                    margin: 7px 0 4px;

                    font-size: 8px;

                    letter-spacing: 1px;
                }


                .product-benefits small {
                    color: #999;

                    font-size: 8px;

                    line-height: 1.5;
                }


                /* ================= BRAND ================= */

                .detail-brand {
                    padding: 130px 20px;

                    text-align: center;

                    background: #111;

                    color: #fff;
                }


                .detail-brand p {
                    margin: 0 0 20px;

                    color: #777;

                    font-size: 8px;

                    letter-spacing: 4px;
                }


                .detail-brand h2 {
                    margin: 0;

                    font-size:
                        clamp(
                            42px,
                            6vw,
                            80px
                        );

                    font-weight: 300;

                    line-height: .95;
                }


                /* ================= TABLET ================= */

                @media (
                    max-width: 1000px
                ) {

                    .detail-layout {
                        grid-template-columns:
                            1fr 1fr;
                    }


                    .gallery {
                        padding: 25px;
                    }


                    .main-image {
                        min-height: 560px;
                    }


                    .panel-inner {
                        padding: 50px 7%;
                    }

                }


                /* ================= MOBILE ================= */

                @media (
                    max-width: 750px
                ) {

                    .detail-topbar {
                        padding: 0 20px;
                    }


                    .detail-topbar span {
                        display: none;
                    }


                    .detail-layout {
                        display: block;
                    }


                    .gallery {
                        padding: 0;
                    }


                    .main-image {
                        height: auto;

                        min-height: 0;

                        aspect-ratio:
                            3 / 4;
                    }


                    .thumbnail-grid {
                        padding: 0 10px;
                    }


                    .panel-inner {
                        position: static;

                        max-width: none;

                        padding:
                            50px 22px
                            70px;
                    }


                    .product-panel h1 {
                        font-size: 38px;
                    }


                    .product-benefits {
                        grid-template-columns:
                            1fr;
                    }


                    .detail-brand {
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

    .detail-state {
        min-height:
            calc(
                100vh -
                78px
            );

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        padding: 30px;

        text-align: center;

        font-family:
            "Helvetica Neue",
            Arial,
            sans-serif;
    }


    .detail-state p {
        color: #777;

        font-size: 10px;

        letter-spacing: 2px;
    }


    .detail-state h2 {
        margin: 5px 0 10px;

        font-size: 28px;

        font-weight: 400;
    }


    .detail-state button {
        margin-top: 20px;

        padding: 11px 17px;

        border:
            1px solid #111;

        background: #111;

        color: #fff;

        cursor: pointer;

        font-size: 9px;

        letter-spacing: 2px;
    }


    .state-label {
        letter-spacing:
            4px !important;
    }


    .detail-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            detailLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes detailLoading {

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


export default ProductDetail;