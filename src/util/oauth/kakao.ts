const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me";

export const getKakaoAuthUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: process.env.KAKAO_REDIRECT_URI!,
    response_type: "code",
    state,
  });
  return `${KAKAO_AUTH_URL}?${params}`;
};

export const getKakaoToken = async (code: string) => {
  const res = await fetch(KAKAO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET!,
      redirect_uri: process.env.KAKAO_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  return res.json() as Promise<{ access_token: string }>;
};

export const getKakaoUser = async (accessToken: string) => {
  const res = await fetch(KAKAO_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as {
    id: number;
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string; profile_image_url?: string };
    };
  };
  return {
    id: String(data.id),
    email: data.kakao_account?.email,
    name: data.kakao_account?.profile?.nickname,
    picture: data.kakao_account?.profile?.profile_image_url,
  };
};