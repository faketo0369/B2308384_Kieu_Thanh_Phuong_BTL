import createApiClient from "./api.service";

class MuonSachService {
    constructor(baseUrl = "/api/muonsach") {
        this.api = createApiClient(baseUrl);
    }

    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    async getAll(params = {}) {
        return (await this.api.get("/", { params })).data;
    }

    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }
}

export default new MuonSachService();
