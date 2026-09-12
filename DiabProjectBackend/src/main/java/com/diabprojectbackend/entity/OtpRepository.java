package com.diabprojectbackend.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // Yahan tune @epository likha tha, usko theek kiya hai
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByIdentifier(String identifier);
    void deleteByIdentifier(String identifier);
}