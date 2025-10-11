package com.codeless.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    @Bean
    public OpenAPI codelessPlatformOpenAPI() {
        // Security scheme for JWT
        SecurityScheme securityScheme = new SecurityScheme()
                .name("Bearer Authentication")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .description("Enter JWT token obtained from /api/auth/login");

        // Security requirement
        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("Bearer Authentication");

        return new OpenAPI()
                .info(new Info()
                        .title("Codeless Platform API")
                        .description("""
                                ## Complete Learning Management System API
                                
                                This API provides comprehensive endpoints for managing an online learning platform with:
                                - **User Authentication & Authorization** (JWT-based)
                                - **Course Management** (CRUD operations, curriculum, quizzes)
                                - **Enrollment & Progress Tracking**
                                - **E-commerce** (Cart, Checkout, PayPal integration)
                                - **Quiz System** (Multiple choice, True/False, Fill-in-the-blank, Short answer)
                                - **Admin Dashboard** (Analytics, user management, content management)
                                
                                ### Authentication
                                Most endpoints require JWT authentication. To authenticate:
                                1. Call `POST /api/auth/login` or `POST /api/auth/register`
                                2. Copy the `token` from the response
                                3. Click the **Authorize** button above
                                4. Enter: `Bearer <your-token>`
                                
                                ### User Roles
                                - **USER**: Standard student access (view courses, enroll, take quizzes)
                                - **ADMIN**: Full platform access (create courses, manage users, view analytics)
                                
                                ### Base URL
                                - **Development**: http://localhost:8080
                                - **Production**: https://codeless-platform.onrender.com
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Codeless Platform Team")
                                .email("support@codeless.digital"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Development Server"),
                        new Server()
                                .url("https://codeless-platform.onrender.com")
                                .description("Production Server")))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", securityScheme))
                .addSecurityItem(securityRequirement)
                .tags(List.of(
                        new Tag().name("Authentication").description("User registration, login, and profile management"),
                        new Tag().name("Courses").description("Browse and view course catalog"),
                        new Tag().name("Curriculum").description("Access course curriculum and lessons"),
                        new Tag().name("Quizzes").description("Take and submit quizzes"),
                        new Tag().name("Enrollments").description("Manage course enrollments"),
                        new Tag().name("Dashboard").description("Student dashboard and progress tracking"),
                        new Tag().name("Cart").description("Shopping cart management"),
                        new Tag().name("Checkout").description("Payment processing and order completion"),
                        new Tag().name("Orders").description("View order history"),
                        new Tag().name("Articles").description("Browse educational articles"),
                        new Tag().name("User Profile").description("Manage user profile settings"),
                        new Tag().name("Admin - Dashboard").description("Admin analytics and statistics"),
                        new Tag().name("Admin - Courses").description("Course creation and management"),
                        new Tag().name("Admin - Curriculum").description("Curriculum and lesson management"),
                        new Tag().name("Admin - Quizzes").description("Quiz creation and management"),
                        new Tag().name("Admin - Users").description("User management"),
                        new Tag().name("Admin - Enrollments").description("Enrollment management"),
                        new Tag().name("Admin - Orders").description("Order management"),
                        new Tag().name("Admin - Articles").description("Article management")
                ));
    }
}

