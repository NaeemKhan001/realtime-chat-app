# realtime-chat-app
A Realtime Chat Application built on Node.js, Express, MongoDB, Passport.js, Socket.io, and Mongoose with ES6 practices.


## Features

- User Registration and Login
- Password encryption using bcrypt
- Session management with Passport.js
- Realtime chat functionality with Socket.io
- Message deletion for self and everyone
- Search for users and messages by keyword
- Conversation view for messages


## Getting Started

### Prerequisites

- Node.js (nvm recommended)
- MongoDB

### Installation

1. Clone the repository:

   ```bash
   https://github.com/NaeemKhan001/realtime-chat-app.git
   cd realtime-chat-app

2. Switch to the defined Node.js version:
    nvm use

3. Install dependencies:
    npm install

4. Running the Application

    - For production:
        npm start

    - For development (with nodemon):
        npm run dev


The application will be running on http://localhost:4000.



Usage
1. Register a new account.
2. Log in using your credentials.
3. Start chatting with other users in realtime.
4. Manage your messages: delete for yourself or for everyone.
5. Search for users and messages using keywords.

Best Practices
- Follows MVC architecture.
- Environment variables for sensitive information.
- .nvmrc file to specify the required Node.js version.