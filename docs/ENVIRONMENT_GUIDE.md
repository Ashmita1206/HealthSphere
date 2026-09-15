# HealthSphere AI — Environment Variables & Configuration Guide

This catalog documents all environment configurations used across HealthSphere.

---

## 1. Core Application Variables

| Variable | Environment | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | All | String | `development` | Yes | Active runtime profile (`development`, `staging`, `production`, `test`) |
| `PORT` | Backend | Number | `4000` | No | Express HTTP server listen port |
| `CLIENT_URL` | Backend | String | `*` | Yes | Permitted CORS origins (comma-delimited in production) |
| `VITE_API_URL` | Frontend | String | `http://localhost:4000` | Yes | Backend base URL accessed by React browser client |

---

## 2. Database & Cache Connectivity

| Variable | Environment | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MONGODB_URI` | Backend | URI | `mongodb://localhost:27017/healthsphere` | Yes | MongoDB replica set or cluster connection string |
| `REDIS_URL` | Backend | URI | `redis://localhost:6379` | No | Redis connection URL for multi-tier caching (falls back to memory if unset) |

---

## 3. Cryptography & Security Secrets

| Variable | Environment | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `JWT_SECRET` | Backend | String | Internal dev key | Yes | Secret used for HMAC SHA-256 JWT signing. Must be at least 32 characters in production. |
| `ENCRYPTION_KEY` | Backend | String | `none` | No | 256-bit AES hex key for field-level medical record encryption |

---

## 4. Artificial Intelligence & Third-Party APIs

| Variable | Environment | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Backend | String | `""` | Optional | Google Gemini generative AI API key for clinical reports and copilot |
| `OPENAI_API_KEY` | Backend | String | `""` | Optional | OpenAI API key for alternative LLM embeddings |
| `CLOUDINARY_CLOUD_NAME` | Backend | String | `""` | Optional | Cloudinary cloud identifier for medical scans |
| `CLOUDINARY_API_KEY` | Backend | String | `""` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | String | `""` | Optional | Cloudinary API secret |

---

## 5. Observability & Logging

| Variable | Environment | Type | Default | Required in Prod | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `LOG_LEVEL` | Backend | String | `info` | No | Winston logging threshold (`debug`, `info`, `warn`, `error`) |
