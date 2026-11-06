The editor updates profile, project, experience, and contact details in `content/site.json`. It also accepts JPEG, PNG, or WebP portrait images and PDF resumes up to 3 MB. Changes appear in the current page immediately and become public after the Vercel deployment finishes.
# Tanishk Shrivastava Portfolio

Static portfolio site deployed on Vercel. The private site editor is opened by clicking the portrait seven times within a short interval.

## Site Editor Setup

The editor uses a Vercel Function for password authentication and commits updated content to `content/site.json` on the configured GitHub branch. Vercel then redeploys the site so published edits are visible to all visitors.

Configure these environment variables in the Vercel project settings:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | A long, unique editor password. Never put this in browser code. |
| `SESSION_SECRET` | Random signing key for editor sessions. Generate with `openssl rand -base64 32`. |
| `GITHUB_TOKEN` | Fine-grained token limited to this repository with Contents read/write permission. |
| `GITHUB_REPOSITORY` | Repository in `owner/name` format, for example `tanishkhub/tanishk.me`. |
| `GITHUB_BRANCH` | Branch to publish to, usually `main`. |
| `LOCAL_EDITOR_STORAGE` | Local development only. Set to `true` to save edits into the working tree instead of GitHub. Never set this in Vercel. |

Keep the Vercel project connected to this GitHub repository so commits trigger deployments. For local API testing without Vercel login, configure `.env.local` and run `node dev-server.js`; this serves the site and API at `http://localhost:3000`. Local saves update `content/site.json`; they do not publish to GitHub. Never set `LOCAL_EDITOR_STORAGE=true` in Vercel. Do not commit `.env.local` or share the GitHub token. The regular static preview does not provide the authenticated publishing API.

The editor updates profile, project, experience, and contact details in `content/site.json`. Changes appear in the current page immediately and become public after the Vercel deployment finishes.
