# Fuel Management System - Backend

## Current Configuration

The application is currently configured for **development mode** with Azure AD OAuth2 authentication **disabled**.

## Running the Application

1. Ensure MySQL is running on `localhost:3306`
2. Create database: `fuel_db`
3. Update credentials in `.env` if needed
4. Run: `mvn spring-boot:run`

## Enabling Azure AD Authentication

When you're ready to enable Azure AD OAuth2 authentication:

### Step 1: Update `.env` file
Uncomment and set the Azure AD values:
```properties
AZURE_TENANT_ID=your_tenant_id_here
AZURE_CLIENT_ID=your_client_id_here
```

### Step 2: Update `application.properties`
Uncomment the OAuth2 configuration:
```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0
spring.security.oauth2.resourceserver.jwt.audiences=${AZURE_CLIENT_ID}
```

### Step 3: Update `SecurityConfig.java`
In the `securityFilterChain` method:
- Change `.anyRequest().permitAll()` to `.anyRequest().authenticated()`
- Uncomment the OAuth2 resource server configuration

### Step 4: Configure Azure App Registration
1. Go to Azure Portal → App Registrations
2. Create or select your app registration
3. Configure:
   - Redirect URIs
   - API permissions
   - App roles (if using role-based access)
4. Copy Tenant ID and Client ID to `.env`

## Database Configuration

Default configuration:
- **URL**: `jdbc:mysql://localhost:3306/fuel_db`
- **Username**: `root`
- **Password**: Set in `.env` file

## API Endpoints

All endpoints are currently accessible without authentication:
- `/api/auth/**` - Authentication endpoints
- `/api/fuel/**` - Fuel entry management
- `/api/projects/**` - Project management
- `/api/vehicles/**` - Vehicle management

## Development Notes

- JPA DDL auto-update is enabled (`spring.jpa.hibernate.ddl-auto=update`)
- SQL logging is enabled for debugging
- CORS is configured in `WebConfig.java`
- Security debug logging is enabled
