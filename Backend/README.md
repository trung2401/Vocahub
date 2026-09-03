# VocaHub Backend

NestJS + TypeORM + MySQL API cho VocaHub. Auth được bật trước: mọi API dữ liệu yêu cầu JWT trong cookie `httpOnly` và chỉ trả tài nguyên thuộc user hiện tại.

## Cấu hình

Tạo `.env` từ `.env.example` và đặt:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dev
DB_PASS=devpass
DB_NAME=vocahub
```

File `.env` local không được commit.

## Chạy

```bash
npm install
# Chạy một lần bằng tài khoản MySQL có quyền tạo database
mysql -h 127.0.0.1 -P 3306 -u root -p < database/create-database.sql
npm run migration:run
npm run start:dev
```

API prefix: `http://localhost:4000/api/v1`.

Auth endpoints:

- `POST /auth/register` — tạo tài khoản và set cookie phiên
- `POST /auth/login` — đăng nhập
- `POST /auth/refresh` — cấp lại access cookie từ refresh cookie
- `POST /auth/logout` — xóa cookie
- `GET /auth/me` — lấy user hiện tại

## Endpoint chính

- `GET/POST/PATCH/DELETE /decks`
- `GET/POST /decks/:deckId/entries`
- `PATCH/DELETE /entries/:id`
- `POST /entries/:id/review`
- `GET /decks/:deckId/due?now=...`
- `POST /imports/decks` để tạo deck và entries trong một transaction

Migration đầu tiên tạo đủ `users`, `decks`, `vocabulary_entries`, `review_logs` và
`import_batches`. Migration `1730000001000-complete-auth-schema` dùng để nâng cấp
database đã chạy schema hai bảng cũ.

## Kiểm thử

```bash
npm test
npm run build
```

E2E cần MySQL chạy và database `vocahub` đã tồn tại.
