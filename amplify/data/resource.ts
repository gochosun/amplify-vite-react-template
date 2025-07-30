import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      owner: a.string(), // 👈 필수
    })
    .authorization((allow) => [
      allow.owner("owner"), // ✅ 수정됨
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // ✅ 로그인 사용자 기반 인증
  },
});