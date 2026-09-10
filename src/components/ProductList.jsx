import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import API from "../services/api";


// ============================================================
// PRODUCT LIST / HOMEPAGE
// ============================================================

function ProductList({
    search = "",
}) {

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        wishlist,
        setWishlist
    ] = useState([]);


    const [
        searchParams
    ] = useSearchParams();


    const category =
        searchParams.get("category");


    // ========================================================
    // LOAD PRODUCTS
    // ========================================================

    const fetchProducts =
        async () => {

            try {

                setLoading(true);
                setError("");


                const response =
                    await API.get(
                        "/products"
                    );


                const data =
                    response.data;


                let productList = [];


                if (
                    Array.isArray(data)
                ) {

                    productList =
                        data;

                } else if (
                    Array.isArray(
                        data.products
                    )
                ) {

                    productList =
                        data.products;

                } else if (
                    Array.isArray(
                        data.data
                    )
                ) {

                    productList =
                        data.data;
                }


                setProducts(
                    productList
                );


            } catch (err) {

                console.error(
                    "Lỗi lấy sản phẩm:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    "Không thể tải sản phẩm."
                );


                setProducts([]);


            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        fetchProducts();

    }, []);


    // ========================================================
    // LOAD WISHLIST
    // ========================================================

    useEffect(() => {

        const loadWishlist =
            () => {

                try {

                    const savedWishlist =
                        JSON.parse(
                            localStorage.getItem(
                                "wishlist"
                            ) ||
                            "[]"
                        );


                    setWishlist(
                        Array.isArray(
                            savedWishlist
                        )
                            ? savedWishlist
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
// SCROLL REVEAL ANIMATION
// ========================================================

useEffect(() => {

    const elements =
  document.querySelectorAll(
    ".intro, .category-card, .collection-header, .product-card-wrap, .brand-number, .brand-content, .brand-year, .footer-cta"
);

    if (!elements.length) {
        return;
    }

    // Trình duyệt cũ không hỗ trợ IntersectionObserver
    if (!("IntersectionObserver" in window)) {

        elements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "is-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }

                });

            },
            {
                threshold: 0.15,
                rootMargin:
                    "0px 0px -60px 0px",
            }
        );


   let productIndex = 0;

elements.forEach((element) => {

    element.classList.add(
        "reveal-item"
    );

    let delay = 0;

    if (
        element.classList.contains(
            "category-card"
        )
    ) {
        delay = 120;
    }

    if (
        element.classList.contains(
            "product-card-wrap"
        )
    ) {
        delay =
            (productIndex % 4) * 120;

        productIndex += 1;
    }
if (
    element.classList.contains(
        "brand-number"
    )
) {
    delay = 0;
}

if (
    element.classList.contains(
        "brand-content"
    )
) {
    delay = 180;
}

if (
    element.classList.contains(
        "brand-year"
    )
) {
    delay = 360;
}
    element.style.setProperty(
        "--reveal-delay",
        `${delay}ms`
    );

    observer.observe(
        element
    );
});

    return () => {

        observer.disconnect();

    };

}, [
    category,
    search,
]);

    // ========================================================
    // NORMALIZE
    // ========================================================

    const normalize =
        (value) => {

            return String(
                value || ""
            )
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .replace(/đ/g, "d")
                .trim();
        };


    // ========================================================
    // CATEGORY MATCH
    // ========================================================

    const matchesCategory =
        (
            product,
            selectedCategory
        ) => {

            if (
                !selectedCategory
            ) {

                return true;
            }


            const productCategory =
                normalize(
                    product.category_name ||
                    product.category ||
                    product.type ||
                    product.categoryName
                );


            const selected =
                normalize(
                    selectedCategory
                );


            // ================= NEW =================

            if (
                selected === "new"
            ) {

                return true;
            }


            // ================= MEN =================

            if (
                selected === "men"
            ) {

                return (
                    productCategory.includes(
                        "nam"
                    )
                );
            }


            // ================= WOMEN =================

            if (
                selected === "women"
            ) {

                return (
                    productCategory.includes(
                        "nu"
                    )
                );
            }


            // ================= ACCESSORIES =================

            if (
                selected ===
                "accessories"
            ) {

                return (
                    productCategory.includes(
                        "phu kien"
                    )
                );
            }


            // ================= BAGS =================

            if (
                selected === "bags"
            ) {

                return (
                    productCategory.includes(
                        "tui"
                    )
                );
            }


            // ================= SHOES =================

            if (
                selected === "shoes"
            ) {

                return (
                    productCategory.includes(
                        "giay"
                    )
                );
            }


            return (
                productCategory ===
                    selected ||

                productCategory.includes(
                    selected
                ) ||

                selected.includes(
                    productCategory
                )
            );
        };


    // ========================================================
    // FILTER SEARCH + CATEGORY
    // ========================================================

    const filteredProducts =
        useMemo(() => {

            const keyword =
                normalize(search);


            return products.filter(
                (product) => {

                    const categoryMatched =
                        matchesCategory(
                            product,
                            category
                        );


                    if (
                        !categoryMatched
                    ) {

                        return false;
                    }


                    if (
                        !keyword
                    ) {

                        return true;
                    }


                    const searchableText =
                        normalize(
                            [
                                product.name,
                                product.product_name,
                                product.category_name,
                                product.category,
                                product.description
                            ]
                                .filter(Boolean)
                                .join(" ")
                        );


                    return searchableText.includes(
                        keyword
                    );
                }
            );

        }, [
            products,
            category,
            search,
        ]);


    // ========================================================
    // FORMAT PRICE
    // ========================================================

    const formatPrice =
        (price) => {

            if (
                price === null ||
                price === undefined ||
                price === ""
            ) {

                return "Liên hệ";
            }


            return (
                Number(price)
                    .toLocaleString(
                        "vi-VN"
                    ) +
                " ₫"
            );
        };


    // ========================================================
    // GET IMAGE
    // ========================================================

    const getImage =
        (product) => {

            return (
                product.image_url ||
                product.image ||
                product.thumbnail ||
                product.imageUrl ||
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
            );
        };


    // ========================================================
    // CHECK WISHLIST
    // ========================================================

    const isWishlisted =
        (productId) => {

            return wishlist.some(
                (item) =>
                    Number(
                        item.product_id ||
                        item.id
                    ) ===
                    Number(
                        productId
                    )
            );
        };


    // ========================================================
    // TOGGLE WISHLIST
    // ========================================================

    const toggleWishlist =
        (product) => {

            const exists =
                isWishlisted(
                    product.id
                );


            let newWishlist;


            // ================================================
            // REMOVE
            // ================================================

            if (exists) {

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

            // ================================================
            // ADD
            // ================================================

            else {

                const wishlistItem = {

                    product_id:
                        product.id,

                    name:
                        product.name ||
                        product.product_name ||
                        "Sản phẩm",

                    price:
                        product.price ||
                        product.base_price ||
                        product.sale_price ||
                        0,

                    image_url:
                        getImage(
                            product
                        ),

                    category_name:
                        product.category_name ||
                        product.category ||
                        "BOUTIQUE",
                };


                newWishlist = [
                    ...wishlist,
                    wishlistItem
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
        };


    // ========================================================
    // PAGE TITLE
    // ========================================================

    const getCollectionTitle =
        () => {

            if (
                search.trim()
            ) {

                return "KẾT QUẢ TÌM KIẾM";
            }


            switch (category) {

                case "women":
                    return "THỜI TRANG NỮ";

                case "men":
                    return "THỜI TRANG NAM";

                case "new":
                    return "BỘ SƯU TẬP MỚI";

                case "accessories":
                    return "PHỤ KIỆN";

                case "bags":
                    return "TÚI XÁCH";

                case "shoes":
                    return "GIÀY";

                default:
                    return "SẢN PHẨM NỔI BẬT";
            }
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="loading-page">

                <div className="loading-line">
                </div>

                <p>
                    ĐANG TẢI BỘ SƯU TẬP
                </p>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (

            <div className="error-page">

                <p className="eyebrow">
                    BOUTIQUE.
                </p>

                <h2>
                    Không thể tải sản phẩm
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={
                        fetchProducts
                    }
                >
                    THỬ LẠI
                </button>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="product-page">


            {/* =================================================
                HERO
            ================================================= */}

            {!category &&
                !search.trim() && (

               <section className="hero luxury-hero">

  <div className="hero-media">
    <img
      className="hero-image"
      src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=90"
      alt="BOUTIQUE Collection"
    />
  </div>

  <div className="hero-overlay"></div>

  <div className="hero-content">

    <p className="hero-kicker">
      MAISON COUTURE
    </p>

    <h1 className="hero-title">

      <span className="hero-line">
        <span>BỘ SƯU TẬP</span>
      </span>

      <span className="hero-line">
        <span>MỚI</span>
      </span>

    </h1>

    <p className="hero-subtitle">
      Phong cách hiện đại · Tinh tế · Thanh lịch
    </p>

    <Link
      to="/?category=new"
      className="hero-cta"
    >
      <span>KHÁM PHÁ BỘ SƯU TẬP</span>
      <span className="hero-arrow">→</span>
    </Link>

  </div>

  <div className="hero-scroll">
    <span>CUỘN XUỐNG</span>
    <div className="hero-scroll-line"></div>
  </div>

</section>
            )}


            {/* =================================================
                INTRO
            ================================================= */}

            {!category &&
                !search.trim() && (

                <section className="intro">

                    <p className="eyebrow">
                        BOUTIQUE.
                    </p>


                    <h2>
                        PHONG CÁCH
                        <br />
                        KHÔNG CẦN GIỚI HẠN
                    </h2>


                    <p className="intro-description">

                        Những thiết kế được lựa chọn
                        cho phong cách thường ngày,
                        kết hợp giữa sự thoải mái,
                        hiện đại và tinh tế.

                    </p>

                </section>

            )}


            {/* =================================================
                CATEGORY
            ================================================= */}

            {!category &&
                !search.trim() && (

                <section className="category-showcase">

                    <Link
                        to="/?category=men"
                        className="category-card"
                    >

                        <img
                            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=85"
                            alt="Thời trang nam"
                        />

                        <div className="category-overlay">
                        </div>


                        <div className="category-content">

                            <span>
                                COLLECTION 01
                            </span>

                            <h3>
                                MEN
                            </h3>

                            <p>
                                KHÁM PHÁ →
                            </p>

                        </div>

                    </Link>


                    <Link
                        to="/?category=women"
                        className="category-card"
                    >

                        <img
                            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85"
                            alt="Thời trang nữ"
                        />

                        <div className="category-overlay">
                        </div>


                        <div className="category-content">

                            <span>
                                COLLECTION 02
                            </span>

                            <h3>
                                WOMEN
                            </h3>

                            <p>
                                KHÁM PHÁ →
                            </p>

                        </div>

                    </Link>

                </section>

            )}


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section className="collection">


                <div className="collection-header">

                    <div>

                        <p className="small-title">
                            BOUTIQUE SELECTION
                        </p>


                        <h2>
                            {getCollectionTitle()}
                        </h2>


                        {search.trim() && (

                            <p className="search-result-label">

                                Tìm kiếm cho:{" "}

                                <strong>
                                    “{search}”
                                </strong>

                            </p>

                        )}

                    </div>


                    <div className="collection-meta">

                        <span>
                            {
                                filteredProducts.length
                            }
                        </span>

                        <p>
                            SẢN PHẨM
                        </p>

                    </div>

                </div>


                {/* =============================================
                    EMPTY
                ============================================= */}

                {filteredProducts.length ===
                    0 ? (

                    <div className="empty">

                        <p className="eyebrow">
                            BOUTIQUE.
                        </p>


                        <h3>
                            Không tìm thấy sản phẩm
                        </h3>


                        <p>
                            Thử từ khóa hoặc danh mục khác.
                        </p>


                        <Link to="/">
                            XEM TẤT CẢ SẢN PHẨM
                        </Link>

                    </div>

                ) : (

                    /* =========================================
                        PRODUCT GRID
                    ========================================= */

                    <div className="product-grid">

                        {filteredProducts.map(
                            (
                                product,
                                index
                            ) => (

                            <div
                                key={
                                    product.id
                                }
                                className="product-card-wrap"
                            >


                                {/* =================================
                                    WISHLIST HEART
                                ================================= */}

                                <button
                                    type="button"
                                    className={
                                        isWishlisted(
                                            product.id
                                        )
                                            ? "wishlist-heart active"
                                            : "wishlist-heart"
                                    }
                                    onClick={() =>
                                        toggleWishlist(
                                            product
                                        )
                                    }
                                    title={
                                        isWishlisted(
                                            product.id
                                        )
                                            ? "Bỏ khỏi yêu thích"
                                            : "Thêm vào yêu thích"
                                    }
                                >

                                    {isWishlisted(
                                        product.id
                                    )
                                        ? "♥"
                                        : "♡"}

                                </button>


                                {/* =================================
                                    PRODUCT CARD
                                ================================= */}

                                <Link
                                    to={
                                        `/products/${product.id}`
                                    }
                                    className="product-card"
                                >

                                    <div className="product-image">

                                        <img
                                            src={
                                                getImage(
                                                    product
                                                )
                                            }
                                            alt={
                                                product.name ||
                                                "Sản phẩm"
                                            }
                                        />


                                        <span className="product-number">

                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}

                                        </span>


                                        <div className="product-hover">

                                            <span>
                                                XEM CHI TIẾT
                                            </span>

                                        </div>

                                    </div>


                                    <div className="product-info">

                                        <div className="product-top">

                                            <p className="product-category">

                                                {
                                                    product.category_name ||
                                                    product.category ||
                                                    "BOUTIQUE"
                                                }

                                            </p>


                                            <span>
                                                →
                                            </span>

                                        </div>


                                        <h3>

                                            {
                                                product.name ||
                                                product.product_name ||
                                                "Sản phẩm"
                                            }

                                        </h3>


                                        <p className="price">

                                            {formatPrice(
                                                product.price ||
                                                product.base_price ||
                                                product.sale_price
                                            )}

                                        </p>

                                    </div>

                                </Link>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* =================================================
                BRAND
            ================================================= */}

            {!category &&
                !search.trim() && (

                <section className="brand-section">

                    <div className="brand-number">
                        01
                    </div>


                    <div className="brand-content">

                        <p>
                            OUR PHILOSOPHY
                        </p>


                        <h2>
                            SIMPLE.
                            <br />
                            MODERN.
                            <br />
                            TIMELESS.
                        </h2>


                        <span>

                            BOUTIQUE hướng đến
                            phong cách thời trang
                            đơn giản nhưng có dấu ấn.

                        </span>

                    </div>


                    <div className="brand-year">
                        EST. 2026
                    </div>

                </section>

            )}


            {/* =================================================
                CTA
            ================================================= */}

            {!category &&
                !search.trim() && (

                <section className="footer-cta">

                    <p>
                        DISCOVER THE COLLECTION
                    </p>


                    <h2>
                        FIND YOUR
                        <br />
                        SIGNATURE STYLE
                    </h2>


                    <Link to="/?category=new">
                        SHOP COLLECTION →
                    </Link>

                </section>

            )}


            {/* =================================================
                CSS
            ================================================= */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                .product-page {
                    width: 100%;
                    overflow: hidden;

                    background: #fff;

                    color: #111;
                }


                /* =============================================
   HERO - LUXURY ANIMATION
============================================= */

.hero {
    position: relative;

    width: 100%;
    height: calc(100vh - 78px);
    min-height: 650px;

    overflow: hidden;

    background: #111;
}


/* ================= MEDIA ================= */

.hero-media {
    position: absolute;
    inset: 0;

    overflow: hidden;
}

.hero-image {
    width: 100%;
    height: 100%;

    object-fit: cover;
    display: block;

    opacity: 0;

    transform: scale(1.14);

    animation:
        heroImageReveal
        1.7s
        cubic-bezier(.16, 1, .3, 1)
        forwards,

        heroSlowZoom
        12s
        ease-out
        1.7s
        forwards;
}


/* ================= OVERLAY ================= */

.hero-overlay {
    position: absolute;
    inset: 0;

    z-index: 1;

    background:
        linear-gradient(
            180deg,
            rgba(0, 0, 0, .08) 0%,
            rgba(0, 0, 0, .12) 40%,
            rgba(0, 0, 0, .65) 100%
        );

    opacity: 0;

    animation:
        heroOverlayReveal
        1.2s
        ease
        .2s
        forwards;
}


/* ================= CONTENT ================= */

.hero-content {
    position: absolute;

    z-index: 2;

    left: 6%;
    bottom: 90px;

    width: min(850px, 85%);

    color: #fff;
}


/* ================= KICKER ================= */

.hero-kicker {
    margin: 0 0 22px;

    font-size: 10px;

    letter-spacing: 6px;

    opacity: 0;

    transform: translateY(20px);

    animation:
        heroFadeUp
        .9s
        cubic-bezier(.16, 1, .3, 1)
        .45s
        forwards;
}


/* ================= TITLE ================= */

.hero-title {
    margin: 0;

color: #fff;

    font-size:
        clamp(
            58px,
            8vw,
            118px
        );

    line-height: .88;

    font-weight: 300;

    letter-spacing: -2px;
}

.hero-line {
    display: block;

    overflow: hidden;

    padding-bottom: 8px;
}

.hero-line > span {
    display: block;

    transform: translateY(120%);

    animation:
        heroTitleReveal
        1.05s
        cubic-bezier(.16, 1, .3, 1)
        forwards;
}

.hero-line:nth-child(1) > span {
    animation-delay: .65s;
}

.hero-line:nth-child(2) > span {
    animation-delay: .78s;
}


/* ================= SUBTITLE ================= */

.hero-subtitle {
    max-width: 500px;

    margin:
        30px 0
        28px;

    color:
        rgba(
            255,
            255,
            255,
            .85
        );

    font-size: 13px;

    line-height: 1.8;

    letter-spacing: 1.5px;

    opacity: 0;

    transform: translateY(20px);

    animation:
        heroFadeUp
        .9s
        cubic-bezier(.16, 1, .3, 1)
        1s
        forwards;
}


/* ================= CTA ================= */

.hero-cta {
    position: relative;

    display: inline-flex;

    align-items: center;

    gap: 15px;

    padding:
        10px 0;

    color: #fff;

    text-decoration: none;

    font-size: 10px;

    letter-spacing: 2.5px;

    opacity: 0;

    transform: translateY(20px);

    animation:
        heroFadeUp
        .9s
        cubic-bezier(.16, 1, .3, 1)
        1.2s
        forwards;
}

.hero-cta::after {
    content: "";

    position: absolute;

    left: 0;
    bottom: 3px;

    width: 100%;
    height: 1px;

    background: #fff;

    transform: scaleX(1);

    transform-origin: left;

    transition:
        transform
        .4s
        cubic-bezier(.16, 1, .3, 1);
}

.hero-cta:hover::after {
    transform: scaleX(0);
}

.hero-arrow {
    display: inline-block;

    font-size: 16px;

    transition:
        transform
        .35s ease;
}

.hero-cta:hover
.hero-arrow {
    transform:
        translateX(7px);
}


/* ================= SCROLL ================= */

.hero-scroll {
    position: absolute;

    z-index: 2;

    right: 35px;
    bottom: 35px;

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 12px;

    color:
        rgba(
            255,
            255,
            255,
            .75
        );

    opacity: 0;

    animation:
        heroFadeIn
        1s
        ease
        1.6s
        forwards;
}

.hero-scroll span {
    width: auto;
    height: auto;

    background: none;

    font-size: 8px;

    letter-spacing: 3px;

    writing-mode:
        vertical-rl;

    transform:
        rotate(180deg);
}

.hero-scroll-line {
    position: relative;

    width: 1px;
    height: 65px;

    overflow: hidden;

    background:
        rgba(
            255,
            255,
            255,
            .25
        );
}

.hero-scroll-line::after {
    content: "";

    position: absolute;

    top: -100%;
    left: 0;

    width: 100%;
    height: 100%;

    background: #fff;

    animation:
        heroScroll
        2s
        ease-in-out
        infinite;
}


/* ================= KEYFRAMES ================= */

@keyframes heroImageReveal {

    from {
        opacity: 0;

        transform:
            scale(1.18);
    }

    to {
        opacity: 1;

        transform:
            scale(1.08);
    }

}


@keyframes heroSlowZoom {

    from {
        transform:
            scale(1.08);
    }

    to {
        transform:
            scale(1);
    }

}


@keyframes heroOverlayReveal {

    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }

}


@keyframes heroTitleReveal {

    from {
        transform:
            translateY(120%);
    }

    to {
        transform:
            translateY(0);
    }

}


@keyframes heroFadeUp {

    from {
        opacity: 0;

        transform:
            translateY(20px);
    }

    to {
        opacity: 1;

        transform:
            translateY(0);
    }

}


@keyframes heroFadeIn {

    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }

}


@keyframes heroScroll {

    0% {
        transform:
            translateY(0);
    }

    50% {
        transform:
            translateY(200%);
    }

    100% {
        transform:
            translateY(200%);
    }

}
                /* =============================================
   SCROLL REVEAL
============================================= */

.reveal-item {
    opacity: 0;

    transform:
        translateY(55px);

    filter:
        blur(4px);

    transition:
        opacity .9s cubic-bezier(.16, 1, .3, 1),
        transform 1s cubic-bezier(.16, 1, .3, 1),
        filter .9s ease;

    transition-delay:
        var(--reveal-delay, 0ms);

    will-change:
        opacity,
        transform;
}

.reveal-item.is-visible {
    opacity: 1;

    transform:
        translateY(0);

    filter:
        blur(0);
}

@media (prefers-reduced-motion: reduce) {

    .reveal-item {
        opacity: 1;

        transform: none;

        filter: none;

        transition: none;
    }

}

                /* =============================================
                   INTRO
                ============================================= */

                .intro {
                    max-width: 1100px;

                    padding:
                        120px 8%;
                }


                .eyebrow {
                    margin:
                        0 0 20px;

                    color: #888;

                    font-size: 9px;

                    letter-spacing: 4px;
                }


                .intro h2 {
                    margin: 0;

                    font-size:
                        clamp(
                            36px,
                            5vw,
                            68px
                        );

                    font-weight: 300;

                    line-height: 1.05;
                }


                .intro-description {
                    max-width: 480px;

                    margin:
                        35px 0 0
                        auto;

                    color: #777;

                    font-size: 13px;

                    line-height: 1.9;
                }


                /* =============================================
                   CATEGORY
                ============================================= */

                .category-showcase {
                    display: grid;

                    grid-template-columns:
                        1.3fr 1fr;

                    min-height: 760px;
                }


                .category-card {
                    position: relative;

                    min-height: 650px;

                    overflow: hidden;

                    background: #111;

                    color: #fff;

                    text-decoration: none;
                }


                .category-card img {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: cover;

    transform: scale(1);

    transition:
        transform
        1.2s
        cubic-bezier(.16, 1, .3, 1);
}

.category-card:hover img {
    transform:
        scale(1.07);
}


               .category-overlay {
    position: absolute;
    inset: 0;

    background:
        linear-gradient(
            to top,
            rgba(0,0,0,.58),
            rgba(0,0,0,.04)
        );

    transition:
        background
        .7s
        ease;
}

.category-card:hover
.category-overlay {
    background:
        linear-gradient(
            to top,
            rgba(0,0,0,.72),
            rgba(0,0,0,.08)
        );
}


              .category-content {
    position: absolute;

    left: 45px;
    right: 45px;
    bottom: 45px;

    z-index: 2;

    transform:
        translateY(0);

    transition:
        transform
        .7s
        cubic-bezier(.16, 1, .3, 1);
}

.category-card:hover
.category-content {
    transform:
        translateY(-12px);
}


                .category-content span {
                    font-size: 8px;

                    letter-spacing: 3px;
                }


                .category-content h3 {
                    margin:
                        12px 0 20px;

                    font-size:
                        clamp(
                            40px,
                            5vw,
                            72px
                        );

                    font-weight: 300;
                }


                .category-content p {
    position: relative;

    display: inline-block;

    margin: 0;

    padding-bottom: 7px;

    font-size: 9px;

    letter-spacing: 2px;
}

.category-content p::after {
    content: "";

    position: absolute;

    left: 0;
    bottom: 0;

    width: 100%;
    height: 1px;

    background: #fff;

    transform:
        scaleX(0);

    transform-origin:
        left;

    transition:
        transform
        .5s
        cubic-bezier(.16, 1, .3, 1);
}

.category-card:hover
.category-content p::after {
    transform:
        scaleX(1);
}

                /* =============================================
                   COLLECTION
                ============================================= */

                .collection {
                    padding:
                        110px 5%;
                }


                .collection-header {
                    display: flex;

                    align-items: flex-end;

                    justify-content:
                        space-between;

                    margin-bottom: 50px;

                    padding-bottom: 28px;

                    border-bottom:
                        1px solid #ddd;
                }


                .small-title {
                    margin:
                        0 0 12px;

                    color: #888;

                    font-size: 9px;

                    letter-spacing: 4px;
                }


                .collection-header h2 {
                    margin: 0;

                    font-size:
                        clamp(
                            28px,
                            3vw,
                            44px
                        );

                    font-weight: 400;

                    letter-spacing: 3px;
                }


                .search-result-label {
                    margin:
                        14px 0 0;

                    color: #777;

                    font-size: 12px;
                }


                .collection-meta {
                    text-align: right;
                }


                .collection-meta span {
                    display: block;

                    font-size: 25px;

                    font-weight: 300;
                }


                .collection-meta p {
                    margin:
                        4px 0 0;

                    color: #888;

                    font-size: 8px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   PRODUCT GRID
                ============================================= */

                .product-grid {
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
                        55px 18px;
                }


                .product-card-wrap {
                    position: relative;

                    min-width: 0;
                }


                .product-card {
                    display: block;

                    color: #111;

                    text-decoration: none;
                }


                /* =============================================
                   WISHLIST HEART
                ============================================= */

                .wishlist-heart {
    position: absolute;

    top: 12px;
    right: 12px;

    z-index: 20;

    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;
    justify-content: center;

    border: 1px solid rgba(255, 255, 255, .5);

    border-radius: 50%;

    background: rgba(255, 255, 255, .82);

    backdrop-filter: blur(10px);

    color: #111;

    cursor: pointer;

    font-size: 20px;

    transition:
        transform .35s cubic-bezier(.16, 1, .3, 1),
        background .35s ease,
        color .35s ease,
        border-color .35s ease;
}


               .wishlist-heart:hover {
    transform:
        scale(1.12);

    background: #111;

    color: #fff;

    border-color: #111;
}

               .wishlist-heart.active {
    background: #111;

    color: #fff;

    border-color: #111;

    transform:
        scale(1);
}


                /* =============================================
                   IMAGE
                ============================================= */

                .product-image {
                    position: relative;

                    width: 100%;

                    aspect-ratio:
                        3 / 4;

                    overflow: hidden;

                    background: #f2f2f2;
                }


              .product-image img {
    width: 100%;
    height: 100%;

    object-fit: cover;

    display: block;

    transform:
        scale(1);

    transition:
        transform
        1.1s
        cubic-bezier(.16, 1, .3, 1);
}

.product-card:hover
.product-image img {
    transform:
        scale(1.065);
}


                .product-number {
                    position: absolute;

                    top: 13px;
                    left: 13px;

                    z-index: 2;

                    padding:
                        6px 8px;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            .9
                        );

                    font-size: 8px;
                }


                .product-hover {
    position: absolute;

    left: 12px;
    right: 12px;
    bottom: 12px;

    padding:
        15px;

    background:
        rgba(
            255,
            255,
            255,
            .96
        );

    backdrop-filter:
        blur(8px);

    text-align: center;

    opacity: 0;

    transform:
        translateY(18px);

    transition:
        opacity
        .45s
        cubic-bezier(.16, 1, .3, 1),

        transform
        .45s
        cubic-bezier(.16, 1, .3, 1);
}
                    

                .product-hover span {
                    font-size: 9px;

                    letter-spacing: 2px;
                }


                .product-card:hover
                .product-hover {
                    opacity: 1;

                    transform:
                        translateY(0);
                }


                /* =============================================
                   PRODUCT INFO
                ============================================= */

                .product-info {
                    padding-top: 15px;
                }


                .product-top {
                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;
                }


                .product-category {
                    margin: 0;

                    color: #999;

                    font-size: 8px;

                    letter-spacing: 2px;

                    text-transform:
                        uppercase;
                }


                .product-top > span {
                    opacity: .4;

                    transition:
                        all .2s ease;
                }


                .product-card:hover
.product-top > span {
    opacity: 1;

    transform:
        translateX(7px);
}


               .product-info h3 {
    margin:
        10px 0 8px;

    font-size: 13px;

    font-weight: 500;

    transition:
        transform
        .35s
        cubic-bezier(.16, 1, .3, 1);
}

.product-card:hover
.product-info h3 {
    transform:
        translateX(4px);
}


                .price {
                    margin: 0;

                    font-size: 12px;
                }


                /* =============================================
                   EMPTY
                ============================================= */

                .empty {
                    padding:
                        100px 20px;

                    text-align: center;
                }


                .empty h3 {
                    margin:
                        0 0 12px;

                    font-size: 28px;

                    font-weight: 400;
                }


                .empty a {
                    display: inline-block;

                    margin-top: 20px;

                    color: #111;

                    font-size: 9px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   BRAND
                ============================================= */

                .brand-section {
                    position: relative;

                    min-height: 700px;

                    padding:
                        90px 8%;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    overflow: hidden;

                    background: #111;

                    color: #fff;
                }


                .brand-number {
                    position: absolute;

                    top: 50px;
                    left: 60px;

                    color: #555;

                    font-size: 110px;

                    font-weight: 200;
                }


                .brand-content {
                    position: relative;

                    z-index: 2;

                    max-width: 750px;

                    text-align: center;
                }


                .brand-content p {
                    margin:
                        0 0 25px;

                    color: #888;

                    font-size: 9px;

                    letter-spacing: 5px;
                }


                .brand-content h2 {
                    margin: 0;

                    color: #fff;

                    font-size:
                        clamp(
                            48px,
                            7vw,
                            92px
                        );

                    line-height: .92;

                    font-weight: 300;
                }


                .brand-content span {
                    display: block;

                    max-width: 450px;

                    margin:
                        40px auto 0;

                    color: #999;

                    font-size: 12px;

                    line-height: 1.9;
                }


                .brand-year {
                    position: absolute;

                    right: 50px;
                    bottom: 40px;

                    color: #666;

                    font-size: 8px;

                    letter-spacing: 3px;
                }


                /* =============================================
                   CTA
                ============================================= */

                .footer-cta {
                    padding:
                        140px 20px;

                    text-align: center;

                    background: #f4f4f1;
                }


                .footer-cta p {
                    margin:
                        0 0 20px;

                    color: #888;

                    font-size: 8px;

                    letter-spacing: 4px;
                }


                .footer-cta h2 {
                    margin: 0;

                    font-size:
                        clamp(
                            42px,
                            6vw,
                            76px
                        );

                    line-height: 1;

                    font-weight: 300;
                }


                .footer-cta a {
                    display: inline-block;

                    margin-top: 40px;

                    padding-bottom: 7px;

                    color: #111;

                    border-bottom:
                        1px solid #111;

                    text-decoration: none;

                    font-size: 9px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   LOADING / ERROR
                ============================================= */

                .loading-page,
                .error-page {
                    min-height:
                        calc(
                            100vh -
                            78px
                        );

                    display: flex;

                    flex-direction: column;

                    align-items: center;

                    justify-content: center;

                    text-align: center;
                }


                .loading-line {
                    width: 80px;
                    height: 1px;

                    margin-bottom: 20px;

                    background: #111;

                    animation:
                        loadingPulse
                        1.2s
                        ease-in-out
                        infinite;
                }


                @keyframes loadingPulse {

                    0%,
                    100% {
                        transform:
                            scaleX(.25);

                        opacity: .35;
                    }

                    50% {
                        transform:
                            scaleX(1);

                        opacity: 1;
                    }

                }


                .loading-page p {
                    font-size: 9px;

                    letter-spacing: 3px;
                }


                .error-page button {
                    margin-top: 20px;

                    padding:
                        11px 20px;

                    border: none;

                    background: #111;

                    color: #fff;

                    cursor: pointer;

                    font-size: 9px;

                    letter-spacing: 2px;
                }


                /* =============================================
                   TABLET
                ============================================= */

                @media (
                    max-width: 1000px
                ) {

                    .product-grid {
                        grid-template-columns:
                            repeat(
                                3,
                                1fr
                            );
                    }


                    .category-showcase {
                        min-height: 600px;
                    }

                }


                /* =============================================
                   MOBILE
                ============================================= */

                @media (
                    max-width: 700px
                ) {

                    .hero {
                        min-height: 620px;
                    }


                   .hero-content {
    left: 20px;
    right: 20px;
    bottom: 60px;

    width: auto;

    text-align: center;
}


                    .hero-content h1 {
                        font-size: 52px;
                    }
.hero-subtitle {
    max-width: 260px;

    margin:
        22px auto
        24px;

    font-size: 10px;

    line-height: 1.7;

    letter-spacing: .7px;
}

                    .hero-scroll {
                        display: none;
                    }


                    .intro {
                        padding:
                            80px 25px;
                    }


                    .category-showcase {
                        grid-template-columns:
                            1fr;
                    }


                    .category-card {
                        min-height: 520px;
                    }


                    .category-content {
                        left: 25px;
                        right: 25px;
                        bottom: 25px;
                    }


                    .collection {
                        padding:
                            75px 18px;
                    }


                    .collection-header {
                        display: block;
                    }


                    .collection-meta {
                        margin-top: 20px;

                        text-align: left;
                    }


                    .product-grid {
                        grid-template-columns:
                            repeat(
                                2,
                                1fr
                            );

                        gap:
                            35px 10px;
                    }


                    .product-hover {
                        display: none;
                    }


                    .wishlist-heart {
                        width: 34px;
                        height: 34px;

                        top: 8px;
                        right: 8px;

                        font-size: 18px;
                    }


                    .brand-section {
                        min-height: 600px;

                        padding:
                            70px 25px;
                    }


                    .brand-number {
                        top: 25px;
                        left: 20px;

                        font-size: 70px;
                    }


                    .footer-cta {
                        padding:
                            100px 20px;
                    }

                }
@media (max-width: 360px) {

    .product-grid {
        grid-template-columns: 1fr;
        gap: 45px;
    }

}
    
            `}</style>

        </div>
    );
}


export default ProductList;