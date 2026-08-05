const config = require("./app/config");
const MongoDBUtil = require("./app/utils/mongodb.util");

function generateSma(tenSach, index) {
    const noAccent = tenSach.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const words = noAccent.split(/\s+/);
    let initials = words.map(w => w.charAt(0)).join("").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (initials.length > 8) initials = initials.substring(0, 8);
    if (initials.length === 0) initials = "BOOK";
    return `MS-${initials}-${String(index).padStart(2, '0')}`;
}

async function seed() {
    try {
        const forceReset = process.argv.includes("--force");
        console.log("Connecting to seed database...");
        const client = await MongoDBUtil.connect(config.db.uri);
        const db = client.db();

        // 1. Seed NhaXuatBan
        const nxbColl = db.collection("NhaXuatBan");
        let nxbMas = [];
        if (forceReset || (await nxbColl.countDocuments()) === 0) {
            if (forceReset) {
                await nxbColl.deleteMany({});
                console.log("Cleared publishers.");
            }
            const nxbData = [
                { nxb_ma: "NXB0001", nxb_ten: "NXB Trẻ", nxb_diaChi: "161B Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh" },
                { nxb_ma: "NXB0002", nxb_ten: "NXB Kim Đồng", nxb_diaChi: "55 Quang Trung, Hai Bà Trưng, Hà Nội" },
                { nxb_ma: "NXB0003", nxb_ten: "NXB Giáo Dục", nxb_diaChi: "81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội" }
            ];
            await nxbColl.insertMany(nxbData);
            nxbMas = nxbData.map(d => d.nxb_ma);
            console.log("Seeded publishers.");
        } else {
            const existingNxbs = await nxbColl.find().toArray();
            nxbMas = existingNxbs.map(nxb => nxb.nxb_ma);
            console.log("Publishers already exist. Skipping seed.");
        }

        // 2. Seed Sach
        const sachColl = db.collection("Sach");
        if (forceReset || (await sachColl.countDocuments()) === 0) {
            if (forceReset) {
                await sachColl.deleteMany({});
                console.log("Cleared books.");
            }

            const booksRaw = [
                // Seri Bí ẩn mãi mãi là bí ẩn (1 -> 6) -> Kệ A -> S_theLoai = "Trinh thám"
                { S_ten: "Bí ẩn mãi mãi là bí ẩn Tập 1", S_tacGia: "Nhiều tác giả", S_donGia: 35000, S_soQuyen: 10, S_namXB: 2019, S_tomTat: "Giải mã các hiện tượng kỳ lạ và bí ẩn khoa học chưa có lời đáp trong lịch sử nhân loại.", S_viTri: "Kệ A", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400" },
                { S_ten: "Bí ẩn mãi mãi là bí ẩn Tập 2", S_tacGia: "Nhiều tác giả", S_donGia: 35000, S_soQuyen: 8, S_namXB: 2019, S_tomTat: "Khám phá thế giới tự nhiên và các loài sinh vật huyền bí trong lòng đại dương.", S_viTri: "Kệ A", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
                { S_ten: "Bí ẩn mãi mãi là bí ẩn Tập 3", S_tacGia: "Nhiều tác giả", S_donGia: 35000, S_soQuyen: 12, S_namXB: 2020, S_tomTat: "Những câu chuyện ly kỳ về các nền văn minh cổ đại đã biến mất không dấu vết.", S_viTri: "Kệ A", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400" },
                { S_ten: "Bí ẩn mãi mãi là bí ẩn Tập 4", S_tacGia: "Nhiều tác giả", S_donGia: 38000, S_soQuyen: 6, S_namXB: 2020, S_tomTat: "Khám phá vũ trụ bao la và những hành tinh xa xôi ngoài hệ mặt trời.", S_viTri: "Kệ A", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400" },
                { S_ten: "Bí ẩn mãi mãi là bí ẩn Tập 5", S_tacGia: "Nhiều tác giả", S_donGia: 38000, S_soQuyen: 7, S_namXB: 2021, S_tomTat: "Những bí mật ẩn giấu dưới lòng đất và các cấu trúc kim tự tháp kỳ vĩ.", S_viTri: "Kệ A", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400" },
                { S_ten: "Bí ẩn mãi mãi là bí ẩn Tập 6", S_tacGia: "Nhiều tác giả", S_donGia: 40000, S_soQuyen: 15, S_namXB: 2022, S_tomTat: "Các hiện tượng tâm linh và siêu nhiên qua góc nhìn khoa học thực nghiệm.", S_viTri: "Kệ A", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },

                // Nguyễn Nhật Ánh -> Kệ B -> S_theLoai = "Văn học Việt Nam"
                { S_ten: "Cho tôi xin một vé đi tuổi thơ", S_tacGia: "Nguyễn Nhật Ánh", S_donGia: 80000, S_soQuyen: 20, S_namXB: 2018, S_tomTat: "Tấm vé hành trình quay ngược thời gian trở về tuổi thơ trong sáng và đầy tiếng cười.", S_viTri: "Kệ B", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
                { S_ten: "Mắt Biếc", S_tacGia: "Nguyễn Nhật Ánh", S_donGia: 90000, S_soQuyen: 14, S_namXB: 2019, S_tomTat: "Mối tình thanh xuân đơn phương ngọt ngào nhưng đượm buồn của Ngạn dành cho Hà Lan.", S_viTri: "Kệ B", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400" },
                { S_ten: "Tôi thấy hoa vàng trên cỏ xanh", S_tacGia: "Nguyễn Nhật Ánh", S_donGia: 85000, S_soQuyen: 11, S_namXB: 2018, S_tomTat: "Bức tranh quê nghèo bình dị qua lăng kính trẻ thơ hồn nhiên và cảm động.", S_viTri: "Kệ B", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400" },

                // Văn học thiếu nhi & phiêu lưu -> Kệ C -> S_theLoai = "Văn học Việt Nam" or "Thiếu nhi"
                { S_ten: "Quê nội", S_tacGia: "Võ Quảng", S_donGia: 60000, S_soQuyen: 9, S_namXB: 2015, S_tomTat: "Cuộc sống nông thôn Việt Nam sau Cách mạng tháng Tám dưới góc nhìn của hai cậu bé.", S_viTri: "Kệ C", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1535905122402-58529aa394d1?w=400" },
                { S_ten: "Tuổi thơ dữ dội", S_tacGia: "Phùng Quán", S_donGia: 110000, S_soQuyen: 12, S_namXB: 2019, S_tomTat: "Bản anh hùng ca về những chiến sĩ vệ quốc đoàn nhỏ tuổi kiên cường, quả cảm.", S_viTri: "Kệ C", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400" },
                { S_ten: "Dế Mèn phiêu lưu ký", S_tacGia: "Tô Hoài", S_donGia: 45000, S_soQuyen: 30, S_namXB: 2021, S_tomTat: "Cuộc phiêu lưu kỳ thú của Dế Mèn dũng cảm nhưng kiêu ngạo học được nhiều bài học đắt giá.", S_viTri: "Kệ C", S_theLoai: "Thiếu nhi", S_hinhAnh: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },

                // Kỹ năng & Tác phẩm nước ngoài -> Kệ D
                { S_ten: "Đắc nhân tâm", S_tacGia: "Dale Carnegie", S_donGia: 95000, S_soQuyen: 25, S_namXB: 2020, S_tomTat: "Nghệ thuật ứng xử hàng đầu thế giới giúp thu phục lòng người và gặt hái thành công.", S_viTri: "Kệ D", S_theLoai: "Kỹ năng", S_hinhAnh: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400" },
                { S_ten: "Nhà giả kim", S_tacGia: "Paulo Coelho", S_donGia: 75000, S_soQuyen: 18, S_namXB: 2019, S_tomTat: "Hành trình theo đuổi giấc mơ của cậu bé chăn cừu Santiago đem lại bài học sâu sắc.", S_viTri: "Kệ D", S_theLoai: "Kỹ năng", S_hinhAnh: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
                { S_ten: "Tuổi trẻ đáng giá bao nhiêu", S_tacGia: "Rosie Nguyễn", S_donGia: 70000, S_soQuyen: 15, S_namXB: 2018, S_tomTat: "Những tâm sự và lời khuyên quý giá dành cho người trẻ vượt qua hoang mang cuộc đời.", S_viTri: "Kệ D", S_theLoai: "Kỹ năng", S_hinhAnh: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400" },
                { S_ten: "Bố già", S_tacGia: "Mario Puzo", S_donGia: 120000, S_soQuyen: 16, S_namXB: 2020, S_tomTat: "Thế giới ngầm tội phạm mafia đầy kịch tính và những triết lý sống kinh điển.", S_viTri: "Kệ D", S_theLoai: "Trinh thám", S_hinhAnh: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
                { S_ten: "Chiến tranh và hòa bình", S_tacGia: "Leo Tolstoy", S_donGia: 250000, S_soQuyen: 5, S_namXB: 2017, S_tomTat: "Bản sử thi vĩ đại mô tả cuộc kháng chiến chống Napoleon của nhân dân Nga.", S_viTri: "Kệ D", S_theLoai: "Thiếu nhi", S_hinhAnh: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
                { S_ten: "Không gia đình", S_tacGia: "Hector Malot", S_donGia: 98000, S_soQuyen: 13, S_namXB: 2019, S_tomTat: "Cuộc đời lưu lạc vượt qua mọi nghịch cảnh của cậu bé mồ côi Remi đáng yêu.", S_viTri: "Kệ D", S_theLoai: "Thiếu nhi", S_hinhAnh: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400" },
                { S_ten: "Những người khốn khổ", S_tacGia: "Victor Hugo", S_donGia: 180000, S_soQuyen: 7, S_namXB: 2018, S_tomTat: "Bức tranh xã hội Pháp thế kỷ 19 và lòng nhân ái của cựu tù nhân Jean Valjean.", S_viTri: "Kệ D", S_theLoai: "Thiếu nhi", S_hinhAnh: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400" },

                // Văn học hiện thực Việt Nam -> Kệ E
                { S_ten: "Số đỏ", S_tacGia: "Vũ Trọng Phụng", S_donGia: 50000, S_soQuyen: 15, S_namXB: 2016, S_tomTat: "Vở kịch trào phúng châm biếm sâu sắc xã hội tư sản thành thị Âu hóa lố lăng.", S_viTri: "Kệ E", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400" },
                { S_ten: "Tắt đèn", S_tacGia: "Ngô Tất Tố", S_donGia: 40000, S_soQuyen: 10, S_namXB: 2015, S_tomTat: "Nỗi khổ cực, bần cùng của người nông dân dưới ách áp bức sưu thuế thực dân.", S_viTri: "Kệ E", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400" },
                { S_ten: "Lão Hạc", S_tacGia: "Nam Cao", S_donGia: 42000, S_soQuyen: 12, S_namXB: 2016, S_tomTat: "Tấm lòng lương thiện, bất khuất của người nông dân nghèo chọn cái chết để giữ danh dự.", S_viTri: "Kệ E", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1535905122402-58529aa394d1?w=400" },
                { S_ten: "Chí Phèo", S_tacGia: "Nam Cao", S_donGia: 45000, S_soQuyen: 14, S_namXB: 2017, S_tomTat: "Bi kịch bị từ chối quyền làm người lương thiện của người nông dân lương thiện bị lưu manh hóa.", S_viTri: "Kệ E", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
                { S_ten: "Vợ nhặt", S_tacGia: "Kim Lân", S_donGia: 38000, S_soQuyen: 15, S_namXB: 2018, S_tomTat: "Vẻ đẹp tình người và niềm khát sống mãnh liệt của người nghèo trong nạn đói khủng khiếp năm 1945.", S_viTri: "Kệ E", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400" },
                { S_ten: "Cánh đồng bất tận", S_tacGia: "Nguyễn Ngọc Tư", S_donGia: 65000, S_soQuyen: 10, S_namXB: 2017, S_tomTat: "Tập truyện ngắn ghi lại cuộc sống gian truân, mộc mạc và chân thực của người dân miền Tây.", S_viTri: "Kệ E", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },

                // Văn học cách mạng & kịch nghệ Việt Nam -> Kệ F
                { S_ten: "Rừng xà nu", S_tacGia: "Nguyễn Trung Thành", S_donGia: 39000, S_soQuyen: 10, S_namXB: 2019, S_tomTat: "Ý chí đấu tranh quật cường của đồng bào Tây Nguyên trong cuộc kháng chiến chống Mỹ.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400" },
                { S_ten: "Chiếc thuyền ngoài xa", S_tacGia: "Nguyễn Minh Châu", S_donGia: 48000, S_soQuyen: 11, S_namXB: 2020, S_tomTat: "Bài học sâu sắc về cách nhìn nhận cuộc sống đa chiều, không phiến diện.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
                { S_ten: "Người lái đò sông Đà", S_tacGia: "Nguyễn Tuân", S_donGia: 52000, S_soQuyen: 8, S_namXB: 2018, S_tomTat: "Vẻ đẹp hùng vĩ trữ tình của thiên nhiên Tây Bắc và chất vàng mười của người lao động.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
                { S_ten: "Vợ chồng A Phủ", S_tacGia: "Tô Hoài", S_donGia: 46000, S_soQuyen: 13, S_namXB: 2017, S_tomTat: "Sức sống tiềm tàng và hành trình tự giải phóng của đôi vợ chồng trẻ người Mông.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400" },
                { S_ten: "Bến quê", S_tacGia: "Nguyễn Minh Châu", S_donGia: 44000, S_soQuyen: 10, S_namXB: 2016, S_tomTat: "Sự thức tỉnh muộn màng về những giá trị gia đình và quê hương thiêng liêng ở cuối cuộc đời.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400" },
                { S_ten: "Hồn Trương Ba, da hàng thịt", S_tacGia: "Lưu Quang Vũ", S_donGia: 65000, S_soQuyen: 9, S_namXB: 2019, S_tomTat: "Vở kịch triết lý sâu sắc về sự hòa hợp giữa linh hồn thanh cao và thể xác phàm tục.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400" },
                { S_ten: "Đất nước", S_tacGia: "Nguyễn Khoa Điềm", S_donGia: 35000, S_soQuyen: 15, S_namXB: 2018, S_tomTat: "Cái nhìn mới mẻ, sâu sắc về Đất Nước của Nhân dân từ chiều dài văn hóa lịch sử.", S_viTri: "Kệ F", S_theLoai: "Văn học Việt Nam", S_hinhAnh: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400" }
            ];

            const booksFinal = booksRaw.map((b, index) => {
                const nxbIndex = index % nxbMas.length;
                return {
                    ...b,
                    S_ma: generateSma(b.S_ten, index + 1),
                    S_nxb: nxbMas[nxbIndex]
                };
            });

            await sachColl.insertMany(booksFinal);
            console.log(`Seeded ${booksFinal.length} books with auto-generated S_ma and S_nxb strings.`);
        } else {
            console.log("Books already exist. Skipping seed.");
        }

        // 3. Seed DocGia
        const docgiaColl = db.collection("DocGia");
        if (forceReset || (await docgiaColl.countDocuments()) === 0) {
            if (forceReset) {
                await docgiaColl.deleteMany({});
                console.log("Cleared readers.");
            }
            await docgiaColl.insertMany([
                {
                    DG_id: "DG0001",
                    DG_hoLot: "Nguyễn Văn",
                    DG_ten: "A",
                    DG_ngaySinh: "2000-01-01",
                    DG_phai: "Nam",
                    DG_diaChi: "Cần Thơ",
                    DG_sdt: "0912345678",
                    DG_password: "user123",
                    DG_cccd: "012345678901",
                    DG_diemUyTin: 0,
                    DG_hangThanhVien: "Dong"
                },
                {
                    DG_id: "DG0002",
                    DG_hoLot: "Trần Thị",
                    DG_ten: "B",
                    DG_ngaySinh: "1999-05-15",
                    DG_phai: "Nữ",
                    DG_diaChi: "Hậu Giang",
                    DG_sdt: "0987654321",
                    DG_password: "user123",
                    DG_cccd: "098765432109",
                    DG_diemUyTin: 0,
                    DG_hangThanhVien: "Dong"
                }
            ]);
            console.log("Seeded readers.");
        } else {
            console.log("Readers already exist. Skipping seed.");
        }

        // 4. Seed NhanVien
        const nhanvienColl = db.collection("NhanVien");
        if (forceReset || (await nhanvienColl.countDocuments()) === 0) {
            if (forceReset) {
                await nhanvienColl.deleteMany({});
                console.log("Cleared staff.");
            }
            await nhanvienColl.insertMany([
                {
                    nv_ma: "NV0001",
                    nv_hoTen: "Admin Manager",
                    nv_password: "admin",
                    nv_chucVu: "Quản lý",
                    nv_diaChi: "Đại học Cần Thơ",
                    nv_sdt: "0111222333"
                },
                {
                    nv_ma: "NV0002",
                    nv_hoTen: "Librarian Staff",
                    nv_password: "staff",
                    nv_chucVu: "Thủ thư",
                    nv_diaChi: "Đại học Cần Thơ",
                    nv_sdt: "0222333444"
                }
            ]);
            console.log("Seeded staff.");
        } else {
            console.log("Staff already exist. Skipping seed.");
        }

        // 5. Seed TheoDoiMuonSach
        const muonsachColl = db.collection("TheoDoiMuonSach");
        if (forceReset) {
            await muonsachColl.deleteMany({});
            console.log("Cleared borrow records.");
        }

        console.log("Database seeding completed!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
