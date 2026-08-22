package com.studycircle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDto {
    private Long id;
    private String name;
    private String colorHex;
    private String icon;
}
