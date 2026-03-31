const fs   = require('fs')
const path = require('path')

const SRC  = 'c:/Users/John Asley/OneDrive/Desktop/JCASH-website'
const DEST = path.join(__dirname, '../out')

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const file of fs.readdirSync(src)) {
    const s = path.join(src, file)
    const d = path.join(dest, file)
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d)
  }
}

// Main site index.html (overwrites Next.js homepage)
fs.copyFileSync(path.join(SRC, 'index.html'),        path.join(DEST, 'index.html'))
fs.copyFileSync(path.join(SRC, 'JCashw.png'),         path.join(DEST, 'JCashw.png'))
fs.copyFileSync(path.join(SRC, 'jcash-portrait.png'), path.join(DEST, 'jcash-portrait.png'))
copyDir(path.join(SRC, 'public'), path.join(DEST, 'public'))
copyDir(path.join(SRC, 'app'),    path.join(DEST, 'app'))

console.log('✓ JCASH main site merged into out/')
