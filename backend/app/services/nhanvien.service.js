const { ObjectId } = require("mongodb");

class NhanVienService {
    constructor(client) {
        this.NhanVien = client.db().collection("NhanVien");
    }

    extractStaffData(payload) {
        const staff = {
            nv_hoTen: payload.nv_hoTen,
            nv_password: payload.nv_password,
            nv_chucVu: payload.nv_chucVu,
            nv_diaChi: payload.nv_diaChi,
            nv_sdt: payload.nv_sdt,
            nv_ma: payload.nv_ma,
        };
        // Remove undefined fields
        Object.keys(staff).forEach(
            (key) => staff[key] === undefined && delete staff[key]
        );
        return staff;
    }

    async generateCustomId() {
        const lastStaff = await this.NhanVien.find({}, { projection: { nv_ma: 1 } })
            .sort({ nv_ma: -1 })
            .limit(1)
            .toArray();
        if (lastStaff.length === 0) {
            return "NV0001";
        }
        const lastIdStr = lastStaff[0].nv_ma;
        const lastIdNum = parseInt(lastIdStr.replace("NV", ""), 10);
        const nextIdNum = isNaN(lastIdNum) ? 1 : lastIdNum + 1;
        return "NV" + String(nextIdNum).padStart(4, "0");
    }

    async create(payload) {
        const staff = this.extractStaffData(payload);
        if (!staff.nv_ma) {
            staff.nv_ma = await this.generateCustomId();
        }
        const result = await this.NhanVien.insertOne(staff);
        return { _id: result.insertedId, ...staff };
    }

    async find(filter) {
        const cursor = await this.NhanVien.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.NhanVien.findOne({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { nv_ma: id }
            ]
        });
    }

    async findByMSNV(msnv) {
        return await this.NhanVien.findOne({ nv_ma: msnv });
    }

    async update(id, payload) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { nv_ma: id }
            ]
        };
        const update = this.extractStaffData(payload);
        const result = await this.NhanVien.findOneAndUpdate(
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
                { nv_ma: id }
            ]
        };
        const result = await this.NhanVien.findOneAndDelete(filter);
        return result;
    }

    async deleteAll() {
        const result = await this.NhanVien.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhanVienService;
