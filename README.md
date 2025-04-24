# <img src="https://raw.githubusercontent.com/keertyverma/blogsphere/refs/heads/main/client/public/assets/images/logo.svg" width="35" alt="Logo" /> Blogsphere

[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/keertyverma/blogsphere/backend-ci-cd.yml?label=Backend%20CI/CD%20Pipeline)](https://github.com/keertyverma/blogsphere/actions/workflows/backend-ci-cd.yml)

🔗 **Live App**: [https://blogsphere.360verse.co](https://blogsphere.360verse.co)

<hr />

👋 Welcome to Blogsphere, <strong>a modern blogging platform built to empower creators and engage curious readers.</strong>

Whether you're a writer looking to share your voice or a reader eager to explore new ideas, BlogSphere makes it easy to <strong>create, discover, and engage</strong> with meaningful content.
<br>And with a responsive, modern design, your content always looks great—on any device.

### 📽️ App Demo

- <div>
    <a href="https://www.loom.com/share/f5f402acfd96478a8e4653dffb2eea9d">
      <p>BlogSphere - Quick Demo</p>
    </a>
    <a href="https://www.loom.com/share/f5f402acfd96478a8e4653dffb2eea9d">
      <img style="max-width:400px;" src="https://cdn.loom.com/sessions/thumbnails/f5f402acfd96478a8e4653dffb2eea9d-562337a6286acfb7-full-play.gif">
    </a>
  </div>
- For a more in-depth walkthrough, explore these detailed videos:
  - [Part 1 - Discover Blogs, Sign Up & Interact ](https://www.youtube.com/watch?v=SgRE1Oa-Jgc)
  - [Part 2 - Create, Edit & Publish Blogs | Profile Settings](https://www.youtube.com/watch?v=Q6PeqZPGLbk)

## 🚀 Features

### 🔍 Blog Discovery

- **Blog Feed**: Discover recent and trending blogs with infinite scrolling and a curated list of the top 10 most engaging posts.
- **Search**: Quickly find blogs by title, description, tags, or author name. You can also search for users by their full name.
- **Filter by Categories**: Browse blogs by specific categories to focus on the topics that interest you most.

### 👤 User Management

- **🔐 User Authentication**

  - Sign up / Log in with Email-password or Google.
  - Email Verification: Verify your account via email for trusted access, with the option to resend the verification if needed.
  - Password Recovery: Securely reset your password with the easy forgot password process.
  - Session Management: Automatic session expiration and secure token handling for enhanced security.

- **User Profile**
  - View and edit your profile, including name, bio, profile image, and social links.
  - Bookmarks: Access and manage all the blogs you've bookmarked for quick and easy reference.
- **Account Settings**
  - Change Password: Easily update your login password from the settings.
  - Change Username: Users have a one-time option to change their username, which is initially generated from their name or email.

### ✍️ Blog Management

- **Full Blog Control**: Effortlessly create, edit, and delete both draft and published blogs through a clean, user-friendly dashboard.
- **Rich Text Editor**: Create beautifully structured blogs using a block-style editor powered by [Editor.js](https://editorjs.io/).<br>Add headings, paragraphs, lists, images, quotes, code blocks, and more with ease. Need help? Access the dedicated [Editor Guide](https://blogsphere.360verse.co/editor-guide) to assist content creation.
- **Draft & Publish Modes**:
  - Save blogs as drafts and continue editing anytime.
  - Preview your draft to see exactly how the blog page will look before publishing.
  - Privacy & Access Control: Draft blogs are private and visible only to their authors. Unauthorized users attempting to access them are automatically redirected.

### 🗨️ Blog Engagement

- **Like & Comment**:
  - Engage with content by liking blogs and participating in discussions through comments.
  - The nested comment system supports threaded replies for more meaningful conversations.
- **Bookmark**: Save your favorite blogs for quick access and later reading.
- **Share Options**: Easily share blogs via X (Twitter) and LinkedIn, or copy the link to your clipboard for effortless sharing anywhere.

### 🌗 User Experience

- **Dark/Light Theme**: Toggle between light and dark mode for a personalized reading experience.
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- Minimal, Modern UI: Built for readability and ease of use

## 🛠️ Tech Stack

**Frontend**

- [React](https://react.dev/) — A JavaScript library for building fast, interactive, and reusable user interfaces.
- [TypeScript](https://www.typescriptlang.org/) — Strongly typed JavaScript for safer code.
- [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) — Utility-first styling with customizable UI components.
- [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight state management for React apps.
- [Tanstack Query](https://tanstack.com/query/latest) — Manage server state, caching, and API data fetching efficiently in React.
- [Editor.js](https://editorjs.io/) — Block-style rich text editor used for blog content creation.

**Backend & Database**

- [Node.js](https://nodejs.org/) - JavaScript runtime environment
- [Express](https://expressjs.com/) — API framework.
- [MongoDB](https://www.mongodb.com/) — Document-based NoSQL database to store users, blogs, and comments.<br> Fully managed via [MongoDB Atlas](https://www.mongodb.com/atlas) for data storage and scalability
- [Cloudinary](https://cloudinary.com/) — Manage and deliver blog images and user profile pictures with fast, cloud-based storage and CDN delivery.
- [Firebase](https://firebase.google.com/) — Used for Google authentication integration.
- [Mailgun](https://www.mailgun.com/) — Transactional email service used for account verification and password recovery emails.
- [Jest](https://jestjs.io/) — JavaScript testing framework used for unit and integration tests.

**Deployment**

- **Backend**: Deployed on [Google Cloud](https://cloud.google.com/) with an automated CI/CD pipeline using [GitHub Actions](https://github.com/features/actions) for continuous integration and deployment. <br>Every push to the repository triggers build, test, and deployment processes.
- **Frontend**: Deployed on [Vercel](https://vercel.com/) with an automatic CI/CD pipeline for continuous updates.

## ✨ Contributing

Contributions from the community are always welcome to make **BlogSphere** even better.

To contribute, please follow these steps

1. Fork the repository on GitHub.
2. Clone your forked repository:
3. Create a new branch from the `main` branch.
4. Make the necessary changes and commit them with descriptive commit messages.
5. Push your changes to your forked repository and raise PR on this repository

## 💖👩‍💻 Support

Support the project by giving it a star ⭐.
<br> Feel free to reach out if you have any questions or suggestions.

[![Twitter Follow](https://img.shields.io/twitter/follow/KeertyVerma?style=social)](https://twitter.com/KeertyVerma)
[![Linkedin: Keerty Verma](https://img.shields.io/badge/-Keerty%20Verma-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/keertyverma/)](https://www.linkedin.com/in/keertyverma/)
[![GitHub followers](https://img.shields.io/github/followers/keertyverma?style=social)](https://github.com/keertyverma)
