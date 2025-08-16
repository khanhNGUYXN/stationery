package com.hmt.stationery.repository;

import com.hmt.stationery.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUsername(String username);

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeNo(String employeeNo);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByEmployeeNo(String employeeNo);

    @Query("SELECT e FROM Employee e WHERE e.superiorEmployeeNo = :superiorEmployeeNo AND e.status = 'ACTIVE'")
    List<Employee> findSubordinatesBySuperiorEmployeeNo(@Param("superiorEmployeeNo") String superiorEmployeeNo);

    @Query("SELECT e FROM Employee e WHERE e.role = :role AND e.status = 'ACTIVE'")
    List<Employee> findByRole(@Param("role") Employee.Role role);

    @Query("SELECT e FROM Employee e WHERE e.location = :location AND e.status = 'ACTIVE'")
    List<Employee> findByLocation(@Param("location") String location);

    @Query("SELECT e FROM Employee e WHERE e.role IN :roles AND e.status = 'ACTIVE'")
    List<Employee> findByRoleIn(@Param("roles") List<Employee.Role> roles);
}
