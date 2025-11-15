
#!/bin/bash

echo "🚀 Starting DHA Back Office Server..."

# Start the server
NODE_ENV=development tsx server/index.ts
