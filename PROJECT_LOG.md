# Project log — Cờ Tướng

## Tóm tắt

Dự án đã được làm sạch và đồng bộ hóa: bỏ các tài liệu kế hoạch/việc còn lại đã cũ, giữ lại README chính và tổng hợp nhật ký ở file riêng. Toàn bộ logic quan trọng hiện đang ổn định và đã được kiểm tra lại bằng smoke test và benchmark bot.

## Các việc đã hoàn tất

### 1) Dọn code và đồng bộ logic

- Xử lý các đường đi không còn dùng trong engine/game.
- Chỉnh lại logic undo để không mất quân khi lùi nước.
- Fix race condition bot khi đổi mức hoặc ván mới trong lúc máy đang nghĩ.
- Khởi tạo bot ở mức 1 khi mở project.
- Thêm popup tăng độ khó mượt khi người chơi thắng.

### 2) Hoàn thiện gameplay

- Khi người chơi thắng, hệ thống có thể đề xuất tăng độ khó lên 1 mức.
- Nếu chọn đồng ý, bàn cờ sẽ reset và chuẩn bị cho ván mới ở mức cao hơn.
- Tính năng undo giờ có hiệu ứng lùi quân đồng bộ hơn, và trường hợp nước vừa lùi là nước ăn được render đúng vị trí.

### 3) Tài liệu và workflow

- Viết lại README để phù hợp với dự án thực tế.
- Gộp tiến độ thành log duy nhất thay vì giữ nhiều file kế hoạch/todo phụ.
- Cập nhật `.gitignore` để bỏ các file tạm và thư mục không cần commit.
- Thêm `LICENSE` theo yêu cầu All Rights Reserved của JustLucas.
- Thêm GitHub Actions chạy kiểm tra cú pháp và các test ổn định trên Node.js 20.
- Rút gọn comment lịch sử sửa lỗi và comment lặp lại; giữ lại giải thích luật và thuật toán cần thiết.
- Thêm nút chuyển ngôn ngữ Việt/Anh cho giao diện và nội dung trạng thái.
- Thêm Wiki song ngữ, có hướng dẫn luật cơ bản và cách di chuyển từng loại quân; smoke test kiểm tra chuyển ngôn ngữ và mở/đóng Wiki.
- Mặc định mở game ở chế độ đấu với máy; người chơi chọn Đen thì máy tự đi trước.
- Khi đổi mức khó bot, bàn cờ và lịch sử ván được reset để bắt đầu ván mới ngay ở mức vừa chọn.
- Cắt phần thừa của dấu móc tại hai cột Tốt ngoài cùng theo ranh giới giao điểm trên bàn cờ.
- Thêm âm thanh Web Audio chào mừng mỗi ván và âm riêng cho nước đi, nước ăn, chiếu tướng, thắng/thua và undo; smoke test xác nhận âm kết thúc chỉ phát một lần.

## Kiểm tra đã chạy

- `node --check` cho toàn bộ file JavaScript
- `node test.js`
- `node perft.js`
- `node crosscheck.js`
- `node smoke.js`
- `node sym.js`
- `node zob.js`

## Kết quả kiểm tra

- Engine test: PASS (18/0 fail)
- Perft: PASS; tổng 374.794 node ở các thế kiểm tra
- Cross-check: PASS; 31 thế, không lệch luật
- Đối xứng đánh giá: PASS 436/436; Zobrist: không sai hash
- Smoke test: trang khởi động ổn định

## Trạng thái hiện tại

Project sẵn sàng được đẩy lên GitHub. Chưa khởi tạo Git repository trong thư mục làm việc này; trước khi push, cần khởi tạo repository và kiểm tra quyền sử dụng nội dung bên thứ ba.
