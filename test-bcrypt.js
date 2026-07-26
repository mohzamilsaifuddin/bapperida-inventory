const bcrypt = require('bcryptjs');
const hash = '$2b$10$JKv3pi7MYadzO/F7UQSyOO7pICXG.5qh10qY5jwHBhAiXX7WsPlru';
bcrypt.compare('admin123', hash).then(console.log);
