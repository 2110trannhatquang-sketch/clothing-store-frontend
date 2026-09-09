import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import API from "../services/api";


// ============================================================
// ADMIN USER MANAGEMENT
// ============================================================

const AdminUserManagement = () => {

    const [
        users,
        setUsers
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
        roleFilter,
        setRoleFilter
    ] = useState("all");


    const [
        actionUserId,
        setActionUserId
    ] = useState(null);


    const [
        message,
        setMessage
    ] = useState({
        type: "",
        text: "",
    });


    // ========================================================
    // CURRENT USER
    // ========================================================

    const currentUserId =
        useMemo(() => {

            try {

                const savedUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                    );


                return Number(
                    savedUser.id ??
                    savedUser.user_id ??
                    savedUser.userId ??
                    0
                );


            } catch {

                return 0;
            }

        }, []);


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
    // FETCH USERS
    // ========================================================

    const fetchUsers =
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
                        "/admin/users"
                    );


                if (
                    !response.data?.success
                ) {

                    throw new Error(
                        response.data?.message ||
                        "Không thể lấy danh sách người dùng"
                    );
                }


                setUsers(
                    response.data?.data ||
                    []
                );


            } catch (err) {

                console.error(
                    "Lỗi lấy người dùng:",
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể lấy danh sách người dùng"
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

        fetchUsers();

    }, []);


    // ========================================================
    // FILTER USERS
    // ========================================================

    const filteredUsers =
        useMemo(
            () => {

                const keyword =
                    search
                        .trim()
                        .toLowerCase();


                return users.filter(
                    (user) => {

                        const matchesRole =
                            roleFilter ===
                                "all" ||
                            user.role ===
                                roleFilter;


                        const searchable =
                            [
                                user.id,
                                user.full_name,
                                user.email,
                                user.phone,
                                user.address,
                                user.role,
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
                            matchesRole &&
                            matchesSearch
                        );
                    }
                );
            },
            [
                users,
                search,
                roleFilter,
            ]
        );


    // ========================================================
    // SUMMARY
    // ========================================================

    const summary =
        useMemo(
            () => {

                const customers =
                    users.filter(
                        (user) =>
                            user.role ===
                            "customer"
                    ).length;


                const admins =
                    users.filter(
                        (user) =>
                            user.role ===
                            "admin"
                    ).length;


                const totalOrders =
                    users.reduce(
                        (
                            total,
                            user
                        ) =>
                            total +
                            Number(
                                user.order_count ||
                                0
                            ),
                        0
                    );


                return {

                    total:
                        users.length,

                    customers,

                    admins,

                    orders:
                        totalOrders,
                };
            },
            [users]
        );


    // ========================================================
    // UPDATE ROLE
    // ========================================================

    const handleUpdateRole =
        async (
            user
        ) => {

            if (
                currentUserId &&
                Number(
                    user.id
                ) ===
                    currentUserId
            ) {

                showMessage(
                    "error",
                    "Không thể thay đổi quyền của tài khoản Admin đang đăng nhập."
                );

                return;
            }


            const newRole =
                user.role ===
                    "admin"
                    ? "customer"
                    : "admin";


            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn đổi quyền?\n\n` +
                    `${user.full_name}\n` +
                    `${user.email}\n\n` +
                    `${user.role} → ${newRole}`
                );


            if (!confirmed) {

                return;
            }


            try {

                setActionUserId(
                    user.id
                );


                const response =
                    await API.put(
                        `/admin/users/${user.id}/role`,
                        {
                            role:
                                newRole,
                        }
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Cập nhật quyền thất bại"
                    );
                }


                setUsers(
                    (currentUsers) =>
                        currentUsers.map(
                            (currentUser) =>
                                currentUser.id ===
                                    user.id
                                    ? {
                                        ...currentUser,

                                        role:
                                            newRole,
                                    }
                                    : currentUser
                        )
                );


                showMessage(
                    "success",

                    response.data
                        ?.message ||
                    "Cập nhật quyền người dùng thành công!"
                );


            } catch (err) {

                console.error(
                    "Lỗi cập nhật quyền:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể cập nhật quyền người dùng"
                );


            } finally {

                setActionUserId(
                    null
                );
            }
        };


    // ========================================================
    // DELETE USER
    // ========================================================

    const handleDeleteUser =
        async (
            user
        ) => {

            if (
                currentUserId &&
                Number(
                    user.id
                ) ===
                    currentUserId
            ) {

                showMessage(
                    "error",
                    "Không thể xóa tài khoản Admin đang đăng nhập."
                );

                return;
            }


            const confirmed =
                window.confirm(
                    `Bạn có chắc muốn xóa người dùng?\n\n` +
                    `${user.full_name}\n` +
                    `${user.email}\n\n` +
                    `Nếu tài khoản đã có đơn hàng, hệ thống sẽ chặn xóa để bảo toàn dữ liệu.`
                );


            if (!confirmed) {

                return;
            }


            try {

                setActionUserId(
                    user.id
                );


                const response =
                    await API.delete(
                        `/admin/users/${user.id}`
                    );


                if (
                    !response.data
                        ?.success
                ) {

                    throw new Error(
                        response.data
                            ?.message ||
                        "Xóa người dùng thất bại"
                    );
                }


                showMessage(
                    "success",

                    response.data
                        ?.message ||
                    "Xóa người dùng thành công!"
                );


                await fetchUsers();


            } catch (err) {

                console.error(
                    "Lỗi xóa người dùng:",
                    err
                );


                showMessage(
                    "error",

                    err.response
                        ?.data
                        ?.message ||
                    err.message ||
                    "Không thể xóa người dùng"
                );


            } finally {

                setActionUserId(
                    null
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
    // INITIAL
    // ========================================================

    const getInitial =
        (name) => {

            return String(
                name ||
                "U"
            )
                .trim()
                .charAt(0)
                .toUpperCase();
        };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="users-loading">

                <div className="users-loading-line">
                </div>

                <p>
                    ĐANG TẢI NGƯỜI DÙNG
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

        <div className="admin-users-page">


            {/* =================================================
                TOP
            ================================================= */}

            <section className="users-top">


                <div>

                    <p className="users-eyebrow">
                        USERS / MANAGEMENT
                    </p>


                    <h1>
                        NGƯỜI DÙNG
                    </h1>


                    <p className="users-description">
                        Quản lý tài khoản khách hàng,
                        quyền truy cập và dữ liệu người dùng.
                    </p>

                </div>


                <button
                    type="button"
                    className="users-refresh"
                    disabled={
                        refreshing
                    }
                    onClick={() =>
                        fetchUsers(
                            true
                        )
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
                        `users-message ${message.type}`
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

                <div className="users-message error">

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

            <section className="users-summary">


                <div>

                    <span>
                        01
                    </span>

                    <p>
                        TỔNG NGƯỜI DÙNG
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
                        KHÁCH HÀNG
                    </p>

                    <strong>
                        {summary.customers}
                    </strong>

                </div>


                <div>

                    <span>
                        03
                    </span>

                    <p>
                        ADMIN
                    </p>

                    <strong>
                        {summary.admins}
                    </strong>

                </div>


                <div>

                    <span>
                        04
                    </span>

                    <p>
                        TỔNG ĐƠN HÀNG
                    </p>

                    <strong>
                        {summary.orders}
                    </strong>

                </div>


            </section>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <section className="users-toolbar">


                <div className="users-search">


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
                        placeholder="Tìm tên, email, số điện thoại, địa chỉ..."
                    />


                </div>


                <select
                    value={
                        roleFilter
                    }
                    onChange={
                        (event) =>
                            setRoleFilter(
                                event.target.value
                            )
                    }
                >

                    <option value="all">
                        TẤT CẢ QUYỀN
                    </option>

                    <option value="customer">
                        CUSTOMER
                    </option>

                    <option value="admin">
                        ADMIN
                    </option>

                </select>


            </section>


            <div className="users-result-count">

                <span>
                    KẾT QUẢ
                </span>


                <strong>
                    {filteredUsers.length}
                </strong>


                <span>
                    / {users.length} NGƯỜI DÙNG
                </span>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {!error &&
            filteredUsers.length ===
                0 ? (

                <section className="users-empty">

                    <span>
                        BOUTIQUE.
                    </span>


                    <h2>
                        KHÔNG CÓ
                        <br />
                        NGƯỜI DÙNG.
                    </h2>


                    <p>
                        Không tìm thấy tài khoản phù hợp.
                    </p>

                </section>

            ) : (

                // =================================================
                // USERS
                // =================================================

                <section className="users-list">


                    {filteredUsers.map(
                        (
                            user,
                            index
                        ) => {

                            const isCurrentUser =
                                currentUserId >
                                    0 &&
                                Number(
                                    user.id
                                ) ===
                                    currentUserId;


                            const busy =
                                actionUserId ===
                                user.id;


                            const orderCount =
                                Number(
                                    user.order_count ||
                                    0
                                );


                            return (

                                <article
                                    className={
                                        isCurrentUser
                                            ? "user-admin-card current"
                                            : "user-admin-card"
                                    }
                                    key={
                                        user.id
                                    }
                                >


                                    {/* INDEX */}

                                    <div className="user-index">

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


                                    {/* USER */}

                                    <div className="user-main">


                                        <div className="user-avatar">

                                            {
                                                getInitial(
                                                    user.full_name
                                                )
                                            }

                                        </div>


                                        <div className="user-main-info">

                                            <p>
                                                USER /
                                                {
                                                    String(
                                                        user.id
                                                    )
                                                        .padStart(
                                                            4,
                                                            "0"
                                                        )
                                                }
                                            </p>


                                            <div className="user-name-row">

                                                <h2>
                                                    {
                                                        user.full_name ||
                                                        "Không có tên"
                                                    }
                                                </h2>


                                                {isCurrentUser && (

                                                    <span className="you-badge">
                                                        BẠN
                                                    </span>

                                                )}

                                            </div>


                                            <span>
                                                {
                                                    user.email ||
                                                    "Không có email"
                                                }
                                            </span>

                                        </div>


                                    </div>


                                    {/* CONTACT */}

                                    <div className="user-info-column">

                                        <p>
                                            LIÊN HỆ
                                        </p>


                                        <strong>
                                            {
                                                user.phone ||
                                                "Chưa cập nhật"
                                            }
                                        </strong>


                                        <span>
                                            {
                                                user.address ||
                                                "Chưa cập nhật địa chỉ"
                                            }
                                        </span>

                                    </div>


                                    {/* ROLE */}

                                    <div className="user-role-column">

                                        <p>
                                            QUYỀN
                                        </p>


                                        <span
                                            className={
                                                user.role ===
                                                "admin"
                                                    ? "role-badge admin"
                                                    : "role-badge customer"
                                            }
                                        >
                                            {
                                                user.role ===
                                                "admin"
                                                    ? "ADMIN"
                                                    : "CUSTOMER"
                                            }
                                        </span>

                                    </div>


                                    {/* ORDERS */}

                                    <div className="user-order-column">

                                        <p>
                                            ĐƠN HÀNG
                                        </p>


                                        <strong
                                            className={
                                                orderCount ===
                                                0
                                                    ? "empty"
                                                    : ""
                                            }
                                        >
                                            {
                                                orderCount
                                            }
                                        </strong>


                                        <span>
                                            ĐƠN
                                        </span>

                                    </div>


                                    {/* DATE */}

                                    <div className="user-date-column">

                                        <p>
                                            NGÀY TẠO
                                        </p>


                                        <span>
                                            {
                                                formatDate(
                                                    user.created_at
                                                )
                                            }
                                        </span>

                                    </div>


                                    {/* ACTION */}

                                    <div className="user-actions">


                                        <button
                                            type="button"
                                            className="role-button"
                                            disabled={
                                                isCurrentUser ||
                                                busy
                                            }
                                            onClick={() =>
                                                handleUpdateRole(
                                                    user
                                                )
                                            }
                                        >

                                            {busy
                                                ? "ĐANG XỬ LÝ..."
                                                : user.role ===
                                                  "admin"
                                                    ? "ĐỔI CUSTOMER"
                                                    : "ĐỔI ADMIN"}

                                        </button>


                                        <button
                                            type="button"
                                            className="delete-button"
                                            disabled={
                                                isCurrentUser ||
                                                busy
                                            }
                                            onClick={() =>
                                                handleDeleteUser(
                                                    user
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

    .admin-users-page {
        width: 100%;

        max-width: 1450px;

        margin: 0 auto;

        color: #111;
    }


    /* ========================================================
       TOP
    ======================================================== */

    .users-top {
        margin-bottom: 35px;

        display: flex;

        align-items: flex-end;

        justify-content: space-between;

        gap: 30px;
    }


    .users-eyebrow {
        margin:
            0 0 12px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .users-top h1 {
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


    .users-description {
        margin:
            14px 0 0;

        color: #888;

        font-size: 11px;

        line-height: 1.7;
    }


    .users-refresh {
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


    .users-refresh:hover:not(:disabled) {
        background: #fff;

        color: #111;
    }


    .users-refresh:disabled {
        opacity: .5;
    }


    .users-refresh svg {
        width: 14px;
        height: 14px;

        stroke-linecap: round;

        stroke-linejoin: round;
    }


    /* ========================================================
       MESSAGE
    ======================================================== */

    .users-message {
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


    .users-message > span {
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


    .users-message p {
        margin: 0;
    }


    .users-message.success {
        border-color: #c7ddca;

        background: #f4faf5;

        color: #286332;
    }


    .users-message.error {
        border-color: #e2c5c1;

        background: #fff7f6;

        color: #8b3025;
    }


    /* ========================================================
       SUMMARY
    ======================================================== */

    .users-summary {
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


    .users-summary > div {
        min-height: 130px;

        padding: 20px;

        border-right:
            1px solid #ddd;
    }


    .users-summary > div:last-child {
        border-right: none;
    }


    .users-summary > div > span {
        color: #bbb;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .users-summary p {
        margin:
            15px 0 8px;

        color: #999;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .users-summary strong {
        font-size: 28px;

        font-weight: 300;
    }


    /* ========================================================
       TOOLBAR
    ======================================================== */

    .users-toolbar {
        margin-top: 30px;

        display: grid;

        grid-template-columns:
            minmax(
                280px,
                1fr
            )
            190px;

        gap: 10px;
    }


    .users-search {
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


    .users-search svg {
        width: 17px;
        height: 17px;

        flex-shrink: 0;

        stroke-linecap: round;

        stroke-linejoin: round;
    }


    .users-search input {
        width: 100%;

        border: none;

        outline: none;

        background: transparent;

        font-size: 10px;
    }


    .users-toolbar select {
        height: 45px;

        padding:
            0 12px;

        border:
            1px solid #ddd;

        outline: none;

        background: #fff;

        font-size: 8px;

        letter-spacing: 1px;
    }


    .users-result-count {
        margin:
            18px 0;

        display: flex;

        align-items: center;

        gap: 6px;

        color: #aaa;

        font-size: 7px;

        letter-spacing: 2px;
    }


    .users-result-count strong {
        color: #111;

        font-size: 10px;
    }


    /* ========================================================
       USER LIST
    ======================================================== */

    .users-list {
        display: flex;

        flex-direction: column;

        border-top:
            1px solid #111;
    }


    .user-admin-card {
        min-height: 120px;

        display: grid;

        grid-template-columns:
            45px
            minmax(
                250px,
                1.4fr
            )
            1fr
            .55fr
            .45fr
            .8fr
            auto;

        align-items: center;

        gap: 20px;

        padding:
            18px 20px;

        border-bottom:
            1px solid #ddd;

        background: #fff;

        transition:
            all .2s ease;
    }


    .user-admin-card:hover {
        background: #fafafa;
    }


    .user-admin-card.current {
        border-left:
            2px solid #111;
    }


    .user-index > span {
        color: #bbb;

        font-size: 7px;

        letter-spacing: 2px;
    }


    /* ========================================================
       USER
    ======================================================== */

    .user-main {
        min-width: 0;

        display: flex;

        align-items: center;

        gap: 14px;
    }


    .user-avatar {
        width: 48px;
        height: 48px;

        flex-shrink: 0;

        display: flex;

        align-items: center;

        justify-content: center;

        border-radius: 50%;

        background: #111;

        color: #fff;

        font-size: 12px;
    }


    .user-main-info {
        min-width: 0;
    }


    .user-main-info > p {
        margin:
            0 0 7px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .user-name-row {
        display: flex;

        align-items: center;

        gap: 7px;
    }


    .user-name-row h2 {
        margin: 0;

        overflow: hidden;

        font-size: 15px;

        font-weight: 500;

        text-overflow:
            ellipsis;

        white-space: nowrap;
    }


    .user-main-info > span {
        display: block;

        margin-top: 6px;

        overflow: hidden;

        color: #888;

        font-size: 9px;

        text-overflow:
            ellipsis;

        white-space: nowrap;
    }


    .you-badge {
        padding:
            3px 6px;

        border:
            1px solid #ddd;

        background: #f3f3f3;

        color: #555;

        font-size: 6px;

        letter-spacing: 1px;

        white-space: nowrap;
    }


    /* ========================================================
       COLUMNS
    ======================================================== */

    .user-info-column,
    .user-role-column,
    .user-order-column,
    .user-date-column {
        min-width: 0;
    }


    .user-info-column p,
    .user-role-column p,
    .user-order-column p,
    .user-date-column p {
        margin:
            0 0 9px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 2px;
    }


    .user-info-column strong {
        display: block;

        margin-bottom: 5px;

        font-size: 10px;

        font-weight: 500;
    }


    .user-info-column span {
        display: block;

        overflow-wrap: anywhere;

        color: #888;

        font-size: 8px;

        line-height: 1.5;
    }


    /* ========================================================
       ROLE
    ======================================================== */

    .role-badge {
        display: inline-block;

        padding:
            7px 9px;

        border:
            1px solid #ddd;

        font-size: 6px;

        letter-spacing: 1px;
    }


    .role-badge.admin {
        border-color: #111;

        background: #111;

        color: #fff;
    }


    .role-badge.customer {
        background: #f3f3f3;

        color: #666;
    }


    /* ========================================================
       ORDER COUNT
    ======================================================== */

    .user-order-column strong {
        display: block;

        font-size: 23px;

        font-weight: 300;
    }


    .user-order-column strong.empty {
        color: #aaa;
    }


    .user-order-column span {
        display: block;

        margin-top: 4px;

        color: #aaa;

        font-size: 6px;

        letter-spacing: 1px;
    }


    .user-date-column span {
        color: #777;

        font-size: 8px;

        line-height: 1.5;
    }


    /* ========================================================
       ACTIONS
    ======================================================== */

    .user-actions {
        display: flex;

        align-items: center;

        justify-content: flex-end;

        gap: 6px;
    }


    .user-actions button {
        min-height: 35px;

        padding:
            0 10px;

        cursor: pointer;

        font-size: 7px;

        letter-spacing: .8px;

        white-space: nowrap;
    }


    .role-button {
        border:
            1px solid #111;

        background: #111;

        color: #fff;
    }


    .role-button:hover:not(:disabled) {
        background: #fff;

        color: #111;
    }


    .delete-button {
        border:
            1px solid #d7aaa5;

        background: #fff;

        color: #92372e;
    }


    .delete-button:hover:not(:disabled) {
        border-color: #92372e;

        background: #fff7f6;
    }


    .user-actions button:disabled {
        opacity: .25;

        cursor: not-allowed;
    }


    /* ========================================================
       EMPTY
    ======================================================== */

    .users-empty {
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


    .users-empty > span {
        color: #aaa;

        font-size: 7px;

        letter-spacing: 4px;
    }


    .users-empty h2 {
        margin:
            18px 0 12px;

        font-size: 37px;

        font-weight: 300;

        line-height: .95;
    }


    .users-empty p {
        color: #999;

        font-size: 9px;
    }


    /* ========================================================
       LOADING
    ======================================================== */

    .users-loading {
        min-height: 55vh;

        display: flex;

        flex-direction: column;

        align-items: center;

        justify-content: center;
    }


    .users-loading p {
        color: #999;

        font-size: 8px;

        letter-spacing: 3px;
    }


    .users-loading-line {
        width: 70px;
        height: 1px;

        margin-bottom: 20px;

        background: #111;

        animation:
            usersLoading
            1.2s
            ease-in-out
            infinite;
    }


    @keyframes usersLoading {

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
        max-width: 1200px
    ) {

        .user-admin-card {
            grid-template-columns:
                40px
                1.4fr
                1fr
                .6fr
                .5fr
                auto;
        }


        .user-date-column {
            grid-column:
                2 / 4;
        }

    }


    @media (
        max-width: 850px
    ) {

        .users-summary {
            grid-template-columns:
                repeat(
                    2,
                    1fr
                );
        }


        .users-toolbar {
            grid-template-columns:
                1fr;
        }


        .user-admin-card {
            grid-template-columns:
                40px
                1fr
                1fr;
        }


        .user-main {
            grid-column:
                2 / -1;
        }


        .user-info-column,
        .user-role-column,
        .user-order-column,
        .user-date-column,
        .user-actions {
            grid-column:
                2 / -1;
        }


        .user-actions {
            justify-content:
                flex-start;
        }

    }


    @media (
        max-width: 600px
    ) {

        .users-top {
            align-items:
                flex-start;

            flex-direction:
                column;
        }


        .users-refresh {
            width: 100%;
        }


        .user-admin-card {
            grid-template-columns:
                30px
                1fr;
        }


        .user-main {
            grid-column: 2;
        }


        .user-info-column,
        .user-role-column,
        .user-order-column,
        .user-date-column,
        .user-actions {
            grid-column: 2;
        }


        .user-actions {
            align-items: stretch;

            flex-direction: column;
        }


        .user-actions button {
            width: 100%;
        }

    }

`;


export default AdminUserManagement;