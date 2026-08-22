package com.studycircle.service;

import com.studycircle.dto.SubjectDto;
import com.studycircle.entity.Subject;
import com.studycircle.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SubjectDto mapToDto(Subject subject) {
        return SubjectDto.builder()
                .id(subject.getId())
                .name(subject.getName())
                .colorHex(subject.getColorHex())
                .icon(subject.getIcon())
                .build();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaultSubjects() {
        if (subjectRepository.count() == 0) {
            List<Subject> defaultSubjects = Arrays.asList(
                    Subject.builder().name("Computer Science").colorHex("#3B82F6").icon("laptop").build(),
                    Subject.builder().name("Mathematics").colorHex("#6366F1").icon("calculator").build(),
                    Subject.builder().name("Physics").colorHex("#8B5CF6").icon("atom").build(),
                    Subject.builder().name("Chemistry").colorHex("#EC4899").icon("flask-conical").build(),
                    Subject.builder().name("Biology").colorHex("#10B981").icon("dna").build(),
                    Subject.builder().name("Literature & Writing").colorHex("#F59E0B").icon("book-open").build(),
                    Subject.builder().name("History").colorHex("#EF4444").icon("landmark").build(),
                    Subject.builder().name("Languages").colorHex("#14B8A6").icon("languages").build(),
                    Subject.builder().name("Economics & Business").colorHex("#06B6D4").icon("trending-up").build()
            );
            subjectRepository.saveAll(defaultSubjects);
        }
    }
}
