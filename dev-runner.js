import { spawn } from 'child_process'
import { createServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function waitForServer(url, maxAttempts = 30, interval = 200) {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const check = () => {
      attempts++
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve()
        } else {
          retry()
        }
      }).on('error', () => {
        retry()
      })
    }
    const retry = () => {
      if (attempts < maxAttempts) {
        setTimeout(check, interval)
      } else {
        reject(new Error(`Server at ${url} did not respond after ${maxAttempts} attempts`))
      }
    }
    check()
  })
}

async function startDev() {
  const server = await createServer({
    mode: 'development',
    configFile: path.resolve(__dirname, 'vite.config.js'),
    server: {
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true
      }
    }
  })

  await server.listen()
  console.log('Vite dev server ready at http://localhost:5173')

  await waitForServer('http://localhost:5173')
  console.log('Server responding, launching Electron...')

  const electronArgs = ['--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox']

  const electron = spawn('npx', ['electron', '.', ...electronArgs], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
      DIST: path.resolve(__dirname, 'dist/renderer')
    }
  })

  electron.on('exit', () => {
    server.close()
    process.exit()
  })

  process.on('SIGTERM', () => {
    electron.kill()
    server.close()
    process.exit()
  })

  process.on('SIGINT', () => {
    electron.kill()
    server.close()
    process.exit()
  })
}

startDev().catch(console.error)
