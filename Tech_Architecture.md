# Tech Architecture — VocaHub MVP

## 1. Nguyên tắc

1. **Local-first trong MVP:** app chạy được không cần server.
2. **UI không biết nơi lưu dữ liệu:** màn hình chỉ gọi các use case/port, không gọi IndexedDB trực tiếp.
3. **Thay adapter, không thay luồng:** backend tương lai triển khai cùng contract với local adapter.
4. **Đơn giản trước:** chỉ dùng các thư viện cần cho parse file, lưu trữ và kiểm thử.
5. **Dữ liệu học là nguồn sự thật:** phiên học ghi event/kết quả qua một service thống nhất để flashcard và quiz không lệch logic.

## 2. Stack đề xuất

| Lớp | Công nghệ | Lý do |
|---|---|---|
| App | Next.js + TypeScript | Phù hợp chuyển thiết kế Stitch thành component, hỗ trợ file-based routing và build tối ưu sẵn |
| Routing | Next.js App Router | Điều hướng dashboard, import, deck detail và session bằng cấu trúc thư mục `app/`, không cần thư viện routing riêng |
| UI | CSS variables + CSS Modules hoặc utility CSS theo output Stitch; `lucide-react` | Giữ token tập trung, icon nhất quán, dễ thay theme |
| State | React state cho state cục bộ; một store nhỏ cho session/import khi cần | Tránh global state quá sớm |
| Persistence | IndexedDB qua Dexie | Bền vững hơn localStorage, hỗ trợ query theo deck và due date |
| Parse | Papa Parse cho CSV; SheetJS (`xlsx`) cho Excel | Hỗ trợ file phổ biến và parse ở client |
| Validation | Zod | Một schema dùng cho form, preview và boundary adapter |
| Test | Vitest + Testing Library; Playwright cho E2E | Phù hợp Next.js và kiểm chứng luồng người dùng |

Version cụ thể sẽ được pin khi scaffold project; không commit dependency trước khi có code scaffold.

> Lưu ý: các màn hình học (Flashcard/Quiz) và toàn bộ logic parse/persist chạy client-side (`"use client"`); Next.js chủ yếu được dùng cho routing, cấu trúc dự án và khả năng mở rộng sang server sau này (ví dụ đồng bộ dữ liệu), không bắt buộc dùng SSR/data fetching phía server ở MVP này.

## 3. Ranh giới module

```text
Frontend/
  src/
    app/                  # Next.js App Router: route segments, layout, providers
    components/           # UI dùng lại, không chứa persistence
    features/
      dashboard/          # deck cards, empty state, quick stats
      import-vocabulary/  # upload, mapping, preview, validation
      deck-detail/        # list/form vocabulary và deck actions
      study-session/      # flashcard, quiz, summary
    domain/
      deck/               # types, schemas, use cases
      vocabulary/         # types, validation, status transitions
      study/              # session logic, scheduling policy
    data/
      ports/              # interface repository/parser
      local/              # Dexie repositories, browser file adapters
      http/               # adapter tương lai, chưa bật trong MVP
    lib/                  # date, id, error mapping, formatters
    styles/               # design tokens và global styles
  tests/
    unit/
    integration/
  e2e/
```

## 4. Domain model

```ts
type LearningStatus = 'new' | 'learning' | 'mastered';

interface Deck {
  id: string;
  name: string;
  source: 'manual' | 'import';
  createdAt: string;
  updatedAt: string;
}

interface VocabularyEntry {
  id: string;
  deckId: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  status: LearningStatus;
  lastReviewedAt?: string;
  nextReviewAt: string;
  correctCount: number;
  incorrectCount: number;
}
```

Import preview không ghi thẳng vào DB. Nó dùng model tạm:

```ts
interface ImportRow {
  rowNumber: number;
  values: Record<string, string>;
  issues: ImportIssue[];
  included: boolean;
}

interface ImportIssue {
  field: string;
  code: 'required' | 'too_long' | 'duplicate' | 'invalid_file';
  message: string;
}
```

## 5. Port và adapter

Các interface dưới đây là boundary ổn định giữa UI/domain và hạ tầng:

```ts
interface DeckRepository {
  list(): Promise<Deck[]>;
  get(id: string): Promise<Deck | null>;
  create(input: { name: string; source: Deck['source'] }): Promise<Deck>;
  update(id: string, input: { name: string }): Promise<Deck>;
  delete(id: string): Promise<void>;
}

interface VocabularyRepository {
  listByDeck(deckId: string): Promise<VocabularyEntry[]>;
  create(input: CreateVocabularyInput): Promise<VocabularyEntry>;
  update(id: string, input: UpdateVocabularyInput): Promise<VocabularyEntry>;
  delete(id: string): Promise<void>;
  saveMany(entries: CreateVocabularyInput[]): Promise<VocabularyEntry[]>;
}

interface StudyRepository {
  recordReview(input: ReviewResult): Promise<VocabularyEntry>;
  getDueEntries(deckId: string, now: string): Promise<VocabularyEntry[]>;
}

interface VocabularyFileParser {
  parse(file: File): Promise<ParsedTable>;
}
```

MVP cài `DexieDeckRepository`, `DexieVocabularyRepository`, `DexieStudyRepository`. Backend sau này cài các `Http*Repository` cùng method/DTO semantics; UI không import Dexie hoặc `fetch` trực tiếp.

## 6. Persistence và scheduling

- Dexie database tên `vocahub`; bảng `decks`, `vocabularyEntries` và `schemaMeta`.
- Index tối thiểu: `decks.updatedAt`, `vocabularyEntries.deckId`, `vocabularyEntries.nextReviewAt`, `[deckId+nextReviewAt]`.
- Ghi một deck và các entry sau import trong transaction; lỗi transaction không để lại deck rỗng.
- ID dùng `crypto.randomUUID()` với fallback test-only.
- Service `reviewScheduler` nhận `ReviewRating` và trả trạng thái/`nextReviewAt` mới. Lịch MVP:
  - `again`: +10 phút, status `learning`.
  - `hard`: +1 ngày, status `learning`.
  - `good`: +3 ngày; từ `new` chuyển `learning`, từ `learning` chuyển `mastered` sau hai lần `good` liên tiếp, `mastered` giữ nguyên.
- Quiz đúng/sai dùng cùng service; đáp án sai tương đương `again`, đúng tương đương `good`.
- Chính sách này phải nằm trong domain module để thay bằng thuật toán thật mà không đổi UI.

Quiz generator lấy đáp án đúng và ba nghĩa khác nhau trong cùng deck. Nếu deck có ít hơn bốn nghĩa khác nhau, use case trả `insufficient_choices` để UI vô hiệu hóa CTA và hướng dẫn người dùng thêm từ.

## 7. Import pipeline

```text
File input
  → detect extension/size
  → parser (CSV/XLSX)
  → normalized table (headers + rows)
  → column mapper
  → row validator + duplicate detector
  → editable preview state
  → transaction: create deck + valid entries
```

Quy tắc:

- Parse và validation chạy ngoài render path; với file lớn có loading/progress state.
- Escape nội dung khi render; không dùng `dangerouslySetInnerHTML` cho dữ liệu file.
- Exact duplicate (`term` + `meaning`, trim và lowercase) được cảnh báo, không tự xóa.
- Chỉ rows `included=true` và không có lỗi bắt buộc được ghi.
- Parser trả lỗi phân loại (`unsupported_type`, `too_large`, `malformed`) để UI hiển thị thông báo thân thiện.

## 8. Điều hướng và state

- Route chính: `/`, `/import`, `/decks/:deckId`, `/decks/:deckId/study/flashcards`, `/decks/:deckId/study/quiz`.
- Session state chỉ tồn tại trong phiên học; kết quả được ghi qua `StudyRepository` sau mỗi thẻ/câu để tránh mất tiến độ khi đóng tab.
- Import state có thể giữ trong memory; reload giữa preview không phải acceptance của MVP.
- Modal xác nhận xóa dùng component dùng chung và focus trap.

## 9. Error handling

Mọi lỗi hạ tầng được map thành error code domain trước khi tới UI:

| Code | UI message mẫu |
|---|---|
| `unsupported_type` | `Định dạng này chưa được hỗ trợ. Hãy dùng CSV hoặc Excel.` |
| `too_large` | `File vượt quá 10 MB. Hãy tách file thành các phần nhỏ hơn.` |
| `invalid_required` | `Một số dòng đang thiếu Từ vựng hoặc Nghĩa.` |
| `storage_failure` | `Không thể lưu dữ liệu trên trình duyệt. Vui lòng thử lại.` |
| `not_found` | `Bộ từ vựng không còn tồn tại.` |

Không hiển thị stack trace hoặc nội dung lỗi thô cho người dùng.

## 10. Security và privacy trong local-only MVP

- Dữ liệu file chỉ xử lý ở client, không upload lên server.
- Giới hạn kích thước và số dòng trước khi parse để tránh treo tab.
- Render text dạng text node; sanitize nếu sau này hỗ trợ rich text.
- Không lưu secret trong source; không thêm analytics gửi dữ liệu từ vựng ở MVP.

## 11. Đường nâng cấp backend

Khi backend sẵn sàng:

1. Giữ nguyên domain types và use cases.
2. Thêm `Http*Repository`, auth context và sync strategy.
3. Chọn migration một lần từ Dexie sang API hoặc cho phép export/import trong giai đoạn chuyển tiếp.
4. Đưa scheduling về server khi cần đồng bộ nhiều thiết bị; client vẫn optimistic-update qua cùng `ReviewResult` contract.

Không để API DTO lan vào component; chuyển đổi tại adapter boundary.

## 12. Rủi ro kỹ thuật

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| File Excel có header/encoding bất thường | Cao | Parser adapter, mapping thủ công, preview và lỗi theo dòng |
| IndexedDB bị giới hạn/quyền riêng tư trình duyệt | Trung bình | Kiểm tra quota, thông báo rõ, repository contract để thay backend |
| Session mất khi rời trang | Trung bình | Ghi review sau từng thẻ; cảnh báo khi có session đang chạy |
| Stitch output không khớp component contract | Trung bình | Chốt token và screen states trong `Stitch_Design_Spec.md` trước code |
