"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const index_1 = require("./index");
exports.AppDataSource = new typeorm_1.DataSource(index_1.config.database);
//# sourceMappingURL=database.js.map