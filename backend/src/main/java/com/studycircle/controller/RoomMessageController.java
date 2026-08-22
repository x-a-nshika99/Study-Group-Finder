package com.studycircle.controller;

import com.studycircle.service.RoomMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class RoomMessageController {

    private final RoomMessageService roomMessageService;

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<RoomMessageService.RoomMessageDto>> getGroupMessages(@PathVariable Long id) {
        List<RoomMessageService.RoomMessageDto> messages = roomMessageService.getGroupMessages(id);
        return ResponseEntity.ok(messages);
    }
}
