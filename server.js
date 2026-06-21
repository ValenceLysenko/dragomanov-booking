const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const sessions = new Map();
const DEFAULT_ADMIN = {
    name: "Administrator",
    email: "admin@kimnata.local",
    password: "Admin123!"
};

const rooms = [
    {
        id: "auditorium-101",
        name: "Аудиторія 101",
        type: "auditorium",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 1,
        floorLabel: "1 поверх",
        roomNumber: "101",
        capacity: 40,
        price: 0,
        equipment: ["проектор", "екран", "Wi-Fi"],
        coords: { lat: 50.4443, lng: 30.5078 },
        map: { x: 22, y: 78 },
        short: "101",
        photo: "assets/dragomanov-a101.png",
        description: "Лекційна аудиторія для занять, захистів і презентацій.",
        color: "#f4c542"
    },
    {
        id: "cabinet-214",
        name: "Кабінет 214",
        type: "computer",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 2,
        floorLabel: "2 поверх",
        roomNumber: "214",
        capacity: 24,
        price: 0,
        equipment: ["комп'ютери", "проектор", "Wi-Fi"],
        coords: { lat: 50.4443, lng: 30.5078 },
        map: { x: 18, y: 54 },
        short: "214",
        photo: "assets/dragomanov-214.png",
        description: "Комп'ютерний клас для практичних і лабораторних занять.",
        color: "#68d8d6"
    },
    {
        id: "hall-305",
        name: "Зала 305",
        type: "hall",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 3,
        floorLabel: "3 поверх",
        roomNumber: "305",
        capacity: 18,
        price: 0,
        equipment: ["екран", "камера", "Wi-Fi"],
        coords: { lat: 50.4443, lng: 30.5078 },
        map: { x: 28, y: 31 },
        short: "305",
        photo: "assets/dragomanov-305.png",
        description: "Зал кафедри для засідань, консультацій і методичних семінарів.",
        color: "#f28f3b"
    },
    {
        id: "coworking-2f",
        name: "Коворкінг",
        type: "hall",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 2,
        floorLabel: "2 поверх",
        roomNumber: "студентська зона",
        capacity: 30,
        price: 0,
        equipment: ["робочі місця", "Wi-Fi", "зона очікування"],
        coords: { lat: 50.4443, lng: 30.5078 },
        map: { x: 52, y: 54 },
        short: "2F",
        photo: "assets/dragomanov-coworking.png",
        description: "Відкрита зона для командної роботи та підготовки перед заняттями.",
        color: "#9bde7e"
    },
    {
        id: "assembly-hall-408",
        name: "Актова зала 408",
        type: "hall",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 4,
        floorLabel: "4 поверх",
        roomNumber: "408",
        capacity: 60,
        price: 0,
        equipment: ["проектор", "екран", "мікрофон", "Wi-Fi"],
        coords: { lat: 50.4443, lng: 30.5078 },
        map: { x: 48, y: 8 },
        short: "408",
        photo: "assets/dragomanov-408.png",
        description: "Великий зал для конференцій, відкритих лекцій і захистів.",
        color: "#b7a6ff"
    },
    {
        id: "methodical-116",
        name: "Методичний кабінет 116",
        type: "auditorium",
        address: "НПУ ім. М. П. Драгоманова, навчальний корпус",
        floor: 1,
        floorLabel: "1 поверх",
        roomNumber: "116",
        capacity: 12,
        price: 0,
        equipment: ["дошка", "Wi-Fi", "робочий стіл"],
        coords: { lat: 50.4443, lng: 30.5078 },
        map: { x: 54, y: 78 },
        short: "116",
        photo: "assets/dragomanov-a101.png",
        description: "Невеликий кабінет для консультацій і зустрічей з малими групами.",
        color: "#ff8b8b"
    }
];

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8"
};

function ensureDataFiles() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    for (const file of [USERS_FILE, BOOKINGS_FILE]) {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, "[]\n", "utf8");
        }
    }
}

function readJson(file) {
    ensureDataFiles();
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
    ensureDataFiles();
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function readUsers() {
    return readJson(USERS_FILE);
}

function writeUsers(users) {
    writeJson(USERS_FILE, users);
}

function ensureDefaultAdmin() {
    const users = readUsers();
    const existing = users.find((user) => user.email === DEFAULT_ADMIN.email);

    if (existing) {
        if (existing.role !== "admin") {
            existing.role = "admin";
            writeUsers(users);
        }
        return;
    }

    const { salt, hash } = hashPassword(DEFAULT_ADMIN.password);
    users.unshift({
        id: crypto.randomUUID(),
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        role: "admin",
        salt,
        passwordHash: hash,
        createdAt: new Date().toISOString()
    });
    writeUsers(users);
}

function readBookings() {
    return readJson(BOOKINGS_FILE).map(normalizeBooking);
}

function writeBookings(bookings) {
    writeJson(BOOKINGS_FILE, bookings.map(normalizeBooking));
}

function getJsonHeaders(req) {
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    };

    if (req && req.headers.origin) {
        headers["Access-Control-Allow-Origin"] = req.headers.origin;
        headers["Access-Control-Allow-Credentials"] = "true";
        headers["Access-Control-Allow-Headers"] = "Content-Type, X-User-Id";
        headers["Access-Control-Allow-Methods"] = "GET,POST,PATCH,DELETE,OPTIONS";
        headers.Vary = "Origin";
    }

    return headers;
}

function sendJson(req, res, status, data) {
    res.writeHead(status, getJsonHeaders(req));
    res.end(JSON.stringify(data));
}

function parseCookies(req) {
    return Object.fromEntries(
        (req.headers.cookie || "")
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean)
            .map((item) => {
                const index = item.indexOf("=");
                return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
            })
    );
}

function roleForUser(user, users = readUsers()) {
    if (!user) {
        return "guest";
    }

    if (user.role) {
        return user.role;
    }

    return users[0] && users[0].id === user.id ? "admin" : "user";
}

function getSessionUser(req) {
    const token = parseCookies(req).session;
    const headerUserId = req.headers["x-user-id"];

    const sessionUser = token ? sessions.get(token) : null;
    if (sessionUser) {
        return sessionUser;
    }

    const users = readUsers();
    const user = users.find((item) => item.id === token) || users.find((item) => item.id === headerUserId) || (users.length === 1 ? users[0] : null);
    if (!user || user.blocked) {
        return null;
    }

    return { id: user.id, name: user.name, email: user.email, role: roleForUser(user, users) };
}

function requireUser(req, res) {
    const user = getSessionUser(req);
    if (!user) {
        sendJson(req, res, 401, { message: "Потрібно увійти." });
        return null;
    }
    return user;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
    return { salt, hash };
}

function verifyPassword(password, user) {
    const { hash } = hashPassword(password, user.salt);
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function createSession(res, user) {
    const token = user.id;
    const safeUser = { id: user.id, name: user.name, email: user.email, role: roleForUser(user) };

    sessions.set(token, safeUser);
    res.setHeader("Set-Cookie", `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400`);
    return safeUser;
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 100000) {
                reject(new Error("Request body is too large"));
                req.destroy();
            }
        });
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

function minutes(time) {
    const [hours, mins] = String(time || "").split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(mins)) {
        return NaN;
    }
    return hours * 60 + mins;
}

function normalizeBooking(booking) {
    const start = booking.start || booking.time || "12:00";
    const end = booking.end || booking.endTime || addHours(start, 1);
    const status = booking.status === "active" ? "approved" : (booking.status || "pending");
    return {
        id: booking.id,
        room: booking.room,
        title: booking.title || booking.comment || "Бронювання",
        date: booking.date,
        start,
        end,
        phone: booking.phone || "",
        comment: booking.comment || "",
        status,
        userEmail: booking.userEmail || "local-user",
        qrToken: booking.qrToken || makeQrToken(booking.room, booking.date, start),
        createdAt: booking.createdAt || new Date().toISOString(),
        approvedAt: booking.approvedAt || null,
        approvedBy: booking.approvedBy || null,
        rejectedAt: booking.rejectedAt || null,
        rejectedBy: booking.rejectedBy || null,
        cancelledAt: booking.cancelledAt || null
    };
}

function addHours(time, count) {
    const total = minutes(time) + count * 60;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
    return minutes(aStart) < minutes(bEnd) && minutes(bStart) < minutes(aEnd);
}

function makeQrToken(room, date, start) {
    return crypto.createHash("sha256").update(`${room}:${date}:${start}:${crypto.randomUUID()}`).digest("hex").slice(0, 18).toUpperCase();
}

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleForUser(user),
        blocked: Boolean(user.blocked)
    };
}

function canManageAll(user) {
    return user && ["admin", "moderator"].includes(user.role);
}

const autoApprovedEventKeywords = [
    "лекція",
    "лекция",
    "лабораторна робота",
    "лабораторная работа",
    "лабораторна",
    "лабораторная",
    "практична робота",
    "практическая работа",
    "практичне заняття",
    "практическое занятие",
    "екзамен",
    "экзамен",
    "іспит",
    "сесія",
    "сессия",
    "семінар",
    "семинар",
    "залік",
    "зачет",
    "консультація",
    "консультация",
    "колоквіум",
    "коллоквиум",
    "модуль",
    "модульна контрольна",
    "тестування",
    "тестирование",
    "захист",
    "защита",
    "курсова",
    "курсовая",
    "дипломна",
    "дипломная"
];

function normalizeEventTitle(title) {
    return String(title || "")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^\p{L}\p{N}\s'-]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function isAutoApprovedEventTitle(title) {
    const normalizedTitle = normalizeEventTitle(title);

    return autoApprovedEventKeywords.some((keyword) => normalizedTitle.includes(normalizeEventTitle(keyword)));
}

async function handleApi(req, res) {
    if (req.method === "OPTIONS") {
        res.writeHead(204, getJsonHeaders(req));
        res.end();
        return;
    }

    if (req.method === "GET" && req.url === "/api/health") {
        sendJson(req, res, 200, { ok: true });
        return;
    }

    if (req.method === "GET" && req.url === "/api/rooms") {
        sendJson(req, res, 200, { rooms });
        return;
    }

    if (req.method === "GET" && req.url === "/api/me") {
        const user = getSessionUser(req);
        sendJson(req, res, user ? 200 : 401, user ? { user } : { message: "Потрібно увійти." });
        return;
    }

    if (req.method === "POST" && req.url === "/api/logout") {
        const token = parseCookies(req).session;
        if (token) {
            sessions.delete(token);
        }
        res.setHeader("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
        sendJson(req, res, 200, { ok: true });
        return;
    }

    if (req.method === "POST" && req.url === "/api/register") {
        try {
            const body = await readBody(req);
            const name = String(body.name || "").trim();
            const email = String(body.email || "").trim().toLowerCase();
            const password = String(body.password || "");
            const users = readUsers();

            if (!name || !email || password.length < 6) {
                sendJson(req, res, 400, { message: "Вкажіть ім'я, email і пароль від 6 символів." });
                return;
            }

            if (users.some((user) => user.email === email)) {
                sendJson(req, res, 409, { message: "Такий email вже зареєстрований. Використайте вхід." });
                return;
            }

            const { salt, hash } = hashPassword(password);
            const user = {
                id: crypto.randomUUID(),
                name,
                email,
                role: users.length === 0 ? "admin" : "user",
                salt,
                passwordHash: hash,
                createdAt: new Date().toISOString()
            };

            users.push(user);
            writeUsers(users);
            sendJson(req, res, 201, { user: createSession(res, user) });
        } catch (error) {
            sendJson(req, res, 400, { message: "Не вдалося створити акаунт." });
        }
        return;
    }

    if (req.method === "POST" && req.url === "/api/login") {
        try {
            const body = await readBody(req);
            const email = String(body.email || "").trim().toLowerCase();
            const password = String(body.password || "");
            const user = readUsers().find((item) => item.email === email);

            if (!user || !verifyPassword(password, user)) {
                sendJson(req, res, 401, { message: "Невірний email або пароль." });
                return;
            }

            if (user.blocked) {
                sendJson(req, res, 403, { message: "Користувача заблоковано адміністратором." });
                return;
            }

            sendJson(req, res, 200, { user: createSession(res, user) });
        } catch (error) {
            sendJson(req, res, 400, { message: "Не вдалося виконати вхід." });
        }
        return;
    }

    if (req.method === "GET" && req.url === "/api/bookings") {
        const user = getSessionUser(req);
        const allBookings = readBookings();
        const bookings = canManageAll(user) ? allBookings : allBookings.filter((booking) => booking.status === "approved");
        sendJson(req, res, 200, { bookings });
        return;
    }

    if (req.method === "GET" && req.url === "/api/my-bookings") {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }
        sendJson(req, res, 200, { bookings: readBookings().filter((booking) => booking.userEmail === user.email) });
        return;
    }

    if (req.method === "POST" && req.url === "/api/bookings") {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        try {
            const body = await readBody(req);
            const room = String(body.room || "").trim();
            const title = String(body.title || body.comment || "Бронювання").trim();
            const date = String(body.date || "").trim();
            const start = String(body.start || body.time || "").trim();
            const end = String(body.end || "").trim();
            const phone = String(body.phone || "").trim();
            const comment = String(body.comment || "").trim();
            const startMinutes = minutes(start);
            const endMinutes = minutes(end);

            if (!rooms.some((item) => item.name === room) || !date || !phone || !Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
                sendJson(req, res, 400, { message: "Заповніть приміщення, дату, час початку, час завершення і телефон." });
                return;
            }

            if (endMinutes <= startMinutes) {
                sendJson(req, res, 400, { message: "Час завершення має бути пізніше часу початку." });
                return;
            }

            const bookings = readBookings();
            const conflict = bookings.find((booking) =>
                ["pending", "approved"].includes(booking.status) &&
                booking.room === room &&
                booking.date === date &&
                overlaps(start, end, booking.start, booking.end)
            );

            if (conflict) {
                sendJson(req, res, 409, { message: `Конфлікт часу: ${room} вже зайнятий ${conflict.start}-${conflict.end}.` });
                return;
            }

            const adminCreated = canManageAll(user);
            const autoApproved = adminCreated || isAutoApprovedEventTitle(title);
            const booking = normalizeBooking({
                id: crypto.randomUUID(),
                room,
                title,
                date,
                start,
                end,
                phone,
                comment,
                status: autoApproved ? "approved" : "pending",
                userEmail: user.email,
                qrToken: makeQrToken(room, date, start),
                createdAt: new Date().toISOString(),
                approvedAt: autoApproved ? new Date().toISOString() : null,
                approvedBy: adminCreated ? user.email : (autoApproved ? "auto-filter" : null)
            });

            bookings.push(booking);
            writeBookings(bookings);
            sendJson(req, res, 201, { booking });
        } catch (error) {
            sendJson(req, res, 400, { message: "Не вдалося створити бронювання." });
        }
        return;
    }

    const approveMatch = req.url.match(/^\/api\/bookings\/([^/]+)\/approve$/);
    if (req.method === "PATCH" && approveMatch) {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        if (!canManageAll(user)) {
            sendJson(req, res, 403, { message: "Недостатньо прав доступу." });
            return;
        }

        const bookings = readBookings();
        const booking = bookings.find((item) => item.id === approveMatch[1]);

        if (!booking) {
            sendJson(req, res, 404, { message: "Заявку не знайдено." });
            return;
        }

        const conflict = bookings.find((item) =>
            item.id !== booking.id &&
            item.status === "approved" &&
            item.room === booking.room &&
            item.date === booking.date &&
            overlaps(item.start, item.end, booking.start, booking.end)
        );

        if (conflict) {
            sendJson(req, res, 409, { message: `Неможливо одобрити: вже є бронь ${conflict.start}-${conflict.end}.` });
            return;
        }

        booking.status = "approved";
        booking.approvedAt = new Date().toISOString();
        booking.approvedBy = user.email;
        writeBookings(bookings);
        sendJson(req, res, 200, { booking });
        return;
    }

    const rejectMatch = req.url.match(/^\/api\/bookings\/([^/]+)\/reject$/);
    if (req.method === "PATCH" && rejectMatch) {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        if (!canManageAll(user)) {
            sendJson(req, res, 403, { message: "Недостатньо прав доступу." });
            return;
        }

        const bookings = readBookings();
        const booking = bookings.find((item) => item.id === rejectMatch[1]);

        if (!booking) {
            sendJson(req, res, 404, { message: "Заявку не знайдено." });
            return;
        }

        booking.status = "rejected";
        booking.rejectedAt = new Date().toISOString();
        booking.rejectedBy = user.email;
        writeBookings(bookings);
        sendJson(req, res, 200, { booking });
        return;
    }

    const cancelMatch = req.url.match(/^\/api\/bookings\/([^/]+)\/cancel$/);
    if (req.method === "PATCH" && cancelMatch) {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        const bookings = readBookings();
        const booking = bookings.find((item) => item.id === cancelMatch[1]);

        if (!booking) {
            sendJson(req, res, 404, { message: "Бронювання не знайдено." });
            return;
        }

        if (!canManageAll(user) && booking.userEmail !== user.email) {
            sendJson(req, res, 403, { message: "Не можна скасувати чуже бронювання." });
            return;
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date().toISOString();
        writeBookings(bookings);
        sendJson(req, res, 200, { booking });
        return;
    }

    const deleteBookingMatch = req.url.match(/^\/api\/bookings\/([^/]+)$/);
    if (req.method === "DELETE" && deleteBookingMatch) {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        if (!canManageAll(user)) {
            sendJson(req, res, 403, { message: "Недостатньо прав доступу." });
            return;
        }

        const bookings = readBookings();
        const nextBookings = bookings.filter((item) => item.id !== deleteBookingMatch[1]);

        if (bookings.length === nextBookings.length) {
            sendJson(req, res, 404, { message: "Заявку не знайдено." });
            return;
        }

        writeBookings(nextBookings);
        sendJson(req, res, 200, { ok: true });
        return;
    }

    const blockUserMatch = req.url.match(/^\/api\/users\/([^/]+)\/block$/);
    if (req.method === "PATCH" && blockUserMatch) {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        if (!canManageAll(user)) {
            sendJson(req, res, 403, { message: "Недостатньо прав доступу." });
            return;
        }

        const users = readUsers();
        const target = users.find((item) => item.id === blockUserMatch[1]);

        if (!target) {
            sendJson(req, res, 404, { message: "Користувача не знайдено." });
            return;
        }

        if (target.id === user.id) {
            sendJson(req, res, 400, { message: "Не можна заблокувати власний акаунт." });
            return;
        }

        target.blocked = true;
        target.blockedAt = new Date().toISOString();
        target.blockedBy = user.email;
        writeUsers(users);
        sendJson(req, res, 200, { user: publicUser(target) });
        return;
    }

    const unblockUserMatch = req.url.match(/^\/api\/users\/([^/]+)\/unblock$/);
    if (req.method === "PATCH" && unblockUserMatch) {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        if (!canManageAll(user)) {
            sendJson(req, res, 403, { message: "Недостатньо прав доступу." });
            return;
        }

        const users = readUsers();
        const target = users.find((item) => item.id === unblockUserMatch[1]);

        if (!target) {
            sendJson(req, res, 404, { message: "Користувача не знайдено." });
            return;
        }

        target.blocked = false;
        target.unblockedAt = new Date().toISOString();
        target.unblockedBy = user.email;
        writeUsers(users);
        sendJson(req, res, 200, { user: publicUser(target) });
        return;
    }

    if (req.method === "GET" && req.url === "/api/admin/summary") {
        const user = requireUser(req, res);
        if (!user) {
            return;
        }

        if (!canManageAll(user)) {
            sendJson(req, res, 403, { message: "Недостатньо прав доступу." });
            return;
        }

        const bookings = readBookings();
        sendJson(req, res, 200, {
            rooms,
            users: readUsers().map(publicUser),
            bookings,
            stats: {
                rooms: rooms.length,
                pending: bookings.filter((booking) => booking.status === "pending").length,
                approved: bookings.filter((booking) => booking.status === "approved").length,
                cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
                rejected: bookings.filter((booking) => booking.status === "rejected").length,
                users: readUsers().length
            }
        });
        return;
    }

    sendJson(req, res, 404, { message: "Маршрут не знайдено." });
}

function serveStatic(req, res) {
    const requestUrl = req.url === "/" ? "/Index.html" : req.url;
    const decodedUrl = decodeURIComponent(requestUrl.split("?")[0]);
    const filePath = path.normalize(path.join(ROOT, decodedUrl));
    const relativePath = path.relative(ROOT, filePath);

    if (
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath) ||
        relativePath.startsWith("data") ||
        relativePath === "server.js" ||
        relativePath === "package.json"
    ) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }

        res.writeHead(200, {
            "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
            "Cache-Control": "no-store"
        });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/healthz") {
        sendJson(req, res, 200, { ok: true });
        return;
    }

    if (req.url.startsWith("/api/")) {
        handleApi(req, res);
        return;
    }

    serveStatic(req, res);
});

ensureDataFiles();
ensureDefaultAdmin();
server.listen(PORT, () => {
    console.log(`Kimnata is running: http://localhost:${PORT}`);
    console.log(`Users database: ${USERS_FILE}`);
    console.log(`Bookings database: ${BOOKINGS_FILE}`);
});
