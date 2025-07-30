import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      owner: a.string(), // 👈 필수 필드
    })
    .authorization((allow) => [
      allow.owner(), // ✅ ✅ ✅ 파라미터 없이 호출!
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // ✅ Cognito 로그인 사용자 기준 인증
  },
});