# OpenDocs - Function Execution Flow

## 📊 Sequential Function Execution When Running the Project

This document explains every function called in sequence when you run the **OpenDocs** application, from startup to documentation generation.

---

## 🎬 Application Startup Flow

### Phase 1: Server Initialization

#### 1️⃣ **Server Startup** (`Server/index.js`)

```
node index.js
├─ require('dotenv').config()
│  └─ Loads environment variables from .env file
├─ require('express') → Creates Express app
├─ require('cors') → Enables Cross-Origin Resource Sharing
├─ require('fs') → File system operations module
└─ require('path') → Path utilities module
```

**Function**: `app.listen(port: 3000, callback)`
- Starts the Express server on port 3000
- Console output: `"Server is running on port 3000"`

---

### Phase 2: Client Initialization

#### 2️⃣ **Client Startup** (`Client/src/main.jsx`)

```
vite dev
├─ Initialize React with ReactDOM
├─ Mount App component to DOM
└─ Load Vite dev server (usually port 5173)
```

#### 3️⃣ **App Component Mount** (`Client/src/App.jsx`)

```javascript
function App() {
  // State Initialization
  - setServerStatus('Checking...')
  - setIsGenerating(false)
  - setReadmeContent('')
  - setEndpoints([])
  - setLastUpdated(null)
  - setProjectPath('')
  - setIsPickerOpen(false)
}
```

**Mounted Components**:
1. `<Header />` - Display server status
2. `<ActionPanel />` - Buttons for user interactions
3. `<DirectoryPicker />` - File system navigator (conditional)
4. `<MarkdownViewer />` - Display generated documentation
5. `<EndpointCards />` - List API endpoints

---

## 🔄 User Interaction Flow

### Step 1: Check Server Status (Automatic on App Load)

#### 4️⃣ **checkStatus()** Function

```javascript
async function checkStatus() {
  try {
    const res = await fetch('http://localhost:3000/')
    if (res.ok) {
      setServerStatus('Connected')
    } else {
      setServerStatus('Error')
    }
  } catch (err) {
    setServerStatus('Disconnected')
  }
}
```

**Execution Timeline**:
- Called on `useEffect` mount
- Repeats every 10 seconds via `setInterval`
- Displays connection status in Header component

---

### Step 2: User Clicks "Connect Live Folder"

#### 5️⃣ **setIsPickerOpen(true)**

Opens the `<DirectoryPicker />` component, which calls:

#### 6️⃣ **getDrives()** Function (Server-side)

```javascript
async function getDrives() {
  // Option A: Try WMIC command (Windows)
  exec('wmic logicaldisk get name', (err, stdout) => {
    drives = stdout.split('\r\n').filter(/[A-Za-z]:/).map(trim)
  })
  
  // Option B: Fallback - Check A-Z manually
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  alphabet.forEach(letter => {
    if (fs.existsSync(`${letter}:\\`)) {
      fallbackDrives.push(`${letter}:`)
    }
  })
  
  return [...new Set([...drives, ...fallbackDrives])].sort()
}
```

**Server Endpoint**: `GET /explorer?path=`

#### 7️⃣ **File System Navigation** (Server-side)

```javascript
app.get('/explorer', async (req, res) => {
  let currentPath = req.query.path || ""
  
  if (!fs.existsSync(currentPath)) {
    return res.status(404).json({ error: "Path does not exist" })
  }
  
  const items = fs.readdirSync(currentPath, { withFileTypes: true })
  const folders = items
    .filter(item => 
      item.isDirectory() && 
      !item.name.startsWith('.') && 
      item.name !== 'node_modules'
    )
    .map(item => ({
      name: item.name,
      path: path.join(currentPath, item.name)
    }))
  
  return res.json({ currentPath, folders, parentPath })
})
```

---

### Step 3: User Selects Project Directory and Clicks "Track & Generate Docs"

#### 8️⃣ **handleTrackPath()** Function (Client-side)

```javascript
async function handleTrackPath() {
  if (!projectPath) return
  setIsGenerating(true)
  
  try {
    const res = await fetch('http://localhost:3000/track-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPath: projectPath })
    })
    
    const data = await res.json()
    if (res.ok) {
      setLastUpdated(new Date())
      setEndpoints(data.endpoints || [])
      await fetchData()
    }
  } finally {
    setIsGenerating(false)
  }
}
```

This sends a POST request to `/track-project` endpoint.

---

## 🔥 Core Documentation Generation Flow

### Phase 3: Documentation Generation (Server-side)

#### 9️⃣ **POST /track-project Endpoint Handler**

```javascript
app.post('/track-project', async (req, res) => {
  const { targetPath } = req.body
  
  // Validate path
  if (!targetPath || !fs.existsSync(targetPath)) {
    return res.status(400).json({ error: 'Invalid path' })
  }
  
  // Start watcher for live updates
  startWatcher(targetPath)
  
  // Perform initial documentation generation
  const projectFiles = await readFilesRecursive(targetPath)
  // ... continue to next step
})
```

#### 🔟 **readFilesRecursive()** Function

**Location**: `Server/utils/fileReader.js`

```javascript
async function readFilesRecursive(dir, fileList = []) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    
    if (file.isDirectory()) {
      // Skip node_modules and hidden files
      if (file.name !== 'node_modules' && !file.name.startsWith('.')) {
        await readFilesRecursive(fullPath, fileList)  // Recursive call
      }
    } else if (file.name.endsWith('.js')) {
      fileList.push(fullPath)  // Collect .js files
    }
  }
  
  return fileList
}
```

**Output**: Array of all JavaScript file paths in project

#### 1️⃣1️⃣ **readFileContent()** Function

**Location**: `Server/utils/fileReader.js`

```javascript
async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error)
    return null
  }
}
```

**Called for each file**: Reads and returns file contents

#### 1️⃣2️⃣ **Combine Code for AI Analysis**

```javascript
let combinedCode = ""

for (let file of projectFiles) {
  const content = await readFileContent(file)
  if (!content) continue
  
  // Create labeled code block
  combinedCode += `\n// File: ${path.relative(targetPath, file)}\n${content}\n`
}
```

**Result**: Single string containing all code with file labels

---

## 🤖 AI Documentation Generation

#### 1️⃣3️⃣ **generateDocs()** Function

**Location**: `Server/ai/geminiService.js`

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function generateDocs(code) {
  const prompt = `
You are a documentation generator. Analyze the following code and return a JSON object with this structure:
{
  "readme": "A concise, professional markdown README string including Overview and API Endpoints.",
  "endpoints": [
    {
      "method": "GET/POST/PUT/DELETE",
      "path": "/api/route",
      "description": "Brief description of what this endpoint does."
    }
  ]
}

Code:
${code}
`
  
  const result = await genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash"
  }).generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  })
  
  let text = result.response.text()
  
  // Clean up markdown code blocks
  if (text.startsWith("```json")) {
    text = text.replace(/```json|```/g, "").trim()
  } else if (text.startsWith("```")) {
    text = text.replace(/```/g, "").trim()
  }
  
  const response = JSON.parse(text)
  return response
}

module.exports = generateDocs
```

**API Call**: 
- Model: `gemini-2.5-flash`
- Response Format: JSON
- Input: All project code as prompt
- Output: README markdown + endpoints array

---

## 📝 File Updates

#### 1️⃣4️⃣ **updateReadme()** Function

**Location**: `Server/utils/readmeUpdater.js`

```javascript
const saveReadme = (content, readmePath) => {
  fs.writeFileSync(readmePath, content)
  console.log(`README updated at ${readmePath}`)
}

module.exports = saveReadme
```

**Creates/Updates**: `README.md` file in target directory

#### 1️⃣5️⃣ **Save Endpoints**

```javascript
const endpointsPath = path.join(targetPath, 'endpoints.json')
fs.writeFileSync(endpointsPath, JSON.stringify(response.endpoints, null, 2))
```

**Creates/Updates**: `endpoints.json` file with detected API endpoints

---

## 👁️ File Watcher Setup

#### 1️⃣6️⃣ **startWatcher()** Function

**Location**: `Server/watcher/fileWatcher.js`

```javascript
const chokidar = require('chokidar')

let watcherInstance = null
let isGenerating = false
let lastGenerationTime = 0
const COOLDOWN_PERIOD = 10000  // 10 seconds

async function startWatcher(targetPath) {
  if (watcherInstance) {
    watcherInstance.close()  // Close previous watcher
  }
  
  watcherInstance = chokidar.watch(targetPath, {
    ignored: [
      /(^|[\/\\])\../,  // Ignore hidden files
      /node_modules/,
      /README\.md/,
      /endpoints\.json/
    ],
    persistent: true,
    ignoreInitial: true
  })
  
  // Set up file change listener
  watcherInstance.on('all', (event, filePath) => {
    const relativePath = path.relative(targetPath, filePath)
    console.log(`[${event.toUpperCase()}] ${relativePath}`)
    
    // Debounce regeneration
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      // Rate limiting check
      const now = Date.now()
      const elapsed = now - lastGenerationTime
      
      if (elapsed < COOLDOWN_PERIOD) {
        console.log(`⏳ Waiting ${Math.ceil((COOLDOWN_PERIOD - elapsed) / 1000)}s...`)
        timeout = setTimeout(() => watcherInstance.emit('change', filePath), 
                           COOLDOWN_PERIOD - elapsed)
        return
      }
      
      // Trigger regeneration (same as steps 9-15 above)
      // goto step 9
    }, 300)
  })
}
```

---

## 🔄 Client Data Fetching

#### 1️⃣7️⃣ **fetchData()** Function (Client-side)

```javascript
const fetchData = async () => {
  if (!projectPath) return
  
  try {
    // Fetch README
    const readmeRes = await fetch(
      `http://localhost:3000/readme?path=${encodeURIComponent(projectPath)}`
    )
    if (readmeRes.ok) {
      const data = await readmeRes.json()
      setReadmeContent(data.content)  // Update UI
    }
    
    // Fetch Endpoints
    const endpointsRes = await fetch(
      `http://localhost:3000/endpoints?path=${encodeURIComponent(projectPath)}`
    )
    if (endpointsRes.ok) {
      const data = await endpointsRes.json()
      setEndpoints(data.endpoints || [])  // Update UI
    }
  } catch (err) {
    console.error("Fetch data error:", err)
  }
}
```

**Server Endpoints Called**:
- `GET /readme?path=...` → Returns README.md content
- `GET /endpoints?path=...` → Returns endpoints.json content

---

## 🎨 UI Rendering

#### 1️⃣8️⃣ **Component Renders (Client-side)**

```javascript
<div className="main-container">
  <Header status={serverStatus} />
  
  <ActionPanel 
    onTrackClick={handleTrackPath}
    onPickerClick={() => setIsPickerOpen(true)}
    isGenerating={isGenerating}
  />
  
  {isPickerOpen && (
    <DirectoryPicker 
      onSelect={(path) => {
        setProjectPath(path)
        setIsPickerOpen(false)
      }}
    />
  )}
  
  <MarkdownViewer content={readmeContent} />
  
  <EndpointCards endpoints={endpoints} />
</div>
```

Each component receives state and renders accordingly.

---

## 🔁 Continuous Update Loop

#### 1️⃣9️⃣ **Auto-refresh Effect** (Client-side)

```javascript
useEffect(() => {
  checkStatus()
  if (projectPath) fetchData()
  
  // Refresh every 10 seconds
  const interval = setInterval(() => {
    checkStatus()
    if (projectPath) fetchData()
  }, 10000)
  
  return () => clearInterval(interval)
}, [projectPath])
```

**Continuous**: Polls server every 10 seconds for updates

---

## 📊 Complete Execution Flowchart

```
START
  ↓
[1] Server Startup (node index.js)
  ↓
[2] Client Startup (npm run dev)
  ↓
[3] App Component Mount
  ↓
[4] Check Server Status (every 10s)
  ↓
User Clicks "Connect Live Folder"
  ↓
[5] Open Directory Picker
  ↓
[6] getDrives() → List drives
  ↓
[7] User navigates folders via /explorer endpoint
  ↓
User Clicks "Generate Documentation"
  ↓
[8] handleTrackPath() → POST /track-project
  ↓
[9] Validate path & start tracking
  ↓
[10] readFilesRecursive() → Find all .js files
  ↓
[11] readFileContent() → Read each file
  ↓
[12] Combine all code
  ↓
[13] generateDocs() → Call Gemini AI
  ↓
[14] updateReadme() → Save README.md
  ↓
[15] Save endpoints.json
  ↓
[16] startWatcher() → Monitor for changes
  ↓
[17] fetchData() → Get README & endpoints
  ↓
[18] Render UI with documentation
  ↓
[19] Auto-refresh every 10 seconds
  ↓
File Change Detected (via Chokidar)
  ↓
Repeat [10-15] (with rate limiting)
  ↓
END (when user closes application)
```

---

## ⏱️ Timing & Performance

| Operation | Average Time | Notes |
|-----------|--------------|-------|
| Server startup | ~1s | Express initialization |
| Client startup | ~3-5s | React + Vite dev server |
| Directory listing | ~0.5s | File system read |
| Code reading | ~1-2s | Depends on project size |
| AI generation | ~5-15s | API call to Gemini |
| File watching setup | ~0.5s | Chokidar initialization |
| Auto-refresh poll | 10s interval | Every 10 seconds |
| File change detection | ~0.3s | Debounced |

---

## 🛡️ Rate Limiting Implementation

The watcher implements a **10-second cooldown** to prevent excessive API calls:

```javascript
const COOLDOWN_PERIOD = 10000  // 10 seconds

if (elapsed < COOLDOWN_PERIOD) {
  // Wait for cooldown to expire
  const wait = COOLDOWN_PERIOD - elapsed
  setTimeout(() => regenerateDocumentation(), wait)
}
```

This ensures Gemini API rate limits are not exceeded.

