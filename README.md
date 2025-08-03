# 📸 Pixxel - AI Image Editor

Pixxel is a full-stack AI-powered image editor built with modern web technologies. It allows users to upload and edit images, manage multiple projects, and experience advanced canvas editing powered by intelligent tools.

> 🔐 Auth powered by [Clerk](https://clerk.dev)  
> 🖼️ Images stored via [ImageKit.io](https://imagekit.io)  
> 📷 Stock photos fetched from [Unsplash](https://unsplash.com)  
> ⚡ Realtime backend using [Convex](https://convex.dev)

---

## 🚀 Features

- 🖼 Upload, preview, and edit images with a responsive canvas
- 🎨 Tools like resize, crop, background remover (AI-based)
- 📁 Project system with thumbnail, title, and size metadata
- 📷 Stock image search using Unsplash API
- ⚡ Realtime backend logic and storage with Convex
- 🔐 Auth with Clerk (email/social)
- ⚖️ Free plan with project limits + upgrade flow
- 💻 Fully responsive and desktop-optimized UI

---

## ⚙️ Tech Stack

- **Frontend**: Next.js 14+, Tailwind CSS, React
- **Backend**: [Convex](https://convex.dev)
- **Auth**: [Clerk.dev](https://clerk.dev)
- **Image Storage**: [ImageKit.io](https://imagekit.io)
- **Stock Photos**: [Unsplash API](https://unsplash.com/developers)
- **UI Components**: shadcn/ui
- **Icons/Spinners**: lucide-react, react-spinners
- **State Management**: Context API

---

## 🧪 Local Development

```bash
git clone https://github.com/your-username/Pixxel--AI-PhotoEditor
cd Pixxel--AI-PhotoEditor

npm install
npm run dev
&&
npx run convex
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.
## 📁 Environment Variables (.env)

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
#use this when you are using production mode
CONVEX_DEPLOY_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
#pase this two same as it is
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_PRIVATE_KEY=

# Unsplash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=
```

---

## 📸 Image Handling
#### 🔐 Uploads to ImageKit
- Uploaded images are stored in ImageKit
- Auto-thumbnail, compression, and transformation support
- URLs are optimized via CDN

#### 📷 Stock Images via Unsplash
- Users can search stock images from Unsplash
- Fetched via the Unsplash REST API
- Selected images can be used as project background

---

## ⚡ Backend with Convex

#### Pixxel uses Convex for the backend:

- Realtime database (NoSQL)
- Serverless functions for mutations and queries
- Built-in authentication integration
- Strong typing with TypeScript
- Super-fast reads and writes

All project data (title, image URLs, dimensions, etc.) are stored in Convex and updated live across sessions.

---

## 🔐 Authentication with Clerk
#### Clerk handles:
- Signup/Login (email, social)
- Auth state
- Session and secure user data

---

## 💳 Plan Limits
- Free Plan: Up to 3 projects
- Pro Plan: Unlimited access + all tools
- Upgrade prompt shown via modal when limit is hit

---

## 🚀 Deployment
#### Hosted on Vercel
⚠️ Note: File and folder names are case-sensitive on Vercel
Make sure your route folder is [projectId] not [ProjectId]

---

## 📥 Contributing
Pull requests are welcome!
If you find a bug or want to add a feature, feel free to open an issue.

---

## 👤 Author
Made with ❤️ by [Asif Shamim](https://github.com/asifcuber08)