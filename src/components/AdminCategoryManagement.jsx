import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import API from "../services/api";


// ============================================================
// ADMIN CATEGORY MANAGEMENT
// ============================================================

const AdminCategoryManagement = () => {

    const [
        categories,
        setCategories
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
        error,
        setError
    ] = useState("");


    const [
        search,
        setSearch
    ] = useState("");


    const [
        modalOpen,
        setModalOpen
    ] = useState(false);


    const [
        modalMode,
        setModalMode
    ] = useState("create");


    const [
        editingCategory,
        setEditingCategory
    ] = useState(null);


    const [
        categoryName,
        setCategoryName
    ] = useState("");


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState({
        type: "",
        text: "",
    });


    // ========================================================
    // MESSAGE
    // ========================================================

    const showMessage = (
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
    // FETCH CATEGORIES
    // ========================================================

    const fetchCategories =
        async (
            manual = false
        ) => {

            try {

                if (manual) {

                    setRefreshing(true);

                } else {

                    setLoading(true);
                }


                setError("");


                const response =
                    await API.get(
                        "/admin/categories"
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Không thể lấy danh sách danh mục"
                    );
                }


                setCategories(
                    response.data?.data ||
                    []
                );


            } catch (err) {

                console.error(
                    "Lỗi lấy danh mục:",
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể lấy danh sách danh mục"
                );


            } finally {

                setLoading(false);

                setRefreshing(false);
            }
        };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        fetchCategories();

    }, []);


    // ========================================================
    // OPEN CREATE
    // ========================================================

    const handleOpenCreate =
        () => {

            setModalMode(
                "create"
            );


            setEditingCategory(
                null
            );


            setCategoryName(
                ""
            );


            setModalOpen(
                true
            );
        };


    // ========================================================
    // OPEN EDIT
    // ========================================================

    const handleOpenEdit =
        (category) => {

            setModalMode(
                "edit"
            );


            setEditingCategory(
                category
            );


            setCategoryName(
                category.name ||
                ""
            );


            setModalOpen(
                true
            );
        };


    // ========================================================
    // CLOSE MODAL
    // ========================================================

    const handleCloseModal =
        () => {

            if (saving) {
                return;
            }


            setModalOpen(
                false
            );


            setEditingCategory(
                null
            );


            setCategoryName(
                ""
            );
        };


    // ========================================================
    // SAVE CATEGORY
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            const name =
                categoryName.trim();


            if (!name) {

                showMessage(
                    "error",
                    "Tên danh mục không được để trống."
                );

                return;
            }


            try {

                setSaving(true);


                // ================= CREATE =================

                if (
                    modalMode ===
                    "create"
                ) {

                    const response =
                        await API.post(
                            "/admin/categories",
                            {
                                name,
                            }
                        );


                    if (
                        !response.data
                            ?.success
                    ) {

                        throw new Error(
                            response.data
                                ?.message ||
                            "Thêm danh mục thất bại"
                        );
                    }


                    showMessage(
                        "success",
                        "Thêm danh mục thành công!"
                    );
                }


                // ================= EDIT =================

                else {

                    const response =
                        await API.put(
                            `/admin/categories/${editingCategory.id}`,
                            {
                                name,
                            }
                        );


                    if (
                        !response.data
                            ?.success
                    ) {

                        throw new Error(
                            response.data
                                ?.message ||
                            "Cập nhật danh mục thất bại"
                        );
                    }


                    showMessage(
                        "success",
                        "Cập nhật danh mục thành công!"
                    );
                }


                setModalOpen(
                    false
                );


                setEditingCategory(
                    null
                );


                setCategoryName(
                    ""
                );


                await fetchCategories();


            } catch (err) {

                console.error(
                    "Lỗi lưu danh mục:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể lưu danh mục"
                );


            } finally {

                setSaving(false);
            }
        };


    // ========================================================
    // DELETE CATEGORY
    // ========================================================

    const handleDeleteCategory =
        async (
            category
        ) => {

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa danh mục:\n\n${category.name}?`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                const response =
                    await API.delete(
                        `/admin/categories/${category.id}`
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Xóa danh mục thất bại"
                    );
                }


                showMessage(
                    "success",

                    response.data?.message ||
                    "Xóa danh mục thành công!"
                );


                await fetchCategories();


            } catch (err) {

                console.error(
                    "Lỗi xóa danh mục:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể xóa danh mục"
                );
            }
        };


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate =
        (value) => {

            if (!value) {

                return "-";
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
    // FILTER
    // ========================================================

    const filteredCategories =
        useMemo(
            () => {

                const keyword =
                    search
                        .trim()
                        .toLowerCase();


                if (!keyword) {

                    return categories;
                }


                return categories.filter(
                    (category) => {

                        const searchable =
                            [
                                category.id,
                                category.name,
                                category.slug,
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        return searchable.includes(
                            keyword
                        );
                    }
                );
            },
            [
                categories,
                search,
            ]
        );


    // ========================================================
    // SUMMARY
    // ========================================================

    const summary =
        useMemo(
            () => {

                const totalProducts =
                    categories.reduce(
                        (
                            total,
                            category
                        ) =>
                            total +
                            Number(
                                category.product_count ||
                                0
                            ),
                        0
                    );


                const usedCategories =
                    categories.filter(
                        (category) =>
                            Number(
                                category.product_count ||
                                0
                            ) > 0
                    ).length;


                const emptyCategories =
                    categories.length -
                    usedCategories;


                return {

                    total:
                        categories.length,

                    used:
                        usedCategories,

                    empty:
                        emptyCategories,

                    products:
                        totalProducts,
                };
            },
            [categories]
        );


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="categories-loading">

                <div className="categories-loading-line">
                </div>

                <p>
                    ĐANG TẢI DANH MỤC
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

        <div className="admin-categories-page">


            {/* =================================================
                TOP
            ================================================= */}

            <section className="categories-top">


                <div>

                    <p className="categories-eyebrow">
                        CATEGORIES / MANAGEMENT
                    </p>


                    <h1>
                        DANH MỤC
                    </h1>


                    <p className="categories-description">
                        Quản lý nhóm sản phẩm và tổ chức cấu trúc
                        danh mục của cửa hàng.
                    </p>

                </div>


                <div className="categories-actions">


                    <button
                        type="button"
                        className="categories-refresh"
                        disabled={
                            refreshing
                        }
                        onClick={() =>
                            fetchCategories(
                                true
                            )
                        }
                    >

                        <span>
                            ↻
                        </span>

                        {refreshing
                            ? "ĐANG TẢI..."
                            : "LÀM MỚI"}

                    </button>


                    <button
                        type="button"
                        className="categories-add"
                        onClick={
                            handleOpenCreate
                        }
                    >

                        <span>
                            +
                        </span>

                        THÊM DANH MỤC

                    </button>


                </div>


            </section>


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message.text && (

                <div
                    className={
                        `categories-message ${message.type}`
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
                ERROR
            ================================================= */}

            {error && (

                <div className="categories-message error">

                    <span>
                        !
                    </span>

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="categories-summary">


                <div>

                    <span>
                        01
                    </span>

                    <p>
                        TỔNG DANH MỤC
                    </p>

                    <strong>
                        {summary.total}
                    </strong>

                </div>


                <div>

                    <span>
                        02
                    </span>

                    <p>
                        ĐANG SỬ DỤNG
                    </p>

                    <strong>
                        {summary.used}
                    </strong>

                </div>


                <div>

                    <span>
                        03
                    </span>

                    <p>
                        DANH MỤC TRỐNG
                    </p>

                    <strong>
                        {summary.empty}
                    </strong>

                </div>


                <div>

                    <span>
                        04
                    </span>

                    <p>
                        SẢN PHẨM
                    </p>

                    <strong>
                        {summary.products}
                    </strong>

                </div>


            </section>


            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="categories-toolbar">


                <div className="categories-search">

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
                        placeholder="Tìm tên danh mục, slug hoặc ID..."
                    />

                </div>


            </section>


            <div className="categories-result">

                <span>
                    KẾT QUẢ
                </span>

                <strong>
                    {filteredCategories.length}
                </strong>

                <span>
                    / {categories.length} DANH MỤC
                </span>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {!error &&
            filteredCategories.length ===
                0 ? (

                <section className="categories-empty">

                    <span>
                        BOUTIQUE.
                    </span>


                    <h2>
                        KHÔNG CÓ
                        <br />
                        DANH MỤC.
                    </h2>


                    <p>
                        Không tìm thấy danh mục phù hợp.
                    </p>

                </section>

            ) : (

                // =================================================
                // CATEGORY LIST
                // =================================================

                <section className="categories-list">


                    {filteredCategories.map(
                        (
                            category,
                            index
                        ) => {

                            const productCount =
                                Number(
                                    category.product_count ||
                                    0
                                );


                            return (

                                <article
                                    className="category-card"
                                    key={
                                        category.id
                                    }
                                >


                                    {/* NUMBER */}

                                    <div className="category-index">

                                        <span>
                                            {
                                                String(
                                                    index +
                                                    1
                                                )
                                                    .padStart(
                                                        2,
                                                        "0"
                                                    )
                                            }
                                        </span>

                                    </div>


                                    {/* INFO */}

                                    <div className="category-main">

                                        <p>
                                            CATEGORY /
                                            {
                                                String(
                                                    category.id
                                                )
                                                    .padStart(
                                                        4,
                                                        "0"
                                                    )
                                            }
                                        </p>


                                        <h2>
                                            {
                                                category.name
                                            }
                                        </h2>


                                        <span>
                                            /{
                                                category.slug ||
                                                "no-slug"
                                            }
                                        </span>

                                    </div>


                                    {/* PRODUCTS */}

                                    <div className="category-stat">

                                        <p>
                                            SẢN PHẨM
                                        </p>


                                        <strong
                                            className={
                                                productCount ===
                                                0
                                                    ? "empty-count"
                                                    : ""
                                            }
                                        >
                                            {
                                                productCount
                                            }
                                        </strong>


                                        <span>
                                            SẢN PHẨM
                                        </span>

                                    </div>


                                    {/* CREATED */}

                                    <div className="category-created">

                                        <p>
                                            NGÀY TẠO
                                        </p>


                                        <span>
                                            {
                                                formatDate(
                                                    category.created_at
                                                )
                                            }
                                        </span>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="category-actions">

                                        <button
                                            type="button"
                                            className="edit"
                                            onClick={() =>
                                                handleOpenEdit(
                                                    category
                                                )
                                            }
                                        >
                                            SỬA
                                        </button>


                                        <button
                                            type="button"
                                            className="delete"
                                            onClick={() =>
                                                handleDeleteCategory(
                                                    category
                                                )
                                            }
                                        >
                                            XÓA
                                        </button>

                                    </div>


                                </article>

                            );
                        }
                    )}


                </section>

            )}


            {/* =================================================
                MODAL
            ================================================= */}

            {modalOpen && (

                <div
                    className="category-modal-overlay"
                    onMouseDown={
                        (event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                handleCloseModal();
                            }
                        }
                    }
                >


                    <div className="category-modal">


                        {/* HEADER */}

                        <div className="category-modal-header">


                            <div>

                                <p>
                                    CATEGORY EDITOR
                                </p>


                                <h2>
                                    {modalMode ===
                                    "create"
                                        ? "THÊM DANH MỤC"
                                        : "SỬA DANH MỤC"}
                                </h2>


                                <span>
                                    {modalMode ===
                                    "create"
                                        ? "Tạo nhóm sản phẩm mới cho BOUTIQUE."
                                        : `Đang chỉnh sửa danh mục #${editingCategory?.id}`}
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                            >
                                ×
                            </button>


                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >


                            <div className="category-field">

                                <label>
                                    TÊN DANH MỤC *
                                </label>


                                <input
                                    type="text"
                                    autoFocus
                                    value={
                                        categoryName
                                    }
                                    onChange={
                                        (event) =>
                                            setCategoryName(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Ví dụ: Áo Nam"
                                    disabled={
                                        saving
                                    }
                                />


                                <small>
                                    Slug sẽ được hệ thống tạo tự động từ tên danh mục.
                                </small>

                            </div>


                            <div className="category-modal-actions">


                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    HỦY
                                </button>


                                <button
                                    type="submit"
                                    className="save"
                                    disabled={
                                        saving
                                    }
                                >

                                    <span>
                                        {saving
                                            ? "ĐANG LƯU..."
                                            : modalMode ===
                                              "create"
                                                ? "THÊM DANH MỤC"
                                                : "LƯU THAY ĐỔI"}
                                    </span>


                                    {!saving && (
                                        <span>
                                            →
                                        </span>
                                    )}

                                </button>


                            </div>


                        </form>


                    </div>


                </div>

            )}


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

    .admin-categories-page {
        width: 100%;

        max-width: 1450px;

        margin: 0 auto;

        color: #111;
    }


    /* ========================================================
       TOP
    ======================================================== */

    .categories-top {
        margin-bottom: 35px;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 30px;
    }


    .categories-eyebrow {
        margin:
            0 0 12px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .categories-top h1 {
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


    .categories-description {
        margin:
            14px 0 0;

        color: #888;

        font-size: 11px;

        line-height: 1.7;
    }


    .categories-actions {
        display: flex;

        gap: 8px;
    }


    .categories-actions button {
        min-height: 43px;

        padding:
            0 16px;

        border:
            1px solid #111;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1.5px;
    }


    .categories-refresh {
        background: #fff;

        color: #111;
    }


    .categories-add {
        display: flex;

        align-items: center;

        gap: 8px;

        background: #111;

        color: #fff;
    }


    .categories-add:hover {
        background: #fff;

        color: #111;
    }


    /* ========================================================
       MESSAGE
    ======================================================== */

    .categories-message {
        margin-bottom: 25px;

        padding:
            14px 17px;

        display: flex;

        align-items: center;

        gap: 12px;

        border:
            1px solid #ddd;

        font-size: 10px;
    }


    .categories-message > span {
        width: 25px;
        height: 25px;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        border:
            1px solid currentColor;

        border-radius: 50%;
    }


    .categories-message p {
        margin: 0;
    }


    .categories-message.success {
        border-color: #c7ddca;

        background: #f4faf5;

        color: #286332;
    }


    .categories-message.error {
        border-color: #e2c5c1;

        background: #fff7f6;

        color: #8b3025;
    }


    /* ========================================================
       SUMMARY
    ======================================================== */

    .categories-summary {
        display: grid;

        grid-template-columns:
            repeat(
                4,
                1fr
            );

        border-top:
            1px solid #111;

        border-bottom:
            1px solid #ddd;
    }


    .categories-summary > div {
        min-height: 130px;

        padding: 20px;

        border-right:
            1px solid #ddd;
    }


    .categories-summary > div:last-child {
        border-right: none;
    }


    .categories-summary > div > span {
        color: #bbb;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .categories-summary p {
        margin:
            15px 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .categories-summary strong {
        font-size: 28px;

        font-weight: 300;
    }


    /* ========================================================
       TOOLBAR
    ======================================================== */

    .categories-toolbar {
        margin-top: 30px;
    }


    .categories-search {
        min-height: 45px;

        padding:
            0 15px;

        display: flex;

        align-items: center;

        gap: 10px;

        border:
            1px solid #ddd;

        background: #fff;
    }


    .categories-search svg {
        width: 17px;
        height: 17px;

        flex-shrink: 0;

        stroke-linecap: round;

        stroke-linejoin: round;
    }


    .categories-search input {
        width: 100%;

        border: none;

        outline: none;

        background: transparent;

        font-size: 10px;
    }


    .categories-result {
        margin:
            18px 0;

        display: flex;

        align-items: center;

        gap: 6px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .categories-result strong {
        color: #111;

        font-size: 10px;
    }


    /* ========================================================
       LIST
    ======================================================== */

    .categories-list {
        display: flex;

        flex-direction: column;

        border-top:
            1px solid #111;
    }


    .category-card {
        min-height: 115px;

        display: grid;

        grid-template-columns:
            70px
            minmax(
                240px,
                1.5fr
            )
            .6fr
            1fr
            auto;

        align-items: center;

        gap: 25px;

        padding:
            17px 20px;

        border-bottom:
            1px solid #ddd;

        background: #fff;

        transition:
            all .2s ease;
    }


    .category-card:hover {
        padding-left: 25px;

        background: #fafafa;
    }


    .category-index span {
        color: #bbb;

        font-size: 8px;

        letter-spacing: 2px;
    }


    .category-main {
        min-width: 0;
    }


    .category-main p {
        margin:
            0 0 8px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .category-main h2 {
        margin:
            0 0 8px;

        overflow: hidden;

        font-size: 18px;

        font-weight: 400;

        text-overflow:
            ellipsis;

        white-space: nowrap;
    }


    .category-main > span {
        color: #999;

        font-family:
            monospace;

        font-size: 9px;
    }


    .category-stat p,
    .category-created p {
        margin:
            0 0 9px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .category-stat strong {
        display: block;

        font-size: 23px;

        font-weight: 300;
    }


    .category-stat strong.empty-count {
        color: #aaa;
    }


    .category-stat > span {
        display: block;

        margin-top: 4px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 1px;
    }


    .category-created > span {
        color: #777;

        font-size: 9px;
    }


    /* ========================================================
       ACTIONS
    ======================================================== */

    .category-actions {
        display: flex;

        gap: 7px;
    }


    .category-actions button {
        min-width: 58px;
        height: 35px;

        border:
            1px solid #bbb;

        background: #fff;

        cursor: pointer;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .category-actions .edit {
        border-color: #111;

        background: #111;

        color: #fff;
    }


    .category-actions .delete {
        border-color: #d7aaa5;

        color: #92372e;
    }


    /* ========================================================
       EMPTY
    ======================================================== */

    .categories-empty {
        min-height: 350px;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        border:
            1px solid #ddd;

        background: #fff;

        text-align: center;
    }


    .categories-empty > span {
        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .categories-empty h2 {
        margin:
            18px 0 12px;

        font-size: 37px;

        font-weight: 300;

        line-height: .95;
    }


    .categories-empty p {
        color: #999;

        font-size: 9px;
    }


    /* ========================================================
       MODAL
    ======================================================== */

    .category-modal-overlay {
        position: fixed;

        inset: 0;

        z-index: 9999;

        padding: 20px;

        display: flex;

        align-items: center;

        justify-content: center;

        background:
            rgba(
                0,
                0,
                0,
                .48
            );
    }


    .category-modal {
        width: 100%;

        max-width: 560px;

        padding: 30px;

        background: #fff;
    }


    .category-modal-header {
        margin-bottom: 28px;

        padding-bottom: 20px;

        display: flex;

        align-items: flex-start;

        justify-content: space-between;

        gap: 20px;

        border-bottom:
            1px solid #111;
    }


    .category-modal-header p {
        margin:
            0 0 8px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 3px;
    }


    .category-modal-header h2 {
        margin: 0;

        font-size: 27px;

        font-weight: 300;
    }


    .category-modal-header span {
        display: block;

        margin-top: 8px;

        color: #999;

        font-size: 9px;
    }


    .category-modal-header > button {
        border: none;

        background: transparent;

        cursor: pointer;

        font-size: 28px;
    }


    /* ========================================================
       FORM
    ======================================================== */

    .category-field label {
        display: block;

        margin-bottom: 8px;

        color: #666;

        font-size: 7px;

        font-weight: 600;

        letter-spacing: 1.5px;
    }


    .category-field input {
        width: 100%;
        height: 46px;

        padding:
            0 13px;

        border:
            1px solid #bbb;

        outline: none;

        font-size: 11px;
    }


    .category-field input:focus {
        border-color: #111;
    }


    .category-field small {
        display: block;

        margin-top: 8px;

        color: #aaa;

        font-size: 8px;

        line-height: 1.5;
    }


    /* ========================================================
       MODAL ACTIONS
    ======================================================== */

    .category-modal-actions {
        margin-top: 30px;

        display: flex;

        justify-content: flex-end;

        gap: 8px;
    }


    .category-modal-actions button {
        min-height: 44px;

        padding:
            0 18px;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1px;
    }


    .category-modal-actions .cancel {
        border:
            1px solid #bbb;

        background: #fff;

        color: #111;
    }


    .category-modal-actions .save {
        min-width: 170px;

        display: flex;

        align-items: center;

        justify-content: space-between;

        border:
            1px solid #111;

        background: #111;

        color: #fff;
    }


    .category-modal-actions button:disabled {
        opacity: .5;

        cursor: not-allowed;
    }


    /* ========================================================
       LOADING
    ======================================================== */

    .categories-loading {
        min-height: 55vh;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;
    }


    .categories-loading p {
        color: #999;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .categories-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            categoryLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes categoryLoading {

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
        max-width: 1000px
    ) {

        .category-card {
            grid-template-columns:
                55px
                1.5fr
                .6fr
                auto;
        }


        .category-created {
            grid-column:
                2 / 4;
        }

    }


    @media (
        max-width: 700px
    ) {

        .categories-top {
            align-items:
                flex-start;

            flex-direction:
                column;
        }


        .categories-actions {
            width: 100%;
        }


        .categories-actions button {
            flex: 1;
        }


        .categories-summary {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .category-card {
            grid-template-columns:
                45px
                1fr;
        }


        .category-stat,
        .category-created,
        .category-actions {
            grid-column:
                2;
        }


        .category-actions {
            justify-content:
                flex-start;
        }

    }


    @media (
        max-width: 500px
    ) {

        .category-modal {
            padding: 20px;
        }


        .category-modal-actions {
            flex-direction:
                column;
        }


        .category-modal-actions button {
            width: 100%;
        }

    }

`;


export default AdminCategoryManagement;