package com.hmt.stationery.repository;

import com.hmt.stationery.domain.AmountRoleThreshold;
import com.hmt.stationery.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AmountRoleThresholdRepository extends JpaRepository<AmountRoleThreshold, Long> {

    Optional<AmountRoleThreshold> findByRole(Employee.Role role);

    Optional<AmountRoleThreshold> findByRoleAndIsActiveTrue(Employee.Role role);
}
