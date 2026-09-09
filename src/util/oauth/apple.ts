import jwt from "jsonwebtoken";

const APPLE_AUTH_URL = "https://appleid.apple.com/auth/authorize";
const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";

// Apple client_secret은 직접 JWT로 생성해야 함
const generateAppleClientSecret = () => {
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  return jwt.sign({}, privateKey, {
    algorithm: "ES256",
    expiresIn: "5m",
    issuer: process.env.APPLE_TEAM_ID!,
    audience: "https://appleid.apple.com",
    subject: process.env.APPLE_CLIENT_ID!,
    keyid: process.env.APPLE_KEY_ID!,
  });
};

export const getAppleAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: process.env.APPLE_REDIRECT_URI!,
    response_type: "code",
    scope: "name email",
    response_mode: "form_post", // Apple은 POST로 callback
    state,
  });
  return `${APPLE_AUTH_URL}?${params}`;
};

export const getAppleToken = async (code: string) => {
  const clientSecret = generateAppleClientSecret();
  const res = await fetch(APPLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.APPLE_CLIENT_ID!,
      client_secret: clientSecret,
      redirect_uri: process.env.APPLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  return res.json() as Promise<{ id_token: string }>;
};

// Apple은 최초 로그인 시에만 이름/이메일을 반환함
export const getAppleUser = (id_token: string, userJson?: string) => {
  const decoded = jwt.decode(id_token) as { sub: string; email?: string };
  let name: string | undefined;
  if (userJson) {
    try {
      const userInfo = JSON.parse(userJson) as {
        name?: { firstName?: string; lastName?: string };
      };
      const { firstName, lastName } = userInfo.name ?? {};
      name = [firstName, lastName].filter(Boolean).join(" ") || undefined;
    } catch {}
  }
  return { id: decoded.sub, email: decoded.email, name };
};