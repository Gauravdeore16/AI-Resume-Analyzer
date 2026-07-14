package com.ai.resumeanalyzer.controller;

import com.ai.resumeanalyzer.entity.InterviewSession;
import com.ai.resumeanalyzer.entity.Resume;
import com.ai.resumeanalyzer.entity.User;
import com.ai.resumeanalyzer.payload.MessageResponse;
import com.ai.resumeanalyzer.repository.InterviewSessionRepository;
import com.ai.resumeanalyzer.repository.ResumeRepository;
import com.ai.resumeanalyzer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Remove password hashes from response for security
        users.forEach(user -> user.setPassword("PROTECTED"));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/resumes")
    public ResponseEntity<List<Resume>> getAllResumes() {
        List<Resume> resumes = resumeRepository.findAll();
        // Truncate fileText to prevent heavy payload size in listing
        resumes.forEach(resume -> {
            if (resume.getFileText() != null && resume.getFileText().length() > 200) {
                resume.setFileText(resume.getFileText().substring(0, 200) + "...");
            }
        });
        return ResponseEntity.ok(resumes);
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewSession>> getAllInterviews() {
        List<InterviewSession> sessions = interviewSessionRepository.findAll();
        return ResponseEntity.ok(sessions);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestParam("role") String role) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }

        String updatedRole = role.toUpperCase();
        if (!updatedRole.startsWith("ROLE_")) {
            updatedRole = "ROLE_" + updatedRole;
        }

        if (!"ROLE_USER".equals(updatedRole) && !"ROLE_ADMIN".equals(updatedRole)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role"));
        }

        user.setRole(updatedRole);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User role updated to " + updatedRole + " successfully!"));
    }
}
