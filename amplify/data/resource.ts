import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      owner: a.string(), // 👈 소유자 필드 추가
    })
    .authorization((allow) => [
      allow.owner({ ownerField: "owner" }), // 👈 로그인한 사용자만 접근 가능
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // 👈 Cognito 로그인 사용자 인증으로 전환
  },
});