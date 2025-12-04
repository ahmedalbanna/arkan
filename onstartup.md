1. Use pm2 (Recommended for Node apps)
pm2 is a process manager that keeps your app running in the background.


# Install pm2 globally
npm install -g pm2

# Start your app
pm2 start npm --name "my-app" -- start

# Save process list so it restarts on reboot
pm2 save
pm2 startup
