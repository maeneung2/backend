const NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_USER_URL = "https://openapi.naver.com/v1/nid/me";

export const getNaverAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: process.env.NAVER_CLIENT_ID!,
    redirect_uri: process.env.NAVER_REDIRECT_URI!,
    response_type: "code",
    state,
  });
  return `${NAVER_AUTH_URL}?${params}`;
};

export const getNaverToken = async (code: string, state: string) => {
  const res = await fetch(NAVER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      state,
      client_id: process.env.NAVER_CLIENT_ID!,
      client_secret: process.env.NAVER_CLIENT_SECRET!,
      redirect_uri: process.env.NAVER_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  return res.json() as Promise<{ access_token: string }>;
};

export const getNaverUser = async (accessToken: string) => {
  const res = await fetch(NAVER_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as {
    response: {
      id: string;
      email?: string;
      name?: string;
      profile_image?: string;
    };
  };
  return {
    id: data.response.id,
    email: data.response.email,
    name: data.response.name,
    picture: data.response.profile_image,
  };
};