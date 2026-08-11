-- Add SSO subject (Keycloak `sub` claim) as stable identity key
ALTER TABLE "users" ADD COLUMN "ssoSub" TEXT;
CREATE UNIQUE INDEX "users_ssoSub_key" ON "users"("ssoSub");
