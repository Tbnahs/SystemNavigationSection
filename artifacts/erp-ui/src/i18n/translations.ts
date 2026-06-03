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
  | "module.iot"
  | "module.iot.desc"
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
  | "submodule.erp.quality"
  | "submodule.erp.quality.desc"
  | "submodule.erp.quy-cach"
  | "submodule.erp.quy-cach.desc"
  | "submodule.erp.farmers"
  | "submodule.erp.farmers.desc"
  | "submodule.erp.packaging"
  | "submodule.erp.packaging.desc"
  | "submodule.erp.crm"
  | "submodule.erp.crm.desc"
  | "submodule.erp.reports"
  | "submodule.erp.reports.desc"
  | "submodule.erp.settings"
  | "submodule.erp.settings.desc"
  | "submodule.erp.thu-mua"
  | "submodule.erp.thu-mua.desc"
  | "submodule.erp.thuong-pham"
  | "submodule.erp.thuong-pham.desc"
  | "submodule.erp.giong-che"
  | "submodule.erp.giong-che.desc"
  | "submodule.erp.co-so"
  | "submodule.erp.co-so.desc"
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
  | "submodule.iot.sensors"
  | "submodule.iot.sensors.desc"
  | "submodule.iot.alerts"
  | "submodule.iot.alerts.desc"
  | "submodule.iot.monitoring"
  | "submodule.iot.monitoring.desc"
  | "submodule.iot.reports"
  | "submodule.iot.reports.desc"
  | "nav.home"
  | "nav.erp"
  | "nav.txng"
  | "nav.farming"
  | "nav.iot"
  | "nav.reports"
  | "nav.settings"
  | "nav.module.txng"
  | "nav.module.vung-trong"
  | "nav.module.portal.admin"
  | "nav.system.status"
  | "nav.portal.overview"
  | "nav.portal.enterprise"
  | "nav.portal.users"
  | "nav.portal.units"
  | "nav.portal.co-so"
  | "nav.div.thu-mua"
  | "nav.div.san-xuat"
  | "nav.div.dong-goi"
  | "nav.div.ban-hang"
  | "nav.div.bao-cao"
  | "nav.div.danh-muc"
  | "nav.div.quan-tri-dn"
  | "nav.div.chung-chi"
  | "nav.div.quan-ly-tp"
  | "nav.div.su-kien"
  | "nav.div.vung-nl"
  | "nav.div.truy-xuat"
  | "nav.div.quan-ly-tem"
  | "nav.div.thiet-bi-iot"
  | "nav.txng.staff"
  | "nav.txng.chung-chi-dn"
  | "nav.txng.chung-chi-tp"
  | "nav.txng.su-kien"
  | "nav.txng.bieu-mau-hd"
  | "nav.txng.vung-nuoi-trong"
  | "nav.txng.theo-lo"
  | "nav.txng.tem"
  | "nav.txng.bao-cao-tem"
  | "nav.txng.lich-su-tem"
  | "nav.vt.zones"
  | "nav.vt.crops"
  | "nav.vt.pesticides"
  | "nav.vt.harvest"
  | "nav.vt.weather"
  | "nav.vt.inspection"
  | "nav.iot.devices"
  | "nav.iot.connect"
  | "nav.iot.monitor"
  | "home.system.portal.desc"
  | "home.system.erp.desc"
  | "home.system.txng.desc"
  | "home.system.vung-trong.desc";

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
  "submodule.erp.quality": "QC - Chất lượng",
  "submodule.erp.quality.desc": "Kiểm tra & quản lý chất lượng sản phẩm",
  "submodule.erp.quy-cach": "Quy cách & Tiêu chuẩn",
  "submodule.erp.quy-cach.desc": "Bảng quy cách thu hái và đơn giá thu mua",
  "submodule.erp.farmers": "Hộ dân liên kết",
  "submodule.erp.farmers.desc": "Danh sách hộ thu mua liên kết HTX",
  "submodule.erp.packaging": "Đóng gói",
  "submodule.erp.packaging.desc": "Quản lý lô đóng gói thành phẩm",
  "submodule.erp.crm": "Khách hàng",
  "submodule.erp.crm.desc": "Quan hệ khách hàng",
  "submodule.erp.reports": "Báo cáo",
  "submodule.erp.reports.desc": "Thống kê và phân tích",
  "submodule.erp.settings": "Cài đặt",
  "submodule.erp.settings.desc": "Cấu hình hệ thống",
  "submodule.erp.thu-mua": "Đơn thu mua",
  "submodule.erp.thu-mua.desc": "Quản lý phiếu thu mua nguyên liệu",
  "submodule.erp.thuong-pham": "Thương phẩm",
  "submodule.erp.thuong-pham.desc": "Danh mục sản phẩm chè thương phẩm",
  "submodule.erp.giong-che": "Giống chè",
  "submodule.erp.giong-che.desc": "Danh mục giống chè canh tác",
  "submodule.erp.co-so": "Cơ sở",
  "submodule.erp.co-so.desc": "Quản lý cơ sở và hộ liên kết",
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
  "submodule.iot.sensors": "Cảm biến",
  "submodule.iot.sensors.desc": "Quản lý cảm biến IoT",
  "submodule.iot.alerts": "Cảnh báo",
  "submodule.iot.alerts.desc": "Giám sát và cảnh báo",
  "submodule.iot.monitoring": "Giám sát",
  "submodule.iot.monitoring.desc": "Theo dõi dữ liệu thực tế",
  "submodule.iot.reports": "Báo cáo IoT",
  "submodule.iot.reports.desc": "Phân tích dữ liệu IoT",
  "module.iot": "Hệ thống IoT & IOC",
  "module.iot.desc": "Giám sát và thu thập dữ liệu từ cảm biến",
  "nav.home": "Trang chủ",
  "nav.erp": "ERP",
  "nav.txng": "Truy xuất",
  "nav.farming": "Vùng trồng",
  "nav.iot": "IoT & IOC",
  "nav.reports": "Báo cáo",
  "nav.settings": "Cài đặt",
  "nav.module.txng": "Truy xuất nguồn gốc",
  "nav.module.vung-trong": "Vùng trồng",
  "nav.module.portal.admin": "Quản trị hệ thống",
  "nav.system.status": "Hệ thống hoạt động bình thường",
  "nav.portal.overview": "Tổng quan",
  "nav.portal.enterprise": "Doanh nghiệp",
  "nav.portal.users": "Người dùng",
  "nav.portal.units": "Đơn vị tính",
  "nav.portal.co-so": "Cơ sở",
  "nav.div.thu-mua": "Thu mua",
  "nav.div.san-xuat": "Sản xuất",
  "nav.div.dong-goi": "Đóng gói",
  "nav.div.ban-hang": "Bán hàng",
  "nav.div.bao-cao": "Báo cáo",
  "nav.div.danh-muc": "Danh mục",
  "nav.div.quan-tri-dn": "Quản trị doanh nghiệp",
  "nav.div.chung-chi": "Quản lý chứng chỉ",
  "nav.div.quan-ly-tp": "Quản lý thương phẩm",
  "nav.div.su-kien": "Quản lý sự kiện trọng yếu",
  "nav.div.vung-nl": "Quản lý vùng nguyên liệu",
  "nav.div.truy-xuat": "Truy xuất",
  "nav.div.quan-ly-tem": "Quản lý tem",
  "nav.div.thiet-bi-iot": "Thiết bị IoT",
  "nav.txng.staff": "Nhân viên",
  "nav.txng.chung-chi-dn": "Chứng chỉ doanh nghiệp",
  "nav.txng.chung-chi-tp": "Chứng chỉ thương phẩm",
  "nav.txng.su-kien": "Biểu mẫu sự kiện",
  "nav.txng.bieu-mau-hd": "Biểu mẫu hoạt động",
  "nav.txng.vung-nuoi-trong": "Vùng nuôi trồng",
  "nav.txng.theo-lo": "Theo lô thương phẩm",
  "nav.txng.tem": "Quản lý tem",
  "nav.txng.bao-cao-tem": "Báo cáo lượt quét tem",
  "nav.txng.lich-su-tem": "Lịch sử kích hoạt tem",
  "nav.vt.zones": "Vùng trồng",
  "nav.vt.crops": "Cây trồng",
  "nav.vt.pesticides": "Thuốc BVTV",
  "nav.vt.harvest": "Thu hoạch",
  "nav.vt.weather": "Thời tiết",
  "nav.vt.inspection": "Kiểm định",
  "nav.iot.devices": "Thiết bị",
  "nav.iot.connect": "Kết nối",
  "nav.iot.monitor": "Giám sát",
  "home.system.portal.desc": "Quản lý tài khoản và phân quyền truy cập",
  "home.system.erp.desc": "Thu mua, sản xuất, đóng gói, bán hàng",
  "home.system.txng.desc": "QR code, chuỗi cung ứng, chứng nhận",
  "home.system.vung-trong.desc": "Quản lý vùng nguyên liệu, cây trồng và thiết bị IoT",
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
  "submodule.erp.quality": "QC - Quality",
  "submodule.erp.quality.desc": "Inspect & manage product quality",
  "submodule.erp.quy-cach": "Standards & Pricing",
  "submodule.erp.quy-cach.desc": "Harvest grade specs and purchase prices",
  "submodule.erp.farmers": "Partner Farmers",
  "submodule.erp.farmers.desc": "Cooperative linked farming households",
  "submodule.erp.packaging": "Packaging",
  "submodule.erp.packaging.desc": "Finished goods packaging lots",
  "submodule.iot.sensors": "Sensors",
  "submodule.iot.sensors.desc": "Manage IoT sensors",
  "submodule.iot.alerts": "Alerts",
  "submodule.iot.alerts.desc": "Monitoring and alerting",
  "submodule.iot.monitoring": "Monitoring",
  "submodule.iot.monitoring.desc": "Real-time data tracking",
  "submodule.iot.reports": "IoT Reports",
  "submodule.iot.reports.desc": "IoT data analysis",
  "module.iot": "IoT & IOC System",
  "module.iot.desc": "Sensor monitoring and data collection",
  "nav.home": "Home",
  "nav.erp": "ERP",
  "nav.txng": "Traceability",
  "nav.farming": "Farming",
  "nav.iot": "IoT & IOC",
  "nav.reports": "Reports",
  "nav.settings": "Settings",
  "submodule.erp.thu-mua": "Purchase Orders",
  "submodule.erp.thu-mua.desc": "Manage raw material purchase orders",
  "submodule.erp.thuong-pham": "Products",
  "submodule.erp.thuong-pham.desc": "Tea product catalogue",
  "submodule.erp.giong-che": "Tea Varieties",
  "submodule.erp.giong-che.desc": "Tea cultivation varieties",
  "submodule.erp.co-so": "Facilities",
  "submodule.erp.co-so.desc": "Manage facilities and linked households",
  "nav.module.txng": "Traceability",
  "nav.module.vung-trong": "Farming Zones",
  "nav.module.portal.admin": "System Admin",
  "nav.system.status": "System operating normally",
  "nav.portal.overview": "Overview",
  "nav.portal.enterprise": "Enterprises",
  "nav.portal.users": "Users",
  "nav.portal.units": "Units of Measure",
  "nav.portal.co-so": "Facilities",
  "nav.div.thu-mua": "Procurement",
  "nav.div.san-xuat": "Production",
  "nav.div.dong-goi": "Packaging",
  "nav.div.ban-hang": "Sales",
  "nav.div.bao-cao": "Reports",
  "nav.div.danh-muc": "Catalogue",
  "nav.div.quan-tri-dn": "Enterprise Admin",
  "nav.div.chung-chi": "Certificates",
  "nav.div.quan-ly-tp": "Products",
  "nav.div.su-kien": "Key Events",
  "nav.div.vung-nl": "Raw Material Zones",
  "nav.div.truy-xuat": "Traceability",
  "nav.div.quan-ly-tem": "Label Management",
  "nav.div.thiet-bi-iot": "IoT Devices",
  "nav.txng.staff": "Staff",
  "nav.txng.chung-chi-dn": "Enterprise Certs",
  "nav.txng.chung-chi-tp": "Product Certs",
  "nav.txng.su-kien": "Event Forms",
  "nav.txng.bieu-mau-hd": "Activity Forms",
  "nav.txng.vung-nuoi-trong": "Growing Zones",
  "nav.txng.theo-lo": "By Product Lot",
  "nav.txng.tem": "Label Management",
  "nav.txng.bao-cao-tem": "Label Scan Reports",
  "nav.txng.lich-su-tem": "Label Activation History",
  "nav.vt.zones": "Growing Zones",
  "nav.vt.crops": "Crops",
  "nav.vt.pesticides": "Pesticides",
  "nav.vt.harvest": "Harvest",
  "nav.vt.weather": "Weather",
  "nav.vt.inspection": "Inspection",
  "nav.iot.devices": "Devices",
  "nav.iot.connect": "Connection",
  "nav.iot.monitor": "Monitoring",
  "home.system.portal.desc": "Account management and access control",
  "home.system.erp.desc": "Procurement, production, packaging, sales",
  "home.system.txng.desc": "QR codes, supply chain, certification",
  "home.system.vung-trong.desc": "Manage raw material zones, crops and IoT devices",
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
  "submodule.erp.quality": "QC - 품질",
  "submodule.erp.quality.desc": "제품 품질 검사 및 관리",
  "submodule.erp.quy-cach": "등급 & 기준",
  "submodule.erp.quy-cach.desc": "수확 등급 사양 및 구매 가격",
  "submodule.erp.farmers": "계약 농가",
  "submodule.erp.farmers.desc": "협동조합 연계 농가 목록",
  "submodule.erp.packaging": "포장",
  "submodule.erp.packaging.desc": "완제품 포장 로트 관리",
  "submodule.iot.sensors": "센서",
  "submodule.iot.sensors.desc": "IoT 센서 관리",
  "submodule.iot.alerts": "경고",
  "submodule.iot.alerts.desc": "모니터링 및 경고",
  "submodule.iot.monitoring": "모니터링",
  "submodule.iot.monitoring.desc": "실시간 데이터 추적",
  "submodule.iot.reports": "IoT 보고서",
  "submodule.iot.reports.desc": "IoT 데이터 분석",
  "module.iot": "IoT & IOC 시스템",
  "module.iot.desc": "센서 모니터링 및 데이터 수집",
  "nav.home": "홈",
  "nav.erp": "ERP",
  "nav.txng": "추적",
  "nav.farming": "농업",
  "nav.iot": "IoT & IOC",
  "nav.reports": "보고서",
  "nav.settings": "설정",
  "submodule.erp.thu-mua": "구매 주문",
  "submodule.erp.thu-mua.desc": "원자재 구매 주문 관리",
  "submodule.erp.thuong-pham": "제품",
  "submodule.erp.thuong-pham.desc": "차 제품 카탈로그",
  "submodule.erp.giong-che": "차 품종",
  "submodule.erp.giong-che.desc": "차 재배 품종",
  "submodule.erp.co-so": "시설",
  "submodule.erp.co-so.desc": "시설 및 연계 농가 관리",
  "nav.module.txng": "원산지 추적",
  "nav.module.vung-trong": "농업 구역",
  "nav.module.portal.admin": "시스템 관리",
  "nav.system.status": "시스템 정상 운영 중",
  "nav.portal.overview": "개요",
  "nav.portal.enterprise": "기업",
  "nav.portal.users": "사용자",
  "nav.portal.units": "단위",
  "nav.portal.co-so": "시설",
  "nav.div.thu-mua": "구매",
  "nav.div.san-xuat": "생산",
  "nav.div.dong-goi": "포장",
  "nav.div.ban-hang": "판매",
  "nav.div.bao-cao": "보고서",
  "nav.div.danh-muc": "카탈로그",
  "nav.div.quan-tri-dn": "기업 관리",
  "nav.div.chung-chi": "인증서",
  "nav.div.quan-ly-tp": "제품",
  "nav.div.su-kien": "주요 이벤트",
  "nav.div.vung-nl": "원자재 구역",
  "nav.div.truy-xuat": "추적",
  "nav.div.quan-ly-tem": "라벨 관리",
  "nav.div.thiet-bi-iot": "IoT 장치",
  "nav.txng.staff": "직원",
  "nav.txng.chung-chi-dn": "기업 인증서",
  "nav.txng.chung-chi-tp": "제품 인증서",
  "nav.txng.su-kien": "이벤트 양식",
  "nav.txng.bieu-mau-hd": "활동 양식",
  "nav.txng.vung-nuoi-trong": "재배 구역",
  "nav.txng.theo-lo": "로트별 추적",
  "nav.txng.tem": "라벨 관리",
  "nav.txng.bao-cao-tem": "라벨 스캔 보고서",
  "nav.txng.lich-su-tem": "라벨 활성화 이력",
  "nav.vt.zones": "재배 구역",
  "nav.vt.crops": "작물",
  "nav.vt.pesticides": "농약",
  "nav.vt.harvest": "수확",
  "nav.vt.weather": "날씨",
  "nav.vt.inspection": "검사",
  "nav.iot.devices": "장치",
  "nav.iot.connect": "연결",
  "nav.iot.monitor": "모니터링",
  "home.system.portal.desc": "계정 관리 및 접근 제어",
  "home.system.erp.desc": "구매, 생산, 포장, 판매",
  "home.system.txng.desc": "QR 코드, 공급망, 인증",
  "home.system.vung-trong.desc": "원자재 구역, 작물 및 IoT 장치 관리",
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
  "submodule.erp.quality": "QC - 品質",
  "submodule.erp.quality.desc": "製品品質検査・管理",
  "submodule.erp.quy-cach": "規格・基準",
  "submodule.erp.quy-cach.desc": "収穫規格仕様と買取価格",
  "submodule.erp.farmers": "契約農家",
  "submodule.erp.farmers.desc": "協同組合連携農家リスト",
  "submodule.erp.packaging": "梱包",
  "submodule.erp.packaging.desc": "完成品梱包ロット管理",
  "submodule.iot.sensors": "センサー",
  "submodule.iot.sensors.desc": "IoTセンサー管理",
  "submodule.iot.alerts": "警告",
  "submodule.iot.alerts.desc": "監視とアラート",
  "submodule.iot.monitoring": "監視",
  "submodule.iot.monitoring.desc": "リアルタイムデータ追跡",
  "submodule.iot.reports": "IoTレポート",
  "submodule.iot.reports.desc": "IoTデータ分析",
  "module.iot": "IoT & IOCシステム",
  "module.iot.desc": "センサー監視とデータ収集",
  "nav.home": "ホーム",
  "nav.erp": "ERP",
  "nav.txng": "トレース",
  "nav.farming": "農業",
  "nav.iot": "IoT & IOC",
  "nav.reports": "レポート",
  "nav.settings": "設定",
  "submodule.erp.thu-mua": "購買注文",
  "submodule.erp.thu-mua.desc": "原材料購買注文の管理",
  "submodule.erp.thuong-pham": "製品",
  "submodule.erp.thuong-pham.desc": "茶製品カタログ",
  "submodule.erp.giong-che": "茶品種",
  "submodule.erp.giong-che.desc": "茶栽培品種",
  "submodule.erp.co-so": "施設",
  "submodule.erp.co-so.desc": "施設と連携農家の管理",
  "nav.module.txng": "トレーサビリティ",
  "nav.module.vung-trong": "農業ゾーン",
  "nav.module.portal.admin": "システム管理",
  "nav.system.status": "システム正常稼働中",
  "nav.portal.overview": "概要",
  "nav.portal.enterprise": "企業",
  "nav.portal.users": "ユーザー",
  "nav.portal.units": "単位",
  "nav.portal.co-so": "施設",
  "nav.div.thu-mua": "調達",
  "nav.div.san-xuat": "生産",
  "nav.div.dong-goi": "梱包",
  "nav.div.ban-hang": "販売",
  "nav.div.bao-cao": "レポート",
  "nav.div.danh-muc": "カタログ",
  "nav.div.quan-tri-dn": "企業管理",
  "nav.div.chung-chi": "証明書",
  "nav.div.quan-ly-tp": "製品",
  "nav.div.su-kien": "重要イベント",
  "nav.div.vung-nl": "原材料ゾーン",
  "nav.div.truy-xuat": "トレーサビリティ",
  "nav.div.quan-ly-tem": "ラベル管理",
  "nav.div.thiet-bi-iot": "IoTデバイス",
  "nav.txng.staff": "スタッフ",
  "nav.txng.chung-chi-dn": "企業証明書",
  "nav.txng.chung-chi-tp": "製品証明書",
  "nav.txng.su-kien": "イベントフォーム",
  "nav.txng.bieu-mau-hd": "活動フォーム",
  "nav.txng.vung-nuoi-trong": "栽培ゾーン",
  "nav.txng.theo-lo": "ロット別追跡",
  "nav.txng.tem": "ラベル管理",
  "nav.txng.bao-cao-tem": "ラベルスキャンレポート",
  "nav.txng.lich-su-tem": "ラベル有効化履歴",
  "nav.vt.zones": "栽培ゾーン",
  "nav.vt.crops": "作物",
  "nav.vt.pesticides": "農薬",
  "nav.vt.harvest": "収穫",
  "nav.vt.weather": "天気",
  "nav.vt.inspection": "検査",
  "nav.iot.devices": "デバイス",
  "nav.iot.connect": "接続",
  "nav.iot.monitor": "モニタリング",
  "home.system.portal.desc": "アカウント管理とアクセス制御",
  "home.system.erp.desc": "調達、生産、梱包、販売",
  "home.system.txng.desc": "QRコード、サプライチェーン、認証",
  "home.system.vung-trong.desc": "原材料ゾーン、作物およびIoTデバイスの管理",
};

export const translations: Record<Language, Translations> = { vi, en, ko, ja };

export const languageLabels: Record<Language, { label: string; flag: string }> = {
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
  en: { label: "English", flag: "🇺🇸" },
  ko: { label: "한국어", flag: "🇰🇷" },
  ja: { label: "日本語", flag: "🇯🇵" },
};
