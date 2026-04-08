# OpenDocs - Automatic API Documentation Generator

## 📋 Project Overview

**OpenDocs** is an intelligent application that automatically generates API documentation from your project's source code. It leverages Google's Gemini AI to analyze your codebase and create comprehensive, up-to-date API documentation with minimal manual effort.

### Key Features

- 🤖 **AI-Powered Documentation**: Uses Google Gemini 2.5 Flash to analyze code and generate professional documentation
- 🔍 **Live File Watching**: Automatically monitors project directory for changes and updates documentation in real-time
- 🌐 **User-Friendly Interface**: React-based frontend for easy directory selection and documentation viewing
- 📱 **Responsive Design**: Built with Tailwind CSS and Lucide React for a modern, responsive UI
- 🔌 **REST API**: Express.js server exposing endpoints for file exploration, documentation generation, and tracking
- 💾 **File System Navigation**: Windows drive support and cross-platform directory browsing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Google Gemini API Key** (get from [Google AI Studio](https://aistudio.google.com/))

### Installation

#### Step 1: Clone/Setup the Project
```bash
cd OpenDocs
```

#### Step 2: Install Server Dependencies
```bash
cd Server
npm install
```

#### Step 3: Install Client Dependencies
```bash
cd ../Client
npm install
```

#### Step 4: Configure Environment Variables
Create a `.env` file in the `Server` directory:

```
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## 🎯 How to Use

### Step 1: Start the Server

```bash
cd Server
node index.js
```

The server will start on **http://localhost:3000**

### Step 2: Start the Client Development Server

In a new terminal:

```bash
cd Client
npm run dev
```

The client will typically run on **http://localhost:5173** (or shown in terminal output)

### Step 3: Use the Application

1. **Open the Client UI** in your browser
2. **Connect Live Folder**: Click on the "Connect Live Folder" button
3. **Select a Project Directory**: Navigate through the file system to select your project folder
4. **View Documentation**: The app will automatically:
   - Analyze all JavaScript files in your project
   - Generate a comprehensive README.md with API documentation
   - List all detected API endpoints with methods and descriptions
   - Display the formatted documentation in the markdown viewer
5. **Live Updates**: Any changes to your project files will trigger automatic documentation regeneration

---

## 📁 Project Structure

```
OpenDocs/
├── README.md                           # Main project README
├── Client/                             # React Frontend
│   ├── src/
│   │   ├── App.jsx                     # Main application component
│   │   ├── main.jsx                    # Entry point
│   │   ├── index.css                   # Global styles
│   │   └── components/                 # React components
│   │       ├── Header.jsx              # Header component with server status
│   │       ├── ActionPanel.jsx         # Controls for directory selection & tracking
│   │       ├── DirectoryPicker.jsx     # File system navigation dialog
│   │       ├── MarkdownViewer.jsx      # Renders generated documentation
│   │       └── EndpointCards.jsx       # Displays API endpoints
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.cjs
├── Server/                             # Node.js Backend
│   ├── index.js                        # Main server file with Express routes
│   ├── package.json
│   ├── .env                            # Environment variables (API keys)
│   ├── ai/
│   │   └── geminiService.js            # Google Gemini AI integration
│   ├── utils/
│   │   ├── fileReader.js               # File system reading utilities
│   │   └── readmeUpdater.js            # README.md file update logic
│   └── watcher/
│       └── fileWatcher.js              # Chokidar file watcher implementation
└── projects/                           # Sample project files
    └── test.js                         # Test file for development
```

---

## 🔌 API Endpoints

### GET `/`
- **Description**: Health check endpoint
- **Response**: Simple text message confirming server is running

### GET `/explorer`
- **Description**: Explore local file system
- **Query Parameters**: `path` - Current directory path
- **Response**: List of folders in the directory with navigation options

### GET `/readme`
- **Description**: Fetch generated README content
- **Query Parameters**: `path` - Project directory path
- **Response**: Markdown content of README.md

### GET `/endpoints`
- **Description**: Fetch detected API endpoints
- **Query Parameters**: `path` - Project directory path
- **Response**: JSON array of endpoint objects

### POST `/track-project`
- **Description**: Start watching a project directory for changes
- **Request Body**: `{ "targetPath": "/path/to/project" }`
- **Response**: Initial documentation and endpoints list

---

## 🛠️ Common Tasks

### Generate Documentation for a New Project
1. Start both server and client
2. Click "Connect Live Folder"
3. Navigate to your project directory
4. Click "Generate Documentation"
5. Wait for AI to analyze and generate docs

### View Generated Endpoints
- After documentation generation, endpoints appear in the "Endpoints" section of the UI
- Each endpoint shows: HTTP method, path, and description

### Monitor Live Changes
- Once tracking is active, any file changes in the project automatically trigger documentation updates
- Changes are queued with a cooldown period to prevent excessive API calls

---

## 📦 Build & Deployment

### Build Client for Production

```bash
cd Client
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
cd Client
npm run preview
```

---

## 🔐 Security & Rate Limiting

- **Rate Limit Protection**: 30-second cooldown between documentation regenerations
- **File Filtering**: Ignores `node_modules`, dotfiles, and existing endpoints.json
- **API Key Security**: Store Gemini API key in `.env` file (never commit to version control)
- **CORS Enabled**: Configured for localhost development

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Server Disconnected" | Ensure server is running on port 3000 |
| "GEMINI_API_KEY not found" | Add `.env` file to Server folder with valid API key |
| "Path does not exist" | Verify the selected directory path is valid |
| "No relevant code found" | Ensure project contains `.js` files |
| Rate limit errors | Wait for cooldown period (30 seconds) between changes |

---

## 📚 Technologies Used

- **Frontend**: React 19, Vite, Tailwind CSS, React Markdown, Lucide React
- **Backend**: Node.js, Express.js, Chokidar, Dotenv
- **AI/ML**: Google Generative AI (Gemini 2.5 Flash)
- **Utilities**: CORS, File System API

---

## 📝 License

ISC License

---

## 👨‍💻 Development Notes

- The application uses CommonJS for the server and ES modules for the client
- File watching is recursive and skips `node_modules` and hidden files
- Documentation is generated asynchronously and saved to `README.md` and `endpoints.json`
- The frontend polls the server every 10 seconds to check for updates

