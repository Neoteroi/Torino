-- This script is used in the deployment workflow to configure a user with lower privileges for the web API
-- ARM template deployments only let specify the password of the db sa.
-- Read `infrastructure-env.yml` for more information.

DO $$
BEGIN
	CREATE USER webapi WITH PASSWORD '@@password@@';

	GRANT USAGE ON SCHEMA public TO webapi;

	GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO webapi;

	ALTER DEFAULT PRIVILEGES IN SCHEMA public
	GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO webapi;

	REVOKE CREATE ON SCHEMA public FROM public;
	EXCEPTION WHEN duplicate_object THEN RAISE NOTICE '%, skipping', SQLERRM USING ERRCODE = SQLSTATE;
END
$$;
