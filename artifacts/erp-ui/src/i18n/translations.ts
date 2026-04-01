export type Language = "vi" | "en" | "ko" | "ja";

export type TranslationKey =
  | "login.title"
  | "login.subtitle"
  | "login.email"
  | "login.password"
  | "login.forgotPassword"
  | "login.submit"
  | "login.noAccount"
  | "login.signUp"
  | "login.welcome"
  | "login.emailPlaceholder"
  | "login.passwordPlaceholder"
  | "home.greeting"
  | "home.subtitle"
  | "home.modules"
  | "home.recentActivity"
  | "home.quickStats"
  | "home.totalRevenue"
  | "home.activeOrders"
  | "home.tracedProducts"
  | "home.farmingAreas"
  | "topbar.notifications"
  | "topbar.profile"
  | "topbar.settings"
  | "topbar.logout"
  | "topbar.search"
  | "module.erp"
  | "module.erp.desc"
  | "module.txng"
  | "module.txng.desc"
  | "module.farming"
  | "module.farming.desc"
  | "submodule.back"
  | "submodule.erp.sales"
  | "submodule.erp.sales.desc"
  | "submodule.erp.purchase"
  | "submodule.erp.purchase.desc"
  | "submodule.erp.inventory"
  | "submodule.erp.inventory.desc"
  | "submodule.erp.accounting"
  | "submodule.erp.accounting.desc"
  | "submodule.erp.hr"
  | "submodule.erp.hr.desc"
  | "submodule.erp.production"
  | "submodule.erp.production.desc"
  | "submodule.erp.crm"
  | "submodule.erp.crm.desc"
  | "submodule.erp.reports"
  | "submodule.erp.reports.desc"
  | "submodule.erp.settings"
  | "submodule.erp.settings.desc"
  | "submodule.txng.qrcode"
  | "submodule.txng.qrcode.desc"
  | "submodule.txng.supplychain"
  | "submodule.txng.supplychain.desc"
  | "submodule.txng.certification"
  | "submodule.txng.certification.desc"
  | "submodule.txng.batch"
  | "submodule.txng.batch.desc"
  | "submodule.txng.timeline"
  | "submodule.txng.timeline.desc"
  | "submodule.txng.audit"
  | "submodule.txng.audit.desc"
  | "submodule.farming.zones"
  | "submodule.farming.zones.desc"
  | "submodule.farming.crops"
  | "submodule.farming.crops.desc"
  | "submodule.farming.pesticides"
  | "submodule.farming.pesticides.desc"
  | "submodule.farming.harvest"
  | "submodule.farming.harvest.desc"
  | "submodule.farming.weather"
  | "submodule.farming.weather.desc"
  | "submodule.farming.inspection"
  | "submodule.farming.inspection.desc"
  | "nav.home"
  | "nav.erp"
  | "nav.txng"
  | "nav.farming"
  | "nav.reports"
  | "nav.settings";

type Translations = Record<TranslationKey, string>;

const vi: Translations = {
  "login.title": "Chào mừng trở lại",
  "login.subtitle": "Đăng nhập để tiếp tục sử dụng hệ thống",
  "login.email": "Email",
  "login.password": "Mật khẩu",
  "login.forgotPassword": "Quên mật khẩu?",
  "login.submit": "Đăng nhập",
  "login.noAccount": "Chưa có tài khoản?",
  "login.signUp": "Đăng ký",
  "login.welcome": "Hệ thống ERP Nông nghiệp",
  "login.emailPlaceholder": "Nhập email của bạn",
  "login.passwordPlaceholder": "Nhập mật khẩu",
  "home.greeting": "Chào mừng quay lại",
  "home.subtitle": "Hôm nay bạn muốn làm gì?",
  "home.modules": "Phân hệ chính",
  "home.recentActivity": "Hoạt động gần đây",
  "home.quickStats": "Thống kê nhanh",
  "home.totalRevenue": "Doanh thu",
  "home.activeOrders": "Đơn hàng",
  "home.tracedProducts": "Sản phẩm truy xuất",
  "home.farmingAreas": "Vùng trồng",
  "topbar.notifications": "Thông báo",
  "topbar.profile": "Hồ sơ",
  "topbar.settings": "Cài đặt",
  "topbar.logout": "Đăng xuất",
  "topbar.search": "Tìm kiếm...",
  "module.erp": "ERP",
  "module.erp.desc": "Quản lý doanh nghiệp toàn diện",
  "module.txng": "Truy xuất nguồn gốc",
  "module.txng.desc": "Minh bạch chuỗi cung ứng",
  "module.farming": "Quản lý Vùng trồng",
  "module.farming.desc": "Giám sát & quản lý nông nghiệp",
  "submodule.back": "Quay lại",
  "submodule.erp.sales": "Bán hàng",
  "submodule.erp.sales.desc": "Quản lý đơn hàng và bán hàng",
  "submodule.erp.purchase": "Mua hàng",
  "submodule.erp.purchase.desc": "Quản lý đơn mua và nhà cung cấp",
  "submodule.erp.inventory": "Kho hàng",
  "submodule.erp.inventory.desc": "Quản lý tồn kho và xuất nhập",
  "submodule.erp.accounting": "Kế toán",
  "submodule.erp.accounting.desc": "Sổ sách và tài chính",
  "submodule.erp.hr": "Nhân sự",
  "submodule.erp.hr.desc": "Quản lý nhân viên và lương",
  "submodule.erp.production": "Sản xuất",
  "submodule.erp.production.desc": "Kế hoạch và sản xuất",
  "submodule.erp.crm": "Khách hàng",
  "submodule.erp.crm.desc": "Quan hệ khách hàng",
  "submodule.erp.reports": "Báo cáo",
  "submodule.erp.reports.desc": "Thống kê và phân tích",
  "submodule.erp.settings": "Cài đặt",
  "submodule.erp.settings.desc": "Cấu hình hệ thống",
  "submodule.txng.qrcode": "Mã QR",
  "submodule.txng.qrcode.desc": "Tạo và quản lý mã QR",
  "submodule.txng.supplychain": "Chuỗi cung ứng",
  "submodule.txng.supplychain.desc": "Theo dõi chuỗi cung ứng",
  "submodule.txng.certification": "Chứng nhận",
  "submodule.txng.certification.desc": "Quản lý chứng nhận chất lượng",
  "submodule.txng.batch": "Lô hàng",
  "submodule.txng.batch.desc": "Quản lý lô và mẻ sản xuất",
  "submodule.txng.timeline": "Lịch sử",
  "submodule.txng.timeline.desc": "Dòng thời gian truy xuất",
  "submodule.txng.audit": "Kiểm toán",
  "submodule.txng.audit.desc": "Nhật ký và kiểm toán",
  "submodule.farming.zones": "Vùng trồng",
  "submodule.farming.zones.desc": "Quản lý khu vực canh tác",
  "submodule.farming.crops": "Cây trồng",
  "submodule.farming.crops.desc": "Giống cây và mùa vụ",
  "submodule.farming.pesticides": "Thuốc BVTV",
  "submodule.farming.pesticides.desc": "Quản lý thuốc bảo vệ thực vật",
  "submodule.farming.harvest": "Thu hoạch",
  "submodule.farming.harvest.desc": "Kế hoạch và thu hoạch",
  "submodule.farming.weather": "Thời tiết",
  "submodule.farming.weather.desc": "Dự báo và giám sát khí hậu",
  "submodule.farming.inspection": "Kiểm định",
  "submodule.farming.inspection.desc": "Kiểm tra chất lượng sản phẩm",
  "nav.home": "Trang chủ",
  "nav.erp": "ERP",
  "nav.txng": "Truy xuất",
  "nav.farming": "Vùng trồng",
  "nav.reports": "Báo cáo",
  "nav.settings": "Cài đặt",
};

const en: Translations = {
  "login.title": "Welcome back",
  "login.subtitle": "Sign in to continue to the system",
  "login.email": "Email",
  "login.password": "Password",
  "login.forgotPassword": "Forgot password?",
  "login.submit": "Sign In",
  "login.noAccount": "Don't have an account?",
  "login.signUp": "Sign Up",
  "login.welcome": "AgriERP System",
  "login.emailPlaceholder": "Enter your email",
  "login.passwordPlaceholder": "Enter your password",
  "home.greeting": "Welcome back",
  "home.subtitle": "What would you like to do today?",
  "home.modules": "Main Modules",
  "home.recentActivity": "Recent Activity",
  "home.quickStats": "Quick Stats",
  "home.totalRevenue": "Revenue",
  "home.activeOrders": "Orders",
  "home.tracedProducts": "Traced Products",
  "home.farmingAreas": "Farming Areas",
  "topbar.notifications": "Notifications",
  "topbar.profile": "Profile",
  "topbar.settings": "Settings",
  "topbar.logout": "Logout",
  "topbar.search": "Search...",
  "module.erp": "ERP",
  "module.erp.desc": "Comprehensive business management",
  "module.txng": "Traceability",
  "module.txng.desc": "Transparent supply chain",
  "module.farming": "Farming Zones",
  "module.farming.desc": "Agricultural monitoring & management",
  "submodule.back": "Back",
  "submodule.erp.sales": "Sales",
  "submodule.erp.sales.desc": "Order and sales management",
  "submodule.erp.purchase": "Purchase",
  "submodule.erp.purchase.desc": "Purchase orders and suppliers",
  "submodule.erp.inventory": "Inventory",
  "submodule.erp.inventory.desc": "Stock and warehouse management",
  "submodule.erp.accounting": "Accounting",
  "submodule.erp.accounting.desc": "Books and financial records",
  "submodule.erp.hr": "HR",
  "submodule.erp.hr.desc": "Employee and payroll management",
  "submodule.erp.production": "Production",
  "submodule.erp.production.desc": "Planning and manufacturing",
  "submodule.erp.crm": "CRM",
  "submodule.erp.crm.desc": "Customer relationship management",
  "submodule.erp.reports": "Reports",
  "submodule.erp.reports.desc": "Statistics and analytics",
  "submodule.erp.settings": "Settings",
  "submodule.erp.settings.desc": "System configuration",
  "submodule.txng.qrcode": "QR Code",
  "submodule.txng.qrcode.desc": "Generate and manage QR codes",
  "submodule.txng.supplychain": "Supply Chain",
  "submodule.txng.supplychain.desc": "Track supply chain",
  "submodule.txng.certification": "Certification",
  "submodule.txng.certification.desc": "Quality certification management",
  "submodule.txng.batch": "Batch",
  "submodule.txng.batch.desc": "Batch and production lot management",
  "submodule.txng.timeline": "Timeline",
  "submodule.txng.timeline.desc": "Trace history timeline",
  "submodule.txng.audit": "Audit",
  "submodule.txng.audit.desc": "Logs and audit trails",
  "submodule.farming.zones": "Zones",
  "submodule.farming.zones.desc": "Farming zone management",
  "submodule.farming.crops": "Crops",
  "submodule.farming.crops.desc": "Crop varieties and seasons",
  "submodule.farming.pesticides": "Pesticides",
  "submodule.farming.pesticides.desc": "Pesticide and chemical management",
  "submodule.farming.harvest": "Harvest",
  "submodule.farming.harvest.desc": "Harvest planning and recording",
  "submodule.farming.weather": "Weather",
  "submodule.farming.weather.desc": "Weather forecast and monitoring",
  "submodule.farming.inspection": "Inspection",
  "submodule.farming.inspection.desc": "Quality inspection",
  "nav.home": "Home",
  "nav.erp": "ERP",
  "nav.txng": "Traceability",
  "nav.farming": "Farming",
  "nav.reports": "Reports",
  "nav.settings": "Settings",
};

const ko: Translations = {
  "login.title": "다시 오신 것을 환영합니다",
  "login.subtitle": "시스템을 계속 사용하려면 로그인하세요",
  "login.email": "이메일",
  "login.password": "비밀번호",
  "login.forgotPassword": "비밀번호를 잊으셨나요?",
  "login.submit": "로그인",
  "login.noAccount": "계정이 없으신가요?",
  "login.signUp": "회원가입",
  "login.welcome": "AgriERP 시스템",
  "login.emailPlaceholder": "이메일을 입력하세요",
  "login.passwordPlaceholder": "비밀번호를 입력하세요",
  "home.greeting": "다시 오신 것을 환영합니다",
  "home.subtitle": "오늘 무엇을 하시겠습니까?",
  "home.modules": "주요 모듈",
  "home.recentActivity": "최근 활동",
  "home.quickStats": "빠른 통계",
  "home.totalRevenue": "매출",
  "home.activeOrders": "주문",
  "home.tracedProducts": "추적 제품",
  "home.farmingAreas": "농업 구역",
  "topbar.notifications": "알림",
  "topbar.profile": "프로필",
  "topbar.settings": "설정",
  "topbar.logout": "로그아웃",
  "topbar.search": "검색...",
  "module.erp": "ERP",
  "module.erp.desc": "종합적인 비즈니스 관리",
  "module.txng": "원산지 추적",
  "module.txng.desc": "투명한 공급망",
  "module.farming": "농업 구역 관리",
  "module.farming.desc": "농업 모니터링 및 관리",
  "submodule.back": "뒤로",
  "submodule.erp.sales": "영업",
  "submodule.erp.sales.desc": "주문 및 판매 관리",
  "submodule.erp.purchase": "구매",
  "submodule.erp.purchase.desc": "구매 주문 및 공급업체",
  "submodule.erp.inventory": "재고",
  "submodule.erp.inventory.desc": "재고 및 창고 관리",
  "submodule.erp.accounting": "회계",
  "submodule.erp.accounting.desc": "장부 및 재무 기록",
  "submodule.erp.hr": "인사",
  "submodule.erp.hr.desc": "직원 및 급여 관리",
  "submodule.erp.production": "생산",
  "submodule.erp.production.desc": "계획 및 제조",
  "submodule.erp.crm": "CRM",
  "submodule.erp.crm.desc": "고객 관계 관리",
  "submodule.erp.reports": "보고서",
  "submodule.erp.reports.desc": "통계 및 분석",
  "submodule.erp.settings": "설정",
  "submodule.erp.settings.desc": "시스템 설정",
  "submodule.txng.qrcode": "QR 코드",
  "submodule.txng.qrcode.desc": "QR 코드 생성 및 관리",
  "submodule.txng.supplychain": "공급망",
  "submodule.txng.supplychain.desc": "공급망 추적",
  "submodule.txng.certification": "인증",
  "submodule.txng.certification.desc": "품질 인증 관리",
  "submodule.txng.batch": "배치",
  "submodule.txng.batch.desc": "배치 및 생산 로트 관리",
  "submodule.txng.timeline": "타임라인",
  "submodule.txng.timeline.desc": "추적 기록 타임라인",
  "submodule.txng.audit": "감사",
  "submodule.txng.audit.desc": "로그 및 감사 추적",
  "submodule.farming.zones": "구역",
  "submodule.farming.zones.desc": "농업 구역 관리",
  "submodule.farming.crops": "작물",
  "submodule.farming.crops.desc": "작물 품종 및 계절",
  "submodule.farming.pesticides": "농약",
  "submodule.farming.pesticides.desc": "농약 및 화학물질 관리",
  "submodule.farming.harvest": "수확",
  "submodule.farming.harvest.desc": "수확 계획 및 기록",
  "submodule.farming.weather": "날씨",
  "submodule.farming.weather.desc": "날씨 예보 및 모니터링",
  "submodule.farming.inspection": "검사",
  "submodule.farming.inspection.desc": "품질 검사",
  "nav.home": "홈",
  "nav.erp": "ERP",
  "nav.txng": "추적",
  "nav.farming": "농업",
  "nav.reports": "보고서",
  "nav.settings": "설정",
};

const ja: Translations = {
  "login.title": "お帰りなさい",
  "login.subtitle": "システムを続けるにはサインインしてください",
  "login.email": "メール",
  "login.password": "パスワード",
  "login.forgotPassword": "パスワードをお忘れですか？",
  "login.submit": "サインイン",
  "login.noAccount": "アカウントをお持ちでないですか？",
  "login.signUp": "サインアップ",
  "login.welcome": "AgriERPシステム",
  "login.emailPlaceholder": "メールを入力してください",
  "login.passwordPlaceholder": "パスワードを入力してください",
  "home.greeting": "お帰りなさい",
  "home.subtitle": "今日は何をしますか？",
  "home.modules": "主要モジュール",
  "home.recentActivity": "最近のアクティビティ",
  "home.quickStats": "クイック統計",
  "home.totalRevenue": "収益",
  "home.activeOrders": "注文",
  "home.tracedProducts": "トレース製品",
  "home.farmingAreas": "農業エリア",
  "topbar.notifications": "通知",
  "topbar.profile": "プロフィール",
  "topbar.settings": "設定",
  "topbar.logout": "ログアウト",
  "topbar.search": "検索...",
  "module.erp": "ERP",
  "module.erp.desc": "総合的なビジネス管理",
  "module.txng": "トレーサビリティ",
  "module.txng.desc": "透明なサプライチェーン",
  "module.farming": "農業ゾーン管理",
  "module.farming.desc": "農業モニタリング＆管理",
  "submodule.back": "戻る",
  "submodule.erp.sales": "販売",
  "submodule.erp.sales.desc": "注文と販売管理",
  "submodule.erp.purchase": "購買",
  "submodule.erp.purchase.desc": "発注書とサプライヤー",
  "submodule.erp.inventory": "在庫",
  "submodule.erp.inventory.desc": "在庫と倉庫管理",
  "submodule.erp.accounting": "会計",
  "submodule.erp.accounting.desc": "帳簿と財務記録",
  "submodule.erp.hr": "人事",
  "submodule.erp.hr.desc": "従業員と給与管理",
  "submodule.erp.production": "生産",
  "submodule.erp.production.desc": "計画と製造",
  "submodule.erp.crm": "CRM",
  "submodule.erp.crm.desc": "顧客関係管理",
  "submodule.erp.reports": "レポート",
  "submodule.erp.reports.desc": "統計と分析",
  "submodule.erp.settings": "設定",
  "submodule.erp.settings.desc": "システム設定",
  "submodule.txng.qrcode": "QRコード",
  "submodule.txng.qrcode.desc": "QRコードの生成と管理",
  "submodule.txng.supplychain": "サプライチェーン",
  "submodule.txng.supplychain.desc": "サプライチェーンの追跡",
  "submodule.txng.certification": "認証",
  "submodule.txng.certification.desc": "品質認証管理",
  "submodule.txng.batch": "バッチ",
  "submodule.txng.batch.desc": "バッチと生産ロット管理",
  "submodule.txng.timeline": "タイムライン",
  "submodule.txng.timeline.desc": "トレース履歴タイムライン",
  "submodule.txng.audit": "監査",
  "submodule.txng.audit.desc": "ログと監査証跡",
  "submodule.farming.zones": "ゾーン",
  "submodule.farming.zones.desc": "農業ゾーン管理",
  "submodule.farming.crops": "作物",
  "submodule.farming.crops.desc": "作物品種と季節",
  "submodule.farming.pesticides": "農薬",
  "submodule.farming.pesticides.desc": "農薬と化学物質の管理",
  "submodule.farming.harvest": "収穫",
  "submodule.farming.harvest.desc": "収穫計画と記録",
  "submodule.farming.weather": "天気",
  "submodule.farming.weather.desc": "天気予報とモニタリング",
  "submodule.farming.inspection": "検査",
  "submodule.farming.inspection.desc": "品質検査",
  "nav.home": "ホーム",
  "nav.erp": "ERP",
  "nav.txng": "トレース",
  "nav.farming": "農業",
  "nav.reports": "レポート",
  "nav.settings": "設定",
};

export const translations: Record<Language, Translations> = { vi, en, ko, ja };

export const languageLabels: Record<Language, { label: string; flag: string }> = {
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
  en: { label: "English", flag: "🇺🇸" },
  ko: { label: "한국어", flag: "🇰🇷" },
  ja: { label: "日本語", flag: "🇯🇵" },
};
