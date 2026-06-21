const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");
const searchInput = document.querySelector(".search");
const cartList = document.querySelector(".cart-list");
const totalElement = document.querySelector("#total");
const cartMessage = document.querySelector(".cart-message");
const reviewText = document.querySelector(".review-text");
const reviewAuthor = document.querySelector(".review-card strong");
const authTabs = document.querySelectorAll(".auth-tab");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const authStatus = document.querySelector(".auth-status");
const logoutButton = document.querySelector(".logout-button");
const adminLink = document.querySelector(".admin-link");
const adminShortcut = document.querySelector(".admin-shortcut");
const adminSection = document.querySelector(".admin-section");
const pageSections = document.querySelectorAll("main > .section[id]");
const navPageLinks = document.querySelectorAll(".nav-links a[href^='#'], .home-dashboard a[href^='#'], .footer a[href^='#']");
const bookingForm = document.querySelector(".booking-form");
const bookingRoom = document.querySelector(".booking-room");
const bookingDate = document.querySelector(".booking-date");
const bookingTime = document.querySelector(".booking-time");
const bookingEnd = document.querySelector(".booking-end");
const bookingStatus = document.querySelector(".booking-status");
const venueList = document.querySelector(".venue-list");
const mapSpaces = document.querySelectorAll("[data-map-room]");
const mapTitle = document.querySelector(".map-title");
const mapAddress = document.querySelector(".map-address");
const mapPhoto = document.querySelector(".map-photo");
const mapDescription = document.querySelector(".map-description");
const calendarTitle = document.querySelector(".calendar-title");
const bookingCalendar = document.querySelector(".booking-calendar");
const calendarNavButtons = document.querySelectorAll(".calendar-nav");
const myBookingsList = document.querySelector(".my-bookings-list");
const myBookingsCount = document.querySelector(".my-bookings-count");
const summaryActive = document.querySelector(".summary-active");
const summaryCancelled = document.querySelector(".summary-cancelled");
const summaryUserRole = document.querySelector(".summary-user-role");
const adminStats = document.querySelector(".admin-stats");
const adminTable = document.querySelector(".admin-table");
const adminUsers = document.querySelector(".admin-users");
const adminBookingForm = document.querySelector(".admin-booking-form");
const adminBookingRoom = document.querySelector(".admin-booking-room");
const adminBookingDate = document.querySelector(".admin-booking-date");
const adminBookingStart = document.querySelector(".admin-booking-start");
const adminBookingEnd = document.querySelector(".admin-booking-end");
const adminBookingStatus = document.querySelector(".admin-booking-status");
const apiBase = window.location.protocol === "file:" ? "http://localhost:3000" : "";

let activeFilter = "all";
let total = 0;
let reviewIndex = 0;
let bookings = [];
let myBookings = [];
let rooms = [];
let calendarDate = new Date();
let currentUser = null;
const storedUser = localStorage.getItem("kimnataUser");

if (storedUser) {
    try {
        currentUser = JSON.parse(storedUser);
    } catch (error) {
        localStorage.removeItem("kimnataUser");
    }
}

const fallbackRooms = [
    {
        name: "Аудиторія 101",
        short: "101",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 1,
        floorLabel: "1 поверх",
        roomNumber: "101",
        capacity: 40,
        color: "#f4c542",
        equipment: ["проектор", "екран", "Wi-Fi"],
        photo: "assets/dragomanov-a101.png",
        description: "Лекційна аудиторія для занять, захистів і презентацій.",
        coords: { lat: 50.4443, lng: 30.5078 }
    },
    {
        name: "Кабінет 214",
        short: "214",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 2,
        floorLabel: "2 поверх",
        roomNumber: "214",
        capacity: 24,
        color: "#68d8d6",
        equipment: ["комп'ютери", "проектор", "Wi-Fi"],
        photo: "assets/dragomanov-214.png",
        description: "Комп'ютерний клас для практичних і лабораторних занять.",
        coords: { lat: 50.4443, lng: 30.5078 }
    },
    {
        name: "Зала 305",
        short: "305",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 3,
        floorLabel: "3 поверх",
        roomNumber: "305",
        capacity: 18,
        color: "#f28f3b",
        equipment: ["екран", "камера", "Wi-Fi"],
        photo: "assets/dragomanov-305.png",
        description: "Зал кафедри для засідань, консультацій і методичних семінарів.",
        coords: { lat: 50.4443, lng: 30.5078 }
    },
    {
        name: "Коворкінг",
        short: "2F",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 2,
        floorLabel: "2 поверх",
        roomNumber: "студентська зона",
        capacity: 30,
        color: "#9bde7e",
        equipment: ["робочі місця", "Wi-Fi", "зона очікування"],
        photo: "assets/dragomanov-coworking.png",
        description: "Відкрита зона для командної роботи та підготовки перед заняттями.",
        coords: { lat: 50.4443, lng: 30.5078 }
    },
    {
        name: "Актова зала 408",
        short: "408",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 4,
        floorLabel: "4 поверх",
        roomNumber: "408",
        capacity: 60,
        color: "#b7a6ff",
        equipment: ["проектор", "екран", "мікрофон", "Wi-Fi"],
        photo: "assets/dragomanov-408.png",
        description: "Великий зал для конференцій, відкритих лекцій і захистів.",
        coords: { lat: 50.4443, lng: 30.5078 }
    },
    {
        name: "Методичний кабінет 116",
        short: "116",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 1,
        floorLabel: "1 поверх",
        roomNumber: "116",
        capacity: 12,
        color: "#ff8b8b",
        equipment: ["дошка", "Wi-Fi", "робочий стіл"],
        photo: "assets/dragomanov-a101.png",
        description: "Невеликий кабінет для консультацій і зустрічей з малими групами.",
        coords: { lat: 50.4443, lng: 30.5078 }
    }
];

const reviews = [
    {
        text: "\"Обирали аудиторію 101 для захисту проєкту. На плані швидко знайшли поверх, кабінет і фото приміщення.\"",
        author: "Марина, Київ"
    },
    {
        text: "\"Потрібен був комп'ютерний клас для лабораторної. Через фільтри швидко знайшли кабінет 214 і перевірили обладнання.\"",
        author: "Андрій, Львів"
    },
    {
        text: "\"Для кафедральної зустрічі взяли залу 305. Сподобалось, що одразу видно поверх, місткість і фото залу.\"",
        author: "Олена, Дніпро"
    }
];

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addHours(time, hours) {
    const [hour, minute] = time.split(":").map(Number);
    const total = hour * 60 + minute + hours * 60;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function readForm(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function showApp(targetHash = "") {
    document.body.classList.remove("auth-pending");
    if (targetHash) {
        window.location.hash = targetHash;
        updateRoute();
        return;
    }

    updateRoute();
}

function showAuth(message = "") {
    document.body.classList.add("auth-pending");
    authStatus.textContent = message;
}

function saveCurrentUser(user) {
    currentUser = user;
    localStorage.setItem("kimnataUser", JSON.stringify(user));
}

function clearCurrentUser() {
    currentUser = null;
    localStorage.removeItem("kimnataUser");
}

function authHeaders() {
    return currentUser?.id ? { "X-User-Id": currentUser.id } : {};
}

async function requestJson(url, options = {}) {
    let response;

    try {
        response = await fetch(`${apiBase}${url}`, {
            credentials: "include",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders(),
                ...(options.headers || {})
            }
        });
    } catch (error) {
        throw new Error("Сервер не запущений. Відкрийте start_site.bat і перезавантажте сторінку.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Помилка запиту.");
    }

    return data;
}

async function requestAuth(url, payload) {
    return requestJson(url, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

function canManageAll() {
    return currentUser && ["admin", "moderator"].includes(currentUser.role);
}

function getPageId() {
    const hash = window.location.hash.replace("#", "");
    const section = hash ? document.getElementById(hash) : null;

    if (!section || !section.matches("main > .section[id]")) {
        return "home";
    }

    if (hash === "admin" && !canManageAll()) {
        return "home";
    }

    return hash;
}

function updateRoute() {
    const pageId = getPageId();

    document.body.classList.add("app-routed");
    pageSections.forEach((section) => {
        section.classList.toggle("active-section", section.id === pageId);
    });
    navPageLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${pageId}`);
    });

    if (window.location.hash.replace("#", "") !== pageId) {
        history.replaceState(null, "", `#${pageId}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function getRoom(name) {
    return rooms.find((room) => room.name === name) || fallbackRooms.find((room) => room.name === name) || rooms[0] || fallbackRooms[0];
}

function roomMapUrl(room) {
    if (room.coords && Number.isFinite(room.coords.lat) && Number.isFinite(room.coords.lng)) {
        return `https://maps.google.com/?q=${room.coords.lat},${room.coords.lng}`;
    }

    const query = `${room.name}, ${room.address}`;
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

function renderRoomSelect() {
    if (!bookingRoom) {
        return;
    }

    const selected = bookingRoom.value || "Аудиторія 101";
    bookingRoom.innerHTML = rooms.map((room) => `<option value="${room.name}">${room.name} - ${room.floorLabel || `${room.floor || ""} поверх`}, каб. ${room.roomNumber || room.short}</option>`).join("");
    bookingRoom.value = rooms.some((room) => room.name === selected) ? selected : rooms[0].name;

    if (adminBookingRoom) {
        const adminSelected = adminBookingRoom.value || bookingRoom.value;
        adminBookingRoom.innerHTML = rooms.map((room) => `<option value="${room.name}">${room.name} - ${room.floorLabel || `${room.floor || ""} поверх`}, каб. ${room.roomNumber || room.short}</option>`).join("");
        adminBookingRoom.value = rooms.some((room) => room.name === adminSelected) ? adminSelected : rooms[0].name;
    }
}

function renderVenueList() {
    if (!venueList || !bookingRoom) {
        return;
    }

    venueList.innerHTML = rooms.map((room) => `
        <button class="venue-item${bookingRoom.value === room.name ? " active" : ""}" type="button" data-room="${room.name}">
            <span style="background:${room.color}">${room.short}</span>
            <strong>${room.name}</strong>
            <small>${room.floorLabel || `${room.floor || ""} поверх`} · ${room.roomNumber || room.short} · ${room.capacity} місць</small>
        </button>
    `).join("");
}

function selectRoom(name) {
    if (!bookingRoom || rooms.length === 0) {
        return;
    }

    const room = getRoom(name);

    bookingRoom.value = room.name;
    mapSpaces.forEach((space) => {
        space.classList.toggle("active", space.dataset.mapRoom === room.name);
    });

    if (mapTitle && mapAddress) {
        const equipment = (room.equipment || []).join(", ");
        mapTitle.textContent = room.name;
        mapAddress.textContent = `${room.floorLabel || `${room.floor || ""} поверх`} · каб. ${room.roomNumber || room.short} · ${room.capacity} місць · ${equipment}`;
    }

    if (mapPhoto) {
        mapPhoto.src = room.photo || "assets/dragomanov-a101.png";
        mapPhoto.alt = `Фото приміщення ${room.name}`;
    }

    if (mapDescription) {
        mapDescription.textContent = room.description || room.address;
    }

    renderVenueList();
    renderCalendar();
}

function renderCalendar() {
    if (!bookingCalendar || !calendarTitle || !bookingRoom) {
        return;
    }

    const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const monthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    const leadingDays = (monthStart.getDay() + 6) % 7;
    const totalCells = Math.ceil((leadingDays + monthEnd.getDate()) / 7) * 7;
    const selectedRoom = bookingRoom.value;
    const monthName = monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });

    calendarTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    bookingCalendar.innerHTML = "";

    for (let index = 0; index < totalCells; index += 1) {
        const dayNumber = index - leadingDays + 1;
        const cell = document.createElement("div");

        cell.className = "calendar-day";

        if (dayNumber < 1 || dayNumber > monthEnd.getDate()) {
            cell.classList.add("muted-day");
            bookingCalendar.append(cell);
            continue;
        }

        const cellDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), dayNumber);
        const dateKey = formatDate(cellDate);
        const dayBookings = bookings.filter((booking) => booking.date === dateKey && booking.status === "approved");
        const selectedRoomBooked = dayBookings.some((booking) => booking.room === selectedRoom);

        if (bookingDate && dateKey === bookingDate.value) {
            cell.classList.add("selected-day");
        }

        if (selectedRoomBooked) {
            cell.classList.add("booked-day");
        }

        cell.innerHTML = `
            <button type="button" data-date="${dateKey}">
                <strong>${dayNumber}</strong>
                <span>${dayBookings.length ? `${dayBookings.length} бронь` : "вільно"}</span>
            </button>
            <div class="calendar-events">
                ${dayBookings.map((booking) => {
                    const room = getRoom(booking.room);
                    return `<small style="border-color:${room.color}">${booking.start}-${booking.end} ${booking.room}</small>`;
                }).join("")}
            </div>
        `;
        bookingCalendar.append(cell);
    }
}

function qrMarkup(room, token) {
    const mapUrl = roomMapUrl(room);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${encodeURIComponent(mapUrl)}`;

    return `
        <a class="qr-box" href="${mapUrl}" target="_blank" rel="noopener" title="Відкрити ${room.name} на Google Maps">
            <img src="${qrUrl}" alt="QR-код Google Maps для ${room.name}" loading="lazy">
            <span>Google Maps</span>
        </a>
    `;
}

function statusLabel(status) {
    const labels = {
        pending: "На розгляді",
        approved: "Одобрено",
        rejected: "Відхилено",
        cancelled: "Скасовано",
        active: "Одобрено"
    };
    return labels[status] || status;
}

function bookingCard(booking, allowCancel, allowApproval = false, allowDelete = false) {
    const room = getRoom(booking.room);
    const inactive = ["cancelled", "rejected"].includes(booking.status);
    return `
        <article class="booking-card${inactive ? " cancelled" : ""}">
            <div>
                <span class="booking-badge status-${booking.status}" style="border-color:${room.color}">${statusLabel(booking.status)}</span>
                <h3>${booking.title}</h3>
                <p>${booking.room} · ${booking.date} · ${booking.start}-${booking.end}</p>
                <small>${room.address}</small>
            </div>
            ${qrMarkup(room, booking.qrToken)}
            <div class="booking-actions">
                <span>${booking.qrToken}</span>
                ${allowApproval && booking.status === "pending" ? `<button type="button" data-approve-booking="${booking.id}">Одобрити</button><button type="button" data-reject-booking="${booking.id}">Відхилити</button>` : ""}
                ${allowCancel && ["pending", "approved"].includes(booking.status) ? `<button type="button" data-cancel-booking="${booking.id}">Скасувати</button>` : ""}
                ${allowDelete ? `<button type="button" data-delete-booking="${booking.id}">Видалити</button>` : ""}
            </div>
        </article>
    `;
}

function renderMyBookings() {
    if (!myBookingsList) {
        return;
    }

    const active = myBookings.filter((booking) => ["pending", "approved"].includes(booking.status)).length;
    const cancelled = myBookings.filter((booking) => booking.status === "cancelled").length;

    summaryActive.textContent = active;
    summaryCancelled.textContent = cancelled;
    summaryUserRole.textContent = currentUser?.role || "user";
    myBookingsCount.textContent = `${myBookings.length} записів`;
    myBookingsList.innerHTML = myBookings.length
        ? myBookings.map((booking) => bookingCard(booking, true)).join("")
        : `<p class="empty-state">Поки немає власних бронювань.</p>`;
}

function renderAdmin(summary) {
    if (!adminSection || !adminStats || !adminTable || !adminUsers) {
        return;
    }

    const visible = canManageAll();
    adminSection.classList.toggle("hidden", !visible);
    adminLink?.classList.toggle("hidden", !visible);
    adminShortcut?.classList.toggle("hidden", !visible);

    if (!visible || !summary) {
        updateRoute();
        return;
    }

    adminStats.innerHTML = `
        <article><strong>${summary.stats.rooms}</strong><span>приміщень</span></article>
        <article><strong>${summary.stats.pending}</strong><span>заявки</span></article>
        <article><strong>${summary.stats.approved}</strong><span>одобрені</span></article>
        <article><strong>${summary.stats.cancelled}</strong><span>скасовані</span></article>
        <article><strong>${summary.stats.rejected}</strong><span>відхилені</span></article>
        <article><strong>${summary.stats.users}</strong><span>користувачі</span></article>
    `;
    adminTable.innerHTML = summary.bookings.length
        ? summary.bookings.map((booking) => bookingCard(booking, ["pending", "approved"].includes(booking.status), true, true)).join("")
        : `<p class="empty-state">У системі ще немає бронювань.</p>`;
    adminUsers.innerHTML = summary.users.length
        ? summary.users.map((user) => `
            <article class="admin-user-card${user.blocked ? " blocked" : ""}">
                <div>
                    <strong>${user.name}</strong>
                    <span>${user.email}</span>
                    <small>${user.role}${user.blocked ? " · заблокований" : ""}</small>
                </div>
                ${user.role === "admin" ? `<em>Адміністратор</em>` : user.blocked
                    ? `<button type="button" data-unblock-user="${user.id}">Зняти блокування</button>`
                    : `<button type="button" data-block-user="${user.id}">Заблокувати</button>`}
            </article>
        `).join("")
        : `<p class="empty-state">Користувачів ще немає.</p>`;
    updateRoute();
}

async function loadRooms() {
    try {
        const data = await requestJson("/api/rooms");
        rooms = data.rooms || fallbackRooms;
    } catch (error) {
        rooms = fallbackRooms;
    }

    renderRoomSelect();
    selectRoom(bookingRoom?.value || rooms[0].name);
}

async function loadBookings() {
    const data = await requestJson("/api/bookings");
    bookings = data.bookings || [];
    renderCalendar();
}

async function loadMyBookings() {
    if (!currentUser) {
        return;
    }

    const data = await requestJson("/api/my-bookings");
    myBookings = data.bookings || [];
    renderMyBookings();
}

async function loadAdmin() {
    renderAdmin(null);

    if (!canManageAll()) {
        return;
    }

    const data = await requestJson("/api/admin/summary");
    renderAdmin(data);
}

async function refreshAppData() {
    await loadRooms();
    await loadBookings();
    await loadMyBookings();
    await loadAdmin();
}

function initBooking() {
    if (!bookingForm) {
        return;
    }

    const today = new Date();
    const todayValue = formatDate(today);

    bookingDate.min = todayValue;
    bookingDate.value = bookingDate.value || todayValue;
    bookingTime.value = bookingTime.value || "12:00";
    bookingEnd.value = bookingEnd.value || addHours(bookingTime.value, 1);
    if (adminBookingDate && adminBookingStart && adminBookingEnd) {
        adminBookingDate.min = todayValue;
        adminBookingDate.value = adminBookingDate.value || todayValue;
        adminBookingStart.value = adminBookingStart.value || "12:00";
        adminBookingEnd.value = adminBookingEnd.value || addHours(adminBookingStart.value, 1);
    }
    calendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
}

async function checkSession() {
    try {
        const response = await fetch(`${apiBase}/api/me`, {
            cache: "no-store",
            credentials: "include",
            headers: authHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            saveCurrentUser(data.user);
            showApp();
            await refreshAppData();
            return;
        }
    } catch (error) {
        authStatus.textContent = "Запустіть сервер і відкрийте http://localhost:3000";
        return;
    }

    showAuth();
}

authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const isLogin = tab.dataset.authMode === "login";

        authTabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        loginForm.classList.toggle("hidden", !isLogin);
        registerForm.classList.toggle("hidden", isLogin);
        authStatus.textContent = "";
    });
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authStatus.textContent = "Перевіряємо дані...";

    try {
        const data = await requestAuth("/api/login", readForm(loginForm));
        saveCurrentUser(data.user);
        loginForm.reset();
        showApp("home");
        await refreshAppData();
    } catch (error) {
        authStatus.textContent = error.message;
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    authStatus.textContent = "Створюємо акаунт...";

    try {
        const data = await requestAuth("/api/register", readForm(registerForm));
        saveCurrentUser(data.user);
        registerForm.reset();
        showApp("home");
        await refreshAppData();
    } catch (error) {
        authStatus.textContent = error.message;
    }
});

logoutButton.addEventListener("click", async () => {
    await fetch(`${apiBase}/api/logout`, {
        method: "POST",
        credentials: "include"
    });
    clearCurrentUser();
    showAuth("Ви вийшли з акаунта.");
});

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
    });
});

window.addEventListener("hashchange", updateRoute);

function updateProducts() {
    const query = searchInput.value.trim().toLowerCase();

    products.forEach((product) => {
        const matchesFilter = activeFilter === "all" || product.dataset.category === activeFilter;
        const matchesSearch = product.dataset.name.toLowerCase().includes(query);
        product.classList.toggle("hidden", !matchesFilter || !matchesSearch);
    });
}

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        filters.forEach((button) => button.classList.remove("active"));
        filter.classList.add("active");
        activeFilter = filter.dataset.filter;
        updateProducts();
    });
});

searchInput.addEventListener("input", updateProducts);

document.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
        const name = button.dataset.product;
        const price = Number(button.dataset.price);
        const item = document.createElement("li");

        item.innerHTML = `<span>${name}</span><strong>${price.toLocaleString("uk-UA")} грн/год</strong>`;
        cartList.append(item);

        total += price;
        totalElement.textContent = total.toLocaleString("uk-UA");
        cartMessage.textContent = "Простір додано до бронювання.";

        if (rooms.some((room) => room.name === name)) {
            selectRoom(name);
        }
    });
});

document.querySelector(".checkout").addEventListener("click", () => {
    if (cartList.children.length > 0) {
        cartMessage.textContent = "Перейдіть до форми бронювання та оберіть дату.";
        window.location.hash = "booking";
        return;
    }

    cartMessage.textContent = "Спочатку додайте простір до бронювання.";
});

bookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    bookingStatus.textContent = "Перевіряємо доступність...";

    try {
        const payload = readForm(bookingForm);
        const data = await requestJson("/api/bookings", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        calendarDate = new Date(`${payload.date}T00:00:00`);
        bookingStatus.textContent = data.booking?.status === "approved"
            ? "Бронювання автоматично одобрено за навчальним типом події."
            : "Назва події потребує перевірки. Заявку відправлено адміністратору.";
        await refreshAppData();
    } catch (error) {
        bookingStatus.textContent = error.message.includes("увійти")
            ? "Щоб відправити заявку, спочатку увійдіть у свій акаунт. Поточна форма не скинута."
            : error.message;
    }
});

bookingTime?.addEventListener("change", () => {
    if (bookingTime.value && (!bookingEnd.value || bookingEnd.value <= bookingTime.value)) {
        bookingEnd.value = addHours(bookingTime.value, 1);
    }
});

adminBookingStart?.addEventListener("change", () => {
    if (adminBookingStart.value && (!adminBookingEnd.value || adminBookingEnd.value <= adminBookingStart.value)) {
        adminBookingEnd.value = addHours(adminBookingStart.value, 1);
    }
});

adminBookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    adminBookingStatus.textContent = "Створюємо бронь...";

    try {
        await requestJson("/api/bookings", {
            method: "POST",
            body: JSON.stringify(readForm(adminBookingForm))
        });
        adminBookingStatus.textContent = "Бронь додано та одобрено.";
        await refreshAppData();
    } catch (error) {
        adminBookingStatus.textContent = error.message;
    }
});

bookingRoom?.addEventListener("change", () => {
    selectRoom(bookingRoom.value);
});

bookingDate?.addEventListener("change", () => {
    if (bookingDate.value) {
        const selectedDate = new Date(`${bookingDate.value}T00:00:00`);
        calendarDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        renderCalendar();
    }
});

mapSpaces.forEach((space) => {
    space.addEventListener("click", () => {
        selectRoom(space.dataset.mapRoom);
    });
});

venueList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-room]");
    if (button) {
        selectRoom(button.dataset.room);
    }
});

calendarNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
        calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + Number(button.dataset.calendarStep), 1);
        renderCalendar();
    });
});

bookingCalendar?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-date]");
    if (!button) {
        return;
    }

    bookingDate.value = button.dataset.date;
    renderCalendar();
});

document.addEventListener("click", async (event) => {
    const blockButton = event.target.closest("[data-block-user]");
    if (blockButton) {
        try {
            await requestJson(`/api/users/${blockButton.dataset.blockUser}/block`, { method: "PATCH" });
            await refreshAppData();
        } catch (error) {
            alert(error.message);
        }
        return;
    }

    const unblockButton = event.target.closest("[data-unblock-user]");
    if (unblockButton) {
        try {
            await requestJson(`/api/users/${unblockButton.dataset.unblockUser}/unblock`, { method: "PATCH" });
            await refreshAppData();
        } catch (error) {
            alert(error.message);
        }
        return;
    }

    const deleteButton = event.target.closest("[data-delete-booking]");
    if (deleteButton) {
        try {
            await requestJson(`/api/bookings/${deleteButton.dataset.deleteBooking}`, { method: "DELETE" });
            await refreshAppData();
        } catch (error) {
            alert(error.message);
        }
        return;
    }

    const approveButton = event.target.closest("[data-approve-booking]");
    if (approveButton) {
        try {
            await requestJson(`/api/bookings/${approveButton.dataset.approveBooking}/approve`, { method: "PATCH" });
            await refreshAppData();
        } catch (error) {
            alert(error.message);
        }
        return;
    }

    const rejectButton = event.target.closest("[data-reject-booking]");
    if (rejectButton) {
        try {
            await requestJson(`/api/bookings/${rejectButton.dataset.rejectBooking}/reject`, { method: "PATCH" });
            await refreshAppData();
        } catch (error) {
            alert(error.message);
        }
        return;
    }

    const cancelButton = event.target.closest("[data-cancel-booking]");
    if (!cancelButton) {
        return;
    }

    try {
        await requestJson(`/api/bookings/${cancelButton.dataset.cancelBooking}/cancel`, { method: "PATCH" });
        await refreshAppData();
    } catch (error) {
        alert(error.message);
    }
});

function showReview(index) {
    reviewText.textContent = reviews[index].text;
    reviewAuthor.textContent = reviews[index].author;
}

document.querySelector(".next-review").addEventListener("click", () => {
    reviewIndex = (reviewIndex + 1) % reviews.length;
    showReview(reviewIndex);
});

document.querySelector(".prev-review").addEventListener("click", () => {
    reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
    showReview(reviewIndex);
});

rooms = fallbackRooms;
initBooking();
renderRoomSelect();
selectRoom("Аудиторія 101");
checkSession();
