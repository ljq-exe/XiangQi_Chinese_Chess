# Cờ Tướng — Xiangqi

Game cờ tướng chạy trên trình duyệt bằng HTML, CSS và JavaScript thuần. Có thể chơi hai người trên cùng thiết bị hoặc đấu với bot ở 15 mức độ khó.

## Chạy game

Mở `index.html` trực tiếp trong trình duyệt. Để chạy bằng HTTP local server, dùng máy chủ static bất kỳ, ví dụ:

```bash
npx serve .
```

Không cần build và hiện không có dependency của dự án cần cài đặt.

## Tính năng

- Bàn cờ Xiangqi 9×10, hiển thị nước hợp lệ và nước ăn.
- Dấu móc tại các vị trí Tốt/Pháo được cắt theo mép giao điểm, không tràn ra ngoài bàn.
- Chơi với bot ở 15 mức khó; mặc định là mức 1.
- Game mặc định mở ở chế độ đấu với bot; chọn bên Đen sẽ để bot đi trước.
- Chọn mức khó khác sẽ bắt đầu lại bàn cờ ở mức mới.
- Gợi ý nước đi, undo, lật bàn và bắt đầu ván mới.
- Popup đề xuất tăng một mức khó khi người chơi thắng; chấp nhận sẽ tăng cấp và đặt lại bàn cờ.
- Chuyển giao diện giữa Tiếng Việt và English.
- Wiki song ngữ giải thích mục tiêu, luật bàn cờ và cách di chuyển từng quân.
- Âm thanh chào mừng khi bắt đầu ván, cùng âm riêng cho nước đi, ăn quân, chiếu tướng, thắng và thua; phát bằng Web Audio API.
- Lịch sử nước đi, nhận biết chiếu và hết nước hợp lệ.

## Cấu trúc

| Tệp | Mục đích |
| --- | --- |
| `index.html` | HTML chính của giao diện |
| `cotuong.css` | Giao diện và hiệu ứng |
| `game.js` | Tương tác, luật phía giao diện, bot và lịch sử |
| `engine.js` | Engine Xiangqi và tìm kiếm nước đi |
| `test.js` | Regression tests của engine |
| `perft.js` | Kiểm tra số nước đi qua nhiều tầng |
| `crosscheck.js` | Đối chiếu luật engine và giao diện |
| `smoke.js` | Kiểm tra khởi tạo game trong DOM giả |
| `fakedom.js` | DOM giả dùng bởi smoke/crosscheck |
| `sym.js`, `zob.js` | Kiểm tra đối xứng đánh giá và Zobrist hash |
| `levels.js`, `ladder.js` | Benchmark cấu hình mức khó và sức mạnh bot |
| `PROJECT_LOG.md` | Nhật ký thay đổi đã tổng hợp |

Trang nạp `engine.js` trước `game.js`; giữ nguyên thứ tự này khi thay đổi HTML.

## Kiểm thử

Cần cài Node.js để chạy các lệnh:

```bash
node --check engine.js
node --check game.js
node test.js
node perft.js
node crosscheck.js
node smoke.js
node sym.js
node zob.js
```

`levels.js` và `ladder.js` là benchmark, không phải kiểm thử CI ổn định theo thời gian vì kết quả phụ thuộc máy chạy.

## Đưa lên web

Đây là website tĩnh, có thể host trên GitHub Pages, itch.io hoặc dịch vụ static hosting tương tự. `index.html` được tự động mở làm trang chính; khi đóng gói lên itch.io, đặt `index.html` ngay trong thư mục gốc của ZIP cùng các tệp JavaScript và CSS cần thiết. Không có backend hay cấu hình bí mật cần deploy.

## Bản quyền và sử dụng

Mã nguồn được công khai để tham khảo, nhưng hiện **không cấp quyền tái sử dụng, sao chép, sửa đổi hoặc phân phối**. Xem [LICENSE](./LICENSE). Đây không phải giấy phép mã nguồn mở. GitHub có thể cho phép xem và fork nội dung công khai theo điều khoản nền tảng của họ; việc fork trên GitHub không đồng nghĩa với quyền sử dụng ngoài nền tảng.

---

Nhật ký dự án: [PROJECT_LOG.md](./PROJECT_LOG.md).
