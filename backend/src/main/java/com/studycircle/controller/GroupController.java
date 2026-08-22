package com.studycircle.controller;

import com.studycircle.dto.CreateGroupRequest;
import com.studycircle.dto.GroupDto;
import com.studycircle.dto.UpdateGroupRequest;
import com.studycircle.entity.enums.GroupStatus;
import com.studycircle.security.CustomUserDetails;
import com.studycircle.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateGroupRequest request) {
        GroupDto group = groupService.createGroup(userDetails.getUser().getId(), request);
        return new ResponseEntity<>(group, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GroupDto>> searchGroups(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) GroupStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startAfter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startBefore) {
        List<GroupDto> groups = groupService.searchGroups(subjectId, status, startAfter, startBefore);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto> getGroupById(@PathVariable Long id) {
        GroupDto group = groupService.getGroupById(id);
        return ResponseEntity.ok(group);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDto> updateGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGroupRequest request) {
        GroupDto updated = groupService.updateGroup(userDetails.getUser().getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        groupService.deleteGroup(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<GroupDto> joinGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        GroupDto group = groupService.joinGroup(userDetails.getUser().getId(), id);
        return ResponseEntity.ok(group);
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        groupService.leaveGroup(userDetails.getUser().getId(), id);
        return ResponseEntity.noContent().build();
    }
}
