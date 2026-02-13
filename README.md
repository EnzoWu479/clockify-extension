This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Setup Environment

First, copy the example environment file and generate RSA keys for API encryption:

```bash
# Copy environment template
cp .env.example .env

# Generate RSA encryption keys
pnpm generate-keys
```

This will create `NEXT_PUBLIC_RSA_PUBLIC_KEY` and `RSA_PRIVATE_KEY` in your `.env` file.

### 2. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🔐 Security

This project implements RSA-2048 encryption for protecting user API keys:
- API keys are encrypted before being stored in localStorage
- Encrypted keys are sent to the backend for decryption
- Private key never leaves the server

See [docs/SECURITY.md](docs/SECURITY.md) for detailed security architecture.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
