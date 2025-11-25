"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const checkins_1 = __importDefault(require("./routes/checkins"));
const gardens_1 = __importDefault(require("./routes/gardens"));
const plants_1 = __importDefault(require("./routes/plants"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const export_1 = __importDefault(require("./routes/export"));
const insights_1 = __importDefault(require("./routes/insights"));
const settings_1 = __importDefault(require("./routes/settings"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const database_service_1 = require("./services/database.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
// Initialize database
(0, database_service_1.initializeDatabase)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '5mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
// serve openapi spec for reference
app.get('/openapi.yaml', (_req, res) => {
    const specPath = path_1.default.resolve(__dirname, '..', '..', 'openapi', 'mindgarden.yaml');
    res.sendFile(specPath);
});
app.use('/auth', auth_1.default);
app.use('/checkins', checkins_1.default);
app.use('/gardens', gardens_1.default);
app.use('/plants', plants_1.default);
app.use('/uploads', uploads_1.default);
app.use('/export', export_1.default);
app.use('/insights', insights_1.default);
app.use('/settings', settings_1.default);
app.use('/analytics', analytics_1.default);
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`MindGarden API running on http://localhost:${PORT}`);
});
