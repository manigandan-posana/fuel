package com.manage.fuel.repository;

import com.manage.fuel.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByAzureId(String azureId);
    Optional<User> findByEmail(String email);
}
