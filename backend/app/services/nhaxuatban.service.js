const { ObjectId } = require("mongodb");

class NhaXuatBanService {
    constructor(client) {
        this.Publisher = client.db().collection("NhaXuatBan");
    }

    extractPublisherData(payload) {
        const publisher = {
            nxb_ma: payload.nxb_ma,
            nxb_ten: payload.nxb_ten,
            nxb_diaChi: payload.nxb_diaChi,
        };
        // Remove undefined fields
        Object.keys(publisher).forEach(
            (key) => publisher[key] === undefined && delete publisher[key]
        );
        return publisher;
    }

    async generateCustomId() {
        const lastRecord = await this.Publisher.find({}, { projection: { nxb_ma: 1 } })
            .sort({ nxb_ma: -1 })
            .limit(1)
            .toArray();
        if (lastRecord.length === 0) {
            return "NXB0001";
        }
        const lastIdStr = lastRecord[0].nxb_ma;
        const lastIdNum = parseInt(lastIdStr.replace("NXB", ""), 10);
        const nextIdNum = isNaN(lastIdNum) ? 1 : lastIdNum + 1;
        return "NXB" + String(nextIdNum).padStart(4, "0");
    }

    async create(payload) {
        const publisher = this.extractPublisherData(payload);
        if (!publisher.nxb_ma) {
            publisher.nxb_ma = await this.generateCustomId();
        }
        const result = await this.Publisher.findOneAndUpdate(
            { nxb_ten: publisher.nxb_ten },
            { $set: publisher },
            { returnDocument: "after", upsert: true }
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.Publisher.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Publisher.findOne({
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { nxb_ma: id }
            ]
        });
    }

    async update(id, payload) {
        const filter = {
            $or: [
                { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
                { nxb_ma: id }
            ]
        };
        const update = this.extractPublisherData(payload);
        const result = await this.Publisher.findOneAndUpdate(
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
                { nxb_ma: id }
            ]
        };
        const result = await this.Publisher.findOneAndDelete(filter);
        return result;
    }

    async deleteAll() {
        const result = await this.Publisher.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NhaXuatBanService;
