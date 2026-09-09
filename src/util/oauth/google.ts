const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const getGoogleAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "openid email profile",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
};

export const getGoogleToken = async (code: string) => {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  return res.json() as Promise<{ access_token: string }>;
};

export const getGoogleUser = async (accessToken: string) => {
  const res = await fetch(GOOGLE_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json() as Promise<{
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  }>;
};