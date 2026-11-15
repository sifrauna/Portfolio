# Jasjeet Singh portfolio: live-editable on Cloudflare Pages

Sign in on the live site (lock icon), edit anything, press Save & publish: it updates instantly for every visitor, from any device.
The password is checked on the server (Cloudflare Pages Function), never in the browser. Content is stored in Cloudflare KV.

## Deploy (about 10 minutes, free tier is enough)
1. Put this folder in a GitHub repo (index.html and functions/ at the root).
2. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git. Framework: None. Build command: empty. Output directory: /
3. Storage & Databases -> KV -> Create a namespace (e.g. portfolio-content).
4. Your Pages project -> Settings -> Bindings -> Add -> KV namespace. Variable name MUST be PORTFOLIO. Select your namespace.
5. Settings -> Variables and secrets: add ADMIN_USER (your ID) and ADMIN_PASSWORD (type: Secret; use a long unique password).
6. Deployments -> Retry/redeploy so bindings and variables apply.
7. Open your site -> lock icon -> sign in -> edit -> Save & publish.

Notes: images are compressed in the browser and stored inside the content (keep to a few). For a CV, paste a link to a hosted PDF. Use Export backup now and then.
