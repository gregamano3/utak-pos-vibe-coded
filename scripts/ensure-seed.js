const fs = require('fs')
const path = require('path')
const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts')
const examplePath = path.join(__dirname, '..', 'prisma', 'seed.example.ts')
if (!fs.existsSync(seedPath)) {
  fs.copyFileSync(examplePath, seedPath)
  console.log('Created prisma/seed.ts from seed.example.ts')
}
