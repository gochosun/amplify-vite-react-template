import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      owner: a.string(), // 👈 반드시 있어야 합니다
    })
    .authorization((allow) => [
      allow.owner("owner"), // ✅ 문자열 인자로 넘깁니다
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // ✅ Cognito 로그인 사용자 기준 인증
  },
});