# PRD — VocaHub MVP

## 1. Tóm tắt

VocaHub là web app giúp người tự học tiếng Anh đưa nhanh danh sách từ có sẵn trong Excel/CSV vào một bộ từ vựng, kiểm tra lại dữ liệu và bắt đầu học ngay bằng flashcard hoặc quiz. MVP chạy hoàn toàn trên trình duyệt với dữ liệu local; kiến trúc được thiết kế để thay adapter lưu trữ local bằng backend sau này mà không phải viết lại màn hình học.

## 2. Người dùng và vấn đề

### Persona chính

Người tự học tiếng Anh, thường ghi từ trong Excel/Google Sheet hoặc nhận danh sách từ từ giáo trình. Họ muốn dành thời gian cho việc ghi nhớ, không phải nhập lại từng dòng vào ứng dụng.

### Nỗi đau

- Nhập thủ công chậm và dễ sai.
- File nguồn không thống nhất tên hoặc thứ tự cột.
- Không có một nơi vừa quản lý deck vừa học và xem lại tiến độ.
- Sau khi tạo deck, người dùng cần bắt đầu một phiên học với ít thao tác.

### Giá trị cốt lõi

`Import nhanh → kiểm tra dữ liệu → học ngay → biết hôm nay cần ôn gì`.

## 3. Mục tiêu và chỉ số kiểm chứng

### Mục tiêu MVP

1. Người dùng mới có thể import một file CSV/XLSX và tạo deck đầu tiên mà không cần hướng dẫn bên ngoài.
2. Người dùng có thể hoàn thành một phiên flashcard hoặc quiz từ deck vừa tạo.
3. Deck, từ vựng và tiến độ vẫn còn sau khi refresh trang trong cùng trình duyệt.
4. Luồng lõi usable trên desktop và mobile.

### Chỉ số kiểm chứng định tính

- Người dùng thử nghiệm hoàn thành luồng import đến bắt đầu học mà không bị kẹt ở bước map cột.
- Người dùng hiểu trạng thái lỗi và biết cần sửa dòng nào.
- Người dùng phân biệt rõ hành động chính `Học ngay` và `Trắc nghiệm`.

### Không dùng làm mục tiêu MVP

Không tối ưu thuật toán spaced repetition nâng cao, tăng trưởng người dùng, chia sẻ cộng đồng hoặc độ chính xác phát âm trong phiên bản này.

## 4. Phạm vi

### P0 — bắt buộc cho vòng MVP

- Dashboard/danh sách deck.
- Tạo deck trống, đổi tên, xóa có xác nhận.
- Import CSV và XLSX bằng chọn file hoặc kéo-thả.
- Map cột, xem trước, sửa/xóa dòng, hiển thị lỗi theo dòng.
- Tạo deck sau khi xác nhận import.
- Danh sách từ trong deck; thêm, sửa, xóa từ.
- Flashcard toàn màn hình; lật thẻ; đánh giá `Chưa nhớ`, `Nhớ mơ hồ`, `Đã nhớ`.
- Quiz 4 lựa chọn; phản hồi đúng/sai tức thời; tổng kết và xem lại câu sai.
- Trạng thái từ `Mới`, `Đang học`, `Đã thuộc`; số từ cần ôn hôm nay.
- Lưu local bền vững sau refresh.

### P1 — sau khi luồng lõi được duyệt

- Màn hình thống kê theo ngày/tuần.
- Cài đặt giao diện và cài đặt học.
- Gộp deck, lọc nâng cao, tìm kiếm toàn cục.
- Xuất/nhập backup.

### Ngoài phạm vi

- Đăng nhập, tài khoản nhiều người dùng và đồng bộ server trong MVP.
- Backend/API thật, cộng đồng chia sẻ deck.
- Import PDF/ảnh/OCR.
- AI sinh ví dụ hoặc giải thích.
- Nhận diện giọng nói và chấm phát âm.
- Ứng dụng native mobile.

## 5. Luồng người dùng chính

1. Người dùng mở dashboard và thấy deck hiện có hoặc trạng thái empty state.
2. Chọn `Import danh sách` hoặc `Tạo deck trống`.
3. Với import: tải file → hệ thống nhận diện cột → người dùng map cột → xem trước và sửa/xóa dòng lỗi → đặt tên deck → xác nhận.
4. Người dùng mở deck detail, xem số từ và số từ cần ôn; có thể thêm/sửa/xóa từ.
5. Chọn `Học flashcard` hoặc `Làm quiz`.
6. Hoàn tất phiên, xem tổng kết; tiến độ và số từ cần ôn được cập nhật ngay.

## 6. Yêu cầu chức năng

### FR-01 — Dashboard và quản lý deck

- Hiển thị tất cả deck của người dùng dạng danh sách/thẻ.
- Mỗi deck hiển thị tên, tổng số từ, số từ cần ôn hôm nay và trạng thái cập nhật gần nhất.
- Cho phép tạo deck với tên bắt buộc, đổi tên và xóa sau xác nhận.
- Khi chưa có deck, hiển thị empty state có hai CTA: `Import danh sách` và `Tạo deck trống`.

### FR-02 — Import CSV/XLSX

- Chấp nhận `.csv`, `.xlsx`, `.xls`; giới hạn MVP đề xuất 10 MB hoặc 5.000 dòng.
- Có nút chọn file và vùng kéo-thả; hiển thị tên file, kích thước và nút thay file.
- Nhận diện gợi ý các cột: `Từ vựng`, `Nghĩa`, `Phiên âm`, `Ví dụ`, `Loại từ`.
- Cho phép map một cột nguồn vào mỗi trường đích; `Từ vựng` và `Nghĩa` là bắt buộc.
- Xem trước theo bảng có phân trang hoặc virtualized rows; người dùng sửa hoặc xóa từng dòng trước khi lưu.
- Dòng lỗi phải có lý do cụ thể: thiếu từ, thiếu nghĩa, vượt độ dài, hoặc định dạng không đọc được.
- Dòng hợp lệ vẫn có thể import khi một số dòng lỗi; hiển thị số dòng hợp lệ/lỗi.
- Không tự động ghi đè deck cũ. Mỗi lần xác nhận tạo một deck mới.

### FR-03 — Từ vựng trong deck

- Trường dữ liệu: từ vựng và nghĩa bắt buộc; phiên âm, ví dụ, loại từ tùy chọn.
- Có thể thêm, sửa inline hoặc qua form, và xóa với hộp thoại xác nhận.
- Sau thao tác thành công, danh sách và số lượng cập nhật không cần reload.
- Từ trùng trong cùng deck được cảnh báo; người dùng quyết định giữ hoặc xóa trong preview/form.

### FR-04 — Flashcard

- Vào từ deck detail bằng CTA `Học flashcard`.
- Chế độ học ẩn sidebar, có tiến độ `thẻ hiện tại/tổng số`, nút thoát và hỗ trợ phím `Space` để lật.
- Mặt trước hiển thị từ; mặt sau hiển thị nghĩa và metadata tùy chọn.
- Chỉ hiện nút đánh giá sau khi thẻ đã được lật.
- Mỗi đánh giá cập nhật tiến độ và chuyển sang thẻ tiếp theo.
- Kết thúc phiên hiển thị số đã học, phân bổ trạng thái và CTA học lại/quay về deck.

### FR-05 — Quiz

- Vào từ deck detail bằng CTA `Làm quiz`.
- Mỗi câu có một từ và đúng bốn đáp án nghĩa, chỉ một đáp án đúng.
- Chỉ bật quiz khi deck có ít nhất bốn nghĩa khác nhau; nếu chưa đủ, hiển thị lý do và CTA quay lại deck.
- Sau khi chọn, khóa lựa chọn, hiển thị đúng/sai rõ ràng và cho phép sang câu tiếp theo.
- Kết thúc hiển thị điểm `đúng/tổng`, tỷ lệ phần trăm và danh sách câu sai.
- Có CTA làm lại và quay về deck.

### FR-06 — Tiến độ và lưu trữ local

- Trạng thái từ: `Mới`, `Đang học`, `Đã thuộc`.
- Từ mới được xem là cần ôn ngay. Đánh giá flashcard/quiz cập nhật `lastReviewedAt`, `nextReviewAt` và số lần đúng/sai.
- Lịch MVP đơn giản: `Chưa nhớ` = ôn lại sau 10 phút; `Nhớ mơ hồ` = ngày hôm sau; `Đã nhớ` = sau 3 ngày. Từ `Mới` chuyển thành `Đang học` sau lần review đầu; từ `Đang học` chuyển thành `Đã thuộc` sau hai lần đánh giá `Đã nhớ` liên tiếp. Đây không phải thuật toán spaced repetition cuối cùng.
- Dashboard tính số từ cần ôn bằng `nextReviewAt <= thời điểm hiện tại`.
- Refresh trang không làm mất deck, từ hoặc tiến độ.

## 7. Acceptance criteria end-to-end

- [ ] Từ dashboard, người dùng tạo được deck trống hoặc mở luồng import.
- [ ] File CSV/XLSX hợp lệ được đọc và hiển thị preview trước khi lưu.
- [ ] Người dùng map được cột, sửa/xóa dòng và nhìn thấy lỗi gắn với dòng cụ thể.
- [ ] Xác nhận import tạo đúng một deck mới với các dòng hợp lệ.
- [ ] Người dùng thêm/sửa/xóa từ trong deck; xóa luôn có xác nhận.
- [ ] Người dùng hoàn thành flashcard và quiz; màn hình tổng kết hiển thị đúng dữ liệu phiên.
- [ ] Tiến độ và số từ cần ôn cập nhật ngay sau phiên học.
- [ ] Dữ liệu còn sau refresh trong cùng trình duyệt.
- [ ] Các màn hình P0 không bị tràn ngang ở viewport mobile mục tiêu 390 px.
- [ ] Luồng chính có thể thao tác bằng bàn phím và có trạng thái focus nhìn thấy.

## 8. Yêu cầu phi chức năng

- Hỗ trợ hai viewport kiểm thử: desktop 1440×900 và mobile 390×844.
- Không đưa dữ liệu từ vựng lên mạng trong MVP local-only.
- Parse file không chặn UI; hiển thị trạng thái đang xử lý với file lớn.
- Lỗi được hiển thị bằng ngôn ngữ dễ hiểu, không lộ stack trace.
- Component tách biệt khỏi repository local để có thể thay bằng API adapter.
- Các thao tác dữ liệu quan trọng có test unit/integration; luồng P0 có ít nhất một test E2E.

## 9. Quyết định và giả định đã chốt

- Tên sản phẩm tạm thời là VocaHub.
- UI dùng tiếng Việt hoàn toàn.
- Persona chính là người tự học có file Excel/Google Sheet.
- Desktop-first, responsive mobile từ vòng thiết kế đầu.
- Thiết kế Stitch vòng đầu chỉ bao phủ luồng lõi.
- Chưa cần backup/khôi phục trong MVP; đây là P1.

## 10. Câu hỏi để giai đoạn backend

- Tài khoản và chiến lược đồng bộ một người dùng trên nhiều thiết bị.
- API pagination/search cho deck lớn.
- Thuật toán spaced repetition chính thức và migration dữ liệu local.
- Quyền riêng tư, sao lưu và retention của dữ liệu học.
