package com.example.Complaint_Management.config;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.UUID;

/**
 * Extended UserDetails carrying the database User's id, phone, and wardId.
 * wardId is set for WARD_MEMBER users — controllers use it to enforce ward isolation.
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID id;
    private final String username;
    private final String password;
    private final String phone;
    private final String wardId;   // null for ADMIN, set for WARD_MEMBER
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(UUID id, String username, String password,
                             String phone, String wardId,
                             Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.phone = phone;
        this.wardId = wardId;
        this.authorities = authorities;
    }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String getPassword()  { return password; }
    @Override public String getUsername()  { return username; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
