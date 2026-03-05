import express from "express";
import crypto from "crypto";
import prisma from "../../prisma";
import generateJWTToken from "../../util/generateJWTToken";
import { getGoogleAuthUrl, getGoogleToken, getGoogleUser } from "../../util/oauth/google";
import { getKakaoAuthUrl, getKakaoToken, getKakaoUser } from "../../util/oauth/kakao";
import { getNaverAuthUrl, getNaverToken, getNaverUser } from "../../util/oauth/naver";
import { getAppleAuthUrl, getAppleToken, getAppleUser } from "../../util/oauth/apple";

const router = express.Router();

type OAuthProvider = "google" | "kakao" | "naver" | "apple";
const VALID_PROVIDERS: OAuthProvider[] = ["google", "kakao", "naver", "apple"];

type OAuthUser = {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
};

// 유저 조회 또는 생성 후 JWT 발급
async function handleOAuthLogin(provider: OAuthProvider, oauthUser: OAuthUser) {
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerId: { provider, providerId: oauthUser.id } },
    include: { user: true },
  });

  let user = existing?.user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        userName: oauthUser.name ?? "사용자",
        userProfile: oauthUser.picture,
        oauthAccounts: {
          create: { provider, providerId: oauthUser.id, email: oauthUser.email },
        },
      },
    });
  }

  const { password: _pw, refreshToken: _rt, ...filterUser } = user;
  const accessToken = generateJWTToken("access", filterUser);
  const refreshToken = generateJWTToken("refresh", { userId: user.userId });

  await prisma.user.update({
    where: { userId: user.userId },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
}

// GET /oauth/:provider → 각 제공자 로그인 페이지로 redirect
router.get("/:provider", (req, res) => {
  const provider = req.params.provider as OAuthProvider;
  if (!VALID_PROVIDERS.includes(provider)) {
    return res.status(400).json({ error: "지원하지 않는 OAuth 제공자입니다." });
  }

  const state = crypto.randomBytes(16).toString("hex");

  const authUrls: Record<OAuthProvider, string> = {
    google: getGoogleAuthUrl(state),
    kakao: getKakaoAuthUrl(state),
    naver: getNaverAuthUrl(state),
    apple: getAppleAuthUrl(state),
  };

  res.redirect(authUrls[provider]);
});

// GET /oauth/:provider/callback → Google, Kakao, Naver 콜백
router.get("/:provider/callback", async (req, res, next) => {
  const provider = req.params.provider as OAuthProvider;
  const { code, state } = req.query as { code: string; state: string };

  if (!code) return res.status(400).json({ error: "code가 없습니다." });

  try {
    let oauthUser: OAuthUser;

    if (provider === "google") {
      const { access_token } = await getGoogleToken(code);
      oauthUser = await getGoogleUser(access_token);
    } else if (provider === "kakao") {
      const { access_token } = await getKakaoToken(code);
      oauthUser = await getKakaoUser(access_token);
    } else if (provider === "naver") {
      const { access_token } = await getNaverToken(code, state);
      oauthUser = await getNaverUser(access_token);
    } else {
      return res.status(400).json({ error: "지원하지 않는 OAuth 제공자입니다." });
    }

    const tokens = await handleOAuthLogin(provider, oauthUser);
    const params = new URLSearchParams(tokens);
    res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?${params}`);
  } catch (err) {
    next(err);
  }
});

// POST /oauth/apple/callback → Apple 전용 (response_mode: form_post)
router.post("/apple/callback", async (req, res, next) => {
  const { code, user: userJson } = req.body as { code: string; user?: string };

  if (!code) return res.status(400).json({ error: "code가 없습니다." });

  try {
    const { id_token } = await getAppleToken(code);
    const oauthUser = getAppleUser(id_token, userJson);
    const tokens = await handleOAuthLogin("apple", oauthUser);
    const params = new URLSearchParams(tokens);
    res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?${params}`);
  } catch (err) {
    next(err);
  }
});

export default router;