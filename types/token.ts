export interface TokenModel {
  accessToken: string;
  refreshToken: string;
}

export interface TokenWithExpireModel extends TokenModel {
  expireTime: string;
}