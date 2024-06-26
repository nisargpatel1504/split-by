# Split-by: Expense Tracker Application

Split-by is an expense tracker application designed to simplify the process of managing shared expenses among friends, family, or colleagues. It allows users to track personal and group expenses, making it easy to see who owes whom and how much.

## Features

- **User Authentication**: Secure login mechanism to manage personal and group expenses.
- **Group Management**: Create and manage groups for shared expenses among multiple users.
- **Expense Tracking**: Add, update, and delete personal and group expenses.
- **Balance Calculation**: Automatically calculates and tracks the balance amounts owed among users.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- MongoDB
- Any REST client (Postman, Insomnia)

### Installing

Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/split-by.git
cd split-by
```

Install the required dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

The server will start running on `http://localhost:3000`.

## API Endpoints

Below are the primary endpoints available in the Split-by application:

### User Authentication

- **Login**: `POST /api/login` - Authenticate a user.

### Group Management

- **Create Group**: `POST /api/groups` - Create a new group.
- **List Groups**: `GET /api/groups` - Retrieve all groups for the logged-in user.
- **Add Group Member**: `POST /api/groups/:groupId/members` - Add a new member to a group.

### Expense Management

- **Add Expense**: `POST /api/expenses` - Add a new personal expense.
- **List Expenses**: `GET /api/expenses` - Retrieve all personal expenses for the logged-in user.

### Group Expenses Management

- **Add Group Expense**: `POST /api/group-expenses` - Add a new expense in a group.
- **List Group Expenses**: `GET /api/group-expenses/:groupId` - Retrieve all expenses for a specific group.

### User Balance

- **Get User Balance**: `GET /api/user-balance` - Retrieve the balance summary for the logged-in user.


---

Remember to replace placeholders like `https://github.com/yourusername/split-by.git`, `[CONTRIBUTING.md](CONTRIBUTING_LINK)`, and `[LICENSE.md](LICENSE_LINK)` with actual links relevant to your project.
