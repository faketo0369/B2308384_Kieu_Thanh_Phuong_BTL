const { ObjectId } = require("mongodb");

class SachService {
    constructor(client) {
        this.Sach = client.db().collection("Sach");
    }

    extractBookData(payload) {
        const book = {
            S_ma: payload.S_ma,
            S_ten: payload.S_ten,
            S_donGia: payload.S_donGia !== undefined ? Number(payload.S_donGia) : undefined,
            S_soQuyen: payload.S_soQuyen !== undefined ? Number(payload.S_soQuyen) : undefined,
            S_namXB: payload.S_namXB !== undefined ? Number(payload.S_namXB) : undefined,
            S_nxb: payload.S_nxb, // Keep as string code nxb_ma
            S_tacGia: payload.S_tacGia,
            S_tomTat: payload.S_tomTat,
            S_viTri: payload.S_viTri,
            S_theLoai: payload.S_theLoai,
            S_hinhAnh: payload.S_hinhAnh,
        };
        // Remove undefined fields
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }

    generateMaSach(tenSach) {
        const noAccent = tenSach.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const words = noAccent.split(/\s+/);
        let initials = words.map(w => w.charAt(0)).join("").toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (initials.length > 8) initials = initials.substring(0, 8);
        if (initials.length === 0) initials = "BOOK";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `MS-${initials}-${randomNum}`;
    }

    async create(payload) {
        const book = this.extractBookData(payload);
        if (!book.S_ma) {
            book.S_ma = this.generateMaSach(book.S_ten || "Sach");
        }
        const result = await this.Sach.insertOne(book);
        return { _id: result.insertedId, ...book };
    }

    async find(filter) {
        const cursor = await this.Sach.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Sach.findOne({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { S_ma: id }
            ]
        });
    }

    async update(id, payload) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { S_ma: id }
            ]
        };
        const update = this.extractBookData(payload);
        const result = await this.Sach.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { S_ma: id }
            ]
        };
        const result = await this.Sach.findOneAndDelete(filter);
        return result;
    }

    async deleteAll() {
        const result = await this.Sach.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = SachService;
