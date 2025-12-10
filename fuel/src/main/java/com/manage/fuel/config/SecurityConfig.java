package com.manage.fuel.config;

import com.manage.fuel.model.User;
import com.manage.fuel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    corsConfig.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://localhost:3000"));
                    corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfig.setAllowedHeaders(java.util.List.of("*"));
                    corsConfig.setAllowCredentials(true);
                    return corsConfig;
                }))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/public/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new CustomJwtGrantedAuthoritiesConverter());
        return jwtAuthenticationConverter;
    }

    private class CustomJwtGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            try {
                // Extract Azure ID from JWT
                String azureId = jwt.getSubject();
                
                // Extract email as fallback
                String email = null;
                if (jwt.hasClaim("preferred_username")) {
                    email = jwt.getClaimAsString("preferred_username");
                } else if (jwt.hasClaim("email")) {
                    email = jwt.getClaimAsString("email");
                }

                // Try to find user by Azure ID first
                Optional<User> userOptional = userRepository.findByAzureId(azureId);
                
                // If not found by Azure ID, try by email
                if (userOptional.isEmpty() && email != null) {
                    userOptional = userRepository.findByEmail(email);
                }

                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    String role = "ROLE_" + user.getRole().name();
                    return Collections.singletonList(new SimpleGrantedAuthority(role));
                }

                // If user not found, return empty authorities (will be handled by UserService)
                return Collections.emptyList();
            } catch (Exception e) {
                System.err.println("Error converting JWT to authorities: " + e.getMessage());
                return Collections.emptyList();
            }
        }
    }
}
