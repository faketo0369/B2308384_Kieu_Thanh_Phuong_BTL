import createApiClient from "./api.service";

class DashboardService {
    constructor(baseUrl = "/api/dashboard") {
        this.api = createApiClient(baseUrl);
    }

    async getSummary() {
        return (await this.api.get("/summary")).data;
    }

    async getTopBooks() {
        return (await this.api.get("/top-books")).data;
    }

    async getLowStock() {
        return (await this.api.get("/low-stock")).data;
    }

    async getOverdueReaders() {
        return (await this.api.get("/overdue-readers")).data;
    }
}

export default new DashboardService();
