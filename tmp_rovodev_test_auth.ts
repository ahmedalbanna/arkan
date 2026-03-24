import "reflect-metadata";
import { container } from "./src/infrastructure/di/container";
import { UserController } from "./src/modules/users/adapters/controllers/UserController";

async function testAuth() {
    console.log("--- Testing SQLite Authentication ---");
    const controller = container.resolve(UserController);

    const testUsers = [
        { email: 'admin@arkan.com', password: 'admin123', label: 'Admin User' },
        { email: 'user@arkan.com', password: 'user123', label: 'Normal User' }
    ];

    for (const testUser of testUsers) {
        console.log(`\nAttempting login for: ${testUser.label} (${testUser.email})`);
        const result = await controller.login(testUser.email, testUser.password);

        if (result.isSuccess) {
            const data = result.getValue();
            console.log(`✅ Success! Logged in as: ${data.user.name}`);
            console.log(`   Token: ${data.token.substring(0, 20)}...`);
            console.log(`   Role: ${testUser.label.includes('Admin') ? 'admin' : 'user'}`);
        } else {
            console.error(`❌ Failed: ${result.error?.message || 'Unknown error'}`);
        }
    }
}

testAuth().then(() => process.exit(0));
