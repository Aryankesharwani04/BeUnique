# BeUnique

BeUnique is a web application that helps users find a unique username across multiple platforms like LinkedIn, GitHub, and LeetCode. It ensures that the chosen username is available on these platforms, making it easy for users to maintain a consistent online identity.

## Features

- Check username availability on LinkedIn, GitHub, and LeetCode.
- Dark/Light mode toggle for better user experience.
- Animated verification UI.
- Responsive design with Tailwind CSS.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js(Puppeteer Library), Express.js

## Installation Guide

### Prerequisites

- **Node.js** and **npm** installed on your system.
- **Git** installed (for cloning the repository).

### Steps to Set Up the Project

#### 1. Clone the Repository or Download the Code

```sh
git clone https://github.com/yourusername/BeUnique.git
cd BeUnique
```

#### 2. Install Frontend Dependencies

```sh
cd frontend
npm install
```

#### 3. Install Backend Dependencies

```sh
cd ../backend
npm install
```

#### 4. Set Up Environment Variables

Create a **.env** file inside the `backend` folder and add the following:

```env
LINKEDIN_EMAIL=""
LINKEDIN_PASSWORD=""
```

Fill in your LinkedIn credentials inside the quotes.

#### 5. Run the Backend Server

```sh
cd backend
npm start
```

#### 6. Run the Frontend Application

```sh
cd ../frontend
npm start
```

### Usage

- Enter your desired username in the input field.
- Click the **Check** button to verify its availability on LinkedIn, GitHub, and LeetCode.
- View the verification results with animated UI.
- Toggle between Dark/Light mode for better visibility.

### Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

### License

This project is licensed under the MIT License.

