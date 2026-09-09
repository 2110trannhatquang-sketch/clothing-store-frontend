import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import API from "../services/api";


// ============================================================
// EMPTY FORM
// ============================================================

const createEmptyForm = () => ({
    id: null,

    name: "",

    category_id: "",

    description: "",

    price: "",

    status: "active",

    image_url: "",

    variants: [
        {
            size: "M",

            color: "Đen",

            stock_quantity: 0,

            price_override: "",

            sku: "",
        },
    ],
});


// ============================================================
// ADMIN PRODUCT MANAGEMENT
// ============================================================

const AdminProductManagement = () => {

    const [
        products,
        setProducts
    ] = useState([]);


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
        saving,
        setSaving
    ] = useState(false);


    const [
        showForm,
        setShowForm
    ] = useState(false);


    const [
        formMode,
        setFormMode
    ] = useState("create");


    const [
        form,
        setForm
    ] = useState(
        createEmptyForm()
    );


    const [
        expandedProductId,
        setExpandedProductId
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
    // LOAD PRODUCTS
    // ========================================================

    const fetchProducts = async (
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
                    "/admin/products"
                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Không thể lấy danh sách sản phẩm"
                );
            }


            setProducts(
                response.data?.data ||
                []
            );


        } catch (err) {

            console.error(
                "Lỗi lấy sản phẩm:",
                err
            );


            setError(
                err.response
                    ?.data
                    ?.message ||
                err.message ||
                "Không thể lấy danh sách sản phẩm"
            );


        } finally {

            setLoading(false);

            setRefreshing(false);
        }
    };


    // ========================================================
    // LOAD CATEGORIES
    // ========================================================

    const fetchCategories =
        async () => {

            try {

                const response =
                    await API.get(
                        "/admin/categories"
                    );


                if (
                    !response.data?.success
                ) {

                    return;
                }


                const rawCategories =
                    response.data?.data ||
                    response.data?.categories ||
                    [];


                const normalized =
                    rawCategories.map(
                        (category) => ({

                            id:
                                category.id ??
                                category.category_id,

                            name:
                                category.name ??
                                category.category_name,
                        })
                    );


                setCategories(
                    normalized.filter(
                        (category) =>
                            category.id &&
                            category.name
                    )
                );


            } catch (err) {

                console.warn(
                    "Không thể tải danh mục riêng:",
                    err
                );
            }
        };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        fetchProducts();

        fetchCategories();

    }, []);


    // ========================================================
    // GROUP PRODUCTS
    // ========================================================

    const groupedProducts =
        useMemo(
            () => {

                const map =
                    new Map();


                products.forEach(
                    (item) => {

                        if (
                            !map.has(
                                item.product_id
                            )
                        ) {

                            map.set(
                                item.product_id,
                                {
                                    product_id:
                                        item.product_id,

                                    product_name:
                                        item.product_name,

                                    category_id:
                                        item.category_id,

                                    category_name:
                                        item.category_name,

                                    description:
                                        item.description,

                                    price:
                                        item.price,

                                    base_price:
                                        item.base_price,

                                    status:
                                        item.status,

                                    is_active:
                                        item.is_active,

                                    image_url:
                                        item.image_url,

                                    variants: [],
                                }
                            );
                        }


                        if (
                            item.variant_id
                        ) {

                            map.get(
                                item.product_id
                            )
                                .variants
                                .push({
                                    variant_id:
                                        item.variant_id,

                                    size:
                                        item.size,

                                    color:
                                        item.color,

                                    stock_quantity:
                                        item.stock_quantity,

                                    price_override:
                                        item.price_override,

                                    sku:
                                        item.sku,
                                });
                        }
                    }
                );


                return Array.from(
                    map.values()
                );
            },
            [products]
        );


    // ========================================================
    // FALLBACK CATEGORIES
    // ========================================================

    const fallbackCategories =
        useMemo(
            () => {

                const map =
                    new Map();


                products.forEach(
                    (item) => {

                        if (
                            item.category_id &&
                            item.category_name
                        ) {

                            map.set(
                                item.category_id,
                                item.category_name
                            );
                        }
                    }
                );


                return Array.from(
                    map.entries()
                ).map(
                    ([id, name]) => ({
                        id,
                        name,
                    })
                );
            },
            [products]
        );


    const categoryOptions =
        categories.length > 0
            ? categories
            : fallbackCategories;


    // ========================================================
    // TOTAL STOCK
    // ========================================================

    const getTotalStock =
        (product) => {

            return product
                .variants
                .reduce(
                    (
                        total,
                        variant
                    ) =>
                        total +
                        Number(
                            variant
                                .stock_quantity ||
                            0
                        ),
                    0
                );
        };


    // ========================================================
    // FILTER PRODUCTS
    // ========================================================

    const filteredProducts =
        useMemo(
            () => {

                const keyword =
                    search
                        .trim()
                        .toLowerCase();


                return groupedProducts.filter(
                    (product) => {

                        const matchesStatus =
                            statusFilter ===
                                "all" ||
                            product.status ===
                                statusFilter;


                        const searchable =
                            [
                                product.product_id,
                                product.product_name,
                                product.category_name,
                                product.description,
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        const matchesSearch =
                            !keyword ||
                            searchable.includes(
                                keyword
                            );


                        return (
                            matchesStatus &&
                            matchesSearch
                        );
                    }
                );
            },
            [
                groupedProducts,
                search,
                statusFilter,
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
                        groupedProducts.length,

                    active:
                        groupedProducts.filter(
                            (product) =>
                                product.status ===
                                "active"
                        ).length,

                    inactive:
                        groupedProducts.filter(
                            (product) =>
                                product.status ===
                                "inactive"
                        ).length,

                    stock:
                        groupedProducts.reduce(
                            (
                                total,
                                product
                            ) =>
                                total +
                                getTotalStock(
                                    product
                                ),
                            0
                        ),
                };
            },
            [groupedProducts]
        );


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
    // OPEN CREATE
    // ========================================================

    const handleOpenCreate =
        () => {

            setFormMode(
                "create"
            );


            setForm(
                createEmptyForm()
            );


            setShowForm(
                true
            );
        };


    // ========================================================
    // OPEN EDIT
    // ========================================================

    const handleOpenEdit =
        async (
            productId
        ) => {

            try {

                setSaving(true);


                const response =
                    await API.get(
                        `/admin/products/${productId}`
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Không thể lấy sản phẩm"
                    );
                }


                const product =
                    response.data.data;


                setFormMode(
                    "edit"
                );


                setForm({
                    id:
                        product.id,

                    name:
                        product.name ||
                        "",

                    category_id:
                        product.category_id ||
                        "",

                    description:
                        product.description ||
                        "",

                    price:
                        product.price ??
                        product.base_price ??
                        "",

                    status:
                        product.status ||
                        "active",

                    image_url:
                        product.image_url ||
                        "",

                    variants:
                        product.variants ||
                        [],
                });


                setShowForm(
                    true
                );


            } catch (err) {

                console.error(
                    "Lỗi lấy sản phẩm:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể lấy thông tin sản phẩm"
                );


            } finally {

                setSaving(false);
            }
        };


    // ========================================================
    // CLOSE FORM
    // ========================================================

    const handleCloseForm =
        () => {

            if (saving) {
                return;
            }


            setShowForm(
                false
            );


            setForm(
                createEmptyForm()
            );
        };


    // ========================================================
    // CHANGE FORM
    // ========================================================

    const handleChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setForm(
                (current) => ({
                    ...current,

                    [name]:
                        value,
                })
            );
        };


    // ========================================================
    // VARIANT CHANGE
    // ========================================================

    const handleVariantChange =
        (
            index,
            field,
            value
        ) => {

            setForm(
                (current) => {

                    const variants =
                        [
                            ...current.variants,
                        ];


                    variants[index] = {
                        ...variants[index],

                        [field]:
                            value,
                    };


                    return {
                        ...current,

                        variants,
                    };
                }
            );
        };


    // ========================================================
    // ADD VARIANT ROW
    // ========================================================

    const handleAddVariant =
        () => {

            setForm(
                (current) => ({
                    ...current,

                    variants: [
                        ...current.variants,

                        {
                            size: "",

                            color: "",

                            stock_quantity:
                                0,

                            price_override:
                                "",

                            sku: "",
                        },
                    ],
                })
            );
        };


    // ========================================================
    // REMOVE VARIANT ROW
    // ========================================================

    const handleRemoveVariant =
        (index) => {

            setForm(
                (current) => {

                    const variants =
                        current.variants
                            .filter(
                                (_, i) =>
                                    i !==
                                    index
                            );


                    return {
                        ...current,

                        variants:
                            variants.length >
                            0
                                ? variants
                                : [
                                    {
                                        size:
                                            "",

                                        color:
                                            "",

                                        stock_quantity:
                                            0,

                                        price_override:
                                            "",

                                        sku:
                                            "",
                                    },
                                ],
                    };
                }
            );
        };


    // ========================================================
    // SAVE PRODUCT
    // ========================================================

    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !form.name.trim()
            ) {

                showMessage(
                    "error",
                    "Vui lòng nhập tên sản phẩm."
                );

                return;
            }


            const price =
                Number(
                    form.price
                );


            if (
                Number.isNaN(
                    price
                ) ||
                price < 0
            ) {

                showMessage(
                    "error",
                    "Giá sản phẩm không hợp lệ."
                );

                return;
            }


            try {

                setSaving(true);


                const payload = {

                    name:
                        form.name.trim(),

                    category_id:
                        form.category_id
                            ? Number(
                                form.category_id
                            )
                            : null,

                    description:
                        form.description,

                    price,

                    status:
                        form.status,

                    image_url:
                        form.image_url.trim(),
                };


                // CREATE

                if (
                    formMode ===
                    "create"
                ) {

                    payload.variants =
                        form.variants.map(
                            (variant) => ({

                                size:
                                    String(
                                        variant.size ||
                                        ""
                                    ).trim(),

                                color:
                                    String(
                                        variant.color ||
                                        ""
                                    ).trim(),

                                stock_quantity:
                                    Number(
                                        variant.stock_quantity ||
                                        0
                                    ),

                                price_override:
                                    variant.price_override ===
                                    ""
                                        ? null
                                        : Number(
                                            variant.price_override
                                        ),

                                sku:
                                    String(
                                        variant.sku ||
                                        ""
                                    ).trim(),
                            })
                        );


                    const response =
                        await API.post(
                            "/admin/products",
                            payload
                        );


                    if (
                        !response.data
                            ?.success
                    ) {

                        throw new Error(
                            response.data
                                ?.message ||
                            "Thêm sản phẩm thất bại"
                        );
                    }


                    showMessage(
                        "success",
                        "Thêm sản phẩm thành công!"
                    );
                }


                // EDIT

                else {

                    const response =
                        await API.put(
                            `/admin/products/${form.id}`,
                            payload
                        );


                    if (
                        !response.data
                            ?.success
                    ) {

                        throw new Error(
                            response.data
                                ?.message ||
                            "Cập nhật sản phẩm thất bại"
                        );
                    }


                    showMessage(
                        "success",
                        "Cập nhật sản phẩm thành công!"
                    );
                }


                setShowForm(
                    false
                );


                setForm(
                    createEmptyForm()
                );


                await fetchProducts();


            } catch (err) {

                console.error(
                    "Lỗi lưu sản phẩm:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể lưu sản phẩm"
                );


            } finally {

                setSaving(false);
            }
        };


    // ========================================================
    // DELETE PRODUCT
    // ========================================================

    const handleDeleteProduct =
        async (
            product
        ) => {

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa sản phẩm:\n\n${product.product_name}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await API.delete(
                        `/admin/products/${product.product_id}`
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Xóa sản phẩm thất bại"
                    );
                }


                showMessage(
                    "success",

                    response.data
                        ?.message ||
                    "Xóa sản phẩm thành công."
                );


                await fetchProducts();


            } catch (err) {

                console.error(
                    "Lỗi xóa sản phẩm:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể xóa sản phẩm"
                );
            }
        };


    // ========================================================
    // UPDATE STOCK
    // ========================================================

    const handleUpdateStock =
        async (
            variantId,
            currentStock
        ) => {

            const input =
                window.prompt(
                    "Nhập số lượng tồn kho mới:",
                    currentStock ?? 0
                );


            if (
                input === null
            ) {

                return;
            }


            const stock =
                Number(
                    input
                );


            if (
                !Number.isInteger(
                    stock
                ) ||
                stock < 0
            ) {

                showMessage(
                    "error",
                    "Tồn kho phải là số nguyên >= 0."
                );

                return;
            }


            try {

                const response =
                    await API.put(
                        `/admin/products/variant/${variantId}/stock`,
                        {
                            stock_quantity:
                                stock,
                        }
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Cập nhật tồn kho thất bại"
                    );
                }


                showMessage(
                    "success",
                    "Cập nhật tồn kho thành công!"
                );


                await fetchProducts();


            } catch (err) {

                console.error(
                    "Lỗi cập nhật tồn kho:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Cập nhật tồn kho thất bại"
                );
            }
        };


    // ========================================================
    // CREATE VARIANT
    // ========================================================

    const handleCreateVariant =
        async (
            productId
        ) => {

            const size =
                window.prompt(
                    "Nhập Size:",
                    "M"
                );


            if (
                size === null
            ) {
                return;
            }


            const color =
                window.prompt(
                    "Nhập màu:",
                    "Đen"
                );


            if (
                color === null
            ) {
                return;
            }


            const stockInput =
                window.prompt(
                    "Nhập tồn kho:",
                    "0"
                );


            if (
                stockInput ===
                null
            ) {
                return;
            }


            const stock =
                Number(
                    stockInput
                );


            if (
                !Number.isInteger(
                    stock
                ) ||
                stock < 0
            ) {

                showMessage(
                    "error",
                    "Tồn kho phải là số nguyên >= 0."
                );

                return;
            }


            const priceInput =
                window.prompt(
                    "Nhập giá riêng của biến thể.\nĐể trống nếu dùng giá sản phẩm:",
                    ""
                );


            if (
                priceInput ===
                null
            ) {
                return;
            }


            let priceOverride =
                null;


            if (
                priceInput.trim() !==
                ""
            ) {

                priceOverride =
                    Number(
                        priceInput
                    );


                if (
                    Number.isNaN(
                        priceOverride
                    ) ||
                    priceOverride < 0
                ) {

                    showMessage(
                        "error",
                        "Giá riêng không hợp lệ."
                    );

                    return;
                }
            }


            const sku =
                window.prompt(
                    "Nhập SKU:",
                    ""
                );


            if (
                sku === null
            ) {
                return;
            }


            try {

                const response =
                    await API.post(
                        `/admin/products/${productId}/variants`,
                        {
                            size:
                                size.trim(),

                            color:
                                color.trim(),

                            stock_quantity:
                                stock,

                            price_override:
                                priceOverride,

                            sku:
                                sku.trim(),
                        }
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Thêm biến thể thất bại"
                    );
                }


                showMessage(
                    "success",
                    "Thêm biến thể thành công!"
                );


                setExpandedProductId(
                    productId
                );


                await fetchProducts();


            } catch (err) {

                console.error(
                    "Lỗi thêm biến thể:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể thêm biến thể"
                );
            }
        };


    // ========================================================
    // EDIT VARIANT
    // ========================================================

    const handleEditVariant =
        async (
            productId,
            variant
        ) => {

            const size =
                window.prompt(
                    "Size:",
                    variant.size ||
                    ""
                );


            if (
                size === null
            ) {
                return;
            }


            const color =
                window.prompt(
                    "Màu:",
                    variant.color ||
                    ""
                );


            if (
                color === null
            ) {
                return;
            }


            const stockInput =
                window.prompt(
                    "Tồn kho:",
                    variant.stock_quantity ??
                    0
                );


            if (
                stockInput ===
                null
            ) {
                return;
            }


            const stock =
                Number(
                    stockInput
                );


            if (
                !Number.isInteger(
                    stock
                ) ||
                stock < 0
            ) {

                showMessage(
                    "error",
                    "Tồn kho phải là số nguyên >= 0."
                );

                return;
            }


            const priceInput =
                window.prompt(
                    "Giá riêng.\nĐể trống nếu dùng giá sản phẩm:",
                    variant.price_override ??
                    ""
                );


            if (
                priceInput ===
                null
            ) {
                return;
            }


            let priceOverride =
                null;


            if (
                String(
                    priceInput
                ).trim() !==
                ""
            ) {

                priceOverride =
                    Number(
                        priceInput
                    );


                if (
                    Number.isNaN(
                        priceOverride
                    ) ||
                    priceOverride < 0
                ) {

                    showMessage(
                        "error",
                        "Giá riêng không hợp lệ."
                    );

                    return;
                }
            }


            const sku =
                window.prompt(
                    "SKU:",
                    variant.sku ||
                    ""
                );


            if (
                sku === null
            ) {
                return;
            }


            try {

                const response =
                    await API.put(
                        `/admin/products/variant/${variant.variant_id}`,
                        {
                            size:
                                size.trim(),

                            color:
                                color.trim(),

                            stock_quantity:
                                stock,

                            price_override:
                                priceOverride,

                            sku:
                                sku.trim(),
                        }
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Cập nhật biến thể thất bại"
                    );
                }


                showMessage(
                    "success",
                    "Cập nhật biến thể thành công!"
                );


                setExpandedProductId(
                    productId
                );


                await fetchProducts();


            } catch (err) {

                console.error(
                    "Lỗi cập nhật biến thể:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể cập nhật biến thể"
                );
            }
        };


    // ========================================================
    // DELETE VARIANT
    // ========================================================

    const handleDeleteVariant =
        async (
            productId,
            variant
        ) => {

            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa biến thể này?\n\nSize: ${variant.size || "-"}\nMàu: ${variant.color || "-"}\nSKU: ${variant.sku || "-"}`
                );


            if (
                !confirmed
            ) {
                return;
            }


            try {

                const response =
                    await API.delete(
                        `/admin/products/variant/${variant.variant_id}`
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Xóa biến thể thất bại"
                    );
                }


                showMessage(
                    "success",

                    response.data
                        ?.message ||
                    "Xóa biến thể thành công!"
                );


                setExpandedProductId(
                    productId
                );


                await fetchProducts();


            } catch (err) {

                console.error(
                    "Lỗi xóa biến thể:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể xóa biến thể"
                );
            }
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="products-loading">

                <div className="products-loading-line">
                </div>

                <p>
                    ĐANG TẢI SẢN PHẨM
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

        <div className="admin-products-page">


            {/* =================================================
                TOP
            ================================================= */}

            <section className="products-top">


                <div>

                    <p className="products-eyebrow">
                        PRODUCTS / MANAGEMENT
                    </p>


                    <h1>
                        SẢN PHẨM
                    </h1>


                    <p className="products-description">
                        Quản lý sản phẩm, biến thể, giá bán
                        và tồn kho của cửa hàng.
                    </p>

                </div>


                <div className="products-top-actions">


                    <button
                        type="button"
                        className="products-refresh"
                        disabled={
                            refreshing
                        }
                        onClick={() =>
                            fetchProducts(
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
                        className="products-add"
                        onClick={
                            handleOpenCreate
                        }
                    >

                        <span>
                            +
                        </span>

                        THÊM SẢN PHẨM

                    </button>


                </div>


            </section>


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message.text && (

                <div
                    className={
                        `products-message ${message.type}`
                    }
                >

                    <span>
                        {message.type ===
                            "success"
                            ? "✓"
                            : "!"}
                    </span>

                    {message.text}

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="products-message error">

                    <span>
                        !
                    </span>

                    {error}

                </div>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="products-summary">


                <div>

                    <span>
                        01
                    </span>

                    <p>
                        TỔNG SẢN PHẨM
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
                        ĐANG BÁN
                    </p>

                    <strong>
                        {summary.active}
                    </strong>

                </div>


                <div>

                    <span>
                        03
                    </span>

                    <p>
                        NGỪNG BÁN
                    </p>

                    <strong>
                        {summary.inactive}
                    </strong>

                </div>


                <div>

                    <span>
                        04
                    </span>

                    <p>
                        TỔNG TỒN KHO
                    </p>

                    <strong>
                        {summary.stock}
                    </strong>

                </div>


            </section>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="products-toolbar">


                <div className="products-search">

                    <span>
                        ⌕
                    </span>


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
                        placeholder="Tìm tên sản phẩm, ID, danh mục..."
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

                    <option value="active">
                        ĐANG BÁN
                    </option>

                    <option value="inactive">
                        NGỪNG BÁN
                    </option>

                </select>


            </section>


            <div className="products-count">

                <span>
                    KẾT QUẢ
                </span>

                <strong>
                    {filteredProducts.length}
                </strong>

                <span>
                    / {groupedProducts.length} SẢN PHẨM
                </span>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {!error &&
            filteredProducts.length ===
                0 ? (

                <section className="products-empty">

                    <span>
                        BOUTIQUE.
                    </span>

                    <h2>
                        KHÔNG CÓ
                        <br />
                        SẢN PHẨM.
                    </h2>

                    <p>
                        Không tìm thấy sản phẩm phù hợp.
                    </p>

                </section>

            ) : (

                // =================================================
                // PRODUCT LIST
                // =================================================

                <section className="products-list">


                    {filteredProducts.map(
                        (product) => {

                            const stock =
                                getTotalStock(
                                    product
                                );


                            const expanded =
                                expandedProductId ===
                                product.product_id;


                            return (

                                <article
                                    className={
                                        expanded
                                            ? "product-admin-card expanded"
                                            : "product-admin-card"
                                    }
                                    key={
                                        product.product_id
                                    }
                                >


                                    {/* =============================
                                        MAIN ROW
                                    ============================= */}

                                    <div className="product-main-row">


                                        {/* IMAGE */}

                                        <div className="product-admin-image">

                                            {product.image_url ? (

                                                <img
                                                    src={
                                                        product.image_url
                                                    }
                                                    alt={
                                                        product.product_name
                                                    }
                                                    onError={
                                                        (
                                                            event
                                                        ) => {

                                                            event.currentTarget
                                                                .style
                                                                .display =
                                                                "none";
                                                        }
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    NO IMAGE
                                                </span>

                                            )}

                                        </div>


                                        {/* INFO */}

                                        <div className="product-admin-info">

                                            <p>
                                                PRODUCT /
                                                {
                                                    String(
                                                        product.product_id
                                                    )
                                                        .padStart(
                                                            4,
                                                            "0"
                                                        )
                                                }
                                            </p>


                                            <h2>
                                                {
                                                    product.product_name
                                                }
                                            </h2>


                                            <span>
                                                {
                                                    product.category_name ||
                                                    "Không có danh mục"
                                                }
                                            </span>

                                        </div>


                                        {/* PRICE */}

                                        <div className="product-stat">

                                            <p>
                                                GIÁ
                                            </p>

                                            <strong>
                                                {
                                                    formatMoney(
                                                        product.price ||
                                                        product.base_price
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                VNĐ
                                            </span>

                                        </div>


                                        {/* VARIANT */}

                                        <div className="product-stat">

                                            <p>
                                                BIẾN THỂ
                                            </p>

                                            <strong>
                                                {
                                                    product
                                                        .variants
                                                        .length
                                                }
                                            </strong>

                                            <span>
                                                SIZE / MÀU
                                            </span>

                                        </div>


                                        {/* STOCK */}

                                        <div className="product-stat">

                                            <p>
                                                TỒN KHO
                                            </p>

                                            <strong
                                                className={
                                                    stock <= 5
                                                        ? "low-stock"
                                                        : ""
                                                }
                                            >
                                                {stock}
                                            </strong>

                                            <span>
                                                SẢN PHẨM
                                            </span>

                                        </div>


                                        {/* STATUS */}

                                        <div className="product-admin-status">

                                            <span
                                                className={
                                                    product.status ===
                                                    "active"
                                                        ? "product-status active"
                                                        : "product-status inactive"
                                                }
                                            >
                                                {product.status ===
                                                "active"
                                                    ? "ĐANG BÁN"
                                                    : "NGỪNG BÁN"}
                                            </span>

                                        </div>


                                    </div>


                                    {/* =============================
                                        ACTIONS
                                    ============================= */}

                                    <div className="product-actions">


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedProductId(
                                                    expanded
                                                        ? null
                                                        : product.product_id
                                                )
                                            }
                                        >
                                            {expanded
                                                ? "ẨN SIZE / MÀU ↑"
                                                : `SIZE / MÀU (${product.variants.length}) ↓`}
                                        </button>


                                        <button
                                            type="button"
                                            className="edit"
                                            onClick={() =>
                                                handleOpenEdit(
                                                    product.product_id
                                                )
                                            }
                                        >
                                            SỬA
                                        </button>


                                        <button
                                            type="button"
                                            className="delete"
                                            onClick={() =>
                                                handleDeleteProduct(
                                                    product
                                                )
                                            }
                                        >
                                            XÓA
                                        </button>


                                    </div>


                                    {/* =============================
                                        VARIANTS
                                    ============================= */}

                                    {expanded && (

                                        <div className="product-variants">


                                            <div className="variants-header">

                                                <div>

                                                    <p>
                                                        PRODUCT VARIANTS
                                                    </p>

                                                    <h3>
                                                        SIZE / MÀU / TỒN KHO
                                                    </h3>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCreateVariant(
                                                            product.product_id
                                                        )
                                                    }
                                                >
                                                    + THÊM BIẾN THỂ
                                                </button>

                                            </div>


                                            {product.variants.length ===
                                            0 ? (

                                                <div className="variants-empty">
                                                    Sản phẩm chưa có biến thể.
                                                </div>

                                            ) : (

                                                <div className="variant-grid">


                                                    {product.variants.map(
                                                        (
                                                            variant
                                                        ) => (

                                                            <div
                                                                className="variant-card"
                                                                key={
                                                                    variant.variant_id
                                                                }
                                                            >

                                                                <div className="variant-number">
                                                                    VARIANT #
                                                                    {
                                                                        variant.variant_id
                                                                    }
                                                                </div>


                                                                <div className="variant-info-grid">

                                                                    <div>

                                                                        <span>
                                                                            SIZE
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                variant.size ||
                                                                                "-"
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            MÀU
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                variant.color ||
                                                                                "-"
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            SKU
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                variant.sku ||
                                                                                "-"
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            KHO
                                                                        </span>

                                                                        <strong
                                                                            className={
                                                                                Number(
                                                                                    variant.stock_quantity ||
                                                                                    0
                                                                                ) <=
                                                                                5
                                                                                    ? "low-stock"
                                                                                    : ""
                                                                            }
                                                                        >
                                                                            {
                                                                                variant.stock_quantity ??
                                                                                0
                                                                            }
                                                                        </strong>

                                                                    </div>


                                                                    <div>

                                                                        <span>
                                                                            GIÁ RIÊNG
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                variant.price_override !==
                                                                                    null &&
                                                                                variant.price_override !==
                                                                                    undefined
                                                                                    ? `${formatMoney(
                                                                                        variant.price_override
                                                                                    )} đ`
                                                                                    : "Giá sản phẩm"
                                                                            }
                                                                        </strong>

                                                                    </div>

                                                                </div>


                                                                <div className="variant-actions">

                                                                    <button
                                                                        type="button"
                                                                        className="edit"
                                                                        onClick={() =>
                                                                            handleEditVariant(
                                                                                product.product_id,
                                                                                variant
                                                                            )
                                                                        }
                                                                    >
                                                                        SỬA
                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleUpdateStock(
                                                                                variant.variant_id,
                                                                                variant.stock_quantity
                                                                            )
                                                                        }
                                                                    >
                                                                        TỒN KHO
                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        className="delete"
                                                                        onClick={() =>
                                                                            handleDeleteVariant(
                                                                                product.product_id,
                                                                                variant
                                                                            )
                                                                        }
                                                                    >
                                                                        XÓA
                                                                    </button>

                                                                </div>


                                                            </div>

                                                        )
                                                    )}


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


            {/* =================================================
                MODAL
            ================================================= */}

            {showForm && (

                <div className="product-modal-overlay">


                    <div className="product-modal">


                        {/* HEADER */}

                        <div className="product-modal-header">


                            <div>

                                <p>
                                    PRODUCT EDITOR
                                </p>

                                <h2>
                                    {formMode ===
                                    "create"
                                        ? "THÊM SẢN PHẨM"
                                        : "SỬA SẢN PHẨM"}
                                </h2>

                                <span>
                                    {formMode ===
                                    "create"
                                        ? "Tạo sản phẩm mới cho cửa hàng."
                                        : `Đang chỉnh sửa sản phẩm #${form.id}`}
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseForm
                                }
                            >
                                ×
                            </button>


                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >


                            <div className="product-form-grid">


                                {/* NAME */}

                                <div className="form-field full">

                                    <label>
                                        TÊN SẢN PHẨM *
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ví dụ: Áo Polo Premium"
                                    />

                                </div>


                                {/* CATEGORY */}

                                <div className="form-field">

                                    <label>
                                        DANH MỤC
                                    </label>

                                    <select
                                        name="category_id"
                                        value={
                                            form.category_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Không có danh mục
                                        </option>


                                        {categoryOptions.map(
                                            (
                                                category
                                            ) => (

                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* PRICE */}

                                <div className="form-field">

                                    <label>
                                        GIÁ *
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="350000"
                                    />

                                </div>


                                {/* STATUS */}

                                <div className="form-field">

                                    <label>
                                        TRẠNG THÁI
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="active">
                                            Đang bán
                                        </option>

                                        <option value="inactive">
                                            Ngừng bán
                                        </option>

                                    </select>

                                </div>


                                {/* IMAGE */}

                                <div className="form-field">

                                    <label>
                                        URL ẢNH CHÍNH
                                    </label>

                                    <input
                                        type="text"
                                        name="image_url"
                                        value={
                                            form.image_url
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://..."
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div className="form-field full">

                                    <label>
                                        MÔ TẢ
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Mô tả sản phẩm..."
                                    />

                                </div>


                            </div>


                            {/* =========================================
                                CREATE VARIANTS
                            ========================================= */}

                            {formMode ===
                            "create" && (

                                <div className="variant-form-section">


                                    <div className="variant-form-heading">

                                        <div>

                                            <p>
                                                VARIANTS
                                            </p>

                                            <h3>
                                                SIZE / MÀU / KHO
                                            </h3>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                handleAddVariant
                                            }
                                        >
                                            + THÊM BIẾN THỂ
                                        </button>

                                    </div>


                                    {form.variants.map(
                                        (
                                            variant,
                                            index
                                        ) => (

                                            <div
                                                className="variant-form-row"
                                                key={
                                                    index
                                                }
                                            >

                                                <input
                                                    type="text"
                                                    value={
                                                        variant.size
                                                    }
                                                    placeholder="Size"
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            handleVariantChange(
                                                                index,
                                                                "size",
                                                                event.target.value
                                                            )
                                                    }
                                                />


                                                <input
                                                    type="text"
                                                    value={
                                                        variant.color
                                                    }
                                                    placeholder="Màu"
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            handleVariantChange(
                                                                index,
                                                                "color",
                                                                event.target.value
                                                            )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        variant.stock_quantity
                                                    }
                                                    placeholder="Tồn kho"
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            handleVariantChange(
                                                                index,
                                                                "stock_quantity",
                                                                event.target.value
                                                            )
                                                    }
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        variant.price_override
                                                    }
                                                    placeholder="Giá riêng"
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            handleVariantChange(
                                                                index,
                                                                "price_override",
                                                                event.target.value
                                                            )
                                                    }
                                                />


                                                <input
                                                    type="text"
                                                    value={
                                                        variant.sku
                                                    }
                                                    placeholder="SKU"
                                                    onChange={
                                                        (
                                                            event
                                                        ) =>
                                                            handleVariantChange(
                                                                index,
                                                                "sku",
                                                                event.target.value
                                                            )
                                                    }
                                                />


                                                <button
                                                    type="button"
                                                    className="remove"
                                                    onClick={() =>
                                                        handleRemoveVariant(
                                                            index
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>


                                            </div>

                                        )
                                    )}


                                </div>

                            )}


                            {/* EDIT NOTE */}

                            {formMode ===
                            "edit" && (

                                <div className="edit-variant-note">

                                    <strong>
                                        SIZE / MÀU
                                    </strong>

                                    <p>
                                        Để thêm, sửa hoặc xóa biến thể,
                                        đóng cửa sổ này và mở mục
                                        SIZE / MÀU của sản phẩm.
                                    </p>

                                </div>

                            )}


                            {/* ACTION */}

                            <div className="product-modal-actions">

                                <button
                                    type="button"
                                    className="cancel"
                                    disabled={
                                        saving
                                    }
                                    onClick={
                                        handleCloseForm
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

                                    {saving
                                        ? "ĐANG LƯU..."
                                        : formMode ===
                                          "create"
                                            ? "THÊM SẢN PHẨM"
                                            : "LƯU THAY ĐỔI"}

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

    .admin-products-page {
        width: 100%;
        max-width: 1450px;
        margin: 0 auto;

        color: #111;
    }


    /* ========================================================
       TOP
    ======================================================== */

    .products-top {
        margin-bottom: 35px;

        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        gap: 30px;
    }


    .products-eyebrow {
        margin: 0 0 12px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .products-top h1 {
        margin: 0;

        font-size:
            clamp(
                32px,
                4vw,
                52px
            );

        line-height: 1;

        font-weight: 300;

        letter-spacing: 2px;
    }


    .products-description {
        margin: 14px 0 0;

        color: #888;

        font-size: 11px;

        line-height: 1.7;
    }


    .products-top-actions {
        display: flex;

        gap: 8px;
    }


    .products-top-actions button {
        min-height: 43px;

        padding: 0 16px;

        border: 1px solid #111;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1.5px;
    }


    .products-refresh {
        background: #fff;

        color: #111;
    }


    .products-add {
        display: flex;

        align-items: center;

        gap: 9px;

        background: #111;

        color: #fff;
    }


    .products-add:hover {
        background: #fff;

        color: #111;
    }


    /* ========================================================
       MESSAGE
    ======================================================== */

    .products-message {
        margin-bottom: 25px;

        padding: 14px 17px;

        display: flex;

        align-items: center;

        gap: 12px;

        border: 1px solid #ddd;

        font-size: 10px;
    }


    .products-message > span {
        width: 25px;
        height: 25px;

        display: flex;

        align-items: center;

        justify-content: center;

        border: 1px solid currentColor;

        border-radius: 50%;
    }


    .products-message.success {
        border-color: #c7ddca;

        background: #f4faf5;

        color: #286332;
    }


    .products-message.error {
        border-color: #e2c5c1;

        background: #fff7f6;

        color: #8b3025;
    }


    /* ========================================================
       SUMMARY
    ======================================================== */

    .products-summary {
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


    .products-summary > div {
        min-height: 130px;

        padding: 20px;

        border-right:
            1px solid #ddd;
    }


    .products-summary > div:last-child {
        border-right: none;
    }


    .products-summary span {
        color: #bbb;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .products-summary p {
        margin: 15px 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .products-summary strong {
        font-size: 28px;

        font-weight: 300;
    }


    /* ========================================================
       TOOLBAR
    ======================================================== */

    .products-toolbar {
        margin-top: 30px;

        display: grid;

        grid-template-columns:
            minmax(
                280px,
                1fr
            )
            210px;

        gap: 10px;
    }


    .products-search {
        min-height: 45px;

        padding: 0 15px;

        display: flex;

        align-items: center;

        gap: 10px;

        border: 1px solid #ddd;

        background: #fff;
    }


    .products-search span {
        font-size: 18px;
    }


    .products-search input {
        width: 100%;

        border: none;

        outline: none;

        background: transparent;

        font-size: 10px;
    }


    .products-toolbar select {
        min-height: 45px;

        padding: 0 12px;

        border: 1px solid #ddd;

        outline: none;

        background: #fff;

        font-size: 8px;

        letter-spacing: 1px;
    }


    .products-count {
        margin: 18px 0;

        display: flex;

        align-items: center;

        gap: 6px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .products-count strong {
        color: #111;

        font-size: 10px;
    }


    /* ========================================================
       PRODUCT LIST
    ======================================================== */

    .products-list {
        display: flex;

        flex-direction: column;

        gap: 12px;
    }


    .product-admin-card {
        border: 1px solid #ddd;

        background: #fff;
    }


    .product-admin-card.expanded,
    .product-admin-card:hover {
        border-color: #111;
    }


    .product-main-row {
        min-height: 145px;

        padding: 18px;

        display: grid;

        grid-template-columns:
            85px
            minmax(
                200px,
                1.5fr
            )
            .8fr
            .55fr
            .55fr
            auto;

        align-items: center;

        gap: 20px;
    }


    .product-admin-image {
        width: 70px;
        height: 92px;

        overflow: hidden;

        display: flex;

        align-items: center;

        justify-content: center;

        background: #f3f3f0;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .product-admin-image img {
        width: 100%;
        height: 100%;

        object-fit: cover;
    }


    .product-admin-info {
        min-width: 0;
    }


    .product-admin-info p {
        margin: 0 0 9px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .product-admin-info h2 {
        margin: 0 0 9px;

        overflow: hidden;

        font-size: 17px;

        font-weight: 400;

        text-overflow: ellipsis;

        white-space: nowrap;
    }


    .product-admin-info span {
        color: #888;

        font-size: 9px;
    }


    .product-stat p {
        margin: 0 0 9px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .product-stat strong {
        display: block;

        font-size: 20px;

        font-weight: 300;
    }


    .product-stat span {
        display: block;

        margin-top: 5px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 1px;
    }


    .low-stock {
        color: #a63227 !important;
    }


    .product-status {
        padding: 8px 10px;

        border: 1px solid #ddd;

        font-size: 6px;

        letter-spacing: 1px;

        white-space: nowrap;
    }


    .product-status.active {
        border-color: #c7ddca;

        background: #f4faf5;

        color: #286332;
    }


    .product-status.inactive {
        background: #f3f3f3;

        color: #777;
    }


    /* ========================================================
       ACTIONS
    ======================================================== */

    .product-actions {
        min-height: 54px;

        padding: 9px 18px;

        display: flex;

        align-items: center;

        justify-content: flex-end;

        gap: 7px;

        border-top: 1px solid #eee;

        background: #fafafa;
    }


    .product-actions button,
    .variant-actions button {
        min-height: 34px;

        padding: 0 12px;

        border: 1px solid #bbb;

        background: #fff;

        color: #111;

        cursor: pointer;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .product-actions button:hover,
    .variant-actions button:hover {
        border-color: #111;
    }


    .product-actions button.edit,
    .variant-actions button.edit {
        border-color: #111;

        background: #111;

        color: #fff;
    }


    .product-actions button.delete,
    .variant-actions button.delete {
        border-color: #d8aaa5;

        color: #92372e;
    }


    /* ========================================================
       VARIANTS
    ======================================================== */

    .product-variants {
        padding: 28px 20px;

        border-top: 1px solid #111;

        background: #f5f5f2;
    }


    .variants-header {
        margin-bottom: 20px;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 20px;
    }


    .variants-header p {
        margin: 0 0 7px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 3px;
    }


    .variants-header h3 {
        margin: 0;

        font-size: 16px;

        font-weight: 400;
    }


    .variants-header button {
        min-height: 36px;

        padding: 0 13px;

        border: 1px solid #111;

        background: #111;

        color: #fff;

        cursor: pointer;

        font-size: 7px;

        letter-spacing: 1px;
    }


    .variant-grid {
        display: grid;

        grid-template-columns:
            repeat(
                auto-fit,
                minmax(
                    240px,
                    1fr
                )
            );

        gap: 10px;
    }


    .variant-card {
        padding: 17px;

        border: 1px solid #ddd;

        background: #fff;
    }


    .variant-number {
        padding-bottom: 12px;

        border-bottom: 1px solid #eee;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .variant-info-grid {
        margin-top: 15px;

        display: grid;

        grid-template-columns:
            repeat(
                2,
                1fr
            );

        gap: 17px;
    }


    .variant-info-grid span {
        display: block;

        margin-bottom: 5px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 1.5px;
    }


    .variant-info-grid strong {
        font-size: 10px;

        font-weight: 500;
    }


    .variant-actions {
        margin-top: 18px;

        padding-top: 13px;

        display: flex;

        gap: 6px;

        border-top: 1px solid #eee;
    }


    .variants-empty {
        padding: 25px;

        background: #fff;

        color: #999;

        text-align: center;

        font-size: 9px;
    }


    /* ========================================================
       MODAL
    ======================================================== */

    .product-modal-overlay {
        position: fixed;

        inset: 0;

        z-index: 9999;

        padding: 25px;

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


    .product-modal {
        width: 100%;

        max-width: 900px;

        max-height: 92vh;

        overflow-y: auto;

        padding: 30px;

        background: #fff;
    }


    .product-modal-header {
        margin-bottom: 28px;

        padding-bottom: 20px;

        display: flex;

        align-items: flex-start;

        justify-content: space-between;

        gap: 20px;

        border-bottom: 1px solid #111;
    }


    .product-modal-header p {
        margin: 0 0 8px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 3px;
    }


    .product-modal-header h2 {
        margin: 0;

        font-size: 27px;

        font-weight: 300;

        letter-spacing: 1px;
    }


    .product-modal-header span {
        display: block;

        margin-top: 8px;

        color: #999;

        font-size: 9px;
    }


    .product-modal-header > button {
        border: none;

        background: transparent;

        cursor: pointer;

        font-size: 28px;
    }


    /* ========================================================
       FORM
    ======================================================== */

    .product-form-grid {
        display: grid;

        grid-template-columns:
            repeat(
                2,
                1fr
            );

        gap: 18px;
    }


    .form-field.full {
        grid-column: 1 / -1;
    }


    .form-field label {
        display: block;

        margin-bottom: 7px;

        color: #777;

        font-size: 7px;

        font-weight: 600;

        letter-spacing: 1.5px;
    }


    .form-field input,
    .form-field select,
    .form-field textarea {
        width: 100%;

        padding: 12px;

        border: 1px solid #ccc;

        outline: none;

        background: #fff;

        font-family: inherit;

        font-size: 11px;
    }


    .form-field input,
    .form-field select {
        height: 43px;
    }


    .form-field textarea {
        min-height: 110px;

        resize: vertical;
    }


    /* ========================================================
       VARIANT FORM
    ======================================================== */

    .variant-form-section {
        margin-top: 28px;

        padding-top: 22px;

        border-top: 1px solid #ddd;
    }


    .variant-form-heading {
        margin-bottom: 15px;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;
    }


    .variant-form-heading p {
        margin: 0 0 6px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .variant-form-heading h3 {
        margin: 0;

        font-size: 13px;

        font-weight: 500;
    }


    .variant-form-heading button {
        min-height: 34px;

        padding: 0 11px;

        border: 1px solid #111;

        background: #fff;

        cursor: pointer;

        font-size: 7px;
    }


    .variant-form-row {
        margin-bottom: 8px;

        display: grid;

        grid-template-columns:
            .7fr
            1fr
            .8fr
            1fr
            1fr
            40px;

        gap: 7px;
    }


    .variant-form-row input {
        min-width: 0;

        height: 40px;

        padding: 0 9px;

        border: 1px solid #ccc;

        font-size: 10px;
    }


    .variant-form-row button.remove {
        border: 1px solid #d8aaa5;

        background: #fff;

        color: #92372e;

        cursor: pointer;

        font-size: 18px;
    }


    .edit-variant-note {
        margin-top: 25px;

        padding: 16px;

        border: 1px solid #ddd;

        background: #f5f5f2;
    }


    .edit-variant-note strong {
        font-size: 8px;

        letter-spacing: 2px;
    }


    .edit-variant-note p {
        margin: 8px 0 0;

        color: #777;

        font-size: 9px;

        line-height: 1.7;
    }


    /* ========================================================
       MODAL ACTION
    ======================================================== */

    .product-modal-actions {
        margin-top: 30px;

        display: flex;

        justify-content: flex-end;

        gap: 8px;
    }


    .product-modal-actions button {
        min-height: 44px;

        padding: 0 18px;

        cursor: pointer;

        font-size: 8px;

        letter-spacing: 1px;
    }


    .product-modal-actions .cancel {
        border: 1px solid #bbb;

        background: #fff;
    }


    .product-modal-actions .save {
        min-width: 170px;

        display: flex;

        align-items: center;

        justify-content: space-between;

        border: 1px solid #111;

        background: #111;

        color: #fff;
    }


    /* ========================================================
       EMPTY
    ======================================================== */

    .products-empty {
        min-height: 350px;

        padding: 40px;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;

        border: 1px solid #ddd;

        background: #fff;

        text-align: center;
    }


    .products-empty > span {
        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .products-empty h2 {
        margin: 18px 0 12px;

        font-size: 37px;

        font-weight: 300;

        line-height: .95;
    }


    .products-empty p {
        color: #999;

        font-size: 9px;
    }


    /* ========================================================
       LOADING
    ======================================================== */

    .products-loading {
        min-height: 55vh;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;
    }


    .products-loading p {
        color: #999;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .products-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            productsLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes productsLoading {

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

        .product-main-row {
            grid-template-columns:
                75px
                1.5fr
                repeat(
                    3,
                    .7fr
                );
        }


        .product-admin-status {
            grid-column:
                2 / -1;
        }

    }


    @media (
        max-width: 850px
    ) {

        .products-summary {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .products-toolbar {
            grid-template-columns:
                1fr;
        }


        .product-main-row {
            grid-template-columns:
                80px
                1fr
                1fr;
        }


        .product-admin-info {
            grid-column:
                span 2;
        }


        .product-admin-status {
            grid-column: auto;
        }


        .variant-form-row {
            grid-template-columns:
                1fr
                1fr;
        }


        .variant-form-row
        button.remove {
            min-height: 40px;
        }

    }


    @media (
        max-width: 600px
    ) {

        .products-top {
            align-items:
                flex-start;

            flex-direction:
                column;
        }


        .products-top-actions {
            width: 100%;
        }


        .products-top-actions button {
            flex: 1;
        }


        .products-summary {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .product-main-row {
            grid-template-columns:
                70px
                1fr;
        }


        .product-admin-info {
            grid-column: auto;
        }


        .product-stat,
        .product-admin-status {
            grid-column:
                1 / -1;
        }


        .product-actions {
            align-items: stretch;

            flex-direction: column;
        }


        .variant-grid {
            grid-template-columns:
                1fr;
        }


        .product-form-grid {
            grid-template-columns:
                1fr;
        }


        .form-field.full {
            grid-column: auto;
        }


        .variant-form-row {
            grid-template-columns:
                1fr;
        }


        .product-modal-overlay {
            padding: 10px;
        }


        .product-modal {
            padding: 20px;
        }

    }

`;


export default AdminProductManagement;