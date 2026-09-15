import type { Deck, VocabularyEntry } from '@/domain/types';

export const copy = {
  brand: 'VocaHub',
  nav: {
    overview: 'Tổng quan',
    vocabulary: 'Bộ từ vựng',
    practice: 'Luyện tập',
    settings: 'Cài đặt',
    help: 'Trợ giúp',
    collapse: 'Thu gọn'
  },
  dashboard: {
    greeting: 'Chào buổi sáng',
    greetingHint: 'Sẵn sàng học tiếp chưa?',
    title: 'Tổng quan',
    reviewToday: 'Cần ôn hôm nay',
    totalWords: 'Tổng số từ',
    streak: 'Chuỗi ngày học',
    decksTitle: 'Bộ từ vựng của tôi',
    import: 'Import danh sách',
    createDeck: 'Tạo deck trống',
    createDeckShort: 'Tạo bộ từ mới',
    createDeckTitle: 'Tạo bộ từ vựng mới',
    createDeckName: 'Tên bộ từ vựng',
    createDeckPlaceholder: 'VD: IELTS Vocabulary',
    viewDeck: 'Xem deck',
    studyNow: 'Học ngay',
    emptyTitle: 'Bắt đầu với bộ từ đầu tiên',
    emptyDescription: 'Nhập tập từ vựng (CSV/XLSX) để bắt đầu học hoặc tạo bộ từ thủ công.',
    supportedFormat: 'Xem định dạng file hỗ trợ',
    createHint: 'Nhập thủ công các từ vào deck'
  },
  import: {
    title: 'Import danh sách',
    breadcrumb: 'Tổng quan / Import danh sách',
    steps: ['Chọn file', 'Kiểm tra dữ liệu', 'Hoàn tất'],
    dropTitle: 'Kéo thả file vào đây',
    dropOr: 'HOẶC',
    chooseFile: 'Chọn file',
    mobileDropHint: 'Kéo thả hoặc chạm để chọn file',
    supported: 'Định dạng hỗ trợ',
    maxSize: 'Tối đa 10 MB',
    mappingTitle: 'CẤU HÌNH CỘT DỮ LIỆU',
    mappingHint: 'Ghép các cột từ file của bạn với các trường dữ liệu tương ứng trong VocaHub.',
    previewTitle: 'XEM TRƯỚC DỮ LIỆU',
    validRows: 'dòng hợp lệ',
    invalidRows: 'dòng cần kiểm tra',
    deckName: 'Tên bộ từ vựng',
    deckNamePlaceholder: 'VD: IELTS Vocabulary',
    back: 'Quay lại',
    next: 'Tiếp tục',
    create: 'Tạo bộ từ',
    cancel: 'Hủy',
    defaultMapping: 'Mặc định dạng file',
    mappingHintShort: 'Để import thành công, hãy đảm bảo file có các cột "Từ vựng" (bắt buộc) và "Nghĩa" (bắt buộc).',
    chooseColumn: 'Chọn cột...',
    removeRow: 'Xóa dòng',
    selectRow: 'Chọn dòng',
    deselectRow: 'Bỏ chọn dòng',
    row: 'Dòng'
  },
  deck: {
    breadcrumb: 'Tổng quan / Bộ từ vựng',
    words: 'Từ vựng',
    dueToday: 'Cần ôn hôm nay',
    flashcards: 'Học flashcard',
    quiz: 'Làm quiz',
    addWord: 'Thêm từ mới',
    searchPlaceholder: 'Tìm kiếm từ vựng...',
    filter: 'Trạng thái',
    filterAll: 'Tất cả trạng thái',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    rename: 'Đổi tên',
    deleteConfirmTitle: 'Xóa bộ từ vựng?',
    deleteConfirmDescription: 'Tất cả từ trong bộ này sẽ bị xóa vĩnh viễn.',
    emptyTitle: 'Deck chưa có từ nào',
    emptyDescription: 'Thêm từ đầu tiên để bắt đầu học.',
    save: 'Lưu từ',
    close: 'Đóng',
    formTitleAdd: 'Thêm từ mới',
    formTitleEdit: 'Chỉnh sửa từ',
    term: 'Từ vựng',
    meaning: 'Nghĩa',
    pronunciation: 'Phiên âm',
    example: 'Ví dụ',
    partOfSpeech: 'Loại từ',
    optional: 'không bắt buộc',
    requiredError: 'Vui lòng nhập trường bắt buộc.'
  },
  study: {
    exit: 'Thoát',
    flipHint: 'Chạm để lật',
    flipToBack: 'Lật thẻ để xem nghĩa',
    flipToFront: 'Lật lại mặt trước',
    front: 'ĐỒNG TỪ',
    back: 'NGHĨA',
    termLabel: 'TỪ VỰNG',
    meaningLabel: 'NGHĨA CHÍNH',
    rateHint: 'Chọn mức độ nhớ để tiếp tục',
    again: 'Chưa nhớ',
    hard: 'Nhớ mơ hồ',
    good: 'Đã nhớ',
    next: 'Câu tiếp theo',
    chooseMeaning: 'Chọn nghĩa đúng',
    correctAnswer: 'Đáp án đúng',
    incorrect: 'Không chính xác.',
    correct: 'Chính xác!',
    completed: 'Hoàn thành phiên học',
    sessionComplete: 'PHIÊN HỌC ĐÃ XONG',
    flashcardCompleteHint: 'Bạn đã đi qua toàn bộ thẻ trong phiên này.',
    quizCompleteHint: 'Một vòng luyện tập gọn gàng, thêm một bước tiến mới.',
    score: 'điểm xuất sắc',
    reviewWrong: 'Học lại các câu sai',
    viewDeck: 'Xem deck',
    retry: 'Học lại',
    progress: 'Tiến độ',
    time: 'Thời gian',
    accuracy: 'Độ chính xác',
    quizResults: 'Kết quả kiểm tra',
    memoryDistribution: 'Phân phối thẻ ghi nhớ',
    wrongQuestions: 'Câu sai cần chú ý',
    close: 'close'
  },
  statuses: { new: 'Mới', learning: 'Đang học', mastered: 'Đã thuộc' },
  errors: {
    insufficientChoices: 'Deck cần ít nhất 4 nghĩa khác nhau để làm quiz.',
    storage: 'Không thể lưu dữ liệu. Vui lòng thử lại.',
    review: 'Không thể lưu kết quả học. Vui lòng thử lại.',
    retryReview: 'Thử lưu lại'
  }
} as const;

const now = Date.now();
const seedTerms = [
  ['allocate', 'phân bổ, cấp phát', 'allocate resources effectively'],
  ['deadline', 'hạn chót, thời hạn', 'meet the project deadline'],
  ['negotiate', 'đàm phán, thương lượng', 'negotiate a better contract'],
  ['reliable', 'đáng tin cậy, chắc chắn', 'a reliable source of information'],
  ['accommodate', 'cung cấp chỗ ở', 'accommodate all guests'],
  ['ephemeral', 'phù du, chóng tàn', 'an ephemeral moment'],
  ['sycophant', 'kẻ nịnh hót', 'avoid a workplace sycophant'],
  ['cacophony', 'âm thanh chói tai', 'a cacophony of voices']
] as const;

export const sampleDeck: Deck = {
  id: 'deck-toeic',
  name: 'TOEIC Part 5 — Công việc',
  source: 'import',
  createdAt: new Date(now - 7 * 86400000).toISOString(),
  updatedAt: new Date(now).toISOString()
};

export const createSampleEntries = (): VocabularyEntry[] =>
  Array.from({ length: 120 }, (_, index) => {
    const seed = seedTerms[index % seedTerms.length];
    const due = index < 18;
    return {
      id: `entry-${index + 1}`,
      deckId: sampleDeck.id,
      term: index < seedTerms.length ? seed[0] : `${seed[0]} ${index + 1}`,
      meaning: seed[1],
      pronunciation: index < seedTerms.length ? `/${seed[0]}/` : undefined,
      example: seed[2],
      partOfSpeech: index % 2 === 0 ? 'Động từ (v)' : 'Tính từ (adj)',
      status: index < 4 ? (index === 0 ? 'new' : index === 1 ? 'learning' : 'mastered') : 'learning',
      lastReviewedAt: due ? new Date(now - 86400000).toISOString() : undefined,
      nextReviewAt: due ? new Date(now - 1000).toISOString() : new Date(now + 2 * 86400000).toISOString(),
      correctCount: index % 3,
      incorrectCount: index % 2
    };
  });
