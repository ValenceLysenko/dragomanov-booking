# Deploy Online

This project needs Node.js hosting because login, bookings, admin panel, and JSON storage are served by `server.js`.

## Fast Option: Render

1. Push this folder to GitHub.
2. Open https://render.com and create a new Web Service.
3. Connect the GitHub repository.
4. Render will detect `render.yaml`.
5. Deploy.
6. Open the generated Render URL.

The app runs with:

```bash
npm start
```

Health check:

```text
/healthz
```

## Data Storage

By default, data is stored in:

```text
data/users.json
data/bookings.json
```

For a server with persistent storage, set:

```text
DATA_DIR=/path/to/persistent/data
```

On free hosting, file data can be reset after redeploys or restarts. For production, use a persistent disk, VPS, or replace JSON files with a database.

## Admin Login

The default admin is created automatically on first start:

```text
Email: admin@kimnata.local
Password: Admin123!
```
