package com.terragrid.dto;

import com.terragrid.model.Role;
import lombok.Data;

@Data
public class UserCreateRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
