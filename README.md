# VocaHub

VocaHub là ứng dụng học từ vựng tiếng Anh. Người dùng có thể tạo deck, import danh sách từ từ CSV/XLS/XLSX, học bằng flashcard hoặc quiz, và theo dõi các từ cần ôn.

Repository gồm hai ứng dụng:

- `Frontend/`: Next.js + React + TypeScript, chạy ở `http://localhost:3001`.
- `Backend/`: NestJS + TypeORM + MySQL, cung cấp API ở `http://localhost:4001/api/v1`.

## Tính năng chính

- Dashboard quản lý deck: tạo, đổi tên và xóa deck.
- Import CSV/XLS/XLSX với mapping cột, preview và kiểm tra dữ liệu.
- Thêm, sửa và xóa từ vựng trong deck.
- Học flashcard với đánh giá mức độ nhớ.
- Quiz trắc nghiệm bốn lựa chọn.
- Lập lịch ôn tập và theo dõi trạng thái từ vựng.
- Đăng ký, đăng nhập, refresh session rotation và logout bằng cookie `httpOnly`.

## Yêu cầu môi trường

- Node.js 20 trở lên.
- npm.
- MySQL 8 trở lên cho Backend.

## Chạy nhanh

### 1. Cài dependency

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 2. Cấu hình MySQL và Backend

Tạo database bằng tài khoản MySQL có quyền tạo database:

```bash
cd Backend
mysql -h 127.0.0.1 -P 3306 -u root -p < database/create-database.sql
```

Tạo file `Backend/.env` từ `Backend/.env.example` và cập nhật thông tin database cùng các secret JWT:

```env
PORT=4001
FRONTEND_ORIGIN=http://localhost:3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=dev
DB_PASS=devpass
DB_NAME=vocahub
JWT_ACCESS_SECRET=replace-with-a-long-random-access-secret
JWT_REFRESH_SECRET=replace-with-a-long-random-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
```

Chạy migration và khởi động API:

```bash
cd Backend
npm run migration:run
npm run start:dev
```

### 3. Khởi động Frontend

Mở terminal khác:

```bash
cd Frontend
npm run dev
```

Mở [http://localhost:3001](http://localhost:3001).

## Các lệnh thường dùng

### Backend

```bash
cd Backend
npm test          # Unit test
npm run build     # Build production
npm run lint      # ESLint
npm run test:e2e  # E2E, cần MySQL và database đang chạy
```

### Frontend

```bash
cd Frontend
npm test          # Vitest
npm run build     # Next.js production build
npm run test:e2e  # Playwright E2E
```

## API chính

API dùng prefix `/api/v1` và các endpoint dữ liệu yêu cầu phiên đăng nhập hợp lệ.

- `POST /auth/register` - đăng ký và tạo phiên.
- `POST /auth/login` - đăng nhập.
- `POST /auth/refresh` - xoay refresh session.
- `POST /auth/logout` - thu hồi phiên.
- `GET /auth/me` - lấy thông tin người dùng hiện tại.
- `GET/POST/PATCH/DELETE /decks` - quản lý deck.
- `GET/POST /decks/:deckId/entries` - xem và thêm từ.
- `PATCH/DELETE /entries/:id` - cập nhật và xóa từ.
- `POST /entries/:id/review` - ghi nhận kết quả ôn tập.
- `GET /decks/:deckId/due` - lấy các từ cần ôn.
- `POST /imports/decks` - tạo deck và entries từ dữ liệu import.

## Cấu trúc dự án

```text
VocaHub/
├── Backend/
│   ├── database/       # SQL khởi tạo và dữ liệu mẫu
│   ├── src/             # Module NestJS, entities, services, controllers
│   └── test/            # Cấu hình E2E
├── Frontend/
│   ├── src/app/         # Next.js App Router và các màn hình
│   ├── src/components/  # Component giao diện dùng lại
│   ├── src/data/        # Local repository và HTTP adapter
│   ├── src/domain/      # Type và logic nghiệp vụ học tập
│   └── e2e/             # Playwright E2E
├── Docs/                # Tài liệu dự án
├── PRD.md               # Product requirements
└── Tech_Architecture.md # Kiến trúc kỹ thuật
```

## Migration database

Migration được quản lý bằng TypeORM:

```bash
cd Backend
npm run migration:show
npm run migration:run
npm run migration:revert
```

Khi nâng cấp database cũ có deck chưa có owner, tạo user trước rồi đặt `LEGACY_USER_ID` trong `Backend/.env` trước khi chạy migration. Không commit file `.env` hoặc các secret lên repository.

## Ghi chú phát triển

- Backend và Frontend dùng package riêng, cần chạy `npm install` trong từng thư mục.
- Backend mặc định cho phép Frontend ở `http://localhost:3001` qua `FRONTEND_ORIGIN`.
- Trước khi tạo pull request hoặc push thay đổi lớn, nên chạy test và build của cả hai ứng dụng.
