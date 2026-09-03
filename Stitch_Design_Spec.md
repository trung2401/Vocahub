# VocaHub — Stitch Design Spec (Core Flow)

## 1. Mục đích tài liệu

Tài liệu này là brief đầu vào cho Stitch và là hợp đồng hình ảnh trước khi chuyển sang React. Thiết kế cần thể hiện được luồng lõi:

`Dashboard → Import → Mapping/Preview → Deck detail → Flashcard hoặc Quiz → Summary`.

Không thiết kế backend, đăng nhập, thống kê sâu hoặc cài đặt trong vòng này.

## 2. Đối tượng và cảm giác sản phẩm

- Người dùng: người tự học có file Excel/CSV, cần thao tác nhanh và ít phân tâm.
- Cảm giác: sáng, tin cậy, gọn, tập trung vào nội dung học; không mang phong cách marketing.
- UI copy: tiếng Việt hoàn toàn.
- Desktop-first, responsive mobile 390 px.
- Bố cục ưu tiên scan nhanh, các CTA chính nổi bật nhưng không lạm dụng card.

## 3. Visual direction

### Màu và token đề xuất

```text
Canvas:          #F7F8FA
Surface:         #FFFFFF
Text primary:    #17202A
Text secondary:  #5B6673
Border:          #D9DEE5
Accent teal:     #0F766E
Accent hover:    #115E59
Accent soft:     #DDF4F0
Success:         #15803D
Warning:         #B45309
Danger:          #B42318
Focus ring:      #14B8A6
```

Accent teal là màu hành động chính; success/warning/danger chỉ dùng cho semantic state. Tránh gradient, shadow nặng, nền minh họa hoặc các khối trang trí không phục vụ học tập.

### Typography

- Font: Inter nếu có, fallback `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- H1 dashboard: 32 px/40 px, weight 700.
- H2 section: 22 px/28 px, weight 650.
- Body: 14–16 px, line-height tối thiểu 1.5.
- Label/helper: 12–13 px; không dùng chữ in hoa toàn bộ.

### Layout tokens

- Desktop content max-width: 1280 px.
- Sidebar: 248 px expanded, 72 px collapsed; ẩn trong study session.
- Gutter desktop: 32 px; mobile: 16 px.
- Grid gap: 16 px.
- Card radius tối đa 8 px; button radius 6 px.
- Touch target tối thiểu 44×44 px.

## 4. Component và trạng thái bắt buộc

- `AppShell`: sidebar, header, content; collapsed/expanded.
- `DeckCard`: default, hover, menu open, empty deck.
- `Dropzone`: idle, drag-over, parsing, success, error.
- `ColumnMapper`: unmapped, mapped, required missing.
- `ImportPreviewTable`: loading, valid rows, invalid rows, edited row, empty result.
- `VocabularyTable`: loading, populated, empty, row action menu.
- `StudyCard`: front, back, keyboard focus.
- `AnswerOption`: default, selected-correct, selected-wrong, disabled.
- `SummaryPanel`: flashcard result, quiz result.
- `ConfirmDialog`, `Toast`, `InlineError`, `Skeleton`.

## 5. Màn hình cần tạo trong Stitch

### Screen 01 — Dashboard có deck

**Desktop:** sidebar trái với logo VocaHub và mục `Tổng quan`, `Bộ từ vựng`; header có lời chào, search nhỏ và avatar placeholder. Main có tiêu đề `Tổng quan`, dải quick stats `Cần ôn hôm nay`, `Tổng số từ`, `Chuỗi ngày học`; CTA `Import danh sách` là primary, `Tạo deck trống` là secondary. Bên dưới là grid deck cards.

**Mobile:** sidebar chuyển thành top bar; stats thành hàng cuộn ngang hoặc grid 2 cột; CTA full-width; deck cards một cột.

**Copy mẫu:** `Chào buổi sáng`, `Sẵn sàng học tiếp chưa?`, `Cần ôn hôm nay`, `Bộ từ vựng của tôi`, `Học ngay`, `Xem deck`.

### Screen 02 — Dashboard empty state

Không dùng hero marketing. Main có biểu tượng line đơn giản, heading `Bắt đầu với bộ từ đầu tiên`, mô tả ngắn và hai CTA. Có link phụ `Xem định dạng file hỗ trợ` mở popover nhỏ.

### Screen 03 — Import: chọn file

Breadcrumb `Tổng quan / Import danh sách`; stepper 1 `Chọn file`, 2 `Kiểm tra dữ liệu`, 3 `Hoàn tất`. Dropzone lớn có icon upload, text `Kéo thả file vào đây` và nút `Chọn file`. Hiển thị chip định dạng `CSV`, `XLS/XLSX`, giới hạn `Tối đa 10 MB`.

### Screen 04 — Import: mapping và preview

Header giữ stepper. Panel mapping hiển thị các select cho `Từ vựng*`, `Nghĩa*`, `Phiên âm`, `Ví dụ`, `Loại từ`. Bên dưới là summary `42 dòng hợp lệ · 3 dòng cần kiểm tra`. Bảng preview có số dòng, cột dữ liệu, trạng thái và action sửa/xóa. Dòng lỗi nền warning rất nhẹ, message cụ thể dưới cell hoặc trong details. Footer sticky có `Quay lại`, input `Tên bộ từ vựng`, primary `Tạo bộ từ`.

**Mobile:** mapping thành các field xếp dọc; preview chuyển thành list row accordion thay vì bảng tràn ngang; footer CTA sticky.

### Screen 05 — Deck detail

Header có breadcrumb, tên deck, menu `Đổi tên`, `Xóa`. Khu vực summary hiển thị `120 từ`, `18 cần ôn hôm nay`, hai CTA ngang `Học flashcard` (primary) và `Làm quiz` (outline). Bên dưới có search trong deck, filter trạng thái và bảng/list từ. Nút `Thêm từ mới` luôn nhìn thấy.

**Mobile:** summary xếp dọc; hai CTA full-width; mỗi vocabulary row là list item có status badge và menu.

### Screen 06 — Add/Edit vocabulary

Dùng drawer desktop hoặc modal gọn: `Từ vựng*`, `Nghĩa*`, `Phiên âm`, `Ví dụ`, `Loại từ`. Error inline ngay dưới field. Footer `Hủy` và `Lưu từ`. Không dùng form nhiều cột trên mobile.

### Screen 07 — Flashcard front/back

Toàn màn hình, nền canvas nhẹ, không sidebar. Top bar có nút thoát, tên deck và progress `4/18`. Card trung tâm có mặt trước với từ lớn, loại từ nhỏ; mặt sau có nghĩa, phiên âm và ví dụ. Card có affordance lật nhưng không dùng hiệu ứng 3D bắt buộc. Sau khi lật, ba nút rating: `Chưa nhớ`, `Nhớ mơ hồ`, `Đã nhớ` với semantic màu và icon.

**Mobile:** card chiếm chiều rộng còn lại, nút rating ba cột có label ngắn nhưng vẫn đủ 44 px height.

### Screen 08 — Quiz

Top bar progress `Câu 4/10`, nút thoát. Question area: label `Chọn nghĩa đúng`, term lớn, bốn answer options dạng button full-width. Sau chọn, option đúng xanh, sai đỏ, các option còn lại disabled; xuất hiện helper `Đáp án đúng: ...` và CTA `Câu tiếp theo`.

### Screen 09 — Summary

Summary không phải landing page: một panel tập trung với icon trạng thái, heading `Hoàn thành phiên học`, số lớn `8/10`, progress bar và các chỉ số phụ. Flashcard hiển thị phân bổ `Đã nhớ/ Nhớ mơ hồ/ Chưa nhớ`; quiz hiển thị `Câu đúng` và danh sách câu sai. CTA `Học lại`, `Xem deck`.

## 6. Accessibility và interaction

- Mọi icon-only button có tooltip/aria-label tiếng Việt.
- Focus ring rõ, thứ tự tab theo thứ tự đọc.
- Không truyền tải trạng thái chỉ bằng màu; luôn có nhãn/icon.
- Modal khóa focus, Esc đóng khi an toàn; xóa deck/từ cần xác nhận.
- Flashcard hỗ trợ Space để lật, Esc để thoát; quiz hỗ trợ phím số hoặc Tab/Enter.
- Contrast text đạt WCAG AA; không dùng chữ xám nhạt trên nền trắng.
- Toast có role `status`; lỗi form có `aria-describedby`.

## 7. Dữ liệu mẫu cho mockup

Deck: `TOEIC Part 5 — Công việc`, 120 từ, 18 cần ôn.

Rows: `allocate — phân bổ`, `deadline — hạn chót`, `negotiate — đàm phán`, `reliable — đáng tin cậy`.

Trạng thái mẫu: `Mới`, `Đang học`, `Đã thuộc`.

## 8. Deliverables cần lấy từ Stitch

- Desktop và mobile frame cho 9 screen ở trên.
- Token màu, typography, spacing và component states.
- Tên layer/component ổn định để đối chiếu khi convert sang React.
- Export asset chỉ khi thực sự cần; ưu tiên icon từ thư viện thay vì raster.
- Một flow prototype có thể click từ dashboard đến summary.

## 9. Tiêu chí duyệt thiết kế trước khi code

- [ ] Tất cả P0 screen có default, empty, loading và error state phù hợp.
- [ ] Import preview không tràn ngang ở 390 px.
- [ ] Study session thật sự giảm phân tâm và có đường thoát rõ.
- [ ] CTA chính/phụ nhất quán giữa deck detail, flashcard và quiz.
- [ ] Copy tiếng Việt không bị cắt, chồng lấn hoặc vượt container.
- [ ] Token và component states đủ rõ để tạo React component, không phụ thuộc ảnh chụp màn hình.
