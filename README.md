# TeleCMI API Calling App

A complete Express.js backend and React.js frontend application for integrating with TeleCMI API services.

## Features

- **User Management**: Create, read, update, and delete users/agents
- **User Authentication**: Login and token generation
- **Click2Call**: Initiate calls using user tokens or admin credentials
- **Call Records (CDR)**: View incoming/outgoing, answered/missed call records
- **Notes Management**: Add and retrieve call notes
- **Call Analysis**: Get call statistics and analytics
- **Live Calls**: Monitor live call events via webhooks

## Project Structure

```
telecmi_app/
├── server/                 # Express.js backend
│   ├── server.js          # Main server file with all API endpoints
│   └── package.json       # Backend dependencies
├── client/                # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/           # API service functions
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
└── telecmi_apis_doc.js    # API documentation reference
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- TeleCMI account with App ID and App Secret

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=4000
TELECMI_BASE_URL=https://rest.telecmi.com/v2
TELECMI_APP_ID=your_app_id_here
TELECMI_APP_SECRET=your_app_secret_here
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `client` directory (optional):
```env
REACT_APP_API_URL=http://localhost:4000/api
```

4. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Admin
- `POST /api/admin/token` - Validate app credentials
- `POST /api/token` - Generate admin secret token

### Users
- `POST /api/users/list` - List all users
- `POST /api/users/add` - Create a new user
- `POST /api/users/update` - Update a user
- `POST /api/users/delete` - Delete a user
- `POST /api/users/login` - User login

### Click2Call
- `POST /api/click2call` - Initiate call (user token)
- `POST /api/click2call/hangup` - Hangup call
- `POST /api/admin/click2call` - Initiate call (admin)

### Call Records (CDR)
- `POST /api/users/in_cdr` - User incoming CDR
- `POST /api/users/out_cdr` - User outgoing CDR
- `POST /api/users/missed` - User missed calls
- `POST /api/users/out_missed` - User outgoing missed
- `POST /api/users/answered` - User answered calls
- `POST /api/users/out_answered` - User outgoing answered
- `POST /api/answered` - Admin answered calls
- `POST /api/missed` - Admin missed calls
- `POST /api/out_answered` - Admin outgoing answered
- `POST /api/out_missed` - Admin outgoing missed

### Notes
- `POST /api/users/notes/add` - Add note
- `POST /api/users/notes/get` - Get notes

### Analysis
- `POST /api/analysis` - Call analysis

### Webhooks
- `POST /api/webhooks/cdr` - CDR webhook endpoint
- `POST /api/webhooks/events` - Live events webhook endpoint
- `GET /api/webhooks/live` - Get live calls

## Usage

1. **Configure Credentials**: Update the `.env` file in the `server` directory with your TeleCMI App ID and App Secret.

2. **Start Backend**: Run the Express server on port 4000.

3. **Start Frontend**: Run the React app on port 3000.

4. **Access the App**: Open `http://localhost:3000` in your browser.

5. **User Management**: 
   - Navigate to the "Users" tab
   - Create users with extension, name, phone number, and password
   - Edit or delete existing users

6. **User Login**:
   - Go to "User Login" tab
   - Enter user ID and password to get a token
   - Token will be saved for use in other features

7. **Make Calls**:
   - Use "Click2Call" tab for user-initiated calls
   - Use "Admin Click2Call" for admin-initiated calls
   - Enter phone numbers and initiate calls

8. **View Call Records**:
   - Navigate to "Call Records" tab
   - Select the type of CDR you want to view
   - Apply filters and fetch records

9. **Manage Notes**:
   - Add notes to calls in the "Notes" tab
   - Retrieve notes by phone number and date

10. **Call Analysis**:
    - View call statistics in the "Call Analysis" tab
    - Enter date range to get analytics

11. **Live Calls**:
    - Monitor live call events in the "Live Calls" tab
    - Webhook events will appear here when received

## Webhook Configuration

To receive webhook events, configure your TeleCMI webhook URLs:

- CDR Webhook: `http://your-domain.com/api/webhooks/cdr`
- Events Webhook: `http://your-domain.com/api/webhooks/events`

For local development, use a service like ngrok to expose your local server:
```bash
ngrok http 4000
```

Then use the ngrok URL in your TeleCMI webhook configuration.

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 4000)
- `TELECMI_BASE_URL` - TeleCMI API base URL (default: https://rest.telecmi.com/v2)
- `TELECMI_APP_ID` - Your TeleCMI App ID
- `TELECMI_APP_SECRET` - Your TeleCMI App Secret

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:4000/api)

## Development

### Backend Development
- Uses Express.js with CORS enabled
- Error handling for all API endpoints
- In-memory storage for live calls and created users

### Frontend Development
- React 18 with functional components and hooks
- Modern UI with responsive design
- Axios for API calls
- Local storage for user tokens

## Troubleshooting

1. **CORS Issues**: Ensure the backend CORS is enabled (already configured)
2. **API Errors**: Check your TeleCMI credentials in the `.env` file
3. **Port Conflicts**: Change ports in `.env` files if needed
4. **Webhook Not Working**: Ensure your server is publicly accessible or use ngrok

## License

ISC

## Support

For TeleCMI API documentation, visit: https://doc.telecmi.com/

