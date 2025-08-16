package com.hmt.stationery.security;

import com.hmt.stationery.domain.Employee;
import com.hmt.stationery.repository.EmployeeRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.hmt.stationery.security.AccountDisabledException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found: " + username));

        // Don't check status here, let AuthService handle it
        // if (employee.getStatus() != Employee.Status.ACTIVE) {
        // throw new AccountDisabledException("Tài khoản của bạn đã bị vô hiệu hóa. Vui
        // lòng liên hệ quản trị viên.");
        // }

        return new User(
                employee.getUsername(),
                employee.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name())));
    }
}
