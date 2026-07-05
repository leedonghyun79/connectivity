const bcrypt = require('bcryptjs');
const hash = '$2b$10$uOt1XkPAdEKkZVsGINgYOe2nY9ehTfVt9XvUD2UUaXSa0kxl/JqZq';
const password = 'admin123!';
bcrypt.compare(password, hash).then(console.log);
