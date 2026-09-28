"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const migrations_1 = require("./utils/migrations");
const PORT = process.env.PORT || 5001;
// Connect to Database
(0, db_1.default)().then(async () => {
    // Persistent Setup
    await (0, migrations_1.runMigrations)(); // Handles schema data updates (locked & safe)
    app_1.default.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
});
