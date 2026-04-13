package com.example.Complaint_Management.repository;

import com.example.Complaint_Management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByPhone(String phone);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);
}
