# Backend Architecture & Plan — VocaHub

> **Quyết định triển khai hiện tại (override):** theo yêu cầu mới, backend triển khai
> auth trước và bật xác thực bắt buộc cho toàn bộ tài nguyên cá nhân. Database phải có
> đầy đủ 5 bảng `users`, `decks`, `vocabulary_entries`, `review_logs`,
> `import_batches`. Frontend dùng HTTP adapter và cookie JWT; mock chỉ còn phục vụ
> parser UI trong lúc backend chưa xử lý file nhị phân.

> Bổ sung cho `PRD.md`, `Tech_Architecture.md`, `Plan.md` đã có. Backend là lớp triển khai
> phía server của MVP; frontend giữ nguyên domain model và contract, chỉ thay adapter từ
> mock/local sang HTTP. Tech stack và convention cấu trúc thư mục dựa theo codebase backend
> đã dùng ở dự án Movie App để giữ nhất quán giữa các dự án.

## 1. Tech Stack

| # | Công nghệ | Ghi chú |
|---|---|---|
| 1 | NestJS (v10.x) | Kiến trúc module hoá theo feature, giống convention Movie App BE |
| 2 | TypeORM | ORM chính, migration-based — **không dùng `synchronize: true`** một khi đã có dữ liệu thật |
| 3 | MySQL (v8.x) | Database chính |
| 4 | Passport + JWT | `@nestjs/jwt`, `@nestjs/passport`, access token + refresh token trong cookie `httpOnly` |
| 5 | bcrypt | Hash password cho module `auth` |
| 6 | class-validator + class-transformer | Validate DTO đầu vào, đối chiếu lại cùng rule với Zod schema phía FE để không lệch |

> **Khác với Movie App:** VocaHub không có nguồn dữ liệu ngoài (provider phim) cần tham chiếu qua slug — dữ liệu từ vựng là dữ liệu gốc do người dùng tạo/import, nên BE lưu đầy đủ, không có khái niệm "chỉ lưu reference".

## 2. Nguyên tắc phát triển (đọc trước khi code)

1. **Auth trước, domain sau (quyết định mới)** — đăng ký/đăng nhập tạo user và JWT cookie trước; sau đó mọi deck, vocabulary, study và import đều kiểm tra `user_id`.
2. **Contract trước, code sau** — mọi entity/DTO phải khớp chính xác `Deck`, `VocabularyEntry` và `ReviewRating` đã định nghĩa ở `Tech_Architecture.md` mục 4 và 6; không tự thêm field nghiệp vụ mới nếu chưa cập nhật PRD.
3. **Entity trước, migration sau** — viết entity xong mới generate migration; không dùng `synchronize: true` khi đã có dữ liệu thật trong DB.
4. **Mỗi module một trách nhiệm rõ ràng** — controller mỏng, business logic (đặc biệt là scheduling `again/hard/good`) nằm ở service, không xử lý logic trong entity.
5. **Build từng module một, chốt xong mới sang module kế** — thứ tự hiện tại: `auth/users/schema` → `decks` → `vocabulary` → `study` (review + scheduling) → `import` → frontend HTTP integration.
6. **DTO không lộ entity ra ngoài API** — response luôn qua DTO, đặc biệt tránh lộ field nội bộ (`user_id` khi chưa dùng, các cột kỹ thuật khác) nếu FE không cần.

## 3. Cấu trúc thư mục (feature-based, theo convention Movie App)

```
Backend/
├── src/
│   ├── decks/
│   │   ├── entities/deck.entity.ts
│   │   ├── dto/                        # CreateDeckDto, UpdateDeckDto
│   │   ├── decks.module.ts
│   │   ├── decks.service.ts
│   │   └── decks.controller.ts
│   │
│   ├── vocabulary/
│   │   ├── entities/vocabulary-entry.entity.ts
│   │   ├── dto/                        # CreateVocabularyDto, UpdateVocabularyDto, BulkCreateVocabularyDto
│   │   ├── vocabulary.module.ts
│   │   ├── vocabulary.service.ts
│   │   └── vocabulary.controller.ts
│   │
│   ├── study/
│   │   ├── dto/                        # RecordReviewDto
│   │   ├── study.module.ts
│   │   ├── study.service.ts            # scheduling policy again/hard/good
│   │   └── study.controller.ts         # POST /entries/:id/review, GET /decks/:id/due
│   │
│   ├── import/
│   │   ├── dto/                        # BulkImportDto (nhận dữ liệu đã parse/validate từ FE)
│   │   ├── import.module.ts
│   │   ├── import.service.ts           # transaction: tạo deck + entries
│   │   └── import.controller.ts
│   │
│   ├── auth/                           # Auth JWT cookie (MVP)
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── dto/                        # RegisterDto, LoginDto
│   │   ├── strategies/                 # jwt.strategy.ts, jwt-refresh.strategy.ts
│   │   └── guards/                     # jwt-auth.guard.ts
│   │
│   ├── users/                          # User account cho auth
│   │   ├── entities/user.entity.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.controller.ts
│   │
│   ├── review-logs/                    # Lịch sử review cho thống kê
│   │   ├── entities/review-log.entity.ts
│   │   ├── review-logs.module.ts
│   │   └── review-logs.service.ts
│   │
│   ├── common/                         # guard/interceptor/filter/decorator dùng chung
│   │   ├── decorators/current-user.decorator.ts
│   │   └── filters/http-exception.filter.ts        # map error code → HTTP response khớp bảng mục 9 Tech_Architecture.md
│   │
│   ├── config/                         # typeorm.config.ts, env validation
│   ├── database/
│   │   └── migrations/
│   └── app.module.ts
│
├── .env                                 # DB_* và JWT_ACCESS_SECRET/JWT_REFRESH_SECRET
├── package.json
├── tsconfig.json
└── nest-cli.json
```

**Quy tắc đặt DTO vs Entity (giữ nguyên convention Movie App):**
- `entity/` là shape lưu trong DB (TypeORM decorator), map trực tiếp từ domain type ở `Tech_Architecture.md`.
- `dto/` là shape nhận từ request/trả về response, luôn validate bằng `class-validator`, không expose trực tiếp entity ra ngoài API.

## 4. Mô tả các bảng cần tạo

Tất cả bảng dùng `id` dạng UUID (khớp `crypto.randomUUID()` phía FE để không lệch kiểu khi migrate dữ liệu cũ), timestamps `created_at`/`updated_at` dạng `datetime`.

### 4.1 `decks`
Map trực tiếp từ `Deck` trong domain model.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK → users, bắt buộc khi auth-first) | |
| `name` | varchar | bắt buộc |
| `source` | enum(`manual`, `import`) | |
| `created_at` | datetime | |
| `updated_at` | datetime | |

Index: `(user_id, updated_at)` — phục vụ list deck sắp mới nhất trước.

### 4.2 `vocabulary_entries`
Map trực tiếp từ `VocabularyEntry`. Đây là bảng lõi nhất.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID (PK) | |
| `deck_id` | UUID (FK → decks, on delete cascade) | |
| `term` | varchar | bắt buộc |
| `meaning` | varchar | bắt buộc |
| `pronunciation` | varchar, nullable | |
| `example` | text, nullable | |
| `part_of_speech` | varchar, nullable | |
| `status` | enum(`new`, `learning`, `mastered`) | mặc định `new` |
| `last_reviewed_at` | datetime, nullable | |
| `next_review_at` | datetime | mặc định = thời điểm tạo (cần ôn ngay, đúng FR-06) |
| `correct_count` | int | mặc định 0 |
| `incorrect_count` | int | mặc định 0 |
| `created_at` | datetime | |
| `updated_at` | datetime | |

Index bắt buộc: `deck_id`; `next_review_at`; composite `(deck_id, next_review_at)` phục vụ `getDueEntries`.

Ràng buộc nghiệp vụ enforce ở **service layer**, không phải DB constraint: duplicate `term`+`meaning` (trim, lowercase) trong cùng deck chỉ cảnh báo, không tự chặn insert (đúng FR-03).

### 4.3 `users` *(bắt buộc trong MVP hiện tại)*
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID (PK) | |
| `email` | varchar, unique | |
| `password_hash` | varchar | bcrypt |
| `created_at` | datetime | |
| `updated_at` | datetime | |

### 4.4 `review_logs` *(bật trong MVP để lưu lịch sử ôn tập)*
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID (PK) | |
| `vocabulary_entry_id` | UUID (FK → vocabulary_entries) | |
| `deck_id` | UUID (FK → decks, denormalized để query thống kê nhanh) | |
| `rating` | enum(`again`, `hard`, `good`) | quiz đúng/sai map về `good`/`again` |
| `mode` | enum(`flashcard`, `quiz`) | |
| `reviewed_at` | datetime | |

### 4.5 `import_batches` *(bật trong MVP để lưu lịch sử import)*
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | UUID (PK) | |
| `deck_id` | UUID (FK → decks) | |
| `file_name` | varchar | |
| `total_rows` | int | |
| `valid_rows` | int | |
| `invalid_rows` | int | |
| `created_at` | datetime | |

## 5. Endpoint đề xuất (map 1-1 với port ở `Tech_Architecture.md` mục 5)

| Port method | Endpoint | Module |
|---|---|---|
| `DeckRepository.list()` | `GET /api/v1/decks` | `decks` |
| `DeckRepository.get(id)` | `GET /api/v1/decks/:id` | `decks` |
| `DeckRepository.create()` | `POST /api/v1/decks` | `decks` |
| `DeckRepository.update()` | `PATCH /api/v1/decks/:id` | `decks` |
| `DeckRepository.delete()` | `DELETE /api/v1/decks/:id` | `decks` |
| `VocabularyRepository.listByDeck()` | `GET /api/v1/decks/:id/entries` | `vocabulary` |
| `VocabularyRepository.create()` | `POST /api/v1/decks/:id/entries` | `vocabulary` |
| `VocabularyRepository.update()` | `PATCH /api/v1/entries/:id` | `vocabulary` |
| `VocabularyRepository.delete()` | `DELETE /api/v1/entries/:id` | `vocabulary` |
| `VocabularyRepository.saveMany()` | `POST /api/v1/decks/:id/entries/bulk` | `import` |
| `StudyRepository.recordReview()` | `POST /api/v1/entries/:id/review` | `study` |
| `StudyRepository.getDueEntries()` | `GET /api/v1/decks/:id/due?now=...` | `study` |

Lỗi trả về đúng `code` ở bảng mục 9 `Tech_Architecture.md` (`invalid_required`, `not_found`, `storage_failure`→`persistence_failure`), xử lý tập trung ở `common/filters/http-exception.filter.ts` để FE map message giống hệt local adapter.

## 6. Kế hoạch triển khai (Phase 4 — nối tiếp `Plan.md`)

### Task 4.1 — Scaffold NestJS + kết nối MySQL
- Acceptance: Project chạy được, `typeorm.config.ts` cấu hình đúng `.env`, migration chạy sạch, chưa bật `auth`/`users`.
- Verify: `npm run start:dev`, migration up/down không lỗi.

### Task 4.2 — Module `decks`
- Acceptance: CRUD deck đầy đủ theo bảng mục 5, entity/DTO tách biệt đúng convention.
- Verify: Jest e2e cho từng endpoint.

### Task 4.3 — Module `vocabulary`
- Acceptance: CRUD entry, response shape khớp `VocabularyEntry` FE, duplicate chỉ cảnh báo không chặn.
- Verify: Jest e2e + test riêng cho duplicate warning.
- Dependencies: 4.2.

### Task 4.4 — Module `study` (review & scheduling)
- Acceptance: `POST /entries/:id/review` áp đúng công thức `again/hard/good` mục 6 `Tech_Architecture.md`; `GET /decks/:id/due` dùng index composite.
- Verify: Unit test từng transition (`new→learning`, `learning→mastered` sau 2 lần `good` liên tiếp).
- Dependencies: 4.3.

### Task 4.5 — Module `import`
- Acceptance: Nhận mảng entry đã validate từ FE, ghi trong transaction, lỗi giữa chừng không để lại deck rỗng.
- Verify: Test transaction rollback khi 1 dòng lỗi.
- Dependencies: 4.2, 4.3.

### Checkpoint E — Backend sẵn sàng thay adapter
- [ ] Response shape khớp domain type; FE chỉ cần viết `Http*Repository`, không sửa component.
- [ ] Error code khớp bảng mapping message ở FE.
- [ ] Có thể chạy song song Dexie (offline) và HTTP (khi có mạng) mà không đổi UI.

### Task 4.6 — Auth + users (đã ưu tiên triển khai)
- Acceptance: Register/login, JWT access + refresh token, guard áp cho các endpoint decks/vocabulary/study/import.
- Verify: E2E luồng đăng ký → đăng nhập → gọi endpoint có guard.
- Dependencies: schema migration hoàn tất.

## 7. Việc cố tình chưa làm ở Phase 4

- Chưa có refresh-token revocation theo từng thiết bị; MVP dùng refresh JWT stateless và xoay token khi refresh.
- Chưa làm sync/conflict resolution giữa Dexie local và server — câu hỏi mở ở mục 10 `PRD.md`, cần quyết định riêng trước khi code.
- Đã tạo và ghi `review_logs`/`import_batches`; UI thống kê chi tiết vẫn để phase sau.
- Chưa cache/proxy gì thêm — khác Movie App, VocaHub không có provider ngoài nên không cần layer `*-proxy`.
