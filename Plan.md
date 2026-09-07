# Plan — VocaHub MVP

## 1. Mục tiêu kế hoạch

Tuân thủ quy trình đã thống nhất: **planning → thiết kế Stitch → code React**. Mỗi phase có checkpoint; không bắt đầu code trước khi design contract được duyệt.

## 2. Dependency graph

```text
PRD + architecture
        ↓
Stitch design contract + approved screens
        ↓
React scaffold + design tokens
        ↓
Local repositories/domain services
        ↓
Dashboard/deck → Import → Deck detail → Study sessions → Summary
```

## 3. Phase 1 — Planning và đặc tả

### Task 1.1 — Chốt phạm vi MVP

- Acceptance: `PRD.md` có persona, P0/P1/out-of-scope, flow và acceptance criteria end-to-end.
- Verify: Đối chiếu từng P0 feature với ít nhất một acceptance criterion.
- Files: `PRD.md`.

### Task 1.2 — Chốt architecture boundary

- Acceptance: `Tech_Architecture.md` định nghĩa domain model, repository/parser ports, local adapter và đường nâng cấp backend.
- Verify: Không có component UI nào cần biết IndexedDB hoặc HTTP theo tài liệu boundary.
- Files: `Tech_Architecture.md`.

### Checkpoint A — Review planning

- [ ] PRD và architecture được người phụ trách duyệt.
- [ ] Không còn quyết định scope làm thay đổi luồng lõi.

## 4. Phase 2 — Thiết kế giao diện Stitch

### Task 2.1 — Tạo screen set trong Stitch

- Acceptance: Có 9 screen core, desktop và mobile cho các screen cần responsive.
- Verify: Click prototype đi được từ dashboard đến summary.
- Files: Stitch project; brief nguồn `Stitch_Design_Spec.md`.

### Task 2.2 — Chốt design contract

- Acceptance: Có token màu/typography/spacing, component states, copy tiếng Việt, trạng thái loading/empty/error.
- Verify: Kiểm tra import preview 390 px, focus state và CTA study.
- Files: `Stitch_Design_Spec.md` và export từ Stitch.

### Checkpoint B — Review design

- [ ] Design được duyệt trước khi scaffold component.
- [ ] Asset, tên layer và token đủ để convert sang React.

## 5. Phase 3 — Code React theo vertical slices

### Task 3.1 — Scaffold và app shell

- Acceptance: Vite/React/TypeScript chạy được; route và layout responsive khớp design contract.
- Verify: `npm run build`, `npm run lint`, smoke test route ở desktop/mobile.
- Dependencies: 1.1, 1.2, 2.2.

### Task 3.2 — Domain types và local persistence

- Acceptance: Dexie repositories thực hiện CRUD deck/entry, transaction import, và dữ liệu còn sau refresh.
- Verify: Unit/integration tests cho CRUD, transaction rollback và due query.
- Dependencies: 3.1.

### Task 3.3 — Dashboard và quản lý deck

- Acceptance: Empty state, list deck, create/rename/delete confirmation, quick stats.
- Verify: Testing Library tests cho create/rename/delete; E2E mở deck từ dashboard.
- Dependencies: 3.2.

### Task 3.4 — Import CSV/XLSX

- Acceptance: Upload/dropzone, parse, map cột, preview editable, lỗi theo dòng, tạo deck transaction.
- Verify: Fixture CSV/XLSX hợp lệ, thiếu cột, dòng lỗi; E2E import thành công và partial success.
- Dependencies: 3.2, 3.3.

### Checkpoint C — Core data flow

- [ ] Import file → deck mới → refresh vẫn còn dữ liệu.
- [ ] Không có lỗi console nghiêm trọng.

### Task 3.5 — Deck detail và vocabulary CRUD

- Acceptance: List/search/filter cơ bản, add/edit/delete entry, status badge.
- Verify: Unit validation + integration update list không reload; mobile 390 px không tràn.
- Dependencies: 3.3, 3.4.

### Task 3.6 — Flashcard session

- Acceptance: Full-screen, flip/click/Space, rating, progress, exit, summary; ghi review sau mỗi thẻ.
- Verify: Domain tests cho scheduler; E2E hoàn thành session và kiểm tra due count.
- Dependencies: 3.5.

### Task 3.7 — Quiz session

- Acceptance: 4 đáp án, một đáp án đúng, immediate feedback, score, wrong-answer review.
- Verify: Fixture deterministic cho distractors; E2E chọn đúng/sai và summary.
- Dependencies: 3.5, 3.6 (dùng chung study service).

### Checkpoint D — MVP acceptance

- [ ] Luồng end-to-end trong PRD chạy được trên desktop 1440×900 và mobile 390×844.
- [ ] Unit, integration, E2E, build và lint đều pass.
- [ ] Keyboard/focus và error states được kiểm tra thủ công.

## 6. Verification commands (sau khi scaffold)

```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

Nếu scaffold chọn command khác, cập nhật cả `PRD.md`, `Tech_Architecture.md` và file này cùng lúc.

## 7. Rủi ro và giảm thiểu

| Rủi ro | Khi xử lý | Giảm thiểu |
|---|---|---|
| Stitch tạo layout đẹp nhưng thiếu state | Phase 2 | Duyệt state checklist trước code |
| Parser Excel khác CSV | Task 3.4 | Fixture cho cả hai định dạng, normalize chung |
| UI coupling với Dexie | Task 3.2 | Review import boundary, cấm import Dexie trong features |
| Lịch ôn gây tranh luận | Task 3.6 | Giữ policy MVP đơn giản và cô lập trong scheduler |
| Scope phình sang P1 | Mọi checkpoint | Chỉ nhận tiêu chí P0 trong Definition of Done |

## 8. Definition of Done

- Acceptance criteria của task pass.
- Test, lint, build pass theo command thực tế của repo.
- Có runtime verification trên desktop và mobile.
- Không thêm backend/tài khoản/feature P1 vào MVP nếu chưa cập nhật PRD và được duyệt.
- Tài liệu phản ánh quyết định mới nhất trước khi merge.

## 9. Backend integration (quyết định hiện tại)

Backend được triển khai theo thứ tự auth-first sau khi UI core đã có:

```text
users + auth (JWT httpOnly cookie)
        -> decks (user-scoped CRUD)
        -> vocabulary (user-scoped CRUD)
        -> study + review_logs
        -> import + import_batches
        -> thay mock repository bằng HTTP adapter
```

- MySQL dùng các biến `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`; API chạy cổng `PORT=4001` và chỉ cho phép `FRONTEND_ORIGIN=http://localhost:3001`.
- Migration `1730000000000-initial-schema` tạo schema đầy đủ cho DB mới; migration `1730000001000-complete-auth-schema` nâng cấp DB đã chạy schema hai bảng trước đó.
- Frontend gửi `credentials: include`, không lưu token trong localStorage. Route dữ liệu yêu cầu đăng nhập và tự chuyển về `/login` khi session hết hạn.
