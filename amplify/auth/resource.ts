import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
    userAttributes: {
    nickname: {
      required: true,   // 회원가입 시 반드시 입력
      mutable: true     // 가입 후 수정 가능
      attributeDataType: 'String'
    }
  }
});
