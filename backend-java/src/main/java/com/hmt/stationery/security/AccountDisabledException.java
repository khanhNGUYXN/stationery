package com.hmt.stationery.security;

import org.springframework.security.core.AuthenticationException;

public class AccountDisabledException extends AuthenticationException {

    public AccountDisabledException(String msg) {
        super(msg);
    }

    public AccountDisabledException(String msg, Throwable cause) {
        super(msg, cause);
    }
}

