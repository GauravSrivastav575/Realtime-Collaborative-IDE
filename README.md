# Realtime-Collaborative-IDE

## Description
Realtime-Collaborative-IDE is an online IDE that enables real-time code collaboration. Users can share files with their team, allowing multiple users to edit the same file simultaneously. The platform supports code compilation and input handling (stdin), along with syntax highlighting to enhance user experience. Additionally, it features user authentication (signup/login) and role-based access control, ensuring that only the file creator can grant access or delete files.

## Features
- **Real-time Collaboration**: Multiple users can edit the same file simultaneously.
- **Code Compilation**: Execute code directly within the platform.
- **Stdin Support**: Provide inputs to the code.
- **Syntax Highlighting**: Enhanced editing experience with Monaco Editor.
- **Authentication**: Signup/Login functionality.
- **Role-Based Access Control**: Only the creator can manage file access and deletion.

## Tech Stack
- **Frontend**: React, Monaco Editor
- **Backend**: Node.js, MongoDB
- **Real-time Collaboration**: Yjs, Y-Webrtc (for WebRTC-based syncing)
- **Code Execution**: Piston API (Docker planned for future implementation)

## Future Enhancements
- Implement Docker for secure and isolated code compilation.
- Support multiple programming languages.
- Integrate live chat and video call functionality for seamless team collaboration.

## Installation
Follow these steps to set up the project locally:

### Prerequisites
- Node.js (Latest LTS version recommended)
- MongoDB (Installed locally or using a cloud service like MongoDB Atlas)

### Steps
```sh
# Clone the repository
git clone https://github.com/GauravSrivastav575/Realtime-Collaborative-IDE.git
cd Realtime-Collaborative-IDE

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory and configure required variables (e.g., MongoDB connection string, API keys)

# Start the backend server
node server.js

# Start the frontend
npm run dev

# Open the project in the browser at http://localhost:3000
```

### Running the Y-Webrtc Signaling Server
The project requires a signaling server for WebRTC-based synchronization. Follow these steps to set it up:

```sh
# Clone the y-webrtc repository
git clone https://github.com/yjs/y-webrtc.git
cd y-webrtc

# Navigate to the bin folder
cd bin

# Start the signaling server
node server.js

# The server will start on port 4444 by default
```

## Usage
A demo video showcasing the platform's features is available here.

## Contributing
Contributions are welcome! To contribute, follow these steps:

```sh
# Fork the repository
# Create a new branch
git checkout -b feature-branch

# Make your changes and commit them
git commit -m 'Add new feature'

# Push to the branch
git push origin feature-branch

```

### Contribution Guidelines
- Follow the existing code style.
- Write meaningful commit messages.
- Test your changes before submitting.
- Open an issue before starting major changes.

## License
No specific license is included for this project.

