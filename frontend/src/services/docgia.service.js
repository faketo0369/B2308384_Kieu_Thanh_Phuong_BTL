import createApiClient from "./api.service";

class DocGiaService {
    constructor(baseUrl = "/api/docgia") {
        this.api = createApiClient(baseUrl);
    }

    async register(data) {
        return (await this.api.post("/register", data)).data;
    }

    async login(data) {
        return (await this.api.post("/login", data)).data;
    }

    async getAll() {
        return (await this.api.get("/")).data;
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

    async findByName(name) {
        return (await this.api.get(`/?name=${name}`)).data;
    }
}

export default new DocGiaService();
