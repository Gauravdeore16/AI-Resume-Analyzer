package com.ai.resumeanalyzer.controller;

import com.ai.resumeanalyzer.entity.Resume;
import com.ai.resumeanalyzer.entity.User;
import com.ai.resumeanalyzer.payload.MessageResponse;
import com.ai.resumeanalyzer.payload.ResumeAnalysisResponse;
import com.ai.resumeanalyzer.repository.ResumeRepository;
import com.ai.resumeanalyzer.repository.UserRepository;
import com.ai.resumeanalyzer.security.UserDetailsImpl;
import com.ai.resumeanalyzer.service.AiService;
import com.ai.resumeanalyzer.service.DocumentParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private DocumentParserService documentParserService;

    @Autowired
    private AiService aiService;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: File is empty"));
        }

        try {
            User user = getAuthenticatedUser();
            String parsedText = documentParserService.parseDocument(file);

            // Trigger AI Resume analysis
            ResumeAnalysisResponse analysis = aiService.analyzeResume(parsedText);

            // Construct entity
            Resume resume = Resume.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileText(parsedText)
                    .overallScore(analysis.getOverallScore())
                    .atsScore(analysis.getAtsScore())
                    .missingSkills(String.join(", ", analysis.getMissingSkills()))
                    .suggestions(String.join("\n", analysis.getSuggestions()))
                    .build();

            Resume savedResume = resumeRepository.save(resume);
            return ResponseEntity.ok(savedResume);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error processing file: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getResumeHistory() {
        User user = getAuthenticatedUser();
        List<Resume> history = resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Check if user is authorized (is owner or is admin)
        if (!resume.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Access denied"));
        }

        return ResponseEntity.ok(resume);
    }
}
