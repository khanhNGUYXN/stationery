# Phân quyền hệ thống - 3 Roles

## 🎯 Tổng quan

Hệ thống quản lý văn phòng phẩm sử dụng 3 cấp độ phân quyền:

### 📊 Cấu trúc phân quyền

| **Role**        | **Mô tả**        | **Quyền hạn**                                          |
| --------------- | ---------------- | ------------------------------------------------------ |
| **EMPLOYEE**    | Nhân viên thường | Xem sản phẩm, đặt hàng, xem yêu cầu cá nhân            |
| **MANAGER**     | Quản lý          | Duyệt yêu cầu, xem báo cáo, quản lý nhân viên          |
| **SUPER_ADMIN** | Quản trị viên    | Quản lý sản phẩm, quản lý tài khoản, cấu hình hệ thống |

## 🔐 Chi tiết phân quyền

### 👤 **EMPLOYEE (Nhân viên)**

**Quyền truy cập:**

- ✅ Xem danh sách sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Tạo yêu cầu mới
- ✅ Xem yêu cầu của bản thân
- ✅ Rút lại yêu cầu (chưa được duyệt)
- ✅ Xem dashboard cá nhân

**Hạn chế:**

- ❌ Không thể duyệt yêu cầu
- ❌ Không thể xem báo cáo tổng hợp
- ❌ Không thể quản lý sản phẩm
- ❌ Không thể quản lý tài khoản

### 👨‍💼 **MANAGER (Quản lý)**

**Quyền truy cập:**

- ✅ Tất cả quyền của EMPLOYEE
- ✅ Xem danh sách yêu cầu chờ duyệt
- ✅ Duyệt/từ chối yêu cầu
- ✅ Xem báo cáo phòng ban
- ✅ Quản lý nhân viên trong phòng ban
- ✅ Xem dashboard quản lý

**Hạn chế:**

- ❌ Không thể thêm/sửa/xóa sản phẩm
- ❌ Không thể quản lý tài khoản toàn hệ thống
- ❌ Không thể cấu hình hệ thống

### 👑 **SUPER_ADMIN (Quản trị viên)**

**Quyền truy cập:**

- ✅ Tất cả quyền của MANAGER
- ✅ Thêm/sửa/xóa sản phẩm
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý tài khoản toàn hệ thống
- ✅ Tạo/xóa/sửa tài khoản
- ✅ Xem báo cáo toàn hệ thống
- ✅ Cấu hình hệ thống
- ✅ Quản lý ngưỡng chi tiêu theo role
- ✅ Xem log hệ thống

## 🚀 Tính năng theo Role

### 📱 **Dashboard**

- **EMPLOYEE**: Thống kê cá nhân, yêu cầu của tôi
- **MANAGER**: Thống kê phòng ban, yêu cầu chờ duyệt
- **SUPER_ADMIN**: Thống kê toàn hệ thống, quản lý tài khoản

### 📋 **Quản lý yêu cầu**

- **EMPLOYEE**: Tạo, xem, rút yêu cầu cá nhân
- **MANAGER**: Duyệt yêu cầu từ nhân viên
- **SUPER_ADMIN**: Xem tất cả yêu cầu, quản lý workflow

### 📦 **Quản lý sản phẩm**

- **EMPLOYEE**: Xem danh sách, chi tiết sản phẩm
- **MANAGER**: Xem danh sách, chi tiết sản phẩm
- **SUPER_ADMIN**: Thêm/sửa/xóa sản phẩm, quản lý danh mục

### 👥 **Quản lý tài khoản**

- **EMPLOYEE**: Chỉnh sửa thông tin cá nhân
- **MANAGER**: Quản lý nhân viên trong phòng ban
- **SUPER_ADMIN**: Quản lý tất cả tài khoản, phân quyền

## 🔄 Workflow phân quyền

### **Tạo yêu cầu:**

1. **EMPLOYEE** tạo yêu cầu → **SUBMITTED**
2. **MANAGER** duyệt → **APPROVED/REJECTED**
3. **SUPER_ADMIN** có thể can thiệp bất cứ lúc nào

### **Quản lý sản phẩm:**

1. **SUPER_ADMIN** thêm/sửa sản phẩm
2. **EMPLOYEE/MANAGER** xem và đặt hàng
3. **MANAGER** duyệt yêu cầu
4. **SUPER_ADMIN** quản lý tồn kho

## 🎯 Lợi ích của phân quyền 3 cấp

### ✅ **Đơn giản hóa:**

- Dễ hiểu và quản lý
- Giảm phức tạp trong phân quyền
- Tập trung vào chức năng chính

### ✅ **Linh hoạt:**

- Dễ dàng mở rộng tính năng
- Phù hợp với cấu trúc công ty vừa và nhỏ
- Có thể thêm role trung gian nếu cần

### ✅ **Bảo mật:**

- Phân quyền rõ ràng
- Kiểm soát truy cập chặt chẽ
- Audit trail đầy đủ

## 🔧 Triển khai

### **Database:**

- Cập nhật enum `Role` trong bảng `employees`
- Cập nhật `amount_role_thresholds`
- Migration script sẵn sàng

### **Backend:**

- Enum `Employee.Role` đã cập nhật
- Service logic tự động thích ứng
- API endpoints theo phân quyền

### **Frontend:**

- UI hiển thị theo role
- Navigation menu động
- Component access control

## 📝 Ghi chú

- **Tài khoản demo:**

  - Employee: `employee` / `password`
  - Manager: `manager` / `password`
  - Super Admin: `admin` / `password`

- **Migration:** Chạy script `migration-3-roles.sql` để chuyển đổi dữ liệu cũ
- **Testing:** Test đầy đủ các tính năng theo từng role
- **Documentation:** Cập nhật tài liệu người dùng theo phân quyền mới
