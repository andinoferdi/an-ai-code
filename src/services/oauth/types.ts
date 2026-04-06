export type SubscriptionType = 'max' | 'pro' | 'enterprise' | 'team';
export type BillingType = string;
export type RateLimitTier = string;

export interface OAuthProfileResponse {
  account: {
    uuid: string;
    email: string;
    display_name?: string;
    created_at?: string;
  };
  organization: {
    uuid: string;
    organization_type?: string;
    has_extra_usage_enabled?: boolean;
    billing_type?: BillingType;
    subscription_created_at?: string;
    rate_limit_tier?: RateLimitTier;
  };
}

export interface OAuthTokenExchangeResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  account?: {
    uuid: string;
    email_address: string;
  };
  organization?: {
    uuid: string;
  };
}

export interface UserRolesResponse {
  organization_role: string;
  workspace_role: string;
  organization_name: string;
}

export type OAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
  subscriptionType?: SubscriptionType | null;
  rateLimitTier?: RateLimitTier | null;
  profile?: any;
  tokenAccount?: {
    uuid: string;
    emailAddress: string;
    organizationUuid?: string;
  };
};
